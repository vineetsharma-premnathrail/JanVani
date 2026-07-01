"use client";

import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-[var(--color-ink-soft)]">{t.footer.tagline}</p>
            <p className="mt-1.5 text-sm text-[var(--color-ink-soft)] opacity-80">{t.footer.built}</p>
          </div>
          <div className="text-sm text-[var(--color-ink-soft)] opacity-80">
            <div className="rule-ledger mb-4 w-40" />
            <p>{t.footer.rights}</p>
            <p className="mt-1">© {new Date().getFullYear()} JanVaani</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
