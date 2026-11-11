import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Tractor,
  Eye,
  MapPin,
  Phone,
  FileText,
  Calendar,
  Building2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getFarmers, getFarmerDetail } from '../services/api';
import { formatNPR } from '../utils/nepaliValidators';
import { formatDisplayDate } from '../services/nepaliDate';
import Modal from '../components/common/Modal';

export default function Farmers() {
  const { t, isNepali } = useLanguage();
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const data = await getFarmers(search);
      setFarmers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [search]);

  const handleViewDetail = async (farmerId) => {
    setLoadingDetail(true);
    try {
      const detail = await getFarmerDetail(farmerId);
      setSelectedFarmer(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('navFarmers')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? 'अनुदान प्राप्त गर्ने कृषकहरूको केन्द्रीय अभिलेख तथा प्राप्त औजारहरूको इतिहास'
              : 'Registered beneficiary farmers with their family lineage and complete subsidy history'}
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isNepali ? 'कृषकको नाम, नागरिकता नं, वा फोन खोज्नुहोस्...' : 'Search farmer name, citizenship, or phone...'}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold animate-pulse">
            Loading farmer directory...
          </div>
        ) : farmers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No farmers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">{t('farmerName')}</th>
                  <th className="px-5 py-3.5">Lineage (Father / Grandfather)</th>
                  <th className="px-5 py-3.5">{t('citizenshipNo')}</th>
                  <th className="px-5 py-3.5">{t('phone')}</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Machines Subsidized</th>
                  <th className="px-5 py-3.5 text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {f.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p className="font-medium text-slate-800">{f.father_name || 'N/A'}</p>
                      <p className="text-[10px] text-slate-400">{f.grandfather_name || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {f.citizenship_no || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-mono">
                      {f.phone}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <p>{f.municipality}, Ward {f.ward}</p>
                      <p className="text-[10px] text-slate-400">{f.district}, {f.province}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gov-100 text-gov-800">
                        <Tractor className="w-3.5 h-3.5" />
                        <span>{f.subsidiesCount} {f.subsidiesCount === 1 ? 'unit' : 'units'}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleViewDetail(f.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-gov-100 text-slate-700 hover:text-gov-800 rounded-lg font-semibold text-xs transition"
                      >
                        {t('viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FARMER DETAIL & SUBSIDY HISTORY MODAL */}
      <Modal
        isOpen={Boolean(selectedFarmer)}
        onClose={() => setSelectedFarmer(null)}
        title={isNepali ? 'कृषक प्रोफाइल तथा अनुदान इतिहास' : 'Beneficiary Farmer Subsidy History'}
        maxWidth="max-w-2xl"
      >
        {selectedFarmer && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Profile Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Farmer Name</span>
                <p className="font-bold text-sm text-slate-900">{selectedFarmer.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Father's Name</span>
                <p className="font-semibold text-slate-800">{selectedFarmer.father_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Grandfather</span>
                <p className="font-semibold text-slate-800">{selectedFarmer.grandfather_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Citizenship No</span>
                <p className="font-mono font-semibold text-slate-800">{selectedFarmer.citizenship_no || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
                <p className="font-mono font-semibold text-slate-800">{selectedFarmer.phone}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Address</span>
                <p className="font-semibold text-slate-800">{selectedFarmer.municipality}-{selectedFarmer.ward}, {selectedFarmer.district}</p>
              </div>
            </div>

            {/* Subsidies List */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <Tractor className="w-4 h-4 text-gov-700" />
                <span>All Machinery Subsidies Received ({selectedFarmer.subsidies?.length || 0})</span>
              </h4>

              {selectedFarmer.subsidies?.length === 0 ? (
                <p className="text-slate-400 italic">No subsidies recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedFarmer.subsidies.map(s => (
                    <div
                      key={s.id}
                      className="p-3.5 bg-gov-50/50 rounded-xl border border-gov-200 flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {s.product?.name} ({s.product?.category})
                        </p>
                        <p className="font-mono text-[11px] font-bold text-gov-900 mt-0.5">
                          Engine No: {s.product?.engine_number}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Granting Office: <span className="font-semibold text-slate-700">{s.office?.name}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded bg-gov-700 text-white font-bold text-[11px]">
                          {s.subsidy_year_bs} BS
                        </span>
                        <p className="font-extrabold text-gov-950 text-xs mt-1">
                          {formatNPR(s.amount)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {s.percentage}% Subsidy
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
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
