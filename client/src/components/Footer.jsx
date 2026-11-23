import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-civic">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-5 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: '30px', height: '30px' }}
              >
                <i className="bi bi-buildings-fill"></i>
              </div>
              <h5 className="fw-bold mb-0 text-dark">CivicConnect</h5>
            </div>
            <p className="text-secondary small mb-3" style={{ maxWidth: '360px' }}>
              A centralized digital governance platform bridging citizens and municipal authorities
              for swift, transparent, and trackable resolution of public infrastructure grievances.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-light text-muted border">Full-Stack MERN</span>
              <span className="badge bg-light text-muted border">Bootstrap 5</span>
              <span className="badge bg-light text-muted border">REST API</span>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-dark mb-3">Quick Links</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <Link to="/" className="text-decoration-none text-secondary">
                  Portal Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-decoration-none text-secondary">
                  Officer & Citizen Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-decoration-none text-secondary">
                  New Citizen Registration
                </Link>
              </li>
              <li>
                <Link to="/complaint/new" className="text-decoration-none text-secondary">
                  Report Civic Issue
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12">
            <h6 className="fw-bold text-dark mb-3">Municipal Control Room</h6>
            <p className="small text-secondary mb-2">
              <i className="bi bi-geo-alt-fill text-primary me-2"></i> Municipal Corporation Civic Center, New Delhi
            </p>
            <p className="small text-secondary mb-2">
              <i className="bi bi-telephone-fill text-primary me-2"></i> Citizen Helpline: 1800-CIVIC-CONNECT (Toll Free)
            </p>
            <p className="small text-secondary mb-0">
              <i className="bi bi-envelope-fill text-primary me-2"></i> support@civicconnect.gov.in
            </p>
          </div>
        </div>

        <div className="border-top mt-4 pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div>
            &copy; {new Date().getFullYear()} CivicConnect. Developed for Web Technology Practical Evaluation.
          </div>
          <div className="mt-2 mt-md-0">
            <span>Clean Light Theme &bull; Responsive Layout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
