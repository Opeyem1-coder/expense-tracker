import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left decorative panel ─────────────────── */}
      <div className="auth-panel" aria-hidden="true">
        <div className="auth-panel-glow auth-panel-glow-1" />
        <div className="auth-panel-glow auth-panel-glow-2" />

        <div className="auth-panel-logo">
          <div className="auth-panel-logo-mark">
            <Wallet size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="auth-panel-logo-text">Trackr</span>
        </div>

        <div className="auth-panel-content">
          <h1 className="auth-panel-headline">
            Take control of<br />your finances
          </h1>
          <p className="auth-panel-sub">
            Track income and expenses, visualize your spending habits, and build better financial habits — all in one place.
          </p>
        </div>

        <div className="auth-panel-stats">
          <div className="auth-stat">
            <div className="auth-stat-value">₦0</div>
            <div className="auth-stat-label">Hidden fees. Ever.</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">100%</div>
            <div className="auth-stat-label">Private & secure</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">∞</div>
            <div className="auth-stat-label">Transactions logged</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-value">10+</div>
            <div className="auth-stat-label">Spending categories</div>
          </div>
        </div>
      </div>

      {/* ── Right — form ──────────────────────────── */}
      <main className="auth-form-panel" id="main-content">
        <div className="auth-form-box">
          {/* Mobile logo */}
          <div className="auth-mobile-logo" aria-hidden="true">
            <div className="auth-mobile-logo-mark">
              <Wallet size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="auth-mobile-logo-text">Trackr</span>
          </div>

          <div className="auth-card-inner">
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subheading">Sign in to your account to continue</p>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Sign in form"
            >
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    aria-required="true"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}
                    aria-hidden="true"
                  />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-error" role="alert" aria-live="polite">
                  <AlertCircle size={15} aria-hidden="true" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
                aria-disabled={loading}
              >
                {loading
                  ? <><span className="spinner" aria-hidden="true" /> Signing in…</>
                  : <><span>Sign In</span><ArrowRight size={16} aria-hidden="true" /></>
                }
              </button>
            </form>
          </div>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
