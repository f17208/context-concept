import { FC, ReactNode, useContext, useEffect, useRef } from 'react';
import { SharedMenuCtx } from './shared-menu.context';

export interface SharedMenuProps {
  id: string;
  children: ReactNode;
}

export const SharedMenu: FC<SharedMenuProps> = ({
  id,
  children,
}) => {
  const menuBodyContainer = useRef<HTMLDivElement>(null);
  const { useSharedMenu, zIndex } = useContext(SharedMenuCtx);
  const { isActive, config, show } = useSharedMenu(id);

  useEffect(() => {
    if (isActive) show({ body: children });
  }, [children, isActive, show]);

  if (!isActive || !config) return null;

  const { x, y } = config.position;

  return (
    <div
      ref={menuBodyContainer}
      id={id}
      className="fixed shadow-lg rounded-lg overflow-hidden SharedMenu-container"
      style={{
        top: y,
        left: x,
        zIndex,
        // TODO x > half page width? transform: translateX(-100%)
        // TODO y > half page width? transform: translateY(-100%)
      }}
    >
      {config?.body}
    </div>
  );
};
