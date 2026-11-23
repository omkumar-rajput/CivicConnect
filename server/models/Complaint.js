// Complaint model tracking grievance lifecycle
const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedByName: {
      type: String,
      default: '',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a complaint category'],
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Street address or location is required'],
        trim: true,
      },
      landmark: {
        type: String,
        trim: true,
        default: '',
      },
      city: {
        type: String,
        trim: true,
        default: 'City Center',
      },
      pincode: {
        type: String,
        trim: true,
        default: '',
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: [statusHistorySchema],
    resolutionRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    feedback: feedbackSchema,
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate readable complaintId like CC-1024 if not set
complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now().toString().slice(-4);
    this.complaintId = `CC-${timestamp}${randomDigits.toString().slice(0, 2)}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
