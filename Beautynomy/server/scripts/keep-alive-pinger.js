/**
 * Keep Render Service Alive
 *
 * Pings the API every 14 minutes to prevent it from sleeping.
 * Run this on your local machine or use a service like cron-job.org
 *
 * USAGE: node scripts/keep-alive-pinger.js
 */

import https from 'https';

const API_URL = 'https://beautynomy-api.onrender.com/api/health';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

function pingAPI() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Pinging API...`);

  https.get(API_URL, (res) => {
    let data = '';

    res.on('data', chunk => data += chunk);

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`[${timestamp}] ✅ API is awake (${res.statusCode})`);
      } else {
        console.log(`[${timestamp}] ⚠️  API responded with ${res.statusCode}`);
      }
    });
  }).on('error', (err) => {
    console.error(`[${timestamp}] ❌ Error:`, err.message);
  });
}

// Ping immediately
console.log('🚀 Starting keep-alive pinger...');
console.log(`📡 Pinging ${API_URL} every 14 minutes\n`);
pingAPI();

// Then ping every 14 minutes
setInterval(pingAPI, PING_INTERVAL);

console.log('✅ Pinger is running. Press Ctrl+C to stop.\n');
