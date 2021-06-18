import { BalanceFetcher, env } from '@bubble-tea/base';
import { fetchNativeTokenBalance, fetchSPLTokenBalances } from '@bubble-tea/solana';
import { Connection, PublicKey } from '@solana/web3.js';

export { chain, nativeToken } from '@bubble-tea/solana';

export const fetchBalance: BalanceFetcher = async address => {
  const connection = new Connection(env('SOL_ENDPOINT'));
  const addressPublicKey = new PublicKey(address);
  const [nativeTokenBalance, tokenBalances] = await Promise.all([
    fetchNativeTokenBalance(connection, addressPublicKey),
    fetchSPLTokenBalances(connection, addressPublicKey),
  ]);
  return [nativeTokenBalance, ...tokenBalances];
};
