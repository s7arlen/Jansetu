import bcrypt from 'bcryptjs';
import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { Escalation } from '../models/Escalation.js';
import { ComplaintHistory } from '../models/ComplaintHistory.js';
import {
  createNotification,
  notifyDepartmentOfficials,
} from '../services/notificationService.js';

// @desc    Get admin dashboard aggregated live statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const newComplaints = await Complaint.countDocuments({ status: 'SUBMITTED' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'IN PROGRESS' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });
    const reopenedComplaints = await Complaint.countDocuments({ status: 'REOPENED' });
    const verificationComplaints = await Complaint.countDocuments({ status: 'CITIZEN VERIFICATION' });
    const pendingComplaints = totalComplaints - resolvedComplaints;

    const criticalPriorityComplaints = await Complaint.countDocuments({
      priorityLevel: 'Critical',
      status: { $ne: 'RESOLVED' },
    });

    const now = new Date();
    const overdueCount = await Complaint.countDocuments({
      status: { $ne: 'RESOLVED' },
      deadline: { $lt: now },
    });

    // Priority Distribution
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priorityLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    // Status Distribution
    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Category Distribution
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent activity (latest 8 complaints)
    const recentComplaints = await Complaint.find()
      .populate('citizenId', 'name')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .limit(8);

    // Total Users
    const totalCitizens = await User.countDocuments({ role: 'citizen' });
    const totalOfficials = await User.countDocuments({ role: 'official' });
    const totalDepartments = await Department.countDocuments();

    return res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        newComplaints,
        pendingComplaints,
        inProgressComplaints,
        verificationComplaints,
        resolvedComplaints,
        reopenedComplaints,
        criticalPriorityComplaints,
        overdueCount,
        resolutionRate:
          totalComplaints > 0
            ? Math.round((resolvedComplaints / totalComplaints) * 100)
            : 0,
        totalCitizens,
        totalOfficials,
        totalDepartments,
        priorityStats,
        statusStats,
        categoryStats,
        recentComplaints,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin stats.',
      error: error.message,
    });
  }
};

// @desc    Get detailed administrative analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Department Performance breakdown
    const departments = await Department.find();
    const departmentPerformance = await Promise.all(
      departments.map(async (dept) => {
        const assigned = await Complaint.countDocuments({ departmentId: dept._id });
        const resolved = await Complaint.countDocuments({
          departmentId: dept._id,
          status: 'RESOLVED',
        });
        const overdue = await Complaint.countDocuments({
          departmentId: dept._id,
          status: { $ne: 'RESOLVED' },
          deadline: { $lt: new Date() },
        });

        // Calculate average resolution time in hours
        const resolvedList = await Complaint.find({
          departmentId: dept._id,
          status: 'RESOLVED',
          resolvedAt: { $ne: null },
        });

        let avgHours = 0;
        if (resolvedList.length > 0) {
          const totalDuration = resolvedList.reduce((acc, curr) => {
            const diff =
              (new Date(curr.resolvedAt).getTime() -
                new Date(curr.createdAt).getTime()) /
              (1000 * 60 * 60);
            return acc + (diff > 0 ? diff : 1);
          }, 0);
          avgHours = Math.round((totalDuration / resolvedList.length) * 10) / 10;
        }

        return {
          id: dept._id,
          name: dept.name,
          code: dept.code,
          assigned,
          resolved,
          overdue,
          resolutionRate: assigned > 0 ? Math.round((resolved / assigned) * 100) : 0,
          avgResolutionHours: avgHours,
        };
      })
    );

    // 2. Monthly Trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          submitted: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthlyAggregation.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      submitted: m.submitted,
      resolved: m.resolved,
    }));

    return res.status(200).json({
      success: true,
      departmentPerformance,
      monthlyTrends,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load analytics.',
      error: error.message,
    });
  }
};

// @desc    Get all overdue complaints
// @route   GET /api/admin/overdue
// @access  Private (Admin)
export const getOverdueComplaints = async (req, res) => {
  try {
    const now = new Date();
    const overdueComplaints = await Complaint.find({
      status: { $ne: 'RESOLVED' },
      deadline: { $lt: now },
    })
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('assignedOfficialId', 'name email phone')
      .sort({ deadline: 1 });

    return res.status(200).json({
      success: true,
      count: overdueComplaints.length,
      complaints: overdueComplaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue complaints.',
      error: error.message,
    });
  }
};

// @desc    Escalate a complaint
// @route   POST /api/admin/escalate
// @access  Private (Admin)
export const escalateComplaint = async (req, res) => {
  try {
    const { complaintId, reason, level = 1 } = req.body;

    if (!complaintId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and escalation reason are required.',
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const nextLevel = Math.min(3, (complaint.escalationDetails?.level || 0) + 1);

    complaint.isEscalated = true;
    complaint.escalationDetails = {
      level: nextLevel,
      reason: reason.trim(),
      escalatedBy: req.user._id,
      escalatedAt: new Date(),
    };

    await complaint.save();

    // Log escalation record
    await Escalation.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      reason: reason.trim(),
      escalationLevel: nextLevel,
      escalatedBy: req.user._id,
    });

    // Add to ComplaintHistory
    await ComplaintHistory.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      updatedBy: req.user._id,
      updaterRole: 'admin',
      remarks: `ADMIN ESCALATION [Level ${nextLevel}]: ${reason}`,
    });

    // Notify Department Officials
    if (complaint.departmentId) {
      await notifyDepartmentOfficials({
        departmentId: complaint.departmentId,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        title: `URGENT: Complaint ${complaint.complaintId} Escalated to Level ${nextLevel}`,
        message: `Administrative escalation triggered: "${reason}". Immediate intervention requested.`,
        type: 'danger',
      });
    }

    // Notify Citizen
    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: 'Complaint Escalated to Senior Oversight',
      message: `Your complaint has been escalated (Level ${nextLevel}) for expedited resolution by municipal leadership.`,
      type: 'warning',
    });

    return res.status(200).json({
      success: true,
      message: `Complaint ${complaint.complaintId} escalated to Level ${nextLevel}.`,
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to escalate complaint.',
      error: error.message,
    });
  }
};

// @desc    Get all users list (citizens & officials)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
};

// @desc    Admin creates a new official or admin account
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, departmentId, designation } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['official', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Admin can only create "official" or "admin" roles.',
      });
    }

    if (role === 'official' && !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for official accounts.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role,
      departmentId: role === 'official' ? departmentId : undefined,
      designation: designation || '',
    });

    const populated = await User.findById(user._id)
      .select('-password')
      .populate('departmentId', 'name code');

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
      error: error.message,
    });
  }
};
