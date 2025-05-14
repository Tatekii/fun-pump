export interface TokenSale {
  token: string;
  name: string;
  creator: string;
  sold: bigint;
  raised: bigint;
  startTime: bigint;
  endTime: bigint;
  saleStage: number;
}

export interface TokenData extends TokenSale {
  image: string;
}

export interface ContractAddresses {
  factoryAddress: string;
}

declare global {
  interface Window {
    ethereum: any;
  }
}
