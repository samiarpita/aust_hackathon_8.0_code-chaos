import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockApi } from './mockApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const MAX_UPLOAD_SIZE_MB = 20;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

// Helper to retrieve auth token
async function getAuthToken() {
  if (!isSupabaseConfigured()) {
    return 'mock-faculty-bearer-token';
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (err) {
    console.warn('Could not fetch Supabase session token:', err);
    return null;
  }
}

/**
 * Universal API Client for Developer 1 Frontend
 * Adheres strictly to Contract A:
 * POST /api/analyses -> { questionText, clos, answers }
 * GET /api/analyses/:id
 * GET /api/analyses?examId=
 */
export const apiClient = {
  // Mode flag: whether mock API is active
  isMockActive() {
    const stored = localStorage.getItem('radar_force_mock');
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to true if no live backend URL or credentials configured
    return !import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL.includes('localhost');
  },

  setMockActive(active) {
    localStorage.setItem('radar_force_mock', String(active));
  },

  async createAnalysis({ questionText, clos = [], answers = [] }, forceMock = false) {
    // Client-side validation required by Developer_1_Task.md
    if (!questionText || questionText.trim().length === 0) {
      throw new Error("Question text is required.");
    }
    if (!Array.isArray(answers) || answers.length < 2) {
      throw new Error("At least 2 student answers are required to run misconception radar.");
    }

    if (forceMock || this.isMockActive()) {
      return await mockApi.createAnalysis({ questionText, clos, answers });
    }

    const token = await getAuthToken();
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
        body: JSON.stringify({ questionText, clos, answers }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      return await res.json();
    } catch (networkError) {
      console.warn("Backend unavailable or encountered network error. Falling back to Mock Engine:", networkError);
      // Fall back seamlessly to mock so the demo never hangs
      return await mockApi.createAnalysis({ questionText, clos, answers });
    }
  },

  async getAnalysis(id, forceMock = false) {
    if (forceMock || this.isMockActive()) {
      return await mockApi.getAnalysisById(id);
    }

    const token = await getAuthToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyses/${id}`, {
        headers,
      });
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

    const token = await getAuthToken();
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
