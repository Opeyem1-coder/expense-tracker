import { useState, useEffect, useCallback } from 'react';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import Navbar           from '../components/Navbar';
import BalanceSummary   from '../components/BalanceSummary';
import SpendingChart    from '../components/SpendingChart';
import TransactionList  from '../components/TransactionList';
import TransactionForm  from '../components/TransactionForm';
import api from '../api/axios';

const CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Entertainment',
  'Health', 'Salary', 'Business', 'Education', 'Shopping', 'Other',
];

// Greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [summary, setSummary]      = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]      = useState(true);
  const [showForm, setShowForm]    = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter]        = useState({ type: '', category: '' });
  const [error, setError]          = useState('');

  const fetchSummary = async () => {
    try {
      const res = await api.get('/transactions/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Summary fetch error:', err);
      setError('Failed to load summary.');
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.category) params.category = filter.category;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions);
    } catch (err) {
      setError('Failed to load transactions.');
    }
  }, [filter]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTransactions()]);
      setLoading(false);
    };
    load();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      await Promise.all([fetchSummary(), fetchTransactions()]);
    } catch (err) {
      setError('Failed to delete transaction.');
    }
  };

  const handleSuccess = async () => {
    await Promise.all([fetchSummary(), fetchTransactions()]);
  };

  const hasActiveFilters = filter.type || filter.category;

  return (
    <>
      <Navbar />

      <main className="dashboard" id="main-content">
        <div className="container">
          {/* Page header — Greeting */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-greeting">
                {getGreeting()}, {user.name?.split(' ')[0] || 'Friend'}! 👋
              </h1>
              <p className="dashboard-subtitle">Here's your financial snapshot</p>
            </div>
          </div>

          {/* Balance summary cards */}
          <BalanceSummary summary={summary} loading={loading} />

          <div className="dashboard-action-row" style={{ marginTop: 24, marginBottom: 24 }}>
            <button
              className="btn btn-primary btn-lg btn-icon"
              onClick={() => setShowForm(true)}
              aria-label="Add new transaction"
            >
              <Plus size={18} aria-hidden="true" />
              Add
            </button>
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              <div style={{ flex: 1 }}>{error}</div>
              <button
                className="btn btn-icon btn-sm"
                onClick={() => setError('')}
                aria-label="Dismiss error"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Bento grid — chart + recent transactions */}
          <div className="dashboard-grid">
            {/* Chart (left column) */}
            <div>
              <SpendingChart data={summary?.by_category} />
            </div>

            {/* Recent transactions (right column) */}
            <div>
              <TransactionList
                transactions={transactions.slice(0, 6)}
                onDelete={handleDelete}
                loading={loading}
                title="Recent Transactions"
              />
            </div>
          </div>

          {/* All transactions with filters */}
          <div style={{ marginTop: 32 }}>
            <div className="section-header" style={{ marginBottom: 20 }}>
              <span className="section-title">All Transactions</span>
              <button
                className={`btn btn-icon btn-sm ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                aria-label="Toggle filters"
                aria-expanded={showFilters}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Filter controls — collapsible on mobile */}
            {showFilters && (
              <div className="dashboard-filters" role="region" aria-label="Transaction filters">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="form-label" htmlFor="type-filter">Type</label>
                    <select
                      id="type-filter"
                      className="form-select"
                      value={filter.type}
                      onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                      aria-label="Filter by transaction type"
                    >
                      <option value="">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="category-filter">Category</label>
                    <select
                      id="category-filter"
                      className="form-select"
                      value={filter.category}
                      onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setFilter({ type: '', category: '' })}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Full transaction list */}
            <TransactionList
              transactions={transactions}
              onDelete={handleDelete}
              loading={loading}
              title="All Transactions"
            />
          </div>
        </div>
      </main>

      {/* Add transaction modal */}
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
