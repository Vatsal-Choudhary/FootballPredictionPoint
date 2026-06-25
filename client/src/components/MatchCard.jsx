import { useState, useEffect } from 'react';
import PredictionForm from './PredictionForm';

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMatchTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function Countdown({ lockTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const lock = new Date(lockTime);
      const diff = lock - now;
      if (diff <= 0) {
        setRemaining(null);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      if (days > 0) {
        setRemaining({ d: days, h: hours, m: mins, s: secs });
      } else {
        setRemaining({ d: 0, h: hours, m: mins, s: secs });
      }
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [lockTime]);

  if (!remaining) return <span className="badge badge-locked">🔒 Locked</span>;

  return (
    <div className="countdown">
      {remaining.d > 0 && (
        <>
          <div className="countdown-unit">
            <div className="countdown-value">{remaining.d}</div>
            <div className="countdown-label">Day{remaining.d !== 1 ? 's' : ''}</div>
          </div>
          <span className="countdown-sep">:</span>
        </>
      )}
      <div className="countdown-unit">
        <div className="countdown-value">{String(remaining.h).padStart(2, '0')}</div>
        <div className="countdown-label">Hrs</div>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className="countdown-value">{String(remaining.m).padStart(2, '0')}</div>
        <div className="countdown-label">Min</div>
      </div>
      <span className="countdown-sep">:</span>
      <div className="countdown-unit">
        <div className="countdown-value">{String(remaining.s).padStart(2, '0')}</div>
        <div className="countdown-label">Sec</div>
      </div>
    </div>
  );
}

export default function MatchCard({ match, onUpdated }) {
  const statusBadge = () => {
    switch (match.status) {
      case 'LIVE':
      case 'IN_PLAY':
        return <span className="badge badge-live">Live</span>;
      case 'FINISHED':
        return <span className="badge badge-finished">Finished</span>;
      default:
        return <span className="badge badge-scheduled">Upcoming</span>;
    }
  };

  const flagSrc = (team) => {
    if (team?.flag_url) return team.flag_url;
    if (team?.code) return `https://flagcdn.com/w80/${team.code.toLowerCase().slice(0, 2)}.png`;
    return null;
  };

  return (
    <div className="glass-card match-card animate-slide-up">
      {/* Header */}
      <div className="match-card-header">
        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
          {match.stage || 'Group Stage'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {statusBadge()}
          <span className="text-xs text-secondary">
            {formatMatchDate(match.match_date || match.utc_date)} · {formatMatchTime(match.match_date || match.utc_date)}
          </span>
        </div>
      </div>

      {/* Body: Teams */}
      <div className="match-card-body">
        <div className="match-teams">
          {/* Home */}
          <div className="match-team">
            {flagSrc(match.home_team) && (
              <img
                src={flagSrc(match.home_team)}
                alt={match.home_team?.name || 'Home'}
                className="match-team-flag"
                loading="lazy"
              />
            )}
            <span className="match-team-name">{match.home_team?.name || 'TBD'}</span>
            <span className="match-team-code">{match.home_team?.code || '???'}</span>
          </div>

          {/* Score or VS */}
          {match.status === 'FINISHED' || match.status === 'LIVE' || match.status === 'IN_PLAY' ? (
            <div className="match-score">
              {match.home_score ?? '–'}
              <span className="match-score-sep">:</span>
              {match.away_score ?? '–'}
            </div>
          ) : (
            <div className="match-vs">VS</div>
          )}

          {/* Away */}
          <div className="match-team">
            {flagSrc(match.away_team) && (
              <img
                src={flagSrc(match.away_team)}
                alt={match.away_team?.name || 'Away'}
                className="match-team-flag"
                loading="lazy"
              />
            )}
            <span className="match-team-name">{match.away_team?.name || 'TBD'}</span>
            <span className="match-team-code">{match.away_team?.code || '???'}</span>
          </div>
        </div>

        {/* Countdown for upcoming matches */}
        {match.status === 'SCHEDULED' && match.lock_time && (
          <div style={{ marginTop: 16 }}>
            <p className="text-xs text-secondary text-center" style={{ marginBottom: 6 }}>Locks in</p>
            <Countdown lockTime={match.lock_time} />
          </div>
        )}
      </div>

      {/* Prediction Form */}
      <PredictionForm match={match} onUpdated={onUpdated} />
    </div>
  );
}
