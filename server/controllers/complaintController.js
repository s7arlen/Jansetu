import { Complaint } from '../models/Complaint.js';
import { ComplaintHistory } from '../models/ComplaintHistory.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { generateComplaintId } from '../utils/idGenerator.js';
import { calculatePriority, suggestDepartment, PRIORITY_DEADLINES_HOURS } from '../utils/priorityEngine.js';
import {
  createNotification,
  notifyAdmins,
  notifyDepartmentOfficials,
} from '../services/notificationService.js';

// Valid workflow transitions
const ALLOWED_TRANSITIONS = {
  SUBMITTED: ['UNDER REVIEW', 'ASSIGNED'],
  'UNDER REVIEW': ['ASSIGNED', 'IN PROGRESS'],
  ASSIGNED: ['IN PROGRESS', 'UNDER REVIEW'],
  'IN PROGRESS': ['RESOLUTION SUBMITTED', 'CITIZEN VERIFICATION'],
  'RESOLUTION SUBMITTED': ['CITIZEN VERIFICATION', 'RESOLVED', 'REOPENED'],
  'CITIZEN VERIFICATION': ['RESOLVED', 'REOPENED'],
  RESOLVED: ['REOPENED'],
  REOPENED: ['UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS'],
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      isPublicInstitutionAffected,
      publicInstitutionDetails,
      address,
      landmark,
      city,
      pincode,
      latitude,
      longitude,
    } = req.body;

    if (!title || !description || !category || !severity || !address) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, severity, and address are required.',
      });
    }

    const complaintId = await generateComplaintId();

    const isPublicInst =
      isPublicInstitutionAffected === 'true' ||
      isPublicInstitutionAffected === true;

    // Calculate initial transparent rule-based priority
    const priorityData = calculatePriority({
      severity,
      isPublicInstitutionAffected: isPublicInst,
      createdAt: new Date(),
    });

    // Auto-suggest department based on category
    const suggestedDeptName = suggestDepartment(category);
    const matchedDept = await Department.findOne({
      name: new RegExp(`^${suggestedDeptName}$`, 'i'),
    });

    let beforeImagePath = '';
    if (req.file) {
      // Cloudinary returns req.file.path as full URL; local disk uses filename
      beforeImagePath = req.file.path || `/uploads/${req.file.filename}`;
    }

    const deadline = new Date(Date.now() + priorityData.targetHours * 60 * 60 * 1000);

    const complaint = await Complaint.create({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      isPublicInstitutionAffected: isPublicInst,
      publicInstitutionDetails: publicInstitutionDetails || '',
      priorityScore: priorityData.score,
      priorityLevel: priorityData.level,
      priorityFactors: priorityData.factors,
      location: {
        address: address.trim(),
        landmark: landmark ? landmark.trim() : '',
        city: city ? city.trim() : 'Municipal Area',
        pincode: pincode ? pincode.trim() : '',
        latitude: latitude ? parseFloat(latitude) : 28.6139,
        longitude: longitude ? parseFloat(longitude) : 77.2090,
      },
      beforeImage: beforeImagePath,
      citizenId: req.user._id,
      departmentId: matchedDept ? matchedDept._id : null,
      status: 'SUBMITTED',
      targetResolutionHours: priorityData.targetHours,
      deadline,
    });

    // Create Initial Audit History
    await ComplaintHistory.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      previousStatus: '',
      newStatus: 'SUBMITTED',
      updatedBy: req.user._id,
      updaterRole: 'citizen',
      remarks: 'Complaint registered by citizen with rule-based priority assessment.',
      evidence: beforeImagePath,
    });

    // In-app Notification for Citizen
    await createNotification({
      userId: req.user._id,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: 'Complaint Registered',
      message: `Your complaint (${complaint.complaintId}) has been successfully logged with ${complaint.priorityLevel} priority.`,
      type: 'success',
    });

    // Notify Admins
    await notifyAdmins({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: 'New Civic Complaint Submitted',
      message: `New complaint ${complaint.complaintId} in "${category}" requires review/assignment. Priority: ${complaint.priorityLevel}.`,
      type: complaint.priorityLevel === 'Critical' ? 'danger' : 'info',
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('assignedOfficialId', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint: populatedComplaint,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint.',
      error: error.message,
    });
  }
};

// @desc    Get current citizen's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id })
      .populate('departmentId', 'name code')
      .populate('assignedOfficialId', 'name phone')
      .sort({ createdAt: -1 });

    // Check overdue flag dynamically
    const now = new Date();
    const updated = complaints.map((c) => {
      const isPast = c.deadline && now > new Date(c.deadline) && c.status !== 'RESOLVED';
      return {
        ...c.toObject(),
        isOverdue: isPast,
      };
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching complaints.',
      error: error.message,
    });
  }
};

