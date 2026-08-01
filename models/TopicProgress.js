import mongoose from 'mongoose';

// Schema to store the 5 questions so they can review them later
const studyAnswerSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    selectedOption: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    rationale: { type: String, required: true }
}, { _id: false });

const topicProgressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    topicId: {
        type: String,
        required: true
    },
    highestScore: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    // Adding this so the student can review their 5-question quiz!
    lastAttemptAnswers: [studyAnswerSchema],

    completedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('TopicProgress', topicProgressSchema);