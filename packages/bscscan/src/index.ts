import { Address, Cache, env, makeQueryParams, rateLimiter } from '@bubble-tea/base';
import fetch from 'node-fetch';

const endpoint = 'https://api.bscscan.com/api';

const apikey = env('BSCSCAN_API_KEY');

const rateLimit = 5;

const api = rateLimiter(async (module: string, action: string, payload: Record<string, unknown>) => {
  const params: Record<string, unknown> = { ...payload, module, action, apikey };
  const url = `${endpoint}?${makeQueryParams(params)}`;
  const resp = await fetch(url);
  return await resp.json();
}, rateLimit);

interface Response<T> {
  status: string;
  message: string;
  result: T;
}

export type Sort = 'asc' | 'desc';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

export interface SearchTokenTransactionOptions {
  sort?: Sort;
  page?: number;
  offset?: number;
  contractAddress?: string;
}

export async function fetchAccountBEP20TokenTransactions(
  address: Address,
  options: SearchTokenTransactionOptions = {},
) {
  const { sort = 'desc', ...rest } = options;
  return (await api<Response<Transaction[]>>('account', 'tokentx', { address, sort, ...rest })).result;
}

export async function fetchAccountERC721TokenTransactions(
  address: Address,
  options: SearchTokenTransactionOptions = {},
) {
  const { sort = 'desc', ...rest } = options;
  return (await api<Response<Transaction[]>>('account', 'tokennfttx', { address, sort, ...rest })).result;
}

const abiCache: Record<string, Cache<string> | undefined> = {};

export async function fetchAbi(address: Address) {
  let cache = abiCache[address];
  if (!cache) {
    cache = new Cache(async () => (await api<Response<string>>('contract', 'getabi', { address })).result, 86400000);
    abiCache[address] = cache;
  }
  return await cache.get();
}
