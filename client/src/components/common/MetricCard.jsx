import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange' }) => {
  const colorStyles = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.orange}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {trend && (
            <span className={`inline-flex items-center font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
