const { db } = require('../db/supabaseClient');

class QuestionService {
  async createQuestion({ examId, questionNumber = 'Q1', text, correctAnswer = null, maxMarks = 10.0, clos = [] }) {
    return await db.createQuestionWithDetails({
      examId,
      text,
      questionNumber,
      correctAnswer,
      clos,
      submissions: []
    });
  }

  async getQuestion(questionId) {
    const question = await db.getQuestionById(questionId);
    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }
    return question;
  }

  async listQuestions(examId) {
    return await db.listQuestionsForExam(examId);
  }

  async uploadSubmissionsBatch({ questionId, submissions = [], rawText = null }) {
    let answersToInsert = [];

    if (Array.isArray(submissions) && submissions.length > 0) {
      answersToInsert = submissions.map((s, idx) => ({
        student_id: typeof s === 'object' && s.student_id ? s.student_id : null,
        student_name: typeof s === 'object' && s.student_name ? s.student_name : `Student ${idx + 1}`,
        student_identifier: typeof s === 'object' && s.student_identifier ? s.student_identifier : `Student ${idx + 1}`,
        answer_text: typeof s === 'string' ? s : (s.answer_text || '')
      }));
    } else if (rawText) {
      // Split by double newline or CSV lines
      const lines = rawText.split(/\r?\n\r?\n|\r?\n/).map(l => l.trim()).filter(Boolean);
      answersToInsert = lines.map((line, idx) => ({
        student_name: `Student ${idx + 1}`,
        student_identifier: `Student ${idx + 1}`,
        answer_text: line
      }));
    }

    if (answersToInsert.length === 0) {
      const err = new Error('No valid student answers provided to upload');
      err.statusCode = 400;
      throw err;
    }

    for (const item of answersToInsert) {
      await db.createStudentSubmission({
        questionId,
        studentId: item.student_id,
        studentName: item.student_name,
        answerText: item.answer_text
      });
    }

    return {
      message: `Successfully uploaded ${answersToInsert.length} student answers`,
      uploadedCount: answersToInsert.length
    };
  }

  async approveSolution(questionId, isApproved = true) {
    const updated = await db.setQuestionSolutionApproval({
      questionId,
      isApproved: Boolean(isApproved)
    });
    return {
      message: `Question solution ${isApproved ? 'approved and unlocked for students' : 'locked and hidden from students'}`,
      question: updated
    };
  }
}

module.exports = new QuestionService();
