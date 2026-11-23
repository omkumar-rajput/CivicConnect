const express = require('express');
const router = express.Router();
const {
  getUsers,
  createOfficer,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes are restricted to Administrator
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post('/officer', createOfficer);
router.put('/:id/toggle-status', toggleUserStatus);

module.exports = router;
