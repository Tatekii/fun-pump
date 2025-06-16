import { Kode_Mono } from "next/font/google"
import "../globals.css"
import { ReactNode } from "react"
import "@rainbow-me/rainbowkit/styles.css"
import { Providers } from "@/providers"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/utils/tailwind.utils"
import FactoryContextProvider from "./providers/factory.provider"

const font = Kode_Mono({ subsets: ["latin"] })

export const metadata = {
	title: "fun.pump",
	description: "create token listings",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={cn(font.className, `min-w-5xl`)}>
				<Providers>
					<FactoryContextProvider>{children}</FactoryContextProvider>
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
