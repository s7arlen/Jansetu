import { Complaint } from '../models/Complaint.js';
import { Department } from '../models/Department.js';

// @desc    Get aggregated public statistics for JANSETU
// @route   GET /api/public/statistics
// @access  Public
export const getPublicStatistics = async (req, res) => {
  try {
    const totalSubmitted = await Complaint.countDocuments();
    const totalResolved = await Complaint.countDocuments({ status: 'RESOLVED' });
    const inProgress = await Complaint.countDocuments({ status: 'IN PROGRESS' });
    const citizenVerification = await Complaint.countDocuments({ status: 'CITIZEN VERIFICATION' });
    const pending = totalSubmitted - totalResolved;

    const now = new Date();
    const overdueCount = await Complaint.countDocuments({
      status: { $ne: 'RESOLVED' },
      deadline: { $lt: now },
    });

    // Average resolution time (hours)
    const resolvedComplaints = await Complaint.find({
      status: 'RESOLVED',
      resolvedAt: { $ne: null },
    }).select('createdAt resolvedAt');

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const sum = resolvedComplaints.reduce((acc, c) => {
        const diff = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
        return acc + (diff > 0 ? diff : 1);
      }, 0);
      avgResolutionHours = Math.round((sum / resolvedComplaints.length) * 10) / 10;
    }

    // Category-wise distribution
    const categoryDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Priority-wise distribution
    const priorityDistribution = await Complaint.aggregate([
      {
        $group: {
          _id: '$priorityLevel',
          count: { $sum: 1 },
        },
      },
    ]);

    // Department Performance
    const departments = await Department.find().select('name code');
    const departmentPerformance = await Promise.all(
      departments.map(async (dept) => {
        const total = await Complaint.countDocuments({ departmentId: dept._id });
        const resolved = await Complaint.countDocuments({
          departmentId: dept._id,
          status: 'RESOLVED',
        });
        const overdue = await Complaint.countDocuments({
          departmentId: dept._id,
          status: { $ne: 'RESOLVED' },
          deadline: { $lt: now },
        });

        return {
          id: dept._id,
          name: dept.name,
          code: dept.code,
          total,
          resolved,
          overdue,
          rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        };
      })
    );

    // Monthly trends (computed dynamically)
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
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      submitted: m.submitted,
      resolved: m.resolved,
    }));

    // Geo heatmap points (without exposing private addresses or names)
    const geoPoints = await Complaint.find({
      'location.latitude': { $ne: null },
      'location.longitude': { $ne: null },
    })
      .select('complaintId category severity priorityLevel status location.latitude location.longitude location.city')
      .limit(100);

    return res.status(200).json({
      success: true,
      stats: {
        totalSubmitted,
        totalResolved,
        inProgress,
        citizenVerification,
        pending,
        overdueCount,
        resolutionRate: totalSubmitted > 0 ? Math.round((totalResolved / totalSubmitted) * 100) : 0,
        avgResolutionHours,
        categoryDistribution,
        priorityDistribution,
        departmentPerformance,
        monthlyTrends,
        geoPoints,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public statistics.',
      error: error.message,
    });
  }
};

// @desc    Get public departments list
// @route   GET /api/public/departments
// @access  Public
export const getPublicDepartments = async (req, res) => {
  try {
    const departments = await Department.find().select('name code description icon defaultCategories');
    return res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public departments.',
      error: error.message,
    });
  }
};
