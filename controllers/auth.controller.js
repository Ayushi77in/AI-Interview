const User = require('../models/User.model');
const Analytics = require('../models/Analytics.model');
const { generateToken } = require('../middleware/auth.middleware');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    // Initialize analytics
    await Analytics.create({ user: user._id });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account has been deactivated.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalInterviews: user.totalInterviews,
        averageScore: user.averageScore,
        bestScore: user.bestScore,
        bio: user.bio,
        skills: user.skills,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
};

module.exports = { register, login, getMe };
