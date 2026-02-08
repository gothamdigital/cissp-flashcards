import React, { useState } from 'react';
import { CheckCircle, Trophy, Play, RotateCcw, ChevronRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative Header */}
        <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Trophy className="absolute -right-4 -top-4 w-32 h-32 rotate-12" />
          </div>
          
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
            <CheckCircle className="text-white w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Batch Complete!</h2>
          <p className="text-slate-100 font-medium">You've just completed {questionsCompleted} questions.</p>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-slate-200 font-semibold mb-4 text-center">Ready for more? Adjust difficulty for next 10:</h3>
            <div className="flex justify-center gap-3">
              {(Object.values(Difficulty) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 border-2 ${
                    selectedDifficulty === diff
                      ? diff === Difficulty.Easy ? 'bg-green-600 border-green-400 text-white scale-105 shadow-lg shadow-green-900/20' :
                        diff === Difficulty.Medium ? 'bg-slate-600 border-slate-400 text-white scale-105 shadow-lg shadow-slate-900/20' :
                        'bg-red-600 border-red-400 text-white scale-105 shadow-lg shadow-red-900/20'
                      : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onContinue(selectedDifficulty)}
              className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98] shadow-xl"
            >
              <Play size={20} fill="currentColor" />
              Continue Studying
              <ChevronRight size={20} />
            </button>
            
            <button
              onClick={onComplete}
              className="w-full py-4 bg-slate-700 text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-600 transition-all border border-slate-600"
            >
              <RotateCcw size={18} />
              Finish & See Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
