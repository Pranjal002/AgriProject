import React from 'react';

export function LevelBadge({ level, isNepali = false }) {
  if (level === 1) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
        🏛️ {isNepali ? 'संघीय (तह १)' : 'Federal (L1)'}
      </span>
    );
  }
  if (level === 2) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        🏢 {isNepali ? 'प्रदेश (तह २)' : 'Provincial (L2)'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      🏡 {isNepali ? 'स्थानीय तह (तह ३)' : 'Local (L3)'}
    </span>
  );
}

export function StatusBadge({ status, isNepali = false }) {
  switch (status) {
    case 'open':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-crimson-100 text-crimson-800 border border-crimson-200 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-crimson-600"></span>
          {isNepali ? 'कारबाही बाँकी (खुला)' : 'Open Alert'}
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          {isNepali ? 'समीक्षामा' : 'Under Review'}
        </span>
      );
    case 'confirmed_fraud':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-900 text-white border border-red-950">
          ⛔ {isNepali ? 'पुष्टि भएको जालसाजी' : 'Confirmed Fraud'}
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gov-100 text-gov-800 border border-gov-200">
          ✓ {isNepali ? 'समाधान भएको' : 'Resolved'}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
          {status}
        </span>
      );
  }
}

