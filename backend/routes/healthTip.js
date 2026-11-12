
import express from 'express';
import { addHealthTip, updateHealthTip, deleteHealthTip } from '../controllers/healthTipController.js';
import { protect, isDoctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, isDoctor, addHealthTip);
router.put('/:tip_id', protect, isDoctor, updateHealthTip);
router.delete('/:tip_id', protect, isDoctor, deleteHealthTip);

export default router;
