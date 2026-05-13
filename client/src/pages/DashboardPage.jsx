// =====================================================
// src/pages/DashboardPage.jsx
// =====================================================
// The main screen. Shows:
//   - Balance summary cards
//   - Spending pie chart
//   - Recent transactions list
//   - Add transaction button → opens modal

import { useState, useEffect, useCallback } from 'react';
import Navbar           from '../components/Navbar';
import BalanceSummary   from '../components/BalanceSummary';
import SpendingChart    from '../components/SpendingChart';
import TransactionList  from '../components/TransactionList';
import TransactionForm  from '../components/TransactionForm';
import api from '../api/axios';

function DashboardPage() {
  const [summary,      setSummary]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [filter,       setFilter]       = useState({ type: '', category: '' });
  const [error,        setError]        = useState('');

  // ── Fetch summary (balance, totals, chart data) ──
  const fetchSummary = async () => {
    try {
      const res = await api.get('/transactions/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Summary fetch error:', err);
    }
  };

  // ── Fetch transactions (with optional filters) ───
  const fetchTransactions = useCallback(async () => {
    try {
      const params = {};
      if (filter.type)     params.type     = filter.type;
      if (filter.category) params.category = filter.category;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
    } catch (err) {
      setError('Failed to load transactions.');
    }
  }, [filter]);

  // ── Load everything on mount and when filter changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTransactions()]);
      setLoading(false);
    };
    load();
  }, [fetchTransactions]);

  // ── Delete a transaction ─────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      // Refresh both the list and the summary cards
      await Promise.all([fetchSummary(), fetchTransactions()]);
    } catch (err) {
      setError('Failed to delete transaction.');
    }
  };

  // ── Called when TransactionForm succeeds ─────────
  const handleSuccess = async () => {
    await Promise.all([fetchSummary(), fetchTransactions()]);
  };

  const CATEGORIES = [
    'Food','Transport','Housing','Entertainment',
    'Health','Salary','Business','Education','Shopping','Other',
  ];

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <div className="container">

          {/* Page header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">My Dashboard</h1>
            <p className="dashboard-subtitle">Track and manage your money</p>
          </div>

          {/* Balance cards */}
          <BalanceSummary summary={summary} loading={loading} />

          {/* Error message */}
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {/* Controls */}
          <div className="dashboard-controls">
            <div className="control-group">
              <select
                className="form-select"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <select
                className="form-select"
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Add Transaction
            </button>
          </div>

          {/* Main content */}
          <div className="dashboard-grid">
            <SpendingChart data={summary?.by_category} />
            <TransactionList
              transactions={transactions}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Modal form */}
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

export default DashboardPage;
