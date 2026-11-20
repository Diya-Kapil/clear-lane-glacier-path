import { createFileRoute, Link } from "@tanstack/react-router";
import { ClientOnly, useHydrated } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowRight, CalendarCheck, CalendarPlus, Clock, LocateFixed, MapPin, MapPinOff, Navigation, Search, SlidersHorizontal, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Container, EmptyState, PageHeader } from "@/components/clear-lane/PageHeader";
import { CustomerSteps } from "@/components/clear-lane/CustomerSteps";
import { FEATURE_META, FeatureBadge, LaneMeter } from "@/components/clear-lane/Badges";
import { SlotPicker } from "@/components/clear-lane/SlotPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { DEFAULT_ORIGIN } from "@/lib/seed";
import { formatMiles, kmToMiles, sortByDistance } from "@/lib/geo";
import { nextOpenSlots } from "@/lib/slots";
import { buildIcs, downloadText } from "@/lib/ics";
import type { AccessFeature, Booking, Dealership } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const DealershipMap = lazy(() => import("@/components/clear-lane/DealershipMap"));

const dealershipsQuery = queryOptions({ queryKey: ["dealerships"], queryFn: () => api.listDealerships() });

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find an accessible service lane — Clear Lane" },
      { name: "description", content: "Nearby dealerships with captions, video interpreters, visual alerts and text-first service — and open times you can book without calling." },
      { property: "og:title", content: "Find an accessible service lane — Clear Lane" },
      { property: "og:description", content: "Book a service visit without a phone call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dealershipsQuery),
  pendingComponent: FindPending,
  errorComponent: FindError,
  component: FindPage,
});

function FindPending() {
  return (
    <Container wide>
      <CustomerSteps current={1} />
      <div className="space-y-4" aria-busy="true" aria-label="Loading dealerships">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    </Container>
  );
}

function FindError() {
  return (
    <Container>
      <EmptyState icon={<MapPinOff />} title="We couldn't load dealerships" action={<Button onClick={() => location.reload()}>Try again</Button>}>
        Please check your connection and try again.
      </EmptyState>
    </Container>
  );
}

type SortKey = "distance" | "soonest";
const ALL_FEATURES = Object.keys(FEATURE_META) as AccessFeature[];

