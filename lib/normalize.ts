import type { NextApiRequest } from "next";

export type RawReview = {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory?: { category: string; rating: number }[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  channel: string;
};


export type NormalizedReview = {
  id: number;
  listingId: string;
  listingName: string;
  channel: string;
  type: "guest-to-host" | "host-to-guest" | string;
  status: string;
  rating: number | null;
  categories: Record<string, number>;
  submittedAt: string; // ISO
  guestName: string;
  publicReview: string;
  approved: boolean; // UI-only flag
};

export type Aggregates = {
  byListing: Record<string, {
    listingName: string;
    avgRating: number | null;
    count: number;
    categoriesAvg: Record<string, number>;
    channels: Record<string, number>;
  }>;
  overall: {
    avgRating: number | null;
    count: number;
  }
}

export function normalize(raw: RawReview[]): NormalizedReview[] {
  return raw.map((r) => {
    const categories: Record<string, number> = {};
    (r.reviewCategory || []).forEach((c) => { categories[c.category] = c.rating; });
    // Derive a listingId from listingName (or fallback to 'unknown')
    const listingName = r.listingName || "Unknown Listing";
    const listingId = listingName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const channel = r.channel || "Unknown";
    return {
      id: r.id,
      listingId,
      listingName,
      channel,
      type: (r as any).type,
      status: r.status,
      rating: r.rating ?? null,
      categories,
      submittedAt: new Date(r.submittedAt.replace(" ", "T") + "Z").toISOString(),
      guestName: r.guestName || "Guest",
      publicReview: r.publicReview || "",
      approved: false,
    }
  });
}

export function applyFilters(reviews: NormalizedReview, req: NextApiRequest): boolean {
  const { listingId, channel, type, minRating, from, to, search } = req.query;
  if (listingId && reviews.listingId !== String(listingId)) return false;
  if (channel && reviews.channel !== String(channel)) return false;
  if (type && reviews.type !== String(type)) return false;
  if (minRating && (reviews.rating ?? 0) < Number(minRating)) return false;
  if (from && new Date(reviews.submittedAt) < new Date(String(from))) return false;
  if (to && new Date(reviews.submittedAt) > new Date(String(to))) return false;
  if (search) {
    const s = String(search).toLowerCase();
    const blob = `${reviews.publicReview} ${reviews.guestName} ${reviews.listingName}`.toLowerCase();
    if (!blob.includes(s)) return false;
  }
  return true;
}
