const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  assignOfficer,
  updateStatus,
  submitFeedback,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Base complaints routes
router
  .route('/')
  .post(protect, authorize('citizen'), upload.single('image'), createComplaint)
  .get(protect, authorize('officer', 'admin'), getAllComplaints);

// My complaints (citizen)
router.get('/my', protect, authorize('citizen'), getMyComplaints);

// Single complaint by ID
router
  .route('/:id')
  .get(protect, getComplaintById)
  .delete(protect, authorize('admin'), deleteComplaint);

// Assign officer to complaint (Admin only)
router.put('/:id/assign', protect, authorize('admin'), assignOfficer);

// Update status & resolution remarks (Officer & Admin)
router.put('/:id/status', protect, authorize('officer', 'admin'), updateStatus);

// Submit citizen rating/feedback (Citizen only)
router.post('/:id/feedback', protect, authorize('citizen'), submitFeedback);

module.exports = router;
