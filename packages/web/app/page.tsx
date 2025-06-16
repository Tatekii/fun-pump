import { Suspense } from "react"
import Header from "@/components/header"
import HomePageClient from "./client"

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<HomePageClient />
		</div>
	)
}
