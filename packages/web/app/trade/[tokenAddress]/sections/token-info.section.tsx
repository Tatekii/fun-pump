"use client"

import { getCurveTypeName } from "@/components/token-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { calculateTimeProgress, calculateFundingProgress, formatTimeRemaining, formatSlope } from "@/utils/token.utils"
import { Progress } from "@radix-ui/react-progress"
import React, { FunctionComponent } from "react"
import { formatEther } from "viem"
import { useTokenCost, useTokenInfo } from "../provider/token.provider"
import { useTokenFactoryTarget } from "@/app/providers/factory.provider"
import { Skeleton } from "@/components/ui/skeleton"

interface TokenInfoSectionProps extends React.ComponentProps<"div"> {}

const TokenInfoSectionSkeleton = (props: React.ComponentProps<"div">) => {
	return (
		<Card {...props}>
			<CardHeader>
				<CardTitle className="text-xl text-center">
					<Skeleton className="h-6" />
				</CardTitle>
				<CardDescription className="text-sm text-center">
					<Skeleton className="h-4" />
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 text-center">
				<Skeleton className="h-52" />

				{/* Funding Progress */}
				<Skeleton className="h-4" />

				{/* Time Progress */}
				<Skeleton className="h-4" />

				<Skeleton />
				<Skeleton />

				<div className="h-32 bg-gray-800 p-2 rounded-md text-sm"></div>
			</CardContent>
		</Card>
	)
}

const TokenInfoSection: FunctionComponent<TokenInfoSectionProps> = ({ ...rest }) => {
	const token = useTokenInfo()
	const target = useTokenFactoryTarget()
	const cost = useTokenCost()

	if (token === null || target === null || cost === null) {
		return <TokenInfoSectionSkeleton {...rest} />
	}

	// Calculate progress values
	const timeProgress = calculateTimeProgress(token.startTime, token.endTime)
	const fundingProgress = calculateFundingProgress(token.raised, target)
	const timeRemaining = formatTimeRemaining(token.endTime)

	return (
		<Card {...rest}>
			<CardHeader>
				<CardTitle className="text-xl text-center">{token.name}</CardTitle>
				<CardDescription className="text-sm text-center">
					creator: {token.creator.slice(0, 6) + "..." + token.creator.slice(38, 42)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 text-center">
				<img src={token.signedUrl} alt="token" width={256} height={256} className="mx-auto" />

				{/* Funding Progress */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Funding Progress</span>
						<span>{fundingProgress.toFixed(1)}%</span>
					</div>
					<Progress value={fundingProgress} className="w-full" />
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{formatEther(token.raised)} ETH</span>
						<span>{formatEther(target)} ETH</span>
					</div>
				</div>

				{/* Time Progress */}
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Time Progress</span>
						<span>{timeRemaining}</span>
					</div>
					<Progress value={timeProgress} className="w-full" />
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Started: {new Date(Number(token.startTime) * 1000).toLocaleDateString()}</span>
						<span>Ends: {new Date(Number(token.endTime) * 1000).toLocaleDateString()}</span>
					</div>
				</div>

				<p className="text-sm">marketcap: {formatEther(token.raised)} ETH</p>
				<p className="text-sm">base cost: {formatEther(cost)} ETH</p>

				{token.curveType !== undefined && (
					<div className="bg-gray-800 p-2 rounded-md text-sm">
						<p>
							Bonding Curve: <span className="font-bold">{getCurveTypeName(token.curveType)}</span>
						</p>
						<p className="text-xs mt-1">Curve parameters determine token price based on supply</p>
						{token.curveSlope && <p className="text-xs mt-1">Slope: {formatSlope(token.curveSlope)}</p>}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default TokenInfoSection
