require('dotenv').config();

const app = require('../src/app');
const { connectDB } = require('../src/config/db');

/**
 * Vercel serverless entry point.
 *
 * There is no app.listen() here — Vercel invokes the exported handler per
 * request. The DB connection is established on the first request and cached
 * in module scope, so warm invocations reuse it.
 */
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[api] database unavailable:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again shortly.',
    });
  }

  return app(req, res);
};
