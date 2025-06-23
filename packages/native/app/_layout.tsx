import "@walletconnect/react-native-compat"

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import "react-native-reanimated"

import { useColorScheme } from "@/hooks/useColorScheme"
import MyWagmiProvider from "@/providers/wagmi.provider"

import { TamaguiProvider } from "tamagui"
import { config } from "@/tamagui.config"

export default function RootLayout() {
	const colorScheme = useColorScheme()

	const [loaded] = useFonts({
		Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
		InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
	})

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	return (
		<TamaguiProvider config={config} defaultTheme={colorScheme!}>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<MyWagmiProvider>
					<Stack/>
				</MyWagmiProvider>
				<StatusBar style="auto" />
			</ThemeProvider>
		</TamaguiProvider>
	)
}
