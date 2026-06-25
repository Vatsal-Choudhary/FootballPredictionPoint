import { useState, useEffect } from 'react';
import client from '../api/client';

export default function PredictionForm({ match, onUpdated }) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hasPrediction, setHasPrediction] = useState(false);

  const isLocked = match.status !== 'SCHEDULED' || (match.lock_time && new Date(match.lock_time) <= new Date());
  const isFinished = match.status === 'FINISHED';

  useEffect(() => {
    if (match.my_prediction) {
      setHomeScore(match.my_prediction.predicted_home ?? 0);
      setAwayScore(match.my_prediction.predicted_away ?? 0);
      setHasPrediction(true);
    }
  }, [match.my_prediction]);

  const handleSubmit = async () => {
    if (isLocked) return;
    setLoading(true);
    setFeedback(null);
    try {
      await client.post('/predictions', {
        match_id: match.id,
        predicted_home: homeScore,
        predicted_away: awayScore,
      });
      setFeedback({ type: 'success', message: hasPrediction ? 'Prediction updated!' : 'Prediction saved!' });
      setHasPrediction(true);
      if (onUpdated) onUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.error || 'Failed to save prediction',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const increment = (setter) => () => setter((prev) => Math.min(prev + 1, 20));
  const decrement = (setter) => () => setter((prev) => Math.max(prev - 1, 0));

  // Locked or finished state — show summary
  if (isLocked) {
    return (
      <div className="match-card-footer">
        {hasPrediction ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="text-secondary text-sm">Your prediction:</span>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
              }}>
                {homeScore} – {awayScore}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isFinished && match.my_prediction?.points_awarded != null && (
                <span className={`points-display ${match.my_prediction.points_awarded === 0 ? 'zero' : ''}`}>
                  +{match.my_prediction.points_awarded} pts
                </span>
              )}
              <span className="badge badge-locked">🔒 Locked</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-secondary text-sm">No prediction made</span>
            <span className="badge badge-locked">🔒 Locked</span>
          </div>
        )}
      </div>
    );
  }

  // Open for predictions
  return (
    <div className="match-card-footer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
        {/* Home score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span className="text-xs text-secondary">{match.home_team?.code || 'HOM'}</span>
          <div className="number-stepper">
            <button className="number-stepper-btn" onClick={decrement(setHomeScore)} type="button">−</button>
            <input
              type="number"
              min="0"
              max="20"
              value={homeScore}
              onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <button className="number-stepper-btn" onClick={increment(setHomeScore)} type="button">+</button>
          </div>
        </div>

        <span style={{ color: 'var(--text-tertiary)', fontWeight: 600, marginTop: 16 }}>–</span>

        {/* Away score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span className="text-xs text-secondary">{match.away_team?.code || 'AWY'}</span>
          <div className="number-stepper">
            <button className="number-stepper-btn" onClick={decrement(setAwayScore)} type="button">−</button>
            <input
              type="number"
              min="0"
              max="20"
              value={awayScore}
              onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
            />
            <button className="number-stepper-btn" onClick={increment(setAwayScore)} type="button">+</button>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-sm w-full" onClick={handleSubmit} disabled={loading}>
        {loading ? <span className="spinner spinner-sm" /> : null}
        {loading ? 'Saving…' : hasPrediction ? 'Update Prediction' : 'Submit Prediction'}
      </button>

      {feedback && (
        <div
          className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ marginTop: 8, padding: '8px 12px', fontSize: '0.8rem' }}
        >
          {feedback.type === 'success' ? '✅' : '⚠️'} {feedback.message}
        </div>
      )}
    </div>
  );
}
