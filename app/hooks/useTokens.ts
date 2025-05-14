import { useEffect, useState } from "react"
import { TokenData } from "../types/global"
import { factoryAddress, factoryAbi } from "../generated"
import { readContract } from "wagmi/actions"
import images from "../images.json"
import { useReadFactoryFee, useReadFactoryTotalTokens } from "../generated"
import { config } from "../config/wagmi"

export function useTokens() {
	const [tokens, setTokens] = useState<TokenData[]>([])
	const { data: fee = BigInt(0) } = useReadFactoryFee()
	const { data: totalTokens = BigInt(0) } = useReadFactoryTotalTokens()

	const maxTokens = Math.min(Number(totalTokens), 6)

	// Fetch token addresses and their details
	useEffect(() => {
		async function loadTokens() {
			if (Number(totalTokens) === 0) return

			const tokenData: TokenData[] = []

			// Get token addresses
			for (let i = 0; i < maxTokens; i++) {
				try {
					// First get the token address at index i
					const tokenAddress = (await readContract(config, {
						address: factoryAddress[31337], // Default to Hardhat network
						abi: factoryAbi,
						functionName: "tokens",
						args: [BigInt(i)],
					}))

					// Then get details for that token
					const tokenSale = (await readContract(config, {
						address: factoryAddress[31337],
						abi: factoryAbi,
						functionName: "tokenForSale",
						args: [tokenAddress],
					}))

					if (tokenSale) {
						tokenData.push({
							token: tokenSale[0],
							name: tokenSale[1],
							creator: tokenSale[2],
							sold: tokenSale[3],
							raised: tokenSale[4],
							startTime: tokenSale[5],
							endTime: tokenSale[6],
							saleStage: tokenSale[7],
							image: images[i % images.length],
						})
					}
				} catch (error) {
					console.error(`Error fetching token at index ${i}:`, error)
				}
			}

			setTokens(tokenData.reverse())
		}

		loadTokens()
	}, [totalTokens, maxTokens])

	return {
		fee,
		tokens: tokens as TokenData[],
	}
}
