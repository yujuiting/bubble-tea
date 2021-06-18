import assert from 'assert';
import { Chain, createUnkownChain, mustFindChain, unknownChain } from './chain';
import data from './tokens.json';

export interface Token {
  name: string;
  symbol: string;
  icon?: string;
  coinGeckoId?: string;
  variants: TokenVariant[];
}

export interface TokenVariant {
  chain: Chain;
  decimals: number;
  address: string;
}

export const tokens: Token[] = data.map<Token>(raw => ({
  ...raw,
  variants: raw.variants.map(variant => ({
    ...variant,
    chain: mustFindChain(variant.chainId),
  })),
}));

export function findToken(symbol: string) {
  return tokens.find(token => token.symbol === symbol);
}

export function mustFindToken(symbol: string) {
  const token = findToken(symbol);
  assert(token, `not found token ${symbol}`);
  return token;
}

export function findTokenVariant(token: Token, chain: Chain) {
  return token.variants.find(variant => variant.chain.id === chain.id);
}

export function mustFindTokenVariant(token: Token, chain: Chain) {
  const tokenVariant = findTokenVariant(token, chain);
  assert(tokenVariant, `not found token variant for ${token.name} on ${chain.name}`);
  return tokenVariant;
}

export function findTokenByAddress(
  address: string,
  fallbackToken = unknownToken,
  fallbackChain = fallbackToken.variants[0]?.chain || unknownChain,
) {
  for (const token of tokens) {
    for (const variant of token.variants) {
      if (variant.address === address) {
        return [token, variant.chain] as const;
      }
    }
  }
  return [fallbackToken, fallbackChain] as const;
}

export const unknownToken = createUnkownToken();

export function createUnkownToken(token: Partial<Token> = {}): Token {
  return { name: 'Unknown Token', symbol: 'unknown', variants: [], ...token };
}

export function createUnkownVariant(variant: Partial<TokenVariant>): TokenVariant {
  return { chain: createUnkownChain(variant.chain), decimals: 0, address: '', ...variant };
}
