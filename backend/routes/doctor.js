
import express from 'express';
import { getDashboard, updatePatient, deletePatient, addAppointment } from '../controllers/doctorController.js';
import { uploadReport, deleteReport } from '../controllers/labReportController.js';
import { uploadLabReport } from '../middleware/uploadMiddleware.js';
import { protect, isDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, isDoctor, getDashboard);
router.put('/patients/:patient_id', protect, isDoctor, updatePatient);
router.delete('/patients/:patient_id', protect, isDoctor, deletePatient);
router.post('/appointments', protect, isDoctor, addAppointment);
router.post('/lab-reports', protect, isDoctor, uploadLabReport.single('report_file'), uploadReport);
router.delete('/lab-reports/:id', protect, isDoctor, deleteReport);

export default router;
