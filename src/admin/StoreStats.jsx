// admin/StoreStats.jsx - Store metrics and analytics dashboard

import { useState } from 'react';

const MOCK_STATS = {
  totalProducts: 24,
  pendingReview: 5,
  approvedCount: 12,
  publishedCount: 7,
  rejectedCount: 3,
  avgTrendScore: 74,
  topCategory: 'STEM',
  totalRevenue: 0,
  thisWeekOrders: 0,
  topProduct: 'Galaxy Slime Lab Kit',
};

const MOCK_ACTIVITY = [
  { action: 'Product approved', product: 'Coding Robot for Kids', time: '2 hours ago' },
  { action: 'Product published', product: 'Magnetic Building Blocks', time: '5 hours ago' },
  { action: 'New trend detected', product: 'Sensory play sets', time: '8 hours ago' },
  { action: 'Product rejected', product: 'Kids Escape Room Game', time: '1 day ago' },
  { action: 'Pipeline run completed', product: '14 products scored', time: '1 day ago' },
];

export default function StoreStats() {
  const [stats] = useState(MOCK_STATS);
  const [activity] = useState(MOCK_ACTIVITY);

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h3>📊 Store Stats</h3>
        <div className="last-updated">Updated just now</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">{stats.pendingReview}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.publishedCount}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgTrendScore}</div>
          <div className="stat-label">Avg Trend Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.topCategory}</div>
          <div className="stat-label">Top Category</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Revenue (soon)</div>
        </div>
      </div>

      <div className="activity-section">
        <h4>Recent Activity</h4>
        <div className="activity-list">
          {activity.map((a, i) => (
            <div key={i} className="activity-row">
              <div className="activity-action">{a.action}</div>
              <div className="activity-product">{a.product}</div>
              <div className="activity-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pipeline-status">
        <h4>Pipeline Health</h4>
        <div className="health-bar">
          <div className="health-segment approved" style={{ width: '50%' }} title="Approved: 12" />
          <div className="health-segment published" style={{ width: '29%' }} title="Published: 7" />
          <div className="health-segment rejected" style={{ width: '13%' }} title="Rejected: 3" />
          <div className="health-segment pending" style={{ width: '8%' }} title="Pending: 5" />
        </div>
        <div className="health-legend">
          <span><i style={{ background: '#4ECDC4' }} />Approved</span>
          <span><i style={{ background: '#87CEEB' }} />Published</span>
          <span><i style={{ background: '#FF6B6B' }} />Rejected</span>
          <span><i style={{ background: '#F7DC6F' }} />Pending</span>
        </div>
      </div>

      <style>{`
        .stats-panel { padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .panel-header h3 { font-size: 1.1rem; font-weight: 600; }
        .last-updated { font-size: 0.8rem; color: #888; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; text-align: center; }
        .stat-card.highlight { border: 1px solid rgba(247,220,111,0.3); }
        .stat-value { font-size: 1.75rem; font-weight: 700; color: #4ECDC4; }
        .stat-label { font-size: 0.75rem; color: #888; margin-top: 0.3rem; text-transform: uppercase; }
        .activity-section h4, .pipeline-status h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 1rem; color: #ccc; }
        .activity-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
        .activity-row { display: flex; gap: 0.75rem; font-size: 0.85rem; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 6px; }
        .activity-action { color: #4ECDC4; min-width: 130px; }
        .activity-product { color: #fff; flex: 1; }
        .activity-time { color: #666; font-size: 0.75rem; }
        .health-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.75rem; }
        .health-segment { height: 100%; }
        .health-segment.approved { background: #4ECDC4; }
        .health-segment.published { background: #87CEEB; }
        .health-segment.rejected { background: #FF6B6B; }
        .health-segment.pending { background: #F7DC6F; }
        .health-legend { display: flex; gap: 1rem; font-size: 0.75rem; color: #888; }
        .health-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 0.3rem; }
      `}</style>
    </div>
  );
}