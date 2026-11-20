/**
 * Client state (Zustand) persisted to localStorage.
 * This is the mock data layer — src/lib/api.ts wraps it behind a service interface.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AccommodationEntry, AccommodationKind, Booking, CommPreferences, DisplaySettings,
  Estimate, Message, ServiceRequest, Stage,
} from "@/lib/types";
import { SEED_ACCOMMODATIONS, SEED_REQUESTS } from "@/lib/seed";
import { STAGES, stageIndex } from "@/lib/catalog";

export const STORAGE_KEY = "clear-lane-v1";

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export interface AppState {
  settings: DisplaySettings;
  profile: CommPreferences | null;
  bookings: Booking[];
  requests: ServiceRequest[];
  accommodations: AccommodationEntry[];
  activeRequestId: string | null;
  /** Requests whose "ready" alert the customer already acknowledged */
  acknowledgedReady: string[];

  setSettings: (patch: Partial<DisplaySettings>) => void;
  saveProfile: (p: CommPreferences) => void;
  clearProfile: () => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt">) => Booking;
  submitRequest: (r: Omit<ServiceRequest, "id" | "createdAt" | "stage" | "messages">) => ServiceRequest;
  setActiveRequest: (id: string | null) => void;
  setStage: (id: string, stage: Stage) => void;
  advanceStage: (id: string) => void;
  sendEstimate: (id: string, items: Estimate["items"]) => void;
  decideEstimate: (id: string, decision: NonNullable<Estimate["decision"]>, question?: string) => void;
  addMessage: (id: string, m: Omit<Message, "id" | "at">) => void;
  logAccommodation: (requestId: string, kind: AccommodationKind, detail: string) => void;
  acknowledgeReady: (id: string) => void;
  resetDemo: () => void;
}

const initialData = () => ({
  settings: { textSize: 0, highContrast: false, theme: "light", soundOff: true, lang: "en" } as DisplaySettings,
  profile: null as CommPreferences | null,
  bookings: [] as Booking[],
  requests: SEED_REQUESTS,
  accommodations: SEED_ACCOMMODATIONS as AccommodationEntry[],
  activeRequestId: null as string | null,
  acknowledgedReady: [] as string[],
});

const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const patchRequest = (id: string, fn: (r: ServiceRequest) => ServiceRequest) =>
        set({ requests: get().requests.map((r) => (r.id === id ? fn(r) : r)) });

      const log = (requestId: string, kind: AccommodationKind, detail: string) =>
        set({ accommodations: [{ id: uid("acc"), requestId, at: now(), kind, detail }, ...get().accommodations] });

      return {
        ...initialData(),

        setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
        saveProfile: (p) => set({ profile: { ...p, updatedAt: now() } }),
        clearProfile: () => set({ profile: null }),

        addBooking: (b) => {
          const booking: Booking = { ...b, id: uid("bk"), createdAt: now() };
          set({ bookings: [booking, ...get().bookings] });
          return booking;
        },

        submitRequest: (r) => {
          const n = Math.max(1042, ...get().requests.map((x) => Number(x.id.slice(3)) || 0)) + 1;
          const req: ServiceRequest = {
            ...r,
            id: `CL-${n}`,
            createdAt: now(),
            stage: "checked-in",
            messages: [{ id: uid("m"), from: "advisor", kind: "system", at: now(), text: "We received your request. An advisor will review it shortly." }],
          };
          set({ requests: [req, ...get().requests], activeRequestId: req.id });
          return req;
        },

        setActiveRequest: (id) => set({ activeRequestId: id }),

        setStage: (id, stage) => {
          patchRequest(id, (r) => ({ ...r, stage, techUpdate: r.techUpdate || stageIndex(stage) >= 1 }));
          if (stage === "ready") log(id, "visual-alert", "Ready-for-pickup shown on screen (banner, flash, vibration)");
        },

        advanceStage: (id) => {
          const r = get().requests.find((x) => x.id === id);
          if (!r) return;
          const next = STAGES[Math.min(stageIndex(r.stage) + 1, STAGES.length - 1)];
          if (next) get().setStage(id, next.id);
        },

        sendEstimate: (id, items) => {
          patchRequest(id, (r) => ({ ...r, stage: "awaiting-approval", techUpdate: true, estimate: { items, sentAt: now() } }));
          log(id, "written-estimate", `Estimate with ${items.length} item(s) sent as a written approval card`);
        },

        decideEstimate: (id, decision, question) => {
          patchRequest(id, (r) => {
            const messages = question
              ? [...r.messages, { id: uid("m"), from: "customer" as const, kind: "question" as const, at: now(), text: question }]
              : r.messages;
            return {
              ...r,
              messages,
              stage: decision === "approved" ? "in-repair" : r.stage,
              estimate: r.estimate ? { ...r.estimate, decision, decidedAt: now() } : r.estimate,
            };
          });
          if (question) log(id, "typed-reply", "Customer asked a question about the estimate in writing");
        },

        addMessage: (id, m) => patchRequest(id, (r) => ({ ...r, messages: [...r.messages, { ...m, id: uid("m"), at: now() }] })),
        logAccommodation: log,
        acknowledgeReady: (id) => set({ acknowledgedReady: [...new Set([...get().acknowledgedReady, id])] }),
        resetDemo: () => set({ ...initialData(), settings: get().settings }),
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated manually after mount so server and first client render match.
      skipHydration: true,
      version: 1,
    },
  ),
);

/** Look up a request by id (selector helper). */
export const selectRequest = (id: string | null) => (s: AppState) => s.requests.find((r) => r.id === id) ?? null;
