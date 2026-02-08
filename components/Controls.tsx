import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface ControlsProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ hasPrev, hasNext, onPrev, onNext, isLoading }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        
        <button
          onClick={onPrev}
          disabled={!hasPrev || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold backdrop-blur-md border transition-all duration-200
            ${!hasPrev || isLoading
              ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-slate-500 hover:text-white hover:scale-105 shadow-lg'}
          `}
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="text-slate-500 text-sm font-medium hidden sm:block">
           CISSP Study Mode
        </div>

        <button
          onClick={onNext}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold backdrop-blur-md border transition-all duration-200
            ${isLoading
              ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-white text-slate-900 border-transparent hover:bg-slate-200 hover:scale-105 shadow-lg shadow-white/5'}
          `}
        >
          <span className="hidden sm:inline">Next Question</span>
          <span className="sm:hidden">Next</span>
          {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <ChevronRight size={20} />}
        </button>

      </div>
    </div>
  );
};
