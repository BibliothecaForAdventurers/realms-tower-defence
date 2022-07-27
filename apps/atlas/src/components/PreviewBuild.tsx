import { Card, CardTitle, CardStats } from '@bibliotheca-dao/ui-lib';
import Lords from '@bibliotheca-dao/ui-lib/icons/lords-icon.svg';
import { ExclamationCircleIcon, PlusIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
// import { formatEther } from '@ethersproject/units';
import { toBN } from 'starknet/dist/utils/number';
import { useResourcesContext } from '@/context/ResourcesContext';
import useResourcesDeficit from '@/hooks/settling/useResourcesDeficit';
import { ResourceIcon } from '@/shared/ResourceIcon';

interface BuildingProps {
  realmId: number;
  buildingId: number;
  buildingName: string;
  limit?: number | null;
  limitTraitId: number;
  limitTraitName: string;
  count: number;
  population: number;
  food: number;
  culture: number;
  buildingCost: {
    __typename?: 'BuildingCost';
    amount: number;
    resources: any;
  };
}

const CheckBuildRequirements = (props: { building?: BuildingProps }) => {
  const { building } = props;

  const [costs, setCosts] = useState<Record<number, string>>({});

  const { deficits, lordsBalance } = useResourcesDeficit({
    resourceCosts: costs,
  });
  // TODO: Retrieve from storage or indexer
  const buildingLordsCost = 60;

  useEffect(() => {
    if (building) {
      const costKeyed = {};
      building.buildingCost.resources.forEach((r) => {
        costKeyed[r.resourceId] = toBN(r.amount)
          .mul(toBN('1000000000000000000', 10))
          .toString();
      });
      setCosts(costKeyed);
    }
  }, [building]);

  if (building == undefined) {
    return null;
  }

  return (
    <div className="grid grid-flow-row grid-cols-4 gap-4">
      <h2 className="col-span-4 font-lords">{building.buildingName}</h2>

      <div className="flex items-center justify-between col-span-4">
        <h3>Resource Costs</h3>
        {deficits && Object.keys(deficits).length > 0 ? (
          <span className="relative px-2 text-orange-200 border border-orange-200 rounded-md">
            <ExclamationCircleIcon className="inline-block w-5 absolute -left-7 top-0.5" />{' '}
            {Object.keys(deficits).length} Resource Deficits
          </span>
        ) : null}
      </div>

      <div className="flex flex-row justify-between col-span-3 md:justify-around">
        {building.buildingCost.resources.map((r) => (
          <div
            key={r.resourceId}
            className="relative flex flex-col items-center"
          >
            {deficits[r.resourceId] ? (
              <ExclamationCircleIcon className="absolute w-4 text-orange-200 -top-2 -right-2" />
            ) : null}

            <ResourceIcon size="sm" resource={r.resourceName} />
            <p>{r.amount}</p>
          </div>
        ))}
      </div>
      <div className="relative flex flex-col items-center justify-center">
        <PlusIcon className="absolute left-0 w-6" />
        <Lords className="w-6" /> <span>{buildingLordsCost}</span>
      </div>
      {/*               
      <h3 className="col-span-4">Capacity</h3>

      <div className="col-span-2">
        <p>Current</p>
        <p>100sqm</p>
      </div>
      <div className="col-span-2">
        <p>After Build</p>
        <p>120sqm (within maximum)</p>
      </div>

      <h3 className="col-span-4">Effects</h3>
      <Card>
        <CardTitle>Happiness</CardTitle>
        <CardStats className="text-4xl">100</CardStats>
      </Card>
      <Card>
        <CardTitle>Culture</CardTitle>
        <CardStats className="text-4xl">{60}</CardStats>
      </Card>
      <Card className="">
        <CardTitle>Food</CardTitle>
        <CardStats className="text-4xl">{60}</CardStats>
      </Card>
      <Card className="">
        <CardTitle>Population</CardTitle>
        <CardStats className="text-4xl">{100}</CardStats>
      </Card>

      <h3 className="col-span-4">Military</h3>
      <Card>
        <CardTitle>Cooldown</CardTitle>
        <CardStats className='text-3xl'>+30%</CardStats>
      </Card>
      <Card>
        <CardTitle>Tier 1</CardTitle>
        <CardStats className='text-3xl'>Pikeman</CardStats>
      </Card>
      <Card>
        <CardTitle>Tier 2</CardTitle>
        <CardStats className='text-3xl'>Knight</CardStats>
      </Card>
      <Card>
        <CardTitle>Tier 3</CardTitle>
        <CardStats className='text-3xl'>Paladin</CardStats>
      </Card> */}
    </div>
  );
};

export default CheckBuildRequirements;