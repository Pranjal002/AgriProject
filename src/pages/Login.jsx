import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Globe,
  Sparkles,
  Building2,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';

export default function Login() {
  const { login, availableDemoUsers, switchDemoUser } = useAuth();
  const { lang, toggleLanguage, t, isNepali } = useLanguage();
  const toast = useToast();

  const [email, setEmail] = useState('superadmin@moald.gov.np');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        toast.error('Login Failed', res.message);
      } else {
        toast.success('Signed In', 'Welcome to Central Subsidy Registry.');
      }
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userId) => {
    switchDemoUser(userId);
    toast.success('Authenticated', 'Switched officer session.');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-gov-600 selection:text-white">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 p-1 flex items-center justify-center border border-white/20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="46" fill="#dc2626" opacity="0.9" />
              <path d="M50 16 L61 38 L85 41 L67 58 L72 82 L50 70 L28 82 L33 58 L15 41 L39 38 Z" fill="#fef08a" />
              <path d="M25 75 Q50 60 75 75" stroke="#ffffff" strokeWidth="4" fill="none" />
            </svg>
          </div>
          <div className="text-white">
            <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-semibold">Government of Nepal</p>
            <h1 className="text-sm font-bold tracking-tight">Ministry of Agriculture & Livestock Development</h1>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-300" />
          <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
        </button>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gov-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-gov-700/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isNepali ? 'कृषि अनुदान दर्ता प्रणाली' : 'Central Subsidy Registry'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isNepali
                ? 'अधिकृत कर्मचारीहरूका लागि सुरक्षित राष्ट्रिय पोर्टल'
                : 'Authorized personnel portal for machinery duplicate prevention'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Government Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@moald.gov.np"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-gov-700 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-gov-700/20 transition flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Registry'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Demo Personas:</span>
            </p>

            <div className="space-y-1.5">
              {availableDemoUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.id)}
                  className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-gov-500 hover:bg-gov-50/50 transition flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{u.full_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{u.role?.replace('_', ' ')}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    Login
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-slate-500">
        <p>Government of Nepal • Ministry of Agriculture and Livestock Development</p>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        isOpen={forgotModal}
        onClose={() => {
          setForgotModal(false);
          setResetSent(false);
        }}
        title="Reset Government Account Password"
        maxWidth="max-w-md"
      >
        {resetSent ? (
          <div className="text-center py-4 space-y-3 text-xs">
            <CheckCircle2 className="w-10 h-10 text-gov-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Password Reset Link Dispatched</h4>
            <p className="text-slate-500">
              An official password reset token has been sent to <strong>{forgotEmail}</strong>. Follow the instructions to reset your password.
            </p>
            <button
              onClick={() => {
                setForgotModal(false);
                setResetSent(false);
              }}
              className="px-4 py-2 bg-gov-700 text-white rounded-xl font-bold"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Enter your registered government email address. We will send you an official reset link.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="officer@moald.gov.np"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setForgotModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl shadow-md"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

