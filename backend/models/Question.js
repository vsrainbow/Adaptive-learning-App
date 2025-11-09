import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: Number,
    required: true, // e.g., 1 (easy) to 5 (hard)
  },
  explanation: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Question', QuestionSchema);