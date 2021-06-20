import {
  Address,
  createUnkownToken,
  env,
  findTokenByAddress,
  findTokenVariant,
  mustFindChain,
  mustFindToken,
  Token,
  TokenAmount,
  unknownToken,
} from '@bubble-tea/base';
import { findCoinGeckoId } from '@bubble-tea/coin-gecko';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { JsonRpcBatchProvider } from '@ethersproject/providers';

export const chain = mustFindChain('bsc');

export const nativeToken = mustFindToken(chain.nativeToken);

export const provider = new JsonRpcBatchProvider(env('BSC_ENDPOINT'));

export async function fetchNativeTokenBalance(address: Address) {
  const balance = await provider.getBalance(address);
  return { chain, token: nativeToken, amount: balance.toString() } as TokenAmount;
}

const bep20Abi: ContractInterface = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export async function fetchBEP20TokenBalance(address: Address, token: Token): Promise<TokenAmount> {
  const tokenVariant = findTokenVariant(token, chain);
  if (!tokenVariant) return { chain, token, amount: '0' };
  const contract = new Contract(tokenVariant.address, bep20Abi, provider);
  const balance = await contract.functions.balanceOf(address);
  return { chain, token, amount: balance.toString() };
}

export async function fetchBEP20Token(address: Address) {
  const [token] = findTokenByAddress(address);
  if (token !== unknownToken) return token;
  const contract = new Contract(address, bep20Abi, provider);
  const [[name], [symbol], [decimals]]: [[string], [string], [BigNumber]] = await Promise.all([
    contract.functions.name(),
    contract.functions.symbol(),
    contract.functions.decimals(),
  ]);
  const coinGeckoId = await findCoinGeckoId(name, symbol);
  return createUnkownToken({
    name,
    symbol,
    coinGeckoId,
    variants: [{ chain, decimals: decimals.toNumber(), address }],
  });
}

export async function fetchTransactionReceipt(transactionHash: string) {
  return await provider.getTransactionReceipt(transactionHash);
}

export async function fetchInteractedAddresses(transactionHash: string) {
  const receipt = await fetchTransactionReceipt(transactionHash);
  return receipt.logs.map(log => log.address);
}
