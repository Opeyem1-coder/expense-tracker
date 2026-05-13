// =====================================================
// src/components/BalanceSummary.jsx
// =====================================================
// Displays 3 cards: Balance, Total Income, Total Expenses

function BalanceSummary({ summary, loading }) {
  // Format number as Nigerian Naira
  const formatAmount = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="summary-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="summary-card" style={{ opacity: 0.5 }}>
            <div className="summary-label">Loading...</div>
            <div className="summary-amount">—</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="summary-grid">
      <div className="summary-card balance">
        <div className="summary-label">💼 Total Balance</div>
        <div className="summary-amount">{formatAmount(summary?.balance)}</div>
      </div>

      <div className="summary-card income">
        <div className="summary-label">📈 Total Income</div>
        <div className="summary-amount">{formatAmount(summary?.total_income)}</div>
      </div>

      <div className="summary-card expense">
        <div className="summary-label">📉 Total Expenses</div>
        <div className="summary-amount">{formatAmount(summary?.total_expenses)}</div>
      </div>
    </div>
  );
}

export default BalanceSummary;
