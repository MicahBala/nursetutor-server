import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema({
    // The Firebase UID of the student who took the exam
    userId: {
        type: String,
        required: true,
        index: true
    },

    // High-level scores
    overallScore: { type: Number, required: true }, // e.g., 85 (Percentage)
    totalCorrect: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },

    // The granular breakdown so we can chart their progress per topic later
    topicBreakdown: [{
        topicTitle: { type: String, required: true },
        correct: { type: Number, required: true },
        total: { type: Number, required: true },
        percentage: { type: Number, required: true }
    }],

    // When they took the test
    takenAt: { type: Date, default: Date.now }
});

export default mongoose.model('QuizResult', quizResultSchema);