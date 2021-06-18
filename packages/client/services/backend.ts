import { mustFindChain, NewWallet, Wallet } from '@bubble-tea/base';
import { DBSchema, openDB } from 'idb';
import * as uuid from 'uuid';

interface BubbleTeaDBSchema extends DBSchema {
  wallets: {
    value: DBWallet;
    key: string;
    indexes: {
      'belongs-to': string;
    };
  };
}

interface DBWallet {
  id: string;
  chainId: string;
  address: string;
  belongsTo: string;
}

function toDBWallet({ id, chain, address, belongsTo }: Wallet): DBWallet {
  return { id, chainId: chain.id, address, belongsTo };
}

function fromDBWallet({ id, chainId, address, belongsTo }: DBWallet): Wallet {
  const chain = mustFindChain(chainId);
  return { id, chain, address, belongsTo };
}

export interface Backend {
  createWallet(newWallet: NewWallet): Promise<Wallet>;
  destroyWallet(wallet: Wallet): Promise<boolean>;
  fetchWallets(belongsTo: string): Promise<Wallet[]>;
}

export function indexedDBBackend(): Backend {
  const connecting = openDB<BubbleTeaDBSchema>('bubble-tea', 1, {
    upgrade(db) {
      db.createObjectStore('wallets', { keyPath: 'id' });
    },
  });

  async function createWallet(newWallet: NewWallet) {
    const db = await connecting;
    const wallet: Wallet = { id: uuid.v4(), ...newWallet };
    await db.add('wallets', toDBWallet(wallet));
    return wallet;
  }

  async function destroyWallet(wallet: Wallet) {
    const db = await connecting;
    await db.delete('wallets', wallet.id);
    return true;
  }

  async function fetchWallets(belongsTo: string) {
    if (belongsTo !== '') console.warn('indexedDB backend dose not support fetch wallets with uid');
    const db = await connecting;
    const rows = await db.getAll('wallets');
    return rows.map(fromDBWallet);
  }

  return {
    createWallet,
    destroyWallet,
    fetchWallets,
  };
}