// @desc    Get complaint details by ID (with history)
// @route   GET /api/complaints/:id
// @access  Private (Citizen, Admin, Official)
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    let query = { _id: id };
    // Check if ID is a complaint code format (e.g., JAN-2026-00001)
    if (id.startsWith('JAN-')) {
      query = { complaintId: id };
    }

    const complaint = await Complaint.findOne(query)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code description contactEmail contactPhone')
      .populate('assignedOfficialId', 'name email phone designation')
      .populate('priorityOverridden.overriddenBy', 'name role')
      .populate('escalationDetails.escalatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Authorization checks
    if (req.user.role === 'citizen') {
      if (complaint.citizenId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: You cannot view complaints filed by other citizens.',
        });
      }
    } else if (req.user.role === 'official') {
      // Officials can only view complaints assigned to their department
      if (
        !req.user.departmentId ||
        !complaint.departmentId ||
        complaint.departmentId._id.toString() !== req.user.departmentId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: Complaint does not belong to your department.',
        });
      }
    }

    // Get audit history
    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .populate('updatedBy', 'name role designation')
      .sort({ timestamp: 1 });

    const isPastDeadline =
      complaint.deadline &&
      new Date() > new Date(complaint.deadline) &&
      complaint.status !== 'RESOLVED';

    const complaintObj = complaint.toObject();
    complaintObj.isOverdue = isPastDeadline;

    return res.status(200).json({
      success: true,
      complaint: complaintObj,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching complaint details.',
      error: error.message,
    });
  }
};

// @desc    Get all complaints with filters, search, and pagination
// @route   GET /api/complaints
// @access  Private (Admin, Official)
export const getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      severity,
      priorityLevel,
      departmentId,
      search,
      isOverdue,
      isEscalated,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = {};

    // Role enforcement
    if (req.user.role === 'official') {
      if (!req.user.departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Official has no associated department.',
        });
      }
      filter.departmentId = req.user.departmentId;
    } else if (departmentId && req.user.role === 'admin') {
      filter.departmentId = departmentId;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (priorityLevel) filter.priorityLevel = priorityLevel;
    if (isEscalated === 'true') filter.isEscalated = true;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { complaintId: searchRegex },
        { title: searchRegex },
        { 'location.address': searchRegex },
        { 'location.city': searchRegex },
      ];
    }

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email phone')
      .populate('departmentId', 'name code')
      .populate('assignedOfficialId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    // Compute dynamic overdue flag
    const now = new Date();
    const complaintsWithOverdue = complaints.map((c) => {
      const overdue = c.deadline && now > new Date(c.deadline) && c.status !== 'RESOLVED';
      return {
        ...c.toObject(),
        isOverdue: overdue,
      };
    });

    const finalComplaints =
      isOverdue === 'true'
        ? complaintsWithOverdue.filter((c) => c.isOverdue)
        : complaintsWithOverdue;

    return res.status(200).json({
      success: true,
      count: finalComplaints.length,
      total,
      page: parseInt(page),
      complaints: finalComplaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching complaints.',
      error: error.message,
    });
  }
};

// @desc    Assign or reassign complaint to department & official
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin)
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentId, officialId, remarks } = req.body;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required for assignment.',
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    let official = null;
    if (officialId) {
      official = await User.findById(officialId);
      if (!official || official.role !== 'official') {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not a valid department official.',
        });
      }
    }

    const previousStatus = complaint.status;
    complaint.departmentId = departmentId;
    complaint.assignedOfficialId = officialId || null;
    complaint.status = 'ASSIGNED';

    // Recalculate or refresh deadline from assignment time
    const targetHours =
      PRIORITY_DEADLINES_HOURS[complaint.priorityLevel] || 48;
    complaint.targetResolutionHours = targetHours;
    complaint.deadline = new Date(Date.now() + targetHours * 60 * 60 * 1000);

    await complaint.save();

    // Create Audit History
    const assignmentNote = official
      ? `Assigned to ${department.name} (Official: ${official.name}). ${remarks || ''}`
      : `Assigned to ${department.name}. ${remarks || ''}`;

    await ComplaintHistory.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      previousStatus,
      newStatus: 'ASSIGNED',
      updatedBy: req.user._id,
      updaterRole: 'admin',
      remarks: assignmentNote,
    });

    // Notify Citizen
    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: 'Complaint Assigned',
      message: `Your complaint has been assigned to ${department.name} for resolution.`,
      type: 'info',
    });

    // Notify Assigned Official or Department
    if (officialId) {
      await createNotification({
        userId: officialId,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        title: 'New Complaint Assigned to You',
        message: `Complaint ${complaint.complaintId} has been designated to you. Target resolution: ${targetHours} hours.`,
        type: 'warning',
      });
    } else {
      await notifyDepartmentOfficials({
        departmentId: department._id,
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        title: 'New Department Assignment',
        message: `Complaint ${complaint.complaintId} has been assigned to your department.`,
        type: 'info',
      });
    }

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('departmentId', 'name code')
      .populate('assignedOfficialId', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Complaint successfully assigned.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to assign complaint.',
      error: error.message,
    });
  }
};

