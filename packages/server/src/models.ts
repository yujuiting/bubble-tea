import { mustFindChain, TokenAmount, Wallet as BaseWallet } from '@bubble-tea/base';

export interface Wallet {
  id: string;
  chainId: string;
  address: string;
}

export function toWallet({ id, chain, address }: BaseWallet): Wallet {
  return { id, chainId: chain.id, address };
}

export function fromWallet({ id, chainId, address }: Wallet): BaseWallet {
  return { id, chain: mustFindChain(chainId), address, belongsTo: '' };
}

export interface HistoricalAsset {
  belongsTo: string; // wallet id
  amount: TokenAmount;
  timestamp: number;
}

export function toHistoricalAssets(
  tokenAmounts: TokenAmount[],
  belongsTo: string,
  timestamp: number,
): HistoricalAsset[] {
  return tokenAmounts.map<HistoricalAsset>(amount => ({ belongsTo, amount, timestamp }));
}
