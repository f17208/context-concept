import {
  FC,
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  Context,
} from 'react';

import { 
  clearMenu, 
  hideMenu, 
  showMenu, 
  setMenuConfig, 
  updateMenuConfig,
} from './shared-menu.utils';

export interface ISharedMenuConfig<T> {
  position?: {
    x: number;
    y: number;
  };
  customProps: T | null;
  // can be added more (i.e. onUpdate)
  onShow?: () => void;
  onHide?: () => void;
  onClear?: () => void;
}

export interface IUseSharedMenu<T> {
  isActive: boolean;
  config: ISharedMenuConfig<T> | null;
  show: (config?: Partial<ISharedMenuConfig<T>>) => void;
  setConfig: (config?: Partial<ISharedMenuConfig<T>>) => void; // sets whole new config for menu, without showing
  updateConfig: (config?: Partial<ISharedMenuConfig<T>>) => void; // updates new config for menu, without showing
  hide: () => void;
  toggle: () => void;
  clear: () => void;
}

export interface ISharedMenuCtx<T> {
  menus: Record<string, ISharedMenuConfig<T>>;
  activeMenuId: string | null;
  show: (id: string, config?: Partial<ISharedMenuConfig<T>>) => void; // shows and updates Active menu config
  setConfig: (id: string, config?: Partial<ISharedMenuConfig<T>>) => void; // sets whole new config for menu, without showing
  updateConfig: (id: string, config?: Partial<ISharedMenuConfig<T>>) => void; // updates new config for menu, without showing
  hide: (id: string) => void;
  toggle: (id: string) => void;
  clear: (id: string) => void;
  hideActive: () => void;
}


export function createSharedMenuCtx<T>(defaultCustomProps: T) {
  const defaultState = {
    menus: {},
    customProps: defaultCustomProps,
    activeMenuId: null,
    show: () => undefined,
    setConfig: () => undefined,
    updateConfig: () => undefined,
    hide: () => undefined,
    clear: () => undefined,
    toggle: () => undefined,
    hideActive: () => undefined,
  };

  return createContext<ISharedMenuCtx<T>>(defaultState);
}

export interface ISharedMenuProviderProps {
  children: JSX.Element;
  zIndex?: number;
  isActive?: boolean;
}

export function GetSharedMenuProvider<T>(SharedMenuCtx: Context<ISharedMenuCtx<T>>) {
  const SharedMenuProvider: FC<ISharedMenuProviderProps> = ({
    children,
    isActive = true,
  }) => {
    const [menus, setMenus] = useState<Record<string, ISharedMenuConfig<T>>>({});
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
    const setConfig = useCallback((id: string, config?: Partial<ISharedMenuConfig<T>>) => {
      setMenuConfig(id, config || {}, setMenus);
    }, [setMenus]);
  
    const updateConfig = useCallback((id: string, config?: Partial<ISharedMenuConfig<T>>) => {
      updateMenuConfig(id, config || {}, setMenus);
    }, [setMenus]);
  
    const show = useCallback((id: string, config?: Partial<ISharedMenuConfig<T>>) => {
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
  
    // this will be accessible via useContext
    const value = useMemo<ISharedMenuCtx<T>>(() => ({
      menus,
      show,
      hide,
      clear,
      toggle,
      setConfig,
      updateConfig,
      hideActive,
      activeMenuId,
    }), [
      menus,
      show,
      hide,
      clear,
      setConfig,
      updateConfig,
      toggle,
      hideActive,
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

  return SharedMenuProvider;
}


