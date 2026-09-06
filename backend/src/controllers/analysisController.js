const analysisService = require('../services/analysisService');

/**
 * Analysis Controller handling HTTP requests matching Contract A
 */
class AnalysisController {
  /**
   * POST /api/analyses
   */
  async createAnalysis(req, res, next) {
    try {
      const facultyId = req.user?.id;
      const {
        questionId,
        questionText,
        clos,
        answers,
        examId,
        courseId,
        courseCode,
        courseName,
        assignmentTitle,
        questionNumber,
        correctAnswer,
        assignmentType,
        isSolutionApproved
      } = req.validatedBody || req.body;

      const result = await analysisService.createAnalysis({
        facultyId,
        questionId,
        questionText,
        clos,
        answers,
        examId,
        courseId,
        courseCode,
        courseName,
        assignmentTitle,
        questionNumber,
        correctAnswer,
        assignmentType,
        isSolutionApproved
      });

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analyses/:id
   */
  async getAnalysisById(req, res, next) {
    try {
      const facultyId = req.user?.id;
      const { id } = req.params;

      const result = await analysisService.getAnalysisById({ id, facultyId });

      if (!result) {
        return res.status(404).json({
          error: 'Analysis not found or you do not have permission to view it'
        });
      }

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/analyses?examId=&questionId=
   */
  async listAnalyses(req, res, next) {
    try {
      const facultyId = req.user?.id;
      const { examId, questionId } = req.query;

      const results = await analysisService.listAnalyses({ facultyId, examId, questionId });

      return res.status(200).json(results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalysisController();
