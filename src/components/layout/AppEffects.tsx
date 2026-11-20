import { useEffect } from "react";
import { STORAGE_KEY, useAppStore } from "@/store/app-store";

/**
 * Client-only side effects: load persisted state, apply display settings to <html>,
 * and keep multiple tabs (customer + advisor) in sync for the demo.
 */
export function AppEffects() {
  const settings = useAppStore((s) => s.settings);

  useEffect(() => {
    void useAppStore.persist.rehydrate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) void useAppStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset["textSize"] = String(settings.textSize);
    root.classList.toggle("dark", settings.theme === "dark");
    root.classList.toggle("hc", settings.highContrast);
    root.lang = settings.lang;
  }, [settings]);

  return null;
}
