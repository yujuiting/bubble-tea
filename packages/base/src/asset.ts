import { TokenAmount } from './token-amount';

export interface TokenAsset {
  balance: TokenAmount;
  price: number;
  value: number;
}

export interface PoolAsset {
  tokens: TokenAsset[];
  rewards: TokenAsset[];
}
