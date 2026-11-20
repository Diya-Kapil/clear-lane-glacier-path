/** Core domain types for Clear Lane. All data in this prototype is fictional. */

export type ContactMethod = "text" | "captions" | "interpreter" | "notes";
export type NotifyStyle = "vibration" | "flash" | "text" | "email";
export type InterpreterPref = "none" | "on-request" | "always";

/** Communication preferences only — never a medical label. */
export interface CommPreferences {
  name: string;
  contact: ContactMethod[];
  language: "English" | "ASL" | "Other";
  languageOther: string;
  interpreter: InterpreterPref;
  notify: NotifyStyle[];
  email: string;
  consent: boolean;
  updatedAt: string;
}

export type LaneStatus = "quiet" | "busy" | "full";
export type AccessFeature = "captions" | "interpreter" | "visual-alerts" | "text-first";

export interface Dealership {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  features: AccessFeature[];
  laneStatus: LaneStatus;
  /** 0–100 visual meter for how busy the lane is today */
  laneLoad: number;
  hours: { open: string; close: string; intervalMin: number };
  /** Day indexes (0 = Sunday) the service lane is closed */
  closedDays: number[];
}

export interface Booking {
  id: string;
  dealershipId: string;
  start: string; // ISO
  createdAt: string;
}

export type PartId =
  | "tires" | "brakes" | "engine" | "battery" | "headlights"
  | "windshield" | "suspension" | "doors" | "exhaust" | "ac";

export type WarningLightId =
  | "check-engine" | "oil" | "battery" | "brake" | "abs"
  | "tire-pressure" | "airbag" | "coolant" | "steering" | "traction";

export type Stage = "checked-in" | "diagnosing" | "awaiting-approval" | "in-repair" | "ready";
export type Severity = 0 | 1 | 2;
export type DriveSafe = "yes" | "no" | "unsure";

export interface MediaInfo {
  name: string;
  type: string;
  sizeKB: number;
  durationSec?: number | undefined;
  /** Seed media uses a hosted URL; user uploads are kept in memory for the session only. */
  url?: string | undefined;
  sessionKey?: string | undefined;
}

export interface EstimateItem { id: string; label: string; cost: number }
export interface Estimate {
  items: EstimateItem[];
  sentAt?: string | undefined;
  decision?: "approved" | "declined" | "question" | undefined;
  decidedAt?: string | undefined;
}

export interface Message {
  id: string;
  from: "advisor" | "customer" | "technician";
  text: string;
  at: string;
  kind: "caption" | "typed" | "question" | "system";
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  vehicle: string;
  dealershipId: string;
  createdAt: string;
  parts: PartId[];
  warningLights: WarningLightId[];
  when: string[];
  severity: Severity;
  driveSafe: DriveSafe;
  note: string;
  media?: MediaInfo | undefined;
  stage: Stage;
  prefs: CommPreferences;
  estimate?: Estimate | undefined;
  messages: Message[];
  soundOff: boolean;
  techUpdate?: boolean | undefined;
}

export type AccommodationKind =
  | "captions" | "interpreter-offer" | "typed-reply" | "written-estimate"
  | "visual-alert" | "written-notes" | "transcript-saved";

export interface AccommodationEntry {
  id: string;
  requestId: string;
  at: string;
  kind: AccommodationKind;
  detail: string;
}

export interface Customer {
  id: string;
  prefs: CommPreferences;
  vehicle: string;
}

export interface DisplaySettings {
  textSize: 0 | 1 | 2;
  highContrast: boolean;
  theme: "light" | "dark";
  soundOff: boolean;
  lang: "en" | "hi";
}
