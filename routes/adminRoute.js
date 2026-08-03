import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { generateQuestions, topUpCredits, createTopic, unlockTopicForUser, generateTopicContent } from '../controllers/adminController.js';

const router = express.Router();

// Generate questions via AI and save to DB
router.post('/generate-questions', requireAdmin, generateQuestions);

// Top up user credits
router.post('/top-up', requireAdmin, topUpCredits);

router.post('/topic', requireAdmin, createTopic);

router.post('/unlock-topic', requireAdmin, unlockTopicForUser);

router.post('/generate-content', requireAdmin, generateTopicContent);

export default router;