"use client"

import { FC, PropsWithChildren } from "react"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { useTheme } from "next-themes"

const CustomRainbowKitProvider: FC<PropsWithChildren> = ({ children }) => {
	const { theme } = useTheme()

	return <RainbowKitProvider theme={theme === "dark" ? darkTheme() : lightTheme()}>{children}</RainbowKitProvider>
}

export default CustomRainbowKitProvider
