/** Static reference data: car parts, dashboard warning lights, symptom chips, journey audit. */
import type { PartId, WarningLightId, Stage } from "./types";

export const PARTS: Record<PartId, { label: string; hint: string }> = {
  tires: { label: "Tires", hint: "Flat, low, worn or vibrating" },
  brakes: { label: "Brakes", hint: "Squeal, grinding, soft pedal" },
  engine: { label: "Engine bay", hint: "Smoke, leaks, rough running" },
  battery: { label: "Battery", hint: "Slow start, won't start" },
  headlights: { label: "Headlights", hint: "Out, dim or flickering" },
  windshield: { label: "Windshield & wipers", hint: "Cracks, streaks, wipers" },
  suspension: { label: "Suspension", hint: "Bouncy, clunks over bumps" },
  doors: { label: "Doors & locks", hint: "Sticking, won't lock" },
  exhaust: { label: "Exhaust", hint: "Loud, smoky, smell" },
  ac: { label: "Air conditioning", hint: "Not cold, odd smell" },
};
export const PART_IDS = Object.keys(PARTS) as PartId[];

export const WARNING_LIGHTS: Record<WarningLightId, { label: string; meaning: string; tone: "red" | "amber" }> = {
  "check-engine": { label: "Check engine", meaning: "Engine or emissions fault", tone: "amber" },
  oil: { label: "Oil pressure", meaning: "Stop soon — low oil pressure", tone: "red" },
  battery: { label: "Battery / charging", meaning: "Charging system problem", tone: "red" },
  brake: { label: "Brake", meaning: "Brake system or parking brake", tone: "red" },
  abs: { label: "ABS", meaning: "Anti-lock brake fault", tone: "amber" },
  "tire-pressure": { label: "Tire pressure", meaning: "One or more tires low", tone: "amber" },
  airbag: { label: "Airbag", meaning: "Airbag system fault", tone: "red" },
  coolant: { label: "Coolant temperature", meaning: "Engine running hot", tone: "red" },
  steering: { label: "Power steering", meaning: "Steering assist fault", tone: "amber" },
  traction: { label: "Traction control", meaning: "Traction / stability fault", tone: "amber" },
};
export const LIGHT_IDS = Object.keys(WARNING_LIGHTS) as WarningLightId[];

export const WHEN_OPTIONS = [
  "When braking",
  "At startup",
  "At high speed",
  "When turning",
  "Over bumps",
  "When cold",
  "When the AC is on",
  "All the time",
  "Comes and goes",
];

export const SEVERITY_LABELS = ["Annoying", "Worrying", "Unsafe"] as const;

export const STAGES: { id: Stage; label: string; plain: string }[] = [
  { id: "checked-in", label: "Checked in", plain: "Your car is with us." },
  { id: "diagnosing", label: "Diagnosing", plain: "A technician is looking at your car." },
  { id: "awaiting-approval", label: "Waiting for approval", plain: "We sent you a written estimate. Nothing happens until you approve." },
  { id: "in-repair", label: "In repair", plain: "We are fixing your car." },
  { id: "ready", label: "Ready", plain: "Your car is ready for pickup." },
];
export const stageIndex = (s: Stage) => STAGES.findIndex((x) => x.id === s);

export const STAFF_TIPS = [
  "Face the customer and keep your mouth visible.",
  "Speak at a normal pace — don't shout or over-exaggerate.",
  "Write key numbers down: prices, times, mileage.",
  "Get attention with a wave or light tap on the counter, not a call-out.",
  "Confirm understanding in writing before any work starts.",
  "Offer the interpreter early; never ask a family member to interpret.",
];

/** Journey audit: which steps were audio-only before vs. how Clear Lane makes them visual. */
export const JOURNEY_AUDIT: { step: string; before: string; after: string; audioOnly: boolean }[] = [
  { step: "Booking an appointment", before: "Phone call", after: "Online slot picker", audioOnly: true },
  { step: "Choosing a dealership", before: "Call to ask about access", after: "Accessibility badges on every card", audioOnly: true },
  { step: "Sharing communication needs", before: "Explained at the counter", after: "Saved preference profile", audioOnly: true },
  { step: "Describing the problem", before: "Verbal description", after: "Tap-to-select car diagram + lights", audioOnly: true },
  { step: "Showing the noise", before: "Imitating the sound", after: "Short video or photo upload", audioOnly: true },
  { step: "Counter check-in", before: "Spoken conversation", after: "Live captions + typed replies", audioOnly: true },
  { step: "Interpreter access", before: "Not offered", after: "Interpreter on tap (logged)", audioOnly: true },
  { step: "Waiting-room call-out", before: "Loudspeaker", after: "On-screen status + vibration", audioOnly: true },
  { step: "Technician findings", before: "Narrated video", after: "Captioned video + written summary", audioOnly: true },
  { step: "Approving the estimate", before: "Approval phone call", after: "Written approval card", audioOnly: true },
  { step: "Ready for pickup", before: "Phone call", after: "Banner + flash + vibration", audioOnly: true },
  { step: "Paying and pickup", before: "Mixed", after: "Itemised written summary", audioOnly: false },
];
