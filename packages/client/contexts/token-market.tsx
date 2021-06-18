import {
  errorResource,
  isErrorResource,
  isLoadedResource,
  isLoadingResource,
  isTruthy,
  loadedResource,
  loadingResource,
  noop,
  Resource,
  TokenAmount,
  toNumber,
} from '@bubble-tea/base';
import { Market } from '@bubble-tea/coin-gecko';
import { useSelector } from 'hooks/store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLazyCoinMarketsQuery } from 'store/api';
import { selectVsCurrency } from 'store/wallet';

type Resources = Record<string, Resource<Market> | undefined>;

interface TokenMarketContext {
  add(coinGeckoId: string): void;
  get(coinGeckoId: string): Resource<Market> | undefined;
}

const Context = createContext<TokenMarketContext>({ add: noop, get: noop });

export interface TokenMarketProviderProps {
  children: React.ReactNode;
}

export function TokenMarketProvider({ children }: TokenMarketProviderProps) {
  const [coinGeckoIds, setCoingeckoIds] = useState<string[]>([]);

  const [resources, setResources] = useState<Resources>({});

  const vsCurrency = useSelector(selectVsCurrency);

  const [fetch, { data: coinMarkets = [] }] = useLazyCoinMarketsQuery();

  useEffect(() => {
    const timer = setTimeout(() => fetch({ vsCurrency, coinGeckoIds }), 500);
    return () => clearTimeout(timer);
  }, [fetch, vsCurrency, coinGeckoIds]);

  /**
   * we have to reload all resources if vs currency changed
   */
  useEffect(() => {
    setResources(prev => {
      const next = { ...prev };
      for (const id of coinGeckoIds) {
        next[id] = loadingResource();
      }
      return { ...next };
    });
  }, [vsCurrency]);

  /**
   * init unloaded resources to loading state
   */
  useEffect(() => {
    setResources(prev => {
      const next = { ...prev };
      for (const id of coinGeckoIds) {
        if (id in next) continue;
        next[id] = loadingResource();
      }
      return { ...next };
    });
  }, [coinGeckoIds]);

  /**
   * update resource by response
   */
  useEffect(() => {
    setResources(prev => {
      const next = { ...prev };
      for (const coinMarket of coinMarkets) {
        if (!coinMarket) continue;
        next[coinMarket.id] = loadedResource(coinMarket);
      }
      for (const id in next) {
        // remove resource did not filled
        if (next[id] && isLoadingResource(next[id]!)) delete next[id];
      }
      return next;
    });
  }, [coinMarkets]);

  const add = useCallback((id: string) => setCoingeckoIds(prev => (prev.includes(id) ? prev : [...prev, id])), []);

  const get = useCallback((id: string) => resources[id], [resources]);

  return <Context.Provider value={{ add, get }}>{children}</Context.Provider>;
}

export function useTokenMarket(coinGeckoIds: string[]) {
  const { add, get } = useContext(Context);

  useEffect(() => {
    for (const id of coinGeckoIds) add(id);
  }, [coinGeckoIds]);

  return coinGeckoIds.map(get).reduce(
    (acc, curr, index) => ({
      ...acc,
      [coinGeckoIds[index]]: curr,
    }),
    {} as Resources,
  );
}

export function useTokenAmountValue(tokenAmounts: TokenAmount[]) {
  const coinGeckoIds = useMemo(
    () => tokenAmounts.map(({ token }) => token.coinGeckoId).filter(isTruthy),
    [tokenAmounts],
  );

  const markets = useTokenMarket(coinGeckoIds);

  return useMemo(() => {
    const result = new Map<TokenAmount, Resource<number>>();
    for (const tokenAmount of tokenAmounts) {
      if (!tokenAmount.token.coinGeckoId) continue;
      const market = markets[tokenAmount.token.coinGeckoId];
      if (!market) continue;
      if (isLoadingResource(market)) {
        result.set(tokenAmount, loadingResource());
      } else if (isLoadedResource(market)) {
        result.set(tokenAmount, loadedResource(toNumber(tokenAmount) * market.data.current_price));
      } else if (isErrorResource(market)) {
        result.set(tokenAmount, errorResource(market.error));
      }
    }
    return result;
  }, [tokenAmounts, markets]);
}
