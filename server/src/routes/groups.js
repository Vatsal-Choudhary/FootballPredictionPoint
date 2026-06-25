import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import { sendGroupInvite } from '../services/mailer.js';

const router = Router();

// All group routes require authentication
router.use(auth);

/**
 * Generate a random 8-character alphanumeric invite code.
 */
function generateInviteCode() {
  // crypto.randomBytes gives cryptographic randomness; encode as base64 then strip non-alnum
  return crypto.randomBytes(6).toString('base64url').slice(0, 8);
}

// ──────────────────────────────────────────
// POST /api/groups — Create a new group
// ──────────────────────────────────────────
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, max_members } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required.' });
    }

    const inviteCode = generateInviteCode();
    const maxMem = max_members && max_members > 0 ? max_members : 50;

    await client.query('BEGIN');

    // Create the group
    const groupResult = await client.query(
      `INSERT INTO groups (name, invite_code, created_by, max_members)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, invite_code, created_by, max_members, created_at`,
      [name.trim(), inviteCode, req.user.id, maxMem]
    );

    const group = groupResult.rows[0];

    // Automatically add the creator as a member
    await client.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [group.id, req.user.id]
    );

    await client.query('COMMIT');

    return res.status(201).json({ group });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Groups] Create error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
});

// ──────────────────────────────────────────
// POST /api/groups/join — Join via invite code
// ──────────────────────────────────────────
router.post('/join', async (req, res) => {
  try {
    const { invite_code } = req.body;

    if (!invite_code) {
      return res.status(400).json({ error: 'Invite code is required.' });
    }

    // Find the group
    const groupResult = await pool.query(
      'SELECT id, name, invite_code, max_members, created_at FROM groups WHERE invite_code = $1',
      [invite_code]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite code. Group not found.' });
    }

    const group = groupResult.rows[0];

    // Check if user is already a member
    const memberCheck = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [group.id, req.user.id]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(409).json({ error: 'You are already a member of this group.' });
    }

    // Check max_members limit
    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS member_count FROM group_members WHERE group_id = $1',
      [group.id]
    );

    if (countResult.rows[0].member_count >= group.max_members) {
      return res.status(400).json({ error: 'This group has reached its maximum member limit.' });
    }

    // Add user to the group
    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [group.id, req.user.id]
    );

    return res.json({ group });
  } catch (err) {
    console.error('[Groups] Join error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/groups/my — List user's groups
// ──────────────────────────────────────────
router.get('/my', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.id, g.name, g.invite_code, g.max_members, g.created_at,
              (SELECT COUNT(*)::int FROM group_members gm2 WHERE gm2.group_id = g.id) AS member_count
       FROM groups g
       INNER JOIN group_members gm ON gm.group_id = g.id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [req.user.id]
    );

    return res.json({ groups: result.rows });
  } catch (err) {
    console.error('[Groups] My groups error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/groups/:id — Group details with members
// ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check membership
    const memberCheck = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    // Fetch group details
    const groupResult = await pool.query(
      'SELECT id, name, invite_code, created_by, max_members, created_at FROM groups WHERE id = $1',
      [id]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Fetch members
    const membersResult = await pool.query(
      `SELECT u.id, u.username, u.avatar_url, gm.joined_at
       FROM group_members gm
       INNER JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at ASC`,
      [id]
    );

    return res.json({
      group: groupResult.rows[0],
      members: membersResult.rows,
    });
  } catch (err) {
    console.error('[Groups] Detail error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/groups/:id/leaderboard — Ranked members
// ──────────────────────────────────────────
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;

    // Check membership
    const memberCheck = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    // Leaderboard: sum points for each member in this group
    const result = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.avatar_url,
         COALESCE(SUM(p.points_awarded), 0)::int AS total_points,
         COUNT(p.id)::int AS prediction_count
       FROM group_members gm
       INNER JOIN users u ON u.id = gm.user_id
       LEFT JOIN predictions p ON p.user_id = u.id
       WHERE gm.group_id = $1
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY total_points DESC, u.username ASC`,
      [id]
    );

    return res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error('[Groups] Leaderboard error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// POST /api/groups/:id/invite — Send invite email
// ──────────────────────────────────────────
router.post('/:id/invite', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Check membership
    const memberCheck = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this group.' });
    }

    // Fetch group details
    const groupResult = await pool.query(
      'SELECT name, invite_code FROM groups WHERE id = $1',
      [id]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const group = groupResult.rows[0];

    // Send the invite email
    await sendGroupInvite(email, group.name, group.invite_code, req.user.username);

    return res.json({ message: `Invitation sent to ${email}.` });
  } catch (err) {
    console.error('[Groups] Invite error:', err.message);
    return res.status(500).json({ error: 'Failed to send invitation.' });
  }
});

export default router;
