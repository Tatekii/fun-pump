"use client"
import { Card, CardContent } from "@/components/ui/card"
import { FunctionComponent } from "react"

interface TradeChartSectionProps extends React.ComponentProps<"div"> {}

const TradeChartSection: FunctionComponent<TradeChartSectionProps> = ({ ...rest }) => {
	return (
		<Card {...rest}>
			<CardContent>Charts...</CardContent>
		</Card>
	)
}

export default TradeChartSection
