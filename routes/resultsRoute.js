import express from 'express';
import { saveQuizResult, getUserResults } from '../controllers/resultsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/results - Save a finished exam and deduct 1 credit
router.post('/', requireAuth, saveQuizResult);

// GET /api/results/:userId - Fetch a user's entire exam history
router.get('/:userId', requireAuth, getUserResults);

export default router;