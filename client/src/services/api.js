// API client for communicating with CivicConnect Backend
const getApiBaseUrl = () => {
  let base = import.meta.env.VITE_API_URL;
  if (!base || !base.trim()) {
    // In local development with Vite proxy, use /api
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return '/api';
    }
    // In production (Vercel / Cloud), connect directly to live Render backend
    return 'https://civicconnect-api-shuf.onrender.com/api';
  }
  base = base.trim().replace(/\/+$/, '');
  if (!base.endsWith('/api') && !base.includes('/api/')) {
    base = `${base}/api`;
  }
  return base;
};

const API_BASE_URL = getApiBaseUrl();

// Helper to make authorized HTTP requests using standard Fetch API
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('civic_token');

  const headers = {
    ...(options.headers || {}),
  };

  // Add Bearer token if user is authenticated
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is NOT FormData, set JSON content type
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle JSON or plain text gracefully
    const contentType = response.headers.get('content-type') || '';
    let data = {};
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => '');
      data = { message: text || `HTTP ${response.status} response` };
    }

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};

// Authentication Services
export const authService = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me', { method: 'GET' }),
};

// Complaints Services
export const complaintService = {
  // Citizen submits complaint (handles FormData for image upload)
  create: (formData) => apiRequest('/complaints', { method: 'POST', body: formData }),
  getMyComplaints: () => apiRequest('/complaints/my', { method: 'GET' }),
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/complaints?${queryString}`, { method: 'GET' });
  },
  getById: (id) => apiRequest(`/complaints/${id}`, { method: 'GET' }),
  assignOfficer: (id, officerId, remarks) =>
    apiRequest(`/complaints/${id}/assign`, { method: 'PUT', body: { officerId, remarks } }),
  updateStatus: (id, status, remarks) =>
    apiRequest(`/complaints/${id}/status`, { method: 'PUT', body: { status, remarks } }),
  submitFeedback: (id, rating, comment) =>
    apiRequest(`/complaints/${id}/feedback`, { method: 'POST', body: { rating, comment } }),
  delete: (id) => apiRequest(`/complaints/${id}`, { method: 'DELETE' }),
};

// Categories Services
export const categoryService = {
  getAll: () => apiRequest('/categories', { method: 'GET' }),
  create: (categoryData) => apiRequest('/categories', { method: 'POST', body: categoryData }),
  delete: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
};

// Users / Officer Management Services
export const userService = {
  getAll: (role) => apiRequest(`/users${role ? `?role=${role}` : ''}`, { method: 'GET' }),
  createOfficer: (officerData) => apiRequest('/users/officer', { method: 'POST', body: officerData }),
  toggleStatus: (id) => apiRequest(`/users/${id}/toggle-status`, { method: 'PUT' }),
};

// Dashboard Analytics Services
export const statsService = {
  getStats: () => apiRequest('/stats/dashboard', { method: 'GET' }),
};
