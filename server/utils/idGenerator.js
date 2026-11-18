import { Counter } from '../models/Counter.js';

/**
 * Generates an atomic, collision-free complaint ID like JAN-2026-00001
 */
export const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const counterName = `complaint_${currentYear}`;

  const counter = await Counter.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedSeq = String(counter.seq).padStart(5, '0');
  return `JAN-${currentYear}-${paddedSeq}`;
};
