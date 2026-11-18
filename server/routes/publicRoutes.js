import express from 'express';
import {
  getPublicStatistics,
  getPublicDepartments,
} from '../controllers/publicController.js';
import { searchPublicTrack } from '../controllers/complaintController.js';

const router = express.Router();

router.get('/statistics', getPublicStatistics);
router.get('/departments', getPublicDepartments);
router.get('/track/:complaintId', searchPublicTrack);

export default router;
