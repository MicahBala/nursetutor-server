import express from 'express';
import { startMockExam, autoSaveProgress, submitExam, getExamById, getActiveExam } from '../controllers/mockExamController.js';

const router = express.Router();

// POST request to start or resume an exam
router.post('/start', startMockExam);

router.put('/:examId/auto-save', autoSaveProgress);

router.post('/:examId/submit', submitExam);

router.get('/active/:userId', getActiveExam);

router.get('/:examId', getExamById);


export default router;