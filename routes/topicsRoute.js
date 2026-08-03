import express from 'express';
import { getAllTopics, getTopicById } from '../controllers/topicsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, getAllTopics);

router.get('/:topicId', requireAuth, getTopicById);

export default router;