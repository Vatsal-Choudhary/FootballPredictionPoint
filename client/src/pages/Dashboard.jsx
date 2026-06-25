import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import MatchCard from '../components/MatchCard';

const STATUS_TABS = [
  { key: 'all', label: 'All Matches' },
  { key: 'SCHEDULED', label: 'Upcoming' },
  { key: 'LIVE', label: 'Live' },
  { key: 'FINISHED', label: 'Finished' },
];

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'GROUP_STAGE', label: 'Group Stage' },
  { value: 'Group A', label: 'Group A' },
  { value: 'Group B', label: 'Group B' },
  { value: 'Group C', label: 'Group C' },
  { value: 'Group D', label: 'Group D' },
  { value: 'Group E', label: 'Group E' },
  { value: 'Group F', label: 'Group F' },
  { value: 'Group G', label: 'Group G' },
  { value: 'Group H', label: 'Group H' },
  { value: 'Group I', label: 'Group I' },
  { value: 'Group J', label: 'Group J' },
  { value: 'Group K', label: 'Group K' },
  { value: 'Group L', label: 'Group L' },
  { value: 'ROUND_OF_32', label: 'Round of 32' },
  { value: 'ROUND_OF_16', label: 'Round of 16' },
  { value: 'QUARTER_FINAL', label: 'Quarter-finals' },
  { value: 'SEMI_FINAL', label: 'Semi-finals' },
  { value: 'THIRD_PLACE', label: 'Third Place' },
  { value: 'FINAL', label: 'Final' },
];

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('SCHEDULED');
  const [stageFilter, setStageFilter] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);

  const fetchMatches = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (stageFilter) params.stage = stageFilter;
      const res = await client.get('/matches', { params });
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, stageFilter]);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await client.get('/predictions/my');
      const preds = res.data.predictions || [];
      const pts = preds.reduce((acc, p) => acc + (p.points || 0), 0);
      setTotalPoints(pts);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const handleUpdated = () => {
    fetchMatches();
    fetchPoints();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Predict & Win 🏆</h1>
        <p className="page-subtitle">
          Your total points: <strong style={{ color: 'var(--gold)', fontSize: '1.1em' }}>{totalPoints}</strong>
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${statusFilter === tab.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          className="form-select"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Match Grid */}
      {loading ? (
        <div className="grid grid-auto-fill">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer skeleton-card" style={{ height: 280 }} />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚽</div>
          <div className="empty-state-title">No Matches Found</div>
          <p className="empty-state-text">
            No matches match your current filters. Try changing the status or stage filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-auto-fill stagger-children">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
