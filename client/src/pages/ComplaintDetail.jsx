import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import StarRating from '../components/StarRating';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Status update states (for Officer / Admin)
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Citizen Feedback states
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getById(id);
      if (res.success) {
        setComplaint(res.complaint);
        setNewStatus(res.complaint.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Handle officer/admin updating status
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      setActionSuccess('');
      setError('');
      const res = await complaintService.updateStatus(id, newStatus, remarks);
      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess(`Status transitioned to "${newStatus}" successfully!`);
        setRemarks('');
      }
    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle citizen submitting rating feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      setError('');
      const res = await complaintService.submitFeedback(id, rating, feedbackComment);
      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess('Thank you! Your feedback and rating have been recorded.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading grievance details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Complaint not found'}
        </div>
        <button className="btn btn-civic-outline" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Go Back
        </button>
      </div>
    );
  }

  const isCitizenOwner = user?.role === 'citizen' && complaint.citizen?._id === user._id;
  const canUpdateStatus = user?.role === 'admin' || user?.role === 'officer';

  return (
    <div className="container py-4">
      {/* Navigation Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link
              to={
                user?.role === 'admin'
                  ? '/admin/dashboard'
                  : user?.role === 'officer'
                  ? '/officer/dashboard'
                  : '/citizen/dashboard'
              }
              className="text-decoration-none"
            >
              Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Ticket {complaint.complaintId || 'Detail'}
          </li>
        </ol>
      </nav>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show small d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{actionSuccess}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {/* Main Details Card */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="civic-card p-4 p-md-5 bg-white border shadow-sm mb-4">
            {/* Header info */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <span className="badge bg-light text-dark border fw-bold fs-6">
                    {complaint.complaintId}
                  </span>
                  <span className="badge bg-secondary-subtle text-secondary">
                    {complaint.category}
                  </span>
                  <span className={`badge priority-${(complaint.priority || 'medium').toLowerCase()}`}>
                    {complaint.priority || 'Medium'} Priority
                  </span>
                </div>
                <h3 className="fw-bold text-dark mb-1">{complaint.title}</h3>
                <div className="text-muted small">
                  Lodge Date:{' '}
                  {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            {/* Stepper Workflow Visualizer */}
            <Timeline currentStatus={complaint.status} statusHistory={complaint.statusHistory} />

            {/* Problem Description */}
            <div className="mb-4">
              <h6 className="fw-bold text-secondary mb-2">Description</h6>
              <div className="p-3 bg-light rounded-3 text-dark" style={{ lineHeight: '1.6' }}>
                {complaint.description}
              </div>
            </div>

            {/* Photo Attachment */}
            {complaint.imageUrl && (
              <div className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">Photographic Evidence</h6>
                <div className="border rounded-3 overflow-hidden bg-light text-center p-2">
                  <img
                    src={complaint.imageUrl}
                    alt="Complaint Evidence"
                    className="img-fluid rounded"
                    style={{ maxHeight: '380px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {/* Resolution Remarks (if resolved) */}
            {complaint.status === 'Resolved' && complaint.resolutionRemarks && (
              <div className="p-3 mb-4 rounded-3 border border-success-subtle bg-success-subtle text-success-emphasis">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-patch-check-fill text-success"></i> Official Resolution Remarks
                </h6>
                <p className="mb-1 small">{complaint.resolutionRemarks}</p>
                {complaint.resolvedAt && (
                  <div className="small text-muted">
                    Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Citizen Feedback Form / Display */}
            {complaint.status === 'Resolved' && (
              <div className="p-4 rounded-3 bg-light border mt-4">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-star-fill text-warning"></i> Citizen Satisfaction & Rating
                </h6>

                {complaint.feedback?.rating ? (
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <StarRating value={complaint.feedback.rating} readOnly={true} />
                      <span className="badge bg-success-subtle text-success small">Verified Feedback</span>
                    </div>
                    {complaint.feedback.comment && (
                      <p className="text-secondary small fst-italic mb-1">
                        "{complaint.feedback.comment}"
                      </p>
                    )}
                    <span className="text-muted small">
                      Submitted on: {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : isCitizenOwner ? (
                  <form onSubmit={handleFeedbackSubmit}>
                    <p className="text-secondary small mb-3">
                      Please rate the resolution quality and timeliness of the repair work done by municipal officers.
                    </p>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary d-block">
                        Select Rating (1 to 5 Stars):
                      </label>
                      <StarRating value={rating} onChange={(val) => setRating(val)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Remarks or Comments (Optional):
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Was the issue fixed to your satisfaction? Any suggestions?"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-civic-primary btn-sm px-3"
                      disabled={submittingFeedback}
                    >
                      {submittingFeedback ? 'Recording...' : 'Submit Feedback'}
                    </button>
                  </form>
                ) : (
                  <div className="text-muted small">
                    <em>Awaiting citizen feedback and rating.</em>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info & Controls */}
        <div className="col-lg-4">
          {/* Officer/Admin Status Action Box */}
          {canUpdateStatus && (
            <div className="civic-card p-4 bg-white border shadow-sm mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-sliders text-primary"></i> Update Grievance Status
              </h6>
              <form onSubmit={handleStatusUpdate}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">New Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    Remarks / Work Progress Note
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter on-site inspection findings, repair progress, or resolution notes..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-civic-primary btn-sm w-100"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? 'Updating...' : 'Save Status Update'}
                </button>
              </form>
            </div>
          )}

          {/* Location Details Card */}
          <div className="civic-card p-4 bg-white border shadow-sm mb-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-geo-alt-fill text-danger"></i> Location Details
            </h6>
            <div className="small mb-2">
              <span className="text-muted d-block">Street Address:</span>
              <strong className="text-dark">{complaint.location?.address}</strong>
            </div>
            {complaint.location?.landmark && (
              <div className="small mb-2">
                <span className="text-muted d-block">Landmark:</span>
                <span className="text-secondary">{complaint.location?.landmark}</span>
              </div>
            )}
            <div className="row g-2 small">
              <div className="col-6">
                <span className="text-muted d-block">City:</span>
                <span className="text-secondary">{complaint.location?.city || 'City Center'}</span>
              </div>
              <div className="col-6">
                <span className="text-muted d-block">Pincode:</span>
                <span className="text-secondary">{complaint.location?.pincode || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Assigned Officer Card */}
          <div className="civic-card p-4 bg-white border shadow-sm mb-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-badge-fill text-primary"></i> Municipal Assignment
            </h6>
            {complaint.assignedOfficer ? (
              <div className="small">
                <div className="fw-bold text-dark fs-6">{complaint.assignedOfficer.name}</div>
                <div className="text-primary fw-semibold">{complaint.assignedOfficer.department}</div>
                <div className="text-muted mt-2">
                  <i className="bi bi-envelope me-1"></i> {complaint.assignedOfficer.email}
                </div>
                {complaint.assignedOfficer.phone && (
                  <div className="text-muted mt-1">
                    <i className="bi bi-telephone me-1"></i> {complaint.assignedOfficer.phone}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted small">
                <i className="bi bi-hourglass me-1"></i> Not yet assigned to a municipal officer.
              </div>
            )}
          </div>

          {/* Citizen Details (visible to officer/admin) */}
          {canUpdateStatus && complaint.citizen && (
            <div className="civic-card p-4 bg-white border shadow-sm">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-fill text-secondary"></i> Complainant Information
              </h6>
              <div className="small">
                <div className="fw-bold text-dark">{complaint.citizen.name}</div>
                <div className="text-muted mt-1">
                  <i className="bi bi-envelope me-1"></i> {complaint.citizen.email}
                </div>
                {complaint.citizen.phone && (
                  <div className="text-muted mt-1">
                    <i className="bi bi-telephone me-1"></i> {complaint.citizen.phone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
