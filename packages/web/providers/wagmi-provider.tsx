"use client"
import { FC, FunctionComponent, PropsWithChildren } from "react";
import {  WagmiProvider } from "wagmi"
import { config } from "@/lib/wagmi";


 
const MyWagmiWrapper: FC<PropsWithChildren> = ({children}) => {
    return 			<WagmiProvider config={config}>
        {children}
    </WagmiProvider>;
}
 
export default MyWagmiWrapper;