import { Kode_Mono } from "next/font/google"
import "../globals.css"
import { ReactNode } from "react"
import "@rainbow-me/rainbowkit/styles.css"
import { Providers } from "@/providers"
import { Toaster } from "@/components/ui/sonner"

const font = Kode_Mono({ subsets: ["latin"] })

export const metadata = {
	title: "fun.pump",
	description: "create token listings",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={font.className}>
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
