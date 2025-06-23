import ParallaxScrollView from "@/components/ParallaxScrollView"
import { ThemedView } from "@/components/ThemedView"
import { AppKitButton } from "@reown/appkit-wagmi-react-native"
import { Stack } from "expo-router"
import { flatTokensAtom, tokensQueryAtom } from "@/store/tokens.atom"
import { useAtomValue } from "jotai"
import { ThemedText } from "@/components/ThemedText"
import { useQuery } from "@tanstack/react-query"

export default function HomePage() {
	// Get tokens data from Jotai atoms
	const tokens = useAtomValue(flatTokensAtom)

	const { fetchNextPage, hasNextPage, isFetchingNextPage, isError, error, isLoading, isSuccess } =
		useAtomValue(tokensQueryAtom)

	return (
		<>
			<Stack.Screen options={{ headerShown: false }}></Stack.Screen>

			<ParallaxScrollView>
				<ThemedView>
					<AppKitButton />
				</ThemedView>

				<ThemedView>
					<ThemedText type="title">Tokens Aaaaa</ThemedText>
					<ThemedText type="subtitle">{isLoading ? "loading..." : ""}</ThemedText>
					<ThemedView>
						{tokens.map((tk) => (
							<ThemedView key={tk.token}>
								<ThemedText>{tk.creator}</ThemedText>
								<ThemedText>{tk.name}</ThemedText>
							</ThemedView>
						))}
					</ThemedView>
				</ThemedView>
			</ParallaxScrollView>
		</>
	)
}
