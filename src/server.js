require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('[boot] JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

(async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[boot] Teamliva API listening on http://localhost:${PORT}`);
    console.log(`[boot] env=${process.env.NODE_ENV || 'development'}`);
  });

  // Don't leave the process in a half-dead state on an unhandled rejection.
  process.on('unhandledRejection', (err) => {
    console.error('[fatal] unhandled rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('[boot] SIGTERM received, shutting down');
    server.close(() => process.exit(0));
  });
})();
