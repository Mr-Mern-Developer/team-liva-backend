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
 * Connects to MongoDB. The URI is read from MONGODB_URI in the environment.
 * We fail fast on a missing/bad URI so the process never boots half-wired.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[db] MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  applyDnsOverride();
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[db] connected -> ${conn.connection.host}/${conn.connection.name}`);
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

module.exports = connectDB;
