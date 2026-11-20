import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { DisplayControls } from "./DisplayControls";
import { SoundOffBadge, SoundOffToggle } from "./SoundOffToggle";
import { useT, type TKey } from "@/lib/i18n";

const NAV: { to: "/" | "/preferences" | "/find" | "/report" | "/status" | "/advisor" | "/impact"; key: TKey }[] = [
  { to: "/preferences", key: "prefs" },
  { to: "/find", key: "find" },
  { to: "/report", key: "report" },
  { to: "/status", key: "status" },
  { to: "/advisor", key: "advisor" },
  { to: "/impact", key: "impact" },
];

const linkCls =
  "rounded-lg px-3 py-2 text-[0.95rem] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground tap inline-flex items-center";

export function AppHeader() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <SoundOffBadge />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className={linkCls} activeProps={{ className: "bg-secondary text-secondary-foreground", "aria-current": "page" }}>
                  {t(n.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SoundOffToggle />
          <DisplayControls />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-2 px-4">
                <ul className="flex flex-col gap-1">
                  {[{ to: "/" as const, key: "home" as TKey }, ...NAV].map((n) => (
                    <li key={n.to}>
                      <Link to={n.to} onClick={() => setOpen(false)} className={`${linkCls} w-full text-lg`}
                        activeProps={{ className: "bg-secondary text-secondary-foreground", "aria-current": "page" }}
                        activeOptions={{ exact: n.to === "/" }}>
                        {t(n.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
