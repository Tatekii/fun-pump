import { FC } from "react"
import { formatEther } from "viem"
import { CurveType, TokenSale } from "@fun-pump/smart-contract"
import TiltedCard from "@/components/tilted-card"

// 助手函数：获取曲线类型名称
export const getCurveTypeName = (curveType: CurveType): string => {
  switch (curveType) {
	case CurveType.LINEAR:
	  return "Linear";
	case CurveType.QUADRATIC:
	  return "Quadratic";
	case CurveType.EXPONENTIAL:
	  return "Exponential";
    default:
      return "Unknown";
  }
};

// 助手函数：格式化斜率显示
const formatSlope = (slope: bigint): string => {
  // 将BigInt转换为可读格式，考虑到1e18的缩放
  const slopeNumber = Number(slope) / 1e18;
  return slopeNumber.toFixed(6);
};

interface TokenProps {
	toggleTrade: (token: TokenSale) => void
	token: TokenSale
}

const TokenCard: FC<TokenProps> = ({ toggleTrade, token, ...rest }) => {
	return (
		// <Card onClick={() => toggleTrade(token.token)} className="hover:border cursor-pointer">
		// 	<CardHeader>
		// 		<CardTitle className="text-xl text-center">{token.name}</CardTitle>
		// 		<CardDescription className="text-sm text-center lowercase">
		// 			created by {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}
		// 		</CardDescription>
		// 	</CardHeader>
		// 	<CardContent className="space-y-4 text-center">
		// 		<img src={token.image} alt="token image" width={256} height={256} className="mx-auto" />
		// 		<p className="text-sm lowercase">market Cap: {formatEther(token.raised)} eth</p>
		// 	</CardContent>
		// </Card>

		<TiltedCard
			altText={token.name}
			captionText={token.name}
			containerHeight="200px"
			containerWidth="200px"
			imageHeight="200px"
			imageWidth="200px"
			rotateAmplitude={12}
			scaleOnHover={1.2}
			showMobileWarning={false}
			showTooltip={true}
			displayOverlayContent={true}
			imageSrc={`${token.signedUrl}`}
			overlayContent={
				<div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg w-full h-full flex flex-col justify-center cursor-pointer">
					<p className="font-bold text-xl">{token.name}</p>
					<p className="text-sm text-center lowercase">
						created by {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}
					</p>

					<div className="space-y-4 text-center">
						<p className="text-sm lowercase">market Cap: {formatEther(token.raised)} eth</p>
						{token.curveType !== undefined && (
							<p className="text-xs lowercase">
								Curve: {getCurveTypeName(token.curveType)} (slope: {formatSlope(token.curveSlope || 0n)})
							</p>
						)}
					</div>
				</div>
			}
			onClick={() => toggleTrade(token)}
			{...rest}
		/>
	)
}

export default TokenCard
