import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { animated, useSpring } from 'react-spring';
import { useUiSounds, soundSelector } from '@/hooks/useUiSounds';

type Prop = {
  isOpen: boolean;
  children: React.ReactNode[] | React.ReactNode;
  containerClassName?: string;
  container?: HTMLElement;
  position?: 'left' | 'right';
  isTransparent?: boolean;
  overflowHidden?: boolean;
};

const AtlasSidebar: React.FC<Prop> = (props: Prop) => {
  const { isOpen } = props;

  const { play: playOpenSidebar } = useUiSounds(soundSelector.openSidebar);
  const { play: playCloseSidebar } = useUiSounds(soundSelector.closeSidebar);

  useEffect(() => {
    if (isOpen) {
      playOpenSidebar();
    } else {
      playCloseSidebar();
    }
  }, [isOpen]);

  // Must wait until DOM is ready or might receive
  // Error: Target container is not a DOM element.
  const [domReady, setDomReady] = useState(false);
  useEffect(() => {
    setDomReady(true);
  }, []);

  if (!domReady) {
    return null;
  }

  return ReactDOM.createPortal(
    <animated.div
      className={clsx(
        'absolute top-0  bottom-0 border-white/30 rounded-3xl transition-all duration-500 ease-in-out',
        props.isTransparent
          ? 'bg-transparent'
          : 'bg-gray-1000 border-8  border-gray-900 shadow-xl shadow-yellow-800',
        props.containerClassName ? props.containerClassName : 'w-full md:w-1/2',
        props.position == 'left' ? 'left-0' : 'right-0',
        props.overflowHidden ? 'overflow-hidden' : 'overflow-y-auto',
        props.isOpen ? 'opacity-100' : 'opacity-0',
        props.isOpen
          ? 'translate-x-0'
          : props.position == 'left'
          ? '-translate-x-full'
          : 'translate-x-full'
      )}
    >
      {props.children}
    </animated.div>,
    props.container || document.getElementById('sidebar-root')!,
    'sidebar-root'
  );
};

export default AtlasSidebar;
