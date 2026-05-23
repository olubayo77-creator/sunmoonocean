// netlify/functions/listing-detail.js
// BuyLandAndBuild.com — Phase 2: Deep-fetch a single listing's agent info + full details
// Called when "Fetch agent & listing details" toggle is ON.
// Uses Apify's Zillow Detail Scraper actor.

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const DETAIL_ACTOR = "maxcopell~zillow-detail-scraper";

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
    return { statusCode: 500, headers, body: JSON.stringify({ error: "APIFY_TOKEN not configured" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { url, zpid } = body;
  if (!url && !zpid) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Provide listing url or zpid" }) };
  }

  const listingUrl = url || `https://www.zillow.com/homedetails/${zpid}_zpid/`;

  try {
    // Start Apify detail scraper
    const runRes = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(DETAIL_ACTOR)}/runs?token=${APIFY_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: listingUrl }],
        maxItems: 1,
        memory: 256,
      }),
    });

    if (!runRes.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Failed to start Apify detail run" }) };
    }

    const { data } = await runRes.json();
    const runId = data?.id;

    // Poll up to 60s
    let status = "RUNNING";
    let tries = 0;
    while ((status === "RUNNING" || status === "READY") && tries < 12) {
      await new Promise((r) => setTimeout(r, 5000));
      tries++;
      const s = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      const sd = await s.json();
      status = sd.data?.status || "RUNNING";
    }

    if (status !== "SUCCEEDED") {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Detail run status: ${status}` }) };
    }

    const itemsRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&clean=true&format=json`);
    const items = await itemsRes.json();
    const detail = items[0] || {};

    // Extract the fields most useful for a land mortgage advisor
    const enriched = {
      zpid: detail.zpid,
      url: listingUrl,
      fullAddress: detail.address,
      price: detail.price,
      priceHistory: detail.priceHistory || [],
      daysOnZillow: detail.daysOnZillow,
      zoning: detail.zoning || detail.zoningCode || null,
      lotSize: detail.lotAreaValue
        ? `${detail.lotAreaValue} ${detail.lotAreaUnit || "sqft"}`
        : null,
      utilities: detail.utilities || null,
      topography: detail.topography || null,
      taxAssessedValue: detail.taxAssessedValue || null,
      annualTaxAmount: detail.taxAnnualAmount || null,
      mlsId: detail.mlsid || detail.mlsID || null,
      description: detail.description || null,
      // Agent / listing office
      listingAgent: {
        name: detail.listing_agent?.display_name || detail.agentName || null,
        phone: detail.listing_agent?.phone || detail.agentPhone || null,
        email: detail.listing_agent?.email || null,
        license: detail.listing_agent?.license_number || null,
        office: detail.brokerName || null,
      },
      // School district (useful for residential lots)
      schools: detail.schools || [],
      // Parcel info
      parcelNumber: detail.parcelNumber || null,
      countyLandUseCode: detail.countyLandUseCode || null,
      // Nearby comparables (Zillow sometimes includes these)
      nearbyHomes: (detail.nearbyHomes || []).slice(0, 5).map((h) => ({
        addr: h.address,
        price: h.price,
        sqft: h.livingArea,
        type: h.homeType,
      })),
    };

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, detail: enriched }) };
  } catch (err) {
    console.error("Detail fetch error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
