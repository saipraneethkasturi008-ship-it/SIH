import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageSelector from '../components/common/LanguageSelector.jsx';
import HealthScoreBadge from '../components/common/HealthScoreBadge.jsx';
import {
  User,
  Store,
  Languages,
  MapPin,
  TrendingUp,
  Receipt,
  RotateCcw,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters.js';

const Profile = () => {
  const { user } = useAuth();
  const { business, refreshAll } = useBusiness();
  const { t, currentLanguage, languages, changeLanguage } = useLanguage();

  const handleResetToDemo = () => {
    if (window.confirm('Reset business data back to Lakshmi Homemade Foods demo default?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-500/20">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'L'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user?.name || 'Lakshmi Devi'}</h1>
            <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full">
              Verified Entrepreneur
            </span>
          </div>
          <p className="text-xs text-slate-500">{business?.name || 'Lakshmi Homemade Foods'}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 pt-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>{business?.location || 'Tenali, Guntur District, Andhra Pradesh'}</span>
          </div>
        </div>

        <div>
          <HealthScoreBadge score={business?.healthScore || 84} />
        </div>
      </div>

      {/* Business Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Store className="w-5 h-5 text-orange-600" />
          <span>Business Registration Overview</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-medium">Enterprise Name</span>
            <p className="font-bold text-slate-800 mt-1">{business?.name}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-medium">Category</span>
            <p className="font-bold text-slate-800 mt-1">{business?.category}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-medium">Monthly Turnover</span>
            <p className="font-bold text-emerald-700 mt-1">{formatCurrency(business?.monthlySales || 35200)}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 font-medium">Monthly Operating Expenses</span>
            <p className="font-bold text-orange-700 mt-1">{formatCurrency(business?.monthlyExpenses || 21300)}</p>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-orange-600" />
          <span>Regional Language Settings</span>
        </h2>

        <p className="text-xs text-slate-500">
          Select your primary operating language for AI suggestions, voice recognition, and marketing generator:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLanguage(l.code)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                currentLanguage === l.code
                  ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="text-sm font-bold">{l.native}</div>
              <div className="text-[11px] text-slate-400">{l.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Controls */}
      <div className="p-6 bg-slate-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Presentation Demo Reset</h4>
          <p className="text-xs text-slate-500">Reset all logged test sales and expenses back to the default Lakshmi Foods demo dataset.</p>
        </div>
        <button
          onClick={handleResetToDemo}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
