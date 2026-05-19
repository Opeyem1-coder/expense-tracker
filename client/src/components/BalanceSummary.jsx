import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount || 0);

function SkeletonCard({ className }) {
  return (
    <div className={`summary-card ${className}`} aria-hidden="true">
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: 140, height: 30 }} />
    </div>
  );
}

function BalanceSummary({ summary, loading }) {
  if (loading) {
    return (
      <div className="summary-grid" aria-label="Loading balance data">
        <SkeletonCard className="summary-card-balance" />
        <SkeletonCard className="summary-card-income" />
        <SkeletonCard className="summary-card-expense" />
      </div>
    );
  }

  const balance  = summary?.balance        ?? 0;
  const income   = summary?.total_income   ?? 0;
  const expenses = summary?.total_expenses ?? 0;

  return (
    <div className="summary-grid" role="region" aria-label="Financial summary">
      {/* Balance — hero */}
      <div className="summary-card summary-card-balance">
        <div className="summary-icon" aria-hidden="true">
          <Wallet size={20} strokeWidth={2.5} />
        </div>
        <div className="summary-label">Total Balance</div>
        <div className="summary-amount" aria-label={`Balance: ${fmt(balance)}`}>
          {fmt(balance)}
        </div>
        <div className="summary-sub">Your current net balance</div>
      </div>

      {/* Income */}
      <div className="summary-card summary-card-income">
        <div className="summary-icon" aria-hidden="true">
          <TrendingUp size={20} strokeWidth={2.5} />
        </div>
        <div className="summary-label">Income</div>
        <div className="summary-amount" aria-label={`Total income: ${fmt(income)}`}>
          {fmt(income)}
        </div>
        <div className="summary-sub">Total earned</div>
      </div>

      {/* Expenses */}
      <div className="summary-card summary-card-expense">
        <div className="summary-icon" aria-hidden="true">
          <TrendingDown size={20} strokeWidth={2.5} />
        </div>
        <div className="summary-label">Expenses</div>
        <div className="summary-amount" aria-label={`Total expenses: ${fmt(expenses)}`}>
          {fmt(expenses)}
        </div>
        <div className="summary-sub">Total spent</div>
      </div>
    </div>
  );
}

export default BalanceSummary;
