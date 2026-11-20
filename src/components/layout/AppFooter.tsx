import { FlaskConical } from "lucide-react";
import { useT } from "@/lib/i18n";

export function AppFooter() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-semibold">
          <FlaskConical className="h-4 w-4" aria-hidden /> {t("prototype")}
        </p>
        <p className="text-navy-muted">Clear Lane · Accessibility-first service lane · Hackathon prototype</p>
      </div>
    </footer>
  );
}
