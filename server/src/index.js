import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Route imports
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import matchRoutes from './routes/matches.js';
import predictionRoutes from './routes/predictions.js';
import adminRoutes from './routes/admin.js';

// Cron job
import { startCronJob } from './cron/fetchResults.js';

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// ──────────────────────────────────────────
// Global middleware
// ──────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow requests from the client app
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies (limit to 1MB to prevent abuse)
app.use(express.json({ limit: '1mb' }));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests. Please try again later.' },
});
app.use(limiter);

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────

// Health check (unauthenticated)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);

// ──────────────────────────────────────────
// 404 handler for unknown routes
// ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

// ──────────────────────────────────────────
// Global error handler
// ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.',
  });
});

// ──────────────────────────────────────────
// Start server and cron
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] 🚀 World Cup Predictor API running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);

  // Start the cron job to fetch live results
  startCronJob();
});

export default app;
