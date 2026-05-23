# BuyLandAndBuild — Land Scraper Backend
## Deployment Guide for Olu

---

## What's in this package

```
blb-scraper/
├── netlify/
│   └── functions/
│       ├── scrape-land.js       ← Zillow multi-state land scraper
│       ├── scrape-redfin.js     ← Redfin multi-state land scraper
│       └── listing-detail.js   ← Phase 2: agent + parcel details
├── public/
│   └── scraper.html             ← Drop into BuyLandAndBuild.com root
├── netlify.toml                 ← Netlify build config
├── package.json
└── README.md
```

---

## Step 1 — Get your Apify API token (free to start)

1. Go to **https://apify.com** → Sign up (free)
2. Go to **Settings → Integrations → API tokens**
3. Copy your **Personal API token** — looks like `apify_api_xxxxxxxx`
4. Subscribe to these 3 actors (free tier available):
   - **Zillow Scraper** → search "maxcopell/zillow-scraper" in Apify Store → click Try for free
   - **Redfin Scraper** → search "epctex/redfin-scraper" → Try for free
   - **Zillow Detail Scraper** → search "maxcopell/zillow-detail-scraper" → Try for free

> **Cost**: Apify charges ~$5 per 1,000 Zillow results. Free tier gives $5/month credit = ~1,000 leads/mo free.

---

## Step 2 — Add the files to your GitHub repo

Option A — via Claw AI:
1. Upload this ZIP to Claw
2. Tell Claw: "Unzip this and add these files to the buylandandbuild repo:
   - `netlify/functions/scrape-land.js`
   - `netlify/functions/scrape-redfin.js`
   - `netlify/functions/listing-detail.js`
   - `netlify.toml` (replace existing if present)
   - `public/scraper.html`"

Option B — manual GitHub upload:
1. Open your BuyLandAndBuild repo on GitHub
2. Click "Add file" → "Upload files"
3. Drag all files in, preserving folder structure
4. Commit to main

---

## Step 3 — Set the Apify token in Netlify

1. Go to **Netlify dashboard** → your BuyLandAndBuild site
2. **Site configuration** → **Environment variables**
3. Click **Add variable**:
   - Key: `APIFY_TOKEN`
   - Value: *(paste your Apify token)*
4. Click **Save**
5. Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## Step 4 — Add the scraper to BuyLandAndBuild.com

In your main `index.html`, add a link to the scraper page:

```html
<!-- Add this anywhere in your nav or as a button -->
<a href="/scraper.html" class="btn">🔍 Land Scraper</a>
```

Or embed as an iframe in a section:
```html
<iframe src="/scraper.html" style="width:100%;height:900px;border:none;border-radius:14px;"></iframe>
```

---

## Step 5 — Test it

1. Visit `https://buylandandbuild.com/scraper.html`
2. Select CA, click "Start Multi-State Crawl"
3. Wait ~30-60 seconds for Apify to run
4. Real Zillow land listings should populate

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "APIFY_TOKEN not set" | Check Step 3 — env var must be exactly `APIFY_TOKEN` |
| "Apify run timed out" | Apify is slow on free tier — upgrade to Starter ($49/mo) for faster runs |
| "Apify run failed" | Check Apify dashboard for run logs |
| Functions return 404 | Make sure `netlify.toml` has `functions = "netlify/functions"` |
| No results returned | Apify actors may need a subscription — check the actor page |

---

## Upgrading to real-time streaming (optional future step)

Right now the scraper polls Apify until it finishes (30-90s). For real-time streaming:
1. Use Apify webhooks → POST to a new Netlify function when each page of results comes in
2. Use Server-Sent Events (SSE) from Netlify Edge Functions to stream results to the browser

Let Claude know when you're ready for that upgrade.

---

## Support
📞 858-258-9249 · bayo@myhomeloanadvisor.com · NMLS #164477


## Scraper Notes
- City search is primary input.
- Apify actors and schemas can change; prefer partial results over hard fail.
- Add APIFY_TOKEN in Netlify env vars before deploy.
