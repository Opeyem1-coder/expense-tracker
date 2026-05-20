import { useState } from 'react';
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
  const [hiddenCards, setHiddenCards] = useState(() => {
    const stored = localStorage.getItem('hiddenBalanceCards');
    return stored ? JSON.parse(stored) : { balance: false, income: false, expenses: false };
  });

  const toggleCard = (cardKey) => {
    setHiddenCards((prev) => {
      const next = { ...prev, [cardKey]: !prev[cardKey] };
      localStorage.setItem('hiddenBalanceCards', JSON.stringify(next));
      return next;
    });
  };

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
        <div
          className="summary-amount"
          style={{ cursor: 'pointer' }}
          onClick={() => toggleCard('balance')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleCard('balance');
            }
          }}
          aria-label={hiddenCards.balance ? 'Balance hidden. Click to show.' : `Balance: ${fmt(balance)}. Click to hide.`}
        >
          {hiddenCards.balance ? '••••••' : fmt(balance)}
        </div>
        <div className="summary-sub">Your current net balance</div>
      </div>

      {/* Income */}
      <div className="summary-card summary-card-income">
        <div className="summary-icon" aria-hidden="true">
          <TrendingUp size={20} strokeWidth={2.5} />
        </div>
        <div className="summary-label">Income</div>
        <div
          className="summary-amount"
          style={{ cursor: 'pointer' }}
          onClick={() => toggleCard('income')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleCard('income');
            }
          }}
          aria-label={hiddenCards.income ? 'Income hidden. Click to show.' : `Total income: ${fmt(income)}. Click to hide.`}
        >
          {hiddenCards.income ? '••••••' : fmt(income)}
        </div>
        <div className="summary-sub">Total earned</div>
      </div>

      {/* Expenses */}
      <div className="summary-card summary-card-expense">
        <div className="summary-icon" aria-hidden="true">
          <TrendingDown size={20} strokeWidth={2.5} />
        </div>
        <div className="summary-label">Expenses</div>
        <div
          className="summary-amount"
          style={{ cursor: 'pointer' }}
          onClick={() => toggleCard('expenses')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleCard('expenses');
            }
          }}
          aria-label={hiddenCards.expenses ? 'Expenses hidden. Click to show.' : `Total expenses: ${fmt(expenses)}. Click to hide.`}
        >
          {hiddenCards.expenses ? '••••••' : fmt(expenses)}
        </div>
        <div className="summary-sub">Total spent</div>
      </div>
    </div>
  );
}

export default BalanceSummary;
