import React from 'react';
import { BookOpen, RefreshCcw } from 'lucide-react';
import { Difficulty } from '../types';
import { LoadingSpinner } from './LoadingSpinner'; // Assuming LoadingSpinner is in the same directory

interface WelcomeScreenProps {
  onStartSession: (difficulty: Difficulty) => void;
  isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartSession, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
      <div className="bg-slate-600 p-3 rounded-xl mb-6">
        <BookOpen className="text-white w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-400 to-emerald-400 bg-clip-text text-transparent mb-4">
        CISSP<span className="text-slate-200 font-light ml-2">Master</span>
      </h1>
      <p className="text-slate-300 text-lg mb-8 leading-relaxed text-justify">
        Sharpen your cybersecurity knowledge with CISSP Master. This platform generates dynamic, scenario-based practice questions across all CISSP domains, powered by cutting-edge AI.
        <br /><br />
        Select a difficulty level to begin your personalized study session.
      </p>

      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Choose Your Challenge:</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => onStartSession(Difficulty.Easy)}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isLoading}
          >
            Easy
          </button>
          <button
            onClick={() => onStartSession(Difficulty.Medium)}
            className="px-8 py-4 rounded-2xl bg-slate-600 hover:bg-slate-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isLoading}
          >
            Medium
          </button>
          <button
            onClick={() => onStartSession(Difficulty.Hard)}
            className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isLoading}
          >
            Hard
          </button>
        </div>
      </div>

      {isLoading && (
        <LoadingSpinner message="Generating your first batch of questions..." />
      )}
    </div>
  );
};