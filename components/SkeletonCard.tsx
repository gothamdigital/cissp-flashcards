import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="border border-zinc-800 bg-zinc-950 flex flex-col min-h-[480px] animate-pulse">

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-3 w-32 bg-zinc-800" />
            <div className="h-3 w-16 bg-zinc-800" />
          </div>
          <div className="h-3 w-14 bg-zinc-900" />
        </div>

        {/* Question */}
        <div className="px-6 py-8 flex-grow">
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-zinc-800" />
            <div className="h-4 w-[90%] bg-zinc-800" />
            <div className="h-4 w-[60%] bg-zinc-800" />
          </div>

          <div className="space-y-px">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 border border-zinc-800 flex items-center gap-4">
                <div className="w-5 h-5 border border-zinc-800 flex-shrink-0" />
                <div className="h-4 bg-zinc-800" style={{ width: `${75 - i * 10}%` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-zinc-800">
          <div className="h-11 w-full bg-zinc-900" />
        </div>
      </div>
    </div>
  );
};
