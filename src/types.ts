import { createSharedMenuCtx, getSharedMenuProvider } from "./shared-menu";

export type OrderRow = {
  id: string;
  name: string;
  description: string;
  parcels: number;
}

export type MyCustomData = {
  row: OrderRow | null;
  target?: EventTarget | null;
  position: null | {
    x: number;
    y: number;
  }
}

export const defaultCustomData: MyCustomData = { 
  row: null,
  position: null,
}

export const MyCustomDataContextMenuCtx = createSharedMenuCtx<MyCustomData>(defaultCustomData);
export const MyCustomDataContextMenuProvider = getSharedMenuProvider(MyCustomDataContextMenuCtx);