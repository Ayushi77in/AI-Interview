const Interview = require('../models/Interview.model');
const User = require('../models/User.model');
const { generateInterviewQuestions, evaluateAnswer, generateOverallFeedback } = require('../services/gemini.service');
const { updateUserAnalytics } = require('../services/analytics.service');

// Create new interview
const createInterview = async (req, res) => {
  try {
    const { role, difficulty, totalQuestions } = req.body;

    const validRoles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Java Developer', 'MERN Stack Developer', 'Data Structures & Algorithms', 'HR Interview'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    const validQuestions = [5, 10, 15];
    if (!validQuestions.includes(Number(totalQuestions))) {
      return res.status(400).json({ error: 'Invalid question count.' });
    }

    // Generate questions via Gemini
    const questionsData = await generateInterviewQuestions(role, difficulty, Number(totalQuestions));

    const interview = await Interview.create({
      user: req.user._id,
      role,
      difficulty,
      totalQuestions: Number(totalQuestions),
      questions: questionsData,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Interview created successfully.',
      interview: {
        _id: interview._id,
        role: interview.role,
        difficulty: interview.difficulty,
        totalQuestions: interview.totalQuestions,
        questions: interview.questions,
        status: interview.status,
        createdAt: interview.createdAt,
      },
    });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: error.message || 'Failed to create interview.' });
  }
};

// Start interview
const startInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed.' });
    }

    interview.status = 'in-progress';
    interview.startedAt = new Date();
    await interview.save();

    res.json({ message: 'Interview started.', interview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start interview.' });
  }
};

// Save answer
const saveAnswer = async (req, res) => {
  try {
    const { questionIndex, answer, timeSpent } = req.body;
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed.' });
    }

    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ error: 'Invalid question index.' });
    }

    interview.questions[questionIndex].userAnswer = answer || '';
    interview.questions[questionIndex].answeredAt = new Date();
    interview.questions[questionIndex].timeSpent = timeSpent || 0;
    interview.currentQuestion = Math.max(interview.currentQuestion, questionIndex + 1);
    
    await interview.save();

    res.json({ message: 'Answer saved.', questionIndex });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save answer.' });
  }
};

// Complete interview and evaluate
const completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ error: 'Interview already completed.' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    
    if (interview.startedAt) {
      interview.duration = Math.round(
        (interview.completedAt - interview.startedAt) / 60000
      );
    }

    // Evaluate all answers with Gemini
    const evaluationPromises = interview.questions.map(async (q) => {
      const evaluation = await evaluateAnswer(
        q.question,
        q.userAnswer,
        interview.role,
        interview.difficulty
      );
      q.evaluation = evaluation;
      return q;
    });

    interview.questions = await Promise.all(evaluationPromises);

    // Calculate scores
    interview.calculateOverallScore();
    interview.calculateTopicScores();

    // Generate overall feedback
    const overallFeedback = await generateOverallFeedback(interview);
    interview.overallFeedback = overallFeedback;

    await interview.save();

    // Update user stats and analytics
    await updateUserAnalytics(req.user._id);
    const user = await User.findById(req.user._id);
    await user.updateStats();

    res.json({
      message: 'Interview completed and evaluated.',
      interview,
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ error: error.message || 'Failed to complete interview.' });
  }
};

// Get single interview
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview.' });
  }
};

// Get all interviews for user
const getUserInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const role = req.query.role;

    const query = { user: req.user._id };
    if (status) query.status = status;
    if (role) query.role = role;

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-questions.evaluation.betterAnswer'),
      Interview.countDocuments(query),
    ]);

    res.json({
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviews.' });
  }
};

// Delete interview
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    await updateUserAnalytics(req.user._id);
    const user = await User.findById(req.user._id);
    await user.updateStats();

    res.json({ message: 'Interview deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete interview.' });
  }
};

module.exports = {
  createInterview,
  startInterview,
  saveAnswer,
  completeInterview,
  getInterview,
  getUserInterviews,
  deleteInterview,
};
