const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  question: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  userAnswer: { type: String, default: '' },
  answeredAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // seconds
  evaluation: {
    score: { type: Number, min: 0, max: 10, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    betterAnswer: { type: String, default: '' },
    suggestions: [{ type: String }],
    evaluated: { type: Boolean, default: false },
  },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    enum: [
      'Software Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Java Developer',
      'MERN Stack Developer',
      'Data Structures & Algorithms',
      'HR Interview',
    ],
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
  },
  totalQuestions: {
    type: Number,
    required: true,
    enum: [5, 10, 15],
  },
  questions: [questionSchema],
  currentQuestion: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'abandoned'],
    default: 'pending',
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  overallFeedback: {
    summary: { type: String, default: '' },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    recommendation: { type: String, default: '' },
  },
  startedAt: { type: Date },
  completedAt: { type: Date },
  duration: { type: Number, default: 0 }, // minutes
  topicScores: [{
    topic: String,
    score: Number,
    questionsCount: Number,
  }],
}, {
  timestamps: true,
});

// Indexes for analytics queries
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, status: 1 });
interviewSchema.index({ user: 1, role: 1 });

// Calculate overall score before saving
interviewSchema.methods.calculateOverallScore = function() {
  const evaluated = this.questions.filter(q => q.evaluation.evaluated);
  if (evaluated.length === 0) return 0;
  const total = evaluated.reduce((sum, q) => sum + q.evaluation.score, 0);
  this.overallScore = Math.round((total / evaluated.length) * 10) / 10;
  return this.overallScore;
};

// Calculate topic scores
interviewSchema.methods.calculateTopicScores = function() {
  const topicMap = {};
  
  this.questions.forEach(q => {
    if (!q.evaluation.evaluated) return;
    const topic = q.category || 'General';
    if (!topicMap[topic]) {
      topicMap[topic] = { total: 0, count: 0 };
    }
    topicMap[topic].total += q.evaluation.score;
    topicMap[topic].count++;
  });

  this.topicScores = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    score: Math.round((data.total / data.count) * 10) / 10,
    questionsCount: data.count,
  }));
};

module.exports = mongoose.model('Interview', interviewSchema);
