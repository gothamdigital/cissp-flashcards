import React, { useState } from 'react';
import { Check, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { Difficulty } from '../types';

interface SessionMilestoneProps {
  isOpen: boolean;
  onContinue: (difficulty: Difficulty) => void;
  onComplete: () => void;
  currentDifficulty: Difficulty;
  questionsCompleted: number;
}

export const SessionMilestone: React.FC<SessionMilestoneProps> = ({
  isOpen,
  onContinue,
  onComplete,
  currentDifficulty,
  questionsCompleted
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(currentDifficulty);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="border-b border-zinc-800 p-8 text-center">
          <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
            <Check className="text-white w-6 h-6" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Batch Complete</h2>
          <p className="text-zinc-500 text-sm">
            {questionsCompleted} questions completed
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-4 text-center">
              Next batch difficulty
            </h3>
            <div className="flex gap-2">
              {(Object.values(Difficulty) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer border ${
                    selectedDifficulty === diff
                      ? 'border-accent text-accent bg-zinc-900'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onContinue(selectedDifficulty)}
              className="w-full py-3.5 bg-accent text-zinc-950 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              Continue
              <ChevronRight size={14} />
            </button>

            <button
              onClick={onComplete}
              className="w-full py-3.5 border border-zinc-800 text-zinc-400 text-sm font-medium uppercase tracking-wider flex items-center justify-center gap-2 hover:border-zinc-600 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              Finish & View Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
