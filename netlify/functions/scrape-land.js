// netlify/functions/scrape-land.js
// BuyLandAndBuild.com — City-based Land Scraper
// Primary input: city name (+ optional state) → builds Zillow city land URL
// Uses Apify Zillow Scraper actor. Set APIFY_TOKEN in Netlify env vars.

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = "maxcopell~zillow-scraper";

// Cost per sqft by state for build cost estimates
const BUILD_COST = {
  CA:220, OR:185, CO:175, AZ:145, TX:140, TN:130,
  FL:150, WA:195, NV:160, ID:155, MT:165, NM:135,
  GA:130, NC:135, SC:130, VA:160, MD:175, PA:155,
  NY:210, NJ:195, MA:200, CT:185, IL:145, OH:125,
  MI:130, MN:145, WI:135, IN:115, MO:120, KS:115,
  NE:120, IA:115, ND:130, SD:125, OK:110, AR:105,
  LA:120, MS:100, AL:115, KY:110, WV:105, UT:165,
  HI:275, AK:225,
};

// Build a Zillow city land search URL from city + state
// Zillow's URL format for city land searches:
//   https://www.zillow.com/{city}-{state}/land/
// With filters encoded in searchQueryState for land-only listings
function buildZillowCityUrl(city, state, minPrice, maxPrice, minLotSqft) {
  // Slugify city name for URL
  const citySlug = city.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const stateSlug = (state || "").toLowerCase();

  // Build the filter state object
  const filterState = {
    con: { value: false },   // exclude condos
    apa: { value: false },   // exclude apartments
    mf:  { value: false },   // exclude multi-family
    ah:  { value: true  },   // include all homes (needed for land)
    sf:  { value: false },   // exclude single family
    tow: { value: false },   // exclude townhomes
    land:{ value: true  },   // LAND ONLY
  };

  if (minPrice) filterState.mp = { value: Number(minPrice) };
  if (maxPrice) filterState.mxp = { value: Number(maxPrice) };
  if (minLotSqft) filterState.mlot = { value: Number(minLotSqft) };

  const searchQueryState = {
    isMapVisible: true,
    filterState,
    isListVisible: true,
  };

  const base = stateSlug
    ? `https://www.zillow.com/${citySlug}-${stateSlug}/land/`
    : `https://www.zillow.com/${citySlug}/land/`;

  return base + `?searchQueryState=${encodeURIComponent(JSON.stringify(searchQueryState))}`;
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  if (!APIFY_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "APIFY_TOKEN not set" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const {
    cities = [],          // array of { city, state } objects — PRIMARY search input
    minPrice,
    maxPrice,
    minLotAcres,          // convert to sqft for Zillow filter
    landType = "all",
    maxResults = 40,
  } = body;

  if (!cities.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Provide at least one city to search" }) };
  }

  const minLotSqft = minLotAcres ? Math.round(Number(minLotAcres) * 43560) : undefined;

  try {
    // Build one Zillow URL per city
    const startUrls = cities.map(({ city, state }) => ({
      url: buildZillowCityUrl(city, state, minPrice, maxPrice, minLotSqft),
      label: `${city}, ${state || ""}`.trim(),
    }));

    console.log("Apify start URLs:", JSON.stringify(startUrls));

    // Start Apify actor run
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR)}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls,
          maxItems: maxResults,
          memory: 512,
        }),
      }
    );

    if (!runRes.ok) {
      const err = await runRes.text();
      console.error("Apify start failed:", err);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Apify actor failed to start", detail: err }) };
    }

    const runData = await runRes.json();
    const runId = runData.data?.id;
    if (!runId) return { statusCode: 502, headers, body: JSON.stringify({ error: "No run ID from Apify" }) };

    // Poll for completion (max 90s)
    let status = "RUNNING";
    let attempts = 0;
    while ((status === "RUNNING" || status === "READY") && attempts < 18) {
      await sleep(5000);
      attempts++;
      const s = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      status = (await s.json()).data?.status || "RUNNING";
    }

    if (status !== "SUCCEEDED") {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Apify run ended: ${status}`, runId }) };
    }

    // Fetch results
    const dataRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&clean=true&format=json`
    );
    const rawItems = await dataRes.json();

    // Filter and normalize
    const leads = rawItems
      .filter(item => isLandListing(item))
      .filter(item => passesFilters(item, { minPrice, maxPrice, minLotAcres, landType }))
      .map(item => normalizeListing(item, BUILD_COST))
      .slice(0, maxResults);

    // Count per city
    const cityCounts = {};
    leads.forEach(l => {
      const key = l.city ? `${l.city}, ${l.state}` : l.state;
      cityCounts[key] = (cityCounts[key] || 0) + 1;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, total: leads.length, cityCounts, runId, leads }),
    };

  } catch (err) {
    console.error("Scraper error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isLandListing(item) {
  const type = (item.homeType || item.propertyType || "").toLowerCase();
  const status = (item.homeStatus || "").toLowerCase();
  if (status.includes("off_market")) return false;
  const isLand = type.includes("land") || type.includes("lot") ||
    type.includes("vacant") || type.includes("farm") || type.includes("ranch");
  const noBuilding = !item.livingArea && !item.bedrooms;
  return isLand || noBuilding;
}

function passesFilters(item, { minPrice, maxPrice, minLotAcres, landType }) {
  const price = safeNumber(item.price ?? item.unformattedPrice ?? 0);
  if (minPrice && price < safeNumber(minPrice)) return false;
  if (maxPrice && price > safeNumber(maxPrice)) return false;
  const acres = lotAcres(item);
  if (minLotAcres && acres < safeNumber(minLotAcres)) return false;
  if (landType && landType !== "all") {
    const type = String(item.homeType || item.propertyType || "").toLowerCase();
    if (!type.includes(String(landType).toLowerCase())) return false;
  }
  return true;
}

function lotAcres(item) {
  const value = safeNumber(item.lotAreaValue ?? item.lotSize ?? 0);
  const unit = String(item.lotAreaUnit || "").toLowerCase();
  if (!value) return 0;
  if (unit.includes("acre")) return value;
  if (unit.includes("sqft") || unit.includes("sq")) return +(value / 43560).toFixed(3);
  if (value > 1000) return +(value / 43560).toFixed(3);
  return value;
}

function normalizeListing(item, buildCostMap) {
  const price = safeNumber(item.price ?? item.unformattedPrice ?? 0);
  const acres = lotAcres(item);
  const state = String(item.stateCode || item.state || "??").toUpperCase();
  const addr = item.address || `${item.streetAddress || ""}, ${item.city || ""}, ${state}`.replace(/^,\s*|,\s*$/, "");
  const costPerSqft = buildCostMap[state] || 150;
  const buildCost = acres > 0 ? Math.round(acres * 43560 * 0.15 * costPerSqft / 1000) * 1000 : null;
  const dom = item.daysOnZillow ?? item.timeOnZillow ?? null;

  return {
    mlsId: item.zpid ? "ZPD" + item.zpid : "UNK" + Math.random().toString(36).slice(2,8).toUpperCase(),
    addr,
    price,
    priceFormatted: "$" + Number(price).toLocaleString(),
    acres,
    dom,
    state,
    city: item.city || "",
    zip: item.zipcode || item.zip || "",
    type: item.homeType || "Land / Lot",
    zoning: item.zoning || "—",
    source: "Zillow",
    url: item.detailUrl ? "https://www.zillow.com" + item.detailUrl : item.url || null,
    lat: item.latitude || item.lat || null,
    lng: item.longitude || item.lng || null,
    thumbnail: item.imgSrc || null,
    listingAgent: item.brokerName || item.agentName || null,
    buildCost,
    buildCostFormatted: buildCost ? "$" + buildCost.toLocaleString() : null,
    pricePerAcre: acres > 0 ? Math.round(price / acres) : null,
  };
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
