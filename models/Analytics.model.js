const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  totalInterviews: { type: Number, default: 0 },
  completedInterviews: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // minutes
  
  roleBreakdown: [{
    role: String,
    count: Number,
    averageScore: Number,
    bestScore: Number,
  }],
  
  difficultyBreakdown: [{
    difficulty: String,
    count: Number,
    averageScore: Number,
  }],
  
  topicPerformance: [{
    topic: String,
    averageScore: Number,
    totalQuestions: Number,
    interviews: Number,
  }],
  
  weeklyProgress: [{
    week: String, // "2024-W01"
    interviewsCount: Number,
    averageScore: Number,
  }],
  
  monthlyProgress: [{
    month: String, // "2024-01"
    interviewsCount: Number,
    averageScore: Number,
  }],
  
  scoreHistory: [{
    date: Date,
    score: Number,
    role: String,
    interviewId: mongoose.Schema.Types.ObjectId,
  }],
  
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Analytics', analyticsSchema);
