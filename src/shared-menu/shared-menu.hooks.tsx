import {
  Context,
  useContext,
} from 'react';

import { 
  ISharedMenuConfig,
  ISharedMenuCtx,
} from './shared-menu.context';

export function useSharedMenu<T>(id: string, ctx: Context<ISharedMenuCtx<T>>) {
  const {
    menus, 
    activeMenuId, 
    show,
    hide, 
    toggle, 
    clear,
    setConfig,
    updateConfig,
  } = useContext(ctx);
    
  return {
    isActive: activeMenuId === id,
    config: menus[id] || null,
    show: (config?: Partial<ISharedMenuConfig<T>>) => show(id, config || {}),
    hide: () => hide(id),
    toggle: () => toggle(id),
    clear: () => clear(id),
    setConfig: (config?: Partial<ISharedMenuConfig<T>>) => setConfig(id, config),
    updateConfig: (config?: Partial<ISharedMenuConfig<T>>) => updateConfig(id, config),
  };
}
