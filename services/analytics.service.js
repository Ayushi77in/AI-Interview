const Analytics = require('../models/Analytics.model');
const Interview = require('../models/Interview.model');

const updateUserAnalytics = async (userId) => {
  try {
    const interviews = await Interview.find({ 
      user: userId, 
      status: 'completed' 
    }).sort({ createdAt: -1 });

    if (interviews.length === 0) {
      await Analytics.findOneAndUpdate(
        { user: userId },
        { 
          user: userId,
          totalInterviews: 0,
          completedInterviews: 0,
          averageScore: 0,
          bestScore: 0,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );
      return;
    }

    const scores = interviews.map(i => i.overallScore).filter(s => s > 0);
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 
      : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const totalTime = interviews.reduce((sum, i) => sum + (i.duration || 0), 0);

    // Role breakdown
    const roleMap = {};
    interviews.forEach(interview => {
      if (!roleMap[interview.role]) {
        roleMap[interview.role] = { count: 0, scores: [], bestScore: 0 };
      }
      roleMap[interview.role].count++;
      if (interview.overallScore > 0) {
        roleMap[interview.role].scores.push(interview.overallScore);
        roleMap[interview.role].bestScore = Math.max(
          roleMap[interview.role].bestScore, 
          interview.overallScore
        );
      }
    });

    const roleBreakdown = Object.entries(roleMap).map(([role, data]) => ({
      role,
      count: data.count,
      averageScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10 
        : 0,
      bestScore: data.bestScore,
    }));

    // Difficulty breakdown
    const diffMap = {};
    interviews.forEach(interview => {
      if (!diffMap[interview.difficulty]) {
        diffMap[interview.difficulty] = { count: 0, scores: [] };
      }
      diffMap[interview.difficulty].count++;
      if (interview.overallScore > 0) {
        diffMap[interview.difficulty].scores.push(interview.overallScore);
      }
    });

    const difficultyBreakdown = Object.entries(diffMap).map(([difficulty, data]) => ({
      difficulty,
      count: data.count,
      averageScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10 
        : 0,
    }));

    // Topic performance
    const topicMap = {};
    interviews.forEach(interview => {
      interview.topicScores?.forEach(ts => {
        if (!topicMap[ts.topic]) {
          topicMap[ts.topic] = { scores: [], questions: 0, interviews: 0 };
        }
        topicMap[ts.topic].scores.push(ts.score);
        topicMap[ts.topic].questions += ts.questionsCount || 0;
        topicMap[ts.topic].interviews++;
      });
    });

    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      averageScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10 
        : 0,
      totalQuestions: data.questions,
      interviews: data.interviews,
    }));

    // Score history (last 20)
    const scoreHistory = interviews.slice(0, 20).map(interview => ({
      date: interview.completedAt || interview.createdAt,
      score: interview.overallScore,
      role: interview.role,
      interviewId: interview._id,
    }));

    // Monthly progress
    const monthlyMap = {};
    interviews.forEach(interview => {
      const date = new Date(interview.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { scores: [], count: 0 };
      }
      monthlyMap[key].count++;
      if (interview.overallScore > 0) {
        monthlyMap[key].scores.push(interview.overallScore);
      }
    });

    const monthlyProgress = Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, data]) => ({
        month,
        interviewsCount: data.count,
        averageScore: data.scores.length > 0 
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10 
          : 0,
      }));

    await Analytics.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        totalInterviews: interviews.length,
        completedInterviews: interviews.length,
        averageScore,
        bestScore,
        totalTimeSpent: totalTime,
        roleBreakdown,
        difficultyBreakdown,
        topicPerformance,
        scoreHistory,
        monthlyProgress,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Analytics update error:', error);
  }
};

module.exports = { updateUserAnalytics };
