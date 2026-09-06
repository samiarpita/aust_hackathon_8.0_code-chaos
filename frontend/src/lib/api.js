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

  async createAnalysis({ questionId, questionText, clos = [], answers = [], correctAnswer = null }, forceMock = false) {
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
        body: JSON.stringify({ questionId, questionText, clos, answers, correctAnswer }),
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
  }
};
