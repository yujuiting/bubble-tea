import { groupTokenAmounts, isTruthy, mergeTokenAmounts, TokenAmount, Wallet } from '@bubble-tea/base';
import { useSelector } from 'hooks/store';
import { useMemo } from 'react';
import { walletBalances } from 'store/api';
import { selectWallets } from 'store/wallet';
import { filterVisibleTokenAmounts } from 'utils';

export function useTokenAmounts(wallets: Wallet[]) {
  const tokenAmounts = useSelector(state =>
    wallets
      .map(({ chain: { id: chainId }, address }) => walletBalances.select({ chainId, address })(state).data)
      .flat(),
  );
  return useMemo(() => tokenAmounts.filter(isTruthy), [tokenAmounts]);
}

export function useTokenAmountIncludeContains(tokenAmounts: TokenAmount[], skip = false) {
  return useMemo(() => {
    if (skip) return tokenAmounts;
    const result: TokenAmount[] = [];
    for (const tokenAmount of tokenAmounts) {
      result.push(tokenAmount);
      if (tokenAmount.contains) result.push(...tokenAmount.contains);
    }
    return result;
  }, [tokenAmounts]);
}

export function useAllTokenAmounts(flatContains = false) {
  const wallets = useSelector(selectWallets);
  const tokenAmounts = useTokenAmounts(wallets);
  const allTokenAmounts = useTokenAmountIncludeContains(tokenAmounts, !flatContains);
  const isLoading = useSelector(state =>
    wallets.some(({ chain: { id: chainId }, address }) => walletBalances.select({ chainId, address })(state).isLoading),
  );
  const mergedTokenAmounts = useMemo(
    () => groupTokenAmounts(allTokenAmounts.filter(isTruthy)).map(mergeTokenAmounts),
    [allTokenAmounts],
  );
  return [mergedTokenAmounts, isLoading] as const;
}

export function useVisibleTokenAmounts(flatContains = false) {
  const [tokenAmounts, isLoading] = useAllTokenAmounts(flatContains);
  const wallets = useSelector(selectWallets);
  const hideTokens = useMemo(
    () => wallets.reduce((acc, { hideTokens = [] }) => [...acc, ...hideTokens], [] as string[]),
    [wallets],
  );
  const visibleTokenAmounts = useMemo(
    () => filterVisibleTokenAmounts(tokenAmounts, hideTokens),
    [tokenAmounts, hideTokens],
  );
  return [visibleTokenAmounts, isLoading] as const;
}
