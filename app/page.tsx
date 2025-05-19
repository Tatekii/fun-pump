"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import Header from "./components/header"
import LoadingUI from "./components/LoadingUI"

// Use dynamic import with ssr disabled for MainContent
const MainContent = dynamic(() => import("./views/main-view"), {
	ssr: false,
	loading: () => <LoadingUI />,
})

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<Suspense fallback={<LoadingUI />}>
				<MainContent />
			</Suspense>
		</div>
	)
}
