import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoryService } from '../services/api';

const defaultCategories = [
  { name: 'Roads & Potholes', icon: 'bi-cone-striped', desc: 'Damaged asphalt, craters, broken dividers & pavements' },
  { name: 'Garbage & Waste', icon: 'bi-trash3', desc: 'Overflowing dumpsters, uncollected trash, illegal dumping' },
  { name: 'Water Supply', icon: 'bi-droplet-half', desc: 'Broken pipelines, contaminated water, low water pressure' },
  { name: 'Streetlights & Electrical', icon: 'bi-lightbulb', desc: 'Non-functional streetlights, loose wiring, dark lanes' },
  { name: 'Drainage & Sewage', icon: 'bi-water', desc: 'Blocked storm drains, open manholes, wastewater flooding' },
  { name: 'Parks & Amenities', icon: 'bi-tree', desc: 'Broken benches, playground repairs, horticulture upkeep' },
];

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        if (res.success && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
        }
      } catch (err) {
        // Fallback to default categories
      }
    };
    fetchCategories();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 bg-white border rounded-pill shadow-sm mb-3">
                <span className="badge bg-primary-subtle text-primary fw-bold">Online Civic Portal</span>
                <span className="small text-secondary">Municipal Grievance Redressal</span>
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.5px' }}>
                Report Civic Issues. <br />
                <span className="text-primary">Track In Real-Time.</span> <br />
                Transform Your City.
              </h1>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.15rem' }}>
                CivicConnect empowers citizens to report potholes, garbage dumps, water leakages,
                and broken streetlights directly to responsible municipal departments with photos and location details.
              </p>

              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  user?.role === 'citizen' ? (
                    <>
                      <Link to="/complaint/new" className="btn btn-civic-primary btn-lg shadow-sm">
                        <i className="bi bi-camera-fill me-2"></i> Report New Grievance
                      </Link>
                      <Link to="/citizen/dashboard" className="btn btn-civic-outline btn-lg">
                        <i className="bi bi-card-checklist me-2"></i> View My Grievances
                      </Link>
                    </>
                  ) : user?.role === 'officer' ? (
                    <Link to="/officer/dashboard" className="btn btn-civic-primary btn-lg">
                      <i className="bi bi-speedometer2 me-2"></i> Open Officer Dashboard
                    </Link>
                  ) : (
                    <Link to="/admin/dashboard" className="btn btn-civic-primary btn-lg">
                      <i className="bi bi-shield-check me-2"></i> Open Admin Portal
                    </Link>
                  )
                ) : (
                  <>
                    <Link to="/register" className="btn btn-civic-primary btn-lg shadow-sm">
                      <i className="bi bi-person-plus-fill me-2"></i> Citizen Sign Up
                    </Link>
                    <Link to="/login" className="btn btn-civic-outline btn-lg">
                      <i className="bi bi-box-arrow-in-right me-2"></i> Sign In to Portal
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Highlight Metrics */}
              <div className="row pt-4 mt-4 border-top border-light-subtle g-3">
                <div className="col-4">
                  <div className="fw-bold fs-4 text-dark">100%</div>
                  <div className="small text-muted">Transparent Status</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-4 text-primary">5-Stage</div>
                  <div className="small text-muted">Tracking Workflow</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-4 text-success">Verified</div>
                  <div className="small text-muted">Citizen Feedback</div>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card Preview */}
            <div className="col-lg-5">
              <div className="civic-card p-4 shadow-sm bg-white border">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary text-white p-2 rounded-3">
                      <i className="bi bi-broadcast"></i>
                    </span>
                    <div>
                      <h6 className="mb-0 fw-bold">Live Grievance Tracker</h6>
                      <small className="text-muted">Municipal Ticket CC-1001</small>
                    </div>
                  </div>
                  <span className="badge badge-in-progress px-3 py-2 rounded-pill">In Progress</span>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-1">Deep pothole near Metro Station Gate 2</h6>
                  <p className="text-secondary small mb-2">Station Road, Sector 18 &bull; Roads & Infrastructure</p>
                  <div className="rounded-3 overflow-hidden border mb-3" style={{ maxHeight: '160px' }}>
                    <img
                      src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"
                      alt="Pothole Issue"
                      className="w-100 h-100 object-fit-cover"
                    />
                  </div>
                </div>

                {/* Mini Step Tracker */}
                <div className="bg-light p-3 rounded-3 small">
                  <div className="d-flex justify-content-between text-muted fw-semibold mb-2">
                    <span>Workflow Progress</span>
                    <span className="text-primary">Step 4 of 5</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-primary" role="progressbar" style={{ width: '80%' }}></div>
                  </div>
                  <div className="mt-2 text-secondary small d-flex align-items-center gap-1">
                    <i className="bi bi-person-check text-success"></i> Assigned to: JE Rajesh Sharma (Roads Dept)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <span className="badge bg-light text-primary border fw-bold mb-2">Simple 3-Step Process</span>
            <h2 className="fw-bold text-dark">How CivicConnect Works</h2>
            <p className="text-muted">
              Designed for transparency, accountability, and prompt municipal action.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="civic-card p-4 h-100 civic-card-hover text-center">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-camera"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">1. Snap & Report</h5>
                <p className="text-secondary small mb-0">
                  Citizens submit problems with location, department category, detailed description, and photographic evidence.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="civic-card p-4 h-100 civic-card-hover text-center">
                <div
                  className="rounded-circle bg-warning-subtle text-warning d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-person-gear"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">2. Officer Action</h5>
                <p className="text-secondary small mb-0">
                  Administrators route the ticket to field municipal officers who inspect, dispatch repair teams, and post real-time updates.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="civic-card p-4 h-100 civic-card-hover text-center">
                <div
                  className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-star"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">3. Resolve & Rate</h5>
                <p className="text-secondary small mb-0">
                  Once resolved, citizens verify the work with photos and provide star ratings and feedback to ensure high municipal standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grievance Categories Section */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <span className="badge bg-light text-secondary border fw-bold mb-1">Municipal Coverage</span>
              <h2 className="fw-bold text-dark mb-0">Public Service Categories</h2>
            </div>
            <Link to="/register" className="btn btn-civic-outline btn-sm">
              Register to File Complaint <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="civic-card p-3 h-100 civic-card-hover d-flex align-items-start gap-3 bg-white">
                  <div
                    className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px', fontSize: '1.4rem', flexShrink: 0 }}
                  >
                    <i className={`bi ${cat.icon || 'bi-exclamation-triangle'}`}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                    <p className="text-secondary small mb-0">
                      {cat.description || cat.desc || 'Public infrastructure grievance service.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-5 bg-white border-top">
        <div className="container">
          <div className="p-4 p-md-5 rounded-4 bg-primary text-white shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            <div>
              <h3 className="fw-bold mb-2">Noticed an issue in your neighborhood?</h3>
              <p className="mb-0 text-white-50">
                Don't wait. Report potholes, dark streetlights, or waste accumulation in under 2 minutes.
              </p>
            </div>
            <Link to="/register" className="btn btn-light btn-lg fw-bold px-4 text-primary text-nowrap">
              Get Started Now <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
