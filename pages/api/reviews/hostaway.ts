import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  normalize,
  type NormalizedReview,
  type Aggregates,
  type RawReview,        // make sure RawReview is exported from /lib/normalize
} from "@/lib/normalize";

type HostawayResponse = { status: string; result?: RawReview[] | null };
type MockFile = { status?: string; result?: RawReview[] | null };

type ApiOut = {
  status: "ok";
  count: number;
  reviews: NormalizedReview[];
  aggregates: Aggregates;
};

// If you’re on Next.js App Router with edge by default, ensure Node.js APIs are allowed:
export const config = { runtime: "nodejs" };

async function fetchHostaway(accountId: string, apiKey: string): Promise<HostawayResponse | null> {
  try {
    const url = `https://api.hostaway.com/v1/reviews?accountId=${encodeURIComponent(accountId)}`;
    const res = await fetch(url, { headers: { Authorization: apiKey } as any });
    if (!res.ok) return null;
    const data = (await res.json()) as HostawayResponse;
    return data;
  } catch {
    return null;
  }
}

function buildAggregates(reviews: NormalizedReview[]): Aggregates {
  const byListing: Aggregates["byListing"] = {};

  for (const r of reviews) {
    if (!byListing[r.listingId]) {
      byListing[r.listingId] = {
        listingName: r.listingName,
        avgRating: null,
        count: 0,
        categoriesAvg: {},
        channels: {},
      };
    }
    const slot = byListing[r.listingId];
    slot.count += 1;

    if (r.rating != null) {
      // incremental average
      slot.avgRating =
        slot.avgRating == null
          ? r.rating
          : (slot.avgRating * (slot.count - 1) + r.rating) / slot.count;
    }

    for (const [k, v] of Object.entries(r.categories)) {
      slot.categoriesAvg[k] = (slot.categoriesAvg[k] ?? 0) + v;
    }

    slot.channels[r.channel] = (slot.channels[r.channel] ?? 0) + 1;
  }

  for (const slot of Object.values(byListing)) {
    for (const k of Object.keys(slot.categoriesAvg)) {
      slot.categoriesAvg[k] = Number((slot.categoriesAvg[k] / slot.count).toFixed(2));
    }
    if (slot.avgRating != null) slot.avgRating = Number(slot.avgRating.toFixed(2));
  }

  const ratings = reviews.map((r) => r.rating).filter((x): x is number => x != null);
  const overall = {
    avgRating: ratings.length
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
      : null,
    count: reviews.length,
  };

  return { byListing, overall };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiOut | { status: "error"; message: string }>) {
  try {
    const accountId = process.env.HOSTAWAY_ACCOUNT_ID || "";
    const apiKey = process.env.HOSTAWAY_API_KEY || "";

    // Always keep rows strongly typed
    let rows: RawReview[] = [];

    // 1) Try Hostaway if creds are present
    if (accountId && apiKey) {
      const data = await fetchHostaway(accountId, apiKey);
      if (data && Array.isArray(data.result) && data.result.length > 0) {
        rows = data.result;
      }
    }

    // 2) Fallback to local mock
    if (rows.length === 0) {
      const file = path.join(process.cwd(), "data", "mock_reviews.json");
      const rawJson = JSON.parse(fs.readFileSync(file, "utf-8")) as MockFile;
      rows = Array.isArray(rawJson.result) ? rawJson.result : [];
    }

    // 3) Normalize (map, not single-call)
    const normalized: NormalizedReview[] = normalize(rows);

    // 4) Apply filters
    const { listingId, channel, type, minRating, from, to, search } = req.query;

    const filtered = normalized.filter((r) => {
      if (listingId && r.listingId !== String(listingId)) return false;
      if (channel && r.channel !== String(channel)) return false;
      if (type && r.type !== String(type)) return false;
      if (minRating && (r.rating ?? 0) < Number(minRating)) return false;
      if (from && new Date(r.submittedAt) < new Date(String(from))) return false;
      if (to && new Date(r.submittedAt) > new Date(String(to))) return false;

      if (search) {
        const s = String(search).toLowerCase();
        const blob = `${r.publicReview} ${r.guestName} ${r.listingName}`.toLowerCase();
        if (!blob.includes(s)) return false;
      }
      return true;
    });

    // 5) Aggregates from filtered set
    const aggregates = buildAggregates(filtered);

    res.status(200).json({
      status: "ok",
      count: filtered.length,
      reviews: filtered,
      aggregates,
    });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e?.message || "Unexpected error" });
  }
}
