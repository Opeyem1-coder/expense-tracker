import { Navigate } from 'react-router-dom';

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (!payload.exp) {
      return true;
    }

    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
