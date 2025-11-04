import { useEffect, useState } from "react";

export type Filters = {
  listingId?: string;
  channel?: string;
  type?: string;
  minRating?: number;
  from?: string;
  to?: string;
  search?: string;
  // (client-side only)
  category?: string;       // e.g., cleanliness, communication
  categoryMin?: number;    // e.g., 8
  sort?: "date-desc" | "date-asc" | "rating-desc" | "rating-asc";
};

const COMMON_CATEGORIES = [
  "cleanliness",
  "communication",
  "location",
  "value",
  "maintenance",
];

export default function Filters({ onChange }: { onChange: (f: Filters) => void }) {
  const [f, setF] = useState<Filters>({
    sort: "date-desc",
  });

  useEffect(() => {
    onChange(f);
  }, [f, onChange]);

  return (
    <div className="grid md:grid-cols-8 gap-3">
      <input
        className="input md:col-span-2"
        placeholder="Search text..."
        onChange={(e) => setF({ ...f, search: e.target.value || undefined })}
      />

      <select
        className="select"
        onChange={(e) => setF({ ...f, channel: e.target.value || undefined })}
      >
        <option value="">All channels</option>
        <option>Airbnb</option>
        <option>Booking.com</option>
        <option>Direct</option>
      </select>

      <select
        className="select"
        onChange={(e) => setF({ ...f, type: e.target.value || undefined })}
      >
        <option value="">All types</option>
        <option>guest-to-host</option>
        <option>host-to-guest</option>
      </select>

      <input
        className="input"
        type="number"
        step="0.1"
        placeholder="Min rating"
        onChange={(e) =>
          setF({ ...f, minRating: e.target.value ? Number(e.target.value) : undefined })
        }
      />

      <input
        className="input"
        type="date"
        onChange={(e) => setF({ ...f, from: e.target.value || undefined })}
      />
      <input
        className="input"
        type="date"
        onChange={(e) => setF({ ...f, to: e.target.value || undefined })}
      />

      {/*  Category + min sub-score (client-side filter) */}
      <select
        className="select"
        onChange={(e) => setF({ ...f, category: e.target.value || undefined })}
      >
        <option value="">Any category</option>
        {COMMON_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        className="input"
        type="number"
        step="1"
        min={0}
        max={10}
        placeholder="Min sub-score"
        onChange={(e) =>
          setF({ ...f, categoryMin: e.target.value ? Number(e.target.value) : undefined })
        }
      />

      {/*Sort */}
      <select
        className="select"
        onChange={(e) =>
          setF({
            ...f,
            sort: (e.target.value as Filters["sort"]) || "date-desc",
          })
        }
      >
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="rating-desc">Rating high → low</option>
        <option value="rating-asc">Rating low → high</option>
      </select>
    </div>
  );
}
