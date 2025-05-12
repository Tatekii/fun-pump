import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Factory, Token } from "../typechain-types"

const deployFactoryContract = async (): Promise<{
	factory: Factory
	deployer: any
	creator: any
	user1: any
	token: Token
	FEE: bigint
}> => {
	const Factory = await ethers.getContractFactory("Factory")

	const [deployer, creator, user1] = await ethers.getSigners()

	const FEE = ethers.parseUnits("0.01", 18)

	const factory = (await Factory.deploy(FEE)) as Factory

	const transaction = await factory.connect(creator).create("Lol Uni", "DAPP", { value: FEE })

	await transaction.wait()

	const tokenAddress = await factory.tokens(0) // Get the first token from the array

	const token = (await ethers.getContractAt("Token", tokenAddress)) as Token

	return { factory, deployer, creator, user1, token, FEE }
}

describe("Factory", function () {
	it("Should deploy factory with correct fee", async function () {
		const { factory, FEE } = await loadFixture(deployFactoryContract)
		expect(await factory.fee()).to.equal(FEE)
	})

	it("Should create new contract and emit event", async function () {
		const { factory, user1, FEE } = await loadFixture(deployFactoryContract)

		// Get the current number of tokens
		const initialTokenCount = await factory.totalTokens()

		// Create a new token and get its transaction
		const tx = await factory.connect(user1).create("Test Token", "TEST", { value: FEE })
		await tx.wait()

		// Get the new token's address
		const newTokenAddress = await factory.tokens(initialTokenCount)

		// Verify the event was emitted with correct parameters
		await expect(tx).to.emit(factory, "ContractCreated").withArgs(user1.address, newTokenAddress)
	})

	it("Should revert creation when fee is insufficient", async function () {
		const { factory, user1 } = await loadFixture(deployFactoryContract)
		const insufficientFee = ethers.parseUnits("0.005", 18)

		await expect(
			factory.connect(user1).create("Test Token", "TEST", { value: insufficientFee })
		).to.be.revertedWith("Insufficient fee")
	})
})
