import { FC, ReactNode, useContext, useEffect, useMemo } from 'react';
import { Dropdown, DropdownItem, DropdownMenu } from 'reactstrap';
import { MyCustomDataContextMenuCtx } from './types';

export interface MyCustomMenuProps {
  id: string;
  hideOnLeave?: boolean;
  children?: ReactNode;
}

export const MyCustomMenu: FC<MyCustomMenuProps> = ({
  id,
  hideOnLeave,
}) => {
  const { useSharedMenu } = useContext(MyCustomDataContextMenuCtx);
  const { 
    isActive, 
    toggle, 
    customProps, 
    hide, 
    updateCustomProps, 
    addListener,
  } = useSharedMenu(id);

  const { x, y } = customProps?.position || {};
  const selectedRow = customProps?.row || null;
  const target = customProps?.target;

  const dropdownMenuId = useMemo(() => `${id}-dropdown-menu`, [id]);

  useEffect(() => {
    // clear custom props after hiding menu, if we don't want them to be available
    // the next time the menu is shown.
    const unsubscribeClearRow = addListener('onHide', () => {
      updateCustomProps({
        row: null,
        target: null,
      });
    });

    // a little bit tricky but we have good control on events' data
    // brings back the menu inside the viewport whenever it overflows
    const unsubscribeOnUpdate = addListener('onUpdate', (event) => {
      const { x, y } = (event as CustomEvent).detail.customProps?.position || {};

      const menuDimensions = document
        .getElementById(dropdownMenuId)?.getBoundingClientRect()
              
      if (x !== undefined && y !== undefined && menuDimensions) {
        const { width, height } = menuDimensions;
        const left = Math.min(x, window.innerWidth - width);
        const top = Math.min(y, window.innerHeight - height);
        if (x !== left || top !== y) {
          updateCustomProps({
            position: {
              x: left,
              y: top,
            }
          })
        }
      }
    })

    return function cleanup() {
      unsubscribeClearRow();
      unsubscribeOnUpdate();
    }
  }, [updateCustomProps, addListener, dropdownMenuId]);

  return (
    <Dropdown
      onMouseLeave={() => hideOnLeave && hide()}
      style={{ position: 'fixed', top: y, left: x, zIndex: 100 }}
      isOpen={isActive}
      toggle={(e: any) => {
        if (e.target.className !== 'dropdown-item') {
          toggle();
        }
      }}
    >
      <DropdownMenu onClick={toggle} id={dropdownMenuId}>
      {
        selectedRow
          ? <>
            <DropdownItem onClick={() => alert('shipped!')}>
              Ship {selectedRow.id}
            </DropdownItem>
            <DropdownItem onClick={() => alert('copied!')}>
              Copy order link
            </DropdownItem>
            {target && (
              <DropdownItem onClick={() => alert('copied!')}>
                Copy <i>"{(target as HTMLElement).innerText}"</i>
              </DropdownItem>
            )}
            <DropdownItem onClick={() => alert(`...a small step for ${selectedRow.parcels} parcels...`)}>
              Send {selectedRow.parcels} parcels into space
            </DropdownItem>
          </>
          : <>
            <DropdownItem onClick={() => alert('shipped all!')}>Ship all</DropdownItem>
            <DropdownItem onClick={() => alert('printed all!')}>Print all labels</DropdownItem>
          </>
      }
      </DropdownMenu>
    </Dropdown>
  );
};
