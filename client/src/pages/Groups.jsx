import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import GroupCard from '../components/GroupCard';
import InviteCodeModal from '../components/InviteCodeModal';

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups/my');
      setGroups(res.data.groups || []);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/api/groups', { name: createName.trim() });
      setCreatedGroup(res.data.group);
      setCreateName('');
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSuccess = () => {
    setShowJoinModal(false);
    fetchGroups();
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="groups-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Your Groups 👥</h1>
        <p className="page-subtitle">Create private prediction leagues and compete with friends</p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={() => { setShowCreateForm(!showCreateForm); setCreatedGroup(null); setError(''); }}
        >
          ➕ Create New Group
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowJoinModal(true)}
        >
          🔑 Join with Invite Code
        </button>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="glass-card-static animate-slide-up" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)', maxWidth: 500 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-md)', fontSize: '1.1rem' }}>
            Create a New Group
          </h3>

          {createdGroup ? (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🎉</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)', marginBottom: 'var(--space-xs)' }}>
                  Group Created!
                </h4>
                <p className="text-secondary text-sm">Share this invite code with your friends</p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) var(--space-lg)',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-md)'
              }}>
                <code style={{
                  fontFamily: 'monospace',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  letterSpacing: '0.15em'
                }}>
                  {createdGroup.invite_code}
                </code>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopyCode(createdGroup.invite_code)}
                >
                  {copySuccess ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/groups/${createdGroup.id}`)}
                >
                  View Group →
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setCreatedGroup(null); setShowCreateForm(false); }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Group Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Office World Cup Pool"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              {error && (
                <p className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</p>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating || !createName.trim()}
                >
                  {creating ? (
                    <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</>
                  ) : (
                    'Create Group'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setShowCreateForm(false); setError(''); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="glass-card-static" style={{
          padding: 'var(--space-3xl)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🏟️</div>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-sm)' }}>
            No Groups Yet
          </h3>
          <p className="text-secondary" style={{ maxWidth: 400, margin: '0 auto' }}>
            Create a group to start competing with friends, or join one with an invite code!
          </p>
        </div>
      ) : (
        <div className="grid grid-auto-fill">
          {groups.map((group, idx) => (
            <GroupCard
              key={group.id}
              group={group}
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => navigate(`/groups/${group.id}`)}
            />
          ))}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <InviteCodeModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
}
