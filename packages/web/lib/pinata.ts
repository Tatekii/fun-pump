// Initialize IPFS client - using public gateway
import { PinataSDK } from "pinata"

export const pinata = new PinataSDK({
	pinataJwt: process.env.PINATA_JWT_KEY,
	pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
})
