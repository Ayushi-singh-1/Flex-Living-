import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r=>r.json());

export default function ListingPage(){
  const router = useRouter();
  const { id } = router.query;
  const { data } = useSWR(id ? `/api/reviews/hostaway?listingId=${id}` : null, fetcher);
  const approvedSet = new Set<number>(typeof window !== "undefined" ? JSON.parse(localStorage.getItem("approvedReviews") || "[]") : []);
  const approved = (data?.reviews || []).filter((r:any)=>approvedSet.has(r.id));

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <button className="btn" onClick={()=>router.back()}>&larr; Back</button>
      <header>
        <h1 className="text-2xl font-bold">{approved[0]?.listingName || "Listing"}</h1>
        <p className="text-slate-400">Public property page — showing only manager-approved guest reviews.</p>
      </header>

      <section className="card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Guest Reviews</h2>
        {approved.length === 0 && <p className="text-slate-400">No approved reviews yet.</p>}
        <div className="space-y-4">
          {approved.map((r:any)=> (
            <article key={r.id} className="border border-slate-800 rounded-xl p-4">
              <div className="text-slate-300 text-sm">{new Date(r.submittedAt).toLocaleDateString()}</div>
              <p className="mt-2 text-slate-100">{r.publicReview}</p>
              <div className="mt-2 text-slate-400 text-sm">— {r.guestName} · {r.channel}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
