import { infer } from "zod"
import { formSchema } from "../components/create-token-modal"

export interface TokenSale {
	token: string
	name: string
	creator: string
	sold: bigint
	raised: bigint
	startTime: bigint
	endTime: bigint
	saleStage: number
	signedUrl: string
	curveType: CurveType // 邦定曲线类型
	curveSlope: bigint // 曲线斜率
}

export enum CurveType {
	LINEAR = 0,
	QUADRATIC = 1,
	EXPONENTIAL = 2,
}

export interface TokenData extends TokenSale {}
