import { VolumeX, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/app-store";
import { useT } from "@/lib/i18n";

/** Sound-off demo mode: shows a visible badge and guarantees media plays muted. */
export function SoundOffToggle() {
  const t = useT();
  const soundOff = useAppStore((s) => s.settings.soundOff);
  const setSettings = useAppStore((s) => s.setSettings);
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 tap">
      {soundOff ? <VolumeX className="h-5 w-5 text-primary" aria-hidden /> : <Volume2 className="h-5 w-5 text-muted-foreground" aria-hidden />}
      <span className="hidden text-sm font-semibold md:inline">{t("soundOff")}</span>
      <Switch checked={soundOff} onCheckedChange={(v) => setSettings({ soundOff: v })} aria-label={t("soundOff")} />
    </label>
  );
}

export function SoundOffBadge() {
  const t = useT();
  const soundOff = useAppStore((s) => s.settings.soundOff);
  if (!soundOff) return null;
  return (
    <div className="bg-navy text-navy-foreground" role="status">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-sm font-semibold">
        <VolumeX className="h-4 w-4" aria-hidden /> {t("soundOffOn")}
      </p>
    </div>
  );
}
