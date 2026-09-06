import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ variant = 'default' }) => {
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="language-select" className="sr-only">{t.nav?.selectLanguage}</label>
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm text-sm font-medium text-slate-700 hover:border-orange-400 transition-colors">
        <Globe className="w-4 h-4 text-orange-500 flex-shrink-0" />
        <select
          id="language-select"
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent border-none outline-none cursor-pointer text-xs md:text-sm font-semibold text-slate-800 pr-1"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.native} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
