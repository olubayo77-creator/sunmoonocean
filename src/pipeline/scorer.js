// scorer.js - Viral product scoring engine

/**
 * Score a product candidate across multiple factors
 * Returns a score 0-100 and breakdown by factor
 */
export function scoreProduct(product, trendSignals = []) {
  const weights = {
    searchGrowth: 0.30,
    multiSitePresence: 0.20,
    priceViability: 0.15,
    marginPotential: 0.15,
    reviewVelocity: 0.10,
    socialMentions: 0.10,
  };

  const factors = {
    searchGrowth: calcSearchGrowth(product, trendSignals),
    multiSitePresence: calcMultiSitePresence(product),
    priceViability: calcPriceViability(product),
    marginPotential: calcMarginPotential(product),
    reviewVelocity: calcReviewVelocity(product),
    socialMentions: calcSocialMentions(product, trendSignals),
  };

  const score = Object.keys(weights).reduce(
    (sum, key) => sum + factors[key] * weights[key],
    0
  );

  return {
    score: Math.round(score * 10) / 10,
    factors,
    breakdown: Object.keys(weights).map((key) => ({
      factor: key,
      value: factors[key],
      weight: weights[key],
      contribution: Math.round(factors[key] * weights[key] * 10) / 10,
    })),
  };
}

function calcSearchGrowth(product, signals) {
  const signal = signals.find((s) =>
    s.keyword.toLowerCase().includes(product.name.toLowerCase().split(' ')[0])
  );
  if (!signal) return 50;
  return Math.min(100, signal.score || 50);
}

function calcMultiSitePresence(product) {
  // Check how many major sites list this or similar products
  const sources = [product.source].filter(Boolean);
  let score = sources.length * 25;
  return Math.min(100, score);
}

function calcPriceViability(product) {
  if (!product.price || !product.cost) return 50;
  const ratio = product.cost / product.price;
  if (ratio < 0.3) return 100; // Great margin
  if (ratio < 0.4) return 80;
  if (ratio < 0.5) return 60;
  return 40;
}

function calcMarginPotential(product) {
  if (!product.price || !product.cost) return 50;
  const margin = ((product.price - product.cost) / product.price) * 100;
  if (margin > 60) return 100;
  if (margin > 50) return 80;
  if (margin > 40) return 60;
  return 40;
}

function calcReviewVelocity(product) {
  // Placeholder: in production, track review count changes over time
  const baseScore = Math.min((product.reviewCount || 0) / 10, 50);
  return baseScore + 30; // Base + recency boost
}

function calcSocialMentions(product, signals) {
  const mentions = signals.filter(
    (s) =>
      s.source === 'tiktok' || s.source === 'instagram'
  ).length;
  return Math.min(100, mentions * 20 + 30);
}

export function getRecommendations(scores, threshold = 75) {
  return scores
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
