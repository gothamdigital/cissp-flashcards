import React, { useMemo } from 'react';
import { X, PieChart, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
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

    // Group by domain
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-500/20 p-2 rounded-lg text-slate-400">
              <PieChart size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Study Progress</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Top Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Answered</span>
              <span className="text-4xl font-bold text-white">{stats.total}</span>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Accuracy</span>
              <div className="flex items-center gap-2">
                 <span className={`text-4xl font-bold ${
                   stats.accuracy >= CONFIG.ACCURACY_THRESHOLDS.HIGH ? 'text-emerald-400' :
                   stats.accuracy >= CONFIG.ACCURACY_THRESHOLDS.MEDIUM ? 'text-yellow-400' :
                   'text-rose-400'
                 }`}>
                  {stats.accuracy}%
                </span>
                <TrendingUp size={20} className="text-slate-500" />
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Performance</span>
              <div className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle size={16} />
                  <span className="font-bold text-xl">{stats.correct}</span>
                </div>
                <div className="w-px bg-slate-700 h-8"></div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <AlertCircle size={16} />
                  <span className="font-bold text-xl">{stats.total - stats.correct}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Domain Mastery</h3>
            {Object.keys(stats.byDomain).length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                Answer more questions to see domain breakdown
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(stats.byDomain).map(([domain, data]: [string, { total: number, correct: number }]) => {
                  const percentage = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={domain} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-300 text-sm md:text-base">{domain}</span>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-emerald-400">{data.correct}</span>
                          <span className="text-slate-600">/</span>
                          <span className="text-slate-400">{data.total}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar Container */}
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        {/* Correct Portion */}
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        {/* Incorrect Portion (fills the rest implicitly by being transparent against bg, or explicit red) */}
                        <div 
                          className="h-full bg-rose-500/50 transition-all duration-500 ease-out"
                          style={{ width: `${100 - percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-right text-xs text-slate-500">
                        {percentage}% Correct
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
        
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
           >
             Close Dashboard
           </button>
        </div>
      </div>
    </div>
  );
};
