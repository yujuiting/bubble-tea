import crypto from 'crypto';
import {
  createUnkownToken,
  findChain,
  findChainByName,
  makeQueryParams,
  TokenAmount,
  TokenVariant,
  unknownChain,
  unknownToken,
} from '@bubble-tea/base';
import { findCoinGeckoId, fetchCoin } from '@bubble-tea/coin-gecko';
import fetch from '@bubble-tea/isomorphic-fetch';
import { BigNumber } from '@ethersproject/bignumber';

const endpoint = 'https://api.binance.com';

export interface Capital {
  name: string;
  coin: string;
  free: string; // amount
  freeze: string; // amount
  locked: string; // amount
  storage: string; // amount
  withdrawing: string; // amount
  networkList: {
    name: string;
    network: string;
    isDefault: boolean;
  }[];
}

export async function fetchBalance(apiKey: string, secretKey: string) {
  const capitals = await call<Capital[]>(apiKey, secretKey, 'GET', 'sapi/v1/capital/config/getall');
  const tokanAmounts = await Promise.all(
    capitals
      .map(capital => {
        const { free, freeze, locked, storage, withdrawing } = capital;
        const numbers = [free, freeze, locked, storage, withdrawing];
        const value = numbers.reduce((acc, curr) => acc + parseFloat(curr), 0);
        return { value, capital };
      })
      .filter(({ value }) => value > 0)
      .map(async ({ value, capital }) => {
        let chain = findChainFromCapital(capital);
        let token = await findTokenFromCapital(capital);
        return { chain, token, amount: value.toString() } as TokenAmount;
      }),
  );
  return tokanAmounts;
}

function findChainFromCapital({ networkList }: Capital) {
  for (const network of networkList) {
    const chain = findChain(network.network.toLowerCase());
    if (chain) return chain;
  }
  return unknownChain;
}

async function findTokenFromCapital({ name, coin: symbol }: Capital) {
  const coinGeckoId = await findCoinGeckoId(name, symbol);
  let icon: string | undefined;
  const variants: TokenVariant[] = [];
  if (coinGeckoId) {
    const coin = await fetchCoin(coinGeckoId);
    icon = coin.image.thumb;
    const chain = findChainByName(coin.asset_platform_id || coin.name) || unknownChain;
    /**
     * @todo resolve token
     * currently keep decimals to 1, because the amount of response from binance api is not wei.
     */
    variants.push({ chain, decimals: 1, address: '' });
  }
  return createUnkownToken({ name, symbol, coinGeckoId, icon, variants });
}

async function time() {
  const resp = await fetch(`${endpoint}/api/v3/time`);
  const { serverTime } = await resp.json();
  return serverTime as number;
}

async function call<T = any>(apiKey: string, secretKey: string, method: string, path: string, payload: any = {}) {
  const timestamp = await time();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(makeQueryParams({ ...payload, timestamp }))
    .digest('hex');
  const params = makeQueryParams({ ...payload, timestamp, signature });
  const resp = await fetch(`${endpoint}/${path}?${params}`, {
    method,
    headers: { 'X-MBX-APIKEY': apiKey },
  });
  return (await resp.json()) as T;
}
