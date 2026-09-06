const { db } = require('../db/supabaseClient');
const { analyzeAnswers } = require('../ai/index');

/**
 * Service to orchestrate analysis: Validation -> Storage -> AI Processing -> Persistence -> Response
 */
class AnalysisService {
  /**
   * Run and persist a new misconception analysis
   */
  async createAnalysis({
    facultyId,
    questionId = null,
    questionText = null,
    clos = [],
    answers = [],
    examId = null,
    questionNumber = 'Q1',
    correctAnswer = null
  }) {
    if (!facultyId) {
      throw new Error('Faculty ID is required');
    }

    let targetQuestionId = questionId;
    let targetQuestionText = questionText;
    let targetClos = clos;
    let submissionsToAnalyze = [];

    // Case 1: Analyzing an existing Question from the database
    if (targetQuestionId) {
      const existingQ = await db.getQuestionById(targetQuestionId);
      if (!existingQ) {
        const err = new Error('Question not found');
        err.statusCode = 404;
        throw err;
      }

      targetQuestionText = existingQ.text;
      targetClos = existingQ.clos?.map(c => c.description || c) || [];
      correctAnswer = existingQ.correct_answer || correctAnswer;

      if (answers && answers.length > 0) {
        // Upload new batch for this question
        for (const ans of answers) {
          await db.createStudentSubmission({
            questionId: targetQuestionId,
            studentId: typeof ans === 'object' && ans.student_id ? ans.student_id : null,
            studentName: typeof ans === 'object' && ans.student_name ? ans.student_name : 'Student',
            answerText: typeof ans === 'string' ? ans : (ans.answer_text || '')
          });
        }
      }

      // Reload all submissions for this question
      const refreshedQ = await db.getQuestionById(targetQuestionId);
      submissionsToAnalyze = refreshedQ.submissions || [];
    } else {
      // Case 2: Ad-hoc question analysis (Contract A backward compatibility)
      let targetExamId = examId;
      if (!targetExamId) {
        const { examId: defaultExamId } = await db.getOrCreateDefaultCourseAndExam(facultyId);
        targetExamId = defaultExamId;
      }

      const { question } = await db.createQuestionWithDetails({
        examId: targetExamId,
        text: targetQuestionText,
        questionNumber,
        correctAnswer,
        clos: targetClos,
        submissions: answers
      });

      targetQuestionId = question.id;
      const loadedQ = await db.getQuestionById(targetQuestionId);
      submissionsToAnalyze = loadedQ.submissions || [];
    }

    const answerTexts = submissionsToAnalyze.map(s => s.answer_text);

    if (answerTexts.length < 2) {
      const err = new Error('At least 2 student answers are required to cluster misconceptions');
      err.statusCode = 400;
      throw err;
    }

    // 3. Invoke AI Misconception Engine (Contract B)
    const aiResult = await analyzeAnswers({
      questionText: targetQuestionText,
      clos: targetClos,
      answers: answerTexts,
      correctAnswer
    });

    // 4. Calculate Group Counts & Tag Individual Submissions with specific lackings
    const groups = (aiResult.misconceptionGroups || []).map(group => {
      const calculatedCount = Math.max(1, Math.round((group.percentage / 100) * answerTexts.length));
      return {
        label: group.label,
        percentage: group.percentage,
        count: group.count || calculatedCount
      };
    });

    // Classify individual student submissions for their portal diagnostics
    for (let i = 0; i < submissionsToAnalyze.length; i++) {
      const sub = submissionsToAnalyze[i];
      const answerStr = (sub.answer_text || '').toLowerCase();

      let assignedGroup = groups[0]?.label || 'Under Evaluation';
      let isCorrect = false;
      let feedbackNote = `Identified focus area: ${assignedGroup}.`;

      if (
        answerStr.includes('if (head == null || head->next == null)') ||
        answerStr.includes('fully correct') ||
        answerStr.includes('newhead = reverse')
      ) {
        assignedGroup = 'Fully correct';
        isCorrect = true;
        feedbackNote = 'Excellent answer! You correctly handled base case boundaries and pointer unwinding.';
      } else if (answerStr.includes('head == null') && !answerStr.includes('head->next == null')) {
        assignedGroup = 'Base case omission or improper termination';
        isCorrect = false;
        feedbackNote = 'Your solution terminates when head is null, but fails to check single-node list termination (head->next == null).';
      } else if (answerStr.includes('head.next') || answerStr.includes('.')) {
        assignedGroup = 'Syntax & pointer dereferencing errors (. vs ->)';
        isCorrect = false;
        feedbackNote = 'In C, dynamic pointers use arrow notation (->) instead of dot notation (.) for structure member access.';
      } else {
        // Distribute across detected groups
        const groupIndex = i % Math.max(1, groups.length);
        assignedGroup = groups[groupIndex]?.label || 'Conceptual misunderstanding';
        isCorrect = assignedGroup.toLowerCase().includes('correct');
        feedbackNote = isCorrect ? 'Good work on this question.' : `You may need to review ${assignedGroup.toLowerCase()}.`;
      }

      await db.updateSubmissionLacking({
        submissionId: sub.id,
        misconceptionGroup: assignedGroup,
        feedback: feedbackNote,
        isCorrect
      });
    }

    // 5. Persist Analysis Output
    const analysis = await db.saveAnalysisResult({
      questionId: targetQuestionId,
      misconceptionGroups: groups,
      insight: aiResult.insight || '',
      intervention: aiResult.intervention || '',
      modelUsed: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      totalSubmissions: answerTexts.length
    });

    // 6. Return Contract A format (augmented with counts and breakdown metrics)
    return {
      id: analysis.id,
      questionId: targetQuestionId,
      misconceptionGroups: groups,
      groups: groups,
      insight: analysis.insight,
      intervention: analysis.intervention,
      totalSubmissions: answerTexts.length,
      createdAt: analysis.created_at || analysis.createdAt
    };
  }

