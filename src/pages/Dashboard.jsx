import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Users,
  Building2,
  AlertOctagon,
  TrendingUp,
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  ArrowRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDashboardStats, resolveDuplicateAlert } from '../services/api';
import { formatNPR, toNepaliDigits } from '../utils/nepaliValidators';
import { formatDisplayDate } from '../services/nepaliDate';
import { StatusBadge, LevelBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function Dashboard({ onNavigate }) {
  const { currentUser, currentOffice, isSuperAdmin, isOfficeAdmin, canEdit } = useAuth();
  const { t, isNepali } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolving, setResolving] = useState(false);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats(currentUser);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const handleResolveAlert = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setResolving(true);
    try {
      await resolveDuplicateAlert(selectedAlert.id, {
        status: resolutionStatus,
        resolution_note: resolutionNote,
        resolved_by: currentUser?.id,
        currentUser
      });
      setSelectedAlert(null);
      setResolutionNote('');
      await loadStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        <p className="text-sm font-semibold">{isNepali ? 'ड्यासबोर्ड लोड हुँदैछ...' : 'Loading central registry dashboard...'}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: t('totalSubsidized'),
      value: isNepali ? toNepaliDigits(stats.totalSubsidies) : stats.totalSubsidies,
      subtext: isNepali ? 'सबै कार्यालयहरूबाट दर्ता' : 'Across all registered offices',
      icon: Tractor,
      bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    },
    {
      title: t('totalFarmers'),
      value: isNepali ? toNepaliDigits(stats.totalFarmers) : stats.totalFarmers,
      subtext: isNepali ? 'अद्वितीय लाभान्वित कृषक' : 'Unique beneficiary farmers',
      icon: Users,
      bg: 'bg-blue-500/10 text-blue-700 border-blue-200'
    },
    {
      title: t('totalOffices'),
      value: isNepali ? toNepaliDigits(stats.totalOffices) : stats.totalOffices,
      subtext: isNepali ? 'संघ, प्रदेश र स्थानीय तह' : 'Federal, Provincial & Local',
      icon: Building2,
      bg: 'bg-purple-500/10 text-purple-700 border-purple-200'
    },
    {
      title: t('openAlerts'),
      value: isNepali ? toNepaliDigits(stats.openAlertsCount) : stats.openAlertsCount,
      subtext: isNepali ? 'दोहोरो दर्ता रोकथाम सतर्कता' : 'Active fraud attempts blocked',
      icon: AlertOctagon,
      bg: stats.openAlertsCount > 0
        ? 'bg-crimson-500/15 text-crimson-700 border-crimson-300 ring-2 ring-crimson-500/20 animate-pulse'
        : 'bg-slate-100 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action & Jurisdiction Banner */}
      <div className="bg-gradient-to-r from-gov-800 to-gov-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold mb-2 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('duplicatePreventionNotice')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {currentOffice?.name}
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              {isNepali
                ? `तपाईं ${currentUser?.full_name} (${currentUser?.role?.replace('_', ' ')}) को रूपमा लगइन हुनुहुन्छ।`
                : `Logged in as ${currentUser?.full_name} (${currentUser?.role?.replace('_', ' ')}).`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('engine_checker')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/25 flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>{t('verifyNow')}</span>
            </button>
            {canEdit && (
              <button
                onClick={() => onNavigate('add_subsidy')}
                className="px-4 py-2 bg-gov-500 hover:bg-gov-400 text-gov-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('navAddSubsidy')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-white border shadow-sm transition hover:shadow-md ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-white/80 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">{card.value}</p>
              <p className="text-[11px] opacity-75 mt-1 font-medium">{card.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* PROMINENT RED "DUPLICATE ENTRIES" SECTION */}
      <div className="bg-white rounded-2xl border-2 border-crimson-300 shadow-lg shadow-crimson-950/5 overflow-hidden">
        <div className="bg-crimson-600 px-6 py-4 text-white flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-crimson-700 text-white shadow-xs">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">{t('duplicateEntriesTitle')}</h3>
              <p className="text-crimson-100 text-xs mt-0.5">{t('duplicateEntriesSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('duplicate_alerts')}
            className="text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
          >
            <span>{isNepali ? 'सबै सतर्कता हेर्नुहोस्' : 'View Full Registry'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats.recentAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <ShieldCheck className="w-10 h-10 text-gov-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">{t('noOpenAlerts')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-crimson-50/70 border-b border-crimson-200 text-crimson-950 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">{t('engineNumber')}</th>
                  <th className="px-5 py-3">{t('attemptedOffice')}</th>
                  <th className="px-5 py-3">{t('existingOffice')}</th>
                  <th className="px-5 py-3">{t('originalFarmer')}</th>
                  <th className="px-5 py-3">{t('status')}</th>
                  <th className="px-5 py-3 text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-crimson-50/30 transition">
                    <td className="px-5 py-3.5 font-mono font-bold text-crimson-900">
                      {alert.engine_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{alert.attemptedOffice?.name || 'Local Office'}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatDisplayDate(alert.created_at, isNepali)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{alert.existingOffice?.name || 'Central Registry'}</p>
                      <p className="text-[10px] text-slate-500">
                        {alert.existingSubsidy?.subsidy_year_bs} BS
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      <span className="font-medium">{alert.existingFarmer?.name || 'Registered Farmer'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={alert.status} isNepali={isNepali} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {(isSuperAdmin || isOfficeAdmin) ? (
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setResolutionStatus(alert.status === 'open' ? 'under_review' : 'resolved');
                            setResolutionNote(alert.resolution_note || '');
                          }}
                          className="px-3 py-1.5 bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-semibold text-xs transition shadow-xs"
                        >
                          {t('resolveAlert')}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Admin Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Fiscal Year Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gov-700" />
              <span>{t('chartSubsidiesByYear')}</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">Bikram Sambat</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.yearCounts).map(([year, count]) => {
              const max = Math.max(...Object.values(stats.yearCounts), 1);
              const percentage = Math.round((count / max) * 100);

              return (
                <div key={year}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">{year} BS</span>
                    <span className="font-bold text-gov-800">
                      {isNepali ? toNepaliDigits(count) : count} {isNepali ? 'मेसिन' : 'units'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gov-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Administrative Tier Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gov-700" />
              <span>{t('chartSubsidiesByGovLevel')}</span>
            </h4>
            <span className="text-xs text-slate-400">3 Tiers</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <span className="text-[11px] font-bold text-purple-700 uppercase block">{t('levelFederal')}</span>
              <p className="text-2xl font-extrabold text-purple-950 mt-1">
                {isNepali ? toNepaliDigits(stats.levelCounts.Federal) : stats.levelCounts.Federal}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[11px] font-bold text-blue-700 uppercase block">{t('levelProvincial')}</span>
              <p className="text-2xl font-extrabold text-blue-950 mt-1">
                {isNepali ? toNepaliDigits(stats.levelCounts.Provincial) : stats.levelCounts.Provincial}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">{t('levelLocal')}</span>
              <p className="text-2xl font-extrabold text-emerald-950 mt-1">
                {isNepali ? toNepaliDigits(stats.levelCounts.Local) : stats.levelCounts.Local}
              </p>
            </div>
          </div>

          {/* Machinery Category Tags */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 block mb-2">{t('chartSubsidiesByCategory')}</span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categoryCounts).map(([cat, cnt]) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1.5"
                >
                  <span>{cat}:</span>
                  <span className="text-gov-700 font-bold">{cnt}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      <Modal
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={t('resolveAlert')}
        maxWidth="max-w-lg"
      >
        {selectedAlert && (
          <form onSubmit={handleResolveAlert} className="space-y-4">
            <div className="p-3 bg-crimson-50 rounded-xl border border-crimson-200 text-xs">
              <p className="font-bold text-crimson-900">
                Engine Number: <span className="font-mono">{selectedAlert.engine_number}</span>
              </p>
              <p className="text-slate-700 mt-1">
                Attempted by: <span className="font-semibold">{selectedAlert.attemptedOffice?.name}</span>
              </p>
              <p className="text-slate-700">
                Original record: <span className="font-semibold">{selectedAlert.existingOffice?.name} ({selectedAlert.existingFarmer?.name})</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Update Status
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-gov-500 focus:outline-none"
              >
                <option value="under_review">{t('statusUnderReview')}</option>
                <option value="confirmed_fraud">{t('statusConfirmedFraud')}</option>
                <option value="resolved">{t('statusResolved')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Investigation / Resolution Note
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Enter details of investigation, dealer reprimand, or reason for dismissal..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={resolving}
                className="px-4 py-2 text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 rounded-lg transition shadow-sm"
              >
                {resolving ? 'Saving...' : 'Submit Resolution'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

