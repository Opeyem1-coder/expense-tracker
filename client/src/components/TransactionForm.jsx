import { useState } from 'react';
import { TrendingUp, TrendingDown, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Entertainment',
  'Health', 'Salary', 'Business', 'Education', 'Shopping', 'Other',
];

const today = new Date().toISOString().split('T')[0];

function TransactionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    type:     'expense',
    amount:   '',
    category: '',
    note:     '',
    date:     today,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.category) {
      setError('Amount and category are required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = CATEGORIES.filter((cat) => !['Salary', 'Business'].includes(cat));
  const incomeCategories = ['Salary', 'Business', 'Other'];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">Add Transaction</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close (Escape)"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Type toggle — Income vs Expense */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn income ${form.type === 'income' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'income', category: '' })}
                aria-pressed={form.type === 'income'}
              >
                <TrendingUp size={16} aria-hidden="true" />
                Income
              </button>
              <button
                type="button"
                className={`type-btn expense ${form.type === 'expense' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'expense', category: '' })}
                aria-pressed={form.type === 'expense'}
              >
                <TrendingDown size={16} aria-hidden="true" />
                Expense
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="amount">Amount (₦)</label>
            <input
              id="amount"
              type="number"
              name="amount"
              className="form-input"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={handleChange}
              min="1"
              step="any"
              required
              autoFocus
              aria-required="true"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="">Select a category</option>
              {(form.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="note">Note (optional)</label>
            <input
              id="note"
              type="text"
              name="note"
              className="form-input"
              placeholder="e.g. Grocery run at Shoprite"
              value={form.note}
              onChange={handleChange}
              maxLength={100}
              aria-describedby="note-hint"
            />
            <span id="note-hint" style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>
              {form.note.length}/100
            </span>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              className="form-input"
              value={form.date}
              onChange={handleChange}
              max={today}
              required
              aria-required="true"
            />
          </div>

          {/* Error alert */}
          {error && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              <AlertCircle size={15} aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            aria-disabled={loading}
          >
            {loading ? (
              <><span className="spinner" aria-hidden="true" /> Adding…</>
            ) : (
              'Add Transaction'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
