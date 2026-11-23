import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  complaintService,
  statsService,
  userService,
  categoryService,
} from '../services/api';
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

const AdminDashboard = () => {
  const { user } = useAuth();

  // Tab navigation
  const [activeTab, setActiveTab] = useState('overview'); // overview | complaints | officers | categories | citizens

  // State
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering for complaints tab
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [assignModal, setAssignModal] = useState({ open: false, complaint: null, officerId: '', remarks: '' });
  const [newOfficerModal, setNewOfficerModal] = useState({
    open: false,
    name: '',
    email: '',
    password: '',
    department: 'Roads & Infrastructure',
    phone: '',
  });
  const [newCategoryModal, setNewCategoryModal] = useState({
    open: false,
    name: '',
    department: '',
    description: '',
    icon: 'bi-gear',
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, complaintsRes, officersRes, categoriesRes, citizensRes] =
        await Promise.allSettled([
          statsService.getStats(),
          complaintService.getAll(),
          userService.getAll('officer'),
          categoryService.getAll(),
          userService.getAll('citizen'),
        ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.stats);
      }
      if (complaintsRes.status === 'fulfilled' && complaintsRes.value?.success) {
        setComplaints(complaintsRes.value.complaints || []);
      }
      if (officersRes.status === 'fulfilled' && officersRes.value?.success) {
        setOfficers(officersRes.value.users || []);
      }
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.success) {
        setCategories(categoriesRes.value.categories || []);
      }
      if (citizensRes.status === 'fulfilled' && citizensRes.value?.success) {
        setCitizens(citizensRes.value.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load administrative console data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Assigning an Officer
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModal.complaint || !assignModal.officerId) return;

    try {
      const res = await complaintService.assignOfficer(
        assignModal.complaint._id,
        assignModal.officerId,
        assignModal.remarks
      );
      if (res && res.success) {
        setSuccessMsg(`Complaint assigned successfully to officer!`);
        setAssignModal({ open: false, complaint: null, officerId: '', remarks: '' });
        loadDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to assign officer');
    }
  };

  // Handle Registering a New Officer
  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.createOfficer({
        name: newOfficerModal.name,
        email: newOfficerModal.email,
        password: newOfficerModal.password,
        department: newOfficerModal.department,
        phone: newOfficerModal.phone,
      });
      if (res && res.success) {
        setSuccessMsg(`Municipal Officer ${newOfficerModal.name} created successfully!`);
        setNewOfficerModal({
          open: false,
          name: '',
          email: '',
          password: '',
          department: 'Roads & Infrastructure',
          phone: '',
        });
        loadDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to register officer');
    }
  };

  // Handle Creating a Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await categoryService.create(newCategoryModal);
      if (res && res.success) {
        setSuccessMsg(`Category "${newCategoryModal.name}" added successfully!`);
        setNewCategoryModal({
          open: false,
          name: '',
          department: '',
          description: '',
          icon: 'bi-gear',
        });
        loadDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to add category');
    }
  };

  // Handle Deleting a Category
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to remove this category?')) return;
    try {
      const res = await categoryService.delete(catId);
      if (res && res.success) {
        setSuccessMsg('Category removed successfully');
        loadDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    }
  };

  // Handle Deleting a Complaint
  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this grievance ticket?')) return;
    try {
      const res = await complaintService.delete(complaintId);
      if (res && res.success) {
        setSuccessMsg('Grievance ticket deleted successfully');
        loadDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete grievance');
    }
  };

  // Filter complaints safely
  const filteredComplaints = (complaints || []).filter((c) => {
    if (!c) return false;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const searchLower = (searchTerm || '').trim().toLowerCase();
    const matchesSearch =
      searchLower === '' ||
      (c.title && c.title.toLowerCase().includes(searchLower)) ||
      (c.complaintId && c.complaintId.toLowerCase().includes(searchLower)) ||
      (c.category && c.category.toLowerCase().includes(searchLower)) ||
      (c.location?.address && c.location.address.toLowerCase().includes(searchLower));
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-4">
      {/* Admin Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-danger-subtle text-danger border mb-1">
            Executive Admin Control
          </span>
          <h2 className="fw-bold text-dark mb-1">Municipal Administration Portal</h2>
          <p className="text-secondary small mb-0">
            Real-time public grievance monitoring, departmental routing, officer supervision & analytics
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-civic-outline btn-sm" onClick={loadDashboardData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{successMsg}</div>
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{error}</div>
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'overview' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-1"></i> Analytics Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'complaints' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('complaints')}
          >
            <i className="bi bi-list-check me-1"></i> All Grievances ({(complaints || []).length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'officers' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('officers')}
          >
            <i className="bi bi-person-gear me-1"></i> Municipal Officers ({(officers || []).length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'categories' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className="bi bi-tags me-1"></i> Categories ({(categories || []).length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'citizens' ? 'active' : 'text-secondary'}`}
            onClick={() => setActiveTab('citizens')}
          >
            <i className="bi bi-people me-1"></i> Registered Citizens ({(citizens || []).length})
          </button>
        </li>
      </ul>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-sm-6">
              <div className="stat-widget">
                <div>
                  <div className="text-muted small fw-semibold">Total Grievances</div>
                  <div className="fs-3 fw-bold text-dark">{stats?.total ?? (complaints || []).length}</div>
                </div>
                <div className="stat-icon bg-primary-subtle text-primary">
                  <i className="bi bi-folder2"></i>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="stat-widget">
                <div>
                  <div className="text-muted small fw-semibold">Pending / Unassigned</div>
                  <div className="fs-3 fw-bold text-danger">{stats?.pending ?? 0}</div>
                </div>
                <div className="stat-icon bg-danger-subtle text-danger">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="stat-widget">
                <div>
                  <div className="text-muted small fw-semibold">In Progress Repairs</div>
                  <div className="fs-3 fw-bold text-warning">{stats?.inProgress ?? 0}</div>
                </div>
                <div className="stat-icon bg-warning-subtle text-warning">
                  <i className="bi bi-gear"></i>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="stat-widget">
                <div>
                  <div className="text-muted small fw-semibold">Resolved Cases</div>
                  <div className="fs-3 fw-bold text-success">{stats?.resolved ?? 0}</div>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {stats?.resolutionRate ?? 0}% Redressal Rate
                  </small>
                </div>
                <div className="stat-icon bg-success-subtle text-success">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Departmental & Category Breakdown */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="civic-card p-4 bg-white h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-pie-chart-fill text-primary"></i> Complaints by Category
                </h5>
                {stats?.byCategory && Array.isArray(stats.byCategory) && stats.byCategory.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {stats.byCategory.map((cat, idx) => {
                      if (!cat) return null;
                      const totalCount = stats.total || 1;
                      const percentage = Math.round(((cat.count || 0) / totalCount) * 100);
                      return (
                        <div key={idx}>
                          <div className="d-flex justify-content-between small fw-semibold mb-1">
                            <span className="text-dark">{cat.category || 'General'}</span>
                            <span className="text-muted">
                              {cat.count || 0} issues ({percentage}%)
                            </span>
                          </div>
                          <div className="progress" style={{ height: '7px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted small py-4 text-center">No category data yet.</div>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="civic-card p-4 bg-white h-100">
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-diagram-3-fill text-success"></i> Complaints by Status Lifecycle
                </h5>
                {stats?.byStatus && Array.isArray(stats.byStatus) && stats.byStatus.length > 0 ? (
                  <div className="row g-2">
                    {stats.byStatus.map((item, idx) => {
                      if (!item) return null;
                      return (
                        <div key={idx} className="col-sm-6">
                          <div className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                            <div>
                              <div className="text-muted small fw-semibold">{item.status || 'Status'}</div>
                              <div className="fs-4 fw-bold text-dark">{item.count || 0}</div>
                            </div>
                            <StatusBadge status={item.status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted small py-4 text-center">No status data yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL COMPLAINTS & ASSIGNMENT */}
      {activeTab === 'complaints' && (
        <div>
          {/* Filter Bar */}
          <div className="civic-card p-3 mb-4 bg-white">
            <div className="row g-2 align-items-center">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by ID, title, street..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {(categories || []).map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="civic-card bg-white border overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Ticket ID</th>
                    <th>Issue Summary</th>
                    <th>Category</th>
                    <th>Citizen Details</th>
                    <th>Assigned Officer</th>
                    <th>Status</th>
                    <th className="text-end">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredComplaints || []).map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span className="fw-bold text-primary">{item.complaintId || 'CC-NEW'}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{item.title || 'Untitled Complaint'}</div>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '240px' }}>
                          <i className="bi bi-geo-alt text-danger me-1"></i>
                          {item.location?.address || 'Address provided'}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary small">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td>
                        <div className="small fw-semibold">
                          {typeof item.citizen === 'object' ? item.citizen.name : 'Citizen'}
                        </div>
                        <small className="text-muted">
                          {typeof item.citizen === 'object'
                            ? item.citizen.phone || item.citizen.email
                            : ''}
                        </small>
                      </td>
                      <td>
                        {item.assignedOfficer ? (
                          <div className="small">
                            <span className="badge bg-info-subtle text-info-emphasis d-block mb-1">
                              {typeof item.assignedOfficer === 'object'
                                ? item.assignedOfficer.name
                                : 'Assigned Officer'}
                            </span>
                            <small className="text-muted">
                              {typeof item.assignedOfficer === 'object'
                                ? item.assignedOfficer.department
                                : ''}
                            </small>
                          </div>
                        ) : (
                          <span className="badge bg-warning-subtle text-warning-emphasis">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() =>
                              setAssignModal({
                                open: true,
                                complaint: item,
                                officerId: item.assignedOfficer?._id || '',
                                remarks: '',
                              })
                            }
                            title="Assign Officer"
                          >
                            <i className="bi bi-person-plus"></i> Assign
                          </button>
                          <Link
                            to={`/complaint/${item._id}`}
                            className="btn btn-outline-secondary"
                            title="View"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteComplaint(item._id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MUNICIPAL OFFICERS */}
      {activeTab === 'officers' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Registered Municipal Field Officers</h5>
            <button
              className="btn btn-civic-primary btn-sm"
              onClick={() => setNewOfficerModal({ ...newOfficerModal, open: true })}
            >
              <i className="bi bi-person-plus-fill me-1"></i> Register New Officer
            </button>
          </div>

          <div className="row g-3">
            {(officers || []).map((off) => (
              <div key={off._id} className="col-lg-4 col-md-6">
                <div className="civic-card p-4 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div
                      className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                      style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}
                    >
                      <i className="bi bi-person-badge"></i>
                    </div>
                    <span
                      className={`badge ${off.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
                    >
                      {off.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">{off.name}</h6>
                  <div className="badge bg-light text-secondary border mb-3">
                    {off.department || 'Municipal Operations'}
                  </div>
                  <div className="small text-muted d-flex flex-column gap-1">
                    <div>
                      <i className="bi bi-envelope me-2"></i> {off.email}
                    </div>
                    <div>
                      <i className="bi bi-telephone me-2"></i> {off.phone || 'No phone recorded'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Complaint Categories & Departments</h5>
            <button
              className="btn btn-civic-primary btn-sm"
              onClick={() => setNewCategoryModal({ ...newCategoryModal, open: true })}
            >
              <i className="bi bi-plus-circle me-1"></i> Add New Category
            </button>
          </div>

          <div className="row g-3">
            {(categories || []).map((cat) => (
              <div key={cat._id} className="col-lg-4 col-md-6">
                <div className="civic-card p-4 bg-white h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div
                        className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                      >
                        <i className={`bi ${cat.icon || 'bi-gear'}`}></i>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1 px-2 border-0"
                        onClick={() => handleDeleteCategory(cat._id)}
                        title="Delete Category"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                    <div className="badge bg-light text-primary border mb-2">{cat.department}</div>
                    <p className="small text-secondary mb-0">{cat.description || 'Public service'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REGISTERED CITIZENS */}
      {activeTab === 'citizens' && (
        <div className="civic-card bg-white border overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th>Citizen Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(citizens || []).map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="fw-semibold text-dark">{c.name}</div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td className="small text-muted">
                      {formatDate(c.createdAt)}
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ASSIGN OFFICER MODAL */}
      {assignModal.open && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Assign Officer to {assignModal.complaint?.complaintId || 'Complaint'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAssignModal({ open: false, complaint: null, officerId: '', remarks: '' })}
                ></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body">
                  <div className="mb-2">
                    <strong>{assignModal.complaint?.title}</strong>
                    <div className="small text-muted">{assignModal.complaint?.location?.address}</div>
                  </div>

                  <div className="mb-3 mt-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Select Municipal Officer <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={assignModal.officerId}
                      onChange={(e) => setAssignModal({ ...assignModal, officerId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Field Officer --</option>
                      {(officers || []).map((off) => (
                        <option key={off._id} value={off._id}>
                          {off.name} ({off.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Assignment Note / Special Instructions
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Please inspect pothole size and arrange asphalt patching team by tomorrow morning."
                      value={assignModal.remarks}
                      onChange={(e) => setAssignModal({ ...assignModal, remarks: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-civic-outline btn-sm"
                    onClick={() => setAssignModal({ open: false, complaint: null, officerId: '', remarks: '' })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-civic-primary btn-sm px-3">
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OFFICER MODAL */}
      {newOfficerModal.open && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Provision Municipal Officer Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNewOfficerModal({ ...newOfficerModal, open: false })}
                ></button>
              </div>
              <form onSubmit={handleCreateOfficer}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Officer Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rajesh Sharma"
                      value={newOfficerModal.name}
                      onChange={(e) => setNewOfficerModal({ ...newOfficerModal, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Official Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="officer.roads@civicconnect.com"
                      value={newOfficerModal.email}
                      onChange={(e) => setNewOfficerModal({ ...newOfficerModal, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Assigned Department</label>
                    <select
                      className="form-select"
                      value={newOfficerModal.department}
                      onChange={(e) => setNewOfficerModal({ ...newOfficerModal, department: e.target.value })}
                    >
                      <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                      <option value="Sanitation & Solid Waste Management">Sanitation & Solid Waste Management</option>
                      <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
                      <option value="Electricity & Streetlighting Cell">Electricity & Streetlighting Cell</option>
                      <option value="Drainage & Stormwater Department">Drainage & Stormwater Department</option>
                      <option value="Horticulture & Parks Dept">Horticulture & Parks Dept</option>
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Mobile / Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+91 98765 00000"
                        value={newOfficerModal.phone}
                        onChange={(e) => setNewOfficerModal({ ...newOfficerModal, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Initial Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Min 6 chars"
                        value={newOfficerModal.password}
                        onChange={(e) => setNewOfficerModal({ ...newOfficerModal, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-civic-outline btn-sm"
                    onClick={() => setNewOfficerModal({ ...newOfficerModal, open: false })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-civic-primary btn-sm px-3">
                    Register Officer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {newCategoryModal.open && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Grievance Category</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setNewCategoryModal({ ...newCategoryModal, open: false })}
                ></button>
              </div>
              <form onSubmit={handleCreateCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Stray Animals / Cattle Management"
                      value={newCategoryModal.name}
                      onChange={(e) => setNewCategoryModal({ ...newCategoryModal, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Managing Department</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Veterinary & Animal Welfare Wing"
                      value={newCategoryModal.department}
                      onChange={(e) => setNewCategoryModal({ ...newCategoryModal, department: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Brief scope of grievances handled in this domain..."
                      value={newCategoryModal.description}
                      onChange={(e) => setNewCategoryModal({ ...newCategoryModal, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Bootstrap Icon Class</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. bi-shield-exclamation"
                      value={newCategoryModal.icon}
                      onChange={(e) => setNewCategoryModal({ ...newCategoryModal, icon: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-civic-outline btn-sm"
                    onClick={() => setNewCategoryModal({ ...newCategoryModal, open: false })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-civic-primary btn-sm px-3">
                    Save Category
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

export default AdminDashboard;
