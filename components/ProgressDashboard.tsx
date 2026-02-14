import React, { useMemo } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { UserAnswer } from '../types';
import { CONFIG } from '../config';

interface ProgressDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  answers: Record<string, UserAnswer>;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ isOpen, onClose, answers }) => {
  const stats = useMemo(() => {
    const answerList: UserAnswer[] = Object.values(answers);
    const total = answerList.length;
    const correct = answerList.filter(a => a.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    const byDomain: Record<string, { total: number; correct: number }> = {};

    answerList.forEach(a => {
      if (!byDomain[a.domain]) {
        byDomain[a.domain] = { total: 0, correct: 0 };
      }
      const domainStats = byDomain[a.domain];
      if (domainStats) {
        domainStats.total += 1;
        if (a.isCorrect) {
          domainStats.correct += 1;
        }
      }
    });

    return { total, correct, accuracy, byDomain };
  }, [answers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-300">
            Study Progress
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-px bg-zinc-800">
            <div className="bg-zinc-950 p-5 text-center">
              <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
                Answered
              </div>
              <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
            </div>

            <div className="bg-zinc-950 p-5 text-center">
              <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
                Accuracy
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  stats.accuracy >= CONFIG.ACCURACY_THRESHOLDS.HIGH ? 'text-emerald-500' :
                  stats.accuracy >= CONFIG.ACCURACY_THRESHOLDS.MEDIUM ? 'text-amber-500' :
                  'text-red-500'
                }`}>
                  {stats.accuracy}%
                </span>
                <TrendingUp size={14} className="text-zinc-700" />
              </div>
            </div>

            <div className="bg-zinc-950 p-5 text-center">
              <div className="text-[11px] font-medium uppercase tracking-widest text-zinc-600 mb-2">
                Score
              </div>
              <div className="text-2xl font-bold font-mono">
                <span className="text-emerald-500">{stats.correct}</span>
                <span className="text-zinc-700 mx-1">/</span>
                <span className="text-red-500">{stats.total - stats.correct}</span>
              </div>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
              Domain Mastery
            </h3>
            {Object.keys(stats.byDomain).length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-sm border border-zinc-800 border-dashed">
                Answer more questions to see domain breakdown
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.byDomain).map(([domain, data]: [string, { total: number, correct: number }]) => {
                  const percentage = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={domain} className="border border-zinc-800 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">{domain}</span>
                        <span className="text-xs font-mono text-zinc-600">
                          {data.correct}/{data.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 flex">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                        <div
                          className="h-full bg-red-900/50 transition-all duration-500"
                          style={{ width: `${100 - percentage}%` }}
                        />
                      </div>
                      <div className="mt-1.5 text-right text-[11px] text-zinc-600 font-mono">
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-accent text-zinc-950 text-sm font-bold hover:bg-accent-hover transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
