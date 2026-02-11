import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SkeletonCard } from './components/SkeletonCard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SessionMilestone } from './components/SessionMilestone';
import { Difficulty, GeminiModel } from './types';
import { BookOpen, AlertCircle, RefreshCcw, PieChart, RotateCcw } from 'lucide-react';
import { useQuestionManager } from './hooks/useQuestionManager';
import { useAnswerTracking } from './hooks/useAnswerTracking';

const App: React.FC = () => {
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showMilestone, setShowMilestone] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [model, setModel] = useState<GeminiModel>(GeminiModel.Gemini25FlashLite);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true);

  // Custom hooks for state management
  const {
    history,
    currentIndex,
    isLoading,
    error,
    loadQuestionsForDifficulty,
    handleNext: handleNextQuestion,
    handlePrev,
    setCurrentIndex,
    resetQuestions,
  } = useQuestionManager(difficulty, model, () => setShowMilestone(true));

  const { userAnswers, handleAnswer: recordAnswer, resetAnswers } = useAnswerTracking();

  // Initialize the first batch when session starts
  useEffect(() => {
    if (!showWelcomeScreen) {
      loadQuestionsForDifficulty(difficulty, model, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWelcomeScreen]);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    if (newDifficulty === difficulty) return;

    setDifficulty(newDifficulty);
    resetQuestions();

    // Fetch new batch with replace=true
    loadQuestionsForDifficulty(newDifficulty, model, true, true);
  };

  const handleStartSession = useCallback(
    (selectedDifficulty: Difficulty, selectedModel: GeminiModel) => {
      setDifficulty(selectedDifficulty);
      setModel(selectedModel);
      setShowWelcomeScreen(false);
    },
    []
  );

  const handleReset = () => {
    if (window.confirm('Start a new session? This will clear all your progress and current questions.')) {
      resetQuestions();
      resetAnswers();
      setShowStats(false);
      setShowMilestone(false);
      setShowWelcomeScreen(true);
    }
  };

  const handleNext = useCallback(() => {
    handleNextQuestion();
  }, [handleNextQuestion]);

  const handleContinueSession = (newDifficulty: Difficulty) => {
    setShowMilestone(false);

    // If difficulty changed, update it and clear pre-fetched questions
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      // Keep only questions up to current point
      // Note: This is a limitation - we'd need to expose setHistory from the hook
      // For now, load new questions
      loadQuestionsForDifficulty(newDifficulty, model, false, false).then(() => {
        setCurrentIndex((prev) => prev + 1);
      });
    } else {
      // Just continue with next question
      handleNextQuestion();
    }
  };

  const handleCompleteSession = () => {
    setShowMilestone(false);
    setShowStats(true);
  };

  const handleAnswer = (optionIndex: number) => {
    const currentCard = history[currentIndex];
    if (!currentCard) return;

    // Only record if not already answered
    if (!userAnswers[currentCard.id]) {
      const isCorrect = optionIndex === currentCard.correctAnswerIndex;
      recordAnswer(currentCard.id, currentCard.domain, optionIndex, isCorrect);
    }
  };

  const currentCard = history[currentIndex];
  const currentSavedAnswer = currentCard ? userAnswers[currentCard.id]?.selectedOptionIndex : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-slate-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="bg-slate-600 p-2 rounded-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-400 to-emerald-400 bg-clip-text text-transparent hidden sm:block">
              CISSP<span className="text-slate-200 font-light ml-1">Master</span>
            </h1>
          </div>

          {/* Controls */}
          {!showWelcomeScreen && (
            <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
              <div className="text-xs font-medium text-slate-500 hidden md:block">
                {history.length > 0 ? `${currentIndex + 1} / ${history.length}` : ''}
              </div>

              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 transition-all text-sm font-medium text-slate-300 cursor-pointer"
                title="View Statistics"
              >
                <PieChart size={16} />
                <span className="hidden sm:inline">Stats</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:bg-rose-900/20 hover:border-rose-500/50 hover:text-rose-400 transition-all text-sm font-medium text-slate-400 cursor-pointer"
                title="Reset Session"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        className={`pt-24 pb-32 px-4 flex flex-col items-center min-h-screen ${
          showWelcomeScreen ? 'justify-start' : 'justify-center'
        }`}
      >
        {showWelcomeScreen ? (
          <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
        ) : (
          <>
            {error && (
              <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-red-400 font-bold mb-2">Error Loading Cards</h3>
                <p className="text-red-200/70 text-sm mb-4">{error}</p>
                <button
                  onClick={() => loadQuestionsForDifficulty(difficulty, model, history.length === 0, true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <RefreshCcw size={16} /> Retry
                </button>
              </div>
            )}

            {/* Initial Loading State */}
            {!error && history.length === 0 && isLoading && (
              <SkeletonCard />
            )}

            {/* Card Display */}
            {!error && history.length > 0 && currentCard && (
              <div className="w-full animate-in fade-in zoom-in-95 duration-500">
                <Flashcard data={currentCard} savedSelection={currentSavedAnswer} onAnswer={handleAnswer} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Controls */}
      {!showWelcomeScreen && (
        <Controls
          hasPrev={currentIndex > 0}
          hasNext={true}
          onPrev={handlePrev}
          onNext={handleNext}
          isLoading={isLoading && history.length === 0}
        />
      )}

      {/* Progress Dashboard Modal */}
      <ProgressDashboard isOpen={showStats} onClose={() => setShowStats(false)} answers={userAnswers} />

      {/* Session Milestone Modal */}
      <SessionMilestone
        isOpen={showMilestone}
        onContinue={handleContinueSession}
        onComplete={handleCompleteSession}
        currentDifficulty={difficulty}
        questionsCompleted={currentIndex + 1}
      />
    </div>
  );
};

export default App;
