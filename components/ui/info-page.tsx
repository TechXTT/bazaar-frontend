import { ReactNode } from "react";

type InfoPageProps = {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Constrain prose width; defaults to a comfortable reading measure. */
  width?: "prose" | "wide";
};

/**
 * Shared shell for static / informational pages (FAQ, About, Terms, …).
 * Provides a consistent hero header with a soft violet glow and a centered
 * content column, matching the Violet-on-Slate design system.
 */
export default function InfoPage({
  eyebrow,
  title,
  subtitle,
  children,
  width = "prose",
}: InfoPageProps) {
  const max = width === "wide" ? "max-w-5xl" : "max-w-3xl";
  return (
    <div className="relative">
      {/* Header glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden">
        <div className="absolute left-1/2 top-[-120px] h-72 w-[640px] -translate-x-1/2 rounded-full bg-vault-accent/15 blur-[120px]" />
      </div>

      <div className={`relative mx-auto ${max} px-4 py-16 sm:px-6 lg:py-20`}>
        <header className="space-y-3 text-center">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-vault-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-vault-text-secondary sm:text-base">
              {subtitle}
            </p>
          )}
        </header>

        <div className="mt-12">{children}</div>
      </div>
    </div>
  );
}

/**
 * A titled section used by the legal / long-form pages.
 */
export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-vault-text-secondary">
        {children}
      </div>
    </section>
  );
}
