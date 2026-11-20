import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Captions, ClipboardCheck, Hand, Smartphone, UserRound, Headset, VolumeX } from "lucide-react";
import heroImg from "@/assets/hero-service-lane.jpg.asset.json";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clear Lane — a car service visit you can see, read and approve" },
      { name: "description", content: "Accessibility-first service lane for Deaf and hard-of-hearing drivers. Book, report problems and approve repairs without a single phone call." },
      { property: "og:title", content: "Clear Lane — a car service visit you can see, read and approve" },
      { property: "og:description", content: "Book, report problems and approve repairs without a single phone call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const HIGHLIGHTS = [
  { Icon: Smartphone, title: "No phone calls", body: "Book, approve and get updates in writing." },
  { Icon: Hand, title: "Point, don't explain", body: "Tap the car diagram and warning lights." },
  { Icon: Captions, title: "Captions at the counter", body: "Advisor speech shows as large live text." },
  { Icon: ClipboardCheck, title: "Every aid logged", body: "Interpreter offers and captions are recorded." },
];

function Landing() {
  const t = useT();
  return (
    <>
      <section className="glacier-lines relative overflow-hidden text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="rise-in">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-navy-foreground/30 bg-navy-foreground/10 px-4 py-1.5 text-sm font-semibold">
              <VolumeX className="h-4 w-4" aria-hidden /> Designed to work with the sound off
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">{t("heroTitle")}</h1>
            <p className="mt-5 max-w-lg text-lg text-navy-muted">{t("heroBody")}</p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-navy-foreground/15 shadow-lift">
              <img src={heroImg.url} alt="A service advisor shows a customer a tablet with large text updates at the service desk" className="aspect-[3/2] w-full object-cover" width={1536} height={1024} />
            </div>
            <div className="absolute -bottom-5 left-4 right-4 rounded-2xl bg-caption p-4 text-caption-foreground shadow-lift sm:left-8 sm:right-auto sm:max-w-sm" aria-hidden>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-glow">Advisor · live caption</p>
              <p className="mt-1 font-display text-lg font-semibold leading-snug">“Your front brake pads are worn. The estimate is $249.”</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <h2 className="sr-only">Choose your role</h2>
        <div className="relative z-10 -mt-2 grid gap-5 pt-12 md:grid-cols-2">
          <RoleCard
            to="/preferences"
            Icon={UserRound}
            title={t("imCustomer")}
            body={t("imCustomerBody")}
            cta={t("start")}
            variant="hero"
          />
          <RoleCard
            to="/advisor"
            Icon={Headset}
            title={t("imAdvisor")}
            body={t("imAdvisorBody")}
            cta={t("openAdvisor")}
            variant="navy"
          />
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-5">
              <Icon className="h-7 w-7 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function RoleCard({ to, Icon, title, body, cta, variant }: {
  to: "/preferences" | "/advisor"; Icon: typeof UserRound; title: string; body: string; cta: string; variant: "hero" | "navy";
}) {
  return (
    <article className="group flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift">
      <div className={`grid h-14 w-14 place-items-center rounded-2xl ${variant === "hero" ? "bg-gradient-teal text-primary-foreground" : "bg-navy text-navy-foreground"}`} aria-hidden>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-2xl font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-lg text-muted-foreground">{body}</p>
      <Button asChild variant={variant} size="lg" className="mt-6 self-start">
        <Link to={to}>
          {cta} <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </article>
  );
}
