# SunMoonOcean - Deployment & Project Guide

## What Was Built

**SunMoonOcean** — a viral kids toy e-commerce storefront with an automated product research pipeline.

---

## Project Structure

```
sunmoonocean/
├── netlify/functions/     # Netlify serverless functions
│   ├── trending.js        # Fetch trend signals
│   ├── products.js         # Product CRUD
│   ├── pipeline.js         # Scoring & automation engine
│   └── scheduler.js        # Daily cron trigger
├── src/
│   ├── App.jsx            # Main storefront (React)
│   ├── App.css            # SunMoonOcean styles
│   ├── admin/             # Admin panel components
│   ├── pipeline/          # Product research pipeline
│   └── data/              # Product catalog data
├── netlify.toml           # Build & deploy config
├── package.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 |
| Backend | Netlify Functions (Node.js) |
| Deployment | Netlify |
| Database | In-memory (upgradeable) |

---

## Deployment Steps

### Step 1: Push to GitHub

```bash
cd /home/ubuntu/.openclaw/workspace
git init
git add .
git commit -m "SunMoonOcean initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sunmoonocean.git
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select the `sunmoonocean` repository
5. Netlify auto-detects build settings from `netlify.toml`
6. Click "Deploy site"

### Step 3: Configure Environment Variables

In Netlify dashboard → Site settings → Environment variables:

| Key | Value |
|-----|-------|
| `ADMIN_EMAIL` | your@email.com |
| `SCRAPER_API_KEY` | your_serper_api_key_here |
| `DAILY_DIGEST_RECIPIENT` | your@email.com |

### Step 4: Custom Domain

Netlify dashboard → Domain management → Add custom domain: sunmoonocean.com

---

## Key Features

### 1. Storefront
- Hero with brand messaging
- Featured products grid
- Trending products section
- Category browsing
- Newsletter signup
- Simple cart functionality

### 2. Admin Panel (Viral Products Hub)
- **Trend Research** — Scan TikTok, Amazon, Google Trends
- **Product Pipeline** — Approve/reject candidates
- **Store Stats** — Dashboard with pipeline health

### 3. Automated Pipeline
- Runs daily at 8am UTC via Netlify scheduled function
- Scores products 0-100 across 6 factors
- Generates daily digest of top candidates
- Human approval required before publishing

---

## Scoring Algorithm

Products are scored on:
- Search growth (30%)
- Multi-site presence (20%)
- Price viability (15%)
- Margin potential (15%)
- Review velocity (10%)
- Social mentions (10%)

Score 75+ = ready for approval review

---

## Next Steps

1. **Connect commerce backend** — Add Snipcart or Shopify for checkout
2. **Connect real trend APIs** — Replace mock data with real SerpAPI/Google Trends
3. **Add email notifications** — Set up SendGrid/Postmark for daily digest
4. **Add product images** — Integrate image sourcing workflow
5. **Launch** — Deploy to Netlify and go live

---

*Created: 2026-05-20*