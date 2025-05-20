import { FC } from "react"
import { formatEther } from "viem"
import { TokenData } from "../types/token.type"
import TiltedCard from "@/components/TiltedCard/TiltedCard"

interface TokenProps {
	toggleTrade: (token: TokenData) => void
	token: TokenData
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
					</div>
				</div>
			}
			onClick={() => toggleTrade(token)}
			{...rest}
		/>
	)
}

export default TokenCard
