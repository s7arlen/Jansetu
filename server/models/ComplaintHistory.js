import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    complaintCode: {
      type: String,
      required: true,
    },
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updaterRole: {
      type: String,
      default: 'citizen',
    },
    remarks: {
      type: String,
      default: '',
    },
    evidence: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);
