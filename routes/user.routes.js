const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
  validate,
], updateProfile);
router.patch('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], changePassword);

module.exports = router;
