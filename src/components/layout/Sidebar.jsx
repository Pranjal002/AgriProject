import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  PlusCircle,
  Search,
  Users,
  Tractor,
  AlertTriangle,
  Building2,
  History,
  UserCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ currentTab, onSelectTab, isOpen, onClose }) {
  const { currentUser, isSuperAdmin, isOfficeAdmin, isViewer, canEdit } = useAuth();
  const { t, isNepali } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false
    },
    {
      id: 'subsidies',
      label: t('navSubsidies'),
      icon: FileSpreadsheet,
      badge: null,
      adminOnly: false
    },
    {
      id: 'add_subsidy',
      label: t('navAddSubsidy'),
      icon: PlusCircle,
      highlight: true,
      hidden: !canEdit,
      adminOnly: false
    },
    {
      id: 'engine_checker',
      label: t('navEngineChecker'),
      icon: Search,
      badge: 'All Nepal',
      adminOnly: false
    },
    {
      id: 'farmers',
      label: t('navFarmers'),
      icon: Users,
      badge: null,
      adminOnly: false
    },
    {
      id: 'products',
      label: t('navProducts'),
      icon: Tractor,
      badge: null,
      adminOnly: false
    },
    {
      id: 'duplicate_alerts',
      label: t('navDuplicateAlerts'),
      icon: ShieldAlert,
      badge: 'Watchlist',
      badgeColor: 'bg-crimson-600 text-white',
      adminOnly: false
    },
    {
      id: 'offices_users',
      label: t('navOfficesUsers'),
      icon: Building2,
      badge: null,
      adminOnly: true
    },
    {
      id: 'audit_log',
      label: t('navAuditLog'),
      icon: History,
      badge: null,
      adminOnly: true
    },
    {
      id: 'profile',
      label: t('navProfile'),
      icon: UserCheck,
      badge: null,
      adminOnly: false
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gov-600 flex items-center justify-center font-bold text-white shadow-md shadow-gov-600/40">
              🌾
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight text-white">{t('appNameShort')}</p>
              <p className="text-[10px] text-gov-400 uppercase font-semibold">
                {isNepali ? 'राष्ट्रिय प्रणाली' : 'National Registry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-white rounded"
          >
            ✕
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            if (item.hidden) return null;
            if (item.adminOnly && !isSuperAdmin && !isOfficeAdmin) return null;

            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-gov-700 text-white shadow-md shadow-gov-700/30'
                    : item.highlight
                    ? 'bg-gov-900/60 text-gov-300 border border-gov-700/50 hover:bg-gov-800/80 hover:text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive ? 'text-white' : item.highlight ? 'text-gov-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom jurisdiction notice */}
        <div className="p-3 m-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{isNepali ? 'इन्जिन लक सक्रिय' : 'Engine Lock Active'}</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1 leading-snug">
            {isNepali
              ? 'एउटै इन्जिन नम्बर अन्य कुनै कार्यालयबाट पुनः अनुदान लिन नसक्ने गरी सुरक्षित छ।'
              : 'Duplicate registry guard active across 7 provinces and 753 municipalities.'}
          </p>
        </div>
      </aside>
    </>
  );
}

