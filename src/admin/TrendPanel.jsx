// admin/TrendPanel.jsx - Trend research dashboard component

import { useState } from 'react';

const MOCK_TRENDS = [
  { keyword: 'slime kits for kids', score: 92, source: 'TikTok', trend: 'rising', volume: '45K/mo' },
  { keyword: 'magnetic building tiles', score: 88, source: 'Amazon', trend: 'rising', volume: '32K/mo' },
  { keyword: 'kids coding robot', score: 85, source: 'Google Trends', trend: 'rising', volume: '28K/mo' },
  { keyword: 'sensory play sets', score: 81, source: 'TikTok', trend: 'stable', volume: '18K/mo' },
  { keyword: 'water table outdoor', score: 78, source: 'Amazon', trend: 'rising', volume: '22K/mo' },
  { keyword: 'glow in dark crafts', score: 74, source: 'TikTok', trend: 'rising', volume: '15K/mo' },
  { keyword: 'stem subscription box', score: 70, source: 'Google Trends', trend: 'stable', volume: '12K/mo' },
];

export default function TrendPanel() {
  const [trends, setTrends] = useState(MOCK_TRENDS);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState('May 20, 2026 at 6:45 AM');

  const runResearch = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setTrends(MOCK_TRENDS.map((t) => ({ ...t, score: Math.max(50, t.score + Math.floor(Math.random() * 6) - 2) })));
    setLastRun(new Date().toLocaleString());
    setLoading(false);
  };

  return (
    <div className="trend-panel">
      <div className="panel-header">
        <h3>🔥 Trend Research</h3>
        <div className="panel-meta">Last run: {lastRun}</div>
      </div>

      <div className="run-research-bar">
        <button className="run-btn" onClick={runResearch} disabled={loading}>
          {loading ? '⏳ Scanning...' : '▶ Run Research'}
        </button>
        <span className="hint">Scans TikTok, Amazon Bestsellers, Google Trends</span>
      </div>

      <table className="trend-table">
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Score</th>
            <th>Source</th>
            <th>Trend</th>
            <th>Volume</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trends.map((t, i) => (
            <tr key={i}>
              <td className="keyword">{t.keyword}</td>
              <td>
                <span className={`score-badge ${t.score >= 80 ? 'high' : t.score >= 65 ? 'med' : 'low'}`}>
                  {t.score}
                </span>
              </td>
              <td className="source">{t.source}</td>
              <td>
                <span className={`trend-badge ${t.trend}`}>{t.trend === 'rising' ? '📈' : '➡️'} {t.trend}</span>
              </td>
              <td className="volume">{t.volume}</td>
              <td>
                <button className="add-btn">+ Add to Pipeline</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .trend-panel { padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .panel-header h3 { font-size: 1.1rem; font-weight: 600; }
        .panel-meta { font-size: 0.8rem; color: #888; }
        .run-research-bar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .run-btn { background: #FF6B6B; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .run-btn:disabled { opacity: 0.7; }
        .hint { font-size: 0.8rem; color: #888; }
        .trend-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .trend-table th { text-align: left; padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: #888; font-weight: 500; }
        .trend-table td { padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .keyword { font-weight: 500; color: #fff; }
        .score-badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.8rem; }
        .score-badge.high { background: rgba(78, 205, 196, 0.2); color: #4ECDC4; }
        .score-badge.med { background: rgba(247, 220, 111, 0.2); color: #F7DC6F; }
        .score-badge.low { background: rgba(255,255,255,0.1); color: #aaa; }
        .trend-badge { font-size: 0.8rem; }
        .add-btn { background: rgba(78, 205, 196, 0.15); color: #4ECDC4; border: 1px solid rgba(78,205,196,0.3); padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}