import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const LogoIntro = ({ onComplete }) => {
  const { t } = useLanguage();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTime = reducedMotion ? 250 : 2400;
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), revealTime - 350);
    const completeTimer = window.setTimeout(onComplete, revealTime);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <section className={`logo-intro ${isLeaving ? 'logo-intro-leaving' : ''}`} aria-label={t.appName} aria-live="polite">
      <div className="logo-intro-lockup">
        <svg className="logo-intro-mark" viewBox="0 0 96 96" role="img" aria-label="VM">
          <rect className="logo-intro-background" width="96" height="96" rx="22" />
          <path className="logo-intro-stem logo-intro-stem-v" d="M20 29 34 68 48 29" />
          <path className="logo-intro-stem logo-intro-stem-m" d="M46 68V31l15 22 15-22v37" />
          <path className="logo-intro-gold logo-intro-gold-sweep" d="M57 49c7-4 13-10 19-20" />
          <path className="logo-intro-gold logo-intro-gold-arrow" d="m70 29 7 0-3 7" />
          <path className="logo-intro-shine" d="M8 20h80" />
        </svg>
        <div className="logo-intro-copy">
          <strong>Vyapar Mitra</strong>
          <span>{t.tagline}</span>
        </div>
      </div>
    </section>
  );
};

export default LogoIntro;
