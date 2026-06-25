export default function GroupCard({ group, onClick, style }) {
  return (
    <div
      className="glass-card group-card animate-slide-up"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        padding: 'var(--space-lg)',
        cursor: 'pointer',
        ...style,
      }}
    >
      {/* Group Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-md)',
        background: 'var(--gold-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--space-md)',
        fontSize: '1.3rem',
      }}>
        ⚽
      </div>

      {/* Group Name */}
      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: 'var(--space-xs)',
        color: 'var(--text-primary)',
      }}>
        {group.name}
      </h3>

      {/* Members Count */}
      <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-md)' }}>
        👥 {group.member_count || group.members_count || '—'} member{(group.member_count || group.members_count) !== 1 ? 's' : ''}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>
          {group.invite_code}
        </span>
        <span style={{
          fontSize: '0.8rem',
          color: 'var(--gold)',
          fontWeight: 600,
        }}>
          View →
        </span>
      </div>
    </div>
  );
}
