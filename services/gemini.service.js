const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGenAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const ROLE_TOPICS = {
  'Software Engineer': ['algorithms', 'data structures', 'system design', 'OOP', 'databases', 'APIs', 'debugging', 'code quality'],
  'Frontend Developer': ['React', 'JavaScript', 'HTML/CSS', 'TypeScript', 'state management', 'performance optimization', 'responsive design', 'browser APIs'],
  'Backend Developer': ['Node.js', 'REST APIs', 'databases', 'authentication', 'caching', 'microservices', 'security', 'scalability'],
  'Java Developer': ['Java fundamentals', 'Spring Boot', 'JVM', 'multithreading', 'design patterns', 'Maven/Gradle', 'testing', 'Java collections'],
  'MERN Stack Developer': ['MongoDB', 'Express.js', 'React', 'Node.js', 'REST APIs', 'state management', 'authentication', 'deployment'],
  'Data Structures & Algorithms': ['arrays', 'linked lists', 'trees', 'graphs', 'sorting algorithms', 'dynamic programming', 'recursion', 'complexity analysis'],
  'HR Interview': ['behavioral questions', 'leadership', 'teamwork', 'conflict resolution', 'career goals', 'strengths/weaknesses', 'communication', 'problem-solving'],
};

const generateInterviewQuestions = async (role, difficulty, count) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const topics = ROLE_TOPICS[role] || ROLE_TOPICS['Software Engineer'];
  const topicsStr = topics.join(', ');

  const difficultyGuide = {
    easy: 'fundamental concepts, basic definitions, simple scenarios for fresh graduates',
    medium: 'intermediate concepts, real-world scenarios, some problem-solving for 1-3 years experience',
    hard: 'advanced concepts, complex scenarios, architectural decisions, senior-level thinking',
  };

  const prompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions for a ${role} position.

Requirements:
- Difficulty: ${difficulty} (${difficultyGuide[difficulty]})
- Topics to cover: ${topicsStr}
- Mix conceptual, practical, and scenario-based questions
- Each question should test real knowledge and skills
- For HR Interview, focus on behavioral and situational questions

Return ONLY a valid JSON array with this exact structure, no markdown, no extra text:
[
  {
    "questionNumber": 1,
    "question": "Your question here",
    "category": "Topic category from the list",
    "difficulty": "${difficulty}"
  }
]

Generate exactly ${count} questions covering different topics from: ${topicsStr}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response - remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const questions = JSON.parse(cleaned);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format from AI');
    }

    // Ensure proper structure
    return questions.slice(0, count).map((q, i) => ({
      questionNumber: i + 1,
      question: q.question || `Question ${i + 1} about ${role}`,
      category: q.category || topics[i % topics.length],
      difficulty: difficulty,
    }));
  } catch (error) {
    console.error('Gemini question generation error:', error);
    // Return fallback questions if AI fails
    return generateFallbackQuestions(role, difficulty, count, topics);
  }
};

const evaluateAnswer = async (question, answer, role, difficulty) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  if (!answer || answer.trim().length < 5) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ['No answer provided'],
      betterAnswer: 'Please provide a detailed answer to this question.',
      suggestions: ['Attempt to answer all questions even if unsure'],
      evaluated: true,
    };
  }

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer for a ${role} position (${difficulty} difficulty).

Question: "${question}"

Candidate's Answer: "${answer}"

Evaluate this answer and return ONLY a valid JSON object with this exact structure, no markdown:
{
  "score": <number 0-10>,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "betterAnswer": "A comprehensive model answer for this question",
  "suggestions": ["specific suggestion 1", "specific suggestion 2"]
}

Scoring guide:
- 0-2: Completely wrong or no relevant content
- 3-4: Some understanding but major gaps
- 5-6: Basic understanding, missing key points
- 7-8: Good answer with minor gaps
- 9-10: Excellent, comprehensive answer

