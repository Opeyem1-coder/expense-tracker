// =====================================================
// src/components/SpendingChart.jsx
// =====================================================
// Pie chart showing spending breakdown by category.
// Uses Recharts — the simplest charting lib for React.

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import EmptyState from './EmptyState';

// Color palette for the pie slices
const COLORS = [
  '#6366f1', '#22c55e', '#ef4444', '#f59e0b',
  '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
];

// Custom tooltip shown when hovering a slice
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="card" style={{ padding: '10px 14px', fontSize: 13 }}>
        <strong>{name}</strong>
        <div style={{ color: '#6366f1' }}>
          ₦{Number(value).toLocaleString('en-NG')}
        </div>
      </div>
    );
  }
  return null;
};

function SpendingChart({ data }) {
  // data comes from summary.by_category:
  // [{ category: 'Food', total: '15000.00' }, ...]

  const chartData = (data || []).map((item) => ({
    name:  item.category,
    value: parseFloat(item.total),
  }));

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div className="section-header">
          <span className="section-title">Spending by Category</span>
        </div>
        <EmptyState
          icon="📊"
          title="No data yet"
          text="Add some expenses to see your spending breakdown."
        />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">Spending by Category</span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}    // donut hole
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span style={{ fontSize: 13, color: '#1e293b' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;
