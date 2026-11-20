import { useState, type KeyboardEvent, type ReactNode } from "react";
import type { PartId } from "@/lib/types";
import { PARTS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Interactive car diagram (top + side views). Each part is a keyboard-focusable
 * checkbox (Tab to move, Space/Enter to toggle). Read-only mode just highlights.
 */
export function CarDiagram({ selected, onToggle, readOnly, className }: {
  selected: PartId[];
  onToggle?: (id: PartId) => void;
  readOnly?: boolean;
  className?: string;
}) {
  const [view, setView] = useState<"top" | "side">("side");

  const Part = ({ id, children }: { id: PartId; children: ReactNode }) => {
    const on = selected.includes(id);
    if (readOnly) return <g className="car-part" data-selected={on}>{children}</g>;
    return (
      <g
        className="car-part"
        role="checkbox"
        aria-checked={on}
        aria-label={PARTS[id].label}
        tabIndex={0}
        onClick={() => onToggle?.(id)}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === " " || e.key === "Enter") { e.preventDefault(); onToggle?.(id); }
        }}
      >
        <title>{PARTS[id].label}</title>
        {children}
      </g>
    );
  };

  return (
    <div className={cn("rounded-3xl border border-border bg-gradient-glacier p-4", readOnly && "car-readonly", className)}>
      <div className="mb-3 flex justify-center gap-2" role="tablist" aria-label="Car view">
        {(["side", "top"] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={cn("min-h-11 rounded-full px-5 text-sm font-semibold", view === v ? "bg-navy text-navy-foreground" : "bg-card text-foreground hover:bg-muted")}>
            {v === "side" ? "Side view" : "Top view"}
          </button>
        ))}
      </div>

      {view === "side" ? (
        <svg viewBox="0 0 500 230" className="mx-auto w-full max-w-xl" role={readOnly ? "img" : "group"}
          aria-label={readOnly ? `Car diagram, highlighted: ${selected.map((s) => PARTS[s].label).join(", ") || "none"}` : "Car side view — choose the parts with a problem"}>
          {/* ground */}
          <line x1="10" y1="196" x2="490" y2="196" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
          {/* body */}
          <path className="car-body" d="M40 150 Q40 118 70 112 L140 104 L190 60 Q200 52 214 52 L330 52 Q346 52 356 62 L400 104 L446 112 Q466 118 466 140 L466 160 Q466 168 458 168 L42 168 Q40 168 40 160 Z" />
          <Part id="windshield">
            <path d="M196 66 L150 104 L240 104 L240 62 L212 62 Q202 62 196 66 Z" />
            <path d="M342 64 L384 104 L252 104 L252 62 L330 62 Q338 62 342 64 Z" />
          </Part>
          <Part id="doors">
            <rect x="186" y="110" width="90" height="50" rx="6" />
            <rect x="282" y="110" width="88" height="50" rx="6" />
          </Part>
          <Part id="engine"><path d="M60 116 L140 106 L150 140 L52 144 Q52 124 60 116 Z" /></Part>
          <Part id="headlights"><path d="M42 124 Q44 116 58 114 L66 132 L42 136 Z" /></Part>
          <Part id="ac"><circle cx="160" cy="128" r="10" /></Part>
          <Part id="battery"><rect x="80" y="122" width="34" height="16" rx="3" /></Part>
          <Part id="exhaust"><rect x="436" y="170" width="44" height="10" rx="5" /></Part>
          <Part id="suspension">
            <path d="M112 132 l10 6 -10 6 10 6 -10 6" fill="none" strokeWidth="4" />
            <path d="M388 132 l10 6 -10 6 10 6 -10 6" fill="none" strokeWidth="4" />
            <rect x="104" y="126" width="26" height="6" rx="2" />
            <rect x="380" y="126" width="26" height="6" rx="2" />
          </Part>
          <Part id="tires">
            <circle cx="118" cy="168" r="30" />
            <circle cx="392" cy="168" r="30" />
          </Part>
          <Part id="brakes">
            <circle cx="118" cy="168" r="13" />
            <circle cx="392" cy="168" r="13" />
          </Part>
        </svg>
      ) : (
        <svg viewBox="0 0 260 460" className="mx-auto h-[24rem] w-auto max-w-full" role={readOnly ? "img" : "group"}
          aria-label={readOnly ? `Car diagram, highlighted: ${selected.map((s) => PARTS[s].label).join(", ") || "none"}` : "Car top view — choose the parts with a problem"}>
          <Part id="tires">
            <rect x="22" y="70" width="26" height="62" rx="8" />
            <rect x="212" y="70" width="26" height="62" rx="8" />
            <rect x="22" y="318" width="26" height="62" rx="8" />
            <rect x="212" y="318" width="26" height="62" rx="8" />
          </Part>
          <rect className="car-body" x="40" y="20" width="180" height="420" rx="60" />
          <Part id="engine"><path d="M58 70 Q60 34 130 30 Q200 34 202 70 L202 132 L58 132 Z" /></Part>
          <Part id="battery"><rect x="150" y="80" width="34" height="24" rx="4" /></Part>
          <Part id="headlights">
            <ellipse cx="72" cy="38" rx="16" ry="8" />
            <ellipse cx="188" cy="38" rx="16" ry="8" />
          </Part>
          <Part id="windshield"><path d="M62 140 L198 140 L184 184 L76 184 Z" /></Part>
          <Part id="ac"><rect x="104" y="192" width="52" height="18" rx="6" /></Part>
          <Part id="doors">
            <rect x="44" y="196" width="16" height="120" rx="5" />
            <rect x="200" y="196" width="16" height="120" rx="5" />
          </Part>
          <rect className="car-glass" x="70" y="324" width="120" height="40" rx="10" />
          <Part id="brakes">
            <circle cx="35" cy="101" r="7" /><circle cx="225" cy="101" r="7" />
            <circle cx="35" cy="349" r="7" /><circle cx="225" cy="349" r="7" />
          </Part>
          <Part id="suspension">
            <rect x="52" y="140" width="6" height="40" rx="3" /><rect x="202" y="140" width="6" height="40" rx="3" />
            <rect x="52" y="270" width="6" height="40" rx="3" /><rect x="202" y="270" width="6" height="40" rx="3" />
          </Part>
          <Part id="exhaust"><rect x="150" y="432" width="20" height="22" rx="6" /></Part>
        </svg>
      )}
      {!readOnly && <p className="mt-2 text-center text-sm text-muted-foreground">Tap a part, or use Tab and Space. Switch views to reach every part.</p>}
    </div>
  );
}
