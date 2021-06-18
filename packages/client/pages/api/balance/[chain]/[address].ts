import { fromArray, isAddress, NetworkProvider } from '@bubble-tea/base';
import { eth, bsc, sol } from '@bubble-tea/network-provider';
import { NextApiRequest, NextApiResponse } from 'next/types';

const chainIdToProvider: Record<string, NetworkProvider | undefined> = { eth, bsc, sol };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, method } = req;

  if (method !== 'GET') {
    res.status(404);
    return;
  }

  const chain = fromArray(query.chain);

  const provider = chainIdToProvider[chain];

  if (!provider) {
    res.status(400).end('invalid chain');
    return;
  }

  const address = fromArray(query.address);

  if (!isAddress(address)) {
    res.status(400).end('invalid address');
    return;
  }

  const allBalances = await provider.fetchBalance(address);

  const balances = allBalances.filter(balance => balance.amount !== '0');

  res.status(200).json(balances);
}
