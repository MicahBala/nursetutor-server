import mongoose from 'mongoose';

// Schema to store detailed response for each question (enables "Review Exam" feature)
const userAnswerSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    selectedOption: { type: String, required: true }, // e.g., "Option A" or choice text
    correctAnswer: { type: String, required: true }, // e.g., "A"
    isCorrect: { type: Boolean, required: true },
    rationale: { type: String, required: true }
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
    // The Firebase UID of the student
    userId: {
        type: String,
        required: true,
        index: true
    },

    // The specific topic ID (for single-topic quizzes)
    topicId: {
        type: String,
        required: true,
        index: true // Fast query: "Find all attempts by User X for Topic Y"
    },

    topicName: {
        type: String,
        required: true
    },

    // High-level scores
    overallScore: { type: Number, required: true }, // e.g., 70 (Percentage)
    totalCorrect: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },

    // Granular question breakdown for post-quiz review
    userAnswers: [userAnswerSchema],

    // Multi-topic exam breakdown (useful if you create full 50-question semester mock exams later)
    topicBreakdown: [{
        topicId: { type: String, required: true },
        topicTitle: { type: String, required: true },
        correct: { type: Number, required: true },
        total: { type: Number, required: true },
        percentage: { type: Number, required: true }
    }],

    // Timestamp
    takenAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model('QuizResult', quizResultSchema);