const express = require('express');
const { body } = require('express-validator');
const {
  createInterview,
  startInterview,
  saveAnswer,
  completeInterview,
  getInterview,
  getUserInterviews,
  deleteInterview,
} = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getUserInterviews);

router.post('/', [
  body('role').notEmpty().withMessage('Role is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  body('totalQuestions').isIn([5, 10, 15]).withMessage('Questions must be 5, 10, or 15'),
  validate,
], createInterview);

router.get('/:id', getInterview);
router.patch('/:id/start', startInterview);
router.patch('/:id/answer', [
  body('questionIndex').isInt({ min: 0 }).withMessage('Invalid question index'),
  body('answer').notEmpty().withMessage('Answer is required'),
  validate,
], saveAnswer);
router.post('/:id/complete', completeInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
