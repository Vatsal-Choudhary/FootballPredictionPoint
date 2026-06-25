import { useState } from 'react';
import api from '../api/client';

export default function InviteCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/api/groups/join', { invite_code: code.trim().toUpperCase() });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid invite code or group is full');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🔑</div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            fontWeight: 700,
            marginBottom: 'var(--space-xs)',
          }}>
            Join a Group
          </h2>
          <p className="text-secondary text-sm">
            Enter the invite code shared by a group member
          </p>
        </div>

        {success ? (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🎉</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--success)' }}>
              Successfully Joined!
            </h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="form-label">Invite Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., A1B2C3D4"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                autoFocus
                style={{
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  fontFamily: 'monospace',
                }}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--error-bg)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-md)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--error)' }}>
                  ❌ {error}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !code.trim()}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 16, height: 16 }} /> Joining...</>
                ) : (
                  'Join Group'
                )}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
