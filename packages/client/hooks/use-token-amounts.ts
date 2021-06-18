import { groupTokenAmounts, isTruthy, mergeTokenAmounts, TokenAmount, Wallet } from '@bubble-tea/base';
import { useSelector } from 'hooks/store';
import { useMemo } from 'react';
import { walletBalances } from 'store/api';
import { selectWallets } from 'store/wallet';

export function useTokenAmounts(wallets: Wallet[]) {
  const tokenAmounts = useSelector(state => wallets.map(wallet => walletBalances.select(wallet)(state).data).flat());
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
  const isLoading = useSelector(state => wallets.some(wallet => walletBalances.select(wallet)(state).isLoading));
  const mergedTokenAmounts = useMemo(
    () => groupTokenAmounts(allTokenAmounts.filter(isTruthy)).map(mergeTokenAmounts),
    [allTokenAmounts],
  );
  return [mergedTokenAmounts, isLoading] as const;
}
