import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  User,
  Database,
  ArrowRight,
  Clock
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAuditLogs } from '../services/api';
import { formatDisplayDate } from '../services/nepaliDate';
import Modal from '../components/common/Modal';

export default function AuditLog() {
  const { t, isNepali } = useLanguage();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs({ search, action: actionFilter });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded-md bg-gov-100 text-gov-800 font-bold text-[10px] uppercase">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded-md bg-crimson-100 text-crimson-800 font-bold text-[10px] uppercase">DELETE</span>;
      case 'DUPLICATE_FLAG':
        return <span className="px-2 py-0.5 rounded-md bg-crimson-600 text-white font-bold text-[10px] uppercase animate-pulse">FRAUD ALERT</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] uppercase">LOGIN</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] uppercase">{action}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-gov-700" />
          <span>{t('navAuditLog')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isNepali
            ? 'प्रणालीमा भएका सम्पूर्ण परिवर्तनहरू, सम्पादन, दोहोरो दर्ता प्रयास र प्रयोगकर्ता गतिविधिहरूको सुरक्षित अभिलेख'
            : 'Tamper-evident system log tracking data creation, soft deletes, fraud alerts, and modifications'}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officer name, table, engine number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="DUPLICATE_FLAG">DUPLICATE ALERT</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold animate-pulse">
            Loading audit trail records...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No audit events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">User / Officer</th>
                  <th className="px-5 py-3.5">Table & Record</th>
                  <th className="px-5 py-3.5">Summary Diff</th>
                  <th className="px-5 py-3.5 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {formatDisplayDate(log.created_at, isNepali)}
                    </td>

                    <td className="px-5 py-3.5">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {log.user_name || 'System / Service'}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.table_name}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-sm text-slate-600 truncate font-mono text-[11px]">
                      {log.new_values ? JSON.stringify(log.new_values) : JSON.stringify(log.old_values || {})}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-gov-100 text-slate-700 hover:text-gov-800 rounded-lg text-xs font-semibold transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSPECT LOG MODAL */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Inspection (JSON Diff)"
        maxWidth="max-w-xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block font-semibold">Action:</span>
                <strong>{selectedLog.action}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Table:</span>
                <span className="font-mono">{selectedLog.table_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Actor:</span>
                <strong>{selectedLog.user_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Timestamp:</span>
                <span>{selectedLog.created_at}</span>
              </div>
            </div>

            {selectedLog.old_values && (
              <div>
                <span className="font-bold text-crimson-800 block mb-1">Old Values (Previous State):</span>
                <pre className="p-3 bg-crimson-50 text-crimson-950 font-mono text-[11px] rounded-xl border border-crimson-200 overflow-x-auto">
                  {JSON.stringify(selectedLog.old_values, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.new_values && (
              <div>
                <span className="font-bold text-gov-800 block mb-1">New Values (Modified / Created State):</span>
                <pre className="p-3 bg-gov-50 text-gov-950 font-mono text-[11px] rounded-xl border border-gov-200 overflow-x-auto">
                  {JSON.stringify(selectedLog.new_values, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

