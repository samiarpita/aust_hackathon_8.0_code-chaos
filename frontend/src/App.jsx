import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import MeshBackground from './components/MeshBackground';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NewAnalysisPage from './pages/NewAnalysisPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import StudentPortalPage from './pages/StudentPortalPage';
import AuthModal from './components/AuthModal';

function AppContent() {
  const { isStudent, isFaculty, switchRole } = useAuth();
  const { selectAnalysis, demoDataset } = useAnalysis();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activePresetDataset, setActivePresetDataset] = useState(null);

  const handleStartAnalysis = () => {
    switchRole('faculty');
    setActivePresetDataset(null);
    setActiveTab('new-analysis');
  };

  const handleViewDemo = () => {
    switchRole('faculty');
    setActivePresetDataset(demoDataset);
    setActiveTab('new-analysis');
  };

  const handleOpenStudentPortal = () => {
    switchRole('student');
    setActiveTab('student-portal');
  };

  const handleAnalysisSuccess = (result) => {
    selectAnalysis(result);
    setActiveTab('results');
  };

  const handleSelectHistoricalAnalysis = (analysis) => {
    selectAnalysis(analysis);
    setActiveTab('results');
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-[#7847EB]/20 dark:selection:bg-[#B388FF]/30 text-[#3E2E54] dark:text-[#EDE4F8]">
      {/* Ambient Mesh Background */}
      <MeshBackground />

      {/* Floating Island Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Router */}
      <main className="relative z-10">
        {activeTab === 'landing' && (
          <LandingPage
            onStartAnalysis={handleStartAnalysis}
            onViewDemo={handleViewDemo}
            onOpenStudentPortal={handleOpenStudentPortal}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onNewAnalysis={handleStartAnalysis}
            onSelectAnalysis={handleSelectHistoricalAnalysis}
          />
        )}

        {activeTab === 'new-analysis' && (
          <NewAnalysisPage
            initialDataset={activePresetDataset}
            onAnalysisSuccess={handleAnalysisSuccess}
          />
        )}

        {activeTab === 'results' && (
          <ResultsPage
            onBackToDashboard={() => setActiveTab('dashboard')}
            onNewAnalysis={handleStartAnalysis}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            onSelectAnalysis={handleSelectHistoricalAnalysis}
            onNewAnalysis={handleStartAnalysis}
          />
        )}

        {activeTab === 'student-portal' && (
          <StudentPortalPage
            onSwitchToFaculty={() => {
              switchRole('faculty');
              setActiveTab('dashboard');
            }}
          />
        )}
      </main>

      {/* Centered Auth Modal with Login/Register & Role toggle */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Clean Academic Footer */}
      <footer className="relative z-10 border-t border-[#B49BDE]/20 dark:border-[#C4ABF0]/10 py-6 px-4 text-center text-xs text-[#6C5B82] dark:text-[#CAB7E4]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-[#7847EB] dark:text-[#B388FF]">LearnMap</span>
            <span>•</span>
            <span>Student Misconception Radar</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:underline text-[#7847EB] dark:text-[#B388FF]"
            >
              Public Home
            </button>
            <button
              onClick={() => {
                switchRole('faculty');
                setActiveTab('dashboard');
              }}
              className="hover:underline text-[#7847EB] dark:text-[#B388FF]"
            >
              Faculty Portal
            </button>
            <button
              onClick={() => {
                switchRole('student');
                setActiveTab('student-portal');
              }}
              className="hover:underline text-[#DB2777] dark:text-[#F472B6]"
            >
              Student Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalysisProvider>
          <AppContent />
        </AnalysisProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
