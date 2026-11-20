import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Container, EmptyState, PageHeader } from "@/components/clear-lane/PageHeader";
import { CustomerSteps } from "@/components/clear-lane/CustomerSteps";
import { Button } from "@/components/ui/button";
import { STAGES, stageIndex } from "@/lib/catalog";
import { useAppStore, selectRequest } from "@/store/app-store";
import { useStoreHydrated } from "@/store/use-hydrated-store";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "My service status — Clear Lane" },
      { name: "description", content: "Follow every step of your car service on screen: checked in, diagnosing, approval, repair, ready." },
      { property: "og:title", content: "My service status — Clear Lane" },
      { property: "og:description", content: "Follow your car service on screen, no calls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const hydrated = useStoreHydrated();
  const activeId = useAppStore((s) => s.activeRequestId);
  const req = useAppStore(selectRequest(activeId));
  return (
    <Container>
      <CustomerSteps current={3} />
      <PageHeader eyebrow="Step 4 of 4" title="Your service status">Every update appears here in writing.</PageHeader>
      {!hydrated ? (
        <Skeleton className="h-48 w-full rounded-3xl" />
      ) : !req ? (
        <EmptyState icon={<ClipboardList />} title="No active request yet" action={<Button asChild variant="hero"><Link to="/report">Report a problem</Link></Button>}>
          Send a request and you'll follow it here.
        </EmptyState>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Request {req.id}</p>
          <ol className="mt-5 space-y-3">
            {STAGES.map((s, i) => {
              const cur = stageIndex(req.stage);
              const state = i < cur ? "Done" : i === cur ? "Now" : "Next";
              return (
                <li key={s.id} aria-current={i === cur ? "step" : undefined}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${i === cur ? "border-primary bg-secondary" : "border-border"}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i <= cur ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} aria-hidden>{i + 1}</span>
                  <div>
                    <p className="font-semibold">{s.label} <span className="text-sm text-muted-foreground">· {state}</span></p>
                    <p className="text-muted-foreground">{s.plain}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </Container>
  );
}
