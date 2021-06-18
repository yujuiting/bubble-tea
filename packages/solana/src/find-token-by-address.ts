import { mustFindChain, Token } from '@bubble-tea/base';
import { TokenListProvider } from '@solana/spl-token-registry';

const tokenListProvider = new TokenListProvider();

const findTokenByAddressCache = new Map<string, Token>();

export default async function findTokenByAddress(address: string) {
  let token = findTokenByAddressCache.get(address);
  if (token) return;
  const container = await tokenListProvider.resolve();
  const tokenList = container.filterByClusterSlug('mainnet-beta').getList();
  const tokenInfo = tokenList.find(token => token.address === address);
  if (!tokenInfo) return;
  token = {
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    icon: tokenInfo.logoURI,
    variants: [{ chain: mustFindChain('sol'), decimals: tokenInfo.decimals, address }],
  };
  findTokenByAddressCache.set(address, token);
  return token;
}
