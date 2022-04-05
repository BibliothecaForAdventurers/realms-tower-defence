import type { Dispatch } from 'react';
import { createContext, useContext, useReducer } from 'react';
import type { ResourceType, OrderType } from '@/generated/graphql';
import { RealmTraitType } from '@/generated/graphql';

type RarityFilter = { rarityScore: number; rarityRank: number };

type TraitsFilter = {
  [RealmTraitType.Region]: number;
  [RealmTraitType.City]: number;
  [RealmTraitType.Harbor]: number;
  [RealmTraitType.River]: number;
};

interface RealmState {
  rarityFilter: RarityFilter;
  traitsFilter: TraitsFilter;
  selectedOrders: OrderType[];
  selectedResources: ResourceType[];
  favouriteRealms: number[];
}

type RealmAction =
  | { type: 'updateRarityFilter'; payload: RarityFilter }
  | { type: 'updateTraitsFilter'; payload: TraitsFilter }
  | { type: 'updateSelectedOrders'; payload: OrderType[] }
  | { type: 'updateSelectedResources'; payload: ResourceType[] }
  | { type: 'clearFilfters' }
  | { type: 'addFavouriteRealm'; payload: number }
  | { type: 'removeFavouriteRealm'; payload: number };

interface RealmActions {
  updateRarityFilter(filter: RarityFilter): void;
  updateTraitsFilter(filter: TraitsFilter): void;
  updateSelectedOrders(orders: OrderType[]): void;
  updateSelectedResources(resources: ResourceType[]): void;
  clearFilters(): void;
  addFavouriteRealm(realmId: number): void;
  removeFavouriteRealm(realmId: number): void;
}

const defaultFilters = {
  rarityFilter: {
    rarityScore: 0,
    rarityRank: 0,
  },
  traitsFilter: {
    [RealmTraitType.Region]: 0,
    [RealmTraitType.City]: 0,
    [RealmTraitType.Harbor]: 0,
    [RealmTraitType.River]: 0,
  },
  selectedOrders: [] as OrderType[],
  selectedResources: [] as ResourceType[],
};
const defaultRealmState = {
  ...defaultFilters,
  favouriteRealms: [] as number[],
};

function realmReducer(state: RealmState, action: RealmAction): RealmState {
  switch (action.type) {
    case 'updateRarityFilter':
      return { ...state, rarityFilter: action.payload };
    case 'updateTraitsFilter':
      return { ...state, traitsFilter: action.payload };
    case 'updateSelectedOrders':
      return { ...state, selectedOrders: [...action.payload] };
    case 'updateSelectedResources':
      return { ...state, selectedResources: [...action.payload] };
    case 'clearFilfters':
      return { ...state, ...defaultFilters };
    case 'addFavouriteRealm':
      return {
        ...state,
        favouriteRealms: [...state.favouriteRealms, action.payload],
      };
    case 'removeFavouriteRealm':
      return {
        ...state,
        favouriteRealms: state.favouriteRealms.filter(
          (realmId: number) => realmId !== action.payload
        ),
      };
    default:
      return state;
  }
}

// Actions
const mapActions = (dispatch: Dispatch<RealmAction>): RealmActions => ({
  updateRarityFilter: (filter: RarityFilter) =>
    dispatch({
      type: 'updateRarityFilter',
      payload: filter,
    }),
  updateTraitsFilter: (filter: TraitsFilter) =>
    dispatch({ type: 'updateTraitsFilter', payload: filter }),
  updateSelectedOrders: (orders: OrderType[]) =>
    dispatch({ type: 'updateSelectedOrders', payload: orders }),
  updateSelectedResources: (resources: ResourceType[]) =>
    dispatch({ type: 'updateSelectedResources', payload: resources }),
  clearFilters: () => dispatch({ type: 'clearFilfters' }),
  addFavouriteRealm: (realmId: number) =>
    dispatch({ type: 'addFavouriteRealm', payload: realmId }),
  removeFavouriteRealm: (realmId: number) =>
    dispatch({ type: 'removeFavouriteRealm', payload: realmId }),
});

const RealmContext = createContext<{
  state: RealmState;
  dispatch: Dispatch<RealmAction>;
  actions: RealmActions;
}>(null!);

export function useRealmContext() {
  return useContext(RealmContext);
}

export function RealmProvider({ children }: { children: JSX.Element }) {
  const [state, dispatch] = useReducer(realmReducer, defaultRealmState);

  return (
    <RealmContext.Provider
      value={{ state, dispatch, actions: mapActions(dispatch) }}
    >
      {children}
    </RealmContext.Provider>
  );
}