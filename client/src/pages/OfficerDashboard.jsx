import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMyTasks, setOnlyMyTasks] = useState(true);

  // Status update modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('In Progress');
  const [modalRemarks, setModalRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (onlyMyTasks) {
        params.assignedToMe = 'true';
      }
      const res = await complaintService.getAll(params);
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [onlyMyTasks]);

  const handleOpenStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status === 'Submitted' || complaint.status === 'Assigned' ? 'In Progress' : complaint.status);
    setModalRemarks('');
    setError('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setUpdating(true);
      const res = await complaintService.updateStatus(
        selectedComplaint._id,
        modalStatus,
        modalRemarks
      );
      if (res.success) {
        setActionSuccess(`Ticket ${selectedComplaint.complaintId} updated to ${modalStatus}!`);
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch (err) {
      setError(err.message || 'Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const assignedCount = complaints.filter((c) => c.status === 'Assigned').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="container py-4">
      {/* Officer Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-warning-subtle text-warning-emphasis border mb-1">
            Municipal Officer Console
          </span>
          <h2 className="fw-bold text-dark mb-1">{user?.name}</h2>
          <p className="text-secondary small mb-0">
            Department: <strong className="text-dark">{user?.department || 'Field Operations'}</strong> &bull; Manage assigned civic repair orders
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${onlyMyTasks ? 'btn-primary' : 'btn-civic-outline'}`}
            onClick={() => setOnlyMyTasks(true)}
          >
            <i className="bi bi-person-check me-1"></i> Assigned To Me
          </button>
          <button
            className={`btn btn-sm ${!onlyMyTasks ? 'btn-primary' : 'btn-civic-outline'}`}
            onClick={() => setOnlyMyTasks(false)}
          >
            <i className="bi bi-collection me-1"></i> All Department Grievances
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{actionSuccess}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-widget">
            <div>
              <div className="text-muted small fw-semibold">Assigned / New Tasks</div>
              <div className="fs-3 fw-bold text-primary">{assignedCount}</div>
            </div>
            <div className="stat-icon bg-primary-subtle text-primary">
              <i className="bi bi-inbox-fill"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-widget">
            <div>
              <div className="text-muted small fw-semibold">Work In Progress</div>
              <div className="fs-3 fw-bold text-warning">{inProgressCount}</div>
            </div>
            <div className="stat-icon bg-warning-subtle text-warning">
              <i className="bi bi-tools"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-widget">
            <div>
              <div className="text-muted small fw-semibold">Resolved Cases</div>
              <div className="fs-3 fw-bold text-success">{resolvedCount}</div>
            </div>
            <div className="stat-icon bg-success-subtle text-success">
              <i className="bi bi-check2-all"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
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
                placeholder="Search by ticket ID, title, street or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses ({complaints.length})</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Submitted">Submitted</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end">
            <button className="btn btn-civic-outline btn-sm w-100" onClick={fetchComplaints}>
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Loading grievance tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="civic-card p-5 text-center bg-white">
          <i className="bi bi-clipboard2-check text-muted fs-1 mb-2"></i>
          <h5 className="fw-bold text-dark">No Grievances Found</h5>
          <p className="text-muted small mb-0">
            {searchTerm || statusFilter !== 'All'
              ? 'No tickets match the search criteria.'
              : 'You have no assigned tasks in this queue right now.'}
          </p>
        </div>
      ) : (
        <div className="civic-card bg-white border overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-secondary">
                  <th>Ticket ID</th>
                  <th>Grievance Summary</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span className="fw-bold text-primary">{item.complaintId}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{item.title}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: '280px' }}>
                        {item.description}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary small">
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge priority-${(item.priority || 'medium').toLowerCase()} small`}
                      >
                        {item.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <small className="text-secondary d-block">
                        <i className="bi bi-geo-alt text-danger me-1"></i>
                        {item.location?.address}
                      </small>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => handleOpenStatusModal(item)}
                          title="Update Status"
                        >
                          <i className="bi bi-pencil-square me-1"></i> Update
                        </button>
                        <Link
                          to={`/complaint/${item._id}`}
                          className="btn btn-outline-secondary"
                          title="View Details"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Status Update Modal */}
      {selectedComplaint && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Update Ticket {selectedComplaint.complaintId}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedComplaint(null)}
                ></button>
              </div>
              <form onSubmit={handleStatusSubmit}>
                <div className="modal-body">
                  <p className="fw-semibold text-dark mb-1">{selectedComplaint.title}</p>
                  <p className="small text-muted mb-3">{selectedComplaint.location?.address}</p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Transition Status To:
                    </label>
                    <select
                      className="form-select"
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                    >
                      <option value="In Progress">In Progress (Field Work Started)</option>
                      <option value="Resolved">Resolved (Work Completed)</option>
                      <option value="Rejected">Rejected (Out of Municipal Scope)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Resolution Remarks / Action Taken <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Dispatched asphalt patch repair van. Pothole filled and levelled."
                      value={modalRemarks}
                      onChange={(e) => setModalRemarks(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-civic-outline btn-sm"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-civic-primary btn-sm px-3"
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : 'Save & Publish Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
