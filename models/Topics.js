import mongoose from "mongoose";

// 1. Schema for generated quiz questions
const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    optionA: {
        type: String,
        required: true
    },
    optionB: {
        type: String,
        required: true
    },
    optionC: {
        type: String,
        required: true
    },
    optionD: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true // Expected: 'A', 'B', 'C', or 'D'
    },
    rationale: {
        type: String,
        required: true
    }
}, { _id: true });

// 2. Main Topic Schema
const topicSchema = new mongoose.Schema({
    topicId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true // Fast lookup by URL/ID
    },
    topicName: {
        type: String,
        required: true,
        trim: true
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    tags: [{
        type: String,
        trim: true
    }],
    price: {
        type: Number,
        default: 500
    },
    isFree: {
        type: Boolean,
        default: false
    },

    // Cache flag: false when seeded, true once Gemini generates content
    isPopulated: {
        type: Boolean,
        default: false
    },

    // Gemini-generated Markdown study article
    articleContent: {
        type: String,
        default: ""
    },

    // Gemini-generated questions array
    questions: [questionSchema]
}, {
    timestamps: true
});

export default mongoose.model('Topic', topicSchema);