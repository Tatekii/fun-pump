import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import "@nomicfoundation/hardhat-chai-matchers"

describe("Factory", function () {
	const FEE = ethers.parseUnits("0.01", 18)
	const AMOUNT = ethers.parseUnits("10000", 18)
	const COST = ethers.parseUnits("1", 18)

	enum SaleStage {
		OPENING,
		ENDED,
	}

	const deployFactoryFixture = async () => {
		// First deploy the library
		const CrowdfundingLibFactory = await ethers.getContractFactory("CrowdfundingLib")
		const crowdfundingLib = await CrowdfundingLibFactory.deploy()
		await crowdfundingLib.waitForDeployment()

		// Deploy the tester contract with library
		const CrowdfundingLibTesterFactory = await ethers.getContractFactory("CrowdfundingLibTester", {
			libraries: {
				CrowdfundingLib: await crowdfundingLib.getAddress(),
			},
		})
		const libTester = await CrowdfundingLibTesterFactory.deploy()

		// Deploy Factory with library
		const Factory = await ethers.getContractFactory("Factory", {
			libraries: {
				CrowdfundingLib: await crowdfundingLib.getAddress(),
			},
		})
		const [deployer, creator, user1] = await ethers.getSigners()
		const factory = await Factory.deploy(FEE)

		const transaction = await factory.connect(creator).create("First Token", "FTK", { value: FEE })
		await transaction.wait()

		const tokenAddress = await factory.tokens(0)
		const token = await ethers.getContractAt("Token", tokenAddress)

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
		const { factory, token, creator, user1: buyer, libTester, deployer } = await deployFactoryFixture()
		const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, { value: COST })
		const receipt = await transaction.wait()
		if (!receipt) throw new Error("Transaction failed")

		return {
			factory,
			token,
			creator,
			buyer,
			receipt,
			libTester,
			deployer,
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

			const initialTokenCount = await factory.totalTokens()

			const tx = await factory.connect(user1).create("Test Token", "TEST", { value: FEE })
			const receipt = await tx.wait()
			if (!receipt) throw new Error("Transaction failed")

			const newTokenAddress = await factory.tokens(initialTokenCount)

			expect(await factory.totalTokens()).to.equal(initialTokenCount + BigInt(1))
			await expect(tx).to.emit(factory, "ContractCreated").withArgs(user1.address, newTokenAddress)
		})

		it("Should revert creation when fee is insufficient", async function () {
			const { factory, user1 } = await loadFixture(deployFactoryFixture)
			const insufficientFee = ethers.parseUnits("0.005", 18)

			expect(await factory.fee()).to.equal(FEE)
			expect(insufficientFee).to.be.lessThan(FEE)

			await expect(
				factory.connect(user1).create("Test Token", "TEST", { value: insufficientFee })
			).to.be.revertedWith("Insufficient fee")
		})

		it("should create the sale in OPENING stage", async () => {
			const { factory, token, creator } = await loadFixture(deployFactoryFixture)

			const count = await factory.totalTokens()

			expect(count).to.equal(1)

			const sale = await factory.getTokenForSale(0)

			expect(sale.token).to.equal(await token.getAddress())
			expect(sale.creator).to.equal(creator.address)
			expect(sale.sold).to.equal(0)
			expect(sale.raised).to.equal(0)
			expect(sale.stage).to.equal(SaleStage.OPENING)
		})
	})

	describe("Sale Stages", function () {
		it("Should start in OPENING stage", async () => {
			const { factory, token } = await loadFixture(deployFactoryFixture)
			const sale = await factory.tokenForSale(await token.getAddress())
			expect(sale.stage).to.equal(SaleStage.OPENING)
		})

		it("Should allow buying in OPENING stage", async () => {
			const { factory, token, user1 } = await loadFixture(deployFactoryFixture)
			await expect(factory.connect(user1).buy(await token.getAddress(), AMOUNT, { value: COST })).to.not.be
				.reverted
		})

		it("Should not allow buying in ENDED stage", async () => {
			const { factory, token, creator, user1 } = await loadFixture(deployFactoryFixture)
			await factory.connect(creator).setStage(await token.getAddress(), SaleStage.ENDED)
			await expect(
				factory.connect(user1).buy(await token.getAddress(), AMOUNT, { value: COST })
			).to.be.revertedWith("Sale not active")
		})

		it("Should end sale when token limit is reached", async () => {
			const { factory, token, user1, libTester } = await loadFixture(deployFactoryFixture)

			// Get the funding limit and calculate amounts
			const LIMIT = await libTester.getFundingLimit()
			const purchaseAmount = ethers.parseUnits("5000", 18) // Amount within allowed range
			
			// First set the user's total purchases to just below the limit
			await factory.setTestUserPurchases(
				await token.getAddress(),
				user1.address,
				LIMIT - purchaseAmount
			)

			// Then set the contract's sale data to match
			await factory.setTestSaleData(
				await token.getAddress(),
				LIMIT - purchaseAmount, // Total sold
				ethers.parseUnits("10", 18) // Some ETH raised
			)

			// Calculate the exact price using the library tester
			const tokenPrice = await libTester.testCalculateTokenPrice(LIMIT - purchaseAmount, purchaseAmount)
			
			// Now make a purchase that should exceed the limit
			await factory.connect(user1).buy(
				await token.getAddress(),
				purchaseAmount,
				{ value: tokenPrice }
			)

			const sale = await factory.tokenForSale(await token.getAddress())
			expect(sale.stage).to.equal(SaleStage.ENDED)
			expect(sale.sold).to.be.gte(LIMIT)
		})

		it("Should end sale when funding target is reached", async () => {
			const { factory, token, user1, libTester } = await loadFixture(deployFactoryFixture)

			// We need to reach FUNDING_TARGET of 3 ETH
			const TARGET = await libTester.getFundingTarget()
			
			// Set initial state to almost at target
			const tokenAmount = ethers.parseUnits("5000", 18) // Amount within allowed range
			await factory.setTestSaleData(
				await token.getAddress(),
				tokenAmount, // Some tokens already sold
				TARGET - ethers.parseUnits("0.1", 18) // Just below target
			)

			// Calculate exact price for additional purchase that will exceed target
			const additionalAmount = ethers.parseUnits("1000", 18)
			const tokenPrice = await libTester.testCalculateTokenPrice(tokenAmount, additionalAmount)
			
			// Make purchase that should push us over the target
			await factory.connect(user1).buy(
				await token.getAddress(),
				additionalAmount,
				{ value: tokenPrice }
			)

			const sale = await factory.tokenForSale(await token.getAddress())
			expect(sale.stage).to.equal(SaleStage.ENDED)
			expect(sale.raised).to.be.gte(TARGET)
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
			expect(sale.stage).to.equal(SaleStage.OPENING)
		})
		it("Should raise the token cost according to the formula", async () => {
			const { factory, token, libTester } = await loadFixture(buyTokenFixture)

			const sale = await factory.tokenForSale(await token.getAddress())
			const cost = await factory.getCost(sale.sold)

			const libraryPrice = await libTester.testCalculateTokenPrice(sale.sold, ethers.parseUnits("1", 18))
			const expectedCost = libraryPrice / BigInt(1e18)

			expect(cost).to.equal(expectedCost)
		})
	})

	describe("Depositing", function () {
		it("Should allow creator to deposit tokens", async () => {
			const { factory, token, creator } = await loadFixture(buyTokenFixture)

			await factory.connect(creator).setStage(await token.getAddress(), SaleStage.ENDED)

			const initialTokenBalance = await token.balanceOf(creator.address)
			const initialContractETH = await ethers.provider.getBalance(await factory.getAddress())

			const tx = await factory.connect(creator).deposit(await token.getAddress())
			await tx.wait()

			const finalTokenBalance = await token.balanceOf(creator.address)
			const finalContractETH = await ethers.provider.getBalance(await factory.getAddress())

			expect(finalTokenBalance > initialTokenBalance).to.be.true
			expect(finalContractETH < initialContractETH).to.be.true
		})

		it("Should only allow creator to deposit", async () => {
			const { factory, token, creator, buyer } = await loadFixture(buyTokenFixture)

			await factory.connect(creator).setStage(await token.getAddress(), SaleStage.ENDED)

			await expect(factory.connect(buyer).deposit(await token.getAddress())).to.be.revertedWith("Not creator")
		})

		it("Should not allow deposit if sale is not ended", async () => {
			const { factory, token, creator } = await loadFixture(deployFactoryFixture)
			await factory.connect(creator).setStage(await token.getAddress(), SaleStage.OPENING)
			await expect(factory.connect(creator).deposit(await token.getAddress())).to.be.revertedWith(
				"Sale not ended"
			)
		})
	})

	describe("Withdraw Fees", function () {
		it("Should allow owner to withdraw fees", async () => {
			const { factory, deployer } = await loadFixture(buyTokenFixture)

			const contractBalance = await ethers.provider.getBalance(await factory.getAddress())
			const initialBalance = await ethers.provider.getBalance(deployer.address)

			const tx = await factory.connect(deployer).withdraw(contractBalance)
			const receipt = await tx.wait()
			if (!receipt) throw new Error("Transaction failed")

			const gasCost = receipt.gasUsed * receipt.gasPrice

			const finalBalance = await ethers.provider.getBalance(deployer.address)
			const finalContractBalance = await ethers.provider.getBalance(await factory.getAddress())

			expect(finalContractBalance).to.equal(0)
			expect(finalBalance).to.equal(initialBalance + contractBalance - gasCost)
		})

		it("Should only allow owner to withdraw", async () => {
			const { factory, buyer } = await loadFixture(buyTokenFixture)
			const amount = ethers.parseEther("1")

			await expect(factory.connect(buyer).withdraw(amount)).to.be.revertedWith("Not owner")
		})

		it("Should revert if withdrawal amount exceeds balance", async () => {
			const { factory, deployer } = await loadFixture(buyTokenFixture)

			const contractBalance = await ethers.provider.getBalance(await factory.getAddress())
			const excessAmount = contractBalance + ethers.parseEther("1")

			await expect(factory.connect(deployer).withdraw(excessAmount)).to.be.revertedWith("Insufficient balance")
		})
	})
})
