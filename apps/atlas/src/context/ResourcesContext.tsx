/* eslint-disable @typescript-eslint/no-empty-function */
import { useAccount, useStarknetCall } from '@starknet-react/core';

import { BigNumber } from 'ethers';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toBN } from 'starknet/dist/utils/number';
import { bnToUint256, uint256ToBN } from 'starknet/dist/utils/uint256';
import { resources } from '@/constants/resources';
import type { GetGameConstantsQuery } from '@/generated/graphql';
import {
  useGetWalletBalancesQuery,
  useGetGameConstantsQuery,
} from '@/generated/graphql';
import { useMarketRate } from '@/hooks/market/useMarketRate';
import {
  useLordsContract,
  useResources1155Contract,
  useExchangeContract,
} from '@/hooks/settling/stark-contracts';
import { getAccountHex } from '@/shared/Getters/Realm';
import type { ResourceCost, NetworkState, HistoricPrices } from '@/types/index';

export type Resource = {
  resourceId: number;
  resourceName: string;
  amount: string;
  rate: string;
  lp: string;
  currencyAmount: string;
  tokenAmount: string;
  percentChange: number;
};

export type ResourceQty = {
  resourceId: number;
  qty: number;
};

export type LpQty = {
  resourceId: number;
  lpqty: number;
  currencyqty: number;
};

type ResourcesBalance = Array<Resource>;

const resourceMapping = resources.map((resource) => {
  return bnToUint256(toBN(resource.id));
});

const initBalance = resources.map((resource) => {
  return {
    resourceId: resource.id,
    resourceName: resource.trait,
    amount: '0',
    rate: '0',
    lp: '0',
    currencyAmount: '0',
    tokenAmount: '0',
    percentChange: 0,
  };
});

const ResourcesContext = createContext<{
  availableResourceIds: number[];
  selectedSwapResources: ResourceQty[];
  selectedSwapResourcesWithBalance: (Resource & ResourceQty)[];
  addSelectedSwapResources: (resourceId?: number, qty?: number) => void;
  removeSelectedSwapResource: (resourceId: number) => void;
  removeAllSelectedSwapResources: () => void;
  updateSelectedSwapResourceQty: (resourceId: number, qty: number) => void;
  updateSelectedSwapResource: (
    resourceId: number,
    newResourceId: number
  ) => void;
  balance: ResourcesBalance;
  balanceStatus: NetworkState;
  lordsBalance: string;
  updateBalance: () => void;
  getResourceById: (resourceId: number) => Resource | undefined;
  buildingCosts: GetGameConstantsQuery['buildingCosts'] | undefined;
  battalionCosts: GetGameConstantsQuery['battalionCosts'] | undefined;
  batchAddResources: (cost: ResourceCost[]) => void;
  historicPrices: HistoricPrices | undefined;
}>(null!);

interface ResourceProviderProps {
  children: React.ReactNode;
}

export const ResourceProvider = (props: ResourceProviderProps) => {
  return (
    <ResourcesContext.Provider value={useResources()}>
      {props.children}
    </ResourcesContext.Provider>
  );
};

