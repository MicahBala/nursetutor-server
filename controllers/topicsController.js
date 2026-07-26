import Topic from "../models/Topics.js";

export const getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json(topics);
    } catch (error) {
        console.error("Error fetching topics:", error);
        res.status(500).json({ error: 'Server error while fetching topics' });
    }
};

export const getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findOne({ topicId: req.params.topicId });

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        res.status(200).json(topic);
    } catch (error) {
        console.error("Error fetching topic:", error);
        res.status(500).json({ error: 'Server error while fetching the topic' });
    }
};