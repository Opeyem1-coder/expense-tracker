// =====================================================
// src/components/TransactionList.jsx
// =====================================================

import EmptyState from './EmptyState';

// Category emoji map
const CATEGORY_ICONS = {
  Food:          '🍔',
  Transport:     '🚗',
  Housing:       '🏠',
  Entertainment: '🎬',
  Health:        '💊',
  Salary:        '💼',
  Business:      '📈',
  Education:     '📚',
  Shopping:      '🛍️',
  Other:         '📦',
};

function TransactionList({ transactions, onDelete, loading, title = 'Recent Transactions', limit }) {
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Apply limit if passed (for dashboard preview)
  const displayed = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">{title}</span>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading...</div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon="💸"
          title="No transactions yet"
          text="Add your first income or expense to get started."
        />
      ) : (
        displayed.map((t) => (
          <div key={t.id} className="transaction-item">
            {/* Category icon */}
            <div className={`transaction-icon ${t.type}`}>
              {CATEGORY_ICONS[t.category] || '📦'}
            </div>

            {/* Category + note */}
            <div className="transaction-info">
              <div className="transaction-category">{t.category}</div>
              {t.note && <div className="transaction-note">{t.note}</div>}
            </div>

            {/* Amount + date */}
            <div className="transaction-right">
              <div className={`transaction-amount ${t.type}`}>
                {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount)}
              </div>
              <div className="transaction-date">{formatDate(t.date)}</div>
            </div>

            {/* Delete button — only shown if handler is provided */}
            {onDelete && (
              <button
                className="btn btn-danger"
                onClick={() => onDelete(t.id)}
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TransactionList;
