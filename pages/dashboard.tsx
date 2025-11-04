import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import Filters, { type Filters as FState } from "@/components/Filters";
import ReviewTable from "@/components/ReviewTable";
import RatingBadge from "@/components/RatingBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type NormalizedReview = {
  id: number;
  listingId: string;
  listingName: string;
  channel: string;
  type: string;
  status: string;
  rating: number | null;
  categories: Record<string, number>;
  submittedAt: string; // ISO
  guestName: string;
  publicReview: string;
};

export default function Dashboard() {
  const router = useRouter();

  // --- 1) Start with URL-provided filters (from index search)
  const [f, setF] = useState<FState>({ sort: "date-desc" });
  useEffect(() => {
    const q = router.query;
    const preset: FState = {
      search: typeof q.search === "string" ? q.search : undefined,
      from: typeof q.from === "string" ? q.from : undefined,
      to: typeof q.to === "string" ? q.to : undefined,
      minRating: typeof q.minRating === "string" ? Number(q.minRating) : undefined,
      channel: typeof q.channel === "string" ? q.channel : undefined,
      type: typeof q.type === "string" ? q.type : undefined,
      sort: (q.sort as FState["sort"]) || "date-desc",
    };
    // only set on first mount / when query changes, but don't override user’s later changes
    setF((prev) => ({ ...prev, ...preset }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.search, router.query.from, router.query.to, router.query.minRating, router.query.channel, router.query.type, router.query.sort]);

  // --- 2) Server-supported filters go to API; category/sort stay client-side
  const serverParams = new URLSearchParams(
    Object.entries(f)
      .filter(([k, v]) => v !== undefined && !["category", "categoryMin", "sort"].includes(k))
      .map(([k, v]) => [k, String(v)])
  );
  const { data, isLoading, error } = useSWR(`/api/reviews/hostaway?${serverParams.toString()}`, fetcher);

  // --- 3) Client-side processing (category filter + sorting) & rebuild listing performance
  const processed = useMemo(() => {
    const reviews: NormalizedReview[] = data?.reviews || [];
    let rows = reviews;

    if (f.category && f.categoryMin !== undefined) {
      rows = rows.filter((r) => {
        const val = r.categories?.[f.category!];
        return typeof val === "number" ? val >= (f.categoryMin ?? 0) : false;
      });
    }

    const by = f.sort || "date-desc";
    rows = [...rows].sort((a, b) => {
      if (by === "rating-desc") return (b.rating ?? -Infinity) - (a.rating ?? -Infinity);
      if (by === "rating-asc") return (a.rating ?? Infinity) - (b.rating ?? Infinity);
      if (by === "date-asc") return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(); // date-desc
    });

    const byListingMap: Record<string, { listingName: string; count: number; sum: number; avg: number }> = {};
    for (const r of rows) {
      const key = r.listingId;
      byListingMap[key] ||= { listingName: r.listingName, count: 0, sum: 0, avg: 0 };
      byListingMap[key].count += 1;
      if (typeof r.rating === "number") byListingMap[key].sum += r.rating;
    }
    for (const k of Object.keys(byListingMap)) {
      const slot = byListingMap[k];
      slot.avg = slot.count ? Number((slot.sum / slot.count).toFixed(2)) : 0;
    }
    const byListing = Object.entries(byListingMap).map(([id, v]) => ({
      id,
      name: v.listingName,
      avgRating: v.avg,
      count: v.count,
    }));

    const avgShown = rows.length
      ? Number((rows.map((r) => r.rating || 0).reduce((a, b) => a + b, 0) / rows.length).toFixed(2))
      : null;

    return { rows, byListing, avgShown };
  }, [data, f]);

  // --- 4) Page chrome like the homepage (nav + hero)
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Nav (same vibe as index) */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">Flex Living</Link>
          <nav className="flex items-center gap-3">
            <Link className="text-sm text-slate-600 hover:text-slate-900" href="/">
              Home
            </Link>
            <a className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" href="#kpis">
              Insights
            </a>
          </nav>
        </div>
      </header>

      {/* Hero header */}
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Filter, sort, and approve guest reviews. KPI cards and charts update live with your current filters.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Filters onChange={setF} />
          <div className="mt-3 text-xs text-slate-500">
            Tip: Category + min sub-score and sorting are applied client-side on top of the server filters.
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section id="kpis" className="mx-auto max-w-7xl px-4 pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-slate-400 text-sm">Total Reviews (shown)</div>
            <div className="mt-1 text-3xl font-bold">{processed.rows.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-slate-400 text-sm">Average Rating</div>
            <div className="mt-2">
              <RatingBadge value={processed.avgShown} />
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-slate-400 text-sm">Listings</div>
            <div className="mt-1 text-3xl font-bold">{processed.byListing.length}</div>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Listing Performance</h2>
            <span className="text-xs text-slate-500">Bar shows average rating per listing</span>
          </div>
          <div style={{ width: "100%", height: 280 }} className="mt-4">
            <ResponsiveContainer>
              <BarChart data={processed.byListing}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgRating" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini listing cards */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {processed.byListing.map((l) => (
              <div key={l.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-slate-900 font-medium">{l.name}</div>
                <div className="mt-2 flex items-center gap-2">
                  <RatingBadge value={l.avgRating} />
                  <span className="text-slate-500 text-sm">{l.count} reviews</span>
                </div>
                <div className="mt-2 text-xs">
                  <Link className="text-slate-600 hover:text-slate-900" href={`/listings/${l.id}`}>
                    Open public page →
                  </Link>
                </div>
              </div>
            ))}
            {processed.byListing.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                No listings match your current filters.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reviews Table */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Reviews</h2>
            <div className="text-xs text-slate-500">
              {isLoading && "Loading…"}
              {error && "Error loading reviews"}
              {!isLoading && !error && `${processed.rows.length} shown`}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <ReviewTable reviews={processed.rows as any} />
          </div>
          {processed.rows.length === 0 && !isLoading && !error && (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
              Nothing to show for these filters. Try clearing search, lowering min rating, or changing dates.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} Flex Living — Dashboard.
        </div>
      </footer>
    </main>
  );
}
