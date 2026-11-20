import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children, icon }: { eyebrow?: string; title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-8 rise-in">
      {eyebrow && <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>}
      <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground sm:text-4xl">
        {icon}
        {title}
      </h1>
      {children && <div className="mt-3 max-w-2xl text-lg text-muted-foreground">{children}</div>}
    </div>
  );
}

export function Section({ title, description, children, id }: { title: string; description?: string; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
      <h2 id={id} className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-border bg-muted/50 px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary [&_svg]:h-7 [&_svg]:w-7" aria-hidden>{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      {children && <div className="max-w-md text-muted-foreground">{children}</div>}
      {action}
    </div>
  );
}

export function Container({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={`mx-auto w-full ${wide ? "max-w-7xl" : "max-w-5xl"} px-4 py-8 sm:py-12`}>{children}</div>;
}
