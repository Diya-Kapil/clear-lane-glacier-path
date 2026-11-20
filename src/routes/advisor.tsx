import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeader } from "@/components/clear-lane/PageHeader";
import { PreferenceBanner } from "@/components/clear-lane/PreferenceSummary";
import { STAGES } from "@/lib/catalog";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Advisor queue — Clear Lane" },
      { name: "description", content: "Service advisor view: incoming requests with each customer's communication preference." },
      { property: "og:title", content: "Advisor queue — Clear Lane" },
      { property: "og:description", content: "Incoming requests with communication preferences up front." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdvisorPage,
});

function AdvisorPage() {
  const requests = useAppStore((s) => s.requests);
  const advance = useAppStore((s) => s.advanceStage);
  return (
    <Container wide>
      <PageHeader eyebrow="Service advisor" title="Request queue">Each card shows how the customer prefers to communicate.</PageHeader>
      <ul className="grid gap-4 md:grid-cols-2">
        {requests.map((r) => (
          <li key={r.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{r.id} · {r.customerName}</h2>
              <span className="text-sm font-semibold text-primary">{STAGES.find((s) => s.id === r.stage)?.label}</span>
            </div>
            <PreferenceBanner prefs={r.prefs} compact />
            <p className="mt-3 text-muted-foreground">{r.vehicle} — {r.note || "No note"}</p>
            {r.stage !== "ready" && (
              <button type="button" onClick={() => advance(r.id)} className="mt-4 min-h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90">
                Move to next step
              </button>
            )}
          </li>
        ))}
      </ul>
    </Container>
  );
}
