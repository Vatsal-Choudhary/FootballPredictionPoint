import { calculatePoints } from '../src/utils/scoring.js';

describe('calculatePoints', () => {
  // ── Exact score (5 points) ──
  test('exact score match → 5 points', () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(5);
  });

  test('exact score 0-0 → 5 points', () => {
    expect(calculatePoints(0, 0, 0, 0)).toBe(5);
  });

  test('exact draw score 1-1 → 5 points', () => {
    expect(calculatePoints(1, 1, 1, 1)).toBe(5);
  });

  test('exact high score 5-3 → 5 points', () => {
    expect(calculatePoints(5, 3, 5, 3)).toBe(5);
  });

  // ── Correct goal difference (3 points) ──
  test('correct goal difference, wrong scores → 3 points', () => {
    // Predicted 3-2 (diff +1), actual 2-1 (diff +1)
    expect(calculatePoints(3, 2, 2, 1)).toBe(3);
  });

  test('correct goal diff for away win → 3 points', () => {
    // Predicted 0-2 (diff -2), actual 1-3 (diff -2)
    expect(calculatePoints(0, 2, 1, 3)).toBe(3);
  });

  test('correct draw, different scores → 3 points', () => {
    // Predicted 2-2 (diff 0), actual 1-1 (diff 0) — but not exact
    expect(calculatePoints(2, 2, 1, 1)).toBe(3);
  });

  test('correct draw, higher different scores → 3 points', () => {
    // Predicted 0-0, actual 3-3 → diff is 0 for both, but scores differ → 3 points
    expect(calculatePoints(0, 0, 3, 3)).toBe(3);
  });

  test('correct goal diff: predicted 3-1, actual 4-2 → 3 points', () => {
    expect(calculatePoints(3, 1, 4, 2)).toBe(3);
  });

  // ── Correct outcome only (1 point) ──
  test('correct outcome (home win) but wrong goal diff → 1 point', () => {
    // Predicted 3-0 (diff +3), actual 1-0 (diff +1)
    expect(calculatePoints(3, 0, 1, 0)).toBe(1);
  });

  test('correct outcome (away win) but wrong goal diff → 1 point', () => {
    // Predicted 0-1 (diff -1), actual 0-3 (diff -3)
    expect(calculatePoints(0, 1, 0, 3)).toBe(1);
  });

  test('correct outcome (home win) with very different scores → 1 point', () => {
    // Predicted 5-0 (diff +5), actual 2-1 (diff +1)
    expect(calculatePoints(5, 0, 2, 1)).toBe(1);
  });

  // ── Wrong outcome (0 points) ──
  test('predicted home win, actual draw → 0 points', () => {
    expect(calculatePoints(2, 1, 1, 1)).toBe(0);
  });

  test('predicted home win, actual away win → 0 points', () => {
    expect(calculatePoints(2, 0, 0, 1)).toBe(0);
  });

  test('predicted draw, actual home win → 0 points', () => {
    expect(calculatePoints(1, 1, 2, 0)).toBe(0);
  });

  test('predicted away win, actual home win → 0 points', () => {
    expect(calculatePoints(0, 2, 3, 1)).toBe(0);
  });

  // ── Edge cases ──
  test('high score exact match 7-5 → 5 points', () => {
    expect(calculatePoints(7, 5, 7, 5)).toBe(5);
  });

  test('both zero, both zero → 5 points (exact)', () => {
    expect(calculatePoints(0, 0, 0, 0)).toBe(5);
  });

  test('predicted 1-0, actual 0-1 (mirror) → 0 points', () => {
    expect(calculatePoints(1, 0, 0, 1)).toBe(0);
  });
});

// Fix the test at line ~45 that had a wrong expectation comment:
// 0-0 vs 0-0 is exact → 5 points (already tested above)
// Let's add the real "draw different scores" test clearly:
describe('calculatePoints — draw edge cases', () => {
  test('predicted 0-0, actual 3-3 → 3 points (correct diff, not exact)', () => {
    expect(calculatePoints(0, 0, 3, 3)).toBe(3);
  });

  test('predicted 2-2, actual 0-0 → 3 points', () => {
    expect(calculatePoints(2, 2, 0, 0)).toBe(3);
  });

  test('predicted 4-4, actual 1-1 → 3 points', () => {
    expect(calculatePoints(4, 4, 1, 1)).toBe(3);
  });
});
