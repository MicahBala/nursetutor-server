import mongoose from 'mongoose';
import QuizResult from '../models/QuizResult.js';
import Question from '../models/Question.js';
import User from '../models/User.js';

export const startMockExam = async (req, res) => {
    try {
        const { userId, selectedTopicIds, examTitle, cheatMode } = req.body;

        if (!userId || !selectedTopicIds || selectedTopicIds.length === 0) {
            return res.status(400).json({ error: 'User ID and at least one Topic are required.' });
        }

        // 1. CHECK FOR PAUSED EXAM
        const existingDraft = await QuizResult.findOne({
            userId: userId,
            status: 'in-progress'
        });

        if (existingDraft) {
            return res.status(200).json({
                message: 'Resuming paused exam',
                exam: existingDraft
            });
        }

        // 2. CHECK EXAM CREDITS (SAFELY!)
        let userQuery = { firebaseUid: userId };
        if (mongoose.isValidObjectId(userId)) {
            userQuery = { $or: [{ firebaseUid: userId }, { _id: userId }] };
        }

        const user = await User.findOne(userQuery);

        if (!cheatMode) {
            if (!user || user.mockExamCredits < 1) {
                return res.status(403).json({ error: 'Insufficient exam credits. Please purchase a top-up.' });
            }
        }

        // 3. FETCH 50 RANDOM QUESTIONS FROM THE BANK
        const questions = await Question.aggregate([
            { $match: { topicId: { $in: selectedTopicIds } } },
            { $sample: { size: 50 } }
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ error: 'No questions found for the selected topics in the Question Bank.' });
        }

        // 4. MAP QUESTIONS TO THE DRAFT FORMAT
        const draftAnswers = questions.map(q => ({
            questionId: q._id,
            topicId: q.topicId,
            topicName: q.topicName,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            selectedOption: null,
            correctAnswer: q.correctAnswer,
            isCorrect: false,
            rationale: q.rationale
        }));

        // 5. CREATE THE DRAFT EXAM
        const newExam = new QuizResult({
            userId,
            selectedTopicIds,
            examTitle: examTitle || "NMCN Mock Exam",
            status: 'in-progress',
            timeRemaining: 3600,
            totalQuestions: questions.length,
            userAnswers: draftAnswers,
            overallScore: 0
        });

        await newExam.save();

        // 6. DEDUCT THE EXAM CREDIT
        if (!cheatMode && user) {
            user.mockExamCredits -= 1;
            await user.save();
        }

        res.status(201).json({
            message: 'New exam started successfully',
            exam: newExam,
            creditsRemaining: user ? user.mockExamCredits : 0
        });

    } catch (error) {
        console.error("❌ Error starting mock exam:", error);
        res.status(500).json({ error: 'Server error while starting exam' });
    }
};

export const autoSaveProgress = async (req, res) => {
    try {
        const { examId } = req.params;
        const { questionId, selectedOption, timeRemaining } = req.body;

        // Scenario 1: The user clicked an answer (Update answer + timer)
        if (questionId && selectedOption) {
            const updatedExam = await QuizResult.findOneAndUpdate(
                { _id: examId, "userAnswers.questionId": questionId },
                {
                    $set: {
                        "userAnswers.$.selectedOption": selectedOption,
                        timeRemaining: timeRemaining
                    }
                },
                { new: true }
            );

            if (!updatedExam) {
                return res.status(404).json({ error: 'Exam or question not found' });
            }

            return res.status(200).json({ message: 'Answer and timer saved.' });
        }

        // Scenario 2: The frontend is just syncing the timer
        else if (timeRemaining !== undefined) {
            await QuizResult.findByIdAndUpdate(
                examId,
                { $set: { timeRemaining: timeRemaining } }
            );
            return res.status(200).json({ message: 'Timer synced.' });
        }

        res.status(400).json({ error: 'No valid update data provided.' });

    } catch (error) {
        console.error("❌ Error auto-saving exam:", error);
        res.status(500).json({ error: 'Server error during auto-save' });
    }
};

export const submitExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const exam = await QuizResult.findById(examId);

        if (!exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        if (exam.status === 'completed') {
            return res.status(400).json({ error: 'This exam has already been submitted and graded.' });
        }

        let totalCorrect = 0;
        const topicStats = {};

        exam.userAnswers.forEach((answer) => {
            if (!topicStats[answer.topicId]) {
                topicStats[answer.topicId] = {
                    topicId: answer.topicId,
                    topicName: answer.topicName,
                    correctAnswers: 0,
                    totalQuestions: 0
                };
            }

            topicStats[answer.topicId].totalQuestions += 1;

            if (answer.selectedOption && answer.selectedOption === answer.correctAnswer) {
                answer.isCorrect = true;
                totalCorrect += 1;
                topicStats[answer.topicId].correctAnswers += 1;
            } else {
                answer.isCorrect = false;
            }
        });

        const topicBreakdown = Object.values(topicStats).map(stat => ({
            topicId: stat.topicId,
            topicName: stat.topicName,
            correctAnswers: stat.correctAnswers,
            totalQuestions: stat.totalQuestions,
            scorePercentage: Math.round((stat.correctAnswers / stat.totalQuestions) * 100)
        }));

        exam.totalCorrect = totalCorrect;
        exam.overallScore = totalCorrect;
        exam.topicBreakdown = topicBreakdown;
        exam.status = 'completed';
        exam.completedAt = Date.now();

        await exam.save();

        res.status(200).json({
            message: 'Exam graded successfully',
            exam
        });

    } catch (error) {
        console.error("❌ Error submitting exam:", error);
        res.status(500).json({ error: 'Server error during final submission' });
    }
};

export const getExamById = async (req, res) => {
    try {
        const exam = await QuizResult.findById(req.params.examId);
        if (!exam) return res.status(404).json({ error: 'Exam not found' });
        res.status(200).json(exam);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching exam' });
    }
};

export const getActiveExam = async (req, res) => {
    try {
        const { userId } = req.params;
        const activeExam = await QuizResult.findOne({ userId, status: 'in-progress' });

        res.status(200).json({ activeExam: activeExam || null });
    } catch (error) {
        console.error("❌ Error fetching active exam:", error);
        res.status(500).json({ error: 'Server error checking active exam status' });
    }
};