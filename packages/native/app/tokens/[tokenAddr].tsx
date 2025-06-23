import ParallaxScrollView from "@/components/ParallaxScrollView"
import { ThemedText } from "@/components/ThemedText"
import { TAddress } from "@/types"
import { useRouter } from "expo-router"
import { useLocalSearchParams } from "expo-router"
import { FC } from "react"

interface TokenAddrPageProps {}

const TokenAddrPage: FC<TokenAddrPageProps> = () => {
	const { tokenAddr } = useLocalSearchParams<{ tokenAddr: TAddress }>()

	const router = useRouter()

	if (!tokenAddr) {
		router.back()
	}

	return (
		<ParallaxScrollView>
			<ThemedText>token: {tokenAddr}</ThemedText>
		</ParallaxScrollView>
	)
}

export default TokenAddrPage
