// products.js - Product CRUD operations
// Stores products in-memory (use SQLite/Postgres in production)

let products = [
  // Featured toys
  {
    id: 'p1',
    name: 'Galaxy Slime Lab Kit',
    category: 'STEM',
    price: 29.99,
    cost: 12.00,
    source: 'Amazon Best Sellers',
    sourceUrl: 'https://amazon.com/bestsellers/toys',
    trendScore: 92,
    status: 'approved',
    tags: ['slime', 'science', 'sensory', 'viral'],
    imageUrl: '/images/slime-lab.jpg',
    description: 'Make 10+ types of slime with this complete lab kit',
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-18T14:30:00Z',
    publishedAt: '2026-05-16T08:00:00Z',
  },
  {
    id: 'p2',
    name: 'Magnetic Building Blocks 200pc',
    category: 'STEM',
    price: 39.99,
    cost: 15.00,
    source: 'TikTok Viral',
    sourceUrl: 'https://tiktok.com/discover',
    trendScore: 88,
    status: 'approved',
    tags: ['building', 'magnets', 'creative', 'tiktok'],
    imageUrl: '/images/magnetic-blocks.jpg',
    description: '200-piece magnetic tile set for endless creativity',
    createdAt: '2026-05-14T09:00:00Z',
    updatedAt: '2026-05-17T11:00:00Z',
    publishedAt: '2026-05-15T08:00:00Z',
  },
  {
    id: 'p3',
    name: 'Coding Robot for Kids',
    category: 'STEM',
    price: 49.99,
    cost: 22.00,
    source: 'Google Trends',
    sourceUrl: 'https://trends.google.com',
    trendScore: 85,
    status: 'pending',
    tags: ['coding', 'robot', 'educational', 'stem'],
    imageUrl: '/images/coding-robot.jpg',
    description: 'Screen-free coding robot that grows with your child',
    createdAt: '2026-05-16T08:00:00Z',
    updatedAt: '2026-05-19T10:00:00Z',
    publishedAt: null,
  },
  {
    id: 'p4',
    name: 'Water Table Outdoor Play Set',
    category: 'Outdoor',
    price: 59.99,
    cost: 28.00,
    source: 'Amazon New Releases',
    sourceUrl: 'https://amazon.com/newreleases/toys',
    trendScore: 82,
    status: 'pending',
    tags: ['water', 'outdoor', 'summer', 'active'],
    imageUrl: '/images/water-table.jpg',
    description: 'Summertime water play table with 12 accessories',
    createdAt: '2026-05-17T07:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
    publishedAt: null,
  },
  {
    id: 'p5',
    name: 'Escape Room Card Game Family',
    category: 'Games',
    price: 24.99,
    cost: 8.00,
    source: 'Walmart Trending',
    sourceUrl: 'https://walmart.com/trending',
    trendScore: 76,
    status: 'rejected',
    tags: ['game', 'family', 'puzzle', 'cooperative'],
    imageUrl: '/images/escape-room.jpg',
    description: 'Cooperative card game - solve puzzles to escape',
    createdAt: '2026-05-13T06:00:00Z',
    updatedAt: '2026-05-16T12:00:00Z',
    publishedAt: null,
  },
];

export async function getProducts({ status, category, limit = 50 } = {}) {
  let result = [...products];
  if (status) result = result.filter((p) => p.status === status);
  if (category) result = result.filter((p) => p.category === category);
  return result.slice(0, limit);
}

export async function getProduct(id) {
  return products.find((p) => p.id === id) || null;
}

export async function createProduct(data) {
  const product = {
    id: `p${Date.now()}`,
    trendScore: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    ...data,
  };
  products.push(product);
  return product;
}

export async function updateProduct(id, data) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = {
    ...products[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return products[idx];
}

export async function deleteProduct(id) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}
