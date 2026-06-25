import cron from 'node-cron';
import axios from 'axios';
import pool from '../db/pool.js';
import { calculatePoints } from '../utils/scoring.js';

const API_URL = process.env.WORLDCUP_API_URL || 'https://worldcup26.ir';

/**
 * Fetch live results from the WorldCup26 API and update local match data.
 * Called every 5 minutes by the cron scheduler.
 */
async function fetchAndProcessResults() {
  const timestamp = new Date().toISOString();
  console.log(`[Cron] ${timestamp} — Fetching results from ${API_URL}/get/games`);

  let games;
  try {
    const response = await axios.get(`${API_URL}/get/games`, { timeout: 15000 });
    games = response.data;

    // Handle both array responses and responses wrapped in an object
    if (!Array.isArray(games)) {
      // The API might return { games: [...] } or similar
      games = games.games || games.data || [];
    }
  } catch (err) {
    console.error(`[Cron] ${timestamp} — Failed to fetch games:`, err.message);
    return;
  }

  if (!games || games.length === 0) {
    console.log(`[Cron] ${timestamp} — No games returned from API`);
    return;
  }

  console.log(`[Cron] ${timestamp} — Processing ${games.length} games`);

  const client = await pool.connect();
  try {
    for (const game of games) {
      const externalId = parseInt(game.id, 10);
      if (isNaN(externalId)) continue;

      // Find the matching local match by external_id
      const matchResult = await client.query(
        'SELECT id, status FROM matches WHERE external_id = $1',
        [externalId]
      );

      if (matchResult.rows.length === 0) continue;

      const localMatch = matchResult.rows[0];
      const timeElapsed = (game.time_elapsed || '').toString().trim();
      const isFinished = game.finished === 'TRUE';

      // ── Handle FINISHED games ──
      if (isFinished && localMatch.status !== 'FINISHED') {
        const homeScore = parseInt(game.home_score, 10);
        const awayScore = parseInt(game.away_score, 10);

        if (isNaN(homeScore) || isNaN(awayScore)) {
          console.warn(`[Cron] Game ${externalId}: finished but scores invalid (home="${game.home_score}", away="${game.away_score}")`);
          continue;
        }

        // Update match result
        await client.query(
          `UPDATE matches SET home_score = $1, away_score = $2, status = 'FINISHED' WHERE id = $3`,
          [homeScore, awayScore, localMatch.id]
        );
        console.log(`[Cron] Match ${localMatch.id} (ext: ${externalId}) → FINISHED ${homeScore}-${awayScore}`);

        // Score all unscored predictions for this match
        const predictions = await client.query(
          'SELECT id, predicted_home, predicted_away FROM predictions WHERE match_id = $1 AND points_awarded IS NULL',
          [localMatch.id]
        );

        for (const pred of predictions.rows) {
          const points = calculatePoints(pred.predicted_home, pred.predicted_away, homeScore, awayScore);
          await client.query(
            'UPDATE predictions SET points_awarded = $1 WHERE id = $2',
            [points, pred.id]
          );
        }

        if (predictions.rows.length > 0) {
          console.log(`[Cron] Scored ${predictions.rows.length} predictions for match ${localMatch.id}`);
        }
        continue;
      }

      // ── Handle LIVE games ──
      // time_elapsed is a number (minute) or 'HT' means the game is in progress
      const isLive = !isFinished && (timeElapsed === 'HT' || /^\d+$/.test(timeElapsed));

      if (isLive && localMatch.status !== 'LIVE' && localMatch.status !== 'FINISHED') {
        // Update live scores if available
        const homeScore = parseInt(game.home_score, 10);
        const awayScore = parseInt(game.away_score, 10);

        if (!isNaN(homeScore) && !isNaN(awayScore)) {
          await client.query(
            `UPDATE matches SET home_score = $1, away_score = $2, status = 'LIVE' WHERE id = $3`,
            [homeScore, awayScore, localMatch.id]
          );
        } else {
          await client.query(
            `UPDATE matches SET status = 'LIVE' WHERE id = $1`,
            [localMatch.id]
          );
        }
        console.log(`[Cron] Match ${localMatch.id} (ext: ${externalId}) → LIVE (${timeElapsed}')`);
      }
    }
  } catch (err) {
    console.error(`[Cron] ${timestamp} — Error processing games:`, err.message);
  } finally {
    client.release();
  }

  console.log(`[Cron] ${timestamp} — Processing complete`);
}

/**
 * Start the cron job. Runs every 5 minutes.
 * Set CRON_ENABLED=false in .env to disable (useful for local dev/testing).
 * Returns the cron task so it can be stopped if needed.
 */
export function startCronJob() {
  if (process.env.CRON_ENABLED === 'false') {
    console.log('[Cron] CRON_ENABLED=false — result fetching is disabled (local dev mode)');
    return null;
  }

  console.log('[Cron] Scheduling result fetch every 5 minutes');

  const task = cron.schedule('*/5 * * * *', () => {
    fetchAndProcessResults().catch((err) => {
      console.error('[Cron] Unhandled error in fetchAndProcessResults:', err.message);
    });
  });

  // Run once immediately on startup so we don't wait 5 minutes for the first fetch
  fetchAndProcessResults().catch((err) => {
    console.error('[Cron] Initial fetch error:', err.message);
  });

  return task;
}

// Also export the fetch function for testing purposes
export { fetchAndProcessResults };
