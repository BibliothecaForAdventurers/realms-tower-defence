import { useStarknet } from '@starknet-react/core';
import axios from 'axios';
import Image from 'next/image';

import { useMemo, useState } from 'react';
import { projectID, stableDiffusionEndPoints } from '@/constants/character';
import type { ImageResponse } from '@/types/index';

export const MyCreations = () => {
  const { account } = useStarknet();
  const [rulers, setRulers] = useState<ImageResponse[]>();
  const [selectedRuler, setSelectedRuler] = useState<ImageResponse>();
  const [loading, setLoading] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);

    const params = {
      project: projectID,
      user: account,
      collection: account,
    };
    const res = await axios.get(
      process.env.NEXT_PUBLIC_STABLE_DIFFUSION_API +
        stableDiffusionEndPoints.getImages,
      { params }
    );

    const obj: ImageResponse[] = res.data.map((a) => {
      return {
        img: a.uri,
        seed: a.generation_settings.seed,
        id: a.id,
        user: a.user,
        prompt: a.generation_settings.prompt,
      };
    });

    setRulers(obj);

    console.log(obj);
    setLoading(false);
  };
  useMemo(() => {
    fetchPlayers();
  }, [account]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-8">
        <div className="p-10 ">
          <div className="grid grid-cols-6 gap-4">
            {rulers?.map((a, i) => {
              return (
                <StableDiffusionImageWithMeta
                  key={i}
                  img={a.img}
                  seed={a.seed}
                  user={a.user}
                  prompt={a.prompt}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const StableDiffusionImageWithMeta = (props: ImageResponse) => {
  return (
    <div className="border">
      <Image
        width={200}
        height={200}
        layout={'responsive'}
        className={'w-32 h-32 mx-auto rounded-full hover:opacity-50'}
        src={props.img}
        // onClick={() => setSelectedRuler(a)}
      />
      <div className="p-2">
        {' '}
        <div>seed:{props.seed}</div>
        <div>{props.prompt}</div>
      </div>
    </div>
  );
};