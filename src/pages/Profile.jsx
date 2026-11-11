import React, { useState } from 'react';
import {
  User,
  Building2,
  Shield,
  Key,
  Globe,
  CheckCircle,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { LevelBadge } from '../components/common/Badge';

export default function Profile() {
  const { currentUser, currentOffice, switchDemoUser, availableDemoUsers } = useAuth();
  const { lang, setLang, toggleLanguage, t, isNepali } = useLanguage();
  const toast = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Validation Error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Validation Error', 'New passwords do not match.');
      return;
    }

    setPasswordSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password Updated', 'Your security credentials have been updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t('navProfile')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isNepali
            ? 'तपाईंको आधिकारिक विवरण, तोकिएको कार्यालय, पहुँच अधिकार तथा सुरक्षा सेटिङहरू'
            : 'Officer profile details, assigned jurisdiction, role permissions, and security'}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gov-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {currentUser?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{currentUser?.full_name}</h3>
              <LevelBadge level={currentOffice?.government_level} isNepali={isNepali} />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.email}</span>
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.phone || 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="sm:text-right text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Role</span>
          <span className="inline-block px-3 py-1 bg-gov-100 text-gov-800 font-bold rounded-lg uppercase mt-0.5">
            {currentUser?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Grid: Office Jurisdiction & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Office Jurisdiction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gov-700" />
            <span>Assigned Government Jurisdiction</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Office Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{currentOffice?.name}</p>
              <p className="text-[11px] text-slate-500">{currentOffice?.province} Province, {currentOffice?.district}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Tier Level</span>
                <p className="font-semibold text-slate-800">Level {currentOffice?.government_level}</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Office Phone</span>
                <p className="font-semibold text-slate-800">{currentOffice?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language Preference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gov-700" />
            <span>Language & Locale Preferences</span>
          </h4>

          <p className="text-xs text-slate-500">
            Switch between English and Devanagari Nepali throughout the registry dashboard, alerts, and forms.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                setLang('en');
                localStorage.setItem('namr_lang', 'en');
              }}
              className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                lang === 'en'
                  ? 'border-gov-600 bg-gov-50 text-gov-900 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>English</span>
              {lang === 'en' && <CheckCircle className="w-4 h-4 text-gov-600" />}
            </button>

            <button
              onClick={() => {
                setLang('ne');
                localStorage.setItem('namr_lang', 'ne');
              }}
              className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                lang === 'ne'
                  ? 'border-gov-600 bg-gov-50 text-gov-900 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span>नेपाली (Nepali)</span>
              {lang === 'ne' && <CheckCircle className="w-4 h-4 text-gov-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Key className="w-4 h-4 text-gov-700" />
          <span>Security & Password</span>
        </h4>

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl shadow-md transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Quick Switch Persona (Demo Testing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Switch Officer Persona (For Testing All Roles)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {availableDemoUsers.map(u => (
            <button
              key={u.id}
              onClick={() => switchDemoUser(u.id)}
              className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                u.id === currentUser?.id
                  ? 'border-gov-600 bg-gov-50 font-bold'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{u.full_name}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">{u.role}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-1">{u.email}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
