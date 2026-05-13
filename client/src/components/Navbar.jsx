// =====================================================
// src/components/Navbar.jsx
// =====================================================

import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon">💰</div>
          <span>Expense Tracker</span>
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <span className="navbar-user">Hi, {user.name?.split(' ')[0] || 'there'} 👋</span>
          <button className="btn btn-outline" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
