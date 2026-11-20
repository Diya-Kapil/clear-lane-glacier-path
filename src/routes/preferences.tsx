import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Bell, Captions, Lock, Mail, MessageSquareText, NotebookPen, Save, ScreenShare, Vibrate, Video, Users, Hand, Globe, Languages } from "lucide-react";
import { Container, PageHeader } from "@/components/clear-lane/PageHeader";
import { CustomerSteps } from "@/components/clear-lane/CustomerSteps";
import { OptionCard } from "@/components/clear-lane/OptionCard";
import { PreferenceSummaryCard } from "@/components/clear-lane/PreferenceSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/app-store";
import { useStoreHydrated } from "@/store/use-hydrated-store";
import { CONTACT_LABELS, emptyPreferences, NOTIFY_LABELS, validatePreferences } from "@/lib/preferences";
import { CUSTOMERS } from "@/lib/seed";
import type { CommPreferences, ContactMethod, InterpreterPref, NotifyStyle } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Communication preferences — Clear Lane" },
      { name: "description", content: "Tell the service team how you prefer to communicate: text, captions, interpreter or written notes." },
      { property: "og:title", content: "Communication preferences — Clear Lane" },
      { property: "og:description", content: "Set how the service team should communicate with you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PreferencesPage,
});

const CONTACT_OPTIONS: { v: ContactMethod; Icon: typeof Captions; desc: string }[] = [
  { v: "text", Icon: MessageSquareText, desc: "Messages and updates in writing" },
  { v: "captions", Icon: Captions, desc: "Advisor speech shown as live text" },
  { v: "interpreter", Icon: Video, desc: "A human interpreter by video" },
  { v: "notes", Icon: NotebookPen, desc: "Pen and paper or typed notes" },
];
const NOTIFY_OPTIONS: { v: NotifyStyle; Icon: typeof Bell; desc: string }[] = [
  { v: "vibration", Icon: Vibrate, desc: "Your phone buzzes" },
  { v: "flash", Icon: ScreenShare, desc: "The screen flashes" },
  { v: "text", Icon: MessageSquareText, desc: "On-screen and text message" },
  { v: "email", Icon: Mail, desc: "A copy by email" },
];
const STEP_TITLES = ["How we talk with you", "Language & alerts", "Privacy & save"];

function toggle<T>(list: T[], v: T, on: boolean) {
  return on ? [...new Set([...list, v])] : list.filter((x) => x !== v);
}

function PreferencesPage() {
  const hydrated = useStoreHydrated();
  const profile = useAppStore((s) => s.profile);
  const [editing, setEditing] = useState(false);

  return (
    <Container>
      <CustomerSteps current={0} />
      <PageHeader eyebrow="Step 1 of 4" title="Your communication preferences">
        Tell us how you'd like to communicate. We only save these choices — never a medical label.
      </PageHeader>
      {!hydrated ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading your preferences">
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </div>
      ) : profile && !editing ? (
        <div className="space-y-6 rise-in">
          <PreferenceSummaryCard prefs={profile} onEdit={() => setEditing(true)} />
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/find">Next: find a dealership <ArrowRight aria-hidden /></Link>
            </Button>
          </div>
        </div>
      ) : (
        <PreferenceWizard initial={profile ?? emptyPreferences()} onDone={() => setEditing(false)} />
      )}
    </Container>
  );
}

