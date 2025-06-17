"use client"

import { FunctionComponent, useContext } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import TokenInfoSection from "../../../modules/trade/sections/token-info.section"
import TradeChartSection from "../../../modules/trade/sections/trade-chart.section"
import TradePanelSection from "../../../modules/trade/sections/trade-panel.section"

interface TradePageClientProps {}

const TradePageClient: FunctionComponent<TradePageClientProps> = () => {
	const router = useRouter()

	return (
		<div className="mx-auto px-4 py-8 min-w-full">
			<div className="mx-auto">
				{/* Header */}
				<div className="flex items-center gap-2 mb-6">
					<Button variant="ghost" size="sm" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<h1 className="text-xl font-bold">Trade Token</h1>
				</div>

				<div className="grid grid-cols-4 gap-4 mb-6">
					{/* Token Card */}
					<TokenInfoSection className="col-span-1" />

                    {/* Trade Chart */}
					<TradeChartSection className="col-span-2" />

					{/* Trading Section */}
					<TradePanelSection className="col-span-1" />
				</div>
			</div>
		</div>
	)
}

export default TradePageClient
