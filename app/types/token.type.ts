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
}

export interface TokenData extends TokenSale {}
