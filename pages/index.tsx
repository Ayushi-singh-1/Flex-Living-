import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // Send search params to /dashboard
  const go = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const search = String(data.get("q") || "");
    const from = String(data.get("from") || "");
    const to = String(data.get("to") || "");
    const minRating = String(data.get("minRating") || "");

    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (minRating) qs.set("minRating", minRating);

    router.push(`/dashboard?${qs.toString()}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Nav */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="text-lg font-semibold tracking-tight">Flex Living</div>
          <nav className="flex items-center gap-3">
            <Link className="text-sm text-slate-600 hover:text-slate-900" href="/dashboard">
              Manager Dashboard
            </Link>
            <a
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              href="#search"
            >
              Search
            </a>
          </nav>
        </div>
      </header>

      {/* Hero + functional search */}
      <section id="search" className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Premium serviced apartments for work and city breaks
            </h1>
            <p className="mt-3 text-slate-600">
              Search by keyword, date range and minimum rating
            </p>

            <form onSubmit={go} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-5">
              <input
                name="q"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                placeholder="Search (area, listing, text)…"
              />
              <input
                name="from"
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="to"
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="minRating"
                type="number"
                step="0.1"
                placeholder="Min rating"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Search
              </button>
            </form>

            <div className="mt-3 flex items-center gap-3">
              
              <span className="text-xs text-slate-500">
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
            <img
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1600&auto=format&fit=crop"
              alt="Hero"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} Flex Living .
        </div>
      </footer>
    </main>
  );
}
