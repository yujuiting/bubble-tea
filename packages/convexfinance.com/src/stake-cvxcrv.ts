import { StakedAmount, Address, DefiProvider } from '@bubble-tea/base';
import { fetchERC20Token, provider } from '@bubble-tea/ethereum';
import { fetchAbi } from '@bubble-tea/etherscan';
import { Contract } from '@ethersproject/contracts';
import { chain, defiProtocol } from './shared';

const baseRewardPoolAddress = '0x3Fe65692bfCD0e6CF84cB1E7d24108E434A7587e';

const virtualBalanceRewardPoolAddress = '0x7091dbb7fcbA54569eF1387Ac89Eb2a5C9F6d2EA';

const contractAddresses = [baseRewardPoolAddress, virtualBalanceRewardPoolAddress];

async function fetchBalance(owner: Address) {
  const [staked, ...contains] = await Promise.all([
    fetchStakedBalance(owner, baseRewardPoolAddress),
    ...contractAddresses.map(contractAddress => fetchReward(owner, contractAddress)),
  ]);
  staked.contains = contains;
  return [staked];
}

async function fetchStakedBalance(owner: Address, contractAddress: Address) {
  const abi = await fetchAbi(contractAddress);
  const contract = new Contract(contractAddress, abi, provider);
  const [[amount], [rewardToken]]: [[string], [string]] = await Promise.all([
    contract.functions.balanceOf(owner),
    contract.functions.rewardToken(),
  ]);
  const token = await fetchERC20Token(rewardToken);
  return { chain, token, amount, located: defiProtocol } as StakedAmount;
}

async function fetchReward(owner: Address, contractAddress: Address) {
  const abi = await fetchAbi(contractAddress);
  const contract = new Contract(contractAddress, abi, provider);
  const [[amount], [rewardToken]]: [[string], [string]] = await Promise.all([
    contract.functions.earned(owner),
    contract.functions.rewardToken(),
  ]);
  const token = await fetchERC20Token(rewardToken);
  return { chain, token, amount, located: defiProtocol } as StakedAmount;
}

async function hasInteractedWith(interactedAddresses: Address[]) {
  return contractAddresses.some(contractAddress => interactedAddresses.includes(contractAddress));
}

export const stakeCvxCRV: DefiProvider = {
  chain,
  defiProtocol,
  hasInteractedWith,
  fetchBalance,
};
