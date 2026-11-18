import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Roads and potholes',
        'Water supply and leakage',
        'Garbage and sanitation',
        'Drainage and sewage',
        'Streetlights and electricity',
        'Public infrastructure',
        'Other civic issues',
      ],
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    isPublicInstitutionAffected: {
      type: Boolean,
      default: false,
    },
    publicInstitutionDetails: {
      type: String,
      trim: true,
      default: '',
    },
    // Priority Engine Fields
    priorityScore: {
      type: Number,
      required: true,
      default: 20,
    },
    priorityLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    priorityFactors: [
      {
        type: String,
      },
    ],
    priorityOverridden: {
      isOverridden: { type: Boolean, default: false },
      previousLevel: String,
      newLevel: String,
      previousScore: Number,
      newScore: Number,
      reason: String,
      overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      overriddenAt: Date,
    },
    // Location Details
    location: {
      address: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, default: 'Municipal Area' },
      pincode: { type: String, default: '' },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.2090 },
    },
    // Evidence Images
    beforeImage: {
      type: String,
      default: '',
    },
    afterImage: {
      type: String,
      default: '',
    },
    // Resolution Information
    resolutionRemarks: {
      type: String,
      default: '',
    },
    resolutionEvidence: {
      type: String,
      default: '',
    },
    resolutionSubmittedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    // Citizen Verification & Feedback
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
      submittedAt: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    // Relationships & Assignment
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
      default: null,
    },
    assignedOfficialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    // Status Workflow
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER REVIEW',
        'ASSIGNED',
        'IN PROGRESS',
        'RESOLUTION SUBMITTED',
        'CITIZEN VERIFICATION',
        'RESOLVED',
        'REOPENED',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    // Deadline & Escalation
    deadline: {
      type: Date,
      index: true,
    },
    targetResolutionHours: {
      type: Number,
      default: 48,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalationDetails: {
      level: { type: Number, default: 0 },
      reason: String,
      escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      escalatedAt: Date,
    },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);
