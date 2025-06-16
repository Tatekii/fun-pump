"use client"
import { flatTokensAtom } from "@/stores/tokens.atom"
import { TokenSale, useReadCrowdfundingLibFundingTarget, useReadFactoryGetCost } from "@fun-pump/smart-contract"
import { useAtomValue } from "jotai"
import { createContext, FunctionComponent, PropsWithChildren, useCallback, useContext, useMemo } from "react"

interface TokenContextProviderProps {
	tokenAddress: `0x${string}`
}

interface TokenContextProps {
	token: TokenSale | null
	cost: bigint | null
}

const TokenContext = createContext<TokenContextProps>({
	token: null,
	cost: null,
})

const TokenContextProvider: FunctionComponent<PropsWithChildren<TokenContextProviderProps>> = ({
	tokenAddress,
	children,
}) => {
	const token = useAtomValue(flatTokensAtom).find(
		(tk) => tk.token.toLocaleLowerCase() === tokenAddress.toLocaleLowerCase()
	) || null

	const { data: cost = BigInt(0) } = useReadFactoryGetCost({
		args: token ? [token.sold] : [BigInt(0)],
	})

	return (
		<TokenContext.Provider
			value={{
				token,
				cost,
			}}
		>
			{children}
		</TokenContext.Provider>
	)
}

export default TokenContextProvider

export const useTokenCost = () => {
	const tokenContext = useContext(TokenContext)
	if (!tokenContext) {
		throw Error
	}
	return tokenContext.cost
}

export const useTokenInfo = () => {
	const tokenContext = useContext(TokenContext)
	if (!tokenContext) {
		throw Error
	}
	return tokenContext.token
}
