
import express from 'express';
import { getVitalTrackerData, getProgressData } from '../controllers/patientController.js';
import { getLabReports } from '../controllers/labReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:patient_id/vital-tracker', protect, getVitalTrackerData);
router.get('/:patient_id/progress', protect, getProgressData);
router.get('/:patient_id/lab-reports', protect, getLabReports);

export default router;
