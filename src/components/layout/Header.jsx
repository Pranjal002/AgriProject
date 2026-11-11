import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  ShieldCheck,
  Building,
  User,
  LogOut,
  ChevronDown,
  Database,
  ExternalLink,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { getDuplicateAlerts, resetDemoDatabase } from '../../services/api';
import { LevelBadge } from '../common/Badge';

export default function Header({ onToggleSidebar, onNavigate }) {
  const { currentUser, currentOffice, switchDemoUser, availableDemoUsers, logout, isSuperAdmin } = useAuth();
  const { lang, toggleLanguage, t, isNepali } = useLanguage();
  const [openAlertsCount, setOpenAlertsCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const isSupabaseLive = isSupabaseConfigured();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const alerts = await getDuplicateAlerts('open');
        setOpenAlertsCount(alerts.length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    if (window.confirm(isNepali ? 'के तपाईं सबै नमुना डाटा सुरुवाती अवस्थामा फर्काउन चाहनुहुन्छ?' : 'Reset demo database back to initial seed data?')) {
      resetDemoDatabase();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top National Government Bar */}
      <div className="bg-gradient-to-r from-gov-900 via-gov-800 to-gov-950 text-white px-4 sm:px-6 py-2.5 w-full">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full">
          {/* Emblem & Ministry info */}
          <div className="flex items-center gap-3">
            {/* Government of Nepal Emblem Representation */}
            <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="46" fill="#dc2626" opacity="0.9" />
                <path d="M50 16 L61 38 L85 41 L67 58 L72 82 L50 70 L28 82 L33 58 L15 41 L39 38 Z" fill="#fef08a" />
                <path d="M25 75 Q50 60 75 75" stroke="#ffffff" strokeWidth="4" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-medium text-emerald-200 tracking-wider uppercase leading-none">
                {t('govHeader')}
              </p>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight mt-0.5">
                {t('appName')}
              </h1>
            </div>
          </div>

          {/* Quick Controls: Demo Switcher & Language Toggle */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Supabase Status Pill */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isSupabaseLive
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  : 'bg-amber-500/20 text-amber-200 border-amber-400/40'
              }`}
              title={isSupabaseLive ? 'Connected to live Supabase backend' : 'Running in offline / local storage mode'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseLive ? 'Supabase Live' : 'Demo Mode'}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition backdrop-blur-sm"
              title="Toggle English / नेपाली"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleResetData}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 text-xs rounded-lg border border-white/20 transition"
              title="Reset sample database"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary App Navigation Header */}
      <div className="px-4 sm:px-6 py-2 bg-white flex items-center justify-between w-full">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Office & Jurisdiction Badge */}
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gov-700 hidden sm:block" />
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 line-clamp-1">
                {currentOffice?.name}
              </span>
              <LevelBadge level={currentOffice?.government_level} isNepali={isNepali} />
            </div>
          </div>
        </div>

        {/* Right Action Icons: Duplicate Alerts Pill & User Profile */}
        <div className="flex items-center gap-3">
          {/* Prominent Duplicate Alert Pill */}
          <button
            onClick={() => onNavigate('duplicate_alerts')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
              openAlertsCount > 0
                ? 'bg-crimson-600 hover:bg-crimson-700 text-white shadow-crimson-600/30 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isNepali ? 'सतर्कता' : 'Fraud Alerts'}</span>
            {openAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-crimson-700 font-extrabold text-[11px]">
                {openAlertsCount}
              </span>
            )}
          </button>

          {/* User Persona Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gov-700 text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-xs leading-tight">
                <p className="font-bold text-slate-800 line-clamp-1">{currentUser?.full_name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setUserDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Active Profile</p>
                  <p className="text-sm font-bold text-slate-800">{currentUser?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                  <div className="mt-1.5">
                    <LevelBadge level={currentOffice?.government_level} isNepali={isNepali} />
                  </div>
                </div>

                {/* Quick Persona Switcher */}
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70">
                  <p className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quick Switch Persona (Demo):</span>
                  </p>
                  <div className="space-y-1">
                    {availableDemoUsers.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          switchDemoUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                          u.id === currentUser?.id
                            ? 'bg-gov-100 font-bold text-gov-900'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="truncate">{u.full_name}</span>
                        <span className="text-[10px] uppercase text-slate-400">{u.role}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('navProfile')}</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-crimson-600 hover:bg-crimson-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-crimson-500" />
                    <span>{t('navLogout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

