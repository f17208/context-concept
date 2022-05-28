import { createSharedMenuCtx, getSharedMenuProvider } from "./shared-menu";

export type MyCustomData = {
  userId: string | null;
  position: null | {
    x: number;
    y: number;
  }
}

export const defaultCustomData: MyCustomData = { 
  userId: null,
  position: null,
}

export const MyCustomDataContextMenuCtx = createSharedMenuCtx<MyCustomData>(defaultCustomData);
export const MyCustomDataContextMenuProvider = getSharedMenuProvider(MyCustomDataContextMenuCtx);