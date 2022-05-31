import {
  Button,
  Select,
  ResourceIcon,
  InputNumber,
  IconButton,
} from '@bibliotheca-dao/ui-lib';

import ChevronRight from '@bibliotheca-dao/ui-lib/icons/chevron-right.svg';
import Danger from '@bibliotheca-dao/ui-lib/icons/danger.svg';

import LordsIcon from '@bibliotheca-dao/ui-lib/icons/lords-icon.svg';
import { formatEther, parseEther } from '@ethersproject/units';
import { Switch } from '@headlessui/react';
import type { ValueType } from 'rc-input-number/lib/utils/MiniDecimal';

import { useState, useMemo } from 'react';
import type { ReactElement } from 'react';
import type { Resource } from '@/context/ResourcesContext';
import { useResourcesContext } from '@/context/ResourcesContext';
import { useApproveLordsForExchange } from '@/hooks/settling/useApprovals';
import { useSwapResources } from '@/hooks/useSwapResources';
import type { ResourceQty } from '@/hooks/useSwapResources';

type ResourceRowProps = {
  resource: Resource & ResourceQty;
  availableResources: Resource[];
  onResourceChange: (resourceId: number, newResourceId: number) => void;
  onQtyChange: (resourceId: number, qty: number) => void;
};

const displayRate = (rate: string) => {
  return (+formatEther(rate)).toFixed(4);
};

const calculateLords = (rate: string, qty: number) => {
  return +formatEther(rate) * qty;
};

const ResourceRow = (props: ResourceRowProps): ReactElement => {
  const [time, setTime] = useState<NodeJS.Timeout | null>(null);

  const handleValueChange = (newValue: ValueType | null) => {
    if (newValue === null) return;
    if (time) {
      clearTimeout(time);
    }
    let timerId: NodeJS.Timeout | null = null;
    timerId = setTimeout(() => {
      props.onQtyChange(
        props.resource.resourceId,
        parseInt(newValue as string)
      ); /* updatePercentByValue(newValue); */
    }, 500);
    setTime(timerId);
  };
  const handleSelectChange = (newValue: number) => {
    props.onResourceChange(props.resource.resourceId, newValue);
  };
  return (
    <div className="flex p-3 mb-4 rounded shadow-inner bg-gray-900/50">
      <div className="sm:w-1/2">
        <Select
          optionIcons={true}
          value={props.resource?.resourceId}
          onChange={handleSelectChange}
        >
          <Select.Button
            label={props.resource?.resourceName ?? ''}
            variant={props.resource?.resourceName ? 'default' : 'placeholder'}
            icon={
              <ChevronRight className="w-5 h-5 text-white transform -rotate-90" />
            }
            labelIcon={
              <ResourceIcon
                size="sm"
                resource={props.resource?.resourceName ?? ''}
              />
            }
          />
          <Select.Options>
            {props.availableResources.map((resource, idx) => (
              <Select.Option
                key={idx}
                value={resource.resourceId}
                label={resource.resourceName}
                selectedIcon={<ChevronRight />}
                icon={
                  <ResourceIcon
                    size="sm"
                    resource={resource?.resourceName ?? ''}
                  />
                }
              />
            ))}
          </Select.Options>
        </Select>
        <div className="flex justify-between pt-1.5 text-xs uppercase">
          <div>balance: {formatEther(props.resource.amount)}</div>
          <div>1 = {displayRate(props.resource.rate)}</div>
        </div>
      </div>
      <div className="flex justify-end text-right sm:w-1/2">
        <div className="flex flex-col justify-between">
          <InputNumber
            value={props.resource.qty}
            inputSize="md"
            colorScheme="transparent"
            className="w-20 text-2xl font-semibold text-right shadow-[inset_0_3px_5px_0px_rgba(0,0,0,0.3)] mb-2 ml-auto"
            min={0}
            max={10000}
            stringMode // to support high precision decimals
            onChange={handleValueChange}
          />{' '}
          <div className="flex justify-end">
            <span className="mr-1">
              {calculateLords(props.resource.rate, props.resource.qty).toFixed(
                2
              )}
            </span>{' '}
            <LordsIcon className="w-5 h-5" />
          </div>
          <div className="flex justify-end">
            Your Current: 0
            <span className="mr-1">
              {/* This = current balance of LP tokens * Lords price of that token */}
            </span>{' '}
          </div>
        </div>
      </div>
    </div>
  );
};

