import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        // The unique ID Firebase gives the user (crucial for linking frontend to backend)
        firebaseUid: { type: String, required: true, unique: true },
        // Their Google email address
        email: { type: String, required: true, unique: true },
        // Their Google display name
        displayName: { type: String },
        photoURL: { type: String },

        lastLogin: { type: Date },

        // THE BUSINESS LOGIC: N500 per month per course
        // This is an array of objects. It will hold items like { courseId: 'pharmacology', expiryDate: '2026-06-01' }
        courseSubscriptions: [
            {
                courseId: { type: String, required: true },
                purchasedAt: { type: Date, default: Date.now },
                expiresAt: { type: Date, required: true }
            }
        ],

        // THE BUSINESS LOGIC: N1000 for 3 mock exams
        // When they buy credits, we increase this number. When they take a test, we decrease it.
        mockExamCredits: {
            type: Number,
            default: 0, // Every new user starts with 0 credits
        },
        unlockedTopics: [
            {
                topicId: {
                    type: String,
                    required: true
                },
                expiresAt: {
                    type: Date,
                    required: true
                }
            }
        ]
    },
    {
        // This automatically creates 'createdAt' and 'updatedAt' timestamps for every user
        timestamps: true,
    }
);

// Create the model from the schema and export it
const User = mongoose.model('User', userSchema);

export default User;