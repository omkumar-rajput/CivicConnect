import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email address and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      // Route to respective role portal
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill test accounts during viva / demo
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="civic-card p-4 p-sm-5 bg-white shadow-sm border">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <h3 className="fw-bold text-dark">Portal Sign In</h3>
              <p className="text-muted small">
                Access CivicConnect Citizen, Municipal Officer or Admin Console
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label small fw-semibold text-secondary">
                    Password
                  </label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-civic-primary w-100 py-2 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Box */}
            <div className="mt-4 p-3 bg-light rounded-3 border">
              <div className="d-flex align-items-center gap-1 text-secondary small fw-bold mb-2">
                <i className="bi bi-lightning-charge-fill text-warning"></i>
                <span>One-Click Demo Credentials:</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-white bg-white border text-secondary small"
                  onClick={() => fillCredentials('admin@civicconnect.com', 'admin123')}
                >
                  <i className="bi bi-shield-check text-danger me-1"></i> Admin
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-white bg-white border text-secondary small"
                  onClick={() => fillCredentials('officer.roads@civicconnect.com', 'officer123')}
                >
                  <i className="bi bi-cone-striped text-warning me-1"></i> Officer (Roads)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-white bg-white border text-secondary small"
                  onClick={() => fillCredentials('officer.sanitation@civicconnect.com', 'officer123')}
                >
                  <i className="bi bi-trash3 text-success me-1"></i> Officer (Sanitation)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-white bg-white border text-secondary small"
                  onClick={() => fillCredentials('citizen@example.com', 'citizen123')}
                >
                  <i className="bi bi-person text-primary me-1"></i> Citizen
                </button>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center mt-4 text-muted small">
              Are you a new citizen?{' '}
              <Link to="/register" className="fw-semibold text-primary text-decoration-none">
                Create a Citizen Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
