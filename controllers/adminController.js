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
        // Wrapped in a JSON object because Groq's JSON mode requires it
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
            model: 'llama-3.3-70b-versatile', // Standard fast Groq model. Change to llama3-70b-8192 if you want even higher reasoning quality.
            temperature: 0.5,
            response_format: { type: 'json_object' } // This forces Groq to return perfect JSON!
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

        // 5. Save them all to the Question Bank!
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

// Bonus Admin Tool: Create a new Topic on the fly
export const createTopic = async (req, res) => {
    try {
        const { title, tags } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Topic title is required' });
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
            topicName: title, // Adding both just to be safe with your schemas
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await newTopic.save();
        res.status(201).json({ message: `Topic '${title}' created successfully!`, topic: newTopic });

    } catch (error) {
        console.error("❌ Error creating topic:", error);
        res.status(500).json({ error: 'Server error creating topic' });
    }
};