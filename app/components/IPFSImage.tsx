import Image from "next/image"
import { FunctionComponent } from "react"

interface IPFSImageProps {
	signedUrl: string
}

const IPFSImage: FunctionComponent<IPFSImageProps> = ({ signedUrl }) => {
	return <Image src={`https://ipfs.io/ipfs/${signedUrl}`} alt="Token"/>
}

export default IPFSImage
