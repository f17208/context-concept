import {
  FC,
  createContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useEffect,
} from 'react';
import { clearMenu, hideMenu, showMenu } from './shared-menu.utils';

export interface SharedMenuConfig {
  body: ReactNode;
  position: {
    x: number;
    y: number;
  },
  onShow?: (config: SharedMenuConfig) => void;
  onHide?: () => void;
  onClear?: () => void;
}

export type ShowProps = Partial<SharedMenuConfig>;

export interface IUseSharedMenu {
  isActive: boolean;
  config: SharedMenuConfig | null;
  show: (config: ShowProps) => void;
  hide: () => void;
  clear: () => void;
}

export interface ISharedMenuCtx {
  zIndex: number;
  activeMenuId: string | null;
  show: (id: string, config: ShowProps) => void; // shows or updates Active menu
  hide: (id: string) => void;
  clear: (id: string) => void;
  hideActive: () => void;
  useSharedMenu: (id: string) => IUseSharedMenu;
}

export const defaultState = {
  zIndex: 100,
  activeMenuId: null,
  show: () => undefined,
  hide: () => undefined,
  clear: () => undefined,
  hideActive: () => undefined,
  useSharedMenu: () => ({
    isActive: false,
    config: null,
    show: () => undefined,
    hide: () => undefined,
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
  zIndex = defaultState.zIndex,
  hideOnScroll = true,
  isActive = true,
}) => {
  const [menus, setMenus] = useState<Record<string, SharedMenuConfig>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(defaultState.activeMenuId);

  const show = useCallback((id: string, config: ShowProps) => {
    showMenu(id, config, menus, setMenus, activeMenuId, setActiveMenuId);
  }, [setMenus, activeMenuId, setActiveMenuId, menus]);

  const clear = useCallback((id: string) => {
    clearMenu(id, menus, setMenus);
  }, [setMenus, menus]);

  const hide = useCallback((id: string) => {
    hideMenu(id, menus, setActiveMenuId);
  }, [setActiveMenuId, menus]);

  const hideActive = useCallback(() => {
    if (activeMenuId) hide(activeMenuId);
  }, [activeMenuId, hide]);

  const useSharedMenu = useCallback<(id: string) => IUseSharedMenu>((id) => {
    return {
      isActive: activeMenuId === id,
      config: menus[id] || null,
      show: (config: ShowProps) => show(id, config),
      hide: () => hide(id),
      clear: () => clear(id),
    };
  }, [menus]);

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
    zIndex,
    show,
    hide,
    clear,
    hideActive,
    useSharedMenu,
    activeMenuId,
  }), [
    zIndex,
    show,
    hide,
    clear,
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
