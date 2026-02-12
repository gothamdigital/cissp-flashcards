import React, { useState, useEffect } from 'react';
import { FlashcardData, Difficulty } from '../types';
import { Eye, CheckCircle, XCircle, ShieldCheck, BarChart, ExternalLink } from 'lucide-react';

interface FlashcardProps {
  data: FlashcardData;
  savedSelection?: number | null; // Index of the option selected previously
  onAnswer: (optionIndex: number) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ data, savedSelection, onAnswer }) => {
  const [localSelection, setLocalSelection] = useState<number | null>(null);

  // If savedSelection is provided (not null/undefined), the card is in "revealed" state
  const isRevealed = savedSelection !== null && savedSelection !== undefined;
  
  // The active selection is either what was saved in history, or what user clicked just now locally
  const activeSelection = isRevealed ? savedSelection : localSelection;

  // Reset local selection when data changes (new card)
  useEffect(() => {
    setLocalSelection(null);
  }, [data.id]);

  const handleOptionClick = (index: number) => {
    if (isRevealed) return; // Prevent changing after reveal
    setLocalSelection(index);
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.Easy:
        return "text-teal-400 bg-teal-400/10 border-teal-400/20";
      case Difficulty.Medium:
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case Difficulty.Hard:
        return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  const getOptionStyle = (index: number) => {
    const baseStyle = "p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3 relative overflow-hidden";
    
    if (!isRevealed) {
      return index === activeSelection
        ? `${baseStyle} border-slate-500 bg-slate-500/10 hover:bg-slate-500/20`
        : `${baseStyle} border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800`;
    }

    // Revealed state
    if (index === data.correctAnswerIndex) {
      return `${baseStyle} border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]`;
    }
    
    if (index === activeSelection && index !== data.correctAnswerIndex) {
      return `${baseStyle} border-rose-500 bg-rose-500/10 text-rose-100`;
    }

    return `${baseStyle} border-slate-800 bg-slate-900/50 opacity-50`;
  };

  const buildSearchQuery = (card: FlashcardData): string => {
    const query = `CISSP ${card.domain}: ${card.question}`;
    if (query.length <= 400) return query;
    const truncated = query.slice(0, 400);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  };

  const encodeQuery = (query: string): string =>
    encodeURIComponent(query).replace(/%20/g, '+');

  return (
    <div className="w-full max-w-3xl mx-auto perspective-1000">
      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Header / Badges */}
        <div className="p-6 pb-2 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
              <ShieldCheck size={14} />
              <span>{data.domain}</span>
            </div>
            
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getDifficultyColor(data.difficulty)}`}>
              <BarChart size={14} />
              {data.difficulty}
            </div>
          </div>
          
          <div className="text-slate-500 text-xs font-mono">ID: {data.id.slice(0,8)}</div>
        </div>

        {/* Question Area */}
        <div className="p-8 flex-grow">
          <h2 className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-100 mb-8">
            {data.question}
          </h2>

          <div className="space-y-3">
            {data.options.map((option, idx) => (
              <div 
                key={idx} 
                onClick={() => handleOptionClick(idx)}
                className={getOptionStyle(idx)}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${!isRevealed && idx === activeSelection ? 'border-slate-500 bg-slate-500' : 'border-slate-500'}
                  ${isRevealed && idx === data.correctAnswerIndex ? 'border-emerald-500 bg-emerald-500' : ''}
                  ${isRevealed && idx === activeSelection && idx !== data.correctAnswerIndex ? 'border-rose-500 bg-rose-500' : ''}
                `}>
                  {isRevealed && idx === data.correctAnswerIndex && <CheckCircle size={14} className="text-white" />}
                  {isRevealed && idx === activeSelection && idx !== data.correctAnswerIndex && <XCircle size={14} className="text-white" />}
                  {!isRevealed && idx === activeSelection && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
                <span className="text-base md:text-lg">{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions / Explanation Area */}
        <div className="p-6 bg-slate-900/50 border-t border-slate-700">
          {!isRevealed ? (
            <button
              onClick={() => localSelection !== null && onAnswer(localSelection)}
              disabled={localSelection === null}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                ${localSelection !== null 
                  ? 'bg-slate-600 hover:bg-slate-500 text-white shadow-lg shadow-slate-600/20 hover:shadow-slate-500/30 translate-y-0' 
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'}
              `}
            >
              <Eye size={20} />
              Reveal Answer
            </button>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-4">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                  <CheckCircle size={18} /> Explanation
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  {data.explanation}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://www.perplexity.ai/search?q=${encodeQuery(buildSearchQuery(data))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-200"
                >
                  <ExternalLink size={15} />
                  Deep Dive on Perplexity
                </a>
                <a
                  href={`https://www.google.com/search?udm=50&q=${encodeQuery(buildSearchQuery(data))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors duration-200"
                >
                  <ExternalLink size={15} />
                  Deep Dive on Google AI
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
