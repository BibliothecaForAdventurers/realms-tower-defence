import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { number, uint256 } from 'starknet';
import { resources } from '@/constants/resources';
import type { UserLp } from '@/context/BankContext';
import type { ExchangeRate } from '@/hooks/market/useMarketRate';

export const displayRate = (rate: string) => {
  return (+formatEther(rate || 0)).toFixed(4);
};

export const calculateLords = (rate: string, qty: number) => {
  return +formatEther(rate || 0) * qty;
};

export const resourceMapping = resources.map((resource) => {
  return uint256.bnToUint256(number.toBN(resource.id));
});

export const initResources = resources.map(
  (resource): ExchangeRate & UserLp => {
    return {
      tokenId: resource.id,
      tokenName: resource.trait,
      amount: '0',
      buyAmount: '0',
      sellAmount: '0',
      lp: 0,
      currencyReserve: '0',
      tokenReserve: '0',
      percentChange24Hr: 0,
    };
  }
);

export const formatToken = (value?) => {
  return (+formatEther(value || 0)).toLocaleString();
};

export const deadline = () => {
  const maxDate = new Date();
  maxDate.setMinutes(maxDate.getMinutes() + 30);
  return Math.floor(maxDate.getTime() / 1000);
};

export const convertBalance = (value) => {
  return BigNumber.from(value);
};

export const getIsBalanceSufficient = (balance, total) => {
  return convertBalance(balance).gte(
    BigNumber.from(parseEther(total.toString()))
  );
};