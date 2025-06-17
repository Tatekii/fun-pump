"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FunctionComponent, useEffect, useRef, useCallback, useState } from "react"
import { AreaSeries, ISeriesApi, createChart, ColorType, IChartApi } from "lightweight-charts"
import { TradingChart, TradingChartRef } from "@/components/trading-chart/trading-chart"
import { useTheme } from "next-themes"
import { useIsDarkMode } from "@/providers/theme-provider"

interface TradeChartSectionProps extends React.ComponentProps<"div"> {}

const TradeCharSectionSkeleton = (props: React.ComponentProps<"div">) => (
	<Card {...props}>
		<CardHeader>
			<Skeleton className="h-6 w-32" />
		</CardHeader>
		<CardContent className="h-96">
			<Skeleton className="h-full w-full" />
		</CardContent>
	</Card>
)

const LIGHT_CHART_STYLES = {
	lineColor: "#2962FF",
	topColor: "#2962FF",
	bottomColor: "rgba(41, 98, 255, 0.28)",
	textColor: "black",
	backgroundColor: { type: ColorType.Solid, color: "white" },
}

const DARK_CHART_STYLES = {
	lineColor: "#6c8dfa", // Lighter blue for better visibility on dark
	topColor: "rgba(108, 141, 250, 0.4)", // Semi-transparent version of line color
	bottomColor: "rgba(108, 141, 250, 0.05)", // Very subtle gradient to dark
	textColor: "#e2e8f0", // Light gray for text
	backgroundColor: {
		type: ColorType.Solid,
		color: "#0f172a", // Dark blue-gray background
	},
}

const initialData = [
	{ time: "2018-12-22", value: 32.51 },
	{ time: "2018-12-23", value: 31.11 },
	{ time: "2018-12-24", value: 27.02 },
	{ time: "2018-12-25", value: 27.32 },
	{ time: "2018-12-26", value: 25.17 },
	{ time: "2018-12-27", value: 28.89 },
	{ time: "2018-12-28", value: 25.46 },
	{ time: "2018-12-29", value: 23.92 },
	{ time: "2018-12-30", value: 22.68 },
	{ time: "2018-12-31", value: 22.67 },
]

const TradeChartSection: FunctionComponent<TradeChartSectionProps> = ({ ...rest }) => {
	const chartRef = useRef<TradingChartRef>(null)
	const seriesRef = useRef<ISeriesApi<"Area"> | null>(null)

	const isDark = useIsDarkMode()

	const CHART_STYLES = isDark ? DARK_CHART_STYLES : LIGHT_CHART_STYLES

	// Initialize chart and series when chart is ready
	const handleChartReady = useCallback((chart: IChartApi) => {
		if (!chart) return
		if (seriesRef.current) return

		// Fit content and create series
		chart.timeScale().fitContent()

		// Create area series if it doesn't exist
		if (!seriesRef.current) {
			const series = chart.addSeries(AreaSeries, {
				lineColor: CHART_STYLES.lineColor,
				topColor: CHART_STYLES.topColor,
				bottomColor: CHART_STYLES.bottomColor,
			})
			series.setData(initialData)
			seriesRef.current = series
		}
	}, [])

	// return <TradeCharSectionSkeleton {...rest} />

	return (
		<Card {...rest}>
			<CardHeader>
				<CardTitle>Price Chart</CardTitle>
			</CardHeader>
			<CardContent>
				<TradingChart
					ref={chartRef}
					onChartReady={handleChartReady}
					options={{
						layout: {
							background: CHART_STYLES.backgroundColor,
							textColor: CHART_STYLES.textColor,
						},
					}}
					height={350}
					className="w-full bg-gray-950 rounded-lg"
				/>
			</CardContent>
		</Card>
	)
}

export default TradeChartSection
