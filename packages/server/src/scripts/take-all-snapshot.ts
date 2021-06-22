import { client } from '../db';
import { takeSnapshotForAllWallet } from '../take-snapshot';

console.log(new Date().toLocaleString());

takeSnapshotForAllWallet().finally(() => client.close());
