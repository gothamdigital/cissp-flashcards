import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard } from './components/Flashcard';
import { Controls } from './components/Controls';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SkeletonCard } from './components/SkeletonCard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SessionMilestone } from './components/SessionMilestone';
import { Difficulty, GeminiModel } from './types';
import { AlertCircle, RefreshCcw, BarChart3, RotateCcw } from 'lucide-react';
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

    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      loadQuestionsForDifficulty(newDifficulty, model, false, false).then(() => {
        setCurrentIndex((prev) => prev + 1);
      });
    } else {
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

    if (!userAnswers[currentCard.id]) {
      const isCorrect = optionIndex === currentCard.correctAnswerIndex;
      recordAnswer(currentCard.id, currentCard.domain, optionIndex, isCorrect);

      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentCard.id, isCorrect }),
      }).catch(() => {});
    }
  };

  const currentCard = history[currentIndex];
  const currentSavedAnswer = currentCard ? userAnswers[currentCard.id]?.selectedOptionIndex : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-20 bg-zinc-950/90 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-max">
            <span className="text-sm font-bold tracking-widest uppercase text-white">
              CISSP
            </span>
            <span className="text-zinc-600 text-sm font-light tracking-wide hidden sm:block">
              Master
            </span>
          </div>

          {/* Controls */}
          {!showWelcomeScreen && (
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="text-xs font-mono text-zinc-600 hidden md:block">
                {history.length > 0 ? `${currentIndex + 1} / ${history.length}` : ''}
              </span>

              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-medium uppercase tracking-wider cursor-pointer"
                title="View Statistics"
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">Stats</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-200 transition-colors text-xs font-medium uppercase tracking-wider cursor-pointer"
                title="Reset Session"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        className={`pt-20 pb-28 px-4 flex flex-col items-center min-h-screen ${
          showWelcomeScreen ? 'justify-start' : 'justify-center'
        }`}
      >
        {showWelcomeScreen ? (
          <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
        ) : (
          <>
            {error && (
              <div className="max-w-md w-full border border-zinc-800 p-6 text-center">
                <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                <h3 className="text-zinc-200 font-medium mb-2 text-sm uppercase tracking-wider">Error Loading Cards</h3>
                <p className="text-zinc-500 text-sm mb-4">{error}</p>
                <button
                  onClick={() => loadQuestionsForDifficulty(difficulty, model, history.length === 0, true)}
                  className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <RefreshCcw size={14} /> Retry
                </button>
              </div>
            )}

            {/* Initial Loading State */}
            {!error && history.length === 0 && isLoading && (
              <SkeletonCard />
            )}

            {/* Card Display */}
            {!error && history.length > 0 && currentCard && (
              <div className="w-full">
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
