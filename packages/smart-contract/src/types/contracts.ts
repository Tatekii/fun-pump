import { Address } from './common';

// 基本类型定义
export enum SaleStage {
  Created = 0,
  Active = 1,
  Successful = 2,
  Failed = 3,
  Closed = 4
}

export enum CurveType {
  Linear = 0,
  Exponential = 1
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
