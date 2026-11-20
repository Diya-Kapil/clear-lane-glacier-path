/** Fictional seed data. No real customers or dealerships. */
import type { Customer, Dealership, ServiceRequest, CommPreferences } from "./types";
import techVideo from "@/assets/tech-update.mp4.asset.json";

export const DEFAULT_ORIGIN = { lat: 47.6062, lng: -122.3321, label: "Downtown Seattle" };

/** Manual location fallback: city name or ZIP → coordinates. */
export const PLACES: { name: string; zip: string; lat: number; lng: number }[] = [
  { name: "Seattle", zip: "98101", lat: 47.6101, lng: -122.3344 },
  { name: "Bellevue", zip: "98004", lat: 47.6149, lng: -122.1945 },
  { name: "Redmond", zip: "98052", lat: 47.674, lng: -122.1215 },
  { name: "Kirkland", zip: "98033", lat: 47.6769, lng: -122.206 },
  { name: "Renton", zip: "98057", lat: 47.4829, lng: -122.2171 },
  { name: "Tacoma", zip: "98402", lat: 47.2529, lng: -122.4443 },
  { name: "Everett", zip: "98201", lat: 47.979, lng: -122.2021 },
  { name: "Lynnwood", zip: "98036", lat: 47.8209, lng: -122.3151 },
  { name: "Shoreline", zip: "98133", lat: 47.7557, lng: -122.3415 },
];

export const DEALERSHIPS: Dealership[] = [
  { id: "d1", name: "Harbor Point Motors", address: "1200 Western Ave", city: "Seattle", zip: "98101", lat: 47.6059, lng: -122.3407,
    features: ["captions", "interpreter", "visual-alerts", "text-first"], laneStatus: "quiet", laneLoad: 28,
    hours: { open: "07:30", close: "17:30", intervalMin: 30 }, closedDays: [0] },
  { id: "d2", name: "Eastside Auto Care", address: "400 108th Ave NE", city: "Bellevue", zip: "98004", lat: 47.6145, lng: -122.1965,
    features: ["captions", "visual-alerts", "text-first"], laneStatus: "busy", laneLoad: 64,
    hours: { open: "08:00", close: "18:00", intervalMin: 30 }, closedDays: [0] },
  { id: "d3", name: "Cascade Drive Service", address: "16000 NE 85th St", city: "Redmond", zip: "98052", lat: 47.6788, lng: -122.1251,
    features: ["interpreter", "visual-alerts"], laneStatus: "quiet", laneLoad: 22,
    hours: { open: "08:00", close: "17:00", intervalMin: 45 }, closedDays: [0, 6] },
  { id: "d4", name: "Lakeview Ford & Service", address: "12500 Totem Lake Blvd", city: "Kirkland", zip: "98034", lat: 47.7158, lng: -122.1823,
    features: ["text-first", "captions"], laneStatus: "full", laneLoad: 94,
    hours: { open: "07:00", close: "16:00", intervalMin: 30 }, closedDays: [0] },
  { id: "d5", name: "Rainier Valley Autos", address: "300 Rainier Ave S", city: "Renton", zip: "98057", lat: 47.4793, lng: -122.2163,
    features: ["captions", "interpreter", "text-first"], laneStatus: "busy", laneLoad: 58,
    hours: { open: "08:00", close: "17:00", intervalMin: 30 }, closedDays: [0] },
  { id: "d6", name: "Sound Shore Service Center", address: "2100 Pacific Ave", city: "Tacoma", zip: "98402", lat: 47.2457, lng: -122.4372,
    features: ["visual-alerts", "text-first"], laneStatus: "quiet", laneLoad: 35,
    hours: { open: "08:00", close: "18:00", intervalMin: 60 }, closedDays: [0] },
  { id: "d7", name: "North Ridge Motors", address: "3600 196th St SW", city: "Lynnwood", zip: "98036", lat: 47.8205, lng: -122.2954,
    features: ["captions", "interpreter", "visual-alerts", "text-first"], laneStatus: "busy", laneLoad: 71,
    hours: { open: "07:30", close: "17:00", intervalMin: 30 }, closedDays: [0] },
  { id: "d8", name: "Glacier Peak Auto", address: "2800 Broadway", city: "Everett", zip: "98201", lat: 47.9804, lng: -122.2035,
    features: ["visual-alerts"], laneStatus: "full", laneLoad: 88,
    hours: { open: "08:00", close: "16:30", intervalMin: 30 }, closedDays: [0, 6] },
];

const prefs = (p: Partial<CommPreferences>): CommPreferences => ({
  name: "", contact: ["text"], language: "English", languageOther: "", interpreter: "on-request",
  notify: ["text", "flash"], email: "", consent: true, updatedAt: "2026-11-01T10:00:00.000Z", ...p,
});

