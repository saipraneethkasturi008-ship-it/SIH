import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      {text && <p className="mt-3 text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
