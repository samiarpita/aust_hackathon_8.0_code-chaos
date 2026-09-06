const questionService = require('../services/questionService');

class QuestionController {
  async createQuestion(req, res, next) {
    try {
      const { examId, questionNumber, text, correctAnswer, maxMarks, clos } = req.validatedBody || req.body;
      const result = await questionService.createQuestion({
        examId,
        questionNumber,
        text,
        correctAnswer,
        maxMarks,
        clos
      });
      return res.status(201).json(result.question);
    } catch (err) {
      next(err);
    }
  }

  async getQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const question = await questionService.getQuestion(id);
      return res.status(200).json(question);
    } catch (err) {
      next(err);
    }
  }

  async listQuestions(req, res, next) {
    try {
      const { examId } = req.query;
      if (!examId) {
        return res.status(400).json({ error: 'examId query parameter is required' });
      }
      const questions = await questionService.listQuestions(examId);
      return res.status(200).json(questions);
    } catch (err) {
      next(err);
    }
  }

  async uploadSubmissions(req, res, next) {
    try {
      const { id } = req.params;
      const { submissions, rawText } = req.body;
      const result = await questionService.uploadSubmissionsBatch({
        questionId: id,
        submissions,
        rawText
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QuestionController();
