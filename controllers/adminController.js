import Groq from 'groq-sdk';
import Question from '../models/Question.js';
import User from '../models/User.js';
import Topic from '../models/Topics.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateQuestions = async (req, res) => {
    try {
        const { topicId, topicName, count = 20 } = req.body;

        if (!topicId || !topicName) {
            return res.status(400).json({ error: 'Topic ID and Topic Name are required.' });
        }

        // 1. The Prompt for Groq
        const prompt = `
            You are an expert Nursing Educator setting questions for the Nursing and Midwifery Council of Nigeria (NMCN) professional exams.
            Generate ${count} multiple-choice questions on the topic of "${topicName}". Half of the questions should be scenario-based.
            
            Format your response STRICTLY as a valid JSON object containing a "questions" array.
            Do not include markdown formatting like \`\`\`json.
            
            Output structure MUST match this exactly:
            {
                "questions": [
                    {
                        "questionText": "The actual question",
                        "optionA": "First option",
                        "optionB": "Second option",
                        "optionC": "Third option",
                        "optionD": "Fourth option",
                        "correctAnswer": "A", // MUST BE EXACTLY "A", "B", "C", or "D"
                        "rationale": "Detailed explanation of why this is the correct answer and why others are wrong."
                    }
                ]
            }
        `;

        // 2. Call the Groq AI with JSON mode forced
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are an API that only outputs valid JSON.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            response_format: { type: 'json_object' }
        });

        // 3. Extract and parse the JSON
        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsedData = JSON.parse(responseText);
        const generatedQuestions = parsedData.questions || [];

        if (generatedQuestions.length === 0) {
            return res.status(500).json({ error: 'AI did not return any questions in the expected format.' });
        }

        // 4. Map the questions to our Database Model structure
        const formattedQuestions = generatedQuestions.map(q => ({
            topicId,
            topicName,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            rationale: q.rationale,
            difficulty: 'medium'
        }));

        // 5. Save them all to the Question Bank
        const savedQuestions = await Question.insertMany(formattedQuestions);

        res.status(201).json({
            message: `Successfully generated and saved ${savedQuestions.length} questions for ${topicName}!`,
            count: savedQuestions.length
        });

    } catch (error) {
        console.error("❌ Error generating questions:", error);
        res.status(500).json({ error: 'Failed to generate questions. The AI might have returned malformed data. Try again.' });
    }
};

// Bonus Admin Tool: Top up credits for testing
export const topUpCredits = async (req, res) => {
    try {
        const { email, creditsToAdd } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.mockExamCredits += Number(creditsToAdd);
        await user.save();

        res.status(200).json({ message: `Added ${creditsToAdd} credits to ${email}. New balance: ${user.mockExamCredits}` });
    } catch (error) {
        res.status(500).json({ error: 'Server error adding credits' });
    }
};

// Bonus Admin Tool: Create a new Topic on the fly (UPDATED TO INCLUDE COURSENAME)
export const createTopic = async (req, res) => {
    try {
        const { title, courseName, tags } = req.body;

        if (!title || !courseName) {
            return res.status(400).json({ error: 'Topic title and Course Name are required' });
        }

        // Auto-generate a topicId (e.g., "Maternal Health" -> "maternal-health")
        const topicId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Check if it already exists
        const existingTopic = await Topic.findOne({ topicId });
        if (existingTopic) {
            return res.status(400).json({ error: 'A topic with a similar name already exists.' });
        }

        const newTopic = new Topic({
            topicId,
            title,
            topicName: title,
            courseName, // <-- SAVING COURSE NAME HERE
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await newTopic.save();
        res.status(201).json({ message: `Topic '${title}' created successfully!`, topic: newTopic });

    } catch (error) {
        console.error("❌ Error creating topic:", error);
        res.status(500).json({ error: 'Server error creating topic' });
    }
};

// Admin Tool: Manually unlock a topic for a user (e.g., 30 days)
export const unlockTopicForUser = async (req, res) => {
    try {
        const { email, topicId, days = 30 } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Calculate expiration date
        const unlockDuration = days * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + unlockDuration);

        // Check if the user already has this topic unlocked to prevent duplicates
        const alreadyUnlocked = user.unlockedTopics?.some(
            (t) => t.topicId.toString() === topicId && new Date(t.expiresAt) > new Date()
        );

        if (alreadyUnlocked) {
            return res.status(400).json({ error: 'User already has active access to this topic.' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $push: { unlockedTopics: { topicId, expiresAt } } },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            message: `Successfully unlocked topic for ${email} for ${days} days.`,
            expiresAt
        });
    } catch (error) {
        console.error("❌ Error unlocking topic:", error);
        res.status(500).json({ error: 'Server error while unlocking topic.' });
    }
};

// Admin Tool: Generate Study Article and Quizzes via AI
export const generateTopicContent = async (req, res) => {
    try {
        const { topicId, topicName } = req.body;

        if (!topicId || !topicName) {
            return res.status(400).json({ error: 'Topic ID and Topic Name are required.' });
        }

        const prompt = `
            You are an expert Nursing Educator for the NMCN. 
            Create a comprehensive study article and a 5-question quick-recall quiz for the topic: "${topicName}".
            
            Format your response STRICTLY as a valid JSON object.
            
            Output structure MUST match this exactly:
            {
                "article": {
                    "title": "Main title of the article",
                    "content": "A detailed, structured study guide in markdown format. Use headings, bullet points, and bold text for emphasis."
                },
                "quiz": [
                    {
                        "questionText": "A quick recall question",
                        "options": ["Option A", "Option B", "Option C", "Option D"],
                        "correctAnswerIndex": 0, // 0 for A, 1 for B, etc.
                        "explanation": "Brief reason why it's correct."
                    }
                ]
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are an API that only outputs valid JSON.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const parsedData = JSON.parse(completion.choices[0]?.message?.content || "{}");

        if (!parsedData.article || !parsedData.quiz) {
            return res.status(500).json({ error: 'AI failed to generate complete content.' });
        }

        res.status(201).json({
            message: `Successfully generated article and quiz for ${topicName}!`,
            data: parsedData
        });

    } catch (error) {
        console.error("❌ Error generating content:", error);
        res.status(500).json({ error: 'Failed to generate study materials.' });
    }
};

// ==========================================
// NEW: GET ALL USERS (Admin Dashboard Overview)
// ==========================================
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        // Must use Promise.all for the database queries inside the map!
        const formattedUsers = await Promise.all(users.map(async (user) => {
            const now = new Date();
            const activeTopicsCount = user.unlockedTopics
                ? user.unlockedTopics.filter(t => new Date(t.expiresAt) > now).length
                : 0;

            // Use the QuizResult model to count exams (Checks both ID formats)
            const examsTakenCount = await Result.countDocuments({
                $or: [
                    { userId: user.firebaseUid },
                    { userId: user.email }
                ]
            });

            return {
                id: user._id,
                email: user.email,
                name: user.name || 'Student',
                mockExamCredits: user.mockExamCredits || 0,
                activeTopicsCount: activeTopicsCount,
                examsTaken: examsTakenCount, // <-- Fixed: Passes Exams Taken
                lastActive: user.lastLogin || user.createdAt, // <-- Fixed: Passes Last Active
                joinedDate: user.createdAt || new Date()
            };
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};