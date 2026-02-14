import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface ControlsProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ hasPrev, hasNext, onPrev, onNext, isLoading }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-800 z-10">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">

        <button
          onClick={onPrev}
          disabled={!hasPrev || isLoading}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all
            ${!hasPrev || isLoading
              ? 'text-zinc-800 border-zinc-900 cursor-not-allowed'
              : 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white cursor-pointer active:scale-[0.98]'}
          `}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <span className="text-zinc-700 text-[11px] font-medium uppercase tracking-widest hidden sm:block">
          Study Mode
        </span>

        <button
          onClick={onNext}
          disabled={isLoading}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all
            ${isLoading
              ? 'text-zinc-600 border border-zinc-800 cursor-not-allowed'
              : 'bg-accent text-zinc-950 hover:bg-accent-hover active:scale-[0.98] shadow-lg shadow-accent/10 cursor-pointer'}
          `}
        >
          <span className="hidden sm:inline">Next</span>
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
        </button>

      </div>
    </div>
  );
};
