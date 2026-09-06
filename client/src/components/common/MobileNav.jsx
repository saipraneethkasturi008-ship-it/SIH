import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calculator, LayoutDashboard, Receipt, Sparkles, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const MobileNav = () => {
  const { t } = useLanguage();
  const items = [
    { to: '/dashboard', label: t.nav?.dashboard, icon: LayoutDashboard },
    { to: '/assistant', label: t.nav?.assistant, icon: Sparkles },
    { to: '/sales', label: t.nav?.sales, icon: Receipt },
    { to: '/calculator', label: t.nav?.calculator, icon: Calculator },
    { to: '/profile', label: t.nav?.profile, icon: User }
  ];

  return (
    <nav aria-label={t.nav?.mobileNavigation || 'Mobile navigation'} className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive ? 'text-orange-600' : 'text-slate-500'}`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="truncate max-w-[4.5rem]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
