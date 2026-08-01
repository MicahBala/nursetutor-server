import express from 'express';
import { generateQuestions, topUpCredits, createTopic } from '../controllers/adminController.js';

const router = express.Router();

// Generate questions via AI and save to DB
router.post('/generate-questions', generateQuestions);

// Top up user credits
router.post('/top-up', topUpCredits);

router.post('/topic', createTopic);

export default router;