import { createFileRoute } from "@tanstack/react-router";
import { Check, VolumeX } from "lucide-react";
import { Container, PageHeader } from "@/components/clear-lane/PageHeader";
import { JOURNEY_AUDIT } from "@/lib/catalog";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — Clear Lane journey audit" },
      { name: "description", content: "Which service steps were audio-only before, and how Clear Lane makes each one visual." },
      { property: "og:title", content: "Impact — Clear Lane journey audit" },
      { property: "og:description", content: "Every service step, made visual and text-first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImpactPage,
});

function ImpactPage() {
  const accommodations = useAppStore((s) => s.accommodations.length);
  const soundOffDone = useAppStore((s) => s.requests.filter((r) => r.stage === "ready" && r.soundOff).length);
  return (
    <Container>
      <PageHeader eyebrow="Impact" title="Journey audit" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-navy p-6 text-navy-foreground"><p className="font-display text-4xl font-bold">{accommodations}</p><p>Accommodations logged</p></div>
        <div className="rounded-3xl bg-gradient-teal p-6 text-primary-foreground"><p className="font-display text-4xl font-bold">{soundOffDone}</p><p className="flex items-center gap-2"><VolumeX className="h-4 w-4" aria-hidden /> Requests completed in sound-off mode</p></div>
      </div>
      <ul className="space-y-2">
        {JOURNEY_AUDIT.map((j) => (
          <li key={j.step} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <Check className="h-5 w-5 text-success" aria-hidden />
            <span className="flex-1 font-semibold">{j.step}</span>
            <span className="text-sm text-muted-foreground">Before: {j.before}{j.audioOnly ? " (audio-only)" : ""}</span>
            <span className="text-sm font-semibold">Now: {j.after}</span>
          </li>
        ))}
      </ul>
    </Container>
  );
}
