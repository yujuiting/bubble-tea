import * as uuid from 'uuid';
import { Wallet } from './models';
import { client } from './db';

const walletSeeds: Wallet[] = [
  {
    id: uuid.v4(),
    chainId: 'eth',
    address: '0x3246F71C20C945aaF48C45F69A77eb9C43daCF55',
  },
  {
    id: uuid.v4(),
    chainId: 'bsc',
    address: '0x3246F71C20C945aaF48C45F69A77eb9C43daCF55',
  },
  {
    id: uuid.v4(),
    chainId: 'bsc',
    address: '0x71F0b0f7c2183a024ea292e8e9092E69856C73f8',
  },
  {
    id: uuid.v4(),
    chainId: 'sol',
    address: 'G5KPS9yzMGyNPX89nG9hpZe7hwfN4sYV97Aj7qLAeZJR',
  },
];

async function seed() {
  await client.connect();
  const db = client.db('bubble-tea');
  const wallets = db.collection('wallets');
  const historicalAssets = db.collection('historical-assets');
  await wallets.createIndex({ chainId: 1, address: 1 }, { unique: true });
  await historicalAssets.createIndex({ belongsTo: 1, timestamp: 1 });
  await wallets.insertMany(walletSeeds);
}

seed().finally(() => client.close());
