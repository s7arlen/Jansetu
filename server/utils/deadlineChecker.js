import { Complaint } from '../models/Complaint.js';
import { notifyAdmins, notifyDepartmentOfficials } from '../services/notificationService.js';

/**
 * Runs every 5 minutes.
 * Finds complaints whose deadline has passed and are not yet resolved.
 * Marks them isOverdue=true in the DB and fires notifications if newly overdue.
 */
export const startDeadlineChecker = () => {
  const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  const checkOverdue = async () => {
    try {
      const now = new Date();

      // Find complaints that are overdue but not yet flagged
      const newlyOverdue = await Complaint.find({
        status: { $nin: ['RESOLVED', 'REOPENED'] },
        deadline: { $lt: now },
        isOverdue: false,
      });

      if (newlyOverdue.length === 0) return;

      console.log(`[DeadlineChecker] ${newlyOverdue.length} newly overdue complaint(s) found.`);

      for (const complaint of newlyOverdue) {
        // Mark in DB
        complaint.isOverdue = true;
        await complaint.save();

        // Notify admins
        await notifyAdmins({
          complaintId: complaint._id,
          complaintCode: complaint.complaintId,
          title: `⚠️ Overdue: ${complaint.complaintId}`,
          message: `Complaint "${complaint.title}" has exceeded its ${complaint.targetResolutionHours}h resolution deadline. Priority: ${complaint.priorityLevel}. Immediate action required.`,
          type: 'danger',
        });

        // Notify department officials if assigned
        if (complaint.departmentId) {
          await notifyDepartmentOfficials({
            departmentId: complaint.departmentId,
            complaintId: complaint._id,
            complaintCode: complaint.complaintId,
            title: `⚠️ SLA Breach: ${complaint.complaintId}`,
            message: `Your department has exceeded the resolution deadline for complaint "${complaint.title}". Escalation risk: HIGH.`,
            type: 'danger',
          });
        }
      }
    } catch (err) {
      console.error('[DeadlineChecker] Error during overdue check:', err.message);
    }
  };

  // Run immediately on startup, then on interval
  checkOverdue();
  setInterval(checkOverdue, CHECK_INTERVAL_MS);
  console.log('[DeadlineChecker] Background SLA monitor started (5-minute interval).');
};
