import { useNavigate } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-inner">
          <a href="/dashboard" className="navbar-brand" aria-label="Trackr home">
            <div className="navbar-logo-mark" aria-hidden="true">
              <Wallet size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="navbar-title">Trackr</span>
          </a>

          <div className="navbar-spacer" />

          <div className="navbar-user">
            <span className="navbar-user-name">
              Hi, {user.name?.split(' ')[0] || 'there'}
            </span>
            <div className="navbar-avatar" aria-hidden="true" title={user.name}>
              {initials}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
              aria-label="Log out of your account"
            >
              <LogOut size={14} aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
