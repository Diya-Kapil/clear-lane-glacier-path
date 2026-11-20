import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { to: "/preferences" as const, label: "Preferences" },
  { to: "/find" as const, label: "Book a visit" },
  { to: "/report" as const, label: "Show the problem" },
  { to: "/status" as const, label: "Follow status" },
];

/** Progress through the customer journey. */
export function CustomerSteps({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <nav aria-label="Customer journey" className="mb-8">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.to}>
              <Link
                to={s.to}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                  active && "border-primary bg-primary text-primary-foreground",
                  done && "border-border bg-secondary text-secondary-foreground",
                  !active && !done && "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs", active ? "border-primary-foreground" : "border-current")} aria-hidden>
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span>{s.label}{done && <span className="sr-only"> (done)</span>}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
