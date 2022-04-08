import { useQuery } from '@apollo/client';
import { Tabs } from '@bibliotheca-dao/ui-lib';
import Bag from '@bibliotheca-dao/ui-lib/icons/bag.svg';
import Close from '@bibliotheca-dao/ui-lib/icons/close.svg';
import { useMemo } from 'react';
import { LootFilters } from '@/components/filters/LootFilters';
import { LootOverviews } from '@/components/tables/LootOverviews';
import { useLootContext } from '@/context/LootContext';
import { getLootsQuery } from '@/hooks/graphql/queries';
import { useUIContext } from '@/hooks/useUIContext';
import { useWalletContext } from '@/hooks/useWalletContext';
import type { Loot } from '@/types/index';
import { BasePanel } from './BasePanel';

export const LootPanel = () => {
  const { togglePanelType, selectedPanel } = useUIContext();
  const { account } = useWalletContext();
  const { state, actions } = useLootContext();

  const tabs = ['Your Loot', 'All Loot', 'Favourite Loot'];

  const where = useMemo(() => {
    if (state.selectedTab === 0) {
      return { currentOwner: account?.toLowerCase() };
    } else if (state.selectedTab === 1) {
      let where: any = {};
      if (state.searchIdFilter) {
        where = { id: state.searchIdFilter };
      } else {
        where = {
          bagGreatness_gt: state.ratingFilter.bagGreatness,
          bagRating_gt: state.ratingFilter.bagRating,
        };
      }
      return where;
    } else if (state.selectedTab === 2) {
      return { id_in: [...state.favouriteLoot] };
    }
  }, [account, state]);

  const { loading, data } = useQuery<{ bags: Loot[] }>(getLootsQuery, {
    variables: {
      first: 100,
      where,
      orderBy: 'minted',
      orderDirection: 'asc',
    },
  });

  return (
    <BasePanel open={selectedPanel === 'loot'}>
      <div className="flex justify-between pt-2">
        <div className="sm:hidden"></div>
        <h1>Loot</h1>

        <button
          className="z-50 transition-all rounded sm:hidden top-4"
          onClick={() => togglePanelType('loot')}
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
        <LootFilters />
        {loading && (
          <div className="flex flex-col items-center w-20 gap-2 mx-auto my-40 animate-pulse">
            <Bag className="block w-20 fill-current" />
            <h2>Loading</h2>
          </div>
        )}
        <LootOverviews bags={data?.bags ?? []} />
      </div>
    </BasePanel>
  );
};