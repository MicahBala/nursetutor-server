import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { generateQuestions, topUpCredits, createTopic, unlockTopicForUser, generateTopicContent, getAllUsers } from '../controllers/adminController.js';

const router = express.Router();

// Generate questions via AI and save to DB
router.post('/generate-questions', requireAdmin, generateQuestions);

// Top up user credits
router.post('/top-up', requireAdmin, topUpCredits);

router.post('/topic', requireAdmin, createTopic);

router.post('/unlock-topics', requireAdmin, unlockTopicForUser);

router.post('/generate-content', requireAdmin, generateTopicContent);

router.get('/users', requireAdmin, getAllUsers);
export default router;