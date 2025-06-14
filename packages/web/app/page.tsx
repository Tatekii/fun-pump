"use client"

import { Suspense } from "react"
import Header from "@/components/header"
import LoadingUI from "@/components/LoadingUI"
import HomePageClient from "./client"

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<Suspense fallback={<LoadingUI />}>
				<HomePageClient />
			</Suspense>
		</div>
	)
}
