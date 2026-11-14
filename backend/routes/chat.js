import express from 'express';
import { getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:patient_id', protect, getMessages);
router.post('/:patient_id', protect, sendMessage);

export default router;
