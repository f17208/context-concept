import { FC, ReactNode, useContext } from 'react';
import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import { SharedMenuCtx } from './shared-menu.context';

export interface SharedMenuProps {
  id: string;
  children?: ReactNode;
}

// The nice part is that this component here is part of the application logics
// not of the "library" itself.
export const SharedMenu: FC<SharedMenuProps> = ({
  id,
}) => {
  const { useSharedMenu } = useContext(SharedMenuCtx);
  const { isActive, toggle, config } = useSharedMenu(id);
  
  const { x, y } = config?.position || {};

  return (
    <Dropdown
      style={{ position: 'fixed', top: y, left: x }}
      isOpen={isActive}
      onClick={e => e.preventDefault()}
      toggle={toggle}
    >
      <DropdownMenu>
        <DropdownItem>Dummy Action {id}</DropdownItem>
        <DropdownItem>Dummy Action {id}</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
