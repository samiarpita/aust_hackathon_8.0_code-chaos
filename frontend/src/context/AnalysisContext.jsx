import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api';
import { demoExamDataset, samplePrecomputedAnalyses } from '../lib/sampleData';

const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(samplePrecomputedAnalyses[0]);
  const [history, setHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [isMockMode, setIsMockMode] = useState(() => apiClient.isMockActive());

  // Fetch past analyses on mount or mock mode change
  const refreshHistory = async () => {
    try {
      const data = await apiClient.listAnalyses(null, isMockMode);
      setHistory(data || []);
    } catch (err) {
      console.warn('Failed to load history:', err);
    }
  };

  useEffect(() => {
    refreshHistory();
  }, [isMockMode]);

  const toggleMockMode = () => {
    const next = !isMockMode;
    setIsMockMode(next);
    apiClient.setMockActive(next);
  };

  const analyze = async ({ questionText, clos, answers }) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await apiClient.createAnalysis({ questionText, clos, answers }, isMockMode);
      setCurrentAnalysis(result);
      await refreshHistory();
      return result;
    } catch (err) {
      setAnalysisError(err.message || "Failed to complete misconception analysis.");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectAnalysis = (analysis) => {
    setCurrentAnalysis(analysis);
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentAnalysis,
        history,
        isAnalyzing,
        analysisError,
        isMockMode,
        toggleMockMode,
        analyze,
        selectAnalysis,
        refreshHistory,
        demoDataset: demoExamDataset,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
