import { Dispatch, SetStateAction } from 'react';
import { SharedMenuConfig, ShowProps } from './shared-menu.context';

export const showMenu = (
  id: string,
  config: ShowProps,
  menus: Record<string, SharedMenuConfig>,
  setMenus: Dispatch<SetStateAction<Record<string, SharedMenuConfig>>>,
  activeMenuId: string | null,
  setActiveMenuId: Dispatch<SetStateAction<string | null>>,
) => {
  const isAlreadyShown = activeMenuId === id;

  const newConfig = {
    ...menus[id], // old config
    ...config, // update config
  };

  // handle missing data
  if (!newConfig.position) {
    newConfig.position = { x: 0, y: 0 };
  }
  if (!newConfig.body) {
    newConfig.body = null;
  }

  setMenus(currentMenus => ({
    ...currentMenus,
    [id]: newConfig,
  }));

  if (!isAlreadyShown) {
    setActiveMenuId(id);

    const onShow = !isAlreadyShown && menus[id]?.onShow;
    if (onShow) {
      onShow(menus[id]);
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
