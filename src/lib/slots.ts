/** Service-lane slot logic (pure, deterministic, unit-tested). */
import type { Dealership } from "./types";

export interface Slot { start: Date; available: boolean }

/** Small deterministic hash so mock availability is stable across reloads. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseHM(hm: string): [number, number] {
  const [h, m] = hm.split(":").map(Number);
  return [h ?? 0, m ?? 0];
}

/** How often a slot is already taken, by lane status. */
const BOOKED_RATIO: Record<Dealership["laneStatus"], number> = { quiet: 0.2, busy: 0.5, full: 0.85 };

/** Is a given slot already booked (mock)? Deterministic per dealership + time. */
export function isMockBooked(dealer: Dealership, start: Date): boolean {
  const key = `${dealer.id}|${dateKey(start)}|${start.getHours()}:${start.getMinutes()}`;
  return (hashString(key) % 100) / 100 < BOOKED_RATIO[dealer.laneStatus];
}

/**
 * All slots for one day. Slots in the past (relative to `now`) are unavailable,
 * as are slots already booked and days the lane is closed.
 */
export function generateSlots(
  dealer: Dealership,
  day: Date,
  now: Date,
  extraBooked: string[] = [],
): Slot[] {
  if (dealer.closedDays.includes(day.getDay())) return [];
  const [oh, om] = parseHM(dealer.hours.open);
  const [ch, cm] = parseHM(dealer.hours.close);
  const slots: Slot[] = [];
  const cursor = new Date(day.getFullYear(), day.getMonth(), day.getDate(), oh, om, 0, 0);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), ch, cm, 0, 0);
  while (cursor < end) {
    const start = new Date(cursor);
    const taken = isMockBooked(dealer, start) || extraBooked.includes(start.toISOString());
    slots.push({ start, available: start > now && !taken });
    cursor.setMinutes(cursor.getMinutes() + dealer.hours.intervalMin);
  }
  return slots;
}

/** The next `count` open slots, searching forward up to `maxDays` days. */
export function nextOpenSlots(
  dealer: Dealership,
  now: Date,
  count = 3,
  maxDays = 14,
  extraBooked: string[] = [],
): Date[] {
  const found: Date[] = [];
  for (let i = 0; i < maxDays && found.length < count; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    for (const s of generateSlots(dealer, day, now, extraBooked)) {
      if (s.available) found.push(s.start);
      if (found.length >= count) break;
    }
  }
  return found;
}

/** Days for the calendar strip, starting today. */
export function upcomingDays(now: Date, n = 10): Date[] {
  return Array.from({ length: n }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
}
