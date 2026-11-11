import React, { useState, useEffect } from 'react';
import {
  User,
  Tractor,
  FileCheck,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { createSubsidy, getFarmers, getOffices } from '../services/api';
import { normalizeEngineNumber, validateEngineNumber } from '../utils/engineNormalizer';
import { validateNepaliPhone, validateCitizenship, formatNPR } from '../utils/nepaliValidators';
import { FISCAL_YEARS, CURRENT_FISCAL_YEAR } from '../services/nepaliDate';
import { NEPAL_PROVINCES, MACHINERY_CATEGORIES } from '../services/mockData';
import LiveEngineCheck from '../components/subsidy/LiveEngineCheck';
import PhotoUpload from '../components/subsidy/PhotoUpload';

export default function AddSubsidy({ onNavigate }) {
  const { currentUser, currentOffice, isSuperAdmin } = useAuth();
  const { t, isNepali } = useLanguage();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Farmer, 2: Product, 3: Subsidy Terms
  const [submitting, setSubmitting] = useState(false);
  const [existingFarmers, setExistingFarmers] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [offices, setOffices] = useState([]);

  // Duplicate Check Live State
  const [engineCheckResult, setEngineCheckResult] = useState(null);
  const [allowFlagAnyway, setAllowFlagAnyway] = useState(false);

  // Form State: Step 1 - Farmer
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    father_name: '',
    grandfather_name: '',
    citizenship_no: '',
    phone: '',
    province: currentOffice?.province || 'Bagmati',
    district: currentOffice?.district || 'Chitwan',
    municipality: currentOffice?.municipality || 'Bharatpur Metropolitan City',
    ward: '01',
    tole: ''
  });

  // Form State: Step 2 - Product
  const [productForm, setProductForm] = useState({
    category: 'Tractor',
    name: 'Mahindra 575 DI Tractor',
    brand: 'Mahindra',
    model_no: '575 DI',
    engine_number: '',
    chassis_no: '',
    photo_urls: []
  });

  // Form State: Step 3 - Subsidy
  const [subsidyForm, setSubsidyForm] = useState({
    subsidy_year_bs: CURRENT_FISCAL_YEAR,
    subsidy_year_ad: new Date().getFullYear(),
    amount: 450000,
    percentage: 50,
    office_id: currentOffice?.id || '',
    remarks: 'Approved under Annual Agricultural Mechanization Subsidy Program.'
  });

  useEffect(() => {
    const init = async () => {
      try {
        const farmers = await getFarmers();
        setExistingFarmers(farmers);
        const offList = await getOffices();
        setOffices(offList);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  // Filter existing farmers
  const filteredFarmers = existingFarmers.filter(f =>
    f.name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
    f.phone?.includes(farmerSearch) ||
    f.citizenship_no?.toLowerCase().includes(farmerSearch.toLowerCase())
  );

  const selectExistingFarmer = (f) => {
    setSelectedFarmerId(f.id);
    setFarmerForm({
      name: f.name,
      father_name: f.father_name || '',
      grandfather_name: f.grandfather_name || '',
      citizenship_no: f.citizenship_no || '',
      phone: f.phone || '',
      province: f.province || 'Bagmati',
      district: f.district || '',
      municipality: f.municipality || '',
      ward: f.ward || '',
      tole: f.tole || ''
    });
  };

  const clearSelectedFarmer = () => {
    setSelectedFarmerId(null);
    setFarmerForm({
      name: '',
      father_name: '',
      grandfather_name: '',
      citizenship_no: '',
      phone: '',
      province: currentOffice?.province || 'Bagmati',
      district: currentOffice?.district || '',
      municipality: currentOffice?.municipality || '',
      ward: '01',
      tole: ''
    });
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!farmerForm.name.trim()) {
      toast.error('Validation Error', 'Farmer name is required.');
      return false;
    }
    const phoneCheck = validateNepaliPhone(farmerForm.phone);
    if (!phoneCheck.isValid) {
      toast.error('Invalid Phone', phoneCheck.message);
      return false;
    }
    return true;
  };

  // Step 2 Validation (Engine check)
  const validateStep2 = () => {
    const engineCheck = validateEngineNumber(productForm.engine_number);
    if (!engineCheck.isValid) {
      toast.error('Invalid Engine Number', engineCheck.message);
      return false;
    }

    if (!productForm.name.trim() || !productForm.brand.trim()) {
      toast.error('Validation Error', 'Machine name and brand are required.');
      return false;
    }

    // Duplicate Check
    if (engineCheckResult?.exists && engineCheckResult?.has_subsidy) {
      if (!allowFlagAnyway) {
        toast.error(
          'Duplicate Engine Detected!',
          `Machine with Engine Number "${engineCheckResult.engine_number}" was already subsidized by office "${engineCheckResult.office_name}". Check "Save anyway & trigger fraud alert" to report.`
        );
        return false;
      }
    }

    return true;
  };

  // Final Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) return;

    if (!subsidyForm.amount || Number(subsidyForm.amount) <= 0) {
      toast.error('Validation Error', 'Please enter a valid subsidy amount in NPR.');
      return;
    }

    setSubmitting(true);
    try {
      await createSubsidy({
        farmerData: {
          id: selectedFarmerId,
          ...farmerForm
        },
        productData: {
          ...productForm
        },
        subsidyData: {
          ...subsidyForm,
          office_id: currentUser?.office_id || subsidyForm.office_id
        },
        currentUser
      });

      toast.success(
        isNepali ? 'अनुदान सफलतापूर्वक दर्ता भयो!' : 'Subsidy Successfully Registered!',
        `Machinery with Engine ${normalizeEngineNumber(productForm.engine_number)} has been locked to ${farmerForm.name}.`
      );

      onNavigate('subsidies');
    } catch (err) {
      console.error(err);
      toast.error('Registration Blocked', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Demo filler for quick testing
  const fillSampleData = (duplicate = false) => {
    if (duplicate) {
      // Intentionally use known duplicate engine M575DI98214X (Mahindra)
      setProductForm({
        category: 'Tractor',
        name: 'Mahindra 575 DI 45HP Tractor',
        brand: 'Mahindra',
        model_no: '575 DI SP PLUS',
        engine_number: 'M575DI98214X',
        chassis_no: 'CH-DEMO-DUP-001',
        photo_urls: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80']
      });
      toast.warning('Duplicate Demo Loaded', 'Loaded duplicate engine M575DI98214X to test live fraud warning banner!');
    } else {
      const randNo = Math.floor(10000 + Math.random() * 90000);
      setProductForm({
        category: 'Power Tiller',
        name: 'VST Shakti 130DI Tiller',
        brand: 'VST Shakti',
        model_no: '130DI',
        engine_number: `VST-NEP-${randNo}`,
        chassis_no: `CH-VST-${randNo}`,
        photo_urls: ['https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80']
      });
      toast.info('Clean Demo Machine Loaded', `Unique engine VST-NEP-${randNo} generated.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('navAddSubsidy')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? '३-चरणमा कृषक, मेसिनरी र अनुदान विवरण प्रविष्ट गर्नुहोस्। इन्जिन नम्बर प्रत्यक्ष प्रमाणित गरिन्छ।'
              : 'Step-by-step registration with real-time duplicate engine prevention across Nepal.'}
          </p>
        </div>

        {/* Quick Demo Pre-fillers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fillSampleData(false)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-gov-600" />
            <span>Fill Clean Demo</span>
          </button>
          <button
            type="button"
            onClick={() => fillSampleData(true)}
            className="px-2.5 py-1.5 bg-crimson-100 hover:bg-crimson-200 text-crimson-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-crimson-600" />
            <span>Test Duplicate Engine</span>
          </button>
        </div>
      </div>

      {/* Step Indicator Wizard Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-3 rounded-xl text-left transition flex items-center gap-3 ${
              step === 1
                ? 'bg-gov-50 border-2 border-gov-600 text-gov-950 font-bold'
                : step > 1
                ? 'bg-slate-50 text-slate-700 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                step === 1 ? 'bg-gov-700 text-white' : step > 1 ? 'bg-gov-200 text-gov-900' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <p className="font-bold">{t('step1Farmer')}</p>
              <p className="text-[10px] text-slate-400">Personal & Lineage</p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setStep(2);
            }}
            className={`p-3 rounded-xl text-left transition flex items-center gap-3 ${
              step === 2
                ? 'bg-gov-50 border-2 border-gov-600 text-gov-950 font-bold'
                : step > 2
                ? 'bg-slate-50 text-slate-700 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                step === 2 ? 'bg-gov-700 text-white' : step > 2 ? 'bg-gov-200 text-gov-900' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <p className="font-bold">{t('step2Product')}</p>
              <p className="text-[10px] text-slate-400">Live Engine Check</p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (validateStep1() && validateStep2()) setStep(3);
            }}
            className={`p-3 rounded-xl text-left transition flex items-center gap-3 ${
              step === 3
                ? 'bg-gov-50 border-2 border-gov-600 text-gov-950 font-bold'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                step === 3 ? 'bg-gov-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <p className="font-bold">{t('step3Subsidy')}</p>
              <p className="text-[10px] text-slate-400">Amount & Office Review</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* ================= STEP 1: FARMER ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-gov-700" />
                <span>{t('step1Farmer')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNepali
                  ? 'दर्ता भएको कृषक छनोट गर्नुहोस् वा नयाँ कृषकको विवरण प्रविष्ट गर्नुहोस्।'
                  : 'Search from previously subsidized farmers or register a new beneficiary farmer.'}
              </p>
            </div>

            {/* Quick Search for Existing Farmer */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-gov-700" />
                  <span>{t('searchExistingFarmer')}</span>
                </span>
                {selectedFarmerId && (
                  <button
                    type="button"
                    onClick={clearSelectedFarmer}
                    className="text-xs text-crimson-600 hover:underline font-semibold"
                  >
                    Clear selection / Add New
                  </button>
                )}
              </div>

              <input
                type="text"
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
                placeholder="Search by name, citizenship number, or 10-digit phone..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none bg-white"
              />

              {farmerSearch && filteredFarmers.length > 0 && (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 shadow-sm">
                  {filteredFarmers.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        selectExistingFarmer(f);
                        setFarmerSearch('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-gov-50 text-xs flex items-center justify-between transition"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{f.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Phone: {f.phone} | Citizenship: {f.citizenship_no || 'N/A'}
                        </p>
                      </div>
                      <span className="text-[11px] text-gov-700 font-semibold px-2 py-0.5 bg-gov-100 rounded">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {selectedFarmerId && (
                <div className="p-2.5 bg-gov-100/70 border border-gov-300 rounded-xl text-xs text-gov-950 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gov-700 shrink-0" />
                  <span>Linked to registered farmer record: <strong>{farmerForm.name}</strong></span>
                </div>
              )}
            </div>

            {/* Farmer Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  {t('farmerName')} <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={farmerForm.name}
                  onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                  placeholder="e.g. Ram Bahadur Thapa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* 10-digit Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('phone')} (10-digits) <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={farmerForm.phone}
                  onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                  placeholder="e.g. 9845012345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Father's Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('fatherName')}
                </label>
                <input
                  type="text"
                  value={farmerForm.father_name}
                  onChange={(e) => setFarmerForm({ ...farmerForm, father_name: e.target.value })}
                  placeholder="e.g. Tek Bahadur Thapa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Grandfather's Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('grandfatherName')}
                </label>
                <input
                  type="text"
                  value={farmerForm.grandfather_name}
                  onChange={(e) => setFarmerForm({ ...farmerForm, grandfather_name: e.target.value })}
                  placeholder="e.g. Dil Bahadur Thapa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Citizenship Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('citizenshipNo')}
                </label>
                <input
                  type="text"
                  value={farmerForm.citizenship_no}
                  onChange={(e) => setFarmerForm({ ...farmerForm, citizenship_no: e.target.value })}
                  placeholder="e.g. 31-01-72-04981"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('province')}</label>
                <select
                  value={farmerForm.province}
                  onChange={(e) => setFarmerForm({ ...farmerForm, province: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                >
                  {NEPAL_PROVINCES.map(p => (
                    <option key={p} value={p}>{p} Province</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('district')}</label>
                <input
                  type="text"
                  required
                  value={farmerForm.district}
                  onChange={(e) => setFarmerForm({ ...farmerForm, district: e.target.value })}
                  placeholder="e.g. Chitwan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Municipality */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('municipality')}</label>
                <input
                  type="text"
                  required
                  value={farmerForm.municipality}
                  onChange={(e) => setFarmerForm({ ...farmerForm, municipality: e.target.value })}
                  placeholder="e.g. Bharatpur Metropolitan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Ward */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('ward')}</label>
                <input
                  type="text"
                  value={farmerForm.ward}
                  onChange={(e) => setFarmerForm({ ...farmerForm, ward: e.target.value })}
                  placeholder="e.g. 04"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Tole */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">{t('tole')}</label>
                <input
                  type="text"
                  value={farmerForm.tole}
                  onChange={(e) => setFarmerForm({ ...farmerForm, tole: e.target.value })}
                  placeholder="e.g. Kailashnagar Tole"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="px-5 py-2.5 bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PRODUCT & LIVE ENGINE CHECK ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Tractor className="w-5 h-5 text-gov-700" />
                <span>{t('step2Product')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNepali
                  ? 'इन्जिन नम्बर प्रविष्ट गर्दा राष्ट्रिय डाटाबेसमा दोहोरो अनुदान रोकथाम जाँच तत्काल गरिन्छ।'
                  : 'Enter machinery details and normalized engine number. Real-time verification protects against duplicate grants.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('machineryCategory')} <span className="text-crimson-600">*</span>
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                >
                  {MACHINERY_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {isNepali ? c.nameNe : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Machinery Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('machineryName')} <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Mahindra 575 DI 45HP Tractor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('brand')} <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="e.g. Mahindra, Kubota, Shaktiman"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Model Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('modelNo')}</label>
                <input
                  type="text"
                  value={productForm.model_no}
                  onChange={(e) => setProductForm({ ...productForm, model_no: e.target.value })}
                  placeholder="e.g. 575 DI SP PLUS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* CRITICAL: ENGINE NUMBER INPUT WITH LIVE CHECK */}
              <div className="sm:col-span-2 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                <label className="block font-extrabold text-sm text-slate-900 mb-1">
                  {t('engineNumber')} <span className="text-crimson-600">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  {isNepali
                    ? 'इन्जिन नम्बर स्वतः ठूला अक्षर (Uppercase) मा परिवर्तन हुन्छ र खाली ठाउँ वा ड्यासहरू स्वतः हट्छन्।'
                    : 'Engine numbers are automatically normalized to uppercase alphanumeric (spaces and hyphens stripped).'}
                </p>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={productForm.engine_number}
                    onChange={(e) => setProductForm({ ...productForm, engine_number: e.target.value })}
                    placeholder="e.g. M575DI98214X or AB-1234"
                    className="w-full px-4 py-3 text-sm font-mono font-bold uppercase tracking-wider border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none bg-white shadow-xs"
                  />
                </div>

                {/* Live Real-time Engine Verification Indicator */}
                <LiveEngineCheck
                  engineNumber={productForm.engine_number}
                  onCheckResult={(res) => setEngineCheckResult(res)}
                  allowFlagAnyway={allowFlagAnyway}
                  onToggleFlagAnyway={(val) => setAllowFlagAnyway(val)}
                />
              </div>

              {/* Chassis Number (Optional) */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">{t('chassisNo')}</label>
                <input
                  type="text"
                  value={productForm.chassis_no}
                  onChange={(e) => setProductForm({ ...productForm, chassis_no: e.target.value })}
                  placeholder="e.g. CH-MAH-992182"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Photo Upload with Client-Side Compression & Preview */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1.5">{t('photoUpload')}</label>
                <PhotoUpload
                  photos={productForm.photo_urls}
                  onChange={(urls) => setProductForm({ ...productForm, photo_urls: urls })}
                />
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('previous')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-5 py-2.5 bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
              >
                <span>{t('next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUBSIDY TERMS & FINAL REVIEW ================= */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-gov-700" />
                <span>{t('step3Subsidy')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isNepali
                  ? 'अनुदान सम्झौताका सर्तहरू, आ.व. र रकम प्रविष्ट गरी अन्तिम प्रमाणीकरण गर्नुहोस्।'
                  : 'Specify subsidy funding terms, Bikram Sambat year, amount, and confirm submission.'}
              </p>
            </div>

            {/* Summary Confirmation Banner */}
            <div className="p-4 bg-gov-50 rounded-2xl border border-gov-200 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-gov-200 pb-2">
                <span className="font-bold text-gov-900">Beneficiary:</span>
                <span className="font-semibold text-slate-800">{farmerForm.name} ({farmerForm.phone})</span>
              </div>
              <div className="flex items-center justify-between border-b border-gov-200 pb-2">
                <span className="font-bold text-gov-900">Machinery:</span>
                <span className="font-semibold text-slate-800">{productForm.name} ({productForm.category})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gov-900">Normalized Engine No:</span>
                <span className="font-mono font-extrabold text-gov-950 bg-gov-200 px-2 py-0.5 rounded">
                  {normalizeEngineNumber(productForm.engine_number)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Fiscal Year BS */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('subsidyYearBS')} <span className="text-crimson-600">*</span>
                </label>
                <select
                  value={subsidyForm.subsidy_year_bs}
                  onChange={(e) => setSubsidyForm({ ...subsidyForm, subsidy_year_bs: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                >
                  {FISCAL_YEARS.map(y => (
                    <option key={y} value={y}>{y} BS</option>
                  ))}
                </select>
              </div>

              {/* Subsidy Amount */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('subsidyAmount')} <span className="text-crimson-600">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={subsidyForm.amount}
                  onChange={(e) => setSubsidyForm({ ...subsidyForm, amount: e.target.value })}
                  placeholder="e.g. 450000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none font-semibold text-slate-900"
                />
                <p className="text-[10px] text-gov-700 font-bold mt-1">
                  {formatNPR(subsidyForm.amount)}
                </p>
              </div>

              {/* Percentage */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('subsidyPercentage')} (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={subsidyForm.percentage}
                  onChange={(e) => setSubsidyForm({ ...subsidyForm, percentage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Granting Office */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">{t('grantingOffice')}</label>
                {isSuperAdmin ? (
                  <select
                    value={subsidyForm.office_id}
                    onChange={(e) => setSubsidyForm({ ...subsidyForm, office_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                  >
                    {offices.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} (L{o.government_level})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={currentOffice?.name || ''}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                  />
                )}
              </div>

              {/* AD Year (Optional) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">AD Year</label>
                <input
                  type="number"
                  value={subsidyForm.subsidy_year_ad}
                  onChange={(e) => setSubsidyForm({ ...subsidyForm, subsidy_year_ad: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>

              {/* Remarks */}
              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">{t('remarks')}</label>
                <textarea
                  rows={2}
                  value={subsidyForm.remarks}
                  onChange={(e) => setSubsidyForm({ ...subsidyForm, remarks: e.target.value })}
                  placeholder="Program name, matching grant details, or special conditions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('previous')}</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-gov-700/30 flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? 'Registering...' : t('save')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
