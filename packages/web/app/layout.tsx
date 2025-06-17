import { Kode_Mono } from "next/font/google"
import "../globals.css"
import { ReactNode } from "react"
import "@rainbow-me/rainbowkit/styles.css"
import { RootProviders } from "@/providers"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/utils/tailwind.utils"
import FactoryContextProvider from "../modules/home/providers/factory.provider"
import Header from "@/components/header"

const font = Kode_Mono({ subsets: ["latin"] })

export const metadata = {
	title: "fun.pump",
	description: "create token listings",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={cn(font.className, `min-w-5xl`)}>
				<RootProviders>
					<FactoryContextProvider>
						<div className="min-h-screen bg-background">
							<Header />
							{children}
						</div>
					</FactoryContextProvider>
					<Toaster />
				</RootProviders>
			</body>
		</html>
	)
}
