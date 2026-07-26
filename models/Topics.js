import mongoose from "mongoose";

// 1. Schema for the individual paragraphs in the reading section
const reviewSectionSchema = new mongoose.Schema({
    subheading: { type: String, required: true },
    paragraphText: { type: String, required: true }
});

// 2. Schema for the exam questions
const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['recall', 'scenario', 'calculation'], // Keeps data consistent
        default: 'recall'
    },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of strings (A, B, C, D)
    correctAnswer: { type: String, required: true },
    rationale: { type: String, required: true }
});

// 3. The Main Topic Schema
const topicSchema = new mongoose.Schema({
    // A URL-friendly ID (e.g., "ethics-negligence-malpractice")
    topicId: {
        type: String,
        required: true,
        unique: true,
        index: true // Makes searching by URL super fast
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }], // e.g., ["Ethics", "Law"]
    price: { type: Number, default: 500 },
    isFree: { type: Boolean, default: false },

    // The reading material
    content: {
        comprehensiveReview: [reviewSectionSchema],
        theCatch: { type: String } // The NMCN exam trap
    },

    // The embedded array of questions
    questions: [questionSchema]
}, {
    timestamps: true
});

export default mongoose.model('Topic', topicSchema);