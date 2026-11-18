import express from 'express';
import {
  getAdminDashboardStats,
  getAdminAnalytics,
  getOverdueComplaints,
  escalateComplaint,
  getUsers,
  createUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/analytics', getAdminAnalytics);
router.get('/overdue', getOverdueComplaints);
router.post('/escalate', escalateComplaint);
router.get('/users', getUsers);
router.post('/users', createUser);

export default router;
