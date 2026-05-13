-- =====================================================
-- EXPENSE TRACKER — Database Schema
-- =====================================================
-- Run this file once to set up your database.
-- In your terminal:
--   psql -U postgres -d expense_tracker -f schema.sql
-- =====================================================

-- Create the database (run this separately if needed)
-- CREATE DATABASE expense_tracker;

-- ── Users ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)        NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,  -- bcrypt hash, never plain text
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Transactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(10)    NOT NULL CHECK (type IN ('income', 'expense')),
  amount     DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category   VARCHAR(50)    NOT NULL,
  note       TEXT,
  date       DATE           NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Index for faster queries ───────────────────────
-- When we fetch all transactions for a user, this speeds it up
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date DESC);
