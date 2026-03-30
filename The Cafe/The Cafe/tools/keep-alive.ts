/**
 * Keep-Alive Pinger
 * 
 * Render spins down free tier apps after 15m of inactivity. This script
 * pings the /api/health endpoint every 14 minutes to prevent cold starts.
 * 
 * Usage:
 * npx tsx tools/keep-alive.ts
 */

import http from 'http';
import https from 'https';

// Ping the production URL (replace this if needed)
const TARGET_URL = process.env.VITE_API_URL || 'https://perocafe-api.onrender.com';
const INTERVAL_MINUTES = 14;

console.log(`[Keep-Alive] Starting pinger for ${TARGET_URL}`);
console.log(`[Keep-Alive] Interval: ${INTERVAL_MINUTES} minutes`);

function ping() {
  const url = `${TARGET_URL}/api/health`;
  const client = url.startsWith('https') ? https : http;

  console.log(`[Keep-Alive] Pinging ${url} at ${new Date().toISOString()}`);

  client.get(url, (res) => {
    console.log(`[Keep-Alive] Response: ${res.statusCode} ${res.statusMessage}`);
    res.resume(); // consume response data to free up memory
  }).on('error', (err) => {
    console.log(`[Keep-Alive] Error: ${err.message}`);
  });
}

// Initial ping
ping();

// Schedule subsequent pings
setInterval(ping, INTERVAL_MINUTES * 60 * 1000);
