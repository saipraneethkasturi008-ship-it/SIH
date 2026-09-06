import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description, actionLabel, onAction, icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl my-4">
      <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      {description && <p className="text-sm text-slate-500 max-w-sm mt-1">{description}</p>}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
