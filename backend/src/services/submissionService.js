const { db } = require('../db/supabaseClient');

class SubmissionService {
  /**
   * Student submits an answer for a specific question
   */
  async submitStudentAnswer({ studentId, studentName, questionId, answerText }) {
    let question = await db.getQuestionById(questionId);
    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    const submission = await db.createStudentSubmission({
      questionId: question.id,
      studentId,
      studentName,
      answerText
    });

    // Provide instant diagnostic evaluation
    let diagnostic = {
      isCorrect: false,
      identifiedLacking: 'Under AI Evaluation',
      feedback: 'Your answer has been submitted and registered for faculty evaluation.',
      recommendedAction: 'Review the lecture notes and compare with the faculty reference answer.'
    };

    const answerStr = (answerText || '').toLowerCase();
    const qNum = question.question_number || questionId;

    if (qNum === 'Q1') {
      if (answerStr.includes('base case') && (answerStr.includes('terminate') || answerStr.includes('stop') || answerStr.includes('overflow') || answerStr.includes('return') || answerStr.includes('<= 0'))) {
        diagnostic = {
          isCorrect: true,
          identifiedLacking: 'Concept Mastered',
          feedback: 'Excellent explanation! You correctly identified that the base case terminates recursive activation records to prevent stack overflow.',
          recommendedAction: 'Ready for advanced recursion problems and tree structures.'
        };
      } else {
        diagnostic = {
          isCorrect: false,
          identifiedLacking: 'Missing Call-Stack Unwinding Concept',
          feedback: 'Your answer does not clearly explain how stack frames pop off the call stack when the terminating condition is met.',
          recommendedAction: 'Review call stack trace diagrams and ensure boundary base checks are specified.'
        };
      }
    } else if (qNum === 'Q2') {
      if (answerStr.includes('malloc') && (answerStr.includes('stack') || answerStr.includes('heap') || answerStr.includes('free'))) {
        diagnostic = {
          isCorrect: true,
          identifiedLacking: 'Concept Mastered',
          feedback: 'Well done! You accurately distinguished automatic stack frame deallocation from dynamic heap persistence.',
          recommendedAction: 'Practice memory profiling tools and pointer freeing.'
        };
      } else {
        diagnostic = {
          isCorrect: false,
          identifiedLacking: 'Dangling Stack Memory Misconception',
          feedback: 'Warning: Stack variables are invalidated upon function return. Returning a local stack address creates a dangling pointer.',
          recommendedAction: 'Use malloc() to allocate memory on the heap so it remains valid after function return.'
        };
      }
    } else {
      if (answerStr.includes('head == null || head->next == null') || (answerStr.includes('head == null') && answerStr.includes('next == null'))) {
        diagnostic = {
          isCorrect: true,
          identifiedLacking: 'Concept Mastered',
          feedback: 'Perfect! You handled both empty list and single-node list termination conditions before recursive inversion.',
          recommendedAction: 'Excellent job. Try implementing iterative reversal next.'
        };
      } else {
        diagnostic = {
          isCorrect: false,
          identifiedLacking: 'Missing Base Case Boundary Termination',
          feedback: 'Your implementation invokes reverse(head->next) without validating if head == NULL || head->next == NULL. This causes a segmentation fault on empty or 1-node lists.',
          recommendedAction: 'Add the 2-line guard check at the top of your function before invoking recursion.'
        };
      }
    }

    // Persist diagnostic result on submission
    await db.updateSubmissionLacking({
      submissionId: submission.id,
      misconceptionGroup: diagnostic.identifiedLacking,
      feedback: diagnostic.feedback,
      isCorrect: diagnostic.isCorrect
    });

    return {
      message: 'Answer submitted successfully',
      submission: {
        ...submission,
        misconception_group: diagnostic.identifiedLacking,
        feedback: diagnostic.feedback,
        is_correct: diagnostic.isCorrect
      },
      diagnostic,
      question: {
        id: question.id,
        questionNumber: question.question_number || questionId,
        text: question.text,
        correctAnswer: question.correct_answer
      }
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
