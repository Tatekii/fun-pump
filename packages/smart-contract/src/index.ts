export * from './types';
export * from './generated';

// Explicitly export contract ABIs and addresses for subgraph
export { default as FactoryABI } from '../abis/Factory.json';
export { default as TokenABI } from '../abis/Token.json';
export { default as contractAddresses } from '../abis/addresses.json';

// Export a function to get the latest deployed addresses
export function getContractAddresses(network: string = 'mainnet') {
  const addresses = require('../abis/addresses.json');
  return {
    factory: addresses.factory[network] || addresses.factory.mainnet || '',
  };
}
