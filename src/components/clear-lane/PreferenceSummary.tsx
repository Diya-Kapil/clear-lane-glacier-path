import { MessageSquareText, Captions, Video, NotebookPen, Bell, Languages, Pencil } from "lucide-react";
import type { CommPreferences, ContactMethod } from "@/lib/types";
import { CONTACT_LABELS, NOTIFY_LABELS, summarizePreferences } from "@/lib/preferences";
import { Button } from "@/components/ui/button";

export const CONTACT_ICONS: Record<ContactMethod, typeof Captions> = {
  text: MessageSquareText, captions: Captions, interpreter: Video, notes: NotebookPen,
};

/** Banner used across the app: shows how this person prefers to communicate. */
export function PreferenceBanner({ prefs, compact }: { prefs: CommPreferences; compact?: boolean }) {
  const Icon = CONTACT_ICONS[prefs.contact[0] ?? "text"];
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-navy text-navy-foreground ${compact ? "p-3" : "p-4"}`} role="note" aria-label="Communication preference">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-teal text-primary-foreground" aria-hidden>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-navy-muted">Communication preference</p>
        <p className="font-display text-lg font-semibold leading-snug">{summarizePreferences(prefs)}</p>
      </div>
    </div>
  );
}

export function PreferenceSummaryCard({ prefs, onEdit }: { prefs: CommPreferences; onEdit?: () => void }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Saved profile</p>
          <h2 className="mt-1 text-2xl font-bold">Hi {prefs.name || "there"} 👋</h2>
        </div>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}><Pencil aria-hidden /> Edit</Button>
        )}
      </div>
      <div className="mt-5"><PreferenceBanner prefs={prefs} /></div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><MessageSquareText className="h-4 w-4" aria-hidden /> Contact</dt>
          <dd className="mt-1">{prefs.contact.map((c) => CONTACT_LABELS[c]).join(", ")}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Languages className="h-4 w-4" aria-hidden /> Language</dt>
          <dd className="mt-1">{prefs.language === "Other" ? prefs.languageOther || "Other" : prefs.language}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Bell className="h-4 w-4" aria-hidden /> Notifications</dt>
          <dd className="mt-1">{prefs.notify.map((n) => NOTIFY_LABELS[n]).join(", ")}</dd>
        </div>
      </dl>
    </div>
  );
}
