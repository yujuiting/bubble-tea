import { isLoadedResource, isLoadingResource, isTruthy, TokenAmount, toNumber, Wallet } from '@bubble-tea/base';
import { useTokenMarket } from 'contexts/token-market';
import { useSelector } from 'hooks/store';
import { useAllTokenAmounts, useTokenAmountIncludeContains } from 'hooks/use-token-amounts';
import { useMemo } from 'react';
import { walletBalances } from 'store/api';

export function useAllSummary() {
  const [tokenAmounts, isLoading] = useAllTokenAmounts(true);
  const [balance, isLoadingBalance] = useSummaryFromBalances(tokenAmounts);
  return [balance, isLoading || isLoadingBalance] as const;
}

export function useWalletSummary({ chain: { id: chainId }, address }: Wallet) {
  const { data = [], isLoading } = useSelector(walletBalances.select({ chainId, address }));
  const tokenAmounts = useTokenAmountIncludeContains(data);
  const [balance, isLoadingBalance] = useSummaryFromBalances(tokenAmounts);
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
