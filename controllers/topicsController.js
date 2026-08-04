import Topic from "../models/Topics.js";
import Question from '../models/Question.js'; // <-- Added Question model import
import Groq from 'groq-sdk';

// Initialize the Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert Nigerian nursing and midwifery educator and examiner for the NMCN. 
Your goal is to generate high-yield study material and multiple-choice questions for ND nursing students in Nigeria.
All clinical scenarios, interventions, and guidelines MUST strictly align with the Nigerian healthcare system, local protocols, and NMCN standards.
You MUST output your response in valid JSON format ONLY.`;

export const getAllTopics = async (req, res) => {
    try {
        // 1. Fetch all topics
        const topics = await Topic.find();

        // 2. Map through them and count the questions for each topicId
        // We use Promise.all because we are running multiple async queries against the DB
        const topicsWithCounts = await Promise.all(topics.map(async (topic) => {
            const questionCount = await Question.countDocuments({ topicId: topic.topicId });

            return {
                _id: topic._id,
                topicId: topic.topicId,
                title: topic.title,
                topicName: topic.topicName,
                courseName: topic.courseName,
                tags: topic.tags,
                isPopulated: topic.isPopulated,
                questionCount: questionCount // <-- This field powers the Exam Bank Overview!
            };
        }));

        res.status(200).json(topicsWithCounts);
    } catch (error) {
        console.error("Error fetching topics:", error);
        res.status(500).json({ error: 'Server error while fetching topics' });
    }
};

export const getTopicById = async (req, res) => {
    try {
        // 1. Fetch the topic shell from MongoDB
        const topic = await Topic.findOne({ topicId: req.params.topicId });

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        // 2. CACHE HIT: If already populated, return instantly
        if (topic.isPopulated) {
            console.log(`⚡ Serving [${topic.topicName}] from MongoDB Cache`);
            return res.status(200).json(topic);
        }

        // 3. CACHE MISS: Generate the content with Groq
        console.log(`🚀 Generating content for [${topic.topicName}] via Groq (Fallback)...`);

        const prompt = `Generate the study content for Topic: "${topic.topicName}" within the Course: "${topic.courseName || 'General Nursing'}".

        Part 1: Write a comprehensive, high-yield article (800 - 1,100 words, designed for a strict 5 to 7-minute read) focusing on the most difficult and frequently tested aspects.

        FORMATTING REQUIREMENTS FOR PART 1:
        - Use ## for Section Subheadings.
        - Use - for bullet points.
        - ALWAYS use double newlines (\\n\\n) between headings, paragraphs, and list items so Markdown parses cleanly.

        Part 2: Generate 5 clinical scenario-based multiple-choice questions based on the article, testing critical application.

        Respond STRICTLY with this exact JSON structure:
        {
            "articleContent": "## Heading Title\\n\\nFirst paragraph text goes here...\\n\\n## Subheading\\n\\n- **Bullet 1**: Detail here\\n- **Bullet 2**: Detail here",
            "questions": [
                {
                    "questionText": "The question here...",
                    "optionA": "First option text",
                    "optionB": "Second option text",
                    "optionC": "Third option text",
                    "optionD": "Fourth option text",
                    "correctAnswer": "A", 
                    "rationale": "Detailed explanation of why this is correct"
                }
            ]
        }`;

        // Call Groq using the lightning-fast Llama 3.3 70B Versatile model
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_INSTRUCTION },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: "json_object" } // Forces perfect JSON output
        });

        // 4. Parse the generated JSON safely
        let generatedData;
        try {
            generatedData = JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
            console.error("❌ AI returned malformed JSON:", response.choices[0].message.content);
            return res.status(500).json({ error: 'AI failed to format the response correctly. Please try again.' });
        }

        // 5. Update the MongoDB document and flip the cache flag
        topic.articleContent = generatedData.articleContent || "";
        topic.questions = generatedData.questions || [];
        topic.isPopulated = true;

        await topic.save();

        console.log(`✅ Successfully generated and saved [${topic.topicName}]`);

        // 6. Return the newly populated topic to the frontend
        return res.status(200).json(topic);

    } catch (error) {
        console.error("❌ Error fetching/generating topic:", error);
        res.status(500).json({ error: 'Server error while fetching or generating the topic' });
    }
};