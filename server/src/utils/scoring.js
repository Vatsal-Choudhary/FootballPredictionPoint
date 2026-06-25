/**
 * Calculates prediction points based on how close the prediction was to the actual result.
 *
 * Scoring tiers:
 *   5 pts — Exact score match (e.g. predicted 2-1, actual 2-1)
 *   3 pts — Correct goal difference but not exact score (e.g. predicted 3-2, actual 2-1)
 *   1 pt  — Correct outcome (win/draw/loss) but wrong goal difference
 *   0 pts — Wrong outcome
 *
 * @param {number} predictedHome - Predicted goals for the home team
 * @param {number} predictedAway - Predicted goals for the away team
 * @param {number} actualHome - Actual goals for the home team
 * @param {number} actualAway - Actual goals for the away team
 * @returns {number} Points awarded (0, 1, 3, or 5)
 */
export function calculatePoints(predictedHome, predictedAway, actualHome, actualAway) {
  // Exact score match → 5 points
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 5;
  }

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;

  // Correct goal difference (but not exact score) → 3 points
  if (predictedDiff === actualDiff) {
    return 3;
  }

  // Determine outcome: positive = home win, zero = draw, negative = away win
  const predictedOutcome = Math.sign(predictedDiff);
  const actualOutcome = Math.sign(actualDiff);

  // Correct outcome (W/D/L) only → 1 point
  if (predictedOutcome === actualOutcome) {
    return 1;
  }

  // Wrong outcome → 0 points
  return 0;
}
