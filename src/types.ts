import { createSharedMenuCtx, GetSharedMenuProvider } from "./shared-menu";

export type MyCustomDataProps = {
  userId: string | null;
}

export type MyCustomData = Partial<MyCustomDataProps>;

export const defaultCustomData = { 
  userId: null, 
}

export const MyCustomDataContextMenuCtx = createSharedMenuCtx<MyCustomData>(defaultCustomData);
export const MyCustomDataContextMenuProvider = GetSharedMenuProvider(MyCustomDataContextMenuCtx);