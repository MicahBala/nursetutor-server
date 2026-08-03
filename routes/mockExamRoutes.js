import express from 'express';
import { startMockExam, autoSaveProgress, submitExam, getExamById, getActiveExam } from '../controllers/mockExamController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST request to start or resume an exam
router.post('/start', requireAuth, startMockExam);

router.put('/:examId/auto-save', requireAuth, autoSaveProgress);

router.post('/:examId/submit', requireAuth, submitExam);

router.get('/active/:userId', requireAuth, getActiveExam);

router.get('/:examId', requireAuth, getExamById);


export default router;