import { ResourceIcon } from '@bibliotheca-dao/ui-lib/base';
import { formatEther } from '@ethersproject/units';
import { useAccount } from '@starknet-react/core';
import { ethers, BigNumber } from 'ethers';
import { DAY, SECONDS_PER_KM } from '@/constants/buildings';
import { findResourceById } from '@/constants/resources';
import type { RealmFragmentFragment } from '@/generated/graphql';
import RealmsData from '@/geodata/realms.json';

interface TraitProps {
  trait: string;
  traitAmount?: number;
}

export const RealmStatus = (realm: RealmFragmentFragment) => {
  return [RealmStateStatus(realm), RealmVaultStatus(realm)]
    .filter(Boolean)
    .join(', ');
};

export const RealmStateStatus = (realm: RealmFragmentFragment) => {
  if (realm.bridgedOwner) {
    return 'Bridge Pending';
  }
  if (realm.settledOwner) {
    return 'Settled L2';
  }
  if (realm.ownerL2) {
    return 'Unsettled L2';
  } else {
    return 'Layer 1';
  }
};

export const RealmOwner = (realm: RealmFragmentFragment) => {
  return (
    realm?.settledOwner ||
    realm?.ownerL2 ||
    realm?.bridgedOwner ||
    realm?.owner ||
    '0'
  );
};

export const TimeSince = (time: number) => {
  const now = Date.now();
  const lastVaultTime = new Date(time);
  return (now - lastVaultTime.getTime()) / 1000 / 60;
};

export const RealmVaultStatus = (realm: RealmFragmentFragment) => {
  if (!realm.lastVaultTime) {
    return '';
  }
  const now = Date.now();
  const lastVaultTime = new Date(realm.lastVaultTime);
  const minutesSinceLastVault = (now - lastVaultTime.getTime()) / 1000 / 60;
  const minutesToVault = DAY / 60; // 24 hours
  if (minutesSinceLastVault >= minutesToVault) {
    return `Raidable`;
  }

  const minutesRemaining = minutesToVault - minutesSinceLastVault;
  const hours = Math.floor(minutesRemaining / 60);
  const minutes = Math.floor(minutesRemaining % 60);
  if (hours > 0) {
    return `Raidable in ${hours}h ${minutes}m`;
  } else {
    return `Raidable in ${minutes}m`;
  }
};

