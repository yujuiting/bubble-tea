import { eth, bsc, sol } from '@bubble-tea/network-provider';
import { NetworkProvider, measureTime, retry } from '@bubble-tea/base';
import { connect } from './db';
import { HistoricalAsset, toHistoricalAssets, Wallet } from './models';

const networkProviders: Record<string, NetworkProvider | undefined> = { eth, bsc, sol };

export async function takeSnapshot(wallet: Wallet) {
  const timestamp = Math.floor(Date.now() * 1e-3);
  const networkProvider = networkProviders[wallet.chainId];
  if (!networkProvider) {
    console.warn(`not found network provider for ${wallet.chainId}`);
    return [];
  }

  const tokenAmounts = await retry(() => networkProvider.fetchBalance(wallet.address), 5);
  return toHistoricalAssets(tokenAmounts, wallet.id, timestamp);
}

export async function takeSnapshotForAllWallet() {
  const db = await connect();
  const wallets = await db.collection('wallets').find().toArray();
  const allSnapshot: HistoricalAsset[][] = [];
  for (const wallet of wallets) {
    console.log(`start to take snapshot for ${wallet.address}`);
    const snapshot = await measureTime(
      () => takeSnapshot(wallet),
      costTime => console.log(`take snapshot for ${wallet.address} done, cost time: ${costTime}ms`),
    );
    allSnapshot.push(snapshot);
  }
  await db.collection('historical-assets').insertMany(allSnapshot.flat());
}
