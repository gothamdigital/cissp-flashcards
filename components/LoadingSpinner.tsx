import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Consulting the AI Proctor..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-96 text-slate-400 animate-pulse">
      <Loader2 className="w-12 h-12 mb-4 animate-spin text-slate-500" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};
