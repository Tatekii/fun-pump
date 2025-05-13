import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Factory, Token, CrowdfundingLib, CrowdfundingLibTester } from "../typechain-types"

describe("Factory", function () {
	const FEE = ethers.parseUnits("0.01", 18)
	const AMOUNT = ethers.parseUnits("10000", 18)
	const COST = ethers.parseUnits("1", 18)

	const deployFactoryFixture = async () => {
		// Deploy CrowdfundingLib first
		const CrowdfundingLibFactory = await ethers.getContractFactory("CrowdfundingLib")

		// Deploy the tester contract
		const CrowdfundingLibTesterFactory = await ethers.getContractFactory("CrowdfundingLibTester")
		const libTester = (await CrowdfundingLibTesterFactory.deploy()) as CrowdfundingLibTester

		// Deploy Factory with library
		const Factory = await ethers.getContractFactory("Factory")

		const [deployer, creator, user1] = await ethers.getSigners()

		const factory = (await Factory.deploy(FEE)) as Factory & { deploymentTransaction(): any }

		// 第一个token
		const transaction = await factory.connect(creator).create("First Token", "FTK", { value: FEE })

		await transaction.wait()

		const tokenAddress = await factory.tokens(0) // Get the first token from the array

		const token = (await ethers.getContractAt("Token", tokenAddress)) as Token

		return {
			factory,
			deployer,
			creator,
			user1,
			token,
			libTester,
		}
	}

	const buyTokenFixture = async () => {
		const { factory, token, creator, user1: buyer, libTester } = await deployFactoryFixture()

		const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })

		// Wait for transaction and ensure it's confirmed
		const receipt = await transaction.wait()
		if (!receipt) throw new Error("Transaction failed")

		return {
			factory,
			token,
			creator,
			buyer,
			receipt,
			libTester,
		}
	}

	describe("Deployment", function () {
		it("Should deploy factory with correct fee", async function () {
			const { factory } = await loadFixture(deployFactoryFixture)
			expect(await factory.fee()).to.equal(FEE)
		})
	})

	describe("Creating Token", function () {
		it("Should create new contract and emit ContractCreated event with correct parameters", async function () {
			const { factory, user1 } = await loadFixture(deployFactoryFixture)

			// Get the current number of tokens before creation
			const initialTokenCount = await factory.totalTokens()

			// Create a new token
			const tx = await factory.connect(user1).create("Test Token", "TEST", { value: FEE })
			const receipt = await tx.wait()
			if (!receipt) throw new Error("Transaction failed")

			// Get the new token's address
			const newTokenAddress = await factory.tokens(initialTokenCount)

			// Verify token was created and event was emitted
			expect(await factory.totalTokens()).to.equal(initialTokenCount + BigInt(1))
			await expect(tx).to.emit(factory, "ContractCreated").withArgs(user1.address, newTokenAddress)
		})

		it("Should revert creation when fee is insufficient", async function () {
			const { factory, user1 } = await loadFixture(deployFactoryFixture)
			const insufficientFee = ethers.parseUnits("0.005", 18) // Half of required fee

			// Verify current fee requirement
			expect(await factory.fee()).to.equal(FEE)
			expect(insufficientFee).to.be.lessThan(FEE)

			// Attempt to create with insufficient fee
			await expect(
				factory.connect(user1).create("Test Token", "TEST", { value: insufficientFee })
			).to.be.revertedWith("Insufficient fee")
		})

		it("should create the sale", async () => {
			const { factory, token, creator } = await loadFixture(deployFactoryFixture)

			const count = await factory.totalTokens()

			expect(count).to.equal(1)

			const sale = await factory.getTokenForSale(0)

			expect(sale.token).to.equal(await token.getAddress())
			expect(sale.creator).to.equal(creator.address)
			expect(sale.sold).to.equal(0)
			expect(sale.raised).to.equal(0)
			expect(sale.isOpen).to.equal(true)
		})
	})

	describe("Buying", function () {
		it("Should contract receive right balance(fee+cost)", async () => {
			const { factory } = await loadFixture(buyTokenFixture)

			const balance = await ethers.provider.getBalance(await factory.getAddress())

			expect(balance).to.equal(FEE + COST)
		})

		it("Should buyer receive token balance", async () => {
			const { buyer, token } = await loadFixture(buyTokenFixture)

			const balance = await token.balanceOf(buyer.address)

			expect(balance).to.equal(AMOUNT)
		})

		it("Should update tokenForSale", async () => {
			const { factory, token } = await loadFixture(buyTokenFixture)

			const sale = await factory.tokenForSale(await token.getAddress())

			expect(sale.sold).to.equal(AMOUNT)
			expect(sale.raised).to.equal(COST)
			expect(sale.isOpen).to.equal(true)
		})
		it("Should raise the token cost according to the formula", async () => {
			const { factory, token, libTester } = await loadFixture(buyTokenFixture)

			const sale = await factory.tokenForSale(await token.getAddress())
			const cost = await factory.getCost(sale.sold)

			const libraryPrice = await libTester.testCalculateTokenPrice(sale.sold, ethers.parseUnits("1", 18))
			const expectedCost = libraryPrice / BigInt(1e18)

			expect(cost).to.be.equal(expectedCost)
		})
	})
})
