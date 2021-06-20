import { Address } from './wallet';
import { Chain } from './chain';
import { Token } from './token';
import { TokenAmount, PoolAmount } from './token-amount';
import { DefiProtocol } from './defi';

// fetch balances of tokens which this address holded
export interface BalanceFetcher {
  (owner: Address): Promise<TokenAmount[]>;
}

export interface NetworkProvider {
  chain: Chain;
  nativeToken: Token;
  fetchBalance: BalanceFetcher;
}

export interface PoolBalanceFetcher {
  (pool: Address, owner: Address): Promise<PoolAmount>;
}

export interface DefiProvider {
  chain: Chain;
  defiProtocol: DefiProtocol;
  hasInteractedWith(interactedAddresses: Address[]): Promise<boolean>;
  fetchBalance: BalanceFetcher;
}
