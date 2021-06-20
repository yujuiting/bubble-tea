import { DefiProtocol, mustFindChain } from '@bubble-tea/base';

export const chain = mustFindChain('eth');

export const defiProtocol: DefiProtocol = {
  name: 'Convex',
  url: 'https://www.convexfinance.com',
  icon: 'https://www.convexfinance.com/logos/convex-white.svg',
};
