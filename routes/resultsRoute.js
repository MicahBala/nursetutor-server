import express from 'express';
import { saveQuizResult, getUserResults } from '../controllers/resultsController.js';

const router = express.Router();

// POST /api/results - Save a finished exam and deduct 1 credit
router.post('/', saveQuizResult);

// GET /api/results/:userId - Fetch a user's entire exam history
router.get('/:userId', getUserResults);

export default router;