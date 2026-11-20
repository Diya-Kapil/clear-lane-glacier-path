import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Car, CircleAlert, Gauge, Send, ShieldCheck, ShieldQuestion, ShieldX, X, Pencil, Info } from "lucide-react";
import { toast } from "sonner";
import { Container, PageHeader } from "@/components/clear-lane/PageHeader";
import { CustomerSteps } from "@/components/clear-lane/CustomerSteps";
import { CarDiagram } from "@/components/clear-lane/CarDiagram";
import { LIGHT_ICONS } from "@/components/clear-lane/WarningLightIcon";
import { MediaCapture } from "@/components/clear-lane/MediaCapture";
import { PreferenceBanner } from "@/components/clear-lane/PreferenceSummary";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LIGHT_IDS, PART_IDS, PARTS, SEVERITY_LABELS, WARNING_LIGHTS, WHEN_OPTIONS } from "@/lib/catalog";
import { DEALERSHIPS } from "@/lib/seed";
import { emptyPreferences } from "@/lib/preferences";
import type { DriveSafe, MediaInfo, PartId, Severity, WarningLightId } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Show us the problem — Clear Lane" },
      { name: "description", content: "Describe your car problem without speaking: tap the car diagram, pick warning lights, add a short video." },
      { property: "og:title", content: "Show us the problem — Clear Lane" },
      { property: "og:description", content: "Visual-first car check-in. No speaking needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

const STEPS = ["Where is the problem?", "Warning lights", "When and how bad?", "Video and notes", "Review and send"];

const DRIVE_SAFE: { v: DriveSafe; label: string; Icon: typeof ShieldCheck }[] = [
  { v: "yes", label: "Yes, it feels safe to drive", Icon: ShieldCheck },
  { v: "unsure", label: "I'm not sure", Icon: ShieldQuestion },
  { v: "no", label: "No, it feels unsafe", Icon: ShieldX },
];

function Chip({ on, onClick, children, label }: { on: boolean; onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <button type="button" aria-pressed={on} aria-label={label} onClick={onClick}
      className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors",
        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
      {children}
    </button>
  );
}

function ReportPage() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const bookings = useAppStore((s) => s.bookings);
  const submitRequest = useAppStore((s) => s.submitRequest);
  const soundOff = useAppStore((s) => s.settings.soundOff);

  const [step, setStep] = useState(0);
  const [parts, setParts] = useState<PartId[]>([]);
  const [lights, setLights] = useState<WarningLightId[]>([]);
  const [when, setWhen] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity>(1);
  const [driveSafe, setDriveSafe] = useState<DriveSafe>("unsure");
  const [media, setMedia] = useState<MediaInfo | undefined>(undefined);
  const [note, setNote] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [dealershipId, setDealershipId] = useState<string>(bookings[0]?.dealershipId ?? "d1");
  const [stepError, setStepError] = useState<string | null>(null);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const next = () => {
    if (step === 0 && parts.length === 0 && lights.length === 0 && !note) {
      setStepError("Choose at least one part — or skip ahead to warning lights or notes.");
    }
    setStepError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0 });
  };
  const back = () => { setStepError(null); setStep((s) => Math.max(0, s - 1)); };

  const submit = () => {
    if (parts.length === 0 && lights.length === 0 && !note.trim() && !media) {
      setStepError("Please tell us something about the problem: a part, a warning light, a note or a video.");
      return;
    }
    const prefs = profile ?? { ...emptyPreferences(), name: "Guest", consent: true };
    const req = submitRequest({
      customerId: "me",
      customerName: prefs.name || "Guest",
      vehicle: vehicle.trim() || "My car",
      dealershipId,
      parts, warningLights: lights, when, severity, driveSafe, note: note.trim(),
      media, prefs, soundOff,
    });
    toast.success(`Request ${req.id} sent`, { description: "An advisor will reply in writing." });
    void navigate({ to: "/status" });
  };

  return (
    <Container>
      <CustomerSteps current={2} />
      <PageHeader eyebrow="Step 3 of 4" title="Show us the problem">No speaking needed. Tap, pick and add a video — an advisor reads it all before you arrive.</PageHeader>

      {!profile && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-warning-soft p-4">
          <Info className="h-5 w-5" aria-hidden />
          <p className="flex-1">You haven't saved communication preferences yet. The advisor will see "Guest".</p>
          <Button asChild variant="outline" size="sm"><Link to="/preferences">Set preferences</Link></Button>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-8">
        <ol className="mb-6 grid grid-cols-5 gap-1.5" aria-label="Report progress">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined}>
              <button type="button" onClick={() => setStep(i)} className="block w-full rounded-full py-2" aria-label={`Go to step ${i + 1}: ${s}`}>
                <span className={cn("block h-2.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
              </button>
            </li>
          ))}
        </ol>
        <p className="text-sm font-semibold text-muted-foreground">Part {step + 1} of {STEPS.length}</p>
        <h2 className="mb-6 text-2xl font-bold" aria-live="polite">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-5">
            <CarDiagram selected={parts} onToggle={(id) => setParts((p) => toggle(p, id))} />
            <div>
              <p className="mb-2 font-semibold">Selected parts</p>
              {parts.length === 0 ? (
                <p className="text-muted-foreground">Nothing selected yet.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {parts.map((p) => (
                    <li key={p}>
                      <button type="button" onClick={() => setParts((x) => x.filter((y) => y !== p))}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground"
                        aria-label={`Remove ${PARTS[p].label}`}>
                        {PARTS[p].label} <X className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <details className="rounded-2xl border border-border p-4">
              <summary className="cursor-pointer font-semibold">Prefer a list? Choose parts here</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {PART_IDS.map((p) => (
                  <Chip key={p} on={parts.includes(p)} onClick={() => setParts((x) => toggle(x, p))}>{PARTS[p].label}</Chip>
                ))}
              </div>
            </details>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-4 text-muted-foreground">Pick any lights you've seen on your dashboard. Not sure? Skip this step.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {LIGHT_IDS.map((id) => {
                const Icon = LIGHT_ICONS[id];
                const on = lights.includes(id);
                const meta = WARNING_LIGHTS[id];
                return (
                  <button key={id} type="button" aria-pressed={on} onClick={() => setLights((l) => toggle(l, id))}
                    className={cn("flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 text-center transition-colors",
                      on ? "border-primary bg-secondary" : "border-border bg-card hover:bg-muted")}>
                    <span className={cn("grid h-14 w-14 place-items-center rounded-full", meta.tone === "red" ? "bg-danger-soft text-destructive" : "bg-warning-soft text-warning-foreground")} aria-hidden>
                      <Icon className="h-8 w-8" strokeWidth={2.2} />
                    </span>
                    <span className="font-semibold leading-tight">{meta.label}</span>
                    <span className="text-xs text-muted-foreground">{meta.tone === "red" ? "Red light · " : "Amber light · "}{meta.meaning}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <fieldset>
              <legend className="mb-3 text-lg font-semibold">When does it happen?</legend>
              <div className="flex flex-wrap gap-2">
                {WHEN_OPTIONS.map((w) => <Chip key={w} on={when.includes(w)} onClick={() => setWhen((x) => toggle(x, w))}>{w}</Chip>)}
              </div>
            </fieldset>
            <div>
              <Label id="sev-label" className="mb-3 flex items-center gap-2 text-lg font-semibold"><Gauge className="h-5 w-5 text-primary" aria-hidden /> How bad is it?</Label>
              <div className="rounded-2xl bg-muted p-5">
                <p className="mb-4 text-center font-display text-2xl font-bold" aria-live="polite">{SEVERITY_LABELS[severity]}</p>
                <Slider min={0} max={2} step={1} value={[severity]} onValueChange={([v]) => setSeverity((v ?? 1) as Severity)}
                  aria-labelledby="sev-label" aria-valuetext={SEVERITY_LABELS[severity]} />
                <div className="mt-3 flex justify-between text-sm font-semibold text-muted-foreground" aria-hidden>
                  {SEVERITY_LABELS.map((s) => <span key={s}>{s}</span>)}
                </div>
              </div>
            </div>
            <fieldset>
              <legend className="mb-3 text-lg font-semibold">Is it safe to drive?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {DRIVE_SAFE.map(({ v, label, Icon }) => (
                  <label key={v} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring",
                    driveSafe === v ? "border-primary bg-secondary" : "border-border hover:bg-muted")}>
                    <input type="radio" name="drive-safe" className="sr-only" checked={driveSafe === v} onChange={() => setDriveSafe(v)} />
                    <Icon className={cn("h-6 w-6 shrink-0", v === "no" ? "text-destructive" : v === "yes" ? "text-success" : "text-primary")} aria-hidden /> {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-lg font-semibold">Show us with a short video or photo <span className="font-normal text-muted-foreground">(optional)</span></p>
              <MediaCapture value={media} onChange={setMedia} />
            </div>
            <div>
              <Label htmlFor="note" className="text-lg font-semibold">Anything else? <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={5} className="mt-2 text-lg" placeholder="e.g. A grinding feeling in the brake pedal since Monday." />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            {profile && <PreferenceBanner prefs={profile} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="vehicle" className="font-semibold">Your car</Label>
                <Input id="vehicle" value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="e.g. 2020 Honda Civic" className="mt-1.5 h-12" />
              </div>
              <div>
                <Label htmlFor="dealer" className="font-semibold">Dealership</Label>
                <select id="dealer" value={dealershipId} onChange={(e) => setDealershipId(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-input bg-card px-3">
                  {DEALERSHIPS.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <CarDiagram selected={parts} readOnly />
              <dl className="space-y-4">
                <ReviewRow label="Parts" onEdit={() => setStep(0)} value={parts.map((p) => PARTS[p].label).join(", ") || "None selected"} />
                <ReviewRow label="Warning lights" onEdit={() => setStep(1)} value={lights.map((l) => WARNING_LIGHTS[l].label).join(", ") || "None"} />
                <ReviewRow label="When" onEdit={() => setStep(2)} value={when.join(", ") || "Not specified"} />
                <ReviewRow label="How bad" onEdit={() => setStep(2)} value={`${SEVERITY_LABELS[severity]} · Safe to drive: ${driveSafe === "yes" ? "Yes" : driveSafe === "no" ? "No" : "Not sure"}`} />
                <ReviewRow label="Video / photo" onEdit={() => setStep(3)} value={media ? `${media.name} (${media.sizeKB} KB)` : "None"} />
                <ReviewRow label="Notes" onEdit={() => setStep(3)} value={note || "None"} />
              </dl>
            </div>
          </div>
        )}

        {stepError && <p role="alert" className="mt-6 flex items-center gap-2 rounded-xl bg-danger-soft p-3 font-semibold"><CircleAlert className="h-5 w-5" aria-hidden /> {stepError}</p>}

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
          <Button variant="outline" onClick={back} disabled={step === 0}><ArrowLeft aria-hidden /> Back</Button>
          {step < STEPS.length - 1 ? (
            <Button variant="hero" onClick={next}>Next <ArrowRight aria-hidden /></Button>
          ) : (
            <Button variant="hero" size="lg" onClick={submit}><Send aria-hidden /> Submit request</Button>
          )}
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Car className="h-4 w-4" aria-hidden /> You can change anything before you send it.</p>
    </Container>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
      <div>
        <dt className="text-sm font-semibold text-muted-foreground">{label}</dt>
        <dd className="mt-0.5">{value}</dd>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Edit ${label}`}><Pencil aria-hidden /> Edit</Button>
    </div>
  );
}
