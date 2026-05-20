// trending.js - Fetch trend signals from public/allowed sources
// Uses: Google Trends, public trend APIs, search data

export default async function handler(event, context) {
  const { category = 'toys', days = 7 } = JSON.parse(event.body || '{}');

  // Simulated trend signals (replace with real API calls)
  // Real implementation would use SerpAPI, Google Trends API, TikTok Creative Center
  const trends = generateMockTrends(category, days);

  return {
    statusCode: 200,
    body: JSON.stringify({ trends, fetchedAt: new Date().toISOString() }),
  };
}

function generateMockTrends(category, days) {
  const toyKeywords = [
    { keyword: 'slime kits for kids', category: 'STEM', score: 92 },
    { keyword: 'ootdoor water toys', category: 'Outdoor', score: 88 },
    { keyword: 'kids coding robot', category: 'STEM', score: 85 },
    { keyword: 'sensory play sets', category: 'Sensory', score: 81 },
    { keyword: 'tiktok viral toys 2026', category: 'Viral', score: 95 },
    { keyword: 'magnetic building tiles', category: 'STEM', score: 79 },
    { keyword: 'kids escape room game', category: 'Games', score: 76 },
    { keyword: 'balance bike toddler', category: 'Outdoor', score: 74 },
    { keyword: 'glow in dark craft supplies', category: 'Arts', score: 72 },
    { keyword: 'stem subscription box', category: 'STEM', score: 70 },
    { keyword: 'kids microscope set', category: 'STEM', score: 68 },
    { keyword: 'play dough variety pack', category: 'Sensory', score: 67 },
    { keyword: 'card game family edition', category: 'Games', score: 65 },
    { keyword: 'kite for kids', category: 'Outdoor', score: 63 },
    { keyword: 'dress up costume set', category: 'Dress Up', score: 61 },
  ];

  return toyKeywords.map((t) => ({
    ...t,
    source: 'mock',
    fetchedAt: new Date().toISOString(),
    searchVolume: Math.floor(Math.random() * 50000) + 10000,
    trendDirection: Math.random() > 0.3 ? 'rising' : 'stable',
  }));
}