export function LpMerchant(): ReactElement {
  const [enabled, setEnabled] = useState(false);

  const {
    buyTokens,
    invokeError,
    transactionHash,
    loading: isTransactionInProgress,
    transactionResult,
  } = useSwapResources();

  const {
    availableResourceIds,
    selectedSwapResourcesWithBalance,
    getResourceById,
    addSelectedSwapResources,
    removeSelectedSwapResource,
    updateSelectedSwapResourceQty,
    updateSelectedSwapResource,
  } = useResourcesContext();
  const { approveLords, isApproved: isLordsApprovedForExchange } =
    useApproveLordsForExchange();

  const [slippage, setSlippage] = useState(0.1);

  const calculatedTotalInLords = useMemo(() => {
    return selectedSwapResourcesWithBalance.reduce((acc, resource) => {
      return acc + calculateLords(resource.rate, resource.qty);
    }, 0);
  }, [selectedSwapResourcesWithBalance]);

  const calculatedSlippage = useMemo(() => {
    return calculatedTotalInLords * slippage;
  }, [calculatedTotalInLords, slippage]);

  function onBuyTokensClick() {
    if (calculatedTotalInLords === 0 || isTransactionInProgress) return;

    const tokenIds = selectedSwapResourcesWithBalance.map(
      (resource) => resource.resourceId
    );
    const tokenAmounts = selectedSwapResourcesWithBalance.map((resource) =>
      parseEther(String(resource.qty))
    );
    const maxAmount = parseEther(
      String(calculatedTotalInLords + calculatedSlippage)
    );

    const maxDate = new Date();
    maxDate.setMinutes(maxDate.getMinutes() + 30);
    const deadline = Math.floor(maxDate.getTime() / 1000);

    buyTokens(maxAmount, tokenIds, tokenAmounts, deadline);
  }

  console.log(transactionResult);
  return (
    <div className="flex flex-col justify-between h-full">
      {!isLordsApprovedForExchange && (
        <div>
          <Button className="w-full" variant="primary" onClick={approveLords}>
            APPROVE LORDS
          </Button>
        </div>
      )}

      <div>
        <div className="flex w-full mx-auto mb-8 tracking-widest">
          <div className={`px-4 uppercase ${enabled && 'font-semibold'}`}>
            Add LP
          </div>
          <Switch
            checked={enabled}
            onChange={setEnabled}
            className={`${
              enabled ? 'bg-green-600' : 'bg-blue-600'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">Enable notifications</span>
            <span
              className={`${
                enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white`}
            />
          </Switch>
          <div className={`px-4 uppercase ${!enabled && 'font-semibold'}`}>
            remove LP
          </div>
        </div>

        {selectedSwapResourcesWithBalance.map((resource) => (
          <div className="relative" key={resource.resourceId}>
            <ResourceRow
              key={resource.resourceId}
              resource={resource}
              availableResources={availableResourceIds.map(
                (resourceId) => getResourceById(resourceId) as Resource
              )}
              onResourceChange={updateSelectedSwapResource}
              onQtyChange={updateSelectedSwapResourceQty}
            />
            <IconButton
              className="absolute -top-3 -right-3"
              icon={<Danger className="w-3 h-3" />}
              aria-label="Remove Row"
              size="xs"
              onClick={() => removeSelectedSwapResource(resource.resourceId)}
            />
          </div>
        ))}
        <div className="flex w-full">
          <Button
            aria-label="Add Row"
            size="xs"
            variant="primary"
            className="mx-auto"
            onClick={() => addSelectedSwapResources()}
          >
            add +
          </Button>
        </div>
      </div>
      <div className="flex justify-end w-full pt-4">
        <div className="flex flex-col justify-end w-full">
          <div className="flex flex-col  rounded p-4 mb-5 bg-gray-500/70 shadow-[inset_0_6px_8px_0px_rgba(0,0,0,0.18)]">
            <div className="flex justify-end text-2xl font-semibold">
              <span className="mr-1">{calculatedTotalInLords.toFixed(2)}</span>
              <LordsIcon className="w-6 h-6 mt-0.5" />
            </div>
            <div className="flex justify-end text-md">
              {calculatedSlippage.toFixed(2)}
            </div>
          </div>

          <Button
            className="w-full"
            variant="primary"
            onClick={onBuyTokensClick}
            disabled={isTransactionInProgress || !isLordsApprovedForExchange}
          >
            {isTransactionInProgress
              ? 'Pending...'
              : enabled
              ? 'add liquidity'
              : 'remove liquidity'}
          </Button>
          <div className="my-2 text-center">
            Please make sure you understand the risks of impermanent loss before
            providing liquidity.
          </div>
        </div>
      </div>
    </div>
  );
}