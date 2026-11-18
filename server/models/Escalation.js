import mongoose from 'mongoose';

const escalationSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    escalationLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    escalatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Escalation = mongoose.model('Escalation', escalationSchema);
