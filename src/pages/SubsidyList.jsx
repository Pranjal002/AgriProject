import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  Tractor,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getSubsidies, deleteSubsidy, getOffices } from '../services/api';
import { FISCAL_YEARS, formatDisplayDate } from '../services/nepaliDate';
import { NEPAL_PROVINCES, MACHINERY_CATEGORIES } from '../services/mockData';
import { formatNPR } from '../utils/nepaliValidators';
import { exportToCSV, triggerPrintReport } from '../utils/exportUtils';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';

export default function SubsidyList({ onNavigate }) {
  const { currentUser, canEdit, isSuperAdmin } = useAuth();
  const { t, isNepali } = useLanguage();
  const toast = useToast();

  const [subsidies, setSubsidies] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const [officeId, setOfficeId] = useState('');

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getSubsidies(
        { search, year, category, province, office_id: officeId },
        currentUser
      );
      setSubsidies(data);
      const offList = await getOffices();
      setOffices(offList);
    } catch (e) {
      console.error(e);
      toast.error('Error', 'Failed to fetch subsidies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [currentUser, search, year, category, province, officeId]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSubsidy(deleteTarget.id, currentUser);
      toast.success('Record Soft Deleted', 'The subsidy entry has been moved to deleted records.');
      setDeleteTarget(null);
      await fetchList();
    } catch (err) {
      toast.error('Error', err.message);
    }
  };

  const handleExportCSV = () => {
    const rows = subsidies.map(s => ({
      id: s.id,
      engine_number: s.product?.engine_number || '',
      category: s.product?.category || '',
      product_name: s.product?.name || '',
      brand: s.product?.brand || '',
      farmer_name: s.farmer?.name || '',
      citizenship_no: s.farmer?.citizenship_no || '',
      phone: s.farmer?.phone || '',
      farmer_district: s.farmer?.district || '',
      office_name: s.office?.name || '',
      province: s.office?.province || '',
      subsidy_year_bs: s.subsidy_year_bs,
      amount: s.amount,
      percentage: s.percentage,
      created_at: s.created_at
    }));

    exportToCSV('nepal_machinery_subsidies', rows, {
      engine_number: 'Engine Number',
      category: 'Category',
      product_name: 'Product Name',
      brand: 'Brand',
      farmer_name: 'Farmer Name',
      citizenship_no: 'Citizenship No',
      phone: 'Phone',
      farmer_district: 'Farmer District',
      office_name: 'Office Name',
      province: 'Province',
      subsidy_year_bs: 'Fiscal Year (BS)',
      amount: 'Subsidy Amount (NPR)',
      percentage: 'Percentage (%)',
      created_at: 'Registered Date'
    });
  };

  const clearFilters = () => {
    setSearch('');
    setYear('');
    setCategory('');
    setProvince('');
    setOfficeId('');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('navSubsidies')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? 'केन्द्रीय मेसिनरी दोहोरो दर्ता रोकथाम प्रणालीमा दर्ता भएका सम्पूर्ण अनुदानहरू'
              : 'Official national record of agricultural equipment distributed under government subsidy'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-gov-700" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={() => triggerPrintReport()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{t('exportPDF')}</span>
          </button>

          {canEdit && (
            <button
              onClick={() => onNavigate('add_subsidy')}
              className="px-4 py-2 bg-gov-700 hover:bg-gov-800 text-white text-xs font-bold rounded-xl shadow-md shadow-gov-700/20 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navAddSubsidy')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isNepali ? 'इन्जिन नं, कृषक, फोन, ब्रान्ड वा मोडल खोज्नुहोस्...' : 'Search engine number, farmer, brand, phone...'}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          {/* Fiscal Year Filter */}
          <div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            >
              <option value="">{isNepali ? 'सबै आ.व. (वि.सं.)' : 'All Fiscal Years (BS)'}</option>
              {FISCAL_YEARS.map(y => (
                <option key={y} value={y}>{y} BS</option>
              ))}
            </select>
          </div>

          {/* Machinery Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            >
              <option value="">{isNepali ? 'सबै मेसिनरी वर्ग' : 'All Categories'}</option>
              {MACHINERY_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>
                  {isNepali ? c.nameNe : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
            >
              <option value="">{isNepali ? 'सबै प्रदेश' : 'All 7 Provinces'}</option>
              {NEPAL_PROVINCES.map(p => (
                <option key={p} value={p}>{p} Province</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(search || year || category || province || officeId) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              {isNepali ? `${subsidies.length} वटा अभिलेख फेला पर्यो` : `Found ${subsidies.length} matching subsidy records`}
            </span>
            <button
              onClick={clearFilters}
              className="text-gov-700 hover:text-gov-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isNepali ? 'फिल्टर हटाउनुहोस्' : 'Clear Filters'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold animate-pulse">
            Loading subsidy records...
          </div>
        ) : subsidies.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Tractor className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {isNepali ? 'कुनै पनि अनुदान अभिलेख फेला परेन' : 'No subsidy records found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isNepali ? 'खोजी वा फिल्टर परिवर्तन गर्नुहोस्' : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">{t('engineNumber')}</th>
                  <th className="px-5 py-3.5">{t('machineryName')}</th>
                  <th className="px-5 py-3.5">{t('farmerName')}</th>
                  <th className="px-5 py-3.5">{t('grantingOffice')}</th>
                  <th className="px-5 py-3.5">{t('subsidyYearBS')}</th>
                  <th className="px-5 py-3.5">{t('subsidyAmount')}</th>
                  <th className="px-5 py-3.5 text-right">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subsidies.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                    {/* Engine Number */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.product?.engine_number}
                        </span>
                      </div>
                    </td>

                    {/* Machine Details */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{item.product?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.product?.category} • {item.product?.brand}
                      </p>
                    </td>

                    {/* Beneficiary Farmer */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{item.farmer?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.farmer?.phone} • {item.farmer?.district}
                      </p>
                    </td>

                    {/* Office */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 line-clamp-1">{item.office?.name}</p>
                      <p className="text-[10px] text-slate-400">{item.office?.province} Province</p>
                    </td>

                    {/* Fiscal Year */}
                    <td className="px-5 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                      {item.subsidy_year_bs} BS
                    </td>

                    {/* Subsidy Amount */}
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-gov-800">{formatNPR(item.amount)}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{item.percentage}% Grant</p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailItem(item)}
                          title="View Full Certificate"
                          className="p-1.5 text-slate-500 hover:text-gov-700 hover:bg-slate-100 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            title="Soft Delete"
                            className="p-1.5 text-slate-400 hover:text-crimson-600 hover:bg-crimson-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL / OFFICIAL CERTIFICATE VIEW */}
      <Modal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={isNepali ? 'कृषि मेसिनरी अनुदान प्रमाणपत्र' : 'Official Machinery Subsidy Record'}
        maxWidth="max-w-2xl"
      >
        {detailItem && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Header info */}
            <div className="p-4 bg-gov-50 rounded-2xl border border-gov-200 flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-gov-800 uppercase tracking-wider">
                  Government of Nepal Subsidy Registry
                </p>
                <h3 className="text-base font-extrabold text-gov-950 mt-0.5">
                  {detailItem.product?.name}
                </h3>
                <p className="font-mono text-xs font-bold text-gov-900 mt-1">
                  Engine No: {detailItem.product?.engine_number}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-gov-700 text-white rounded-lg font-bold text-xs">
                  {detailItem.subsidy_year_bs} BS
                </span>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {formatNPR(detailItem.amount)} ({detailItem.percentage}%)
                </p>
              </div>
            </div>

            {/* Photos if any */}
            {detailItem.product?.photo_urls?.length > 0 && (
              <div>
                <span className="font-bold text-slate-800 block mb-2">Registered Machinery Photo:</span>
                <div className="grid grid-cols-2 gap-2">
                  {detailItem.product.photo_urls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt="Machinery"
                      className="rounded-xl border border-slate-200 aspect-video object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Farmer & Office Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-xs border-b pb-1">Farmer Information</p>
                <p><span className="text-slate-400">Name:</span> <strong className="text-slate-800">{detailItem.farmer?.name}</strong></p>
                <p><span className="text-slate-400">Father's Name:</span> {detailItem.farmer?.father_name || 'N/A'}</p>
                <p><span className="text-slate-400">Grandfather's Name:</span> {detailItem.farmer?.grandfather_name || 'N/A'}</p>
                <p><span className="text-slate-400">Citizenship No:</span> {detailItem.farmer?.citizenship_no || 'N/A'}</p>
                <p><span className="text-slate-400">Phone:</span> {detailItem.farmer?.phone}</p>
                <p><span className="text-slate-400">Address:</span> {detailItem.farmer?.municipality}, Ward {detailItem.farmer?.ward}, {detailItem.farmer?.district}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-xs border-b pb-1">Office & Grant Details</p>
                <p><span className="text-slate-400">Granting Office:</span> <strong className="text-slate-800">{detailItem.office?.name}</strong></p>
                <p><span className="text-slate-400">Tier:</span> Level {detailItem.office?.government_level} ({detailItem.office?.province})</p>
                <p><span className="text-slate-400">Fiscal Year:</span> {detailItem.subsidy_year_bs} BS ({detailItem.subsidy_year_ad} AD)</p>
                <p><span className="text-slate-400">Subsidized Amount:</span> {formatNPR(detailItem.amount)}</p>
                <p><span className="text-slate-400">Registered On:</span> {formatDisplayDate(detailItem.created_at, isNepali)}</p>
                {detailItem.remarks && (
                  <p><span className="text-slate-400">Remarks:</span> {detailItem.remarks}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Record ID: {detailItem.id}</span>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM SOFT DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={isNepali ? 'अनुदान अभिलेख हटाउने पुष्टि' : 'Soft Delete Subsidy Record'}
        message={
          isNepali
            ? `के तपाईं ${deleteTarget?.product?.name} (इन्जिन: ${deleteTarget?.product?.engine_number}) को अनुदान अभिलेख हटाउन निश्चित हुनुहुन्छ? यो अडिट लगमा सुरक्षित रहनेछ।`
            : `Are you sure you want to soft delete subsidy for ${deleteTarget?.product?.name} (Engine: ${deleteTarget?.product?.engine_number})? This action will be recorded in the audit trail.`
        }
        confirmText={t('delete')}
        cancelText={t('cancel')}
        danger={true}
      />
    </div>
  );
}

