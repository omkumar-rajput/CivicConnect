// User management controller for Administrators
const User = require('../models/User');

// @desc    Get all users (with optional role filter)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && ['citizen', 'officer', 'admin'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users list',
    });
  }
};

// @desc    Create a new Municipal Officer account
// @route   POST /api/users/officer
// @access  Private (Admin)
exports.createOfficer = async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and department are required',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const officer = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'officer',
      department,
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: 'Municipal Officer registered successfully',
      officer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create officer account',
    });
  }
};

// @desc    Toggle user active/inactive status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Protect the current admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    user.active = !user.active;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.active ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change user account status',
    });
  }
};
