import {
  Address,
  createUnkownToken,
  env,
  findTokenVariant,
  mustFindChain,
  mustFindToken,
  Token,
  TokenAmount,
} from '@bubble-tea/base';
import { findCoinGeckoId } from '@bubble-tea/coin-gecko';
import * as etherscan from '@bubble-tea/etherscan';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { InfuraProvider } from '@ethersproject/providers';

export const chain = mustFindChain('eth');

export const nativeToken = mustFindToken(chain.nativeToken);

export const provider = new InfuraProvider('homestead', {
  projectId: env('INFURA_PROJECT_ID'),
  projectSecret: env('INFURA_PROJECT_SECRET'),
});

export async function fetchNativeTokenBalance(address: Address) {
  const balance = await provider.getBalance(address);
  return { chain, token: nativeToken, amount: balance.toString() } as TokenAmount;
}

const simpleERC20: ContractInterface = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

export async function fetchERC20TokenBalance(address: Address, token: Token): Promise<TokenAmount> {
  const tokenVariant = findTokenVariant(token, chain);
  if (!tokenVariant) {
    return { chain, token, amount: '0' };
  }
  const contract = new Contract(tokenVariant.address, simpleERC20, provider);
  const balance = await contract.functions.balanceOf(address);
  return { chain, token, amount: balance.toString() };
}

export async function fetchERC20Token(address: Address) {
  const abi = await etherscan.fetchAbi(address);
  const contract = new Contract(address, abi, provider);
  const [[name], [symbol], [decimals]]: [[string], [string], [number]] = await Promise.all([
    contract.functions.name(),
    contract.functions.symbol(),
    contract.functions.decimals(),
  ]);
  const coinGeckoId = await findCoinGeckoId(name, symbol);
  return createUnkownToken({ name, symbol, coinGeckoId, variants: [{ chain, decimals, address }] });
}

export async function fetchTransactionReceipt(transactionHash: string) {
  return await provider.getTransactionReceipt(transactionHash);
}

export async function fetchInteractedAddresses(transactionHash: string) {
  const receipt = await fetchTransactionReceipt(transactionHash);
  return receipt.logs.map(log => log.address);
}
