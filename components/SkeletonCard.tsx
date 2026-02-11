import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-pulse">

        {/* Header / Badges */}
        <div className="p-6 pb-2 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="h-6 w-40 bg-slate-700 rounded-full" />
            <div className="h-6 w-20 bg-slate-700 rounded-full" />
          </div>
          <div className="h-4 w-16 bg-slate-700/50 rounded" />
        </div>

        {/* Question Area */}
        <div className="p-8 flex-grow">
          <div className="space-y-3 mb-8">
            <div className="h-6 w-full bg-slate-700 rounded" />
            <div className="h-6 w-[90%] bg-slate-700 rounded" />
            <div className="h-6 w-[60%] bg-slate-700 rounded" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-slate-700 bg-slate-800/50 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex-shrink-0" />
                <div className="h-5 bg-slate-700 rounded" style={{ width: `${70 - i * 8}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900/50 border-t border-slate-700">
          <div className="h-14 w-full bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
