import { NormalizedReview } from "@/lib/normalize";
import RatingBadge from "./RatingBadge";
import { useRouter } from "next/router";

function fmtDate(iso: string){
  return new Date(iso).toLocaleDateString();
}

export default function ReviewTable({ reviews }:{ reviews: NormalizedReview[] }){
  const router = useRouter();
  const toggleApprove = (id: number) => {
    const key = "approvedReviews";
    const set = new Set<number>(JSON.parse(localStorage.getItem(key) || "[]"));
    if (set.has(id)) set.delete(id); else set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new Event("storage")); // hint other tabs
  };
  const approvedSet = new Set<number>(typeof window !== "undefined" ? JSON.parse(localStorage.getItem("approvedReviews") || "[]") : []);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Listing</th>
          <th>Channel</th>
          <th>Guest</th>
          <th>Rating</th>
          <th>Review</th>
          <th>Approve</th>
          <th>Open</th>
        </tr>
      </thead>
      <tbody>
        {reviews.map(r => (
          <tr key={r.id} className="border-t border-slate-800">
            <td className="text-slate-400">{fmtDate(r.submittedAt)}</td>
            <td>{r.listingName}</td>
            <td className="text-slate-300">{r.channel}</td>
            <td className="text-slate-300">{r.guestName}</td>
            <td><RatingBadge value={r.rating}/></td>
            <td className="max-w-xl pr-4">{r.publicReview}</td>
            <td>
              <button className={"btn " + (approvedSet.has(r.id) ? "btn-primary" : "")} onClick={()=>toggleApprove(r.id)}>
                {approvedSet.has(r.id) ? "Approved" : "Approve"}
              </button>
            </td>
            <td>
              <button className="btn" onClick={()=>router.push(`/listings/${r.listingId}`)}>Listing</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
