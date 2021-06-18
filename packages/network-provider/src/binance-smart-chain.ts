import { Address, BalanceFetcher, findTokenVariant, Token } from '@bubble-tea/base';
import { chain, fetchBEP20TokenBalance, fetchNativeTokenBalance } from '@bubble-tea/binance-smart-chain';
import * as bscscan from '@bubble-tea/bscscan';
import * as beefyFinance from '@bubble-tea/beefy.finance';
import findTokensFromTransactions from './find-token-from-transactions';

export { chain, nativeToken } from '@bubble-tea/binance-smart-chain';

export const fetchBalance: BalanceFetcher = async address => {
  const transactions = await bscscan.fetchAccountBEP20TokenTransactions(address);
  const tokens = await findTokensFromTransactions(chain, transactions);
  return await Promise.all([
    fetchNativeTokenBalance(address),
    ...tokens.map(token => fetchTokenBalance(address, token)),
  ]);
};

async function fetchTokenBalance(address: Address, token: Token) {
  const tokenVariant = findTokenVariant(token, chain);
  if (tokenVariant && token.name.startsWith('Moo ')) {
    return await beefyFinance.fetchBalance(tokenVariant.address, address);
  }
  return await fetchBEP20TokenBalance(address, token);
}
