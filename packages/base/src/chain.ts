import assert from 'assert';
import data from './chains.json';

export interface Chain {
  name: string;
  id: string;
  nativeToken: string;
}

export const chains: Chain[] = data;

export function findChain(id: string) {
  return chains.find(chain => chain.id === id);
}

export function mustFindChain(id: string) {
  const chain = findChain(id);
  assert(chain, `not found chain ${id}`);
  return chain;
}

export function createUnkownChain(chain: Partial<Chain> = {}): Chain {
  return { name: 'Unknown Chain', id: 'unknown', nativeToken: 'unknown', ...chain };
}

export const unknownChain = createUnkownChain();