export const TraitTable = (props: TraitProps) => {
  const traitSet = [
    {
      trait: 'Region',
      colour: 'bg-green-200/50',
      traitMax: 7,
      title: 'Regions',
    },
    { trait: 'City', colour: 'bg-amber-300/50', traitMax: 21, title: 'Cities' },
    {
      trait: 'Harbor',
      colour: 'bg-amber-500/50',
      traitMax: 35,
      title: 'Harbors',
    },
    {
      trait: 'River',
      colour: 'bg-blue-700/50',
      traitMax: 60,
      title: 'Rivers',
    },
  ];

  const getTrait = () => {
    return traitSet.find((a) => a.trait == props.trait);
  };

  const getWidth = () => {
    return ((props.traitAmount as any) / (getTrait()?.traitMax || 0)) * 100;
  };

  return (
    <div>
      <span className="flex justify-between">
        <span className="uppercase">{getTrait()?.title} </span>
        <span>
          {props.traitAmount} / {getTrait()?.traitMax}{' '}
        </span>
      </span>
      <div className="w-full my-1 rounded-full bg-stone-100/10">
        <div
          className={`h-1 ${getTrait()?.colour} shadow-inner rounded-full`}
          style={{
            width: `${getWidth()}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export const IsOwner = (owner?: string | null) => {
  const { address } = useAccount();
  const starknetWallet = address ? BigNumber.from(address).toHexString() : '';

  if (address) {
    return starknetWallet == owner ? true : false;
  } else {
    return false;
  }
};

export const getAccountHex = (account: string) => {
  return ethers.BigNumber.from(account).toHexString();
};

export const squadStats = (squad: any) => {
  if (!squad) {
    return { agility: 0, attack: 0, armor: 0, vitality: 0, wisdom: 0 };
  }
  return {
    /* agility: squad
      .map((troop) => troop.agility)
      .reduce((prev, curr) => prev + curr, 0),
    attack: squad
      .map((troop) => troop.attack)
      .reduce((prev, curr) => prev + curr, 0),
    armor: squad
      .map((troop) => troop.armor)
      .reduce((prev, curr) => prev + curr, 0),
    vitality: squad
      .map((troop) => troop.vitality)
      .reduce((prev, curr) => prev + curr, 0),
    wisdom: squad
      .map((troop) => troop.wisdom)
      .reduce((prev, curr) => prev + curr, 0), */
  };
};

export const getTrait = (realm: any, trait: string) => {
  return realm?.traits?.find((o) => o.type === trait)
    ? realm.traits?.find((o) => o.type === trait).qty
    : '0';
};

export const resourcePillaged = (resources: any) => {
  return (
    <div className="mx-auto my-4">
      {resources.length ? (
        resources?.map((resource, index) => {
          const info = findResourceById(resource.resourceId);
          return (
            <div
              className="flex justify-between my-1 font-display "
              key={index}
            >
              <div className="flex">
                <ResourceIcon
                  size="md"
                  className="self-center"
                  resource={info?.trait?.replace('_', '') as string}
                />{' '}
                <span className="self-center ml-4 mr-1 font-semibold tracking-widest uppercase">
                  {info?.trait}
                </span>
              </div>

              <div className="self-center font-semibold uppercase">
                {(+formatEther(resource.amount)).toLocaleString()}
              </div>
            </div>
          );
        })
      ) : (
        <span>No Resources pillaged</span>
      )}
    </div>
  );
};

export const fetchRealmNameById = (id: number | undefined) => {
  return RealmsData.features.find((realm) => realm.id == id)
    ? RealmsData.features.find((realm) => realm.id == id)?.name
    : '';
};

export const RealmClaimable = (realm: RealmFragmentFragment) => {
  if (!realm.lastClaimTime) {
    return false;
  }

  const cachedDaysAccrued = parseInt(
    ((new Date().getTime() - realm?.lastClaimTime) / DAY / 1000).toFixed(2)
  );
  console.log(realm?.lastClaimTime);
  return cachedDaysAccrued >= 1 ? true : false;
};

export const RealmCombatStatus = (realm: RealmFragmentFragment) => {
  if (!realm.lastAttacked) {
    return 'Raidable';
  }
  const now = Date.now();
  const lastVaultTime = new Date(realm.lastAttacked);
  const minutesSinceLastVault = (now - lastVaultTime.getTime()) / 1000 / 60;
  const minutesToVault = DAY / 60; // 24 hours
  if (minutesSinceLastVault >= minutesToVault) {
    return `Raidable`;
  }

  const minutesRemaining = minutesToVault - minutesSinceLastVault;
  const hours = Math.floor(minutesRemaining / 60);
  const minutes = Math.floor(minutesRemaining % 60);
  if (hours > 0) {
    return `Raidable in ${hours}h ${minutes}m`;
  } else {
    return `Raidable in ${minutes}m`;
  }
};

const getCoordinates = (id: number) => {
  return RealmsData.features.find((a) => a.id === id);
};

export const getTravelTime = ({ travellerId, destinationId }) => {
  const distance = (x1, y1, x2, y2) => {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  };

  const travellerCoordinates = getCoordinates(travellerId);
  const destinationCoordinates = getCoordinates(destinationId);

  const d = distance(
    travellerCoordinates?.xy[0],
    travellerCoordinates?.xy[1],
    destinationCoordinates?.xy[0],
    destinationCoordinates?.xy[1]
  ).toFixed(2);

  return { distance: d, time: parseInt(d) * SECONDS_PER_KM };
};

export const getTravelArcs = (location: number, assets: number[]) => {
  return assets.map((a) => {
    return {
      source: getCoordinates(location)?.xy,
      target: getCoordinates(a)?.xy,
      value: 2,
      gain: 3,
      quantile: 1,
    };
  });
};

export const isYourRealm = (
  realm: RealmFragmentFragment,
  account?: string,
  starkAccount?: string
) =>
  (account &&
    (account.toLowerCase() === realm.owner ||
      account.toLowerCase() === realm.bridgedOwner)) ||
  (starkAccount &&
    (starkAccount.toLowerCase() === realm.ownerL2 ||
      starkAccount.toLowerCase() === realm.settledOwner));

export const isFavourite = (
  realm: RealmFragmentFragment,
  favouriteRealms: number[]
) => favouriteRealms.indexOf(realm.realmId) > -1;
