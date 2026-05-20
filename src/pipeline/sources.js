// sources.js - Trend data source adapters

/**
 * Fetch trend data from public/allowed sources
 * Each function returns normalized trend signal objects
 */

export async function fetchGoogleTrends(keywords = []) {
  // Production: use Google Trends API or SerpAPI
  // For now, return mock data
  return keywords.map((keyword) => ({
    keyword,
    source: 'google_trends',
    score: Math.floor(Math.random() * 40) + 60,
    searchVolume: Math.floor(Math.random() * 100000) + 10000,
    trendDirection: Math.random() > 0.3 ? 'rising' : 'stable',
    fetchedAt: new Date().toISOString(),
  }));
}

export async function fetchTikTokTrends(category = 'toys') {
  // TikTok Creative Center has public trend data
  // Production: scrape or use official API
  return [
    { keyword: 'slime kit', source: 'tiktok', score: 95, hashtag: '#slimekit', views: '50M+' },
    { keyword: 'stem toys', source: 'tiktok', score: 88, hashtag: '#stemtoy', views: '32M+' },
    { keyword: 'kids robot', source: 'tiktok', score: 82, hashtag: '#kidsrobot', views: '18M+' },
    { keyword: 'magnetic tiles', source: 'tiktok', score: 79, hashtag: '#magnetictiles', views: '12M+' },
  ];
}

export async function fetchAmazonBestsellers(category = 'toys') {
  // Amazon Best Sellers pages are publicly accessible
  // Production: parse the page or use an API
  return [
    { keyword: 'building blocks', source: 'amazon', score: 85, rank: 12, bsr: 1200 },
    { keyword: 'science kit', source: 'amazon', score: 78, rank: 45, bsr: 3400 },
    { keyword: 'water toys', source: 'amazon', score: 75, rank: 89, bsr: 5600 },
    { keyword: 'art supplies', source: 'amazon', score: 72, rank: 156, bsr: 8900 },
  ];
}

export async function fetchAllTrends(category = 'toys') {
  const [tiktok, amazon] = await Promise.all([
    fetchTikTokTrends(category),
    fetchAmazonBestsellers(category),
  ]);

  return [...tiktok, ...amazon].sort((a, b) => b.score - a.score);
}

export function normalizeTrendSignal(raw) {
  return {
    keyword: raw.keyword || raw.title || '',
    score: raw.score || 50,
    source: raw.source || 'unknown',
    searchVolume: raw.searchVolume || 0,
    trendDirection: raw.trendDirection || 'stable',
    fetchedAt: new Date().toISOString(),
    raw: raw,
  };
}