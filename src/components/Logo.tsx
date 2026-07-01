/* JanVaani emblem: a sound wave rising into bars —
   "voice becomes evidence becomes action." */
export function Logo({ className = "", size = 34 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        role="img"
      >
        <circle cx="20" cy="20" r="19" fill="var(--color-ink)" />
        {/* rising bars — the "ledger" of demand */}
        <g stroke="var(--color-marigold)" strokeWidth="2.6" strokeLinecap="round">
          <line x1="11" y1="25" x2="11" y2="21" />
          <line x1="16" y1="25" x2="16" y2="16" />
          <line x1="21" y1="25" x2="21" y2="12" />
          <line x1="26" y1="25" x2="26" y2="18" />
        </g>
        {/* the "voice" — a small speech dot */}
        <circle cx="29" cy="13" r="2.4" fill="var(--color-terracotta)" />
      </svg>
      <span
        className="font-display leading-none"
        style={{ fontWeight: 600, fontSize: size * 0.62, letterSpacing: "-0.02em" }}
      >
        Jan<span style={{ color: "var(--color-marigold-deep)" }}>Vaani</span>
      </span>
    </span>
  );
}
