// routes/userRoutes.js
import express from 'express';
import { syncUser, unlockTopic, verifyPayment } from '../controllers/userController.js';

const router = express.Router();

// POST /api/users/sync
router.post('/sync', syncUser);

// POST /api/users/unlock-topic
router.post('/unlock-topic', unlockTopic);

router.post('/verify-payment', verifyPayment);

export default router;