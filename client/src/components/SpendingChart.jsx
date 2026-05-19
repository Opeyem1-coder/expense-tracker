import { BarChart2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import EmptyState from './EmptyState';

// Accessible palette: 10 distinct colors for pie slices
const COLORS = [
  '#6366f1', // Indigo
  '#22c55e', // Green
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b', // Slate
];

// Custom tooltip with NGN currency formatting
const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div
        className="card"
        style={{
          padding: '10px 14px',
          fontSize: 13,
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #475569',
          borderRadius: 6,
        }}
      >
        <strong>{name}</strong>
        <div style={{ color: '#6366f1', marginTop: 4 }}>
          ₦{Number(value).toLocaleString('en-NG')}
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend with colored squares
const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: 16 }}>
      {payload?.map((entry, index) => (
        <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: entry.color,
            }}
            aria-hidden="true"
          />
          <span style={{ fontSize: 12, color: '#64748b' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

function SpendingChart({ data }) {
  const chartData = (data || []).map((item) => ({
    name:  item.category,
    value: parseFloat(item.total),
  }));

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div className="section-header">
          <span className="section-title">Spending by Category</span>
          <span className="section-badge" aria-label="0 categories">0</span>
        </div>
        <EmptyState
          icon={<BarChart2 size={32} strokeWidth={1.5} color="currentColor" />}
          title="No spending data yet"
          text="Add expenses to see your spending breakdown by category."
        />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-header">
        <span className="section-title">Spending by Category</span>
        <span className="section-badge" aria-label={`${chartData.length} categories`}>
          {chartData.length}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SpendingChart;
