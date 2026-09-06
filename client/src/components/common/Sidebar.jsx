import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import BrandLogo from './BrandLogo.jsx';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Calculator,
  TrendingUp,
  Receipt,
  Package,
  Megaphone,
  Landmark,
  User,
  HeartHandshake
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { business } = useBusiness();

  const navItems = [
    { to: '/dashboard', label: t.nav?.dashboard, icon: LayoutDashboard },
    { to: '/business-discovery', label: t.nav?.discovery, icon: Compass, badge: t.nav?.phaseOne },
    { to: '/business-opportunity', label: t.nav?.businessOpportunity, icon: Compass },
    { to: '/assistant', label: t.nav?.assistant, icon: Sparkles, highlight: true },
    { to: '/calculator', label: t.nav?.calculator, icon: Calculator },
    { to: '/sales', label: t.nav?.sales, icon: TrendingUp },
    { to: '/expenses', label: t.nav?.expenses, icon: Receipt },
    { to: '/products', label: t.nav?.products, icon: Package },
    { to: '/marketing', label: t.nav?.marketing, icon: Megaphone },
    { to: '/schemes', label: t.nav?.schemes, icon: Landmark },
    { to: '/profile', label: t.nav?.profile, icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 lg:top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200 ease-in-out flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="h-16 px-5 flex items-center border-b border-slate-100 lg:flex">
            <BrandLogo />
          </div>
          <div className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              {t.nav?.operatingSystem}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-50 text-orange-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${item.highlight ? 'ring-1 ring-orange-200' : ''}`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner inside sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200/60">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-800 mb-1">
              <HeartHandshake className="w-4 h-4 text-orange-600" />
              <span>{t.nav?.ruralAi}</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {t.nav?.ruralAiDescription}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
