// =====================================================
// server/routes/auth.js  —  Authentication routes
// =====================================================
// POST /api/auth/register  → create account
// POST /api/auth/login     → sign in, get token
// GET  /api/auth/me        → get logged-in user profile
// =====================================================

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ── Helper: create a JWT token ─────────────────────
const createToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload — what we store in the token
    process.env.JWT_SECRET,   // secret key to sign with
    { expiresIn: '7d' }       // token expires in 7 days
  );
};

// ── REGISTER ───────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if email is already registered
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password — NEVER store plain text passwords
    // bcrypt adds a random "salt" and hashes 10 rounds — very secure
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user  = result.rows[0];
    const token = createToken(user.id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── LOGIN ──────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      // Use a vague error — don't tell attackers whether the email exists
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the entered password against the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createToken(user.id);

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ── GET CURRENT USER ───────────────────────────────
// GET /api/auth/me
// Requires valid JWT token
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
