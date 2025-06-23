import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Link, Stack } from "expo-router"
import { Button } from "tamagui"

export default function NotFoundScreen() {
	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />

			<ThemedView flex={1} items={"center"} justify={"center"} padding="$6" gap="$6">
				<ThemedText type="title">Oh no, This screen does not exist.</ThemedText>
				<Link href="/" asChild>
					<Button themeInverse>Back to home screen</Button>
				</Link>
			</ThemedView>
		</>
	)
}
