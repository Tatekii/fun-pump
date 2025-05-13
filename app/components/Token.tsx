import { FC } from "react"
import { formatEther } from "viem"
import { TokenData } from "../types/global"

interface TokenProps {
  toggleTrade: (token: string) => void
  token: TokenData
}

const Token: FC<TokenProps> = ({ toggleTrade, token }) => {
  return (
    <button onClick={() => toggleTrade(token.token)} className="token">
      <div className="token__details">
        <img src={token.image} alt="token image" width={256} height={256} />
        <p>created by {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}</p>
        <p>market Cap: {formatEther(token.raised)} eth</p>
        <p className="name">{token.name}</p>
      </div>
    </button>
  );
}

export default Token;