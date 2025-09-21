import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'Data Science',
      'UI/UX Design',
      'Digital Marketing',
      'Cloud Computing',
      'Cybersecurity',
      'Artificial Intelligence',
      'DevOps',
      'Blockchain'
    ]
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  poster: {
    type: String, // URL to the uploaded image
    default: null
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      default: ''
    }
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Project', projectSchema);