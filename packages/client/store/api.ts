import { TokenAmount } from '@bubble-tea/base';
import { fetchCoinMarkets, fetchSupportedVsCurrency } from '@bubble-tea/coin-gecko';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'api' }),
  endpoints: builder => ({
    walletBalances: builder.query<TokenAmount[], { chainId: string; address: string }>({
      query: ({ chainId, address }) => `balance/${chainId}/${address}`,
    }),
    vsCurrencies: builder.query({
      queryFn: (_: void) =>
        fetchSupportedVsCurrency()
          .then(data => ({ data }))
          .catch(error => ({ error })),
    }),
    coinMarkets: builder.query({
      queryFn: ({ vsCurrency, coinGeckoIds }: { vsCurrency: string; coinGeckoIds: string[] }) =>
        fetchCoinMarkets(vsCurrency, ...coinGeckoIds)
          .then(data => ({ data }))
          .catch(error => ({ error })),
    }),
  }),
});

export default api;

export const {
  useLazyCoinMarketsQuery,
  useLazyVsCurrenciesQuery,
  useLazyWalletBalancesQuery,
  endpoints: { walletBalances },
} = api;
