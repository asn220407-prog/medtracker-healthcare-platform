
import express from 'express';
import { addMedication, updateMedication, deleteMedication } from '../controllers/medicationController.js';
import { protect, isDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, isDoctor, addMedication);
router.put('/:medication_id', protect, isDoctor, updateMedication);
router.delete('/:medication_id', protect, isDoctor, deleteMedication);

export default router;
