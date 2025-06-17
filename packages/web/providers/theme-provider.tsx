"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

export function ThemeProvider({ children }: React.ComponentProps<typeof NextThemesProvider>) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			{children}
		</NextThemesProvider>
	)
}

// Check system preference for color scheme
const isSystemDark =
	typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

export const useIsDarkMode = () => {
	const { theme } = useTheme()
	if (theme === "system") {
		return isSystemDark
	}
	return theme === "dark"
}
