import express from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import {
    generateQuestions,
    topUpCredits,
    createTopic,
    unlockTopicForUser,
    generateTopicContent,
    getAllUsers
} from '../controllers/adminController.js';

const router = express.Router();

// Generate questions via AI and save to DB
router.post('/generate-questions', requireAdmin, generateQuestions);

// Top up user credits
router.post('/top-up', requireAdmin, topUpCredits);

// Create a new topic (MUST BE PLURAL: /topics)
router.post('/topics', requireAdmin, createTopic);

// Unlock a topic for a user (MUST BE SINGULAR: /unlock-topic)
router.post('/unlock-topic', requireAdmin, unlockTopicForUser);

// Generate article and quiz
router.post('/generate-content', requireAdmin, generateTopicContent);

// Get all users for the dashboard
router.get('/users', requireAdmin, getAllUsers);

export default router;