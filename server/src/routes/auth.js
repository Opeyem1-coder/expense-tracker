import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();

router.post('/register', async (req, res) => {
  let { name, email, password } = req.body;

  name = name?.trim();
  email = normalizeEmail(email);

  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Name, email and password are required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters.',
    });
  }

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = createToken(user.id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (err) {
    console.error('Register error:', err);

    if (err.code === '23505') {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    res.status(500).json({
      error: 'Unable to register user right now.',
    });
  }
});

router.post('/login', async (req, res) => {
  let { email, password } = req.body;

  email = normalizeEmail(email);

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required.',
    });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const token = createToken(user.id);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Unable to login right now.',
    });
  }
});

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
