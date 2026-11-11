import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  Building2,
  Calendar,
  User,
  Check,
  Ban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getDuplicateAlerts, resolveDuplicateAlert } from '../services/api';
import { formatDisplayDate } from '../services/nepaliDate';
import { StatusBadge } from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function DuplicateAlerts() {
  const { currentUser, isSuperAdmin, isOfficeAdmin } = useAuth();
  const { t, isNepali } = useLanguage();
  const toast = useToast();

  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Resolution Modal State
  const [activeAlert, setActiveAlert] = useState(null);
  const [statusInput, setStatusInput] = useState('under_review');
  const [notesInput, setNotesInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getDuplicateAlerts(statusFilter);
      setAlerts(data);
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Failed to fetch duplicate alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter]);

  const openResolveModal = (alert) => {
    setActiveAlert(alert);
    setStatusInput(alert.status === 'open' ? 'under_review' : alert.status);
    setNotesInput(alert.resolution_note || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!activeAlert) return;

    setSaving(true);
    try {
      await resolveDuplicateAlert(activeAlert.id, {
        status: statusInput,
        resolution_note: notesInput,
        resolved_by: currentUser?.id,
        currentUser
      });

      toast.success(
        'Alert Updated',
        `Duplicate alert for engine ${activeAlert.engine_number} updated to "${statusInput}".`
      );

      setActiveAlert(null);
      await fetchAlerts();
    } catch (err) {
      toast.error('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-crimson-600" />
            <span>{t('navDuplicateAlerts')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? 'केन्द्रीय इन्जिन सुरक्षा प्रणालीद्वारा पत्ता लगाइएका सम्भावित दोहोरो अनुदान जालसाजी सतर्कताहरू'
              : 'Fraud detection log tracking duplicate engine entry attempts and resolutions across Nepal'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'open', label: 'Open (Action Required)' },
          { id: 'under_review', label: 'Under Review' },
          { id: 'confirmed_fraud', label: 'Confirmed Fraud' },
          { id: 'resolved', label: 'Resolved / Closed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold animate-pulse">
            Loading duplicate alerts registry...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 text-gov-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No duplicate fraud alerts matching filter</p>
            <p className="text-xs text-slate-400 mt-0.5">System has not flagged any duplicate violations in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">{t('engineNumber')}</th>
                  <th className="px-5 py-3.5">Attempted By (Violating Office)</th>
                  <th className="px-5 py-3.5">Original Registered Office</th>
                  <th className="px-5 py-3.5">Original Beneficiary</th>
                  <th className="px-5 py-3.5">{t('status')}</th>
                  <th className="px-5 py-3.5">Resolution Notes</th>
                  <th className="px-5 py-3.5 text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-extrabold text-crimson-900 bg-crimson-50 px-2 py-0.5 rounded border border-crimson-200">
                        {a.engine_number}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Flagged: {formatDisplayDate(a.created_at, isNepali)}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{a.attemptedOffice?.name || 'Local Office'}</p>
                      <p className="text-[10px] text-slate-500">
                        User: {a.attemptedUser?.full_name || 'Field Officer'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{a.existingOffice?.name || 'Central Registry'}</p>
                      <p className="text-[10px] text-slate-500">
                        FY: {a.existingSubsidy?.subsidy_year_bs || 'Previous'} BS
                      </p>
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {a.existingFarmer?.name || 'N/A'}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.status} isNepali={isNepali} />
                    </td>

                    <td className="px-5 py-3.5 max-w-xs text-slate-600">
                      <p className="line-clamp-2 italic text-[11px]">
                        {a.resolution_note || 'Awaiting review...'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {(isSuperAdmin || isOfficeAdmin) ? (
                        <button
                          onClick={() => openResolveModal(a)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition shadow-xs"
                        >
                          Review & Resolve
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

      {/* RESOLUTION MODAL */}
      <Modal
        isOpen={Boolean(activeAlert)}
        onClose={() => setActiveAlert(null)}
        title="Duplicate Alert Investigation & Resolution"
        maxWidth="max-w-xl"
      >
        {activeAlert && (
          <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
            {/* Side-by-Side Comparison Card */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="p-3 bg-crimson-50/70 rounded-xl border border-crimson-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-crimson-700 block">
                  Secondary Attempt (Blocked)
                </span>
                <p className="font-bold text-slate-900">{activeAlert.attemptedOffice?.name}</p>
                <p className="text-[11px] text-slate-500">Date: {formatDisplayDate(activeAlert.created_at, isNepali)}</p>
                <p className="font-mono text-crimson-900 font-bold">{activeAlert.engine_number}</p>
              </div>

              <div className="p-3 bg-gov-50/70 rounded-xl border border-gov-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gov-700 block">
                  Original Subsidy Record
                </span>
                <p className="font-bold text-slate-900">{activeAlert.existingOffice?.name}</p>
                <p className="text-[11px] text-slate-500">Year: {activeAlert.existingSubsidy?.subsidy_year_bs} BS</p>
                <p className="font-medium text-slate-800">Beneficiary: {activeAlert.existingFarmer?.name}</p>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Administrative Verdict / Status
              </label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none font-semibold text-slate-800"
              >
                <option value="under_review">Under Review (Forwarded to inspection team)</option>
                <option value="confirmed_fraud">Confirmed Fraud (Duplicate subsidy blacklisting)</option>
                <option value="resolved">Resolved / Dismissed (Clarified / False alarm)</option>
              </select>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Resolution Note
              </label>
              <textarea
                required
                rows={4}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Document your findings, disciplinary actions, dealer notice, or administrative dismissal reason..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveAlert(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gov-700 hover:bg-gov-800 text-white font-bold rounded-xl shadow-md transition"
              >
                {saving ? 'Saving...' : 'Save Verdict'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

