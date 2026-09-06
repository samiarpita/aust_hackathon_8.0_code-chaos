const submissionService = require('../services/submissionService');

class SubmissionController {
  async submitAnswer(req, res, next) {
    try {
      const { questionId, answerText } = req.validatedBody || req.body;
      const result = await submissionService.submitStudentAnswer({
        studentId: req.user.id,
        studentName: req.user.name,
        questionId,
        answerText
      });
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyFeedbacks(req, res, next) {
    try {
      const feedbacks = await submissionService.getStudentFeedbacks(req.user.id);
      return res.status(200).json(feedbacks);
    } catch (err) {
      next(err);
    }
  }

  async getQuestionFeedback(req, res, next) {
    try {
      const { questionId } = req.params;
      const feedback = await submissionService.getStudentQuestionFeedback(req.user.id, questionId);
      return res.status(200).json(feedback);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubmissionController();
