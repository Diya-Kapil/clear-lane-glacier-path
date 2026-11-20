import { useEffect, useState } from "react";
import { useAppStore } from "./app-store";

/** True once persisted state has been loaded from localStorage on the client. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}
