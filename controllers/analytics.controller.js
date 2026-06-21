const Analytics = require('../models/Analytics.model');
const Interview = require('../models/Interview.model');
const { updateUserAnalytics } = require('../services/analytics.service');

const getAnalytics = async (req, res) => {
  try {
    let analytics = await Analytics.findOne({ user: req.user._id });
    
    if (!analytics) {
      await updateUserAnalytics(req.user._id);
      analytics = await Analytics.findOne({ user: req.user._id });
    }

    // Get recent interviews
    const recentInterviews = await Interview.find({ 
      user: req.user._id,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('role difficulty overallScore completedAt totalQuestions duration');

    res.json({
      analytics: analytics || {
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        roleBreakdown: [],
        topicPerformance: [],
        monthlyProgress: [],
        scoreHistory: [],
      },
      recentInterviews,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

const refreshAnalytics = async (req, res) => {
  try {
    await updateUserAnalytics(req.user._id);
    const analytics = await Analytics.findOne({ user: req.user._id });
    res.json({ message: 'Analytics refreshed.', analytics });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh analytics.' });
  }
};

module.exports = { getAnalytics, refreshAnalytics };
