import { IconButton } from '@bibliotheca-dao/ui-lib';
import ZoomReset from '@bibliotheca-dao/ui-lib/icons/zoom-reset.svg';
import { OrbitControls, Cloud, Stars, Sky, Html } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type BN from 'bn.js';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, { useRef, useState, useMemo, Suspense } from 'react';
import type * as THREE from 'three';
import { Vector3 } from 'three';
import useHealth from '@/hooks/desiege/useHealth';
import useShield from '@/hooks/desiege/useShield';
import type { GameStatus } from '@/types/index';
import { Shield } from './three/Shield';

import {
  ShieldVitalityDisplay,
  ShieldVitalityDisplayClassnames,
  CityVitalityDisplay,
} from './TowerShieldVitality';
const Tower = dynamic(() => import('@/components/minigame/three/DivineCity'), {
  ssr: false,
});

export interface TowerProps {
  gameStatus?: GameStatus;
  gameIdx?: number;
}

const origin: { position?: Vector3 } = {
  position: new Vector3(0, -2, 0),
};

function CityModel(props: TowerProps) {
  const [rotate, setRotate] = useState(true);
  const tower = useRef<THREE.Group>(null!);
  const shield = useRef<THREE.Mesh>(null!);
  const orbitControlsRef = useRef<any>();

  function resetCamera() {
    if (orbitControlsRef) {
      orbitControlsRef.current.reset();
    }
  }
  const shieldValue = useShield({
    gameIdx: props.gameIdx,
  });

  const healthValue = useHealth({
    gameIdx: props.gameIdx,
  });

  const h = useMemo<number | undefined>(() => {
    return healthValue?.data?.toNumber();
  }, [healthValue.data]);

  return (
    <div className="absolute top-0 w-full h-screen z-1">
      <IconButton
        aria-label="Bank"
        variant="unstyled"
        className="absolute z-30 h-full text-blue-700 fill-current right-8 "
        texture={false}
        onClick={resetCamera}
        icon={<ZoomReset className="w-6" />}
        size="lg"
      />
      <Canvas linear shadows camera={{ position: [3, 7, 10] }}>
        <Suspense fallback={null}>
          <sphereGeometry args={[10000, 32]} />
          <pointLight position={[100, 100, 50]} />
          <pointLight position={[-40, 50, 50]} />

          <ambientLight intensity={0.45} />
          <directionalLight args={[0xf7efb9, 8]} />
          <group
            ref={shield}
            position={[0, 0, 0]}
            onPointerOver={() => {
              setRotate(false);
            }}
            onPointerOut={() => {
              setRotate(true);
            }}
          >
            {healthValue.data && h !== undefined && h > 0 ? (
              <Shield jsx={origin} health={h} />
            ) : (
              ''
            )}
          </group>
          <OrbitControls
            autoRotate={true}
            enablePan={false}
            minZoom={90}
            maxZoom={20}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minPolarAngle={0}
            ref={orbitControlsRef}
          />
          <Cloud position={[-4, -2, -25]} speed={0.8} opacity={1} />
          <group ref={tower}>
            <Tower
              position={[0, -0.5, 0]}
              onPointerOver={() => {
                setRotate(false);
              }}
              receiveShadow
              onPointerOut={() => {
                setRotate(true);
              }}
            />
            {props.gameStatus == 'active' ? (
              <Html
                position={[-4.5, -0.3, 2]}
                className={classNames('w-56', ShieldVitalityDisplayClassnames)}
                occlude={[tower, shield]}
                zIndexRange={[4, 0]}
              >
                <ShieldVitalityDisplay
                  health={healthValue.data}
                  shield={shieldValue.data}
                />
              </Html>
            ) : null}
            {props.gameStatus == 'active' ? (
              <Html
                position={[4.5, 1, 2]}
                className={classNames('w-56', ShieldVitalityDisplayClassnames)}
                occlude={[tower, shield]}
                zIndexRange={[4, 0]}
              >
                <CityVitalityDisplay
                  health={healthValue.data}
                  shield={shieldValue.data}
                />
              </Html>
            ) : null}
          </group>
        </Suspense>

        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />
        <Sky
          azimuth={0.3}
          turbidity={2}
          rayleigh={0.3}
          inclination={0.8}
          distance={1000}
        />
      </Canvas>
    </div>
  );
}

// Wrap in React.memo so the same valued props
// don't cause a re-render
export default React.memo(CityModel);
