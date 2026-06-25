import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/api/predictions/leaderboard');
        setLeaderboard(res.data.leaderboard || []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const rankEmoji = (idx) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

  const podiumColors = ['#d4af37', '#c0c0c0', '#cd7f32'];
  const podiumHeights = [140, 105, 80];

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="leaderboard-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Global Rankings 🏆</h1>
        <p className="page-subtitle">
          {leaderboard.length} predictor{leaderboard.length !== 1 ? 's' : ''} competing
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="glass-card-static" style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🏟️</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-sm)' }}>
            No Rankings Yet
          </h3>
          <p className="text-secondary">
            Start predicting match scores to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Podium — Top 3 */}
          {leaderboard.length >= 3 && (
            <div className="glass-card-static animate-slide-up" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 'var(--space-lg)',
              }}>
                {[1, 0, 2].map((idx) => {
                  const entry = leaderboard[idx];
                  if (!entry) return null;
                  const isFirst = idx === 0;
                  const color = podiumColors[idx];
                  return (
                    <div key={idx} style={{
                      textAlign: 'center',
                      animation: 'slideUp 0.6s ease forwards',
                      animationDelay: `${idx * 0.15}s`,
                      opacity: 0,
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: isFirst ? 64 : 52,
                        height: isFirst ? 64 : 52,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${color}, ${color}88)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-sm)',
                        fontSize: isFirst ? '1.5rem' : '1.2rem',
                        fontWeight: 800,
                        color: '#0a0e27',
                        boxShadow: `0 0 20px ${color}44`,
                        border: `2px solid ${color}`,
                      }}>
                        {(entry.username || '?')[0].toUpperCase()}
                      </div>

                      {/* Name */}
                      <p style={{
                        fontWeight: 700,
                        fontSize: isFirst ? '1rem' : '0.9rem',
                        marginBottom: 2,
                        color: user?.id === entry.user_id ? 'var(--gold)' : 'var(--text-primary)'
                      }}>
                        {entry.username}
                      </p>
                      <p className="text-xs text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
                        {entry.prediction_count || 0} predictions
                      </p>

                      {/* Podium Bar */}
                      <div style={{
                        width: isFirst ? 100 : 85,
                        height: podiumHeights[idx],
                        background: `linear-gradient(to top, ${color}11, ${color}33)`,
                        borderRadius: '12px 12px 0 0',
                        border: `1px solid ${color}44`,
                        borderBottom: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}>
                        <span style={{ fontSize: isFirst ? '1.8rem' : '1.4rem' }}>
                          {rankEmoji(idx)}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 800,
                          fontSize: isFirst ? '1.5rem' : '1.2rem',
                          color: color,
                        }}>
                          {entry.total_points || 0}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          points
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="glass-card-static animate-slide-up" style={{ overflow: 'hidden', animationDelay: '0.2s' }}>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 70 }}>Rank</th>
                    <th>Player</th>
                    <th style={{ textAlign: 'right' }}>Points</th>
                    <th style={{ textAlign: 'right' }}>Predictions</th>
                    <th style={{ textAlign: 'right' }}>Avg/Match</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const avg = entry.prediction_count > 0
                      ? ((entry.total_points || 0) / entry.prediction_count).toFixed(1)
                      : '0.0';
                    const isCurrentUser = user?.id === entry.user_id;
                    return (
                      <tr
                        key={entry.user_id || idx}
                        className={isCurrentUser ? 'table-row-highlight' : ''}
                        style={{
                          animation: 'fadeIn 0.3s ease forwards',
                          animationDelay: `${idx * 0.03}s`,
                          opacity: 0,
                        }}
                      >
                        <td>
                          <span style={{
                            fontSize: idx < 3 ? '1.2rem' : '0.9rem',
                            fontWeight: idx < 3 ? 700 : 400,
                          }}>
                            {rankEmoji(idx)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <div style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: idx < 3
                                ? `linear-gradient(135deg, ${podiumColors[idx]}, ${podiumColors[idx]}88)`
                                : 'rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: idx < 3 ? '#0a0e27' : 'var(--text-secondary)',
                              flexShrink: 0,
                            }}>
                              {(entry.username || '?')[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: isCurrentUser ? 700 : 500 }}>
                              {entry.username}
                              {isCurrentUser && (
                                <span className="badge badge-gold" style={{ marginLeft: 8, fontSize: '0.6rem' }}>You</span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          color: idx === 0 ? 'var(--gold)' : idx < 3 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}>
                          {entry.total_points || 0}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                          {entry.prediction_count || 0}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {avg}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
