import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/api';
import { Lock, User, AlertCircle, LogIn } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(credentials);
      onLoginSuccess(data.user);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid username or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card login-card">
      <div className="login-header">
        <div className="lock-icon-wrap">
          <Lock size={32} />
        </div>
        <h2 className="login-title">{t('admin.loginTitle')}</h2>
        <p className="login-subtitle">{t('admin.loginSubtitle')}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">{t('admin.username')}</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="admin or admin@galotravel.com"
              value={credentials.username}
              onChange={handleChange}
              className="input-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('admin.password')}</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              className="input-control"
            />
          </div>
          <span className="help-text">Default dev credentials: <code>admin</code> / <code>admin123</code></span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary submit-btn"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>{t('admin.signingIn')}</span>
            </>
          ) : (
            <>
              <LogIn size={18} />
              <span>{t('admin.signIn')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
