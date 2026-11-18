import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getAllComplaints,
  updateStatus,
  assignComplaint,
  submitResolutionEvidence,
  verifyResolution,
  overridePriority,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

// Citizen routes
router.post('/', upload.single('beforeImage'), createComplaint);
router.get('/my', authorize('citizen'), getMyComplaints);
router.post('/:id/verify', authorize('citizen'), verifyResolution);

// Shared protected detail route
router.get('/:id', getComplaintById);

// Admin & Official routes
router.get('/', authorize('admin', 'official'), getAllComplaints);
router.patch('/:id/status', authorize('admin', 'official'), updateStatus);
router.post(
  '/:id/evidence',
  authorize('admin', 'official'),
  upload.single('afterImage'),
  submitResolutionEvidence
);

// Admin specific complaint operations
router.patch('/:id/assign', authorize('admin'), assignComplaint);
router.patch('/:id/priority', authorize('admin'), overridePriority);

export default router;
