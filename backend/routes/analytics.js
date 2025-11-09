import express from 'express';
import auth, { isInstructor } from '../middleware/auth.js';
import StudentProgress from '../models/StudentProgress.js';
import User from '../models/User.js';
import Topic from '../models/Topic.js';

const router = express.Router();

// @route   GET api/analytics/overview
// @desc    Get progress for all students (Instructor)
// @access  Private (Instructor)
router.get('/overview', [auth, isInstructor], async (req, res) => {
    try {
        // Get all students
        const students = await User.find({ role: 'student' }).select('-password');
        // Get all topics
        const topics = await Topic.find().sort({ order: 1 });
        // Get all progress docs
        const progresses = await StudentProgress.find().populate('student', 'username');
        
        // Map topics for easy lookup
        const topicMap = {};
        topics.forEach(t => topicMap[t._id] = t.name);

        const overview = progresses.map(prog => {
            if (!prog.student) return null; // Handle case where student might be deleted
            
            const masteryData = {};
            // Iterate over the topics in order, not the progress map
            for (const topic of topics) {
                const topicId = topic._id.toString();
                if (prog.topicProgress.has(topicId)) {
                    masteryData[topic.name] = prog.topicProgress.get(topicId).masteryLevel;
                } else {
                    masteraData[topic.name] = 0; // Not started
                }
            }

            return {
                studentId: prog.student._id,
                studentName: prog.student.username,
                masteryData
            };
        }).filter(Boolean); // Filter out nulls

        res.json({overview, topics: topics.map(t => t.name)});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/analytics/student-progress
// @desc    Get personal progress (Student)
// @access  Private (Student)
router.get('/student-progress', auth, async (req, res) => {
    try {
        const progress = await StudentProgress.findOne({ student: req.user.id });
        if (!progress) {
            return res.status(404).json({ msg: 'Progress not found' });
        }
        
        const topics = await Topic.find().sort({ order: 1 });
        const masteryData = [];

        for (const topic of topics) {
            const topicId = topic._id.toString();
            let masteryLevel = 0;
            if (progress.topicProgress.has(topicId)) {
                masteryLevel = progress.topicProgress.get(topicId).masteryLevel;
            }
            masteryData.push({ name: topic.name, mastery: masteryLevel });
        }
        
        res.json(masteryData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;