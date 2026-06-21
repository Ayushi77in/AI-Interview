const express = require('express');
const { upload, analyzeResumeHandler } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/analyze', upload.single('resume'), analyzeResumeHandler);

module.exports = router;
