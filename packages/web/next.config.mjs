/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		// domains: [process.env.NEXT_PUBLIC_GATEWAY_URL],
		minimumCacheTTL: 60 * 60 * 24, // 1 day
	},
}

export default nextConfig
