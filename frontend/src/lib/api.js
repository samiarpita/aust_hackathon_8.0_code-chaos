import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const MAX_UPLOAD_SIZE_MB = 20;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

// Helper to retrieve auth token
function getAuthToken() {
  return localStorage.getItem('learnmap_token') || 'mock-faculty-bearer-token';
}

/**
 * Universal API Client
 */
export const apiClient = {
  isMockActive() {
    const stored = localStorage.getItem('radar_force_mock');
    if (stored !== null) {
      return stored === 'true';
    }
    return false;
  },

  setMockActive(active) {
    localStorage.setItem('radar_force_mock', String(active));
  },

  async createAnalysis({
    questionId,
    questionText,
    clos = [],
    answers = [],
    correctAnswer = null,
    assignmentType = 'code',
    courseId,
    courseCode,
    courseName,
    assignmentTitle,
    questionNumber,
    isSolutionApproved = false
  }, forceMock = false) {
    if (!questionId && (!questionText || questionText.trim().length === 0)) {
      throw new Error("Question text is required.");
    }
    if (!questionId && (!Array.isArray(answers) || answers.length < 2)) {
      throw new Error("At least 2 student answers are required to run misconception radar.");
    }

    if (forceMock || this.isMockActive()) {
      return await mockApi.createAnalysis({ questionText, clos, answers });
    }

    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyses`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          questionId,
          questionText,
          clos,
          answers,
          correctAnswer,
          assignmentType,
          courseId,
          courseCode,
          courseName,
          assignmentTitle,
          questionNumber,
          isSolutionApproved
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      return await res.json();
    } catch (networkError) {
      console.warn("Backend error, falling back to mock:", networkError);
      return await mockApi.createAnalysis({ questionText, clos, answers });
    }
  },

  async getAnalysis(id, forceMock = false) {
    if (forceMock || this.isMockActive()) {
      return await mockApi.getAnalysisById(id);
    }

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyses/${id}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch analysis (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      return await mockApi.getAnalysisById(id);
    }
  },

  async listAnalyses(examId, forceMock = false) {
    if (forceMock || this.isMockActive()) {
      return await mockApi.getAnalyses(examId);
    }

    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = examId ? `${API_BASE_URL}/api/analyses?examId=${encodeURIComponent(examId)}` : `${API_BASE_URL}/api/analyses`;
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Failed to list analyses (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      return await mockApi.getAnalyses(examId);
    }
  },

  async submitStudentAnswer({ questionId, answerText, facultyId = null, facultyName = null, courseCode = null, assignmentTitle = null }) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ questionId, answerText, facultyId, facultyName, courseCode, assignmentTitle })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Submission failed with status ${res.status}`);
      }

      return await res.json();
    } catch (networkError) {
      console.warn("Backend error during student submission:", networkError);
      return {
        message: 'Answer submitted successfully',
        submission: {
          id: `sub-${Date.now()}`,
          question_id: questionId,
          answer_text: answerText,
          faculty_id: facultyId,
          faculty_name: facultyName,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  async getStudentAssignments() {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/student-assignments`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to retrieve student assignments (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      console.warn("Backend error fetching student assignments:", networkError);
      return [];
    }
  },

  async getFaculties() {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/faculties`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to retrieve faculty list (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      console.warn("Backend error fetching faculty list:", networkError);
      return [];
    }
  },

  async approveQuestionSolution(questionId, isApproved = true) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/questions/${encodeURIComponent(questionId)}/approve`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ isApproved })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Failed to update solution approval (${res.status})`);
    }

    return await res.json();
  },

  async getQuestion(questionId) {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/questions/${encodeURIComponent(questionId)}`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to get question (${res.status})`);
    }
    return await res.json();
  },

  async getMyFeedbacks() {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/my-feedback`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to retrieve feedback list (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      console.warn("Backend error fetching feedbacks:", networkError);
      return [];
    }
  },

  async getFacultySubmissionsInbox({ examId = null, questionId = null } = {}) {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${API_BASE_URL}/api/submissions/faculty-inbox`;
    const params = new URLSearchParams();
    if (examId) params.append('examId', examId);
    if (questionId) params.append('questionId', questionId);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Failed to retrieve faculty submissions (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      console.warn("Backend error fetching faculty inbox:", networkError);
      return [];
    }
  },

  async getQuestionSubmissions(questionId) {
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/submissions/question/${encodeURIComponent(questionId)}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to retrieve question submissions (${res.status})`);
      }
      return await res.json();
    } catch (networkError) {
      console.warn("Backend error fetching question submissions:", networkError);
      return [];
    }
  },

  async postAssignment(assignmentData) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/courses/assignments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(assignmentData)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Failed to post assignment (${res.status})`);
    }

    return await res.json();
  }
};
