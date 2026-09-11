const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

/* --------------------------------- security -------------------------------- */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

/* ----------------------------------- cors ---------------------------------- */
// Comma-separated list, e.g. "http://localhost:3000,https://teamliva.com"
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow tools with no Origin header (curl, Postman, server-side fetch).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* --------------------------------- parsers --------------------------------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* -------------------------------- rate limit ------------------------------- */
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

/* --------------------------------- health ---------------------------------- */
app.get('/api/health', (req, res) => {
  res.json({ success: true, service: 'teamliva-api', uptime: process.uptime() });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
