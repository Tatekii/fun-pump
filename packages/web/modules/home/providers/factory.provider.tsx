"use client"
import { useReadCrowdfundingLibFundingLimit, useReadCrowdfundingLibFundingTarget } from "@fun-pump/smart-contract"
import { createContext, FunctionComponent, PropsWithChildren, useContext } from "react"

interface FactoryContextProviderProps {}

interface FactoryContext {
	target: bigint | null
	limit: bigint | null
}

const FactoryContext = createContext<FactoryContext>({
	target: null,
	limit: null,
})

const FactoryContextProvider: FunctionComponent<PropsWithChildren<FactoryContextProviderProps>> = ({ children }) => {
	const {
		data: target = BigInt(0),
		error: targetError,
		isLoading: targetLoading,
	} = useReadCrowdfundingLibFundingTarget()

	const { data: limit = BigInt(0), error: limitError, isLoading: limitLoading } = useReadCrowdfundingLibFundingLimit()

	return <FactoryContext.Provider value={{ target, limit }}>{children}</FactoryContext.Provider>
}

export default FactoryContextProvider


export const useTokenFactoryTarget = () => {
	const tokenContext = useContext(FactoryContext)
	if (!tokenContext) {
		throw Error
	}
	return tokenContext.target
}
export const useTokenFactoryLimit = () => {
	const tokenContext = useContext(FactoryContext)
	if (!tokenContext) {
		throw Error
	}
	return tokenContext.limit
}
