import { FC, ReactNode, useContext } from 'react';
import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import { SharedMenuCtx } from './shared-menu/shared-menu.context';

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
  const { useSharedMenu } = useContext(SharedMenuCtx);
  const { isActive, toggle, config, hide } = useSharedMenu(id);
  const { x, y } = config?.position || {};

  return (
    <Dropdown
      onMouseLeave={() => hideOnLeave && hide()}
      style={{ position: 'fixed', top: y, left: x }}
      isOpen={isActive}
      toggle={toggle}
    >
      <DropdownMenu>
        <DropdownItem>Dummy Action A {id}</DropdownItem>
        <DropdownItem>Dummy Action B {id}</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
