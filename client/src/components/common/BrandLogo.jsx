import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';

const BrandLogo = ({ compact = false, className = '' }) => {
  const { t } = useLanguage();

  return (
    <Link to="/" className={`inline-flex items-center ${compact ? '' : 'max-w-[220px]'} ${className}`} aria-label={t.appName || 'VyaparMitra'}>
      <img
        src={compact ? '/logo-icon.svg' : '/logo-horizontal.svg'}
        alt={compact ? t.appName : `${t.appName}, ${t.tagline}`}
        className={compact ? 'h-10 w-10' : 'h-10 w-auto max-w-full'}
      />
    </Link>
  );
};

export default BrandLogo;
  

