import { FC } from "react"
import { formatEther } from "viem"
import { TokenData } from "../types/global"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface TokenProps {
  toggleTrade: (token: string) => void
  token: TokenData
}

const Token: FC<TokenProps> = ({ toggleTrade, token }) => {
  return (
    <Card 
      onClick={() => toggleTrade(token.token)} 
      className="hover:border first:animate-[blink_5s_ease_infinite_forwards] cursor-pointer"
    >
      <CardHeader>
        <CardTitle className="text-xl text-center">{token.name}</CardTitle>
        <CardDescription className="text-sm text-center lowercase">
          created by {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <img src={token.image} alt="token image" width={256} height={256} className="mx-auto" />
        <p className="text-sm lowercase">market Cap: {formatEther(token.raised)} eth</p>
      </CardContent>
    </Card>
  );
}

export default Token;