Be specific, constructive, and professional in feedback.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const evaluation = JSON.parse(cleaned);
    
    return {
      score: Math.min(10, Math.max(0, Number(evaluation.score) || 0)),
      strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths.slice(0, 4) : [],
      weaknesses: Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses.slice(0, 4) : [],
      betterAnswer: evaluation.betterAnswer || '',
      suggestions: Array.isArray(evaluation.suggestions) ? evaluation.suggestions.slice(0, 3) : [],
      evaluated: true,
    };
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    return {
      score: 5,
      strengths: ['Answer was attempted'],
      weaknesses: ['Could not fully evaluate due to technical issues'],
      betterAnswer: 'Please review the correct answer for this topic.',
      suggestions: ['Review the core concepts for this topic'],
      evaluated: true,
    };
  }
};

const generateOverallFeedback = async (interview) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const questionsWithAnswers = interview.questions.map(q => ({
    question: q.question,
    answer: q.userAnswer,
    score: q.evaluation.score,
    category: q.category,
  }));

  const avgScore = interview.overallScore;

  const prompt = `You are an expert technical interviewer providing overall feedback after a complete mock interview.

Role: ${interview.role}
Difficulty: ${interview.difficulty}
Overall Score: ${avgScore}/10
Questions & Performance:
${JSON.stringify(questionsWithAnswers, null, 2)}

Generate a comprehensive overall feedback. Return ONLY valid JSON, no markdown:
{
  "summary": "2-3 sentence overall performance summary",
  "strengths": ["key strength 1", "key strength 2", "key strength 3"],
  "improvements": ["area to improve 1", "area to improve 2", "area to improve 3"],
  "recommendation": "Clear recommendation: Ready for interviews / Needs more preparation / etc."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Overall feedback generation error:', error);
    return {
      summary: `You completed the ${interview.role} interview with a score of ${avgScore}/10.`,
      strengths: ['Completed the interview', 'Attempted all questions'],
      improvements: ['Review weaker topic areas', 'Practice more mock interviews'],
      recommendation: avgScore >= 7 ? 'Good performance! Ready for interviews.' : 'Needs more preparation in key areas.',
    };
  }
};

const analyzeResume = async (resumeText) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are an expert ATS resume analyzer and career coach. Analyze this resume and provide detailed feedback.

Resume Text:
${resumeText.substring(0, 3000)}

Return ONLY valid JSON, no markdown:
{
  "overallScore": <number 0-100>,
  "extractedSkills": ["skill1", "skill2"],
  "recommendedRoles": ["role1", "role2", "role3"],
  "strengths": ["strength1", "strength2"],
  "improvements": [
    {
      "section": "Section name",
      "issue": "What's wrong",
      "suggestion": "How to fix it"
    }
  ],
  "atsKeywords": ["keyword1", "keyword2"],
  "summary": "Brief 2-3 sentence analysis"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

// Fallback questions if AI is unavailable
const generateFallbackQuestions = (role, difficulty, count, topics) => {
  const fallbacks = {
    'Software Engineer': [
      { question: "Explain the difference between stack and heap memory.", category: "data structures" },
      { question: "What is Big O notation and why is it important?", category: "algorithms" },
      { question: "Describe RESTful API design principles.", category: "APIs" },
      { question: "What is a database index and when should you use one?", category: "databases" },
      { question: "Explain the SOLID principles in object-oriented programming.", category: "OOP" },
    ],
    'Frontend Developer': [
      { question: "What is the Virtual DOM in React and how does it improve performance?", category: "React" },
      { question: "Explain the difference between null, undefined, and NaN in JavaScript.", category: "JavaScript" },
      { question: "What are CSS specificity rules?", category: "HTML/CSS" },
      { question: "How does event delegation work in JavaScript?", category: "JavaScript" },
      { question: "Explain the React component lifecycle.", category: "React" },
    ],
  };

  const base = fallbacks[role] || fallbacks['Software Engineer'];
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    const baseQ = base[i % base.length];
    questions.push({
      questionNumber: i + 1,
      question: baseQ.question,
      category: baseQ.category,
      difficulty: difficulty,
    });
  }
  
  return questions;
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
  analyzeResume,
};
