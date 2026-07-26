import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';

// POST /api/results - Save a finished exam and deduct 1 credit
export const saveQuizResult = async (req, res) => {
    try {
        const { userId, overallScore, totalCorrect, totalQuestions, topicBreakdown } = req.body;

        // 1. Create and save the history record
        const newResult = new QuizResult({
            userId,
            overallScore,
            totalCorrect,
            totalQuestions,
            topicBreakdown
        });
        await newResult.save();

        // 2. Deduct 1 Exam Credit from the user's profile
        // Note: If they used the Developer Bypass, we only deduct if credits > 0
        await User.findOneAndUpdate(
            { firebaseUid: userId, mockExamCredits: { $gt: 0 } },
            { $inc: { mockExamCredits: -1 } }
        );

        res.status(201).json({ message: 'Result saved and credit deducted', result: newResult });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        res.status(500).json({ error: 'Server error saving result' });
    }
};

// GET /api/results/:userId - Fetch a user's entire exam history
export const getUserResults = async (req, res) => {
    try {
        // Sort by newest first
        const results = await QuizResult.find({ userId: req.params.userId }).sort({ takenAt: -1 });
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};
