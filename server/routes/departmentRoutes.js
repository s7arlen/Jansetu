import express from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  getOfficialsByDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Protected routes
router.use(protect);
router.post('/', authorize('admin'), createDepartment);
router.patch('/:id', authorize('admin'), updateDepartment);
router.get('/:id/officials', authorize('admin', 'official'), getOfficialsByDepartment);

export default router;
