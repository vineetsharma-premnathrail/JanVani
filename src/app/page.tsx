"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useI18n();

  const steps = [
    { n: "01", t: t.how.s1t, d: t.how.s1d, tone: "var(--color-marigold)" },
    { n: "02", t: t.how.s2t, d: t.how.s2d, tone: "var(--color-terracotta)" },
    { n: "03", t: t.how.s3t, d: t.how.s3d, tone: "var(--color-sage)" },
    { n: "04", t: t.how.s4t, d: t.how.s4d, tone: "var(--color-indigo)" },
  ];

  const stats = [
    { v: "42,000+", l: t.stats.voices },
    { v: "180", l: t.stats.themes },
    { v: "310", l: t.stats.areas },
    { v: "5", l: t.stats.langs },
  ];

  return (
    <>
      <Header />
      <main id="main">
        {/* ---------------- HERO ---------------- */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="eyebrow rise text-[var(--color-terracotta)]" style={{ animationDelay: "0.05s" }}>
                {t.hero.badge}
              </p>
              <h1 className="display-xl mt-5">
                <span className="rise block" style={{ animationDelay: "0.12s" }}>
                  {t.hero.titleA}
                </span>
                <span className="rise block" style={{ animationDelay: "0.22s" }}>
                  {t.hero.titleB}
                </span>
                <span
                  className="rise mt-2 block italic"
                  style={{ animationDelay: "0.34s", color: "var(--color-marigold-deep)" }}
                >
                  {t.hero.titleC}
                </span>
              </h1>
              <p
                className="rise mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-ink-soft)]"
                style={{ animationDelay: "0.44s" }}
              >
                {t.hero.sub}
              </p>
              <div className="rise mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.54s" }}>
                <Link href="/submit" className="btn btn-marigold text-base">
                  <MicIcon /> {t.hero.ctaPrimary}
                </Link>
                <a href="#how" className="btn btn-ghost text-base">
                  {t.hero.ctaSecondary}
                </a>
              </div>
              <p className="rise mt-5 text-sm text-[var(--color-ink-soft)] opacity-80" style={{ animationDelay: "0.62s" }}>
                {t.hero.trust}
              </p>
            </div>

            {/* Hero visual — a "living ledger" card */}
            <div className="rise" style={{ animationDelay: "0.4s" }}>
              <HeroLedger />
            </div>
          </div>

          {/* Stats strip */}
          <div className="border-y border-[var(--color-line)] bg-[rgba(239,231,214,0.55)]">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l} className="px-3 py-7 text-center md:text-left">
                  <div className="font-display text-3xl md:text-4xl" style={{ fontWeight: 560 }}>
                    {s.v}
                  </div>
                  <div className="mt-1 text-sm font-medium text-[var(--color-ink-soft)]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
          <div className="max-w-2xl">
            <p className="eyebrow text-[var(--color-terracotta)]">{t.how.eyebrow}</p>
            <h2 className="display-lg mt-3">{t.how.title}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="card relative p-7"
                style={{ borderTop: `4px solid ${s.tone}` }}
              >
                <span className="font-display text-5xl opacity-25" style={{ fontWeight: 560 }}>
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-xl" style={{ fontWeight: 560 }}>
                  {s.t}
                </h3>
                <p className="mt-2 text-[0.96rem] leading-relaxed text-[var(--color-ink-soft)]">{s.d}</p>
                {i < steps.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-[var(--color-line)] lg:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FOR YOUR MP ---------------- */}
        <section id="for-mp" className="scroll-mt-24 bg-[var(--color-ink)] text-[var(--color-paper)]">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow" style={{ color: "var(--color-marigold)" }}>
                {t.forMp.eyebrow}
              </p>
              <h2 className="display-lg mt-3">{t.forMp.title}</h2>
              <p className="mt-6 text-lg leading-relaxed opacity-85">{t.forMp.body}</p>
              <Link href="/sign-in?role=mp" className="btn btn-marigold mt-8 text-base">
                {t.forMp.cta} →
              </Link>
            </div>
            <ul className="grid gap-3">
              {[t.forMp.b1, t.forMp.b2, t.forMp.b3, t.forMp.b4].map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <CheckIcon />
                  <span className="text-[1.02rem]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ---------- decorative hero widget ---------- */
function HeroLedger() {
  const rows = [
    { label: "Roads & transport", pct: 92, tone: "var(--color-marigold)" },
    { label: "Water & sanitation", pct: 74, tone: "var(--color-terracotta)" },
    { label: "Education access", pct: 61, tone: "var(--color-sage)" },
    { label: "Primary health", pct: 48, tone: "var(--color-indigo)" },
  ];
  return (
    <div className="card overflow-hidden p-6 shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="eyebrow text-[var(--color-ink-soft)]">Priority ledger · Ward 14</span>
        <span className="rounded-full bg-[var(--color-marigold)]/20 px-2.5 py-1 text-xs font-bold text-[var(--color-marigold-deep)]">
          LIVE
        </span>
      </div>
      <div className="rule-ledger my-4" />
      <ul className="space-y-4">
        {rows.map((r, i) => (
          <li key={r.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-semibold">
                #{i + 1} {r.label}
              </span>
              <span className="font-display" style={{ fontWeight: 560 }}>
                {r.pct}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--color-paper-deep)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${r.pct}%`, backgroundColor: r.tone }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-sage)]" />
        Ranked by citizen demand × population × existing-gap data
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="11" fill="var(--color-marigold)" />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="#201401" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
