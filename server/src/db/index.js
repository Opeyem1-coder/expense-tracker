// =====================================================
// server/db/index.js  —  Database connection
// =====================================================
// We use a "pool" instead of a single connection.
// A pool keeps several connections open and reuses them,
// which is faster and more efficient for a web server.
// =====================================================

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // In production (Railway), SSL is required
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL');
    release(); // release the client back to the pool
  }
});

// Export a simple query function so routes can use it:
// db.query('SELECT * FROM users WHERE id = $1', [userId])
const query = (text, params) => pool.query(text, params);

const verifyDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database verified');
  } catch (err) {
    console.error('❌ Unable to connect to database:', err.message || err);
    // Exit so the process manager (or developer) notices the problem
    process.exit(1);
  }
};

export { verifyDatabaseConnection };

export default {
  query,
};
