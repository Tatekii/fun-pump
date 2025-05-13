/**
 * Types for generated wagmi code
 */

// Declare module for your generated code
declare module '@/app/generated' {
  import type { 
    Address,
    Hash,
    TransactionReceipt, 
    Abi
  } from 'viem'
  
  export type ContractFunctionArgs<T extends readonly unknown[] = readonly unknown[]> = 
    T extends readonly [] ? [] : T
  
  // Common types for your contracts
  export interface TokenSale {
    token: Address
    name: string
    creator: Address
    sold: bigint
    raised: bigint
    startTime: bigint
    endTime: bigint
    isOpen: boolean
    stage: number
  }

  export interface Token {
    name: string
    symbol: string
    totalSupply: bigint
    decimals: number
    owner: Address
  }

  // Hook return types
  export interface UseReadContractReturnType<T = unknown> {
    data?: T
    error?: Error
    isLoading: boolean
    isSuccess: boolean
    status: 'idle' | 'error' | 'loading' | 'success'
  }

  export interface UseWriteContractReturnType {
    data?: Hash
    error?: Error
    isPending: boolean
    isSuccess: boolean
    writeContract: (args?: any) => Promise<Hash>
    reset: () => void
  }

  // Generated hooks
  export function useFactoryBuy(args?: { chainId?: number }): UseWriteContractReturnType
  export function useFactoryCreate(args?: { chainId?: number }): UseWriteContractReturnType
  export function useFactoryFee(args?: { chainId?: number }): UseReadContractReturnType<bigint>
  export function useFactoryGetTokenSale(args: { tokenId: bigint, chainId?: number }): UseReadContractReturnType<TokenSale>
  export function useFactoryTotalTokens(args?: { chainId?: number }): UseReadContractReturnType<bigint>
}
