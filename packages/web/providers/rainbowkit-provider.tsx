"use client"

import { FC, PropsWithChildren } from "react"
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { useTheme } from "next-themes"
import { useIsDarkMode } from "./theme-provider"

const CustomRainbowKitProvider: FC<PropsWithChildren> = ({ children }) => {
	const isDark = useIsDarkMode()

	return <RainbowKitProvider theme={isDark ? darkTheme() : lightTheme()}>{children}</RainbowKitProvider>
}

export default CustomRainbowKitProvider