function FindPage() {
  const { data: dealers } = useSuspenseQuery(dealershipsQuery);
  const hydrated = useHydrated();
  const bookings = useAppStore((s) => s.bookings);
  const addBooking = useAppStore((s) => s.addBooking);

  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [place, setPlace] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [features, setFeatures] = useState<AccessFeature[]>([]);
  const [maxMiles, setMaxMiles] = useState<number>(50);
  const [sort, setSort] = useState<SortKey>("distance");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [picking, setPicking] = useState<{ dealer: Dealership; initial?: Date | undefined } | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  // Fixed per mount so SSR/hydration agree; slots only render after hydration.
  const [now] = useState(() => new Date());
  const booked = useMemo(() => bookings.map((b) => b.start), [bookings]);

  const results = useMemo(() => {
    const withDist = sortByDistance(dealers, origin)
      .filter((d) => kmToMiles(d.distanceKm) <= maxMiles)
      .filter((d) => features.every((f) => d.features.includes(f)))
      .map((d) => ({ ...d, next: hydrated ? nextOpenSlots(d, now, 3, 14, booked) : [] }));
    if (sort === "soonest") withDist.sort((a, b) => (a.next[0]?.getTime() ?? Infinity) - (b.next[0]?.getTime() ?? Infinity));
    return withDist;
  }, [dealers, origin, maxMiles, features, sort, hydrated, now, booked]);

  const useMyLocation = () => {
    setLocError(null);
    if (!("geolocation" in navigator)) { setLocError("Location isn't available in this browser. Type a city or ZIP instead."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Your location" }); setLocating(false); },
      () => { setLocError("We couldn't get your location. Type a city or ZIP instead."); setLocating(false); },
      { timeout: 8000 },
    );
  };

  const searchPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocError(null);
    const hit = await api.findPlace(place);
    if (hit) setOrigin({ ...hit, label: hit.name });
    else setLocError(`We don't know "${place}" yet. Try Seattle, Bellevue, Tacoma or a ZIP like 98101.`);
  };

  const confirmSlot = (dealer: Dealership, slot: Date) => {
    const b = addBooking({ dealershipId: dealer.id, start: slot.toISOString() });
    setPicking(null);
    setConfirmed(b);
    toast.success("Visit booked", { description: `${dealer.name}, ${format(slot, "EEE d MMM, h:mm a")}` });
  };

  const confirmedDealer = confirmed ? dealers.find((d) => d.id === confirmed.dealershipId) : null;

  return (
    <Container wide>
      <CustomerSteps current={1} />
      <PageHeader eyebrow="Step 2 of 4" title="Find a dealership and book">
        See how busy each service lane is today and which accessibility services they offer. No phone call needed.
      </PageHeader>

      {/* Location */}
      <div className="mb-6 grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft lg:grid-cols-[auto_1fr] lg:items-end">
        <Button variant="navy" onClick={useMyLocation} disabled={locating} aria-describedby="loc-status">
          <LocateFixed aria-hidden /> {locating ? "Finding you…" : "Use my location"}
        </Button>
        <form onSubmit={searchPlace} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="place" className="font-semibold">Or type a city or ZIP</Label>
            <Input id="place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. Bellevue or 98004" className="mt-1.5 h-11" />
          </div>
          <Button type="submit" variant="outline"><Search aria-hidden /> Search</Button>
        </form>
        <p id="loc-status" className="flex items-center gap-2 text-sm text-muted-foreground lg:col-span-2" aria-live="polite">
          <Navigation className="h-4 w-4 text-primary" aria-hidden /> Showing distances from <strong className="text-foreground">{origin.label}</strong>
          {locError && <span role="alert" className="ml-2 font-semibold text-destructive">{locError}</span>}
        </p>
      </div>

      {/* Filters */}
      <fieldset className="mb-6 rounded-3xl border border-border bg-card p-5">
        <legend className="flex items-center gap-2 px-1 font-semibold"><SlidersHorizontal className="h-5 w-5 text-primary" aria-hidden /> Filters</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_FEATURES.map((f) => {
            const on = features.includes(f);
            const { label, Icon } = FEATURE_META[f];
            return (
              <button key={f} type="button" aria-pressed={on}
                onClick={() => setFeatures((x) => (on ? x.filter((y) => y !== f) : [...x, f]))}
                className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold",
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
                <Icon className="h-4 w-4" aria-hidden /> {label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            Within
            <select value={maxMiles} onChange={(e) => setMaxMiles(Number(e.target.value))} className="min-h-11 rounded-xl border border-input bg-card px-3">
              {[5, 10, 25, 50].map((m) => <option key={m} value={m}>{m} miles</option>)}
            </select>
          </label>
          <div role="radiogroup" aria-label="Sort by" className="flex gap-2">
            {(["distance", "soonest"] as SortKey[]).map((k) => (
              <button key={k} type="button" role="radio" aria-checked={sort === k} onClick={() => setSort(k)}
                className={cn("min-h-11 rounded-xl border-2 px-4 text-sm font-semibold", sort === k ? "border-navy bg-navy text-navy-foreground" : "border-border bg-card hover:bg-muted")}>
                {k === "distance" ? "Nearest first" : "Soonest slot"}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">{results.length} dealership{results.length === 1 ? "" : "s"} found</p>
        </div>
      </fieldset>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Map */}
        <div className="order-2 lg:order-1">
          <div className="sticky top-24 h-[22rem] overflow-hidden rounded-3xl border border-border bg-muted shadow-soft lg:h-[38rem]" aria-label="Map of dealerships" role="region">
            {tilesFailed ? (
              <div className="grid h-full place-items-center p-6 text-center">
                <div><MapPinOff className="mx-auto h-8 w-8 text-primary" aria-hidden /><p className="mt-2 font-semibold">The map couldn't load.</p><p className="text-muted-foreground">Everything is in the list — distances still work.</p></div>
              </div>
            ) : (
              <ClientOnly fallback={<Skeleton className="h-full w-full" />}>
                <Suspense fallback={<Skeleton className="h-full w-full" />}>
                  <DealershipMap
                    dealers={results.map((d) => ({ id: d.id, name: d.name, lat: d.lat, lng: d.lng, distanceLabel: formatMiles(d.distanceKm) }))}
                    origin={origin}
                    activeId={activeId}
                    onSelect={(id) => { setActiveId(id); document.getElementById(`dealer-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                    onTilesFailed={() => setTilesFailed(true)}
                  />
                </Suspense>
              </ClientOnly>
            )}
          </div>
        </div>

        {/* List */}
        <ol className="order-1 space-y-4 lg:order-2" aria-label="Dealerships">
          {results.length === 0 && (
            <li>
              <EmptyState icon={<MapPin />} title="No dealerships match"
                action={<Button variant="outline" onClick={() => { setFeatures([]); setMaxMiles(50); }}>Clear filters</Button>}>
                Try fewer filters or a larger distance.
              </EmptyState>
            </li>
          )}
          {results.map((d, i) => (
            <li key={d.id} id={`dealer-${d.id}`}>
              <article
                onMouseEnter={() => setActiveId(d.id)}
                className={cn("rounded-3xl border-2 bg-card p-5 shadow-soft transition-colors", activeId === d.id ? "border-primary" : "border-transparent")}
                aria-labelledby={`dn-${d.id}`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground" aria-hidden>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h2 id={`dn-${d.id}`} className="text-xl font-bold">{d.name}</h2>
                      <span className="font-semibold text-primary">{formatMiles(d.distanceKm)}</span>
                    </div>
                    <p className="text-muted-foreground">{d.address}, {d.city} {d.zip}</p>
                  </div>
                </div>
                <div className="mt-4"><LaneMeter status={d.laneStatus} load={d.laneLoad} /></div>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label="Accessibility services">
                  {d.features.map((f) => <li key={f}><FeatureBadge feature={f} /></li>)}
                </ul>
                <div className="mt-5">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" aria-hidden /> Next open times</p>
                  {!hydrated ? (
                    <div className="flex gap-2"><Skeleton className="h-11 w-32" /><Skeleton className="h-11 w-32" /><Skeleton className="h-11 w-32" /></div>
                  ) : d.next.length === 0 ? (
                    <p className="text-muted-foreground">No open times in the next two weeks.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {d.next.map((s) => (
                        <Button key={s.toISOString()} variant="glacier" size="sm" onClick={() => setPicking({ dealer: d, initial: s })}>
                          {format(s, "EEE h:mm a")}
                        </Button>
                      ))}
                      <Button variant="default" size="sm" onClick={() => setPicking({ dealer: d })}>
                        <CalendarCheck aria-hidden /> More times
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      {/* Slot picker */}
      <Dialog open={!!picking} onOpenChange={(o) => !o && setPicking(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Book at {picking?.dealer.name}</DialogTitle>
            <DialogDescription>Choose a day and time. You'll get a written confirmation — no phone call.</DialogDescription>
          </DialogHeader>
          {picking && <SlotPicker dealer={picking.dealer} now={now} booked={booked} initial={picking.initial} onConfirm={(s) => confirmSlot(picking.dealer, s)} />}
        </DialogContent>
      </Dialog>

      {/* Confirmation */}
      <Dialog open={!!confirmed} onOpenChange={(o) => !o && setConfirmed(null)}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          {confirmed && confirmedDealer && (
            <>
              <DialogHeader>
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success" aria-hidden><CircleCheck className="h-9 w-9" /></div>
                <DialogTitle className="text-center font-display text-2xl">You're booked</DialogTitle>
                <DialogDescription className="text-center">Booking reference {confirmed.id.toUpperCase()}</DialogDescription>
              </DialogHeader>
              <div className="rounded-2xl bg-secondary p-5 text-center text-secondary-foreground">
                <p className="font-display text-2xl font-bold">{format(new Date(confirmed.start), "EEEE d MMMM")}</p>
                <p className="text-xl font-semibold">{format(new Date(confirmed.start), "h:mm a")}</p>
                <p className="mt-2">{confirmedDealer.name}</p>
                <p className="text-sm text-muted-foreground">{confirmedDealer.address}, {confirmedDealer.city}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={() => downloadText("clear-lane-visit.ics", buildIcs({
                  title: `Car service at ${confirmedDealer.name}`,
                  start: new Date(confirmed.start),
                  durationMin: 60,
                  location: `${confirmedDealer.address}, ${confirmedDealer.city} ${confirmedDealer.zip}`,
                  description: "Booked with Clear Lane. Your communication preferences are shared with the advisor.",
                }), "text/calendar")}>
                  <CalendarPlus aria-hidden /> Add to calendar
                </Button>
                <Button asChild variant="hero" className="flex-1">
                  <Link to="/report">Show us the problem <ArrowRight aria-hidden /></Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
