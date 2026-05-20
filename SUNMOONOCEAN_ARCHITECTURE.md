# SunMoonOcean - Deployment & Architecture Guide

## Overview
Full-stack viral kids toy e-commerce storefront with trend research pipeline and semi-autonomous product curation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React (existing) |
| Backend | Netlify Functions (Node.js) |
| Database | SQLite (local) + JSON flat files |
| Deployment | Netlify |
| Commerce | Snipcart (future) or Stripe payment links |

---

## Project Structure

```
sunmoonocean/
├── netlify/                    # Netlify Functions
│   └── functions/
│       ├── trending.js         # Trend research endpoint
│       ├── products.js         # Product CRUD
│       ├── pipeline.js         # Automated scoring pipeline
│       └── scheduler.js        # Cron trigger wrapper
├── api/                        # REST API routes
│   ├── products.js
│   ├── trending.js
│   └── pipeline.js
├── src/
│   ├── App.jsx                 # Main storefront (React)
│   ├── App.css                 # Styles
│   ├── admin/                  # Admin panel components
│   │   ├── TrendPanel.jsx
│   │   ├── ProductPipeline.jsx
│   │   └── StoreStats.jsx
│   ├── pipeline/               # Product research pipeline
│   │   ├── scorer.js
│   │   ├── sources.js
│   │   └── publisher.js
│   ├── data/
│   │   └── products.js         # Product catalog
│   └── main.jsx
├── netlify.toml
├── package.json
└── README.md
```

---

## Netlify Functions

### 1. `trending.js`
Fetches trend signals from:
- Google Trends (public scrape viaserpapi or similar)
- TikTok trending keywords (public data)
- Amazon bestseller lists (public pages)
- Public trend APIs

**Input:** `{ "category": "toys", "days": 7 }`
**Output:** `{ trends: [{ keyword, score, source, timestamp }] }`

### 2. `products.js`
CRUD for product candidates.

**Endpoints:**
- `GET /api/products` - list all products (filterable)
- `POST /api/products` - add product candidate
- `PUT /api/products/:id` - update product
- `DELETE /api/products/:id` - remove product

### 3. `pipeline.js`
Runs the viral scoring pipeline.

**Workflow:**
1. Fetch latest trend signals
2. Score each product candidate
3. Update trending flags
4. Generate digest notification

### 4. `scheduler.js`
Netlify Cron wrapper - triggers pipeline daily.

---

## Product Data Model

```js
{
  id: string,
  name: string,
  category: string,
  price: number,
  cost: number,           // supplier cost
  margin: number,         // auto-calculated
  source: string,         // where found
  sourceUrl: string,
  trendScore: number,     // 0-100
  status: "pending" | "approved" | "published" | "rejected",
  tags: string[],
  imageUrl: string,
  description: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp | null
}
```

---

## Viral Scoring Algorithm

Score = weighted sum of:

| Factor | Weight | Source |
|--------|--------|--------|
| Search growth | 30% | Google Trends |
| Multi-site appearance | 20% | Amazon/Walmart/Target |
| Price viability | 15% | cost vs MSRP |
| Margin potential | 15% | (price - cost) / price |
| Review velocity | 10% | review count + recency |
| Social mentions | 10% | TikTok/Instagram public data |

Score range: 0-100
Threshold for "auto-approve": 75+ (configurable)

---

## Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "SunMoonOcean initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sunmoonocean.git
git push -u origin main
```

### 2. Connect to Netlify
- Go to netlify.com → "Add new site" → Import from GitHub
- Select the repo
- Netlify auto-detects Vite build from `netlify.toml`
- Deploy

### 3. Configure Environment Variables
In Netlify dashboard → Site settings → Environment variables:

```
SCRAPER_API_KEY=your_serper_api_key_here
GOOGLE_TRENDS_API_KEY=your_google_api_key_here
SNIPCART_PUBLIC_API_KEY=your_snipcart_key_here
ADMIN_EMAIL=your@email.com
DAILY_DIGEST_RECIPIENT=your@email.com
```

### 4. Enable Scheduled Functions
In Netlify `netlify.toml`:
```toml
[functions]
  schedule = { functions = ["./netlify/functions/scheduler"] }
```

Or configure via Netlify UI: Site → Functions → Scheduled Functions

### 5. Custom Domain
Netlify dashboard → Domain management → Add custom domain: sunmoonocean.com

---

## Netlify.toml (current - keep as-is for build)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Add scheduled function config:
```toml
[functions]
  node_bundler = "esbuild"

[functions.schedule]
  functions = ["scheduler"]
  cron = "0 8 * * *"  # Daily at 8am UTC
```

---

## Admin Panel UI (within the storefront)

Section: "Viral Products Hub"
Located in the main storefront as a special section (visible in dev/admin mode).

### Tabs:
1. **Trend Research** - See latest trend signals, run manual research
2. **Product Pipeline** - List of candidates with scores and status
3. **Store Stats** - Mock metrics dashboard

---

## Cron Schedule

| Job | Frequency | What it does |
|-----|-----------|--------------|
| Morning digest | Daily 8am UTC | Email top 5 trending candidates |
| Trend refresh | Every 6 hours | Update trend scores |
| Pipeline run | Every 12 hours | Rescore and update status |
| Cleanup | Weekly | Archive old/rejected candidates |

---

## Compliance Notes

- Use only public/allowed data sources
- No scraping Amazon, eBay, Walmart behind anti-bot
- TikTok Creative Center has public trend data
- Google Trends is public
- If using SerpAPI or similar, use their APIs legitimately
- Do not auto-publish without human review of images/descriptions

---

## TODO Checklist

- [ ] Deploy frontend to Netlify
- [ ] Add Netlify Functions for pipeline
- [ ] Connect SQLite database for product storage
- [ ] Build admin panel component
- [ ] Set up daily cron schedule
- [ ] Configure email notifications
- [ ] Add Snipcart or Stripe for checkout
- [ ] Connect custom domain
- [ ] Set up SSL (automatic with Netlify)
- [ ] Add product image sourcing workflow

---

*Created: 2026-05-20*