export interface TokenSale {
  token: string;
  name: string;
  creator: string;
  sold: bigint;
  raised: bigint;
  startTime: bigint;
  endTime: bigint;
  isOpen: boolean;
  stage: number;
}

export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  decimals: number;
}

export interface ContractAddresses {
  factoryAddress: string;
}
