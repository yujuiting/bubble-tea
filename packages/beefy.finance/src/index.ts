import { Address, createUnkownToken, env, PoolBalanceFetcher, TokenAmount } from '@bubble-tea/base';
import { chain, fetchBEP20Token } from '@bubble-tea/binance-smart-chain';
import { fetchAbi } from '@bubble-tea/bscscan';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcBatchProvider } from '@ethersproject/providers';

const provider = new JsonRpcBatchProvider(env('BSC_ENDPOINT'));

export const fetchBalance: PoolBalanceFetcher = async (pool: Address, owner: Address) => {
  const poolAbi = await fetchAbi(pool);
  const poolContract = new Contract(pool, poolAbi, provider);
  const [[balance], [totalSupply], [contractBalance], [symbol], [decimals], [want]]: [
    [BigNumber],
    [BigNumber],
    [BigNumber],
    [string],
    [number],
    [Address],
  ] = await Promise.all([
    poolContract.functions.balanceOf(owner),
    poolContract.functions.totalSupply(),
    poolContract.functions.balance(),
    poolContract.functions.symbol(),
    poolContract.functions.decimals(),
    poolContract.functions.want(),
  ]);
  const token = createUnkownToken({ name: symbol, symbol, variants: [{ chain, decimals, address: pool }] });
  const liquidity = balance.mul(contractBalance).div(totalSupply);
  const wantAbi = await fetchAbi(want);
  const wantContract = new Contract(want, wantAbi, provider);
  let contains: TokenAmount[] = [];
  if ((await wantContract.functions.name())[0] === 'Pancake LPs') {
    contains = await calculatePancakeSwapLiquidityPool(wantContract, liquidity);
  }
  return { chain, token, amount: balance.toString(), contains };
};

async function calculatePancakeSwapLiquidityPool(contract: Contract, liquidity: BigNumber) {
  const [[token0Address], [token1Addres], [totalSupply], [token0Reserve, token1Reserve]]: [
    [Address],
    [Address],
    [BigNumber],
    [BigNumber, BigNumber],
  ] = await Promise.all([
    contract.functions.token0(),
    contract.functions.token1(),
    contract.functions.totalSupply(),
    contract.functions.getReserves(),
  ]);
  const [token0, token1] = await Promise.all([fetchBEP20Token(token0Address), fetchBEP20Token(token1Addres)]);
  const tokenAmounts: TokenAmount[] = [
    { chain, token: token0, amount: liquidity.mul(token0Reserve).div(totalSupply).toString() },
    { chain, token: token1, amount: liquidity.mul(token1Reserve).div(totalSupply).toString() },
  ];
  return tokenAmounts;
}
