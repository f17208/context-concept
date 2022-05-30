import {
  FC,
  createContext,
  useState,
  useCallback,
  useMemo,
  Context,
  ReactNode,
  useRef,
} from 'react';
import { EventHandler, EventHandlerOptions, MyEventEmitter } from './MyEventEmitter';

export type MenuEvents = 'onShow' | 'onHide' | 'onClear' | 'onUpdate';

// the interface exposed by useSharedMenu
export interface IUseSharedMenu<T> {
  isActive: boolean;
  customProps: T | null;
  show: (customProps?: Partial<T>) => void;
  setCustomProps: (customProps: T) => void;
  updateCustomProps: (customProps: Partial<T>) => void;
  hide: () => void;
  toggle: () => void;
  clear: () => void;
  addListener: (
    type: MenuEvents, 
    listener: EventHandler<T>,
    options?: EventHandlerOptions, 
  ) => (() => void);
}

// the interface exposed by useContext
export interface ISharedMenuCtx<T> {
  activeMenuId: string | null;
  hideActive: () => void;
  useSharedMenu: (id: string) => IUseSharedMenu<T>;
}

// we need a function for creating the context with generics, and passing the default custom props
export function createSharedMenuCtx<T>(defaultCustomProps?: T) {
  const defaultState = {
    eventCollector: null,
    activeMenuId: null,
    hideActive: () => void 0,
    clearAll: () => void 0,
    useSharedMenu: () => ({
      addListener: () => () => void 0,
      isActive: false,
      customProps: defaultCustomProps || null,
      show: () => void 0,
      setCustomProps: () => void 0,
      updateCustomProps: () => void 0,
      hide: () => void 0,
      toggle: () => void 0,
      clear: () => void 0,
    })
  };
  return createContext<ISharedMenuCtx<T>>(defaultState);
}

export interface ISharedMenuProviderProps {
  children: ReactNode;
}

export function getSharedMenuProvider<T>(SharedMenuCtx: Context<ISharedMenuCtx<T>>) {
  const SharedMenuProvider: FC<ISharedMenuProviderProps> = ({
    children,
  }) => {
    const [menus, setMenus] = useState<Record<string, T>>({});
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const eventEmitter = useRef(new MyEventEmitter<T>());

    const getEventType = useCallback((id: string, type: MenuEvents) => {
      // should never happen, but...
      if (type.includes(' ')) {
        throw new Error('Invalid event type: cannot contain spaces');
      }
      // we're using a space to separate id and type
      // because it's an illegal character for HTML ids, so it will never cause parsing errors
      return `${id} ${type}`;
    }, []);

    // adds a listener on a given event type, for a given menu (id)
    // returns an unsubscribe function you can call to remove the listener
    const addMenuEventListener = useCallback((
      id: string,
      type: MenuEvents, 
      listener: EventHandler<T>,
      options?: EventHandlerOptions,
    ) => {
      return eventEmitter.current?.onEvent(getEventType(id, type), listener, options);
    }, [getEventType]);

    // formats id+type properly & sets customProps as mandatory (T or null)
    // just to avoid forgetting it when the function is called, later on
    const fireEvent = useCallback((id: string, type: MenuEvents, customProps: T | null) => {
      return eventEmitter.current?.fireEvent(
        getEventType(id, type), 
        customProps || undefined,
      );
    }, [getEventType]);
  
    // replaces customProps for a given id with a brand new value
    const setCustomProps = useCallback((id: string, customProps: T) => {
      setMenus(currentMenus => {
        return {
          ...currentMenus,
          [id]: customProps,
        }
      });
      fireEvent(id, 'onUpdate', customProps);
    }, [setMenus, fireEvent]);

    // merges new customProps with the existing value
    const updateCustomProps = useCallback((id: string, customProps: Partial<T>) => {
      setMenus(currentMenus => {
        const toSet = { 
          ...currentMenus[id],
          ...customProps
        }
        fireEvent(id, 'onUpdate', toSet);
        return {
          ...currentMenus,
          [id]: toSet,
        }
      });
    }, [setMenus, fireEvent]);
  
    // shows the menu & updates customProps optionally
    const show = useCallback((id: string, customProps?: Partial<T>) => {
      if (customProps) {
        updateCustomProps(id, customProps);
      }

      const isAlreadyShown = activeMenuId === id;
      if (!isAlreadyShown) {        
        if (activeMenuId !== null) {
          fireEvent(activeMenuId, 'onHide', null);
        }
        setActiveMenuId(id);

        // expedient to have updated state
        setMenus(allMenus => {
          fireEvent(id, 'onShow', allMenus[id]);
          return allMenus;
        })
      }
    }, [activeMenuId, fireEvent, updateCustomProps, setActiveMenuId, setMenus]);
  
    // hides the menu
    const hide = useCallback((id: string) => {
      setActiveMenuId(activeId => {
        if (activeId !== id) {
          return activeId; // no-op
        }
        return null; // actually hide
      });

      fireEvent(id, 'onHide', null);
    }, [setActiveMenuId, fireEvent]);

    // hides the active menu, if any
    const hideActive = useCallback(() => {
      if (activeMenuId) hide(activeMenuId);
    }, [activeMenuId, hide]);
      
    // removes all customProps for the given menu
    const clear = useCallback((id: string) => {
      hide(id);

      const newMenus = { ...menus };
      delete newMenus[id];
      setMenus(newMenus);

      fireEvent(id, 'onClear', null);
    }, [setMenus, hide, fireEvent, menus]);

    // clears all menus
    const clearAll = useCallback(() => {
      hideActive();
      setMenus(allMenus => {
        const allIds = Object.keys(allMenus);
        allIds.map(id => fireEvent(id, 'onClear', null));
        return {};
      });
    }, [setMenus, fireEvent, hideActive]);
  
    // shows/hides the given menu
    const toggle = useCallback((id: string) => {
      if (id === activeMenuId) {
        hide(id);
      } else {
        show(id);
      }
    }, [activeMenuId, show, hide]);

    // useful hook returning all the functions to operate with a given menu, passed by id
    const useSharedMenu = useCallback((id: string) => {  
      return {
        isActive: activeMenuId === id,
        customProps: menus[id],
        show: (customProps?: Partial<T>) => show(id, customProps),
        hide: () => hide(id),
        toggle: () => toggle(id),
        clear: () => clear(id),
        setCustomProps: (customProps: T) => setCustomProps(id, customProps),
        updateCustomProps: (customProps: Partial<T>) => updateCustomProps(id, customProps),
        addListener: (
          type: MenuEvents, 
          listener: EventHandler<T>, 
          options?: EventHandlerOptions,
        ) => addMenuEventListener(id, type, listener, options),
      };
    }, [
      menus, 
      activeMenuId, 
      show,
      hide,
      addMenuEventListener,
      toggle, 
      clear,
      setCustomProps,
      updateCustomProps,
    ]);
  
    // this will be accessible via useContext
    const value = useMemo<ISharedMenuCtx<T>>(() => ({
      hideActive,
      activeMenuId,
      useSharedMenu,
      clearAll,
    }), [
      hideActive,
      activeMenuId,
      useSharedMenu,
      clearAll,
    ]);
  
    return (
      <SharedMenuCtx.Provider value={value}>
        {children}
      </SharedMenuCtx.Provider>
    );
  };

  return SharedMenuProvider;
}

