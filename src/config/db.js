const dns = require('dns');
const mongoose = require('mongoose');

/**
 * `mongodb+srv://` URIs need an SRV lookup, which Node resolves with c-ares
 * against whatever servers it picked up at startup — sometimes 127.0.0.1 with
 * nothing listening, even when the OS resolver works fine. Setting
 * DNS_SERVERS in .env points Node at a resolver that answers.
 */
function applyDnsOverride() {
  const servers = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!servers.length) return;

  try {
    dns.setServers(servers);
    console.log(`[db] DNS resolver overridden -> ${servers.join(', ')}`);
  } catch (err) {
    console.warn(`[db] ignoring invalid DNS_SERVERS value: ${err.message}`);
  }
}

/**
 * Cached across invocations. On Vercel a warm lambda reuses the module scope,
 * so holding the promise here keeps one connection instead of opening a new
 * one per request and exhausting the Atlas pool.
 */
let cached = global.__teamlivaMongoose;
if (!cached) {
  cached = { conn: null, promise: null };
  global.__teamlivaMongoose = cached;
}

/**
 * Connects to MongoDB and resolves once the connection is usable.
 * Throws on failure — callers decide whether that's fatal.
 */
async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }

  if (!cached.promise) {
    applyDnsOverride();
    mongoose.set('strictQuery', true);

    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 15000,
        // Serverless invocations are short; a small pool avoids piling up
        // idle sockets against the Atlas connection limit.
        maxPoolSize: process.env.VERCEL ? 5 : 10,
      })
      .then((m) => {
        console.log(`[db] connected -> ${m.connection.host}/${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        // Clear the cache so the next request can retry rather than reusing
        // a permanently rejected promise.
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/** Wraps connectDB for the long-running server, where failure should be fatal. */
async function connectDBOrExit() {
  try {
    await connectDB();
  } catch (err) {
    console.error('[db] connection failed:', err.message);
    if (/querySrv|ENOTFOUND|EREFUSED|ECONNREFUSED/i.test(err.message)) {
      console.error(
        '[db] hint: this looks like a DNS failure, not a bad password.\n' +
          '      Set DNS_SERVERS=1.1.1.1,8.8.8.8 in .env and retry.'
      );
    }
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
  mongoose.connection.on('error', (err) => console.error('[db] error:', err.message));
}

module.exports = connectDBOrExit;
module.exports.connectDB = connectDB;
module.exports.connectDBOrExit = connectDBOrExit;
