const multer = require('multer');
const pdfParse = require('pdf-parse');
const { analyzeResume } = require('../services/gemini.service');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
});

const analyzeResumeHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume.' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Please ensure the PDF is not scanned/image-based.' });
    }

    // Analyze with Gemini
    const analysis = await analyzeResume(resumeText);

    res.json({
      message: 'Resume analyzed successfully.',
      analysis,
      textLength: resumeText.length,
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume.' });
  }
};

module.exports = { upload, analyzeResumeHandler };
