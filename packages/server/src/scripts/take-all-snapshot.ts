import { client } from '../db';
import { takeSnapshotForAllWallet } from '../take-snapshot';

takeSnapshotForAllWallet().finally(() => client.close());
