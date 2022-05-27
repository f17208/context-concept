import { Dispatch, SetStateAction } from 'react';
import { SharedMenuConfig } from './shared-menu.context';

export const updateMenuConfig = (
  id: string,
  config: Partial<SharedMenuConfig>,
  setMenus: Dispatch<SetStateAction<Record<string, SharedMenuConfig>>>,
) => {
  setMenus(currentMenus => ({
    ...currentMenus,
    [id]: {
      ...currentMenus[id],
      ...config,
    },
  }));
}

export const setMenuConfig = (
  id: string,
  config: Partial<SharedMenuConfig>,
  setMenus: Dispatch<SetStateAction<Record<string, SharedMenuConfig>>>,
) => {
  setMenus(currentMenus => ({
    ...currentMenus,
    [id]: config,
  }));
}

export const showMenu = (
  id: string,
  menus: Record<string, SharedMenuConfig>,
  activeMenuId: string | null,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) => {
  const isAlreadyShown = activeMenuId === id;

  if (!isAlreadyShown) {
    setActiveMenuId(id);

    const onShow = !isAlreadyShown && menus[id]?.onShow;
    if (onShow) {
      onShow();
    }
  }
};

export const clearMenu = (
  id: string,
  menus: Record<string, SharedMenuConfig>,
  setMenus: Dispatch<SetStateAction<Record<string, SharedMenuConfig>>>,
) => {
  const onClear = menus[id]?.onClear;

  const newMenus = { ...menus };
  delete newMenus[id];
  setMenus(newMenus);

  if (onClear) {
    onClear();
  }
};

export const hideMenu = (
  id: string,
  menus: Record<string, SharedMenuConfig>,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) => {
  const onHide = menus[id]?.onHide;

  setActiveMenuId(activeId => {
    if (activeId !== id) {
      return activeId; // no-op
    }
    return null; // actually hide
  });

  if (onHide) {
    onHide();
  }
};

export const hideActiveMenu = (
  hideMenuFn: (
    id: string,
    menus: Record<string, SharedMenuConfig>,
    setActiveMenuId: Dispatch<SetStateAction<string | null>>,
  ) => void,
  activeMenuId: string | null,
  menus: Record<string, SharedMenuConfig>,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) => {
  if (activeMenuId) hideMenuFn(activeMenuId, menus, setActiveMenuId);
};

// this should be moved in a separate file/folder, just quick-prototyping now, ok?
export function getPosition(
  target: HTMLElement,
  align: 'right' | 'bottom',
) {
    let x, y;
    switch (align) {
      case 'right': // exactly to the right of the target element
        x = target.offsetLeft + target.offsetWidth;
        y = target.offsetTop;
        break;
      case 'bottom': // exactly below the target element
        x = target.offsetLeft;
        y = target.offsetTop + target.offsetHeight;
        break;    
    }
    return { x , y };
}