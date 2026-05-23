// netlify/functions/scrape-redfin.js
// BuyLandAndBuild.com — City-based Redfin Land Scraper
// Primary input: city name + state → builds Redfin city land URL

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const REDFIN_ACTOR = "epctex~redfin-scraper";

const BUILD_COST = {
  CA:220, OR:185, CO:175, AZ:145, TX:140, TN:130,
  FL:150, WA:195, NV:160, ID:155, MT:165, NM:135,
  GA:130, NC:135, SC:130, VA:160, MD:175, PA:155,
  NY:210, NJ:195, MA:200, CT:185, IL:145, OH:125,
  MI:130, MN:145, WI:135, IN:115, MO:120, KS:115,
};

// Redfin state name mapping (Redfin uses full state names in URLs)
const STATE_NAMES = {
  CA:"California", OR:"Oregon", CO:"Colorado", AZ:"Arizona", TX:"Texas",
  TN:"Tennessee", FL:"Florida", WA:"Washington", NV:"Nevada", ID:"Idaho",
  MT:"Montana", NM:"New-Mexico", GA:"Georgia", NC:"North-Carolina",
  SC:"South-Carolina", VA:"Virginia", MD:"Maryland", PA:"Pennsylvania",
  NY:"New-York", NJ:"New-Jersey", MA:"Massachusetts", CT:"Connecticut",
  IL:"Illinois", OH:"Ohio", MI:"Michigan", MN:"Minnesota", WI:"Wisconsin",
  IN:"Indiana", MO:"Missouri", KS:"Kansas", NE:"Nebraska", IA:"Iowa",
  UT:"Utah", HI:"Hawaii", AK:"Alaska",
};

function buildRedfinCityUrl(city, state, minPrice, maxPrice, minLotAcres) {
  const citySlug = city.trim().replace(/\s+/g, "-");
  const stateName = STATE_NAMES[state?.toUpperCase()] || state || "";
  let url = `https://www.redfin.com/${stateName}/${citySlug}/filter/property-type=land`;
  const parts = [];
  if (minPrice) parts.push(`min-price=${minPrice}`);
  if (maxPrice) parts.push(`max-price=${maxPrice}`);
  if (minLotAcres) parts.push(`min-lot-size=${Math.round(Number(minLotAcres) * 43560)}-sqft`);
  if (parts.length) url += "," + parts.join(",");
  return url;
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

  const { cities = [], minPrice, maxPrice, minLotAcres, maxResults = 40 } = body;

  if (!cities.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Provide at least one city" }) };
  }

  try {
    const startUrls = cities.map(({ city, state }) => ({
      url: buildRedfinCityUrl(city, state, minPrice, maxPrice, minLotAcres),
    }));

    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(REDFIN_ACTOR)}/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startUrls, maxItems: maxResults, memory: 512 }),
      }
    );
    if (!runRes.ok) return { statusCode: 502, headers, body: JSON.stringify({ error: "Redfin actor start failed" }) };

    const runData = await runRes.json();
    const runId = runData.data?.id;

    let status = "RUNNING", tries = 0;
    while ((status === "RUNNING" || status === "READY") && tries < 18) {
      await new Promise(r => setTimeout(r, 5000));
      tries++;
      const s = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      status = (await s.json()).data?.status || "RUNNING";
    }
    if (status !== "SUCCEEDED") {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Redfin run status: ${status}` }) };
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&clean=true`
    );
    const rawItems = await itemsRes.json();

    const leads = rawItems
      .filter(item => {
        if (minLotAcres) {
          const acres = redfinAcres(item);
          if (acres < safeNumber(minLotAcres)) return false;
        }
        return true;
      })
      .map(item => normalizeRedfin(item, BUILD_COST))
      .slice(0, maxResults);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, total: leads.length, leads }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function redfinAcres(item) {
  const ls = item.lotSize || item.lot_size || "";
  if (typeof ls === "number") return +(ls / 43560).toFixed(3);
  const m = String(ls).match(/([\d,.]+)\s*(acre|ac|sqft|sq ft)/i);
  if (!m) return 0;
  const v = parseFloat(m[1].replace(",", ""));
  return m[2].toLowerCase().startsWith("a") ? v : +(v / 43560).toFixed(3);
}

function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeRedfin(item, buildCostMap) {
  const price = safeNumber(item.price || 0);
  const acres = redfinAcres(item);
  const state = item.state || item.stateCode || "??";
  const costPerSqft = buildCostMap[String(state).toUpperCase()] || 150;
  const buildCost = acres > 0 ? Math.round(acres * 43560 * 0.15 * costPerSqft / 1000) * 1000 : null;
  const dom = item.dom || item.daysOnMarket || null;
  return {
    mlsId: item.mlsId || item.listingId || "RDF" + Math.random().toString(36).slice(2,8).toUpperCase(),
    addr: item.streetLine ? `${item.streetLine}, ${item.city}, ${state}` : item.address || "—",
    price,
    priceFormatted: "$" + Number(price).toLocaleString(),
    acres,
    dom,
    state,
    city: item.city || "",
    zip: item.zip || "",
    type: item.propertyType || "Land",
    zoning: item.zoning || "—",
    source: "Redfin",
    url: item.url || null,
    lat: item.latitude || null,
    lng: item.longitude || null,
    thumbnail: item.photoUrl || null,
    listingAgent: item.agentName || null,
    buildCost,
    buildCostFormatted: buildCost ? "$" + buildCost.toLocaleString() : null,
    pricePerAcre: acres > 0 ? Math.round(price / acres) : null,
  };
}
