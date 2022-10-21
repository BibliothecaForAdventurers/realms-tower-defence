import { Button } from '@bibliotheca-dao/ui-lib/base';
import Ouroboros from '@bibliotheca-dao/ui-lib/icons/ouroboros.svg';
import { useStarknet } from '@starknet-react/core';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  projectID,
  stableDiffusionEndPoints,
  traits,
} from '@/constants/character';
import { rgbDataURL } from '@/shared/ImageLoader';
import type {
  ImageResponse,
  SelectButton,
  SelectItem,
  SelectProps,
} from '@/types/index';

export const OptionSelect = (props: SelectItem & SelectButton) => {
  return (
    <button
      disabled={props.disabled}
      onClick={() =>
        props.add?.({
          title: props.title,
          value: props.value,
          selector: props.selector,
        })
      }
      className={`w-auto px-4 py-2 uppercase border cardthin font-display hover:bg-cta-100 duration-150 transition-all    ${
        props.active ? 'bg-cta-100' : 'bg-black/80'
      }`}
    >
      {props.title}
    </button>
  );
};

export const Select = (props: SelectProps) => {
  return (
    <div className="my-2">
      <h3 className="self-center mr-4">{props.title}</h3>
      <div className="flex flex-wrap my-1">
        {props.items.map((a, i) => {
          const active =
            props.selected.filter((b) => b.value == a.value).length > 0
              ? true
              : false;

          return (
            <OptionSelect
              key={i}
              active={active}
              value={a.value}
              title={a.title}
              add={props.add}
              selector={props.title}
              disabled={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export const Creation = () => {
  const { account } = useStarknet();
  const [selectedTraits, setSelectedTraits] = useState<SelectItem[]>([]);
  const [rulers, setRulers] = useState<ImageResponse[]>();

  const [selectedRuler, setSelectedRuler] = useState<ImageResponse>();
  const [loading, setLoading] = useState(false);

  const onSelectedTrait = (value) => {
    const index = selectedTraits.findIndex(
      (id: SelectItem) => id.value === value.value
    );
    const sameKey = selectedTraits.findIndex(
      (id: SelectItem) => id.selector === value.selector
    );

    if (index !== -1) {
      setSelectedTraits([
        ...selectedTraits.slice(0, index),
        ...selectedTraits.slice(index + 1),
      ]);
    } else if (sameKey !== -1) {
      setSelectedTraits([
        ...selectedTraits.slice(0, sameKey),
        ...selectedTraits.slice(sameKey + 1),
      ]);
      setSelectedTraits((current) => [...current, value]);
    } else {
      setSelectedTraits((current) => [...current, value]);
    }
  };

  const prompt = () => {
    const one = 'intricate intense symmetry! portrait of a ';
    const end =
      'desert background,  dramatic lighting, fantasy, d&d, perfection, dune, greg rutkowski, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha';

    const sex = selectedTraits.find((a) => a.selector == 'sex')?.value + ' ';
    const race = selectedTraits.find((a) => a.selector == 'race')?.value;
    const skin =
      ' with ' + selectedTraits.find((a) => a.selector == 'skin')?.value + ' ';
    const hair = selectedTraits.find((a) => a.selector == 'hair')?.value + ',';
    const eyes = selectedTraits.find((a) => a.selector == 'eyes')?.value + ',';
    const occupation =
      selectedTraits.find((a) => a.selector == 'occupation')?.value + ',';
    const pattern =
      ' and ' +
      selectedTraits.find((a) => a.selector == 'patterns')?.value +
      ',';

    return one + sex + race + skin + pattern + hair + eyes + occupation + end;
  };

  const fetchPlayers = async () => {
    console.log(prompt());

    setLoading(true);

    const body = {
      project: projectID,
      user: account,
      collection: 'first_collection',
      generation_settings: {
        prompt: prompt(),
        n_images: 9,
        steps: 32,
        height: 512,
        width: 512,
      },
    };

    try {
      const res = await axios.post(
        process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API +
          stableDiffusionEndPoints.generate,
        body
      );
      console.log(res);

      const obj: ImageResponse[] = res.data.map((a) => {
        return { img: a.uri, seed: a.seed };
      });

      setRulers(obj);
    } catch (error: any) {
      toast(error.message, {
        duration: 1000,
        position: 'top-center',
      });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="grid grid-cols-3 gap-8">
        <div className="p-10 ">
          <h2>Traits</h2>
          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="sex"
            items={traits.sex}
            selected={selectedTraits}
          />
          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="race"
            items={traits.race}
            selected={selectedTraits}
          />
          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="skin"
            items={traits.skin}
            selected={selectedTraits}
          />
          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="hair"
            items={traits.hair}
            selected={selectedTraits}
          />
          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="eyes"
            items={traits.eyes}
            selected={selectedTraits}
          />
          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="occupation"
            items={traits.occupation}
            selected={selectedTraits}
          />

          <Select
            add={(value) => {
              onSelectedTrait(value);
            }}
            title="patterns"
            items={traits.patterns}
            selected={selectedTraits}
          />
          <div className="flex w-full">
            <Button
              loading={loading}
              onClick={() => fetchPlayers()}
              className="w-full"
              variant="primary"
              size="lg"
              disabled={!account}
            >
              find rulers
            </Button>
          </div>
        </div>
        <div className="p-10 ">
          <h1 className="mb-20 text-center">Your Ruler</h1>
          <div className="relative border card">
            {selectedRuler && !loading && rulers ? (
              <Image
                width={500}
                placeholder="blur"
                blurDataURL={rgbDataURL(20, 20, 20)}
                loading="lazy"
                layout={'responsive'}
                height={500}
                className={'w-72 h-72 mx-auto paper'}
                src={selectedRuler?.img || rulers[0]?.img}
              />
            ) : (
              <Image
                width={500}
                placeholder="blur"
                blurDataURL={rgbDataURL(20, 20, 20)}
                loading="lazy"
                layout={'responsive'}
                height={500}
                className={'w-72 h-72 mx-auto paper'}
                src={'/stableai/archanist.png'}
              />
            )}
            {loading && (
              <div className="absolute top-0 flex justify-center w-full h-full bg-black/60">
                <div className="self-center text-4xl font-display animate-pulse">
                  <Ouroboros className="block w-20 mx-auto fill-current" />
                  Finding Rulers...
                </div>
              </div>
            )}

            {/* <h4>seed: {selectedRuler && selectedRuler.seed}</h4> */}
          </div>
          <div>
            <input
              className="block w-full p-3 px-3 py-2 mt-1 text-xl border border-4 rounded-md shadow-sm font-display border-slate-300 placeholder-stone-300 focus:outline-none focus:border-black focus:ring-black focus:ring-1 bg-black/50 card"
              type="text"
              placeholder="enter a name for your ruler...."
            />
          </div>
          {/* <div className="flex w-full my-10">
            <Button
              loading={loading}
              className="w-full"
              variant="primary"
              size="lg"
            >
              {loading ? 'loading' : 'hire ruler'}
            </Button>
          </div> */}
          <div className="my-2">
            {selectedTraits.map((a, i) => {
              return (
                <OptionSelect
                  key={i}
                  active={true}
                  value={a.value}
                  title={a.title}
                  add={(value) => {
                    onSelectedTrait(value);
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="p-10 ">
          <h2 className="mb-20 text-center ">Potentials candidates</h2>
          <div className="grid grid-cols-3 gap-4">
            {rulers?.map((a, i) => {
              return (
                <div key={i} className="relative">
                  {!loading ? (
                    <Image
                      width={200}
                      height={200}
                      placeholder="blur"
                      blurDataURL={rgbDataURL(20, 20, 20)}
                      loading="lazy"
                      layout={'responsive'}
                      className={
                        'w-32 h-32 mx-auto  hover:opacity-50 paper card border rounded-full'
                      }
                      src={a.img}
                      onClick={() => setSelectedRuler(a)}
                    />
                  ) : (
                    <Image
                      width={200}
                      height={200}
                      placeholder="blur"
                      blurDataURL={rgbDataURL(20, 20, 20)}
                      loading="lazy"
                      layout={'responsive'}
                      className={
                        'w-32 h-32 mx-auto  hover:opacity-50 paper card border rounded-full'
                      }
                      src={'/stableai/archanist.png'}
                      onClick={() => setSelectedRuler(a)}
                    />
                  )}
                  {loading && (
                    <div className="absolute top-0 flex justify-center w-full h-full rounded-full bg-black/60">
                      <div className="self-center text-1xl font-display animate-pulse">
                        <Ouroboros className="block w-20 mx-auto fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};