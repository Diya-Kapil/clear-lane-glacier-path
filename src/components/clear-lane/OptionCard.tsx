import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Large, keyboard-friendly checkbox / radio card built on a native input,
 * so screen readers and keyboard users get standard behaviour.
 */
export function OptionCard({
  type = "checkbox", name, checked, onChange, title, description, icon, className,
}: {
  type?: "checkbox" | "radio";
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border-2 bg-card p-4 transition-colors",
        "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
        checked ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted",
        className,
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {icon && <span className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl [&_svg]:h-5 [&_svg]:w-5", checked ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")} aria-hidden>{icon}</span>}
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-1 grid h-6 w-6 shrink-0 place-items-center border-2",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
    </label>
  );
}
