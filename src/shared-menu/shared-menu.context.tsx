import {
  FC,
  createContext,
  useState,
  useCallback,
  useMemo,
  Context,
} from 'react';

// the basic attributes of each menu's configuration
export interface ISharedMenuConfig {
  // in theory, since this is not part of the menu's lifecycle, it could be moved into custom props
  // but it could also stay here because we probably want to have it without redefining it every time
  position?: {
    x: number;
    y: number;
  };
  // can be added more (i.e. onUpdate)
  onShow?: () => void;
  onHide?: () => void;
  onClear?: () => void;
}

// the interface exposed by useSharedMenu
export interface IUseSharedMenu<T> {
  isActive: boolean;
  config: ISharedMenuConfig | null;
  customProps: T | null;
  show: (config?: Partial<ISharedMenuConfig>) => void;
  setConfig: (config: Partial<ISharedMenuConfig>, update?: boolean) => void; // sets whole new config for menu, without showing
  setCustomProps: (customProps: T, update?: boolean) => void;
  hide: () => void;
  toggle: () => void;
  clear: () => void;
}

// the interface exposed by useContext
export interface ISharedMenuCtx<T> {
  activeMenuId: string | null;
  hideActive: () => void;
  useSharedMenu: (id: string, config?: Partial<ISharedMenuConfig>) => IUseSharedMenu<T>;
}

// we need a function for creating the context with generics, and passing it the default custom props
export function createSharedMenuCtx<T>(defaultCustomProps?: T) {
  const defaultState = {
    activeMenuId: null,
    hideActive: () => undefined,
    useSharedMenu: () => ({
      isActive: false,
      config: null,
      customProps: defaultCustomProps || null,
      show: () => void 0,
      setConfig: () => void 0,
      setCustomProps: () => void 0,
      hide: () => void 0,
      toggle: () => void 0,
      clear: () => void 0,
    })
  };

  return createContext<ISharedMenuCtx<T>>(defaultState);
}

export interface ISharedMenuProviderProps {
  children: JSX.Element;
}

export function getSharedMenuProvider<T>(SharedMenuCtx: Context<ISharedMenuCtx<T>>) {
  const SharedMenuProvider: FC<ISharedMenuProviderProps> = ({
    children,
  }) => {
    type MenuType = Record<string, {
      config: ISharedMenuConfig;
      customProps: T;
    }>;

    const [menus, setMenus] = useState<MenuType>({});
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
    const setConfig = useCallback((id: string, config?: Partial<ISharedMenuConfig>, update?: boolean) => {
      setMenus(currentMenus => ({
        ...currentMenus,
        [id]: { 
          ...currentMenus[id],
          config: update 
            ? { ...currentMenus[id]?.config, ...config } // merge
            : config, // replace
        },
      }) as MenuType);
    }, [setMenus]);
  
    const setCustomProps = useCallback((id: string, customProps?: T | null, update?: boolean) => {
      setMenus(currentMenus => ({
        ...currentMenus,
        [id]: { 
          ...currentMenus[id],
          customProps: update 
            ? { ...currentMenus[id]?.customProps, ...customProps } // merge
            : customProps, // replace
        },
      }) as MenuType);
    }, [setMenus]);
  
    const show = useCallback((id: string, config?: Partial<ISharedMenuConfig>) => {
      if (config) {
        setConfig(id, config, true);
      }
      const isAlreadyShown = activeMenuId === id;

      if (!isAlreadyShown) {
        setActiveMenuId(id);
    
        const onShow = !isAlreadyShown && menus[id]?.config?.onShow;
        if (onShow) {
          onShow();
        }
      }
    }, [activeMenuId, setConfig, setActiveMenuId, menus]);
  
    const clear = useCallback((id: string) => {
      const onClear = menus[id]?.config?.onClear;

      const newMenus = { ...menus };
      delete newMenus[id];
      setMenus(newMenus);

      if (onClear) {
        onClear();
      }
    }, [setMenus, menus]);
  
    const hide = useCallback((id: string) => {
      const onHide = menus[id]?.config?.onHide;

      setActiveMenuId(activeId => {
        if (activeId !== id) {
          return activeId; // no-op
        }
        return null; // actually hide
      });

      if (onHide) {
        onHide();
      }
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

    const useSharedMenu = useCallback((id: string) => {  
      return {
        isActive: activeMenuId === id,
        config: menus[id]?.config || null,
        customProps: menus[id]?.customProps || null,
        show: (config?: Partial<ISharedMenuConfig>) => show(id, config || {}),
        hide: () => hide(id),
        toggle: () => toggle(id),
        clear: () => clear(id),
        setConfig: (config: Partial<ISharedMenuConfig>, update?: boolean) => setConfig(id, config, update),
        setCustomProps: (customProps: T, update?: boolean) => setCustomProps(id, customProps, update),
      };
    }, [
      menus, 
      activeMenuId, 
      show,
      hide, 
      toggle, 
      clear,
      setCustomProps,
      setConfig,
    ]);
  
    // this will be accessible via useContext
    const value = useMemo<ISharedMenuCtx<T>>(() => ({
      hideActive,
      activeMenuId,
      useSharedMenu,
    }), [
      hideActive,
      activeMenuId,
      useSharedMenu,
    ]);
  
    return (
      <SharedMenuCtx.Provider value={value}>
        {children}
      </SharedMenuCtx.Provider>
    );
  };

  return SharedMenuProvider;
}


