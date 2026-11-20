/**
 * Typed service layer. Today it reads seed data and the local store;
 * swap `mockApi` for a real HTTP implementation without touching the UI.
 */
import { DEALERSHIPS, PLACES } from "./seed";
import type { Dealership } from "./types";

export interface ClearLaneApi {
  listDealerships(): Promise<Dealership[]>;
  getDealership(id: string): Promise<Dealership | null>;
  findPlace(query: string): Promise<{ name: string; lat: number; lng: number } | null>;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockApi: ClearLaneApi = {
  async listDealerships() {
    await delay(350); // simulate network so loading states are visible
    return DEALERSHIPS;
  },
  async getDealership(id) {
    await delay(100);
    return DEALERSHIPS.find((d) => d.id === id) ?? null;
  },
  async findPlace(query) {
    await delay(150);
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hit = PLACES.find((p) => p.zip === q || p.name.toLowerCase() === q || p.name.toLowerCase().startsWith(q));
    return hit ? { name: `${hit.name} (${hit.zip})`, lat: hit.lat, lng: hit.lng } : null;
  },
};

/** Synchronous lookup for components that already have seed data loaded. */
export const dealershipById = (id: string) => DEALERSHIPS.find((d) => d.id === id) ?? null;

export const api: ClearLaneApi = mockApi;
