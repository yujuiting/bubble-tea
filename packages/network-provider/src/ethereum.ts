import { BalanceFetcher, DefiProvider, TokenAmount } from '@bubble-tea/base';
import { chain, fetchNativeTokenBalance, fetchERC20TokenBalance, fetchInteractedAddresses } from '@bubble-tea/ethereum';
import * as etherscan from '@bubble-tea/etherscan';
import * as convexfinanceCom from '@bubble-tea/convexfinance.com';
import findTokensFromTransactions from './find-token-from-transactions';

export { chain, nativeToken } from '@bubble-tea/ethereum';

const defiProviders: DefiProvider[] = [convexfinanceCom.stakeCvxCRV];

export const fetchBalance: BalanceFetcher = async address => {
  const transactions = await etherscan.fetchAccountERC20TokenTransactions(address);
  const interactedAddresses = await findInteractedAddresses(transactions);
  const tokens = await findTokensFromTransactions(chain, transactions);
  const promises: Promise<TokenAmount | TokenAmount[]>[] = [
    fetchNativeTokenBalance(address),
    ...tokens.map(token => fetchERC20TokenBalance(address, token)),
  ];

  for (const defiProvider of defiProviders) {
    if (defiProvider.hasInteractedWith(interactedAddresses)) {
      promises.push(defiProvider.fetchBalance(address));
    }
  }

  return (await Promise.all(promises)).flat();
};

async function findInteractedAddresses(transactions: etherscan.Transaction[]) {
  return (await Promise.all(transactions.map(transaction => fetchInteractedAddresses(transaction.hash)))).flat();
}
