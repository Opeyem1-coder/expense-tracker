// =====================================================
// src/components/EmptyState.jsx
// =====================================================

function EmptyState({ icon, title, text }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: '#94a3b8',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#64748b' }}>
        {title}
      </h3>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

export default EmptyState;
