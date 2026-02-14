import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Generating questions..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 text-zinc-500">
      <Loader2 className="w-6 h-6 mb-4 animate-spin text-zinc-600" />
      <p className="text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
};
