import { infer } from "zod"
import { formSchema } from "@/components/create-token-modal"
import { CurveType as ContractCurveType, TokenSale as ContractTokenSale } from "@fun-pump/smart-contract"

// 重新导出CurveType以保持向后兼容
export const CurveType = ContractCurveType

// 扩展合约中的TokenSale接口，添加前端特定的字段
export interface TokenSale extends Omit<ContractTokenSale, 'token' | 'creator'> {
  token: string // 转换为字符串类型，而不是Address
  creator: string // 转换为字符串类型，而不是Address
}

export interface TokenData extends TokenSale {
  // 添加前端特定的字段
  isFavorite?: boolean
  isNew?: boolean
}
