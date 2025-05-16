declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_FACTORY_ADDRESS: `0x${string}`
		NEXT_PUBLIC_LIB_ADDRESS: `0x${string}`
		PINATA_API_KEY: string
		PINATA_SECRET_KEY: string
		PINATA_JWT_KEY: string
		NEXT_PUBLIC_GATEWAY_URL: string
		NODE_ENV: "development" | "production" | "test"
	}
}
