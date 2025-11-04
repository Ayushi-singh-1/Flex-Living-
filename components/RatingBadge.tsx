import { clsx } from "clsx";

export default function RatingBadge({ value }: { value: number | null }) {
  const color = value == null ? "bg-slate-700" :
    value >= 4.5 ? "bg-emerald-400 text-emerald-950" :
    value >= 4.0 ? "bg-lime-400 text-lime-950" :
    value >= 3.0 ? "bg-amber-400 text-amber-950" :
    "bg-rose-400 text-rose-950";
  return <span className={clsx("badge", color)}>
    {value == null ? "N/A" : value.toFixed(1)}
  </span>;
}
