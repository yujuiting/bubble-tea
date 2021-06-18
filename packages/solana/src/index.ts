import {
  createUnkownToken,
  findTokenByAddress as findTokenByAddressFromLocal,
  mustFindChain,
  mustFindToken,
  TokenAmount,
  unknownToken,
} from '@bubble-tea/base';
import { findCoinGeckoId } from '@bubble-tea/coin-gecko';
import { Connection, PublicKey, TokenAmount as SolanaTokenAmount } from '@solana/web3.js';
import findTokenByAddress from './find-token-by-address';

export { findTokenByAddress };

export const chain = mustFindChain('sol');

export const nativeToken = mustFindToken(chain.nativeToken);

interface ParsedAccount {
  type: 'account';
  info: {
    isNative: boolean;
    mint: string;
    owner: string;
    state: string;
    tokenAmount: SolanaTokenAmount;
  };
}

export async function fetchNativeTokenBalance(connection: Connection, address: PublicKey) {
  const balance = await connection.getBalance(address);
  return { chain, token: nativeToken, amount: balance.toFixed() } as TokenAmount;
}

export async function fetchSPLTokenBalances(connection: Connection, address: PublicKey) {
  const programId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  const { value } = await connection.getParsedTokenAccountsByOwner(address, { programId });
  return await Promise.all(
    value.map(async ({ account }) => {
      const { info } = account.data.parsed as ParsedAccount;
      const { amount, decimals } = info.tokenAmount;
      let [token] = findTokenByAddressFromLocal(info.mint);
      if (token === unknownToken) {
        token =
          (await findTokenByAddress(info.mint)) ||
          createUnkownToken({ variants: [{ chain, address: info.mint, decimals }] });
      }
      if (!token.coinGeckoId) {
        token.coinGeckoId = await findCoinGeckoId(token.name, token.symbol);
      }
      return { chain, token, amount } as TokenAmount;
    }),
  );
}
