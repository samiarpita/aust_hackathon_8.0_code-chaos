const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { validateBody, createQuestionSchema } = require('../middleware/validate');

router.use(authMiddleware);

// Questions
router.get('/', questionController.listQuestions);
router.get('/:id', questionController.getQuestion);
router.post('/', requireRole('faculty'), validateBody(createQuestionSchema), questionController.createQuestion);

// Batch upload student answers (TXT, CSV, JSON payload)
router.post('/:id/upload', requireRole('faculty'), questionController.uploadSubmissions);

module.exports = router;
