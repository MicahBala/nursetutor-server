import express from 'express';
import { saveStudyProgress, getUserProgress } from '../controllers/progressController.js';

const router = express.Router();

// POST request to /api/progress/save
router.post('/save', saveStudyProgress);

// GET request to /api/progress/:userId
router.get('/:userId', getUserProgress);

export default router;