// @desc    Update complaint status workflow
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin, Official)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Role check for officials
    if (req.user.role === 'official') {
      if (
        !complaint.departmentId ||
        complaint.departmentId.toString() !== req.user.departmentId?.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Officials can only update status for complaints in their department.',
        });
      }
    }

    const currentStatus = complaint.status;

    // Validate workflow transition
    const validNextStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!validNextStatuses.includes(status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${status}". Allowed: ${validNextStatuses.join(', ')}`,
      });
    }

    complaint.status = status;
    if (status === 'IN PROGRESS' && !complaint.assignedOfficialId && req.user.role === 'official') {
      complaint.assignedOfficialId = req.user._id;
    }
    await complaint.save();

    // Create Audit History
    await ComplaintHistory.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      previousStatus: currentStatus,
      newStatus: status,
      updatedBy: req.user._id,
      updaterRole: req.user.role,
      remarks: remarks || `Status changed from ${currentStatus} to ${status}`,
    });

    // Notify citizen
    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: `Complaint Status Updated: ${status}`,
      message: `Your complaint (${complaint.complaintId}) is now ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`,
      type: status === 'RESOLVED' ? 'success' : 'info',
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}.`,
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update status.',
      error: error.message,
    });
  }
};

// @desc    Submit resolution evidence (Official)
// @route   POST /api/complaints/:id/evidence
// @access  Private (Department Official, Admin)
export const submitResolutionEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionRemarks, resolutionEvidence } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (req.user.role === 'official') {
      if (
        !complaint.departmentId ||
        complaint.departmentId.toString() !== req.user.departmentId?.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only submit resolution for complaints in your department.',
        });
      }
    }

    let afterImagePath = complaint.afterImage || '';
    if (req.file) {
      afterImagePath = req.file.path || `/uploads/${req.file.filename}`;
    }

    const previousStatus = complaint.status;
    complaint.afterImage = afterImagePath;
    complaint.resolutionRemarks = resolutionRemarks || 'Work completed as reported.';
    complaint.resolutionEvidence = resolutionEvidence || '';
    complaint.resolutionSubmittedAt = new Date();
    // Move to citizen verification state
    complaint.status = 'CITIZEN VERIFICATION';

    await complaint.save();

    // Audit Log
    await ComplaintHistory.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      previousStatus,
      newStatus: 'CITIZEN VERIFICATION',
      updatedBy: req.user._id,
      updaterRole: req.user.role,
      remarks: `Resolution submitted by official. Remarks: ${resolutionRemarks || 'Completed'}. Awaiting citizen verification.`,
      evidence: afterImagePath,
    });

    // Notify Citizen to verify
    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: 'Resolution Submitted - Verification Required',
      message: `The department has completed work on your complaint (${complaint.complaintId}). Please inspect the photographic evidence and confirm resolution or request reopening.`,
      type: 'warning',
    });

    return res.status(200).json({
      success: true,
      message: 'Resolution evidence submitted. Complaint forwarded for citizen verification.',
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit resolution evidence.',
      error: error.message,
    });
  }
};

// @desc    Citizen verifies resolution (Confirm or Reject/Reopen)
// @route   POST /api/complaints/:id/verify
// @access  Private (Citizen owner only)
export const verifyResolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rating, comment, rejectionReason } = req.body; // action: 'CONFIRM' or 'REJECT'

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Must be the owner citizen
    if (complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the citizen who filed this complaint can verify its resolution.',
      });
    }

    const previousStatus = complaint.status;

    if (action === 'CONFIRM') {
      complaint.status = 'RESOLVED';
      complaint.resolvedAt = new Date();
      complaint.citizenFeedback = {
        rating: rating ? parseInt(rating) : 5,
        comment: comment ? comment.trim() : 'Satisfied with resolution.',
        submittedAt: new Date(),
      };

      await complaint.save();

      // Audit History
      await ComplaintHistory.create({
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        previousStatus,
        newStatus: 'RESOLVED',
        updatedBy: req.user._id,
        updaterRole: 'citizen',
        remarks: `Resolution confirmed by citizen. Rating: ${rating || 5}/5. Feedback: "${comment || 'Satisfied'}"`,
      });

      // Notify Assigned Official
      if (complaint.assignedOfficialId) {
        await createNotification({
          userId: complaint.assignedOfficialId,
          complaintId: complaint._id,
          complaintCode: complaint.complaintId,
          title: 'Complaint Resolved & Confirmed',
          message: `Citizen has verified and confirmed the resolution of complaint ${complaint.complaintId}.`,
          type: 'success',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Thank you! The complaint has been successfully resolved and archived.',
        complaint,
      });
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a reason for rejecting the resolution and reopening the complaint.',
        });
      }

      complaint.status = 'REOPENED';
      complaint.rejectionReason = rejectionReason.trim();

      await complaint.save();

      // Audit History
      await ComplaintHistory.create({
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        previousStatus,
        newStatus: 'REOPENED',
        updatedBy: req.user._id,
        updaterRole: 'citizen',
        remarks: `Citizen rejected resolution and reopened complaint. Reason: "${rejectionReason}"`,
      });

      // Notify Admins & Official
      await notifyAdmins({
        complaintId: complaint._id,
        complaintCode: complaint.complaintId,
        title: 'Complaint Reopened by Citizen',
        message: `Complaint ${complaint.complaintId} was rejected by citizen: "${rejectionReason}"`,
        type: 'danger',
      });

      if (complaint.assignedOfficialId) {
        await createNotification({
          userId: complaint.assignedOfficialId,
          complaintId: complaint._id,
          complaintCode: complaint.complaintId,
          title: 'Resolution Rejected - Complaint Reopened',
          message: `Citizen disputed the resolution of ${complaint.complaintId}. Reason: "${rejectionReason}"`,
          type: 'danger',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Complaint has been reopened for further investigation and corrective action.',
        complaint,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be either CONFIRM or REJECT.',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify resolution.',
      error: error.message,
    });
  }
};

// @desc    Admin overrides priority with documented reason
// @route   PATCH /api/complaints/:id/priority
// @access  Private (Admin only)
export const overridePriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priorityLevel, reason } = req.body;

    if (!priorityLevel || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Both priorityLevel and a valid justification reason are required.',
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const previousLevel = complaint.priorityLevel;
    const previousScore = complaint.priorityScore;

    const scoreMap = {
      Critical: 55,
      High: 40,
      Medium: 25,
      Low: 10,
    };
    const newScore = scoreMap[priorityLevel] || 30;

    complaint.priorityLevel = priorityLevel;
    complaint.priorityScore = newScore;
    complaint.priorityOverridden = {
      isOverridden: true,
      previousLevel,
      newLevel: priorityLevel,
      previousScore,
      newScore,
      reason: reason.trim(),
      overriddenBy: req.user._id,
      overriddenAt: new Date(),
    };

    // Recalculate deadline
    const newTargetHours = PRIORITY_DEADLINES_HOURS[priorityLevel] || 48;
    complaint.targetResolutionHours = newTargetHours;
    complaint.deadline = new Date(Date.now() + newTargetHours * 60 * 60 * 1000);

    await complaint.save();

    // Log History
    await ComplaintHistory.create({
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      previousStatus: complaint.status,
      newStatus: complaint.status,
      updatedBy: req.user._id,
      updaterRole: 'admin',
      remarks: `Priority overridden from ${previousLevel} to ${priorityLevel}. Justification: "${reason}"`,
    });

    // Notify citizen
    await createNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      complaintCode: complaint.complaintId,
      title: 'Priority Updated by Municipal Administration',
      message: `Priority for complaint ${complaint.complaintId} changed to ${priorityLevel}. Reason: ${reason}`,
      type: 'info',
    });

    return res.status(200).json({
      success: true,
      message: 'Priority overridden successfully.',
      complaint,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to override priority.',
      error: error.message,
    });
  }
};

// @desc    Public tracking search by Complaint ID
// @route   GET /api/public/track/:complaintId
// @access  Public
export const searchPublicTrack = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findOne({
      complaintId: complaintId.trim().toUpperCase(),
    })
      .populate('departmentId', 'name code')
      .select(
        'complaintId title description category severity priorityLevel priorityScore priorityReason priorityFactors status deadline createdAt resolvedAt beforeImage afterImage resolutionRemarks resolutionEvidence isOverdue isEscalated location'
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `No complaint found with tracking code: ${complaintId}`,
      });
    }

    const history = await ComplaintHistory.find({ complaintId: complaint._id })
      .select('previousStatus newStatus updaterRole remarks timestamp evidence')
      .sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      complaint,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Tracking search failed.',
      error: error.message,
    });
  }
};
