// admin/ProductPipeline.jsx - Product candidate pipeline component

import { useState } from 'react';

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Galaxy Slime Lab Kit', category: 'STEM', price: 29.99, trendScore: 92, status: 'approved', source: 'TikTok' },
  { id: 'p2', name: 'Magnetic Building Blocks 200pc', category: 'STEM', price: 39.99, trendScore: 88, status: 'approved', source: 'Amazon' },
  { id: 'p3', name: 'Coding Robot for Kids', category: 'STEM', price: 49.99, trendScore: 85, status: 'pending', source: 'Google Trends' },
  { id: 'p4', name: 'Water Table Outdoor Play Set', category: 'Outdoor', price: 59.99, trendScore: 82, status: 'pending', source: 'Amazon' },
  { id: 'p5', name: 'Sensory Play Bean Bags', category: 'Sensory', price: 19.99, trendScore: 76, status: 'pending', source: 'TikTok' },
  { id: 'p6', name: 'Kids Escape Room Game', category: 'Games', price: 24.99, trendScore: 68, status: 'rejected', source: 'Walmart' },
];

const STATUS_COLORS = { approved: '#4ECDC4', pending: '#F7DC6F', rejected: '#FF6B6B', published: '#87CEEB' };

export default function ProductPipeline() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? products : products.filter((p) => p.status === filter);

  const approve = (id) => setProducts((ps) => ps.map((p) => p.id === id ? { ...p, status: 'approved' } : p));
  const reject = (id) => setProducts((ps) => ps.map((p) => p.id === id ? { ...p, status: 'rejected' } : p));
  const publish = (id) => setProducts((ps) => ps.map((p) => p.id === id ? { ...p, status: 'published' } : p));

  return (
    <div className="pipeline-panel">
      <div className="panel-header">
        <h3>📦 Product Pipeline</h3>
        <div className="filter-tabs">
          {['all', 'pending', 'approved', 'published', 'rejected'].map((f) => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="product-list">
        {filtered.map((p) => (
          <div key={p.id} className="product-row">
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-meta">
                <span className="category-tag">{p.category}</span>
                <span className="source-tag">{p.source}</span>
                <span className="price">${p.price}</span>
              </div>
            </div>
            <div className="product-score">
              <span className={`score-pill ${p.trendScore >= 80 ? 'high' : p.trendScore >= 65 ? 'med' : 'low'}`}>
                {p.trendScore}
              </span>
            </div>
            <div className="product-status">
              <span className="status-badge" style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status] }}>
                {p.status}
              </span>
            </div>
            <div className="product-actions">
              {p.status === 'pending' && (
                <>
                  <button className="action-btn approve" onClick={() => approve(p.id)}>✓</button>
                  <button className="action-btn reject" onClick={() => reject(p.id)}>✗</button>
                </>
              )}
              {p.status === 'approved' && (
                <button className="action-btn publish" onClick={() => publish(p.id)}>🚀 Publish</button>
              )}
              {p.status === 'published' && (
                <span className="published-label">✅ Live</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .pipeline-panel { padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .panel-header h3 { font-size: 1.1rem; font-weight: 600; }
        .filter-tabs { display: flex; gap: 0.5rem; }
        .filter-tab { background: rgba(255,255,255,0.05); border: none; color: #888; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
        .filter-tab.active { background: rgba(78,205,196,0.2); color: #4ECDC4; }
        .product-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .product-row { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 8px; flex-wrap: wrap; }
        .product-info { flex: 1; min-width: 200px; }
        .product-name { font-weight: 600; margin-bottom: 0.3rem; }
        .product-meta { display: flex; gap: 0.5rem; font-size: 0.75rem; color: #888; }
        .category-tag, .source-tag { background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; }
        .price { color: #4ECDC4; font-weight: 600; }
        .score-pill { padding: 0.3rem 0.7rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; }
        .score-pill.high { background: rgba(78,205,196,0.2); color: #4ECDC4; }
        .score-pill.med { background: rgba(247,220,111,0.2); color: #F7DC6F; }
        .score-pill.low { background: rgba(255,255,255,0.1); color: #aaa; }
        .status-badge { padding: 0.3rem 0.7rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; font-size: 1rem; }
        .action-btn.approve { background: rgba(78,205,196,0.2); color: #4ECDC4; }
        .action-btn.reject { background: rgba(255,107,107,0.2); color: #FF6B6B; }
        .action-btn.publish { background: #4ECDC4; color: #1a1a2e; padding: 0.5rem 1rem; width: auto; font-weight: 600; border-radius: 8px; }
        .published-label { color: #87CEEB; font-weight: 600; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}