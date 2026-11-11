import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AccessDenied({ onNavigate }) {
  const { isNepali } = useLanguage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-crimson-100 text-crimson-600 flex items-center justify-center">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          {isNepali ? 'पहुँच अस्वीकृत (४०३)' : 'Access Restricted (403)'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {isNepali
            ? 'तपाईंको कार्यालय वा प्रयोगकर्ताको भूमिकालाई यो पृष्ठ हेर्ने वा सम्पादन गर्ने अधिकार दिइएको छैन।'
            : 'Your assigned government office jurisdiction or user role lacks required clearance for this administrative section.'}
        </p>
      </div>

      <button
        onClick={() => onNavigate('dashboard')}
        className="px-5 py-2.5 bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
}
