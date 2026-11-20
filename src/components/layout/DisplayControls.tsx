import { Settings2, Contrast, Moon, Languages, Type } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SIZES = [
  { v: 0 as const, label: "A", aria: "Standard text" },
  { v: 1 as const, label: "A+", aria: "Large text" },
  { v: 2 as const, label: "A++", aria: "Extra large text" },
];

/** Text size, high contrast, theme and language controls. */
export function DisplayControls() {
  const t = useT();
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label={t("display")}>
          <Settings2 aria-hidden />
          <span className="hidden sm:inline">{t("display")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-5 rounded-2xl p-5">
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 font-semibold">
            <Type className="h-5 w-5" aria-hidden /> {t("textSize")}
          </legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("textSize")}>
            {SIZES.map((s) => (
              <button
                key={s.v}
                type="button"
                role="radio"
                aria-checked={settings.textSize === s.v}
                aria-label={s.aria}
                onClick={() => setSettings({ textSize: s.v })}
                className={cn(
                  "tap rounded-xl border-2 font-display font-bold transition-colors",
                  settings.textSize === s.v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
                )}
                style={{ fontSize: `${1 + s.v * 0.2}rem` }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="hc" className="flex items-center gap-2 text-base"><Contrast className="h-5 w-5" aria-hidden /> {t("contrast")}</Label>
          <Switch id="hc" checked={settings.highContrast} onCheckedChange={(v) => setSettings({ highContrast: v })} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="theme" className="flex items-center gap-2 text-base"><Moon className="h-5 w-5" aria-hidden /> {t("theme")}</Label>
          <Switch id="theme" checked={settings.theme === "dark"} onCheckedChange={(v) => setSettings({ theme: v ? "dark" : "light" })} />
        </div>
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 font-semibold"><Languages className="h-5 w-5" aria-hidden /> {t("language")}</legend>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("language")}>
            {([["en", "English"], ["hi", "हिन्दी"]] as const).map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={settings.lang === v} lang={v}
                onClick={() => setSettings({ lang: v })}
                className={cn("tap rounded-xl border-2 font-semibold", settings.lang === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Hindi covers menus and the home screen in this prototype.</p>
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}
