import type { Address } from './common';

// 基本类型定义
export enum SaleStage {
  OPENING = 0,
  ENDED = 1
}

export enum CurveType {
	LINEAR = 0,
	QUADRATIC = 1,
	EXPONENTIAL = 2,
}

// Token合约接口
export interface TokenSale {
  token: Address;
  name: string;
  creator: Address;
  sold: bigint;
  raised: bigint;
  startTime: bigint;
  endTime: bigint;
  stage: SaleStage;
  signedUrl: string;
  curveType: CurveType;
  curveSlope: bigint;
}

// 网络地址映射
export interface NetworkAddresses {
  [networkId: string]: {
    [contractName: string]: Address;
  };
}
