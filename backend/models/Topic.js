import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  // We can add prerequisites later
  // prerequisites: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Topic'
  // }],
  order: {
    type: Number,
    required: true,
    unique: true
  }
});

export default mongoose.model('Topic', TopicSchema);