/** Plain-language helpers for communication preferences (pure, unit-tested). */
import type { CommPreferences, ContactMethod, NotifyStyle } from "./types";

export const CONTACT_LABELS: Record<ContactMethod, string> = {
  text: "Text only",
  captions: "Captions at the counter",
  interpreter: "Video interpreter on request",
  notes: "Written notes",
};

export const NOTIFY_LABELS: Record<NotifyStyle, string> = {
  vibration: "Vibration",
  flash: "Screen flash",
  text: "Text message",
  email: "Email",
};

export function emptyPreferences(): CommPreferences {
  return {
    name: "",
    contact: ["text"],
    language: "English",
    languageOther: "",
    interpreter: "on-request",
    notify: ["text", "flash"],
    email: "",
    consent: false,
    updatedAt: "",
  };
}

/** One line for the advisor banner, e.g. "Text and captions preferred; interpreter on request". */
export function summarizePreferences(p: CommPreferences): string {
  const parts: string[] = [];
  const hasText = p.contact.includes("text");
  const hasCaptions = p.contact.includes("captions");
  if (hasText && hasCaptions) parts.push("Text and captions");
  else if (hasText) parts.push("Text");
  else if (hasCaptions) parts.push("Captions");
  if (p.contact.includes("notes")) parts.push(parts.length ? "written notes" : "Written notes");
  let lead = parts.length ? `${parts.join(", ")} preferred` : "Visual communication preferred";
  if (p.language === "ASL") lead += " (ASL)";
  else if (p.language === "Other" && p.languageOther.trim()) lead += ` (${p.languageOther.trim()})`;
  const interp =
    p.interpreter === "always"
      ? "interpreter requested"
      : p.interpreter === "on-request" || p.contact.includes("interpreter")
        ? "interpreter on request"
        : "no interpreter needed";
  return `${lead}; ${interp}`;
}

/** Validation for saving: needs consent, a name and at least one contact method. */
export function validatePreferences(p: CommPreferences): string[] {
  const errors: string[] = [];
  if (!p.name.trim()) errors.push("Please add your first name so the advisor can greet you.");
  if (p.contact.length === 0) errors.push("Choose at least one way to communicate.");
  if (p.notify.length === 0) errors.push("Choose at least one way to be notified.");
  if (p.notify.includes("email") && !/^\S+@\S+\.\S+$/.test(p.email)) errors.push("Add a valid email address for email updates.");
  if (!p.consent) errors.push("Please tick the consent box to save your preferences.");
  return errors;
}
