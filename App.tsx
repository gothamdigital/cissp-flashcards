import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Flashcard, FlashcardHandle } from './components/Flashcard';
import { Controls } from './components/Controls';
import { SkeletonCard } from './components/SkeletonCard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SessionMilestone } from './components/SessionMilestone';
import CISSPDashboard from './components/CISSPDashboard';
import { Difficulty, GeminiModel } from './types';
import { AlertCircle, RefreshCcw, BarChart3, RotateCcw, ExternalLink } from 'lucide-react';
import { useQuestionManager } from './hooks/useQuestionManager';
import { useAnswerTracking } from './hooks/useAnswerTracking';
import { isDashboardView, openDashboardWindow } from './utils/dashboardWindow';

const App: React.FC = () => {
  if (isDashboardView()) {
    return <CISSPDashboard />;
  }

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

  const { userAnswers, handleAnswer: recordAnswer, stats: answerStats, resetAnswers } = useAnswerTracking();
  const flashcardRef = useRef<FlashcardHandle>(null);
  const historyLengthRef = useRef<number>(0);

  const handleNext = useCallback(() => {
    handleNextQuestion();
  }, [handleNextQuestion]);

  // Initialize the first batch when session starts
  useEffect(() => {
    if (!showWelcomeScreen) {
      loadQuestionsForDifficulty(difficulty, model, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWelcomeScreen]);

  useEffect(() => {
    historyLengthRef.current = history.length;
  }, [history.length]);

  // Keyboard navigation
  useEffect(() => {
    if (showWelcomeScreen || showStats || showMilestone) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case '1': case '2': case '3': case '4':
          flashcardRef.current?.selectOption(parseInt(e.key) - 1);
          break;
        case 'a': case 'b': case 'c': case 'd':
          flashcardRef.current?.selectOption(e.key.charCodeAt(0) - 97);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          flashcardRef.current?.revealAnswer();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) handlePrev();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcomeScreen, showStats, showMilestone, currentIndex, handleNext, handlePrev]);

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

  const handleContinueSession = (newDifficulty: Difficulty) => {
    setShowMilestone(false);

    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      loadQuestionsForDifficulty(newDifficulty, model, false, false).then(() => {
        setCurrentIndex((prev) =>
          prev + 1 < historyLengthRef.current ? prev + 1 : prev
        );
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
      <nav className="fixed top-0 w-full z-20 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-max group cursor-default">
            <div className="w-2 h-6 bg-accent" />
            <span className="text-sm font-black tracking-[0.2em] uppercase text-white">
              CISSP
            </span>
            <span className="text-accent text-sm font-light tracking-widest hidden sm:block">
              MASTER
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <button
              onClick={openDashboardWindow}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:border-accent hover:text-accent text-zinc-400 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              title="Open CISSP Dashboard in a new window"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {!showWelcomeScreen && (
              <>
              <span className="text-xs font-mono text-zinc-600">
                {history.length > 0 ? `${currentIndex + 1} / ${history.length}` : ''}
              </span>

              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:border-accent hover:text-accent text-zinc-400 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                title="View Statistics"
              >
                <BarChart3 size={14} />
                <span className="hidden sm:inline">Stats</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:border-zinc-500 text-zinc-600 hover:text-zinc-200 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                title="Reset Session"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
              </>
            )}
          </div>
        </div>
        {/* Progress bar */}
        {!showWelcomeScreen && history.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-900">
            <div
              className="h-full bg-accent/60 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / history.length) * 100}%` }}
            />
          </div>
        )}
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
              <div className="max-w-md w-full border border-zinc-800 text-center overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent opacity-50" />
                <div className="p-6">
                  <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                  <h3 className="text-zinc-200 font-medium mb-2 text-sm uppercase tracking-wider">Error Loading Cards</h3>
                  <p className="text-zinc-500 text-sm mb-4">{error}</p>
                  <button
                    onClick={() => loadQuestionsForDifficulty(difficulty, model, history.length === 0, true)}
                    className="bg-accent text-zinc-950 hover:bg-accent-hover px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <RefreshCcw size={14} /> Retry
                  </button>
                </div>
              </div>
            )}

            {/* Initial Loading State */}
            {!error && history.length === 0 && isLoading && (
              <SkeletonCard />
            )}

            {/* Card Display */}
            {!error && history.length > 0 && currentCard && (
              <div className="w-full">
                <Flashcard
                  ref={flashcardRef}
                  data={currentCard}
                  savedSelection={currentSavedAnswer}
                  onAnswer={handleAnswer}
                />
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
      <ProgressDashboard isOpen={showStats} onClose={() => setShowStats(false)} stats={answerStats} />

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
