import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintService, categoryService } from '../services/api';

const defaultCategories = [
  'Roads & Potholes',
  'Garbage & Waste',
  'Water Supply',
  'Streetlights & Electrical',
  'Drainage & Sewage',
  'Parks & Amenities',
];

const NewComplaint = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState(defaultCategories);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    address: '',
    landmark: '',
    city: 'New Delhi',
    pincode: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available categories from server
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAll();
        if (res.success && res.categories && res.categories.length > 0) {
          setCategories(res.categories.map((c) => c.name));
          setFormData((prev) => ({ ...prev, category: res.categories[0].name }));
        } else {
          setFormData((prev) => ({ ...prev, category: defaultCategories[0] }));
        }
      } catch (err) {
        setFormData((prev) => ({ ...prev, category: defaultCategories[0] }));
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { title, category, address, description } = formData;

    if (!title.trim() || !category || !address.trim() || !description.trim()) {
      setError('Please fill in Title, Category, Location Address, and Description');
      return;
    }

    try {
      setLoading(true);

      // Create FormData to send multipart/form-data for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('priority', formData.priority);
      data.append('address', formData.address);
      data.append('landmark', formData.landmark);
      data.append('city', formData.city);
      data.append('pincode', formData.pincode);
      data.append('description', formData.description);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (imageUrlInput.trim()) {
        data.append('imageUrl', imageUrlInput.trim());
      }

      const res = await complaintService.create(data);

      if (res.success) {
        navigate(`/complaint/${res.complaint._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to lodge complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/citizen/dashboard" className="text-decoration-none">
              My Dashboard
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Lodge New Grievance
          </li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="civic-card p-4 p-md-5 bg-white border shadow-sm">
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              <div
                className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem', flexShrink: 0 }}
              >
                <i className="bi bi-file-earmark-plus-fill"></i>
              </div>
              <div>
                <h3 className="fw-bold text-dark mb-0">Lodge Public Grievance</h3>
                <p className="text-secondary small mb-0">
                  Submit details of the civic issue with photographs for municipal inspection
                </p>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 mb-4" role="alert">
                <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Complaint Title */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-secondary">
                  Grievance Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Deep pothole right outside Metro Station Gate 2"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <div className="form-text small">Provide a clear, brief summary of the problem.</div>
              </div>

              {/* Category and Priority */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">
                    Grievance Category <span className="text-danger">*</span>
                  </label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">
                    Severity / Priority Level
                  </label>
                  <select
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low (Minor aesthetic or routine)</option>
                    <option value="Medium">Medium (Affecting normal traffic/passage)</option>
                    <option value="High">High (Immediate health hazard or obstacle)</option>
                    <option value="Urgent">Urgent (Accident risk / emergency burst)</option>
                  </select>
                </div>
              </div>

              {/* Location Details */}
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-danger"></i> Location Details
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-secondary">
                    Street Address / Exact Location <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="e.g. Near Pole #42, Main Market Road, Sector 18"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-secondary">Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      className="form-control"
                      placeholder="e.g. Opposite Community Center"
                      value={formData.landmark}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small text-secondary">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold small text-secondary">Postal Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-control"
                      placeholder="e.g. 110001"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-secondary">
                  Detailed Description <span className="text-danger">*</span>
                </label>
                <textarea
                  name="description"
                  rows="4"
                  className="form-control"
                  placeholder="Describe the condition, how long the issue has persisted, and how it impacts residents..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              {/* Image Upload / Photo Proof */}
              <div className="mb-4">
                <label className="form-label fw-semibold small text-secondary">
                  Photographic Evidence (Upload File or Enter Image Link)
                </label>

                <div className="row g-2">
                  <div className="col-md-7">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <div className="form-text small">Upload JPG, PNG, WEBP (Max 5MB).</div>
                  </div>
                  <div className="col-md-5">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Or paste image URL"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        if (!imageFile) setImagePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Preview Image */}
                {imagePreview && (
                  <div className="mt-3 p-2 border rounded-3 bg-light d-inline-block">
                    <div className="small text-muted mb-1">Image Preview:</div>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded"
                      style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                      onError={() => setError('Unable to load preview from provided URL')}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link to="/citizen/dashboard" className="btn btn-civic-outline">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-civic-primary px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting Grievance...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill me-2"></i> Submit Grievance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewComplaint;
