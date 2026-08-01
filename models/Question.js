import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    // Which topic this question belongs to (e.g., "Anatomy", "Pharmacology")
    topicId: {
        type: String,
        required: true,
        index: true // Indexed because we will query this heavily when building the exam
    },
    topicName: {
        type: String,
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true
    },
    rationale: {
        type: String,
        required: true
    },
    // Optional: useful if you later want to generate "Hard" vs "Easy" exams
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }
}, { timestamps: true });

export default mongoose.model('Question', questionSchema);