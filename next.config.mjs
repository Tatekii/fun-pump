/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		// domains: [process.env.NEXT_PUBLIC_GATEWAY_URL],
		minimumCacheTTL: 60, // 1 minute
	},
}

export default nextConfig
