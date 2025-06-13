import { abis, networks } from '@fun-pump/smart-contract';
import { Address } from 'viem';

/**
 * 获取当前网络的合约地址
 * @param contractName 合约名称
 * @param chainId 链ID
 * @returns 合约地址或undefined
 */
export function getContractAddress(
  contractName: 'Factory' | 'Token' | 'CrowdfundingLib', 
  chainId: number
): Address | undefined {
  const address = networks[chainId]?.[contractName];
  return address as Address | undefined;
}

/**
 * 获取合约ABI
 * @param contractName 合约名称
 * @returns 合约ABI
 */
export function getContractAbi(contractName: 'Factory' | 'Token' | 'CrowdfundingLib') {
  return abis[contractName];
}

/**
 * 使用示例：
 * 
 * import { useContractRead } from 'wagmi';
 * import { getContractAddress, getContractAbi } from './contract-utils';
 * 
 * function YourComponent() {
 *   const { data } = useContractRead({
 *     address: getContractAddress('Factory', 31337),
 *     abi: getContractAbi('Factory'),
 *     functionName: 'fee',
 *   });
 *   
 *   return <div>Factory Fee: {data?.toString()}</div>;
 * }
 */
