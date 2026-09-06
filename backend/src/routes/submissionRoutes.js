const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateBody, studentSubmissionSchema } = require('../middleware/validate');

router.use(authMiddleware);

// Student Submissions
router.post('/', requireRole('student'), validateBody(studentSubmissionSchema), submissionController.submitAnswer);

// Student Lacking & Diagnostic Feedbacks
router.get('/my-feedback', requireRole('student'), submissionController.getMyFeedbacks);
router.get('/feedback/:questionId', requireRole('student'), submissionController.getQuestionFeedback);

module.exports = router;
