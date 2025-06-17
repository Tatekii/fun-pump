"use client"

import { createChart, IChartApi, DeepPartial, ChartOptions, ColorType } from "lightweight-charts"
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react"

export interface TradingChartRef {
	chart: IChartApi | null
}

interface TradingChartProps {
	className?: string
	height?: number | string
	options?: DeepPartial<ChartOptions>
	onChartReady?: (chart: IChartApi) => void
}

export const TradingChart = forwardRef<TradingChartRef, TradingChartProps>(
	(
		{
			className = "",
			height = "100%",
			options = {
				layout: {
					background: { type: ColorType.Solid, color: "transparent" },
					textColor: "black",
				},
			},
			onChartReady,
		},
		ref
	) => {
		const [isMounted, setIsMounted] = useState(false)
		const containerRef = useRef<HTMLDivElement>(null)
		const chartRef = useRef<IChartApi | null>(null)

		// Initialize chart
		useEffect(() => {
			if (!isMounted && containerRef.current && !chartRef.current) {

				console.log('CREATE');
				
				const chart = createChart(containerRef.current, options)
				chartRef.current = chart
				setIsMounted(true)
				onChartReady?.(chart)
			}
		}, [isMounted, onChartReady, options])

		useEffect(() => {
			return () => {
				if (isMounted) {
					containerRef.current = null
					chartRef.current?.remove()
				}
			}
		}, [isMounted])

		// Handle resize
		useEffect(() => {
			if (!isMounted) return

			const handleResize = () => {
				if (containerRef.current) {
					chartRef.current?.applyOptions({
						width: containerRef.current.clientWidth,
					})
				}
			}

			const resizeObserver = new ResizeObserver(handleResize)
			if (containerRef.current) {
				resizeObserver.observe(containerRef.current)
			}

			return () => resizeObserver.disconnect()
		}, [isMounted])

		useImperativeHandle(
			ref,
			() => ({
				chart: chartRef.current,
			}),
			[]
		)

		return <div ref={containerRef} className={className} style={{ height }} />
	}
)
