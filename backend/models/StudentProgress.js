import mongoose from 'mongoose';

// This schema tracks a student's mastery/progress on a per-topic basis
const TopicProgressSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  // Current difficulty level the student is on for this topic
  currentDifficulty: {
    type: Number,
    default: 1,
  },
  // Streak of correct answers for this topic
  streak: {
    type: Number,
    default: 0
  },
  // 1 to 5, where 5 is "mastered"
  masteryLevel: {
    type: Number,
    default: 1,
  },
  lastAttempted: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // We don't need a separate _id for this sub-document

const StudentProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // A map to store progress for each topic
  topicProgress: {
      type: Map,
      of: TopicProgressSchema,
      default: {}
  }
});

export default mongoose.model('StudentProgress', StudentProgressSchema);