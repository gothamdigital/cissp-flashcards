/**
 * WelcomeScreen.tsx
 *
 * Entry screen for CISSP Master Flashcards. Lets the user select an AI model
 * and difficulty level before starting a study session.
 *
 * @decision DEC-WELCOME-001
 * @title Semantic color-coding for difficulty buttons
 * @status accepted
 * @rationale Using emerald/yellow/red instead of a uniform accent color gives
 *   users an immediate visual cue about challenge level before they click.
 *   Removes the ring-1 ring-accent-hover from Hard since color alone
 *   sufficiently differentiates the three options.
 *
 * Difficulty buttons use semantic colors to reinforce the challenge level:
 *   Easy   → emerald-600 (green)
 *   Medium → yellow-500
 *   Hard   → red-600
 */
import React from 'react';
import { Difficulty, GeminiModel } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldCheck } from 'lucide-react';

interface WelcomeScreenProps {
  onStartSession: (difficulty: Difficulty, model: GeminiModel) => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartSession, isLoading }) => {
  const [selectedModel, setSelectedModel] = React.useState<GeminiModel | null>(null);

  return (
    <div className="flex flex-col items-center justify-start text-center max-w-xl mx-auto pt-8">
      <div className="w-14 h-14 border border-zinc-800 flex items-center justify-center mb-6">
        <ShieldCheck className="w-7 h-7 text-accent" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
        CISSP Master
      </h1>
      <p className="text-zinc-500 text-sm leading-relaxed mb-12 max-w-md">
        150+ sub-topics across 8 CISSP domains. AI-generated scenario questions calibrated to your level.
      </p>

      {/* Model Selection */}
      <div className="w-full border border-zinc-800 p-6 mb-4">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-5">
          Select Model
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setSelectedModel(GeminiModel.Gemini3Flash)}
            className={`flex-1 px-5 py-3 border text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              selectedModel === GeminiModel.Gemini3Flash
                ? 'border-accent text-accent bg-zinc-900'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
            }`}
          >
            Gemini 3 Flash
          </button>
          <button
            onClick={() => setSelectedModel(GeminiModel.Gemini25FlashLite)}
            className={`flex-1 px-5 py-3 border text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer ${
              selectedModel === GeminiModel.Gemini25FlashLite
                ? 'border-accent text-accent bg-zinc-900'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
            }`}
          >
            Gemini 2.5 Flash Lite
          </button>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className={`w-full border border-zinc-800 p-6 transition-opacity ${!selectedModel ? 'opacity-40' : ''}`}>
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-5">
          Difficulty
        </h2>
        <div className="flex gap-2">
          {[Difficulty.Easy, Difficulty.Medium, Difficulty.Hard].map((diff, i) => (
            <button
              key={diff}
              onClick={() => selectedModel && onStartSession(diff, selectedModel)}
              disabled={isLoading || !selectedModel}
              className={`flex-1 py-3.5 text-sm font-bold uppercase tracking-wider transition-all
                ${!selectedModel || isLoading
                  ? 'border border-zinc-900 text-zinc-700 cursor-not-allowed'
                  : i === 0
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98] cursor-pointer'
                    : i === 1
                      ? 'bg-yellow-500 text-zinc-950 hover:bg-yellow-400 active:scale-[0.98] cursor-pointer'
                      : 'bg-red-600 text-white hover:bg-red-500 active:scale-[0.98] cursor-pointer'
                }`}
            >
              {diff}
            </button>
          ))}
        </div>
        {!selectedModel && (
          <p className="mt-4 text-[11px] text-zinc-600 uppercase tracking-wider">
            Select a model to continue
          </p>
        )}
      </div>

      {isLoading && (
        <div className="mt-8">
          <LoadingSpinner message="Generating questions..." />
        </div>
      )}
    </div>
  );
};
