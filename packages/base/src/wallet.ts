import { Chain } from './chain';

export type Address = string;

export interface Wallet {
  id: string;
  chain: Chain;
  address: Address;
  // uid
  belongsTo: string;
}

export type NewWallet = Omit<Wallet, 'id'>;

export function isAddress(value: unknown): value is Address {
  return typeof value === 'string';
}
