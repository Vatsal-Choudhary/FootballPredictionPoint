import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';

const router = Router();

// All match routes require authentication
router.use(auth);

// ──────────────────────────────────────────
// GET /api/matches — List all matches with team details and user's prediction
// ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { stage, status } = req.query;

    // Build dynamic WHERE clause from query params
    const conditions = [];
    const params = [req.user.id]; // $1 is always the current user ID for prediction join

    if (stage) {
      params.push(stage);
      conditions.push(`m.stage = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`m.status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         m.id,
         m.external_id,
         m.match_date,
         m.stage,
         m.venue,
         m.lock_time,
         m.home_score,
         m.away_score,
         m.status,
         m.updated_at,
         -- Home team
         ht.id   AS home_team_id,
         ht.name AS home_team_name,
         ht.code AS home_team_code,
         ht.flag_url AS home_team_flag,
         -- Away team
         at.id   AS away_team_id,
         at.name AS away_team_name,
         at.code AS away_team_code,
         at.flag_url AS away_team_flag,
         -- Current user's prediction (if any)
         p.id AS prediction_id,
         p.predicted_home,
         p.predicted_away,
         p.points_awarded
       FROM matches m
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       LEFT JOIN predictions p ON p.match_id = m.id AND p.user_id = $1
       ${whereClause}
       ORDER BY m.match_date ASC, m.id ASC`,
      params
    );

    // Shape the response to nest team objects
    const matches = result.rows.map((row) => ({
      id: row.id,
      external_id: row.external_id,
      match_date: row.match_date,
      stage: row.stage,
      venue: row.venue,
      lock_time: row.lock_time,
      home_score: row.home_score,
      away_score: row.away_score,
      status: row.status,
      updated_at: row.updated_at,
      home_team: row.home_team_id
        ? { id: row.home_team_id, name: row.home_team_name, code: row.home_team_code, flag_url: row.home_team_flag }
        : null,
      away_team: row.away_team_id
        ? { id: row.away_team_id, name: row.away_team_name, code: row.away_team_code, flag_url: row.away_team_flag }
        : null,
      my_prediction: row.prediction_id
        ? { id: row.prediction_id, predicted_home: row.predicted_home, predicted_away: row.predicted_away, points_awarded: row.points_awarded }
        : null,
    }));

    return res.json({ matches });
  } catch (err) {
    console.error('[Matches] List error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/matches/:id — Single match with predictions from user's groups
// ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the match with team details
    const matchResult = await pool.query(
      `SELECT
         m.id, m.external_id, m.match_date, m.stage, m.venue, m.lock_time,
         m.home_score, m.away_score, m.status, m.updated_at,
         ht.id AS home_team_id, ht.name AS home_team_name, ht.code AS home_team_code, ht.flag_url AS home_team_flag,
         at.id AS away_team_id, at.name AS away_team_name, at.code AS away_team_code, at.flag_url AS away_team_flag
       FROM matches m
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       WHERE m.id = $1`,
      [id]
    );

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    const row = matchResult.rows[0];
    const match = {
      id: row.id,
      external_id: row.external_id,
      match_date: row.match_date,
      stage: row.stage,
      venue: row.venue,
      lock_time: row.lock_time,
      home_score: row.home_score,
      away_score: row.away_score,
      status: row.status,
      updated_at: row.updated_at,
      home_team: row.home_team_id
        ? { id: row.home_team_id, name: row.home_team_name, code: row.home_team_code, flag_url: row.home_team_flag }
        : null,
      away_team: row.away_team_id
        ? { id: row.away_team_id, name: row.away_team_name, code: row.away_team_code, flag_url: row.away_team_flag }
        : null,
    };

    // Fetch predictions from members of the user's groups for this match
    // This shows what your group-mates predicted
    const predictionsResult = await pool.query(
      `SELECT
         p.id, p.predicted_home, p.predicted_away, p.points_awarded,
         u.id AS user_id, u.username, u.avatar_url,
         g.id AS group_id, g.name AS group_name
       FROM predictions p
       INNER JOIN users u ON u.id = p.user_id
       INNER JOIN group_members gm ON gm.user_id = p.user_id
       INNER JOIN groups g ON g.id = gm.group_id
       WHERE p.match_id = $1
         AND gm.group_id IN (
           SELECT group_id FROM group_members WHERE user_id = $2
         )
       ORDER BY g.name ASC, u.username ASC`,
      [id, req.user.id]
    );

    // Group predictions by group
    const groupPredictions = {};
    for (const pred of predictionsResult.rows) {
      if (!groupPredictions[pred.group_id]) {
        groupPredictions[pred.group_id] = {
          group_id: pred.group_id,
          group_name: pred.group_name,
          predictions: [],
        };
      }
      groupPredictions[pred.group_id].predictions.push({
        id: pred.id,
        user_id: pred.user_id,
        username: pred.username,
        avatar_url: pred.avatar_url,
        predicted_home: pred.predicted_home,
        predicted_away: pred.predicted_away,
        points_awarded: pred.points_awarded,
      });
    }

    return res.json({
      match,
      group_predictions: Object.values(groupPredictions),
    });
  } catch (err) {
    console.error('[Matches] Detail error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
