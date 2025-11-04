# 🏠 FlexLiving Reviews Dashboard

A modern, data-driven dashboard built with **Next.js + TypeScript** for managing and visualizing guest reviews across multiple listings.  
It uses a **mock dataset (`mock_reviews.json`)** that simulates real Airbnb, Booking.com, and Direct booking reviews — including categories, sub-ratings, and sentiments.

---

## 🚀 Features

### 🔹 **Home Page (`index.tsx`)**
- Clean landing page with a **search form** that routes to the dashboard with URL-based filters.  
- Functional input fields:
  - **Keyword search**
  - **Date range (`from` / `to`)**
  - **Minimum rating filter**
- Fully responsive design using **Tailwind CSS**.
- Quick link to the **Manager Dashboard**.

### 🔹 **Dashboard Page (`dashboard.tsx`)**
- Reads data from **`/data/mock_reviews.json`** via a lightweight **normalizer** (`/lib/normalize.ts`).
- Displays:
  - ✅ Total Reviews (shown)
  - ⭐ Average Rating
  - 🏘️ Total Listings
- Dynamic **Filters**:
  - Search by text or listing name
  - Filter by Channel (`Airbnb`, `Direct`, `Booking.com`)
  - Filter by Review Type, Date Range, Min Rating
  - Optional category sub-rating filter (e.g. Cleanliness ≥ 9)
- Smart **Sorting** (by date or rating)
- **Paginated Review Table** with sortable columns:
  - Listing, Channel, Rating, Review Text
  - Approve toggle (persisted in `localStorage`)
- **Export to CSV** — download the currently filtered view.
- **Responsive UI** — Works seamlessly on desktop and tablet.

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Framework** | Next.js 14 + React 18 + TypeScript | Routing, SSR, and UI logic |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Data Handling** | Local JSON (`mock_reviews.json`) | Mock review source |
| **State Management** | React Hooks (`useState`, `useMemo`, `useEffect`) | Local UI state |
| **Charts (optional)** | Recharts | Visualize listing-level averages |
| **Icons/UI** | Lucide React | Clean, consistent UI elements |
| **Storage** | LocalStorage | Remember approved reviews |
| **Export** | Blob + CSV | One-click export of visible data |

---

## 📊 Data Source — `mock_reviews.json`

The file contains guest-to-host reviews in this format:

```json
{
  "id": 1001,
  "type": "guest-to-host",
  "status": "published",
  "rating": 4.8,
  "publicReview": "Lovely stay, spotless flat and great location near the canal.",
  "reviewCategory": [
    { "category": "cleanliness", "rating": 10 },
    { "category": "communication", "rating": 9 },
    { "category": "location", "rating": 10 },
    { "category": "value", "rating": 9 }
  ],
  "submittedAt": "2024-08-21 22:45:14",
  "guestName": "Alice T",
  "listingName": "2B N1 A - 29 Shoreditch Heights",
  "channel": "Airbnb"
}
