import { Cache, cacheKey, makeQueryParams, rateLimiter } from '@bubble-tea/base';
import fetch from '@bubble-tea/isomorphic-fetch';
import { DateTime } from 'luxon';

const endpoint = 'https://api.coingecko.com/api/v3';

const rateLimit = 100;

const limitInterval = 60 * 1000;

const api = rateLimiter(
  async (path: string, payload: Record<string, unknown> = {}) => {
    const url = `${endpoint}/${path}?${makeQueryParams(payload)}`;
    const resp = await fetch(url);
    return await resp.json();
  },
  rateLimit,
  limitInterval,
);

export interface Market {
  id: string;
  symbol: string;
  image: string;
  current_price: number;
  last_updated: string;
}

const marketTtl = 30 * 60 * 1000;

const marketCache = new Map<string, Market>();

export async function fetchCoinMarkets(vs_currency: string, ...inputIds: string[]) {
  if (inputIds.length === 0) return [];

  const ids: string[] = [];
  for (const id of inputIds) {
    const market = marketCache.get(cacheKey(vs_currency, id));
    if (market) {
      const expired = DateTime.fromISO(market.last_updated).diffNow().toMillis() > marketTtl;
      if (!expired) continue;
    }
    ids.push(id);
  }

  if (ids.length > 0) {
    const markets = await api<Market[]>('coins/markets', {
      vs_currency,
      ids: ids.join(','),
      per_page: Math.min(ids.length, 250),
    });
    for (const market of markets) {
      marketCache.set(cacheKey(vs_currency, market.id), market);
    }
  }

  return inputIds.map(id => marketCache.get(cacheKey(vs_currency, id)));
}

export async function fetchSupportedVsCurrency() {
  return await api<string[]>('simple/supported_vs_currencies');
}

const coinListCache = new Cache(async () => {
  return await api<{ id: string; symbol: string; name: string }[]>('coins/list');
}, 60 * 60 * 1000);

export async function fetchCoinList() {
  return await coinListCache.get();
}

const nameAndSymbolToId = new Map<string, string>();

export async function findCoinGeckoId(name: string, symbol: string) {
  name = name.toLowerCase();
  symbol = symbol.toLowerCase();

  let id = nameAndSymbolToId.get(cacheKey(name, symbol));
  if (id) return id;

  const coinList = await coinListCache.get();

  const candidates = coinList.filter(coin => coin.symbol.toLowerCase() === symbol);

  if (candidates.length === 1) {
    id = candidates[0].id;
  } else if (candidates.length > 1) {
    id = candidates.find(coin => coin.name.replace(/[-\.\s]/g, '').toLowerCase() === name)?.id;
  }

  if (!id) {
    name = name.replace(/\stoken$/, '');
    id = candidates.find(coin => coin.name.replace(/[-\.\s]/g, '').toLowerCase() === name)?.id;
  }

  if (id) nameAndSymbolToId.set(cacheKey(name, symbol), id);
  return id;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  asset_platform_id: string | null;
  platforms: {
    [platform_id: string]: string | undefined;
  };
  image: {
    thumb: string;
    small: string;
    large: string;
  };
}

const coinCache = new Map<string, Coin>();

export async function fetchCoin(coinGeckoId: string) {
  let cache = coinCache.get(coinGeckoId);
  if (cache) return cache;

  cache = await api<Coin>(`coins/${coinGeckoId}`);
  coinCache.set(coinGeckoId, cache);
  return cache;
}