export const CUSTOMERS: Customer[] = [
  { id: "c1", vehicle: "2021 Subaru Outback", prefs: prefs({ name: "Maya", contact: ["text", "captions"], language: "English", interpreter: "on-request", notify: ["vibration", "flash", "text"] }) },
  { id: "c2", vehicle: "2019 Honda CR-V", prefs: prefs({ name: "Jordan", contact: ["interpreter", "notes"], language: "ASL", interpreter: "always", notify: ["flash", "email"], email: "jordan@example.com" }) },
  { id: "c3", vehicle: "2023 Toyota Prius", prefs: prefs({ name: "Arun", contact: ["notes", "text"], language: "Other", languageOther: "Hindi", interpreter: "none", notify: ["text", "vibration"] }) },
];

const iso = (minsAgo: number) => new Date(Date.UTC(2026, 10, 20, 15, 0) - minsAgo * 60000).toISOString();

const base = (i: number, c: Customer): Pick<ServiceRequest, "customerId" | "customerName" | "vehicle" | "prefs" | "messages" | "soundOff"> => ({
  customerId: c.id, customerName: c.prefs.name, vehicle: c.vehicle, prefs: c.prefs, messages: [], soundOff: i % 2 === 0,
});

const [c1, c2, c3] = CUSTOMERS as [Customer, Customer, Customer];

export const SEED_REQUESTS: ServiceRequest[] = [
  { id: "CL-1042", ...base(0, c1), dealershipId: "d1", createdAt: iso(25), parts: ["brakes", "tires"], warningLights: ["brake"], when: ["When braking"], severity: 1, driveSafe: "unsure",
    note: "Squeal from front left when I slow down. Started last week.", stage: "awaiting-approval", techUpdate: true,
    media: { name: "brake-noise.mp4", type: "video/mp4", sizeKB: 612, durationSec: 12, url: techVideo.url },
    estimate: { items: [{ id: "e1", label: "Front brake pads (pair)", cost: 189 }, { id: "e2", label: "Brake inspection labor", cost: 60 }], sentAt: iso(5) } },
  { id: "CL-1041", ...base(1, c2), dealershipId: "d1", createdAt: iso(48), parts: ["battery"], warningLights: ["battery"], when: ["At startup", "When cold"], severity: 1, driveSafe: "yes",
    note: "Slow to start in the mornings.", stage: "diagnosing" },
  { id: "CL-1040", ...base(2, c3), dealershipId: "d1", createdAt: iso(70), parts: ["ac"], warningLights: [], when: ["When the AC is on"], severity: 0, driveSafe: "yes",
    note: "AC blows warm air.", stage: "checked-in" },
  { id: "CL-1039", ...base(3, c1), dealershipId: "d2", createdAt: iso(95), parts: ["engine"], warningLights: ["check-engine"], when: ["All the time"], severity: 1, driveSafe: "unsure",
    note: "Check engine light came on after refuelling.", stage: "in-repair" },
  { id: "CL-1038", ...base(4, c2), dealershipId: "d1", createdAt: iso(130), parts: ["tires"], warningLights: ["tire-pressure"], when: ["At high speed"], severity: 2, driveSafe: "no",
    note: "Shaking at highway speed.", stage: "ready" },
  { id: "CL-1037", ...base(5, c3), dealershipId: "d3", createdAt: iso(160), parts: ["headlights"], warningLights: [], when: ["All the time"], severity: 0, driveSafe: "yes",
    note: "Left headlight out.", stage: "ready" },
  { id: "CL-1036", ...base(6, c1), dealershipId: "d1", createdAt: iso(200), parts: ["suspension"], warningLights: [], when: ["Over bumps"], severity: 0, driveSafe: "yes",
    note: "Clunk over speed bumps.", stage: "checked-in" },
  { id: "CL-1035", ...base(7, c2), dealershipId: "d5", createdAt: iso(240), parts: ["windshield"], warningLights: [], when: ["Comes and goes"], severity: 0, driveSafe: "yes",
    note: "Wipers streak.", stage: "in-repair" },
  { id: "CL-1034", ...base(8, c3), dealershipId: "d1", createdAt: iso(300), parts: ["engine", "exhaust"], warningLights: ["coolant"], when: ["When cold"], severity: 2, driveSafe: "no",
    note: "White smoke and temperature light.", stage: "diagnosing" },
  { id: "CL-1033", ...base(9, c1), dealershipId: "d7", createdAt: iso(360), parts: ["doors"], warningLights: [], when: ["Comes and goes"], severity: 0, driveSafe: "yes",
    note: "Rear door doesn't lock with the key fob.", stage: "awaiting-approval",
    estimate: { items: [{ id: "e3", label: "Door lock actuator", cost: 145 }], sentAt: iso(30) } },
];

export const SEED_ACCOMMODATIONS = [
  { id: "a1", requestId: "CL-1042", at: iso(24), kind: "captions" as const, detail: "Live captions used at check-in" },
  { id: "a2", requestId: "CL-1041", at: iso(47), kind: "interpreter-offer" as const, detail: "Video interpreter offered and accepted" },
  { id: "a3", requestId: "CL-1042", at: iso(5), kind: "written-estimate" as const, detail: "Estimate sent as a written approval card" },
  { id: "a4", requestId: "CL-1038", at: iso(10), kind: "visual-alert" as const, detail: "Ready-for-pickup shown as banner + flash" },
];
