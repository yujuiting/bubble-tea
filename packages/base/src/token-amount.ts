import { BigNumber } from '@ethersproject/bignumber';
import { Chain, createUnkownChain } from './chain';
import { createUnkownToken, Token } from './token';
import { cacheKey } from './keys';
import { DefiProtocol } from './defi';

export interface TokenAmount {
  chain: Chain;
  token: Token;
  amount: string;
  contains?: TokenAmount[];
  located?: DefiProtocol;
  isReward?: boolean;
}

export interface PoolAmount extends TokenAmount {
  contains: TokenAmount[];
}

export interface StakedAmount extends TokenAmount {
  located: DefiProtocol;
}

export const noopTokenAmount: TokenAmount = {
  chain: createUnkownChain(),
  token: createUnkownToken(),
  amount: '0',
};

export const noopPoolAmount: PoolAmount = {
  ...noopTokenAmount,
  contains: [],
};

export function mergeTokenAmounts([first, ...rests]: TokenAmount[]): TokenAmount {
  const { chain, token, amount, located, isReward } = first;
  let bn = BigNumber.from(amount);
  for (const tokenAmount of rests) {
    bn.add(tokenAmount.amount);
  }
  const allContains = [first, ...rests].map(({ contains = [] }) => contains).flat();
  const contains = groupTokenAmounts(allContains).map(mergeTokenAmounts);
  return {
    chain,
    token,
    amount: bn.toString(),
    contains: contains.length > 0 ? contains : undefined,
    located,
    isReward,
  };
}

export function groupTokenAmounts(tokenAmounts: TokenAmount[]): TokenAmount[][] {
  const groupByKey: Record<string, TokenAmount[]> = {};
  for (const tokenAmount of tokenAmounts) {
    if (!tokenAmount) continue;
    const key = cacheKey(tokenAmount.chain.name, tokenAmount.token.name);
    groupByKey[key] = groupByKey[key] || [];
    groupByKey[key].push(tokenAmount);
  }
  return Object.keys(groupByKey).map(key => groupByKey[key]);
}
