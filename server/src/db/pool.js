import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Determine if we're connecting to a remote (production) database
const isProduction = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enable SSL for production databases (e.g. Render, Heroku) but not for local dev
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Log successful connection on first query
pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL');
});

// Log pool errors so they don't crash the process silently
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

export default pool;
