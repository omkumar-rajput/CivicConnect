import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-civic sticky-top">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand-civic" to="/">
          <div className="brand-icon">
            <i className="bi bi-buildings"></i>
          </div>
          <div className="d-flex flex-column">
            <span style={{ lineHeight: '1.2' }}>CivicConnect</span>
            <span className="small text-muted" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
              Smart Public Grievance Portal
            </span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#civicNavbar"
          aria-controls="civicNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="civicNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 gap-lg-2 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-secondary px-3" to="/">
                <i className="bi bi-house me-1"></i> Home
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                {/* Citizen Navigation Links */}
                {user?.role === 'citizen' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link fw-semibold text-secondary px-3" to="/citizen/dashboard">
                        <i className="bi bi-grid me-1"></i> My Complaints
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="btn btn-civic-primary btn-sm px-3 ms-lg-2" to="/complaint/new">
                        <i className="bi bi-plus-circle me-1"></i> Lodge Complaint
                      </Link>
                    </li>
                  </>
                )}

                {/* Officer Navigation Links */}
                {user?.role === 'officer' && (
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold text-secondary px-3" to="/officer/dashboard">
                      <i className="bi bi-speedometer2 me-1"></i> Officer Dashboard
                    </Link>
                  </li>
                )}

                {/* Admin Navigation Links */}
                {user?.role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link fw-semibold text-secondary px-3" to="/admin/dashboard">
                      <i className="bi bi-shield-check me-1"></i> Admin Portal
                    </Link>
                  </li>
                )}

                {/* User Dropdown / Profile Badge */}
                <li className="nav-item dropdown ms-lg-2">
                  <button
                    className="btn btn-civic-outline btn-sm dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle fs-6 text-primary"></i>
                    <span>{user?.name?.split(' ')[0]}</span>
                    <span className="badge bg-light text-dark border ms-1" style={{ fontSize: '0.65rem' }}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold">{user?.name}</div>
                      <div className="text-muted small">{user?.email}</div>
                      {user?.department && (
                        <div className="badge bg-info-subtle text-info-emphasis mt-1 small">
                          {user.department}
                        </div>
                      )}
                    </li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold text-secondary px-3" to="/login">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-civic-primary btn-sm px-3" to="/register">
                    Citizen Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
