import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const formatDate = (val) => {
  if (!val) return 'N/A';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch (e) {
    return String(val);
  }
};

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getMyComplaints();
      if (res && res.success) {
        setComplaints(res.complaints || []);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints safely
  const filteredComplaints = (complaints || []).filter((c) => {
    if (!c) return false;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const searchLower = (searchTerm || '').trim().toLowerCase();
    const matchesSearch =
      searchLower === '' ||
      (c.title && c.title.toLowerCase().includes(searchLower)) ||
      (c.complaintId && c.complaintId.toLowerCase().includes(searchLower)) ||
      (c.category && c.category.toLowerCase().includes(searchLower)) ||
      (c.location?.address && c.location.address.toLowerCase().includes(searchLower));
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics safely
  const totalCount = (complaints || []).length;
  const inProgressCount = (complaints || []).filter(
    (c) => c && (c.status === 'In Progress' || c.status === 'Assigned')
  ).length;
  const resolvedCount = (complaints || []).filter((c) => c && c.status === 'Resolved').length;

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-light text-primary border mb-1">Citizen Portal</span>
          <h2 className="fw-bold text-dark mb-1">Welcome back, {user?.name || 'Citizen'}!</h2>
          <p className="text-secondary small mb-0">
            Monitor the status of your reported grievances and track civic repairs in real-time.
          </p>
        </div>
        <Link to="/complaint/new" className="btn btn-civic-primary d-inline-flex align-items-center gap-2 shadow-sm">
          <i className="bi bi-plus-circle-fill"></i>
          <span>Lodge New Grievance</span>
        </Link>
      </div>

      {/* Metric Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-widget">
            <div>
              <div className="text-muted small fw-semibold">Total Complaints Filed</div>
              <div className="fs-3 fw-bold text-dark">{totalCount}</div>
            </div>
            <div className="stat-icon bg-primary-subtle text-primary">
              <i className="bi bi-folder2-open"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-widget">
            <div>
              <div className="text-muted small fw-semibold">Under Action / In Progress</div>
              <div className="fs-3 fw-bold text-warning">{inProgressCount}</div>
            </div>
            <div className="stat-icon bg-warning-subtle text-warning">
              <i className="bi bi-gear-wide-connected"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-widget">
            <div>
              <div className="text-muted small fw-semibold">Resolved Successfully</div>
              <div className="fs-3 fw-bold text-success">{resolvedCount}</div>
            </div>
            <div className="stat-icon bg-success-subtle text-success">
              <i className="bi bi-patch-check-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by ticket ID, title, category or street address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted text-nowrap">Filter Status:</span>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses ({totalCount})</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="col-md-2 text-md-end">
            <button className="btn btn-civic-outline btn-sm w-100" onClick={fetchComplaints}>
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Loading your complaints...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="civic-card p-5 text-center bg-white">
          <div
            className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center text-muted mb-3"
            style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
          >
            <i className="bi bi-inbox"></i>
          </div>
          <h5 className="fw-bold text-dark">No Grievances Found</h5>
          <p className="text-muted small mb-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
            {searchTerm || statusFilter !== 'All'
              ? 'No complaints match your current search and status filter criteria.'
              : "You haven't filed any complaints yet. Report an issue in your locality today!"}
          </p>
          <Link to="/complaint/new" className="btn btn-civic-primary btn-sm px-4">
            <i className="bi bi-plus-circle me-1"></i> Lodge First Complaint
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {filteredComplaints.map((item) => (
            <div key={item._id} className="col-12">
              <div className="civic-card p-3 p-md-4 civic-card-hover bg-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge bg-light text-dark border fw-bold">
                      {item.complaintId || 'CC-NEW'}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary small">
                      {item.category || 'General'}
                    </span>
                    <span
                      className={`badge priority-${String(
                        item.priority || 'medium'
                      ).toLowerCase()} small`}
                    >
                      {item.priority || 'Medium'} Priority
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="row align-items-center gy-3 mt-1">
                  <div className="col-md-8">
                    <h5 className="fw-bold text-dark mb-1">
                      <Link
                        to={`/complaint/${item._id}`}
                        className="text-dark text-decoration-none hover-primary"
                      >
                        {item.title || 'Untitled Complaint'}
                      </Link>
                    </h5>
                    <p className="text-secondary small mb-2 text-truncate" style={{ maxHeight: '42px' }}>
                      {item.description}
                    </p>
                    <div className="d-flex flex-wrap gap-3 text-muted small">
                      <span>
                        <i className="bi bi-geo-alt text-danger me-1"></i>
                        {item.location?.address || 'Location provided'}
                        {item.location?.landmark ? ` (Near ${item.location.landmark})` : ''}
                      </span>
                      <span>
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-4 text-md-end border-top border-md-top-0 pt-2 pt-md-0">
                    {item.assignedOfficer ? (
                      <div className="small mb-2 text-start text-md-end">
                        <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>Assigned Officer</span>
                        <span className="fw-semibold text-dark">
                          {typeof item.assignedOfficer === 'object'
                            ? item.assignedOfficer.name
                            : 'Field Officer'}
                        </span>
                      </div>
                    ) : (
                      <div className="small mb-2 text-start text-md-end text-muted">
                        <em>Awaiting officer assignment</em>
                      </div>
                    )}
                    <Link
                      to={`/complaint/${item._id}`}
                      className="btn btn-civic-outline btn-sm px-3"
                    >
                      View Details & Tracking <i className="bi bi-chevron-right ms-1"></i>
                    </Link>
                  </div>
                </div>

                {/* Rating notice if resolved */}
                {item.status === 'Resolved' && (
                  <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center flex-wrap gap-2 small">
                    {item.feedback?.rating ? (
                      <span className="text-success fw-semibold">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Feedback Submitted: {item.feedback.rating}/5 Stars
                      </span>
                    ) : (
                      <Link to={`/complaint/${item._id}`} className="text-warning fw-semibold text-decoration-none">
                        <i className="bi bi-star me-1"></i> Rate resolution quality to complete case
                      </Link>
                    )}
                    <span className="text-muted">
                      Resolved on: {formatDate(item.resolvedAt || item.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
