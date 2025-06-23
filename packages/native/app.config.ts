/** @type {import('expo')} */
export default {
	expo: {
		name: "native",
		slug: "native",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "native",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		ios: {
			supportsTablet: true,
			infoPlist: {
				LSApplicationQueriesSchemes: ["metamask", "trust", "safe", "rainbow", "uniswap"],
				// FIXME
				NSAppTransportSecurity: {
					NSAllowsArbitraryLoads: true,
				},
			},
		},
		plugins: [
			"expo-router",
			[
				"expo-splash-screen",
				{
					image: "./assets/images/splash-icon.png",
					imageWidth: 200,
					resizeMode: "contain",
					backgroundColor: "#ffffff",
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
	},
}
