"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FunctionComponent, useEffect, useRef, useCallback, useState } from "react"
import { AreaSeries, ISeriesApi, CandlestickSeries, ColorType, IChartApi } from "lightweight-charts"
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

let randomFactor = 25 + Math.random() * 25
const samplePoint = (i: number) =>
	i *
		(0.5 +
			Math.sin(i / 1) * 0.2 +
			Math.sin(i / 2) * 0.4 +
			Math.sin(i / randomFactor) * 0.8 +
			Math.sin(i / 50) * 0.5) +
	200 +
	i * 2

function generateData(numberOfCandles = 500, updatesPerCandle = 5, startAt = 100) {
	const createCandle = (val, time) => ({
		time,
		open: val,
		high: val,
		low: val,
		close: val,
	})

	const updateCandle = (candle, val: number) => ({
		time: candle.time,
		close: val,
		open: candle.open,
		low: Math.min(candle.low, val),
		high: Math.max(candle.high, val),
	})

	randomFactor = 25 + Math.random() * 25
	const date = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0))
	const numberOfPoints = numberOfCandles * updatesPerCandle
	const initialData = []
	const realtimeUpdates = []
	let lastCandle
	let previousValue = samplePoint(-1)
	for (let i = 0; i < numberOfPoints; ++i) {
		if (i % updatesPerCandle === 0) {
			date.setUTCDate(date.getUTCDate() + 1)
		}
		const time = date.getTime() / 1000
		let value = samplePoint(i)
		const diff = (value - previousValue) * Math.random()
		value = previousValue + diff
		previousValue = value
		if (i % updatesPerCandle === 0) {
			const candle = createCandle(value, time)
			lastCandle = candle
			if (i >= startAt) {
				realtimeUpdates.push(candle)
			}
		} else {
			const newCandle = updateCandle(lastCandle, value)
			lastCandle = newCandle
			if (i >= startAt) {
				realtimeUpdates.push(newCandle)
			} else if ((i + 1) % updatesPerCandle === 0) {
				initialData.push(newCandle)
			}
		}
	}

	return {
		initialData,
		realtimeUpdates,
	}
}

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

const TradeChartSection: FunctionComponent<TradeChartSectionProps> = ({ ...rest }) => {
	const chartRef = useRef<TradingChartRef>(null)

	const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

	const isDark = useIsDarkMode()

	const CHART_STYLES = isDark ? DARK_CHART_STYLES : LIGHT_CHART_STYLES

	// Initialize chart and series when chart is ready
	const handleChartReady = useCallback((chart: IChartApi) => {
		if (!chart) return
		if (seriesRef.current) return

		// Fit content and create series
		chart.timeScale().fitContent()

		const series = chart.addSeries(CandlestickSeries, {
			upColor: "#26a69a",
			downColor: "#ef5350",
			borderVisible: false,
			wickUpColor: "#26a69a",
			wickDownColor: "#ef5350",
		})

		seriesRef.current = series

		const data = generateData(2500, 20, 1000)

		series.setData(data.initialData)
		chart.timeScale().fitContent()
		chart.timeScale().scrollToPosition(5, true)

		// simulate real-time data
		function* getNextRealtimeUpdate(realtimeData) {
			for (const dataPoint of realtimeData) {
				yield dataPoint
			}
			return null
		}
		const streamingDataProvider = getNextRealtimeUpdate(data.realtimeUpdates)

		const intervalID = setInterval(() => {
			const update = streamingDataProvider.next()
			if (update.done) {
				clearInterval(intervalID)
				return
			}
			series.update(update.value)
		}, 100)

		return () => {
			clearInterval(intervalID)
		}
	}, [])

	// return <TradeCharSectionSkeleton {...rest} />

	// Update chart theme when it changes
	useEffect(() => {
		if (!chartRef.current?.chart) return

		chartRef.current.chart.applyOptions({
			layout: {
				background: CHART_STYLES.backgroundColor,
				textColor: CHART_STYLES.textColor,
			},
		})
	}, [CHART_STYLES])

	return (
		<Card {...rest}>
			<CardHeader>
				<CardTitle>Price Chart</CardTitle>
			</CardHeader>
			<CardContent className="h-full">
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
					className="w-full h-full bg-gray-950 rounded-lg"
				/>
			</CardContent>
		</Card>
	)
}

export default TradeChartSection
