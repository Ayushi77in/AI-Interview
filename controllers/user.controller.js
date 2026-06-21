const User = require('../models/User.model');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills } = req.body;
    const updates = {};
    
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (skills) updates.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      updates, 
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
