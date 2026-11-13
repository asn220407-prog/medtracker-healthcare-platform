import express from 'express';
import { getAdherence, tickCalendar, getPatientAdherence, untickCalendar } from '../controllers/adherenceController.js';
import { protect, isPatient, isDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:medication_id', protect, isPatient, getAdherence); // For patient to get their own adherence
router.post('/tick', protect, tickCalendar); // For patient or assigned doctor to mark adherence
router.delete('/untick', protect, untickCalendar); // For patient or assigned doctor to un-mark adherence
router.get('/patient/:patient_id/:medication_id', protect, isDoctor, getPatientAdherence); // For doctor to get patient's adherence

export default router;
