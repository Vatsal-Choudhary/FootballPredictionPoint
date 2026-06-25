import { useState, useEffect } from 'react';
import api from '../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [confirmRecalc, setConfirmRecalc] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, matchesRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/matches'),
      ]);
      setStats(statsRes.data);
      setMatches(matchesRes.data.matches || []);
    } catch {
      setMessage({ text: 'Failed to load admin data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideResult = async (e) => {
    e.preventDefault();
    if (!selectedMatch || homeScore === '' || awayScore === '') return;
    setUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      await api.put(`/api/admin/matches/${selectedMatch}/result`, {
        home_score: parseInt(homeScore, 10),
        away_score: parseInt(awayScore, 10),
      });
      setMessage({ text: 'Match result updated and scores recalculated!', type: 'success' });
      setSelectedMatch('');
      setHomeScore('');
      setAwayScore('');
      fetchData();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update result', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setMessage({ text: '', type: '' });
    setConfirmRecalc(false);
    try {
      const res = await api.post('/api/admin/recalculate');
      setMessage({ text: res.data.message || 'All scores recalculated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to recalculate', type: 'error' });
    } finally {
      setRecalculating(false);
    }
  };

  const selectedMatchData = matches.find(m => String(m.id) === String(selectedMatch));

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard 🛡️</h1>
        <p className="page-subtitle">Manage match results and system operations</p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`toast toast-${message.type}`}
          style={{
            position: 'relative',
            marginBottom: 'var(--space-lg)',
            maxWidth: '100%',
            animation: 'slideIn 0.3s ease',
          }}
        >
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '0s' }}>
            <div className="stat-value">{stats.total_users || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="stat-value">{stats.total_predictions || 0}</div>
            <div className="stat-label">Total Predictions</div>
          </div>
          <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {stats.matches_finished || 0}
            </div>
            <div className="stat-label">Finished Matches</div>
          </div>
          <div className="glass-card stat-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {stats.matches_scheduled || 0}
            </div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Override Match Result */}
        <div className="glass-card-static animate-slide-up" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-lg)', fontSize: '1.1rem' }}>
            ✏️ Override Match Result
          </h3>

          <form onSubmit={handleOverrideResult}>
            <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
              <label className="form-label">Select Match</label>
              <select
                className="form-select"
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                required
              >
                <option value="">Choose a match...</option>
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    #{m.external_id || m.id} — {m.home_team?.name || 'TBD'} vs {m.away_team?.name || 'TBD'}
                    {m.status === 'FINISHED' ? ` (${m.home_score}-${m.away_score})` : ` [${m.status}]`}
                  </option>
                ))}
              </select>
            </div>

            {selectedMatchData && (
              <div style={{
                padding: 'var(--space-md)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-lg)',
                fontSize: '0.9rem',
              }}>
                <span style={{ fontWeight: 600 }}>{selectedMatchData.home_team?.name || 'TBD'}</span>
                <span className="text-secondary">vs</span>
                <span style={{ fontWeight: 600 }}>{selectedMatchData.away_team?.name || 'TBD'}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Home Score</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="20"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Away Score</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="20"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating || !selectedMatch}
              style={{ width: '100%' }}
            >
              {updating ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Updating...</>
              ) : (
                'Update Result & Recalculate'
              )}
            </button>
          </form>
        </div>

        {/* Recalculate All & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="glass-card-static animate-slide-up" style={{ padding: 'var(--space-xl)', animationDelay: '0.1s' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-md)', fontSize: '1.1rem' }}>
              🔄 Recalculate All Scores
            </h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-lg)' }}>
              Recalculates points for ALL predictions on finished matches. Useful if the scoring system was changed or data was corrected.
            </p>

            {!confirmRecalc ? (
              <button
                className="btn btn-danger"
                onClick={() => setConfirmRecalc(true)}
                disabled={recalculating}
                style={{ width: '100%' }}
              >
                Recalculate All Scores
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  className="btn btn-danger"
                  onClick={handleRecalculate}
                  disabled={recalculating}
                  style={{ flex: 1 }}
                >
                  {recalculating ? (
                    <><span className="spinner" style={{ width: 16, height: 16 }} /> Working...</>
                  ) : (
                    '⚠️ Confirm Recalculate'
                  )}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setConfirmRecalc(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Match Status Summary */}
          <div className="glass-card-static animate-slide-up" style={{ padding: 'var(--space-xl)', animationDelay: '0.15s' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-md)', fontSize: '1.1rem' }}>
              📊 Match Status Breakdown
            </h3>
            {stats?.matches_by_status && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {Object.entries(stats.matches_by_status).map(([status, count]) => (
                  <div key={status} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-sm) var(--space-md)',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span className={`badge badge-${status === 'FINISHED' ? 'finished' : status === 'LIVE' ? 'live' : 'scheduled'}`}>
                      {status}
                    </span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
            {!stats?.matches_by_status && (
              <p className="text-secondary text-sm">No status breakdown available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