function PreferenceWizard({ initial, onDone }: { initial: CommPreferences; onDone: () => void }) {
  const saveProfile = useAppStore((s) => s.saveProfile);
  const [p, setP] = useState<CommPreferences>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const set = (patch: Partial<CommPreferences>) => setP((x) => ({ ...x, ...patch }));

  const save = () => {
    const errs = validatePreferences(p);
    setErrors(errs);
    if (errs.length) return;
    saveProfile(p);
    toast.success("Preferences saved", { description: "Every advisor will see these before they talk with you." });
    onDone();
  };

  const loadSample = (i: number) => {
    const c = CUSTOMERS[i];
    if (c) setP({ ...c.prefs, consent: false });
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ol className="flex gap-2" aria-label="Onboarding progress">
          {STEP_TITLES.map((t, i) => (
            <li key={t} aria-current={i === step ? "step" : undefined}
              className={`h-2.5 w-14 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}>
              <span className="sr-only">{`Step ${i + 1}: ${t}${i < step ? " (done)" : ""}`}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Demo:</span>
          {CUSTOMERS.map((c, i) => (
            <Button key={c.id} variant="ghost" size="sm" onClick={() => loadSample(i)}>
              <Users aria-hidden /> {c.prefs.name}
            </Button>
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold" aria-live="polite">Step {step + 1}: {STEP_TITLES[step]}</h2>

      {step === 0 && (
        <div className="mt-6 space-y-7">
          <div className="max-w-sm">
            <Label htmlFor="name" className="text-base font-semibold">First name</Label>
            <Input id="name" value={p.name} onChange={(e) => set({ name: e.target.value })} className="mt-2 h-12 text-lg" autoComplete="given-name" />
          </div>
          <fieldset>
            <legend className="text-lg font-semibold">Preferred ways to communicate <span className="font-normal text-muted-foreground">(choose any)</span></legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CONTACT_OPTIONS.map(({ v, Icon, desc }) => (
                <OptionCard key={v} name="contact" checked={p.contact.includes(v)} onChange={(on) => set({ contact: toggle(p.contact, v, on) })}
                  title={CONTACT_LABELS[v]} description={desc} icon={<Icon />} />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-lg font-semibold">Interpreter</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {([["none", "Not needed"], ["on-request", "On request"], ["always", "Please have one ready"]] as [InterpreterPref, string][]).map(([v, t]) => (
                <OptionCard key={v} type="radio" name="interp" checked={p.interpreter === v} onChange={() => set({ interpreter: v })} title={t} />
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 space-y-7">
          <fieldset>
            <legend className="text-lg font-semibold">Preferred language</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <OptionCard type="radio" name="lang" checked={p.language === "English"} onChange={() => set({ language: "English" })} title="Written English" icon={<Globe />} />
              <OptionCard type="radio" name="lang" checked={p.language === "ASL"} onChange={() => set({ language: "ASL" })} title="ASL" description="American Sign Language" icon={<Hand />} />
              <OptionCard type="radio" name="lang" checked={p.language === "Other"} onChange={() => set({ language: "Other" })} title="Other" icon={<Languages />} />
            </div>
            {p.language === "Other" && (
              <div className="mt-3 max-w-sm">
                <Label htmlFor="lang-other" className="font-semibold">Which language?</Label>
                <Input id="lang-other" value={p.languageOther} onChange={(e) => set({ languageOther: e.target.value })} className="mt-2 h-12" />
              </div>
            )}
          </fieldset>
          <fieldset>
            <legend className="text-lg font-semibold">How should we get your attention? <span className="font-normal text-muted-foreground">(choose any)</span></legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {NOTIFY_OPTIONS.map(({ v, Icon, desc }) => (
                <OptionCard key={v} name="notify" checked={p.notify.includes(v)} onChange={(on) => set({ notify: toggle(p.notify, v, on) })}
                  title={NOTIFY_LABELS[v]} description={desc} icon={<Icon />} />
              ))}
            </div>
            {p.notify.includes("email") && (
              <div className="mt-3 max-w-sm">
                <Label htmlFor="email" className="font-semibold">Email address</Label>
                <Input id="email" type="email" value={p.email} onChange={(e) => set({ email: e.target.value })} className="mt-2 h-12" autoComplete="email" />
              </div>
            )}
          </fieldset>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-5">
          <div className="flex gap-3 rounded-2xl bg-secondary p-5 text-secondary-foreground">
            <Lock className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold">Your privacy, in plain words</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>We save only how you like to communicate — not why.</li>
                <li>Advisors see a short line like "Text and captions preferred".</li>
                <li>You can change or delete this at any time.</li>
                <li>In this prototype, everything stays on this device.</li>
              </ul>
            </div>
          </div>
          <OptionCard name="consent" checked={p.consent} onChange={(v) => set({ consent: v })}
            title="I agree to Clear Lane saving my communication preferences"
            description="Used only to set up captions, interpreters and visual alerts for my visits." />
        </div>
      )}

      {errors.length > 0 && (
        <div role="alert" className="mt-6 rounded-2xl border-2 border-destructive bg-danger-soft p-4">
          <p className="font-semibold">Almost there — please fix:</p>
          <ul className="mt-1 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-border pt-6">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft aria-hidden /> Back
        </Button>
        {step < 2 ? (
          <Button variant="hero" onClick={() => setStep((s) => s + 1)}>Next <ArrowRight aria-hidden /></Button>
        ) : (
          <Button variant="hero" onClick={save}><Save aria-hidden /> Save preferences</Button>
        )}
      </div>
    </div>
  );
}
