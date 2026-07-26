import express from 'express';
import { getAllTopics, getTopicById } from '../controllers/topicsController.js';

const router = express.Router();

router.get('/', getAllTopics);

router.get('/:topicId', getTopicById);

export default router;