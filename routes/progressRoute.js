import express from 'express';
import { saveStudyProgress, getUserProgress } from '../controllers/progressController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST request to /api/progress/save
router.post('/save', requireAuth, saveStudyProgress);

// GET request to /api/progress/:userId
router.get('/:userId', requireAuth, getUserProgress);

export default router;