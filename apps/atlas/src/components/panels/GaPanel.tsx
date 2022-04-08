import { useQuery } from '@apollo/client';
import { Tabs } from '@bibliotheca-dao/ui-lib';
import Close from '@bibliotheca-dao/ui-lib/icons/close.svg';
import Helm from '@bibliotheca-dao/ui-lib/icons/helm.svg';
import { useMemo } from 'react';
import { GaFilters } from '@/components/filters/GaFilters';
import { GaOverviews } from '@/components/tables/GaOverviews';
import { useGaContext } from '@/context/GaContext';
import { getGAsQuery } from '@/hooks/graphql/queries';
import { useUIContext } from '@/hooks/useUIContext';
import { useWalletContext } from '@/hooks/useWalletContext';
import type { GAdventurer } from '@/types/index';
import { BasePanel } from './BasePanel';

export const GaPanel = () => {
  const { togglePanelType, selectedPanel } = useUIContext();
  const { account } = useWalletContext();
  const { state, actions } = useGaContext();

  const tabs = ['Your GA', 'All GA', 'Favourite GA'];

  const where = useMemo(() => {
    // Your GA
    if (state.selectedTab === 0) {
      return { currentOwner: account.toLowerCase() };
    }
    // All GA
    else if (state.selectedTab === 1) {
      let where: any = {};
      if (state.searchIdFilter) {
        where = { id: state.searchIdFilter };
      } else {
        where = {
          bagGreatness_gt: state.ratingFilter.bagGreatness,
          bagRating_gt: state.ratingFilter.bagRating,
        };
        if (state.selectedOrders.length > 0) {
          where.order_in = [
            ...state.selectedOrders.map((orderType) =>
              orderType.replace('_', ' ')
            ),
          ];
        }
      }
      return where;
    }
    // Favourite GA
    else if (state.selectedTab === 2) {
      return { id_in: [...state.favouriteGa] };
    }
    return {};
  }, [account, state]);

  const { loading, data } = useQuery<{
    gadventurers: GAdventurer[];
  }>(getGAsQuery, {
    variables: {
      first: 100,
      where,
      orderBy: 'minted',
      orderDirection: 'asc',
    },
  });
  return (
    <BasePanel open={selectedPanel === 'ga'}>
      <div className="flex justify-between pt-2">
        <div className="sm:hidden"></div>
        <h1>Genesis Adventurers</h1>

        <button
          className="z-50 transition-all rounded sm:hidden top-4"
          onClick={() => togglePanelType('ga')}
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
        <GaFilters />
        {loading && (
          <div className="flex flex-col items-center w-20 gap-2 mx-auto my-40 animate-pulse">
            <Helm className="block w-20 fill-current" />
            <h2>Loading</h2>
          </div>
        )}
        <GaOverviews bags={data?.gadventurers ?? []} />
      </div>
    </BasePanel>
  );
};