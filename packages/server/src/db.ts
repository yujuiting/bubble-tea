import { MongoClient } from 'mongodb';
import { mongodbUri } from './env';

export const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });

export const dbName = 'bubble-tea';

export async function connect() {
  if (!client.isConnected()) await client.connect();
  return client.db(dbName);
}