function useResources() {
  const { address } = useAccount();
  const [balance, setBalance] = useState([...initBalance]);
  const [balanceStatus, setBalanceStatus] = useState<NetworkState>('loading');
  const [lordsBalance, setLordsBalance] = useState('0');

  // TODO: Move costs into own provider...
  const [buildingCosts, setBuildingCosts] =
    useState<GetGameConstantsQuery['buildingCosts']>();

  const [battalionCosts, setBattalionCosts] =
    useState<GetGameConstantsQuery['battalionCosts']>();

  const { data: gameConstants } = useGetGameConstantsQuery();

  const [availableResourceIds, setAvailableResourceIds] = useState<number[]>(
    resources.map((resource) => resource.id)
  );
  const [selectedSwapResources, setSelectedSwapResources] = useState<
    ResourceQty[]
  >([]);

  const { contract: resources1155Contract } = useResources1155Contract();
  const { contract: lordsContract } = useLordsContract();
  const { contract: exchangeContract } = useExchangeContract();
  const ownerAddressInt = address
    ? toBN(address as string).toString()
    : undefined;

  const resourceMappingArray = useMemo(() => {
    return ownerAddressInt
      ? Array(resourceMapping.length).fill(ownerAddressInt)
      : undefined;
  }, [ownerAddressInt]);

  const { data: lordsBalanceData, refresh } = useStarknetCall({
    contract: lordsContract,
    method: 'balanceOf',
    args: [ownerAddressInt],
  });

  const { data: walletBalancesData, refetch: updateBalance } =
    useGetWalletBalancesQuery({
      variables: {
        address: address ? getAccountHex(address)?.toLowerCase() : '',
      },
    });

  const { data: lpBalanceData, refresh: updateLpBalance } = useStarknetCall({
    contract: exchangeContract,
    method: 'balanceOfBatch',
    args: [resourceMappingArray, resourceMapping],
  });

  const { data: exchangePairData, refresh: updateExchangePairData } =
    useStarknetCall({
      contract: exchangeContract,
      method: 'get_all_currency_reserves',
      args: [resourceMapping],
      options: {
        watch: false,
      },
    });

  const { exchangeInfo, historicPrices } = useMarketRate();

  // batch add a cost
  const batchAddResources = (cost: ResourceCost[]) => {
    const mapped: ResourceQty[] = cost?.map((a) => {
      return {
        resourceId: a.resourceId,
        qty: a.amount * 1.1,
      };
    });

    const result: ResourceQty[] = Object.values(
      [...selectedSwapResources, ...mapped].reduce(
        (acc, { resourceId, qty }) => {
          acc[resourceId] = {
            resourceId,
            qty: (acc[resourceId] ? acc[resourceId].qty : 0) + qty,
          };
          return acc;
        },
        {}
      )
    );

    setSelectedSwapResources([...result]);
  };

  const addSelectedSwapResources = (resourceId?: number, qty?: number) => {
    if (availableResourceIds.length === 0) {
      return;
    }
    const select = resourceId ?? availableResourceIds[0];
    setSelectedSwapResources([
      { resourceId: select, qty: qty ? qty : 0 },
      ...selectedSwapResources,
    ]);
  };

  const removeSelectedSwapResource = (resourceId: number) => {
    setSelectedSwapResources(
      selectedSwapResources.filter((item) => item.resourceId !== resourceId)
    );
  };

  const removeAllSelectedSwapResources = () => {
    setSelectedSwapResources([]);
  };

  const updateSelectedSwapResource = (
    resourceId: number,
    newResourceId: number
  ) => {
    setSelectedSwapResources(
      selectedSwapResources.map((resource) => {
        if (resource.resourceId === resourceId) {
          return { ...resource, resourceId: newResourceId };
        }
        return resource;
      })
    );
  };

  const updateSelectedSwapResourceQty = (resourceId: number, qty: number) => {
    setSelectedSwapResources(
      selectedSwapResources.map((resource) =>
        resource.resourceId === resourceId
          ? { ...resource, qty: qty }
          : { ...resource }
      )
    );
  };

  useEffect(() => {
    if (!lordsBalanceData || !lordsBalanceData[0]) {
      return;
    }
    setLordsBalance(uint256ToBN(lordsBalanceData[0]).toString(10));
  }, [lordsBalanceData]);

  useEffect(() => {
    setAvailableResourceIds(
      resources
        .map((resource) => resource.id)
        .filter(
          (resourceId) =>
            selectedSwapResources.find(
              (resource) => resource.resourceId === resourceId
            ) === undefined
        )
    );
  }, [selectedSwapResources]);

  useEffect(() => {
    if (
      !walletBalancesData ||
      !walletBalancesData.walletBalances ||
      !gameConstants
    ) {
      return;
    }

    const rates = exchangeInfo ?? [];
    const pluckData = (data: any) => {
      return data.map((resourceBalance, index) => {
        return {
          amount: uint256ToBN(resourceBalance).toString(10),
        };
      });
    };
    const userLp = lpBalanceData ? pluckData(lpBalanceData[0]) : [];
    const currencyExchangeData = exchangePairData
      ? pluckData(exchangePairData[0])
      : [];
    const tokenExchangeData = exchangePairData
      ? pluckData(exchangePairData[1])
      : [];

    setBalance(
      resources.map((resource, index) => {
        const resourceId = resource.id ?? 0;
        const resourceName = resource.trait ?? 0;

        const walletBalance =
          walletBalancesData.walletBalances.find(
            (a) => a.tokenId === resourceId
          )?.amount ?? 0;

        const rate = rates.find((rate) => rate.tokenId === resourceId);
        console.log(rate);
        return {
          resourceId,
          resourceName,
          amount: BigNumber.from(walletBalance).toString(),
          rate: rate?.amount ?? '0',
          lp: userLp[index]?.amount ?? '0',
          currencyAmount: currencyExchangeData[index]?.amount ?? '0',
          tokenAmount: tokenExchangeData[index]?.amount ?? '0',
          percentChange: rate?.percentChange24Hr ?? 0,
        };
      })

      // walletBalancesData.walletBalances.map((resourceBalance, index) => {
      //   const resourceId = resourceBalance.tokenId ?? 0;
      //   const rate = rates.find((rate) => rate.tokenId === resourceId);
      //   const rateAmount = rate?.amount ?? '0';
      //   const resourceName = rate?.tokenName ?? '';
      //   return {
      //     resourceId,
      //     resourceName,
      //     amount: BigNumber.from(resourceBalance.amount).toString(),
      //     rate: rateAmount ?? '0',
      //     lp: userLp[index]?.amount ?? '0',
      //     currencyAmount: currencyExchangeData[index]?.amount ?? '0',
      //     tokenAmount: tokenExchangeData[index]?.amount ?? '0',
      //     percentChange: rate?.percentChange24Hr ?? 0,
      //   };
      // })
    );

    setBuildingCosts(gameConstants?.buildingCosts);
    setBattalionCosts(gameConstants?.battalionCosts);
  }, [
    walletBalancesData && walletBalancesData.walletBalances,
    lpBalanceData && lpBalanceData[0],
    exchangePairData && exchangePairData[0],
    exchangeInfo,
  ]);

  const getResourceById = useCallback(
    (resourceId: number) => {
      return balance.find((resource) => resource.resourceId === resourceId);
    },
    [balance]
  );

  const selectedSwapResourcesWithBalance = useMemo(() => {
    return selectedSwapResources.map((resource) => {
      return {
        ...resource,
        ...getResourceById(resource.resourceId),
      } as Resource & ResourceQty;
    });
  }, [selectedSwapResources, balance]);

  return {
    availableResourceIds,
    selectedSwapResources,
    selectedSwapResourcesWithBalance,
    addSelectedSwapResources,
    removeSelectedSwapResource,
    removeAllSelectedSwapResources,
    updateSelectedSwapResourceQty,
    updateSelectedSwapResource,
    balance,
    balanceStatus,
    updateBalance,
    getResourceById,
    lordsBalance,
    buildingCosts,
    battalionCosts,
    batchAddResources,
    historicPrices,
  };
}

export function useResourcesContext() {
  return useContext(ResourcesContext);
}
