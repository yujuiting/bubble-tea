import {
  groupTokenAmounts,
  isLoadedResource,
  isLoadingResource,
  isTruthy,
  mergeTokenAmounts,
  TokenAmount,
  toNumber,
  Wallet,
} from '@bubble-tea/base';
import { useTokenMarket } from 'contexts/token-market';
import { useSelector } from 'hooks/store';
import { useMemo } from 'react';
import { walletBalances } from 'store/api';
import { selectWallets } from 'store/wallet';

export function useAllTokenAmounts() {
  const wallets = useSelector(selectWallets);
  const allTokenAmounts = useSelector(state => wallets.map(wallet => walletBalances.select(wallet)(state).data).flat());
  const isLoading = useSelector(state => wallets.some(wallet => walletBalances.select(wallet)(state).isLoading));
  const tokenAmounts = useMemo(
    () => groupTokenAmounts(allTokenAmounts.filter(isTruthy)).map(mergeTokenAmounts),
    [allTokenAmounts],
  );
  return [tokenAmounts, isLoading] as const;
}

export function useAllSummary() {
  const [tokenAmounts, isLoading] = useAllTokenAmounts();
  const [balance, isLoadingBalance] = useSummaryFromBalances(tokenAmounts);
  return [balance, isLoading || isLoadingBalance] as const;
}

export function useWalletSummary(wallet: Wallet) {
  const balances = useSelector(walletBalances.select(wallet)).data || [];
  const isLoading = useSelector(walletBalances.select(wallet)).isLoading;
  const [balance, isLoadingBalance] = useSummaryFromBalances(balances);
  return [balance, isLoading || isLoadingBalance] as const;
}

function useSummaryFromBalances(balances: TokenAmount[]) {
  const coinGeckoIds = useMemo(
    () => balances.map(tokenAmount => tokenAmount?.token.coinGeckoId).filter(isTruthy),
    [balances],
  );
  const markets = useTokenMarket(coinGeckoIds);
  return useMemo<[number, boolean]>(() => {
    let summary = 0;
    for (const balance of balances) {
      if (!balance || !balance.token.coinGeckoId) continue;
      const market = markets[balance.token.coinGeckoId];
      if (!market) continue;
      if (isLoadingResource(market)) return [0, true];
      if (isLoadedResource(market)) summary += toNumber(balance) * market.data.current_price;
    }
    return [summary, false];
  }, [balances, markets]);
}
