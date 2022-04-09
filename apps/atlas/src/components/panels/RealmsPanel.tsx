import { Tabs } from '@bibliotheca-dao/ui-lib';
import Castle from '@bibliotheca-dao/ui-lib/icons/castle.svg';
import Close from '@bibliotheca-dao/ui-lib/icons/close.svg';
import { useEffect, useMemo, useState } from 'react';
import { RealmsFilter } from '@/components/filters/RealmsFilter';
import { RealmOverviews } from '@/components/tables/RealmOverviews';
import { useRealmContext } from '@/context/RealmContext';
import type { RealmTraitType } from '@/generated/graphql';
import { useGetRealmsQuery } from '@/generated/graphql';
import { useUIContext } from '@/hooks/useUIContext';
import { useWalletContext } from '@/hooks/useWalletContext';
import Button from '@/shared/Button';
import { BasePanel } from './BasePanel';

export const RealmsPanel = () => {
  const {
    togglePanelType,
    selectedPanel,
    setSelectedAssetType,
    setMenuType,
    setSelectedId,
  } = useUIContext();
  const { account } = useWalletContext();
  const { state, actions } = useRealmContext();

  const limit = 50;
  const [page, setPage] = useState(1);
  const previousPage = () => setPage(page - 1);
  const nextPage = () => setPage(page + 1);

  const isRealmPanel = selectedPanel === 'realm';

  const tabs = ['Your Realms', 'All Realms', 'Favourite Realms'];

  const variables = useMemo(() => {
    // Your Realms
    if (state.selectedTab === 0) {
      return {
        filter: {
          OR: [
            { owner: { equals: account?.toLowerCase() } },
            { bridgedOwner: { equals: account?.toLowerCase() } },
          ],
        },
      };
    }
    // All Realms
    else if (state.selectedTab === 1) {
      const resourceFilters = state.selectedResources.map((resource) => ({
        resourceType: { equals: resource },
      }));

      const traitsFilters = Object.keys(state.traitsFilter)
        // Filter 0 entries
        .filter((key: string) => (state.traitsFilter as any)[key])
        .map((key: string) => ({
          trait: {
            type: key as RealmTraitType,
            qty: { gte: (state.traitsFilter as any)[key] },
          },
        }));

      return {
        filter: state.searchIdFilter
          ? { realmId: { equals: parseInt(state.searchIdFilter) } }
          : {
              rarityRank: { gte: state.rarityFilter.rarityRank },
              rarityScore: { gte: state.rarityFilter.rarityScore },
              orderType:
                state.selectedOrders.length > 0
                  ? { in: [...state.selectedOrders] }
                  : undefined,
              AND: [...resourceFilters, ...traitsFilters],
            },
        take: limit,
        skip: limit * (page - 1),
      };
    }
    // Favourite Realms
    else if (state.selectedTab === 2) {
      return {
        filter: {
          realmId: { in: [...state.favouriteRealms] },
        },
      };
    }
    return {};
  }, [account, state, page]);

  const { data, loading } = useGetRealmsQuery({
    variables,
    skip: !isRealmPanel,
  });

  useEffect(() => {
    if (page === 1 && (data?.getRealms?.length ?? 0) > 0) {
      setSelectedAssetType('realm');
      setSelectedId(data?.getRealms[0].realmId + '');
    }
  }, [data, page]);

  const showPagination = () =>
    state.selectedTab === 1 &&
    (page > 1 || (data?.getRealms?.length ?? 0) === limit);

  return (
    <BasePanel open={isRealmPanel}>
      <div className="flex justify-between pt-2">
        <div className="sm:hidden"></div>
        <h1>Realms</h1>

        <button
          className="z-50 transition-all rounded sm:hidden top-4"
          onClick={() => togglePanelType('realm')}
        >
          <Close />
        </button>
      </div>
      <Tabs
        selectedIndex={state.selectedTab}
        onChange={actions.updateSelectedTab as any}
      >
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab} className="uppercase">
              {tab}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <div className="mt-2">
        <RealmsFilter />
        {loading && (
          <div className="flex flex-col items-center w-20 gap-2 mx-auto my-40 animate-pulse">
            <Castle className="block w-20 fill-current" />
            <h2>Loading</h2>
          </div>
        )}
        <RealmOverviews realms={data?.getRealms ?? []} />
      </div>
      {showPagination() && (
        <div className="flex gap-2 my-8">
          <Button onClick={previousPage} disabled={page === 1}>
            Previous
          </Button>
          <Button
            onClick={nextPage}
            disabled={data?.getRealms?.length !== limit}
          >
            Next
          </Button>
        </div>
      )}
    </BasePanel>
  );
};
