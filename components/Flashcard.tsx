import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FlashcardData, Difficulty } from '../types';
import { Eye, Check, X, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

interface FlashcardProps {
  data: FlashcardData;
  savedSelection?: number | null;
  onAnswer: (optionIndex: number) => void;
}

export interface FlashcardHandle {
  selectOption: (index: number) => void;
  revealAnswer: () => void;
}

export const Flashcard = forwardRef<FlashcardHandle, FlashcardProps>(({ data, savedSelection, onAnswer }, ref) => {
  const [localSelection, setLocalSelection] = useState<number | null>(null);

  const isRevealed = savedSelection !== null && savedSelection !== undefined;
  const activeSelection = isRevealed ? savedSelection : localSelection;
  const isCorrect = isRevealed && savedSelection === data.correctAnswerIndex;

  useEffect(() => {
    setLocalSelection(null);
  }, [data.id]);

  useImperativeHandle(ref, () => ({
    selectOption(index: number) {
      if (isRevealed || index < 0 || index >= data.options.length) return;
      setLocalSelection(index);
    },
    revealAnswer() {
      if (isRevealed || localSelection === null) return;
      onAnswer(localSelection);
    },
  }), [isRevealed, localSelection, data.options.length, onAnswer]);

  const handleOptionClick = (index: number) => {
    if (isRevealed) return;
    setLocalSelection(index);
  };

  const getDifficultyLabel = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.Easy:
        return "text-zinc-400";
      case Difficulty.Medium:
        return "text-zinc-300";
      case Difficulty.Hard:
        return "text-zinc-200";
      default:
        return "text-zinc-500";
    }
  };

  const getOptionStyle = (index: number) => {
    const base = "p-4 border transition-all duration-150 cursor-pointer flex items-start gap-4 group";

    if (!isRevealed) {
      return index === activeSelection
        ? `${base} border-accent/50 bg-accent/10`
        : `${base} border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50 bg-transparent`;
    }

    if (index === data.correctAnswerIndex) {
      return `${base} border-emerald-800 bg-emerald-950/30`;
    }

    if (index === activeSelection && index !== data.correctAnswerIndex) {
      return `${base} border-red-800 bg-red-950/20`;
    }

    return `${base} border-zinc-900 bg-transparent opacity-40`;
  };

  const getIndicator = (index: number) => {
    const base = "mt-0.5 w-5 h-5 border flex items-center justify-center flex-shrink-0 text-xs font-mono";

    if (!isRevealed) {
      return index === activeSelection
        ? `${base} border-accent bg-accent text-zinc-950`
        : `${base} border-zinc-700 text-zinc-600 group-hover:border-zinc-500`;
    }

    if (index === data.correctAnswerIndex) {
      return `${base} border-emerald-600 bg-emerald-600 text-white`;
    }

    if (index === activeSelection && index !== data.correctAnswerIndex) {
      return `${base} border-red-600 bg-red-600 text-white`;
    }

    return `${base} border-zinc-800 text-zinc-700`;
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  const buildSearchQuery = (card: FlashcardData): string => {
    const MAX_KEYWORDS = 12;

    const boilerplatePatterns = [
      /which of the following\b/gi,
      /what (?:is|are) the\b/gi,
      /would (?:best|most likely)\b/gi,
      /most (?:likely|appropriate|effective|important|accurate)\b/gi,
      /best (?:describes?|approach|practice|method|way to)\b/gi,
      /is (?:tasked with|responsible for|asked to)\b/gi,
      /has been (?:asked to|tasked with)\b/gi,
    ];

    const stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'shall', 'can', 'not',
      'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
      'as', 'into', 'through', 'during', 'before', 'after',
      'between', 'out', 'off', 'over', 'under', 'then',
      'when', 'where', 'why', 'how', 'all', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'nor', 'only', 'own', 'same', 'so', 'than', 'too',
      'very', 'just', 'because', 'but', 'and', 'or', 'if', 'while',
      'that', 'which', 'who', 'whom', 'this', 'these', 'those', 'what',
      'its', 'it', 'they', 'them', 'their', 'he', 'she', 'his', 'her',
      'we', 'you', 'your', 'my', 'our', 'me', 'him', 'us',
      'following', 'regarding', 'about', 'related', 'using', 'used',
      'ensure', 'ensures', 'also', 'well', 'many', 'new', 'one',
      'company', 'organization', 'enterprise', 'firm',
      'manager', 'administrator', 'analyst',
      'recently', 'currently', 'wants', 'needs', 'asked',
      'large', 'small', 'given',
    ]);

    let text = card.question;
    for (const pattern of boilerplatePatterns) {
      text = text.replace(pattern, ' ');
    }

    const domainWords = new Set(card.domain.toLowerCase().replace(/[()]/g, '').split(/\s+/));

    const keywords = text
      .replace(/[?.!,;:'"(){}[\]]/g, ' ')
      .split(/\s+/)
      .map(w => w.toLowerCase())
      .filter(w => w.length > 2 && !stopWords.has(w) && !domainWords.has(w))
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .slice(0, MAX_KEYWORDS);

    return `CISSP ${card.domain} ${keywords.join(' ')}`;
  };

  const encodeQuery = (query: string): string =>
    encodeURIComponent(query).replace(/%20/g, '+');

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="border border-zinc-800 bg-zinc-950 flex flex-col min-h-[480px] shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent opacity-50" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              {data.domain}
            </span>
            <span className={`text-[11px] font-medium uppercase tracking-widest ${getDifficultyLabel(data.difficulty)}`}>
              {data.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isRevealed && (
              isCorrect
                ? <CheckCircle2 size={14} className="text-emerald-500" />
                : <XCircle size={14} className="text-red-500" />
            )}
            <span className="text-zinc-700 text-[11px] font-mono">{data.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-8 flex-grow">
          <h2 className="text-lg md:text-xl font-bold leading-relaxed text-white mb-8">
            {data.question}
          </h2>

          <div className="space-y-px">
            {data.options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={getOptionStyle(idx)}
              >
                <div className={getIndicator(idx)}>
                  {isRevealed && idx === data.correctAnswerIndex ? (
                    <Check size={12} strokeWidth={3} />
                  ) : isRevealed && idx === activeSelection && idx !== data.correctAnswerIndex ? (
                    <X size={12} strokeWidth={3} />
                  ) : (
                    optionLabels[idx]
                  )}
                </div>
                <span className="text-sm md:text-base text-zinc-300 font-medium">{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions / Explanation */}
        <div className="px-6 py-5 border-t border-zinc-800">
          {!isRevealed ? (
            <button
              onClick={() => localSelection !== null && onAnswer(localSelection)}
              disabled={localSelection === null}
              className={`w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-150
                ${localSelection !== null
                  ? 'bg-accent text-zinc-950 hover:bg-accent-hover cursor-pointer active:scale-[0.99]'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'}
              `}
            >
              <Eye size={16} />
              Reveal Answer
            </button>
          ) : (
            <div className="animate-fade-in-up">
              {/* Feedback banner */}
              {isCorrect ? (
                <div className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-emerald-950/40 border border-emerald-900/50">
                  <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Correct!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-red-950/30 border border-red-900/40">
                  <XCircle size={15} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
                    Incorrect — Answer is {optionLabels[data.correctAnswerIndex]}
                  </span>
                </div>
              )}

              <div className="border border-zinc-800 p-5 mb-4 bg-zinc-900/30">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 mb-3">
                  Explanation
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {data.explanation}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={`https://www.perplexity.ai/search?q=${encodeQuery(buildSearchQuery(data))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-700 text-zinc-300 hover:border-accent hover:text-accent transition-colors"
                >
                  <ExternalLink size={13} />
                  Perplexity
                </a>
                <a
                  href={`https://www.google.com/search?udm=50&q=${encodeQuery(buildSearchQuery(data))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <ExternalLink size={13} />
                  Google AI
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
