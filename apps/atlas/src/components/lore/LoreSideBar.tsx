import { twMerge } from 'tailwind-merge';
import { BaseSideBarPanel } from '@/components/ui/sidebar/BaseSideBarPanel';
import { sidebarClassNames } from '@/constants/ui';
import { LoreProvider } from '@/context/LoreContext';
import AtlasSideBar from '../map/AtlasSideBar';
import { LorePanel } from './LorePanel';

type LoreSideBarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const LoreSideBar = ({ isOpen, onClose }: LoreSideBarProps) => {
  return (
    <AtlasSideBar
      position="right"
      isOpen={isOpen}
      containerClassName="z-30 right-0 top-0 left-0 bottom-0 m-8 lg:my-20 lg:ml-20 !p-0"
      overflowHidden={true}
      onClose={onClose}
    >
      <LoreSideBarPanel />
    </AtlasSideBar>
  );
};

type LoreSideBarPanelProps = {
  onClose?: () => void;
};
export const LoreSideBarPanel = (props: LoreSideBarPanelProps) => {
  return (
    <BaseSideBarPanel className="z-50 bg-cover !pt-0" position="left">
      <LoreProvider>
        <LorePanel />
      </LoreProvider>
    </BaseSideBarPanel>
  );
};
