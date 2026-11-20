import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarDays, Check } from "lucide-react";
import type { Dealership } from "@/lib/types";
import { generateSlots, upcomingDays } from "@/lib/slots";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Calendar strip + time grid. Unavailable times say "Taken" in text, not just colour. */
export function SlotPicker({ dealer, now, booked, initial, onConfirm }: {
  dealer: Dealership;
  now: Date;
  booked: string[];
  initial?: Date | undefined;
  onConfirm: (slot: Date) => void;
}) {
  const days = useMemo(() => upcomingDays(now, 10), [now]);
  const [day, setDay] = useState<Date>(() => (initial ? new Date(initial.getFullYear(), initial.getMonth(), initial.getDate()) : days[0] ?? now));
  const [slot, setSlot] = useState<Date | null>(initial ?? null);
  const slots = useMemo(() => generateSlots(dealer, day, now, booked), [dealer, day, now, booked]);
  const openCount = slots.filter((s) => s.available).length;

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 flex items-center gap-2 font-semibold"><CalendarDays className="h-5 w-5 text-primary" aria-hidden /> Pick a day</legend>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="radiogroup" aria-label="Day">
          {days.map((d) => {
            const closed = dealer.closedDays.includes(d.getDay());
            const active = isSameDay(d, day);
            return (
              <button
                key={d.toISOString()}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${format(d, "EEEE d MMMM")}${closed ? ", closed" : ""}`}
                onClick={() => { setDay(d); setSlot(null); }}
                className={cn(
                  "flex min-h-16 min-w-16 shrink-0 flex-col items-center justify-center rounded-xl border-2 px-2 py-1.5",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
                  closed && !active && "opacity-60",
                )}
              >
                <span className="text-xs font-semibold uppercase">{format(d, "EEE")}</span>
                <span className="font-display text-xl font-bold">{format(d, "d")}</span>
                {closed && <span className="text-[0.65rem] font-semibold">Closed</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">Pick a time <span className="font-normal text-muted-foreground">· {openCount} open on {format(day, "EEE d MMM")}</span></legend>
        {slots.length === 0 ? (
          <p className="rounded-xl bg-muted p-4 text-muted-foreground">The service lane is closed this day. Please choose another day.</p>
        ) : openCount === 0 ? (
          <p className="rounded-xl bg-warning-soft p-4">No open times left this day. Try the next day.</p>
        ) : null}
        {slots.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
            {slots.map((s) => {
              const active = slot?.getTime() === s.start.getTime();
              return (
                <button
                  key={s.start.toISOString()}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={!s.available}
                  aria-label={`${format(s.start, "h:mm a")}${s.available ? "" : ", taken"}`}
                  onClick={() => setSlot(s.start)}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center rounded-xl border-2 text-sm font-semibold",
                    active && "border-primary bg-primary text-primary-foreground",
                    !active && s.available && "border-border bg-card hover:border-primary",
                    !s.available && "cursor-not-allowed border-dashed border-border bg-muted text-muted-foreground line-through",
                  )}
                >
                  {format(s.start, "h:mm a")}
                  {!s.available && <span className="text-[0.7rem] font-normal no-underline">Taken</span>}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <Button variant="hero" size="lg" className="w-full" disabled={!slot} onClick={() => slot && onConfirm(slot)}>
        <Check aria-hidden /> {slot ? `Book ${format(slot, "EEE d MMM, h:mm a")}` : "Choose a time to continue"}
      </Button>
    </div>
  );
}
