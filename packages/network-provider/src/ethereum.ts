import { BalanceFetcher } from '@bubble-tea/base';
import { chain, fetchNativeTokenBalance, fetchERC20TokenBalance } from '@bubble-tea/ethereum';
import * as etherscan from '@bubble-tea/etherscan';
import findTokensFromTransactions from './find-token-from-transactions';

export { chain, nativeToken } from '@bubble-tea/ethereum';

export const fetchBalance: BalanceFetcher = async address => {
  const transactions = await etherscan.fetchAccountERC20TokenTransactions(address);
  const tokens = await findTokensFromTransactions(chain, transactions);
  return await Promise.all([
    fetchNativeTokenBalance(address),
    ...tokens.map(token => fetchERC20TokenBalance(address, token)),
  ]);
};
