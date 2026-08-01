import mongoose from 'mongoose';

const userAnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    topicId: { type: String },
    topicName: { type: String },
    questionText: { type: String, required: true },

    // Options so the frontend can display them
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },

    selectedOption: { type: String, default: null },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    rationale: { type: String, required: true }
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },

    // Replaced single topicId with an array, since Mock Exams cover multiple topics
    selectedTopicIds: [{
        type: String
    }],

    examTitle: {
        type: String,
        default: "NMCN Mock Exam"
    },

    // Async Exam Tracking
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    },

    timeRemaining: {
        type: Number,
        default: 3600, // 60 minutes represented in seconds
        required: true
    },

    // Scores default to 0 while in-progress
    overallScore: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },

    // The questions pulled from the Question Bank
    userAnswers: [userAnswerSchema],

    // FIX: Updated variable names to perfectly match the Controller and Frontend!
    topicBreakdown: [{
        topicId: { type: String },
        topicName: { type: String },
        correctAnswers: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
        scorePercentage: { type: Number, default: 0 }
    }],

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date } // Kept only one instance of completedAt
}, {
    timestamps: true
});

export default mongoose.model('QuizResult', quizResultSchema);