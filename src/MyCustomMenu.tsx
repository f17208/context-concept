import { FC, ReactNode } from 'react';
import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import { useSharedMenu } from './shared-menu/shared-menu.hooks';
import { MyCustomData, MyCustomDataContextMenuCtx } from './types';

export interface MyCustomMenuProps {
  id: string;
  hideOnLeave?: boolean;
  children?: ReactNode;
}

// The nice part is that this component here is part of the application logics
// not of the "library" itself, and the integration is minimal.
export const MyCustomMenu: FC<MyCustomMenuProps> = ({
  id,
  hideOnLeave,
}) => {
  const { isActive, toggle, config, hide } = useSharedMenu<MyCustomData>(id, MyCustomDataContextMenuCtx);
  const { x, y } = config?.position || {};

  return (
    <Dropdown
      onMouseLeave={() => hideOnLeave && hide()}
      style={{ position: 'fixed', top: y, left: x }}
      isOpen={isActive}
      toggle={toggle}
    >
      <DropdownMenu>
        <DropdownItem>Dummy Action 1 {id}</DropdownItem>
        <DropdownItem>Dummy Action 2 {id}</DropdownItem>
        {config?.customProps?.userId && <DropdownItem>Logout</DropdownItem>}
      </DropdownMenu>
    </Dropdown>
  );
};
