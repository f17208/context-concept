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
import { useEventEmitter } from './useEventEmitter';

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
    listener: EventListenerOrEventListenerObject, 
    options?: boolean | AddEventListenerOptions | undefined,
  ) => (() => void);
}

// the interface exposed by useContext
export interface ISharedMenuCtx<T> {
  activeMenuId: string | null;
  hideActive: () => void;
  useSharedMenu: (id: string) => IUseSharedMenu<T>;
}

// we need a function for creating the context with generics, and passing it the default custom props
export function createSharedMenuCtx<T>(defaultCustomProps?: T) {
  const defaultState = {
    eventCollector: null,
    activeMenuId: null,
    hideActive: () => void 0,
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

    const getCustomProps = useCallback((id: string) => {
      return menus[id] || null;
    }, [menus]);

    const getEventDetail = useCallback((eventType: string) => {
      const [id] = eventType.split(' '); // parse id from full event type (id+' '+type)
      return {
        customProps: getCustomProps(id),
      }
    }, [getCustomProps]);

    const eventCollector = useRef<HTMLDivElement | null>(null);
    const { onEvent, fireEvent: fire } = useEventEmitter(eventCollector, getEventDetail);

    const getEventType = useCallback((id: string, type: MenuEvents) => {
      // should never happen, but...
      if (type.includes(' ')) {
        throw new Error('Invalid event type: cannot contain spaces');
      }
      // we're using a space to separate id and type
      // because it's an illegal character for HTML ids, so it will never cause parsing errors
      return `${id} ${type}`;
    }, []);

    const addMenuEventListener = useCallback((
      id: string,
      type: MenuEvents, 
      listener: EventListenerOrEventListenerObject, 
      options?: boolean | AddEventListenerOptions | undefined,
    ) => {
      return onEvent(getEventType(id, type), listener, options);
    }, [onEvent, getEventType]);

    const fireEvent = useCallback((id: string, type: MenuEvents) => {
      return fire(getEventType(id, type));
    }, [fire, getEventType]);
  
    const setCustomProps = useCallback((id: string, customProps: T) => {
      setMenus(currentMenus => {
        return {
          ...currentMenus,
          [id]: customProps,
        }
      });

      fireEvent(id, 'onUpdate');
    }, [setMenus, fireEvent]);

    const updateCustomProps = useCallback((id: string, customProps: Partial<T> | null) => {
      setMenus(currentMenus => ({
        ...currentMenus,
        [id]: { 
          ...currentMenus[id],
          ...customProps
        },
      }));

      fireEvent(id, 'onUpdate');
    }, [setMenus, fireEvent]);
  
    const show = useCallback((id: string, customProps?: Partial<T>) => {
      if (customProps) {
        updateCustomProps(id, customProps);
      }

      const isAlreadyShown = activeMenuId === id;
      if (!isAlreadyShown) {        
        if (activeMenuId !== null) {
          fireEvent(activeMenuId, 'onHide');
        }
        setActiveMenuId(id);
        fireEvent(id, 'onShow');
      }
    }, [activeMenuId, fireEvent, updateCustomProps, setActiveMenuId]);
  
    const clear = useCallback((id: string) => {
      const newMenus = { ...menus };
      delete newMenus[id];
      setMenus(newMenus);

      fireEvent(id, 'onClear');
    }, [setMenus, fireEvent, menus]);
  
    const hide = useCallback((id: string) => {
      setActiveMenuId(activeId => {
        if (activeId !== id) {
          return activeId; // no-op
        }
        return null; // actually hide
      });

      fireEvent(id, 'onHide');
    }, [setActiveMenuId, fireEvent]);
  
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
        customProps: menus[id],
        show: (customProps?: Partial<T>) => show(id, customProps),
        hide: () => hide(id),
        toggle: () => toggle(id),
        clear: () => clear(id),
        setCustomProps: (customProps: T) => setCustomProps(id, customProps),
        updateCustomProps: (customProps: Partial<T>) => updateCustomProps(id, customProps),
        addListener: (
          type: MenuEvents, 
          listener: EventListenerOrEventListenerObject, 
          options?: boolean | AddEventListenerOptions | undefined,
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
    }), [
      hideActive,
      activeMenuId,
      useSharedMenu,
    ]);
  
    return (
      <SharedMenuCtx.Provider value={value}>
        {children}
        <div 
          ref={eventCollector}
          style={{ maxWidth: 0, maxHeight: 0, opacity: 0 }} 
        />
      </SharedMenuCtx.Provider>
    );
  };

  return SharedMenuProvider;
}


