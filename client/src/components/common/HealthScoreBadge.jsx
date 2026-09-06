import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

const HealthScoreBadge = ({ score = 84, size = 'md' }) => {
  let status = 'Good';
  let colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let barColor = 'bg-emerald-500';

  if (score < 50) {
    status = 'Critical';
    colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
    barColor = 'bg-rose-500';
  } else if (score < 75) {
    status = 'Moderate';
    colorClass = 'text-amber-600 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${colorClass}`}>
      <Activity className="w-4 h-4 animate-pulse" />
      <span>Health: {score}/100 ({status})</span>
    </div>
  );
};

export default HealthScoreBadge;
