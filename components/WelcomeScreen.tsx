import React from 'react';
import { BookOpen, RefreshCcw } from 'lucide-react';
import { Difficulty, GeminiModel } from '../types';
import { LoadingSpinner } from './LoadingSpinner'; 

interface WelcomeScreenProps {
  onStartSession: (difficulty: Difficulty, model: GeminiModel) => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartSession, isLoading }) => {
  const [selectedModel, setSelectedModel] = React.useState<GeminiModel | null>(null);

  return (
    <div className="flex flex-col items-center justify-start p-8 text-center max-w-2xl mx-auto">
      <p className="text-slate-300 text-lg mb-8 leading-relaxed text-justify">
        Sharpen your cybersecurity knowledge with CISSP Master. This platform generates dynamic, scenario-based practice questions across all CISSP domains, powered by cutting-edge AI.
        <br /><br />
        Select an AI model and a difficulty level to begin your personalized study session.
      </p>

      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm w-full mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Select Gemini Model:</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSelectedModel(GeminiModel.Gemini3Flash)}
            className={`px-6 py-3 rounded-xl border-2 transition-all font-medium cursor-pointer ${
              selectedModel === GeminiModel.Gemini3Flash
                ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            Gemini 3 Flash
          </button>
          <button
            onClick={() => setSelectedModel(GeminiModel.Gemini25FlashLite)}
            className={`px-6 py-3 rounded-xl border-2 transition-all font-medium cursor-pointer ${
              selectedModel === GeminiModel.Gemini25FlashLite
                ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-lg shadow-blue-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            Gemini 2.5 Flash Lite
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm w-full">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Choose Your Challenge:</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => selectedModel && onStartSession(Difficulty.Easy, selectedModel)}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer disabled:scale-100"
            disabled={isLoading || !selectedModel}
          >
            Easy
          </button>
          <button
            onClick={() => selectedModel && onStartSession(Difficulty.Medium, selectedModel)}
            className="px-8 py-4 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer disabled:scale-100"
            disabled={isLoading || !selectedModel}
          >
            Medium
          </button>
          <button
            onClick={() => selectedModel && onStartSession(Difficulty.Hard, selectedModel)}
            className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer disabled:scale-100"
            disabled={isLoading || !selectedModel}
          >
            Hard
          </button>
        </div>
        {!selectedModel && (
          <p className="mt-4 text-sm text-slate-400 italic">Please select a model above to enable difficulty levels</p>
        )}
      </div>

      {isLoading && (
        <LoadingSpinner message="Generating your first batch of questions..." />
      )}
    </div>
  );
};