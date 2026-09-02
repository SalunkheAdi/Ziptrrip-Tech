const { Pool } = require('pg');
require('dotenv').config();

// Supports two ways to connect:
// 1. DATABASE_URL — single connection string from Neon (recommended for production)
// 2. Individual DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD env vars (for local dev)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // required for Neon
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'ziptrap_todos',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      }
);

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    console.error('   Make sure PostgreSQL is running and .env is configured correctly.');
  } else {
    console.log('✅ Connected to PostgreSQL database.');
    release();
  }
});

module.exports = pool;
