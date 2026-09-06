const { db } = require('../db/supabaseClient');

class SubmissionService {
  /**
   * Student submits an answer for a specific question
   */
  async submitStudentAnswer({ studentId, studentName, questionId, answerText }) {
    const question = await db.getQuestionById(questionId);
    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    const submission = await db.createStudentSubmission({
      questionId,
      studentId,
      studentName,
      answerText
    });

    return {
      message: 'Answer submitted successfully',
      submission
    };
  }

  /**
   * List all submissions and personalized lackings for the authenticated student
   */
  async getStudentFeedbacks(studentId) {
    const records = await db.listSubmissionsForStudent(studentId);

    return records.map(item => {
      const sub = item.submission || item;
      const question = item.question || item.questions;
      const analysis = item.analysis || question?.analyses?.[0] || question?.analyses;

      const hasAnalysis = !!(sub.misconception_group || analysis);

      return {
        submissionId: sub.id,
        questionId: sub.question_id,
        questionNumber: question?.question_number || 'Q',
        questionText: question?.text || '',
        correctAnswer: question?.correct_answer || null,
        myAnswer: sub.answer_text,
        submittedAt: sub.created_at,
        analysisStatus: hasAnalysis ? 'analyzed' : 'pending_faculty_analysis',
        evaluation: {
          isCorrect: sub.is_correct || sub.misconception_group === 'Fully correct' || sub.misconception_group === 'Correct',
          identifiedLacking: sub.misconception_group || (analysis ? 'Needs Review' : 'Under Review'),
          feedback: sub.feedback || analysis?.insight || 'Analysis pending from faculty.',
          recommendedAction: analysis?.intervention || 'Keep practicing core problem patterns.'
        }
      };
    });
  }

  /**
   * Get single feedback for a specific question
   */
  async getStudentQuestionFeedback(studentId, questionId) {
    const data = await db.getStudentFeedbackForQuestion(studentId, questionId);
    if (!data || !data.submission) {
      const err = new Error('No submission found for this question');
      err.statusCode = 404;
      throw err;
    }

    const sub = data.submission;
    const question = data.question;
    const analysis = data.analysis;

    return {
      submissionId: sub.id,
      questionId: question?.id,
      questionNumber: question?.question_number || 'Q',
      questionText: question?.text || '',
      correctAnswer: question?.correct_answer || null,
      myAnswer: sub.answer_text,
      isCorrect: sub.is_correct || sub.misconception_group === 'Fully correct',
      identifiedLacking: sub.misconception_group || 'Under Evaluation',
      detailedFeedback: sub.feedback || analysis?.insight || 'No specific misconception assigned.',
      recommendedAction: analysis?.intervention || 'Review base principles with instructor.',
      classInsight: analysis?.insight || null
    };
  }
}

module.exports = new SubmissionService();
