import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { Complaint } from '../models/Complaint.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public / Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    // Attach active complaint counts to each department
    const deptsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const totalAssigned = await Complaint.countDocuments({ departmentId: dept._id });
        const resolvedCount = await Complaint.countDocuments({
          departmentId: dept._id,
          status: 'RESOLVED',
        });
        const pendingCount = totalAssigned - resolvedCount;

        const officials = await User.find({
          role: 'official',
          departmentId: dept._id,
        }).select('name email phone designation');

        return {
          ...dept.toObject(),
          totalAssigned,
          resolvedCount,
          pendingCount,
          officials,
        };
      })
    );

    return res.status(200).json({
      success: true,
      departments: deptsWithStats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch departments.',
      error: error.message,
    });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public / Private
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    const officials = await User.find({
      role: 'official',
      departmentId: department._id,
    }).select('name email phone designation');

    return res.status(200).json({
      success: true,
      department: {
        ...department.toObject(),
        officials,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch department.',
      error: error.message,
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, icon, contactEmail, contactPhone, defaultCategories } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required.',
      });
    }

    const exists = await Department.findOne({
      $or: [{ name: name.trim() }, { code: code.trim().toUpperCase() }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists.',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || '',
      icon: icon || 'Building2',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      defaultCategories: defaultCategories || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create department.',
      error: error.message,
    });
  }
};

// @desc    Update department
// @route   PATCH /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res) => {
  try {
    const { name, description, icon, contactEmail, contactPhone } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.',
      });
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    if (icon) department.icon = icon;
    if (contactEmail !== undefined) department.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) department.contactPhone = contactPhone.trim();

    await department.save();

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update department.',
      error: error.message,
    });
  }
};

// @desc    Get officials belonging to department
// @route   GET /api/departments/:id/officials
// @access  Private (Admin, Official)
export const getOfficialsByDepartment = async (req, res) => {
  try {
    const officials = await User.find({
      role: 'official',
      departmentId: req.params.id,
    }).select('name email phone designation');

    return res.status(200).json({
      success: true,
      officials,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch officials.',
      error: error.message,
    });
  }
};
