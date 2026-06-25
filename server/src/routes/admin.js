import { Router } from 'express';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { calculatePoints } from '../utils/scoring.js';

const router = Router();

// All admin routes require authentication AND admin role
router.use(auth, admin);

// ──────────────────────────────────────────
// PUT /api/admin/matches/:id/result — Manually set match result
// ──────────────────────────────────────────
router.put('/matches/:id/result', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { home_score, away_score } = req.body;

    if (home_score == null || away_score == null) {
      return res.status(400).json({ error: 'home_score and away_score are required.' });
    }

    if (!Number.isInteger(home_score) || !Number.isInteger(away_score) || home_score < 0 || away_score < 0) {
      return res.status(400).json({ error: 'Scores must be non-negative integers.' });
    }

    await client.query('BEGIN');

    // Update the match result and status
    const matchResult = await client.query(
      `UPDATE matches
       SET home_score = $1, away_score = $2, status = 'FINISHED'
       WHERE id = $3
       RETURNING id, home_score, away_score, status`,
      [home_score, away_score, id]
    );

    if (matchResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Match not found.' });
    }

    // Recalculate points for all predictions on this match
    const predictions = await client.query(
      'SELECT id, predicted_home, predicted_away FROM predictions WHERE match_id = $1',
      [id]
    );

    let updatedCount = 0;
    for (const pred of predictions.rows) {
      const points = calculatePoints(pred.predicted_home, pred.predicted_away, home_score, away_score);
      await client.query(
        'UPDATE predictions SET points_awarded = $1 WHERE id = $2',
        [points, pred.id]
      );
      updatedCount++;
    }

    await client.query('COMMIT');

    return res.json({
      match: matchResult.rows[0],
      predictions_updated: updatedCount,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Admin] Set result error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
});

// ──────────────────────────────────────────
// POST /api/admin/recalculate — Recalculate all finished matches
// ──────────────────────────────────────────
router.post('/recalculate', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get all finished matches with actual scores
    const finishedMatches = await client.query(
      `SELECT id, home_score, away_score FROM matches
       WHERE status = 'FINISHED' AND home_score IS NOT NULL AND away_score IS NOT NULL`
    );

    let totalUpdated = 0;

    for (const match of finishedMatches.rows) {
      // Get all predictions for this match
      const predictions = await client.query(
        'SELECT id, predicted_home, predicted_away FROM predictions WHERE match_id = $1',
        [match.id]
      );

      for (const pred of predictions.rows) {
        const points = calculatePoints(pred.predicted_home, pred.predicted_away, match.home_score, match.away_score);
        await client.query(
          'UPDATE predictions SET points_awarded = $1 WHERE id = $2',
          [points, pred.id]
        );
        totalUpdated++;
      }
    }

    await client.query('COMMIT');

    return res.json({
      message: 'Recalculation complete.',
      matches_processed: finishedMatches.rows.length,
      predictions_updated: totalUpdated,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Admin] Recalculate error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
});

// ──────────────────────────────────────────
// GET /api/admin/stats — Dashboard statistics
// ──────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Run all stat queries in parallel for speed
    const [usersResult, predictionsResult, matchesResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total_users FROM users'),
      pool.query('SELECT COUNT(*)::int AS total_predictions FROM predictions'),
      pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM matches
         GROUP BY status
         ORDER BY status`
      ),
    ]);

    // Convert matches-by-status rows into a keyed object
    const matchesByStatus = {};
    for (const row of matchesResult.rows) {
      matchesByStatus[row.status] = row.count;
    }

    return res.json({
      total_users: usersResult.rows[0].total_users,
      total_predictions: predictionsResult.rows[0].total_predictions,
      matches_by_status: matchesByStatus,
    });
  } catch (err) {
    console.error('[Admin] Stats error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
