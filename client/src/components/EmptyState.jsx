function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state" role="status" aria-label={title}>
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <div className="empty-title">{title}</div>
      <p className="empty-text">{text}</p>
    </div>
  );
}

export default EmptyState;
