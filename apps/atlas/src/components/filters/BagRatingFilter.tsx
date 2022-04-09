import { Button } from '@bibliotheca-dao/ui-lib';
import { Popover } from '@headlessui/react';
import React, { useRef, useState } from 'react';
import { useOnClickOutsideElement } from '@/hooks/useOnClickOutsideElement';
import { RangeSliderFilter } from './RangeSliderFilter';

const GreatnessMax = 160;
const RatingMax = 720;

type BagRating = {
  bagRating: number;
  bagGreatness: number;
};

type BagRatingFilterProps = {
  rating: BagRating;
  onChange(rating: BagRating): void;
};

export function BagRatingFilter(props: BagRatingFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef(null);
  useOnClickOutsideElement(ref, () => {
    setIsOpen(false);
  });

  const onGreatnessFilterChange = (value: number) => {
    const updatedRating = { ...props.rating, bagGreatness: value };
    props.onChange(updatedRating);
  };

  const onRatingFilterChange = (value: number) => {
    const updatedRating = { ...props.rating, bagRating: value };
    props.onChange(updatedRating);
  };

  return (
    <Popover className="relative">
      <Button
        variant="primary"
        className="px-4 ml-2 uppercase"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Rating
      </Button>

      {isOpen && (
        <Popover.Panel className="absolute right-0 z-10 mt-4" ref={ref} static>
          <div className="flex flex-col gap-6 px-8 py-4 pb-10 font-medium text-white bg-black rounded shadow-sm w-60">
            <div className="text-lg text-center uppercase">Rating</div>
            <RangeSliderFilter
              name="Greatness"
              min={0}
              max={GreatnessMax}
              defaultValue={props.rating.bagGreatness}
              onChange={onGreatnessFilterChange}
            />
            <RangeSliderFilter
              name="Rating"
              min={0}
              max={RatingMax}
              defaultValue={props.rating.bagRating}
              onChange={onRatingFilterChange}
            />
          </div>
        </Popover.Panel>
      )}
    </Popover>
  );
}
