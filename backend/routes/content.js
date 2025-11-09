import express from 'express';
import auth, { isInstructor } from '../middleware/auth.js';
import Topic from '../models/Topic.js';
import Question from '../models/Question.js';

const router = express.Router();

// @route   POST api/content/topic
// @desc    Create a new topic (Instructor only)
// @access  Private (Instructor)
router.post('/topic', [auth, isInstructor], async (req, res) => {
  const { name, subject, order } = req.body;
  try {
    let topic = await Topic.findOne({ name });
    if (topic) {
      return res.status(400).json({ msg: 'Topic already exists' });
    }
    
    let topicByOrder = await Topic.findOne({ order });
    if (topicByOrder) {
      return res.status(400).json({ msg: 'A topic with this order number already exists' });
    }

    topic = new Topic({ name, subject, order });
    await topic.save();
    res.json(topic);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/content/topics
// @desc    Get all topics
// @access  Private
router.get('/topics', auth, async (req, res) => {
    try {
        const topics = await Topic.find().sort({ order: 1 });
        res.json(topics);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/content/question
// @desc    Create a new question (Instructor only)
// @access  Private (Instructor)
router.post('/question', [auth, isInstructor], async (req, res) => {
  const { topicId, text, options, correctAnswerIndex, difficulty, explanation } = req.body;
  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ msg: 'Topic not found' });
    }

    const newQuestion = new Question({
      topic: topicId,
      text,
      options,
      correctAnswerIndex,
      difficulty,
      explanation
    });

    const question = await newQuestion.save();
    res.json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/content/questions/:topicId
// @desc    Get all questions for a topic
// @access  Private (Instructor)
router.get('/questions/:topicId', [auth, isInstructor], async (req, res) => {
    try {
        const questions = await Question.find({ topic: req.params.topicId }).sort({ difficulty: 1 });
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;