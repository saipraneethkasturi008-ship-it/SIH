import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBusiness } from '../../context/BusinessContext.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import BrandLogo from './BrandLogo.jsx';
import {
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label={t.nav?.toggleMenu}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="group lg:hidden">
              <BrandLogo />
            </div>
          </div>

          {/* Center/Active Business Persona indicator */}
          <div className="hidden md:flex items-center">
            {business ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-semibold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate max-w-[200px]">{t.nav?.personaUnit}</span>
                <span className="text-amber-600">({business.state || t.nav?.defaultState})</span>
              </div>
            ) : (
              <Link
                to="/business-discovery"
                className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full border border-orange-200 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.nav?.discovery}</span>
              </Link>
            )}
          </div>

          {/* Right: Language switcher & user action */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm border border-orange-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : t.nav?.userInitial}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 hidden sm:inline max-w-[120px] truncate">
                    {user?.name || t.nav?.entrepreneur}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-700 font-medium">{t.nav?.signedInAs || 'Signed in as'}</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name || t.nav?.defaultUser}</p>
                      <p className="text-xs text-orange-600 font-medium">{business?.name || t.nav?.defaultBusiness}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      {t.nav?.profile}
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav?.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs md:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg"
                >
                  {t.nav?.login}
                </Link>
                <Link
                  to="/business-discovery"
                  className="text-xs md:text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-colors flex items-center gap-1"
                >
                  <span>{t.nav?.start}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
