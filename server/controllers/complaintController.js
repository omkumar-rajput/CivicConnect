// Complaint management controller
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      address,
      landmark,
      city,
      pincode,
      priority,
      imageUrl: bodyImageUrl,
    } = req.body;

    if (!title || !description || !category || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Category, Description, and Address',
      });
    }

    // Determine image URL: from uploaded file via multer or from string
    let finalImageUrl = '';
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (bodyImageUrl) {
      finalImageUrl = bodyImageUrl;
    }

    const newComplaint = new Complaint({
      title,
      description,
      category,
      location: {
        address,
        landmark: landmark || '',
        city: city || 'City Center',
        pincode: pincode || '',
      },
      imageUrl: finalImageUrl,
      priority: priority || 'Medium',
      status: 'Submitted',
      citizen: req.user._id,
      statusHistory: [
        {
          status: 'Submitted',
          remarks: 'Complaint lodged by citizen',
          updatedBy: req.user._id,
          updatedByName: req.user.name,
          updatedAt: new Date(),
        },
      ],
    });

    const savedComplaint = await newComplaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully!',
      complaint: savedComplaint,
    });
  } catch (error) {
    console.error('[Create Complaint Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit complaint',
    });
  }
};

// @desc    Get all complaints created by logged in citizen
// @route   GET /api/complaints/my
// @access  Private (Citizen)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .populate('assignedOfficer', 'name email phone department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('[Get My Complaints Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your complaints',
    });
  }
};

// @desc    Get all complaints (with filtering and search) for Admin / Officer
// @route   GET /api/complaints
// @access  Private (Officer, Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, search, assignedToMe } = req.query;

    const filter = {};

    // Filter by status
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Filter by category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      filter.priority = priority;
    }

    // If an officer specifically requests only complaints assigned to them
    if (req.user.role === 'officer' && (assignedToMe === 'true' || assignedToMe === true)) {
      filter.assignedOfficer = req.user._id;
    }

    // Keyword search over title, description, address, complaintId
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { 'location.address': searchRegex },
        { 'location.landmark': searchRegex },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name email phone department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('[Get All Complaints Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints list',
    });
  }
};

// @desc    Get a single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name email phone department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Citizen can only view their own complaint; officers and admins can view any
    if (
      req.user.role === 'citizen' &&
      complaint.citizen._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this complaint',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('[Get Complaint Details Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint details',
    });
  }
};

// @desc    Assign complaint to an officer
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin)
exports.assignOfficer = async (req, res) => {
  try {
    const { officerId, remarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    let officerName = 'Unassigned';
    if (officerId) {
      const officer = await User.findById(officerId);
      if (!officer || officer.role !== 'officer') {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not a valid municipal officer',
        });
      }
      officerName = officer.name;
      complaint.assignedOfficer = officerId;
      if (complaint.status === 'Submitted' || complaint.status === 'Pending') {
        complaint.status = 'Assigned';
      }
    } else {
      complaint.assignedOfficer = null;
    }

    const historyRemarks = remarks || `Assigned to Officer ${officerName} by Administrator`;
    complaint.statusHistory.push({
      status: complaint.status,
      remarks: historyRemarks,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      updatedAt: new Date(),
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name email phone department');

    res.status(200).json({
      success: true,
      message: `Complaint successfully assigned to ${officerName}`,
      complaint: updated,
    });
  } catch (error) {
    console.error('[Assign Officer Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign officer',
    });
  }
};

// @desc    Update complaint status and resolution remarks
// @route   PUT /api/complaints/:id/status
// @access  Private (Officer, Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // If an officer is updating, verify if assigned to them or if admin
    if (
      req.user.role === 'officer' &&
      complaint.assignedOfficer &&
      complaint.assignedOfficer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update complaints assigned to your department/account',
      });
    }

    complaint.status = status;

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      if (remarks) {
        complaint.resolutionRemarks = remarks;
      }
    }

    complaint.statusHistory.push({
      status,
      remarks: remarks || `Status transitioned to ${status}`,
      updatedBy: req.user._id,
      updatedByName: `${req.user.name} (${req.user.role.toUpperCase()})`,
      updatedAt: new Date(),
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('citizen', 'name email phone')
      .populate('assignedOfficer', 'name email phone department');

    res.status(200).json({
      success: true,
      message: `Status updated to "${status}" successfully`,
      complaint: updated,
    });
  } catch (error) {
    console.error('[Update Status Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update status',
    });
  }
};

// @desc    Citizen feedback and rating submission
// @route   POST /api/complaints/:id/feedback
// @access  Private (Citizen)
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5 stars',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Verify citizen ownership
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own complaints',
      });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted after the complaint is resolved',
      });
    }

    complaint.feedback = {
      rating: Number(rating),
      comment: comment ? comment.trim() : '',
      submittedAt: new Date(),
    };

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      complaint,
    });
  } catch (error) {
    console.error('[Submit Feedback Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
    });
  }
};

// @desc    Delete complaint (Admin only)
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
    });
  }
};
