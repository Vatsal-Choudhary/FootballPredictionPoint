import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/pool.js';
import auth from '../middleware/auth.js';
import { sendVerificationEmail } from '../services/mailer.js';

const router = Router();

/**
 * Generate a signed JWT for a user.
 */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ──────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check for existing user
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with that email or username already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (username, email, password, verification_token)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_url, is_admin, email_verified, created_at`,
      [username, email.toLowerCase(), hashedPassword, verificationToken]
    );

    const user = result.rows[0];

    // Send verification email (non-blocking — failures are logged but don't block registration)
    sendVerificationEmail(user.email, user.username, verificationToken);

    // Sign and return JWT
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_admin: user.is_admin,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const result = await pool.query(
      `SELECT id, username, email, password, avatar_url, is_admin, email_verified, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign token — allow login even if not verified
    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        is_admin: user.is_admin,
        email_verified: user.email_verified,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/auth/me  (authenticated)
// ──────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, avatar_url, is_admin, email_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[Auth] /me error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// ──────────────────────────────────────────
// GET /api/auth/verify-email?token=TOKEN
// ──────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    // Find user with this verification token
    const result = await pool.query(
      'SELECT id FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    // Mark as verified and clear the token
    await pool.query(
      `UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1`,
      [result.rows[0].id]
    );

    // Redirect to the client login page with a success flag
    const redirectUrl = `${process.env.CLIENT_URL}/login?verified=true`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('[Auth] Verify-email error:', err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