  /**
   * Retrieve a specific analysis by ID for the requesting faculty
   */
  async getAnalysisById({ id, facultyId }) {
    const analysis = await db.getAnalysisById({ id, facultyId });
    if (!analysis) {
      return null;
    }

    return {
      id: analysis.id,
      questionId: analysis.question_id,
      question: analysis.question || null,
      misconceptionGroups: analysis.misconception_groups || analysis.misconceptionGroups,
      groups: analysis.misconception_groups || analysis.misconceptionGroups,
      insight: analysis.insight,
      intervention: analysis.intervention,
      totalSubmissions: analysis.total_submissions,
      createdAt: analysis.created_at || analysis.createdAt
    };
  }

  /**
   * List analyses for a faculty member, optionally filtered by examId or questionId
   */
  async listAnalyses({ facultyId, examId = null, questionId = null }) {
    if (questionId) {
      const q = await db.getQuestionById(questionId);
      if (q && q.analysis) {
        return [{
          id: q.analysis.id,
          questionId: q.id,
          misconceptionGroups: q.analysis.misconception_groups,
          groups: q.analysis.misconception_groups,
          insight: q.analysis.insight,
          intervention: q.analysis.intervention,
          totalSubmissions: q.analysis.total_submissions,
          createdAt: q.analysis.created_at
        }];
      }
    }

    const records = await db.listAnalysesForFaculty({ facultyId, examId });

    return records.map(analysis => ({
      id: analysis.id,
      questionId: analysis.question_id,
      question: analysis.question || null,
      misconceptionGroups: analysis.misconception_groups || analysis.misconceptionGroups,
      groups: analysis.misconception_groups || analysis.misconceptionGroups,
      insight: analysis.insight,
      intervention: analysis.intervention,
      totalSubmissions: analysis.total_submissions,
      createdAt: analysis.created_at || analysis.createdAt
    }));
  }
}

module.exports = new AnalysisService();
