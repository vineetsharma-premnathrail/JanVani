"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HotspotMap } from "@/components/HotspotMap";
import { Skeleton, SkeletonCard } from "@/components/Skeleton";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";
import { auth } from "@/lib/firebase";
import {
  getDashboardSummary,
  getDashboardEvidence,
  getDashboardConsensus,
  getRankedIssues,
  getDashboardProgress,
  listComplaints,
  updateComplaint,
  COMPLAINT_STATUSES,
  DEPARTMENTS,
  type DashboardSummary,
  type EvidenceOut,
  type ConsensusCluster,
  type RankedIssue,
  type ProgressOut,
  type RecentComplaint,
  type ComplaintStatus,
  type Department,
} from "@/services/api";

const RECENT_PAGE_SIZE = 20;

const fmt = (n: number) => n.toLocaleString("en-US");

const LEVEL_COLOR: Record<string, string> = {
  High: "var(--color-terracotta)",
  Medium: "var(--color-marigold)",
  Low: "var(--color-sage)",
};

const VERIFICATION_COLOR: Record<string, string> = {
  Strong: "var(--color-sage)",
  Moderate: "var(--color-marigold)",
  Weak: "var(--color-ink-soft)",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  new: "var(--color-ink-soft)",
  in_progress: "var(--color-marigold)",
  resolved: "var(--color-sage)",
  rejected: "var(--color-terracotta)",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const { ready, firebaseUser, isMp } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [evidence, setEvidence] = useState<EvidenceOut | null>(null);
  const [consensus, setConsensus] = useState<ConsensusCluster[]>([]);
  const [rankedIssues, setRankedIssues] = useState<RankedIssue[]>([]);
  const [progress, setProgress] = useState<ProgressOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [exploreCategory, setExploreCategory] = useState<string | null>(null);
  const [exploreComplaints, setExploreComplaints] = useState<RecentComplaint[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);

  async function loadDashboard() {
    setError(null);
    setRetryAction(null);
    setLoading(true);
    try {
      const idToken = await auth!.currentUser!.getIdToken();
      // summary is the one call this page can't render without — everything
      // else degrades gracefully (e.g. ranked-issues/progress 404ing against
      // an older deployed backend shouldn't take down the whole page).
      setSummary(await getDashboardSummary(idToken, { recentLimit: RECENT_PAGE_SIZE }));

      const [e, c, ranked, prog] = await Promise.allSettled([
        getDashboardEvidence(idToken),
        getDashboardConsensus(idToken),
        getRankedIssues(idToken),
        getDashboardProgress(idToken),
      ]);
      if (e.status === "fulfilled") setEvidence(e.value);
      if (c.status === "fulfilled") setConsensus(c.value);
      if (ranked.status === "fulfilled") setRankedIssues(ranked.value);
      if (prog.status === "fulfilled") setProgress(prog.value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
      setRetryAction(() => loadDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready) return;
    if (!firebaseUser) {
      window.location.href = "/sign-in?role=mp";
      return;
    }
    if (!isMp) {
      window.location.href = "/";
      return;
    }
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, firebaseUser, isMp]);

  async function fetchExploreComplaints(category: string) {
    setExploreLoading(true);
    setError(null);
    try {
      const idToken = await auth!.currentUser!.getIdToken();
      setExploreComplaints(await listComplaints(idToken, { category, limit: 20 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load complaints for this category");
      setRetryAction(() => () => fetchExploreComplaints(category));
    } finally {
      setExploreLoading(false);
    }
  }

  function toggleExplore(category: string) {
    if (exploreCategory === category) {
      setExploreCategory(null);
      setExploreComplaints([]);
      return;
    }
    setExploreCategory(category);
    fetchExploreComplaints(category);
  }

  async function loadMore() {
    if (!summary || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const idToken = await auth!.currentUser!.getIdToken();
      const next = await getDashboardSummary(idToken, {
        recentLimit: RECENT_PAGE_SIZE,
        recentOffset: summary.recent.length,
      });
      setSummary({ ...next, recent: [...summary.recent, ...next.recent] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more submissions");
      setRetryAction(() => loadMore);
    } finally {
      setLoadingMore(false);
    }
  }

  async function applyComplaintUpdate(
    complaintId: string,
    update: { status?: ComplaintStatus; assigned_department?: Department }
  ) {
    setStatusUpdating(complaintId);
    setError(null);
    try {
      const idToken = await auth!.currentUser!.getIdToken();
      const updated = await updateComplaint(idToken, complaintId, update);
      setSummary((prev) =>
        prev ? { ...prev, recent: prev.recent.map((r) => (r.id === complaintId ? { ...r, ...updated } : r)) } : prev
      );
      setExploreComplaints((prev) => prev.map((r) => (r.id === complaintId ? { ...r, ...updated } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update complaint");
      setRetryAction(() => () => applyComplaintUpdate(complaintId, update));
    } finally {
      setStatusUpdating(null);
    }
  }

  if (!ready || !firebaseUser || !isMp) return null;

  const maxCategoryCount = summary?.by_category.reduce((m, c) => Math.max(m, c.count), 0) || 1;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[rgba(246,241,231,0.82)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/" aria-label="JanVaani home">
            <Logo size={30} />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="relative">
              <button
                className="btn btn-ghost !p-2.5 !min-h-0"
                aria-label="Menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {menuOpen && (
                <ul role="menu" className="card absolute right-0 mt-2 w-56 overflow-hidden p-1.5 z-50 shadow-xl">
                  <li>
                    <Link
                      href="/gov-data"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-[var(--color-line)]"
                    >
                      Update gov data
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-4xl px-5 py-12">
        <p className="eyebrow text-[var(--color-terracotta)]">{t.dash.badge}</p>
        <h1 className="display-lg mt-2">{CONSTITUENCY_LABEL}</h1>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-[rgba(182,74,52,0.12)] px-4 py-3 text-sm text-[var(--color-terracotta)]"
          >
            <span>{error}</span>
            <button
              type="button"
              className="rounded-full border border-[var(--color-terracotta)] px-3 py-1 text-xs font-semibold"
              onClick={() => (retryAction ?? loadDashboard)()}
            >
              Retry
            </button>
          </div>
        )}

        {loading && !summary && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </div>
        )}

        {summary && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Kpi label={t.dash.kpiVoices} value={fmt(summary.total_complaints)} />
              <Kpi label={t.dash.kpiThemes} value={fmt(summary.by_category.length)} />
              <Kpi label={t.dash.kpiAreas} value={fmt(summary.distinct_locations)} />
            </div>

            {evidence && (
              <section className="mt-10">
                <p className="eyebrow text-[var(--color-ink-soft)]">Ranked issues</p>
                <div className="card mt-4 p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ background: LEVEL_COLOR[evidence.level] || "var(--color-ink)" }}
                    >
                      {evidence.score}
                    </div>
                    <div>
                      <p className="text-lg font-bold">{evidence.level} overall priority</p>
                      <p className="text-sm text-[var(--color-ink-soft)]">Evidence score out of 100</p>
                    </div>
                  </div>
                  {evidence.explanation && (
                    <p className="mt-5 text-[1.05rem] leading-relaxed">{evidence.explanation}</p>
                  )}
                </div>

                {rankedIssues.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {rankedIssues.map((issue) => (
                      <div key={issue.category} className="card p-5">
                        <button
                          type="button"
                          className="flex w-full items-center gap-4 text-left"
                          onClick={() => toggleExplore(issue.category)}
                          aria-expanded={exploreCategory === issue.category}
                        >
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ background: LEVEL_COLOR[issue.level] || "var(--color-ink)" }}
                          >
                            {issue.score}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{issue.category}</p>
                            <p className="text-sm text-[var(--color-ink-soft)]">
                              {fmt(issue.complaint_count)} complaints
                              {issue.population != null && ` · population ${fmt(Math.round(issue.population))}`}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-[var(--color-ink-soft)]">
                            {exploreCategory === issue.category ? "Hide" : "Explore"}
                          </span>
                        </button>

                        {exploreCategory === issue.category && (
                          <div className="mt-4 border-t border-[var(--color-line)] pt-4">
                            {issue.reasons.length > 0 && (
                              <ul className="space-y-1.5">
                                {issue.reasons.map((r, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-ink-soft)]">
                                    <span className="mt-0.5 text-[var(--color-sage)]">✓</span>
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
                              Underlying complaints
                            </p>
                            {exploreLoading ? (
                              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Loading…</p>
                            ) : (
                              <div className="mt-2 divide-y divide-[var(--color-line)]">
                                {exploreComplaints.map((r) => (
                                  <ComplaintRow
                                    key={r.id}
                                    complaint={r}
                                    busy={statusUpdating === r.id}
                                    onUpdate={(update) => applyComplaintUpdate(r.id, update)}
                                  />
                                ))}
                                {exploreComplaints.length === 0 && (
                                  <p className="py-3 text-sm text-[var(--color-ink-soft)]">No complaints found.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {progress && <ProgressTracker progress={progress} />}

            {consensus.length > 0 && (
              <section className="mt-10">
                <p className="eyebrow text-[var(--color-ink-soft)]">Linked issues</p>
                <div className="mt-4 space-y-4">
                  {consensus.map((c, i) => (
                    <div key={i} className="card p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {c.categories.map((cat) => (
                          <span key={cat} className="rounded-full bg-[var(--color-line)] px-2.5 py-1 font-semibold">
                            {cat}
                          </span>
                        ))}
                        <span className="text-[var(--color-ink-soft)]">{c.location_hint}</span>
                        <span className="ml-auto font-semibold text-[var(--color-terracotta)]">
                          {c.confidence}% confidence
                        </span>
                      </div>
                      <p className="mt-3 text-[1.05rem]">
                        <strong>{c.complaint_count} complaints</strong> may share one root cause: {c.root_cause}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-10">
              <p className="eyebrow text-[var(--color-ink-soft)]">Hotspot map</p>
              <div className="card mt-4 overflow-hidden p-2">
                <HotspotMap points={summary.map_points} />
              </div>
            </section>

            {summary.total_complaints === 0 ? (
              <div className="card mt-10 p-8 text-center text-[var(--color-ink-soft)]">
                No complaints have been submitted yet. Once citizens raise their voice, they&apos;ll show up here —
                grouped by what they&apos;re about.
              </div>
            ) : (
              <>
                <section className="mt-10">
                  <p className="eyebrow text-[var(--color-ink-soft)]">{t.dash.themesTitle}</p>
                  <div className="card mt-4 p-6 sm:p-8">
                    <div className="space-y-4">
                      {summary.by_category.map((c) => (
                        <div key={c.category}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-semibold">{c.category}</span>
                            <span className="text-[var(--color-ink-soft)]">
                              {fmt(c.count)} {t.dash.citizens}
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                            <div
                              className="h-full rounded-full bg-[var(--color-marigold)]"
                              style={{ width: `${Math.max(6, (c.count / maxCategoryCount) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="mt-10">
                  <p className="eyebrow text-[var(--color-ink-soft)]">Recent submissions</p>
                  <div className="card mt-4 divide-y divide-[var(--color-line)] p-0">
                    {summary.recent.map((r) => (
                      <ComplaintRow
                        key={r.id}
                        complaint={r}
                        busy={statusUpdating === r.id}
                        onUpdate={(update) => applyComplaintUpdate(r.id, update)}
                      />
                    ))}
                  </div>
                  {summary.recent_has_more && (
                    <button
                      type="button"
                      className="btn btn-ghost mt-4 w-full"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const CONSTITUENCY_LABEL = "Your constituency dashboard";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{label}</p>
    </div>
  );
}

function ComplaintRow({
  complaint: r,
  busy,
  onUpdate,
}: {
  complaint: RecentComplaint;
  busy: boolean;
  onUpdate: (update: { status?: ComplaintStatus; assigned_department?: Department }) => void;
}) {
  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-soft)]">
        {r.category && (
          <span className="rounded-full bg-[var(--color-line)] px-2.5 py-1 font-semibold">{r.category}</span>
        )}
        {r.location && <span>{r.location}</span>}
        {r.verification_status && (
          <span
            className="rounded-full px-2.5 py-1 font-semibold text-white"
            style={{ background: VERIFICATION_COLOR[r.verification_status] || "var(--color-ink)" }}
          >
            {r.verification_status} evidence · {r.verification_confidence}%
          </span>
        )}
        <span className="ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
      </div>

      {r.text && <p className="mt-2 text-[1.05rem]">{r.text}</p>}
      {r.anonymous && <p className="mt-1 text-xs text-[var(--color-ink-soft)]">Anonymous</p>}

      {r.audio_url && <audio className="mt-3 h-9 w-full max-w-sm" controls preload="none" src={r.audio_url} />}
      {r.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.photo_url} alt="Complaint photo" className="mt-3 max-h-48 rounded-lg object-cover" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ background: STATUS_COLOR[r.status ?? "new"] || "var(--color-ink)" }}
        >
          {STATUS_LABEL[r.status ?? "new"] || r.status || "New"}
        </span>
        <select
          className="rounded-lg border border-[var(--color-line)] bg-transparent px-2 py-1 text-xs"
          value={r.status || "new"}
          disabled={busy}
          onChange={(e) => onUpdate({ status: e.target.value as ComplaintStatus })}
          aria-label="Update complaint status"
        >
          {COMPLAINT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-[var(--color-line)] bg-transparent px-2 py-1 text-xs"
          value={r.assigned_department ?? ""}
          disabled={busy}
          onChange={(e) => onUpdate({ assigned_department: e.target.value as Department })}
          aria-label="Assign to department"
        >
          <option value="" disabled>
            Assign department…
          </option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ProgressTracker({ progress }: { progress: ProgressOut }) {
  const total = progress.by_status.reduce((s, c) => s + c.count, 0);
  return (
    <section className="mt-10">
      <p className="eyebrow text-[var(--color-ink-soft)]">Progress tracker</p>
      <div className="card mt-4 p-6 sm:p-8">
        {total === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No complaints to track yet.</p>
        ) : (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
              {COMPLAINT_STATUSES.map((s) => {
                const count = progress.by_status.find((c) => c.status === s)?.count ?? 0;
                if (count === 0) return null;
                return (
                  <div
                    key={s}
                    style={{ width: `${(count / total) * 100}%`, background: STATUS_COLOR[s] }}
                    title={`${STATUS_LABEL[s]}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--color-ink-soft)]">
              {COMPLAINT_STATUSES.map((s) => {
                const count = progress.by_status.find((c) => c.status === s)?.count ?? 0;
                return (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                    {STATUS_LABEL[s]}: {fmt(count)}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {progress.by_department.length > 0 && (
          <div className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
              By department
            </p>
            {progress.by_department.map((d) => {
              const deptTotal = d.by_status.reduce((s, c) => s + c.count, 0);
              return (
                <div key={d.department} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 font-medium">{d.department}</span>
                  <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                    {COMPLAINT_STATUSES.map((s) => {
                      const count = d.by_status.find((c) => c.status === s)?.count ?? 0;
                      if (count === 0 || deptTotal === 0) return null;
                      return (
                        <div
                          key={s}
                          style={{ width: `${(count / deptTotal) * 100}%`, background: STATUS_COLOR[s] }}
                          title={`${STATUS_LABEL[s]}: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <span className="w-10 shrink-0 text-right text-[var(--color-ink-soft)]">{deptTotal}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
