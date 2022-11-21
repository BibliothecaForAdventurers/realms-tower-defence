import { Button } from '@bibliotheca-dao/ui-lib';
import Close from '@bibliotheca-dao/ui-lib/icons/close.svg';
import clsx from 'clsx';

interface BaseSideBarPanel {
  title?: string | null | undefined;
  children: React.ReactNode[] | React.ReactNode;
  position?: 'left' | 'right';
  onClose?: () => void;
}

export const BaseSideBarPanel = ({
  title,
  onClose,
  children,
  position,
}: BaseSideBarPanel) => {
  return (
    <div className="relative w-full">
      <div>
        <div className="flex w-full mb-2 justify-between">
          <h1>{title}</h1>
          <div
            className={clsx('self-center', position != 'left' && '-order-1')}
          >
            {onClose && (
              <Button
                size="xs"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  onClose();
                }}
              >
                <Close className="w-6 h-6" />
              </Button>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
