import { useAtlasContext } from '@/context/AtlasContext';
import { useUIContext } from '@/context/UIContext';
import { CryptSideBar } from '../crypts/CryptsSideBar';
import { GASideBar } from '../ga/GASideBar';
import { LootSideBar } from '../loot/LootSideBar';
import { RealmSideBar } from '../realms/RealmsSideBar';

export function AtlasSidebars() {
  const { mapContext } = useAtlasContext();

  const selectedAsset = mapContext.selectedAsset;

  const { assetSidebar, closeAsset } = useUIContext();

  return (
    <>
      <RealmSideBar
        realmId={selectedAsset?.id as string}
        isOpen={assetSidebar === 'realm'}
        onClose={closeAsset}
      />
      <LootSideBar
        lootId={selectedAsset?.id as string}
        isOpen={assetSidebar === 'loot'}
        onClose={closeAsset}
      />
      <CryptSideBar
        cryptId={selectedAsset?.id as string}
        isOpen={assetSidebar === 'crypt'}
        onClose={closeAsset}
      />
      <GASideBar
        gaId={selectedAsset?.id as string}
        isOpen={assetSidebar === 'ga'}
        onClose={closeAsset}
      />
    </>
  );
}