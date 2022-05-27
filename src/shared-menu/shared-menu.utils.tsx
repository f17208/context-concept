import { Dispatch, SetStateAction } from 'react';
import { ISharedMenuConfig } from './shared-menu.context';

export function updateMenuConfig<T>(
  id: string,
  config: Partial<ISharedMenuConfig<T>>,
  setMenus: Dispatch<SetStateAction<Record<string, ISharedMenuConfig<T>>>>,
) {
  setMenus(currentMenus => ({
    ...currentMenus,
    [id]: {
      ...currentMenus[id],
      ...config,
    },
  }));
}

export function setMenuConfig<T>(
  id: string,
  config: Partial<ISharedMenuConfig<T>>,
  setMenus: Dispatch<SetStateAction<Record<string, ISharedMenuConfig<T>>>>,
) {
  setMenus(currentMenus => ({
    ...currentMenus,
    [id]: config,
  }) as Record<string, ISharedMenuConfig<T>>);
}

export function showMenu<T>(
  id: string,
  menus: Record<string, ISharedMenuConfig<T>>,
  activeMenuId: string | null,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) {
  const isAlreadyShown = activeMenuId === id;

  if (!isAlreadyShown) {
    setActiveMenuId(id);

    const onShow = !isAlreadyShown && menus[id]?.onShow;
    if (onShow) {
      onShow();
    }
  }
};

export function clearMenu<T>(
  id: string,
  menus: Record<string, ISharedMenuConfig<T>>,
  setMenus: Dispatch<SetStateAction<Record<string, ISharedMenuConfig<T>>>>,
) {
  const onClear = menus[id]?.onClear;

  const newMenus = { ...menus };
  delete newMenus[id];
  setMenus(newMenus);

  if (onClear) {
    onClear();
  }
};

export function hideMenu<T>(
  id: string,
  menus: Record<string, ISharedMenuConfig<T>>,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) {
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

export function hideActiveMenu<T>(
  hideMenuFn: (
    id: string,
    menus: Record<string, ISharedMenuConfig<T>>,
    setActiveMenuId: Dispatch<SetStateAction<string | null>>,
  ) => void,
  activeMenuId: string | null,
  menus: Record<string, ISharedMenuConfig<T>>,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) {
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