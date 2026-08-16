import { useState } from 'react';
import axios from 'axios';

function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError('Password must be at least 8 characters, with at least 1 uppercase letter and 1 number.');
        return;
      }
    }

    setLoading(true);

    const endpoint = isLogin ? 'login' : 'signup';

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, formData);

      // Save token and user info in browser storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to access your wildfire watchlist' : 'Sign up to track fire activity in your regions'}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && formData.password && (
            <div className="password-checklist">
              <span className={formData.password.length >= 8 ? 'check-item valid' : 'check-item'}>
                {formData.password.length >= 8 ? '✓' : '○'} At least 8 characters
              </span>
              <span className={/[A-Z]/.test(formData.password) ? 'check-item valid' : 'check-item'}>
                {/[A-Z]/.test(formData.password) ? '✓' : '○'} One uppercase letter
              </span>
              <span className={/[0-9]/.test(formData.password) ? 'check-item valid' : 'check-item'}>
                {/[0-9]/.test(formData.password) ? '✓' : '○'} One number
              </span>
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;