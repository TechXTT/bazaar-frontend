import Link from "next/link";

// Vault 404 (Figma node 36:37): gradient "404", reassuring copy, accent CTA.
export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="relative flex flex-col items-center justify-center gap-3.5 overflow-hidden rounded-vault-xl border border-vault-border bg-vault-bg px-8 py-20 text-center sm:px-16">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[500px] -translate-x-1/2 rounded-full bg-vault-violet/20 blur-[120px]" />
        <p className="relative bg-gradient-to-br from-vault-violet to-vault-accent bg-clip-text text-[88px] font-bold leading-none tracking-[-1.76px] text-transparent">
          404
        </p>
        <h1 className="relative text-h2 tracking-[-0.24px] text-vault-text">This page wandered off</h1>
        <p className="relative max-w-md text-body text-vault-text-secondary">
          The link may be broken or the page moved. Your funds and orders are safe on-chain.
        </p>
        <Link
          href="/"
          className="relative mt-2 inline-flex items-center rounded-vault-md bg-vault-accent px-[22px] py-3.5 text-body-strong text-vault-on-accent shadow-vault-glow transition hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
