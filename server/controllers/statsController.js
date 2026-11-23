// Dashboard statistics and analytics controller
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get grievance summary analytics
// @route   GET /api/stats/dashboard
// @access  Private (Officer, Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const isOfficer = req.user.role === 'officer';
    const officerFilter = isOfficer ? { assignedOfficer: req.user._id } : {};

    // Total counts
    const totalComplaints = await Complaint.countDocuments(officerFilter);
    const pendingCount = await Complaint.countDocuments({
      ...officerFilter,
      status: { $in: ['Submitted', 'Pending'] },
    });
    const assignedCount = await Complaint.countDocuments({
      ...officerFilter,
      status: 'Assigned',
    });
    const inProgressCount = await Complaint.countDocuments({
      ...officerFilter,
      status: 'In Progress',
    });
    const resolvedCount = await Complaint.countDocuments({
      ...officerFilter,
      status: 'Resolved',
    });

    // Breakdown by Category
    const categoryAggregation = await Complaint.aggregate([
      ...(isOfficer ? [{ $match: { assignedOfficer: req.user._id } }] : []),
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by Status
    const statusAggregation = await Complaint.aggregate([
      ...(isOfficer ? [{ $match: { assignedOfficer: req.user._id } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // User counts for admin
    let userStats = null;
    if (req.user.role === 'admin') {
      const citizenCount = await User.countDocuments({ role: 'citizen' });
      const officerCount = await User.countDocuments({ role: 'officer' });
      userStats = { citizenCount, officerCount };
    }

    // Recent 5 complaints
    const recentComplaints = await Complaint.find(officerFilter)
      .populate('citizen', 'name email')
      .populate('assignedOfficer', 'name department')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total: totalComplaints,
        pending: pendingCount,
        assigned: assignedCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        resolutionRate:
          totalComplaints > 0
            ? Math.round((resolvedCount / totalComplaints) * 100)
            : 0,
        byCategory: categoryAggregation.map((c) => ({
          category: c._id,
          count: c.count,
        })),
        byStatus: statusAggregation.map((s) => ({
          status: s._id,
          count: s.count,
        })),
        userStats,
        recentComplaints,
      },
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard metrics',
    });
  }
};
