"use client";

import { useState, useRef, useEffect } from "react";
import { LOCALES, useI18n } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost !py-2 !px-3.5 !min-h-0 text-sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.lang}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"
            stroke="currentColor"
            strokeWidth="1.7"
          />
        </svg>
        <span className="font-semibold">{current.native}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="card absolute right-0 mt-2 w-44 overflow-hidden p-1.5 z-50 shadow-xl"
        >
          {LOCALES.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === locale}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(22,34,29,0.06)] ${
                  l.code === locale ? "font-bold" : ""
                }`}
              >
                <span>{l.native}</span>
                <span className="text-xs opacity-55">{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
