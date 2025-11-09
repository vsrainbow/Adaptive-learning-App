import express from 'express';
import auth from '../middleware/auth.js';
import Question from '../models/Question.js';
import Topic from '../models/Topic.js';
import StudentProgress from '../models/StudentProgress.js';

const router = express.Router();

const MASTERED_LEVEL = 5;

// Helper function to get or initialize progress for a topic
async function getOrCreateTopicProgress(progressDoc, topicId) {
    if (!progressDoc.topicProgress.has(topicId)) {
        progressDoc.topicProgress.set(topicId, {
            topic: topicId,
            currentDifficulty: 1,
            streak: 0,
            masteryLevel: 1,
            lastAttempted: new Date()
        });
    }
    return progressDoc.topicProgress.get(topicId);
}

// @route   GET api/quiz/start
// @desc    Get the first question for the student
// @access  Private (Student)
router.get('/start', auth, async (req, res) => {
    try {
        const studentId = req.user.id;
        const progress = await StudentProgress.findOne({ student: studentId });
        if (!progress) {
            return res.status(404).json({ msg: 'Student progress not found' });
        }

        // Find all topics, sorted by the defined order
        const allTopics = await Topic.find().sort({ order: 1 });
        if (!allTopics.length) {
            return res.status(404).json({ msg: 'No topics found in the course' });
        }

        let nextQuestion = null;
        let targetTopic = null;

        // Find the first topic that is not mastered
        for (const topic of allTopics) {
            const topicId = topic._id.toString();
            const topicProg = await getOrCreateTopicProgress(progress, topicId);
            
            if (topicProg.masteryLevel < MASTERED_LEVEL) {
                targetTopic = topic;
                break;
            }
        }

        // If all topics are mastered
        if (!targetTopic) {
            return res.json({ quizOver: true, message: 'Congratulations! You have mastered all topics.' });
        }

        // Get the student's current difficulty for this topic
        const currentDifficulty = progress.topicProgress.get(targetTopic._id.toString()).currentDifficulty;
        
        // Find a question for this topic at the current difficulty
        nextQuestion = await Question.findOne({
            topic: targetTopic._id,
            difficulty: currentDifficulty
        });

        // If no question at current difficulty, try one level up or down (simple fallback)
        if (!nextQuestion) {
            nextQuestion = await Question.findOne({ topic: targetTopic._id }); // Just get any
        }

        if (!nextQuestion) {
            return res.status(404).json({ msg: `No questions found for topic: ${targetTopic.name}. Please ask an instructor to add more.` });
        }
        
        await progress.save();

        // Send question without the answer
        const { correctAnswerIndex, explanation, ...questionToSend } = nextQuestion.toObject();
        res.json({ question: questionToSend });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/quiz/submit
// @desc    Submit an answer and get the next question
// @access  Private (Student)
router.post('/submit', auth, async (req, res) => {
    const { questionId, answerIndex } = req.body;
    const studentId = req.user.id;

    try {
        // 1. Find the question and check the answer
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ msg: 'Question not found' });
        }

        const isCorrect = question.correctAnswerIndex === answerIndex;
        const topicId = question.topic.toString();

        // 2. Update Student Progress (The "Rules Engine" logic)
        const progress = await StudentProgress.findOne({ student: studentId });
        const topicProg = await getOrCreateTopicProgress(progress, topicId);

        let newDifficulty = topicProg.currentDifficulty;
        let newStreak = topicProg.streak;
        let newMasteryLevel = topicProg.masteryLevel;

        if (isCorrect) {
            newStreak++;
            // Increase difficulty if streak is good (e.g., 2 in a row)
            if (newStreak >= 2) {
                newDifficulty = Math.min(MASTERED_LEVEL, newDifficulty + 1);
                newStreak = 0; // Reset streak after difficulty change
            }
            // Update mastery level
            newMasteryLevel = Math.max(newMasteryLevel, newDifficulty);

        } else {
            // Incorrect answer
            newStreak = 0;
            // Decrease difficulty, but not below 1
            newDifficulty = Math.max(1, newDifficulty - 1);
        }
        
        // Update the progress map
        progress.topicProgress.set(topicId, {
            ...topicProg,
            currentDifficulty: newDifficulty,
            streak: newStreak,
            masteryLevel: newMasteryLevel,
            lastAttempted: new Date()
        });

        // 3. Find the Next Question
        let nextQuestion = null;
        let quizOver = false;

        // If mastery level for this topic just hit 5, move to the next topic
        if (newMasteryLevel >= MASTERED_LEVEL) {
            const allTopics = await Topic.find().sort({ order: 1 });
            const currentTopic = allTopics.find(t => t._id.toString() === topicId);
            const nextTopic = allTopics.find(t => t.order > currentTopic.order);

            if (nextTopic) {
                // Get next topic's progress (or create it)
                const nextTopicId = nextTopic._id.toString();
                const nextTopicProg = await getOrCreateTopicProgress(progress, nextTopicId);
                
                nextQuestion = await Question.findOne({
                    topic: nextTopicId,
                    difficulty: nextTopicProg.currentDifficulty
                });
            } else {
                // All topics mastered
                quizOver = true;
            }
        } else {
            // Stay on the same topic, use the new difficulty
            nextQuestion = await Question.findOne({
                topic: topicId,
                difficulty: newDifficulty
            });
        }
        
        // Fallback: If no specific difficulty question, find *any* for the topic
        if (!nextQuestion && !quizOver) {
             const targetTopicId = (newMasteryLevel >= MASTERED_LEVEL) ? 
                (await Topic.findOne({ order: question.topic.order + 1 }))?._id : // next topic
                topicId; // current topic
                
             if(targetTopicId) {
                nextQuestion = await Question.findOne({ topic: targetTopicId });
             }
        }

        // If still no question, quiz is over (or course is incomplete)
        if (!nextQuestion) {
            quizOver = true;
        }

        await progress.save();
        
        // 4. Send Response
        const response = {
            isCorrect,
            explanation: question.explanation,
            correctAnswerIndex: question.correctAnswerIndex,
            quizOver,
            nextQuestion: null
        };

        if (nextQuestion) {
            const { correctAnswerIndex, explanation, ...questionToSend } = nextQuestion.toObject();
            response.nextQuestion = questionToSend;
        }

        res.json(response);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;