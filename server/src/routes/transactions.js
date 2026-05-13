// =====================================================
// server/routes/transactions.js  —  Transaction routes
// =====================================================
// All routes here are protected — user must be logged in.
//
// GET    /api/transactions           → list all transactions
// POST   /api/transactions           → add a transaction
// DELETE /api/transactions/:id       → delete a transaction
// GET    /api/transactions/summary   → dashboard summary data
// =====================================================

import express from 'express';
import db from '../db/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes in this file require authentication
router.use(auth);

// Valid categories — keeps data consistent
const VALID_CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Entertainment',
  'Health', 'Salary', 'Business', 'Education', 'Shopping', 'Other',
];

// ── GET ALL TRANSACTIONS ───────────────────────────
// GET /api/transactions
// Optional query params: ?type=expense&category=Food
router.get('/', async (req, res) => {
  const { type, category } = req.query;
  const userId = req.user.id;

  // Build query dynamically based on filters
  let query  = 'SELECT * FROM transactions WHERE user_id = $1';
  let params = [userId];

  if (type) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }
  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  query += ' ORDER BY date DESC, created_at DESC';

  try {
    const result = await db.query(query, params);
    res.json({ transactions: result.rows });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET SUMMARY ────────────────────────────────────
// GET /api/transactions/summary
// Returns: balance, total income, total expenses, by-category breakdown
// IMPORTANT: This route must come BEFORE /:id or Express reads "summary" as an id
router.get('/summary', async (req, res) => {
  const userId = req.user.id;

  try {
    // Total income and expenses in one query
    const totalsResult = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );

    // Spending breakdown by category (expenses only)
    const categoryResult = await db.query(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    // Recent 5 transactions for the dashboard preview
    const recentResult = await db.query(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC
       LIMIT 5`,
      [userId]
    );

    const { total_income, total_expenses } = totalsResult.rows[0];
    const balance = total_income - total_expenses;

    res.json({
      balance:        parseFloat(balance),
      total_income:   parseFloat(total_income),
      total_expenses: parseFloat(total_expenses),
      by_category:    categoryResult.rows,
      recent:         recentResult.rows,
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── ADD TRANSACTION ────────────────────────────────
// POST /api/transactions
// Body: { type, amount, category, note, date }
router.post('/', async (req, res) => {
  const { type, amount, category, note, date } = req.body;
  const userId = req.user.id;

  // Validation
  if (!type || !amount || !category) {
    return res.status(400).json({ error: 'Type, amount and category are required.' });
  }
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be income or expense.' });
  }
  if (isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO transactions (user_id, type, amount, category, note, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, parseFloat(amount), category, note || null, date || new Date()]
    );

    res.status(201).json({
      message: 'Transaction added.',
      transaction: result.rows[0],
    });
  } catch (err) {
    console.error('Add transaction error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── DELETE TRANSACTION ─────────────────────────────
// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Make sure the transaction belongs to the user
    const transaction = await db.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (transaction.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // Delete it
    await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
