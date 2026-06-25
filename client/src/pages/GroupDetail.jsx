import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, lbRes] = await Promise.all([
          api.get(`/api/groups/${id}`),
          api.get(`/api/groups/${id}/leaderboard`),
        ]);
        setGroup(groupRes.data.group);
        setMembers(groupRes.data.members || []);
        setLeaderboard(lbRes.data.leaderboard || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load group');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCopyCode = async () => {
    if (!group?.invite_code) return;
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = group.invite_code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg('');
    try {
      await api.post(`/api/groups/${id}/invite`, { email: inviteEmail.trim() });
      setInviteMsg('Invitation sent!');
      setInviteEmail('');
      setTimeout(() => setInviteMsg(''), 3000);
    } catch (err) {
      setInviteMsg(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const rankEmoji = (idx) => {
    if (idx === 0) return '🥇';
    if (idx === 1) return '🥈';
    if (idx === 2) return '🥉';
    return `#${idx + 1}`;
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card-static animate-fade-in" style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>😕</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-sm)' }}>
          {error}
        </h3>
        <button className="btn btn-secondary" onClick={() => navigate('/groups')}>
          ← Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="group-detail-page animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/groups')}
            style={{ marginBottom: 'var(--space-sm)' }}
          >
            ← Back to Groups
          </button>
          <h1 className="page-title">{group?.name || 'Group'}</h1>
          <p className="page-subtitle">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Invite Code Badge */}
        <div className="glass-card-static" style={{ padding: 'var(--space-md) var(--space-lg)' }}>
          <p className="text-xs text-secondary" style={{ marginBottom: 4 }}>Invite Code</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <code style={{
              fontFamily: 'monospace',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.12em'
            }}>
              {group?.invite_code}
            </code>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyCode}
              style={{ fontSize: '0.75rem' }}
            >
              {copySuccess ? '✅' : '📋'}
            </button>
          </div>
        </div>
      </div>

      {/* Invite by Email */}
      <div className="glass-card-static animate-slide-up" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)', maxWidth: 500 }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-sm)', fontSize: '0.95rem' }}>
          📧 Invite via Email
        </h4>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <input
            type="email"
            className="form-input"
            placeholder="friend@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={inviting}>
            {inviting ? '...' : 'Send'}
          </button>
        </form>
        {inviteMsg && (
          <p style={{
            marginTop: 'var(--space-sm)',
            fontSize: '0.85rem',
            color: inviteMsg.includes('sent') ? 'var(--success)' : 'var(--error)'
          }}>
            {inviteMsg}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-xl)', display: 'inline-flex' }}>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Members
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card-static animate-fade-in" style={{ overflow: 'hidden' }}>
          {leaderboard.length === 0 ? (
            <div style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>📊</div>
              <p className="text-secondary">No predictions yet. Start predicting to see rankings!</p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboard.length >= 3 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-xl) var(--space-lg) var(--space-md)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  {[1, 0, 2].map((idx) => {
                    const entry = leaderboard[idx];
                    if (!entry) return null;
                    const isFirst = idx === 0;
                    const heights = { 0: 120, 1: 90, 2: 70 };
                    const colors = { 0: 'var(--gold)', 1: '#c0c0c0', 2: '#cd7f32' };
                    return (
                      <div key={idx} style={{ textAlign: 'center', flex: '0 0 auto' }}>
                        <div style={{
                          fontSize: isFirst ? '2rem' : '1.5rem',
                          marginBottom: 4
                        }}>
                          {rankEmoji(idx)}
                        </div>
                        <p style={{
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          marginBottom: 4,
                          color: user?.id === entry.user_id ? 'var(--gold)' : 'var(--text-primary)'
                        }}>
                          {entry.username}
                        </p>
                        <div style={{
                          width: 80,
                          height: heights[idx],
                          background: `linear-gradient(to top, ${colors[idx]}22, ${colors[idx]}44)`,
                          borderRadius: '8px 8px 0 0',
                          border: `1px solid ${colors[idx]}55`,
                          borderBottom: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: colors[idx] }}>
                            {entry.total_points || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full Table */}
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 60 }}>Rank</th>
                      <th>Player</th>
                      <th style={{ textAlign: 'right' }}>Points</th>
                      <th style={{ textAlign: 'right' }}>Predictions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => (
                      <tr key={entry.user_id || idx} className={user?.id === entry.user_id ? 'table-row-highlight' : ''}>
                        <td>
                          <span style={{ fontSize: idx < 3 ? '1.1rem' : '0.9rem' }}>
                            {rankEmoji(idx)}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: user?.id === entry.user_id ? 700 : 400 }}>
                            {entry.username}
                            {user?.id === entry.user_id && (
                              <span className="badge badge-gold" style={{ marginLeft: 8, fontSize: '0.6rem' }}>You</span>
                            )}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                          {entry.total_points || 0}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                          {entry.prediction_count || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {members.map((member, idx) => (
            <div
              key={member.user_id || idx}
              className="glass-card animate-slide-up"
              style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
                animationDelay: `${idx * 0.04}s`,
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--gold-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-sm)',
                fontSize: '1.2rem',
                color: 'var(--text-inverse)',
                fontWeight: 700,
              }}>
                {(member.username || '?')[0].toUpperCase()}
              </div>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>
                {member.username}
                {user?.id === member.user_id && (
                  <span className="badge badge-gold" style={{ marginLeft: 6, fontSize: '0.55rem' }}>You</span>
                )}
              </p>
              <p className="text-xs text-secondary">
                Joined {new Date(member.joined_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
