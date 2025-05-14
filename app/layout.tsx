import { Nabla } from "next/font/google"
import "./globals.css"
import { ReactNode } from "react"
import '@rainbow-me/rainbowkit/styles.css'
import { Providers } from "./providers"

const nabla = Nabla({ subsets: ["latin"] })

export const metadata = {
	title: "fun.pump",
	description: "create token listings",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={nabla.className}>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	)
}
