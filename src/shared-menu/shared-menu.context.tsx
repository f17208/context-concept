import {
  FC,
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { 
  clearMenu, 
  hideMenu, 
  showMenu, 
  setMenuConfig, 
  updateMenuConfig,
} from './shared-menu.utils';

export interface SharedMenuConfig {
  position?: {
    x: number;
    y: number;
  };
  // can be added more (i.e. onUpdate)
  onShow?: () => void;
  onHide?: () => void;
  onClear?: () => void;
}

export type ShowProps = Partial<SharedMenuConfig>;

export interface IUseSharedMenu {
  isActive: boolean;
  config: SharedMenuConfig | null;
  show: (config?: ShowProps) => void;
  setConfig: (config: ShowProps) => void; // sets whole new config for menu, without showing
  updateConfig: (config: ShowProps) => void; // updates new config for menu, without showing
  hide: () => void;
  toggle: () => void;
  clear: () => void;
}

export interface ISharedMenuCtx {
  activeMenuId: string | null;
  show: (id: string, config: ShowProps) => void; // shows and updates Active menu config
  setConfig: (id: string, config: ShowProps) => void; // sets whole new config for menu, without showing
  updateConfig: (id: string, config: ShowProps) => void; // updates new config for menu, without showing
  hide: (id: string) => void;
  toggle: (id: string) => void;
  clear: (id: string) => void;
  hideActive: () => void;
  useSharedMenu: (id: string, config?: Partial<SharedMenuConfig>) => IUseSharedMenu;
}

export const defaultState = {
  activeMenuId: null,
  show: () => undefined,
  setConfig: () => undefined,
  updateConfig: () => undefined,
  hide: () => undefined,
  clear: () => undefined,
  toggle: () => undefined,
  hideActive: () => undefined,
  useSharedMenu: () => ({
    isActive: false,
    config: null,
    show: () => undefined,
    setConfig: () => undefined,
    updateConfig: () => undefined,
    hide: () => undefined,
    toggle: () => undefined,
    clear: () => undefined,
  }),
};

export const SharedMenuCtx = createContext<ISharedMenuCtx>(defaultState);

export interface ISharedMenuProviderProps {
  children: JSX.Element;
  zIndex?: number;
  hideOnScroll?: boolean;
  isActive?: boolean;
}

export const SharedMenuProvider: FC<ISharedMenuProviderProps> = ({
  children,
  hideOnScroll = true,
  isActive = true,
}) => {
  const [menus, setMenus] = useState<Record<string, SharedMenuConfig>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(defaultState.activeMenuId);

  const setConfig = useCallback((id: string, config?: ShowProps) => {
    setMenuConfig(id, config || {}, setMenus);
  }, [setMenus]);

  const updateConfig = useCallback((id: string, config?: ShowProps) => {
    updateMenuConfig(id, config || {}, setMenus);
  }, [setMenus]);

  const show = useCallback((id: string, config?: ShowProps) => {
    if (config) {
      updateConfig(id, config);
    }
    showMenu(id, menus, activeMenuId, setActiveMenuId);
  }, [activeMenuId, updateConfig, setActiveMenuId, menus]);

  const clear = useCallback((id: string) => {
    clearMenu(id, menus, setMenus);
  }, [setMenus, menus]);

  const hide = useCallback((id: string) => {
    hideMenu(id, menus, setActiveMenuId);
  }, [setActiveMenuId, menus]);

  const toggle = useCallback((id: string) => {
    if (id === activeMenuId) {
      hide(id);
    } else {
      show(id);
    }
  }, [activeMenuId, show, hide]);

  const hideActive = useCallback(() => {
    if (activeMenuId) hide(activeMenuId);
  }, [activeMenuId, hide]);

  const useSharedMenu = useCallback<
    (id: string) => IUseSharedMenu
  >((id) => {
    return {
      isActive: activeMenuId === id,
      config: menus[id] || null,
      show: (config?: ShowProps) => show(id, config),
      hide: () => hide(id),
      toggle: () => toggle(id),
      clear: () => clear(id),
      setConfig: (config: SharedMenuConfig) => setConfig(id, config),
      updateConfig: (config: SharedMenuConfig) => updateConfig(id, config),
    };
  }, [
    menus, 
    activeMenuId, 
    show,
    hide, 
    toggle, 
    clear,
    setConfig,
    updateConfig,
  ]);

  const doHideOnScroll = useCallback(() => {
    if (hideOnScroll) hideActive();
  }, [hideActive, hideOnScroll]);

  // // add/remove event listeners
  useEffect(() => {
    window.addEventListener('scroll', doHideOnScroll, false);
    return function cleanup() {
      window.removeEventListener('scroll', doHideOnScroll, false);
    };
  }, [doHideOnScroll]);

  // this will be accessible via useContext
  const value = useMemo<ISharedMenuCtx>(() => ({
    show,
    hide,
    clear,
    toggle,
    setConfig,
    updateConfig,
    hideActive,
    useSharedMenu,
    activeMenuId,
  }), [
    show,
    hide,
    clear,
    setConfig,
    updateConfig,
    toggle,
    hideActive,
    useSharedMenu,
    activeMenuId,
  ]);

  useEffect(() => {
    if (!isActive && Object.keys(menus).length) {
      setActiveMenuId(null);
    }
  }, [isActive, menus, setActiveMenuId]);

  return (
    <SharedMenuCtx.Provider value={value}>
      {children}
    </SharedMenuCtx.Provider>
  );
};