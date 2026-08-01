import TopicProgress from '../models/TopicProgress.js';

export const saveStudyProgress = async (req, res) => {
    try {
        const { userId, topicId, score, totalQuestions, lastAttemptAnswers } = req.body;

        // Basic validation
        if (!userId || !topicId) {
            return res.status(400).json({ error: 'User ID and Topic ID are required.' });
        }

        // Upsert: Create document if it doesn't exist, or update it if it does.
        const result = await TopicProgress.findOneAndUpdate(
            { userId, topicId },
            {
                $set: {
                    totalQuestions,
                    lastAttemptAnswers, // Always save the answers from the most recent try
                    completedAt: Date.now()
                },
                $max: { highestScore: score } // ONLY updates if the new score is greater than the old one!
            },
            { new: true, upsert: true } // 'upsert: true' is what creates it on the very first try
        );

        console.log(`✅ Saved study progress for user ${userId} on topic ${topicId}`);
        res.status(200).json({ message: 'Progress saved successfully!', result });

    } catch (error) {
        console.error("❌ Error saving study progress:", error);
        res.status(500).json({ error: 'Server error while saving progress' });
    }
};

export const getUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch all progress documents that match this user's ID
        const userProgress = await TopicProgress.find({ userId });

        res.status(200).json(userProgress);
    } catch (error) {
        console.error("❌ Error fetching user progress:", error);
        res.status(500).json({ error: 'Server error while fetching progress' });
    }
};