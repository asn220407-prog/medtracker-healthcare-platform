import express from 'express';
import {
  createReminder,
  getReminders,
  deleteReminder,
  toggleReminder,
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.delete('/:id', protect, deleteReminder);
router.put('/:id/toggle', protect, toggleReminder);

export default router;
