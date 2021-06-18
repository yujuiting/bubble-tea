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
import * as bscscan from '@bubble-tea/bscscan';
import { findCoinGeckoId } from '@bubble-tea/coin-gecko';
import { Contract, ContractInterface } from '@ethersproject/contracts';
import { JsonRpcBatchProvider } from '@ethersproject/providers';

export const chain = mustFindChain('bsc');

export const nativeToken = mustFindToken(chain.nativeToken);

const provider = new JsonRpcBatchProvider(env('BSC_ENDPOINT'));

export async function fetchNativeTokenBalance(address: Address) {
  const balance = await provider.getBalance(address);
  return { chain, token: nativeToken, amount: balance.toString() } as TokenAmount;
}

const simpleBEP20: ContractInterface = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

export async function fetchBEP20TokenBalance(address: Address, token: Token): Promise<TokenAmount> {
  const tokenVariant = findTokenVariant(token, chain);
  if (!tokenVariant) return { chain, token, amount: '0' };
  const contract = new Contract(tokenVariant.address, simpleBEP20, provider);
  const balance = await contract.functions.balanceOf(address);
  return { chain, token, amount: balance.toString() };
}

export async function fetchBEP20Token(address: Address) {
  const abi = await bscscan.fetchAbi(address);
  const contract = new Contract(address, abi, provider);
  const [[name], [symbol], [decimals]]: [[string], [string], [number]] = await Promise.all([
    contract.functions.name(),
    contract.functions.symbol(),
    contract.functions.decimals(),
  ]);
  const coinGeckoId = await findCoinGeckoId(name, symbol);
  return createUnkownToken({ name, symbol, coinGeckoId, variants: [{ chain, decimals, address }] });
}
