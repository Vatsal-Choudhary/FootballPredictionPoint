import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';

const router = Router();

// All prediction routes require authentication
router.use(auth);

// ──────────────────────────────────────────
// POST /api/predictions — Create or update a prediction
// ──────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { match_id, predicted_home, predicted_away } = req.body;

    // Validate inputs
    if (match_id == null || predicted_home == null || predicted_away == null) {
      return res.status(400).json({ error: 'match_id, predicted_home, and predicted_away are required.' });
    }

    if (predicted_home < 0 || predicted_away < 0) {
      return res.status(400).json({ error: 'Predicted scores must be non-negative integers.' });
    }

    if (!Number.isInteger(predicted_home) || !Number.isInteger(predicted_away)) {
      return res.status(400).json({ error: 'Predicted scores must be integers.' });
    }

    // Fetch the match to check lock_time and existence
    const matchResult = await pool.query(
      'SELECT id, lock_time, status FROM matches WHERE id = $1',
      [match_id]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    const match = matchResult.rows[0];

    // Reject if predictions are locked (current time >= lock_time)
    if (new Date() >= new Date(match.lock_time)) {
      return res.status(400).json({ error: 'Predictions are locked for this match. The deadline has passed.' });
    }

    // Reject if match is already live or finished
    if (match.status === 'LIVE' || match.status === 'FINISHED') {
      return res.status(400).json({ error: `Cannot predict on a match that is ${match.status}.` });
    }

    // Upsert: insert or update on conflict (user_id, match_id)
    const result = await pool.query(
      `INSERT INTO predictions (user_id, match_id, predicted_home, predicted_away)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET predicted_home = $3, predicted_away = $4, updated_at = NOW()
       RETURNING id, user_id, match_id, predicted_home, predicted_away, points_awarded, created_at, updated_at`,
      [req.user.id, match_id, predicted_home, predicted_away]
    );

    return res.status(201).json({ prediction: result.rows[0] });
  } catch (err) {
    console.error('[Predictions] Create/Update error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/predictions/my — Current user's predictions
// ──────────────────────────────────────────
router.get('/my', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.id, p.match_id, p.predicted_home, p.predicted_away, p.points_awarded,
         p.created_at, p.updated_at,
         m.match_date, m.stage, m.status, m.home_score, m.away_score, m.venue,
         ht.name AS home_team_name, ht.code AS home_team_code, ht.flag_url AS home_team_flag,
         at.name AS away_team_name, at.code AS away_team_code, at.flag_url AS away_team_flag
       FROM predictions p
       INNER JOIN matches m ON m.id = p.match_id
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       WHERE p.user_id = $1
       ORDER BY m.match_date ASC`,
      [req.user.id]
    );

    const predictions = result.rows.map((row) => ({
      id: row.id,
      match_id: row.match_id,
      predicted_home: row.predicted_home,
      predicted_away: row.predicted_away,
      points_awarded: row.points_awarded,
      created_at: row.created_at,
      updated_at: row.updated_at,
      match: {
        match_date: row.match_date,
        stage: row.stage,
        status: row.status,
        home_score: row.home_score,
        away_score: row.away_score,
        venue: row.venue,
        home_team: { name: row.home_team_name, code: row.home_team_code, flag_url: row.home_team_flag },
        away_team: { name: row.away_team_name, code: row.away_team_code, flag_url: row.away_team_flag },
      },
    }));

    return res.json({ predictions });
  } catch (err) {
    console.error('[Predictions] My predictions error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/predictions/leaderboard — Global leaderboard
// ──────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.avatar_url,
         COALESCE(SUM(p.points_awarded), 0)::int AS total_points,
         COUNT(p.id)::int AS prediction_count
       FROM users u
       LEFT JOIN predictions p ON p.user_id = u.id
       GROUP BY u.id, u.username, u.avatar_url
       HAVING COUNT(p.id) > 0
       ORDER BY total_points DESC, prediction_count DESC, u.username ASC`
    );

    return res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error('[Predictions] Leaderboard error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
