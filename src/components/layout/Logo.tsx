import { Link } from "@tanstack/react-router";

/** Clear Lane wordmark: two lane lines converging into a clear road. */
export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg tap" aria-label="Clear Lane home">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-teal text-primary-foreground shadow-soft" aria-hidden>
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M10 28 L14 4" />
          <path d="M22 28 L18 4" />
          <path d="M16 26v-3M16 18v-3M16 10V8" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">Clear Lane</span>
    </Link>
  );
}
