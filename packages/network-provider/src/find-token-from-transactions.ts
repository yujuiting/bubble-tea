import { Chain, Token } from '@bubble-tea/base';
import * as bscscan from '@bubble-tea/bscscan';
import * as etherscan from '@bubble-tea/etherscan';
import { findCoinGeckoId } from '@bubble-tea/coin-gecko';

type Transaction = bscscan.Transaction | etherscan.Transaction;

export default async function findTokensFromTransactions(chain: Chain, transactions: Transaction[]) {
  const addresses = new Set<string>();
  const tokens: Token[] = [];
  for (const { contractAddress: address, tokenName: name, tokenSymbol: symbol, tokenDecimal } of transactions) {
    if (addresses.has(address)) continue;
    addresses.add(address);
    tokens.push({
      name,
      symbol,
      coinGeckoId: await findCoinGeckoId(name, symbol),
      variants: [{ chain, decimals: parseInt(tokenDecimal, 10), address }],
    });
  }
  return tokens;
}
