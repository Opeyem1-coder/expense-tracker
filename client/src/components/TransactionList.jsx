import {
  UtensilsCrossed, Car, Home, Film, Heart, Briefcase,
  TrendingUp, BookOpen, ShoppingBag, Package, Trash2,
} from 'lucide-react';
import EmptyState from './EmptyState';

// Category → lucide-react icon mapping
const CATEGORY_ICONS = {
  Food:          <UtensilsCrossed size={16} strokeWidth={2.5} />,
  Transport:     <Car size={16} strokeWidth={2.5} />,
  Housing:       <Home size={16} strokeWidth={2.5} />,
  Entertainment: <Film size={16} strokeWidth={2.5} />,
  Health:        <Heart size={16} strokeWidth={2.5} />,
  Salary:        <Briefcase size={16} strokeWidth={2.5} />,
  Business:      <TrendingUp size={16} strokeWidth={2.5} />,
  Education:     <BookOpen size={16} strokeWidth={2.5} />,
  Shopping:      <ShoppingBag size={16} strokeWidth={2.5} />,
  Other:         <Package size={16} strokeWidth={2.5} />,
};

const fmt = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

const fmtDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

function TransactionList({ transactions, onDelete, loading, title = 'Recent Transactions', limit }) {
  const displayed = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">{title}</span>
        <span className="section-badge" aria-label={`${transactions.length} transactions`}>
          {transactions.length}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 12 }}>Loading transactions…</p>
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={32} strokeWidth={1.5} color="currentColor" />}
          title="No transactions yet"
          text="Add your first income or expense to get started."
        />
      ) : (
        <div className="transaction-list">
          {displayed.map((t, idx) => (
            <div
              key={t.id}
              className="transaction-item"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Category icon + info */}
              <div className={`transaction-icon ${t.type}`} aria-hidden="true">
                {CATEGORY_ICONS[t.category] || CATEGORY_ICONS.Other}
              </div>

              <div className="transaction-info">
                <div className="transaction-category">{t.category}</div>
                {t.note && <div className="transaction-note">{t.note}</div>}
              </div>

              {/* Amount + date (right side) */}
              <div className="transaction-right">
                <div
                  className={`transaction-amount ${t.type}`}
                  aria-label={`${t.type === 'income' ? 'Income' : 'Expense'}: ${fmt(t.amount)}`}
                >
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                </div>
                <div className="transaction-date">{fmtDate(t.date)}</div>
              </div>

              {/* Delete button */}
              {onDelete && (
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => onDelete(t.id)}
                  aria-label={`Delete ${t.category} transaction for ${fmt(t.amount)}`}
                  title="Delete transaction"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
