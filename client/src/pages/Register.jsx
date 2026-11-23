import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please provide your name, email, and a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, phone, password });
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="civic-card p-4 p-sm-5 bg-white shadow-sm border">
            <div className="text-center mb-4">
              <div
                className="rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <i className="bi bi-person-badge-fill"></i>
              </div>
              <h3 className="fw-bold text-dark">Citizen Registration</h3>
              <p className="text-muted small">
                Sign up to lodge and track public infrastructure issues in your municipality
              </p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="form-control border-start-0"
                    placeholder="e.g. Ramesh Chandra"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-start-0"
                    placeholder="ramesh@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Mobile / Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control border-start-0"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-key"></i>
                    </span>
                    <input
                      type="password"
                      name="password"
                      className="form-control border-start-0"
                      placeholder="Min 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted border-end-0">
                      <i className="bi bi-check2-circle"></i>
                    </span>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control border-start-0"
                      placeholder="Re-type password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-check mb-4 small text-secondary">
                <input className="form-check-input" type="checkbox" id="termsCheck" required defaultChecked />
                <label className="form-check-input-label" htmlFor="termsCheck">
                  I agree to provide authentic grievance details under Municipal By-Laws.
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-civic-primary w-100 py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Citizen Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4 text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-primary text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
