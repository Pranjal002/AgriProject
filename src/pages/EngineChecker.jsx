import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Building2,
  Calendar,
  User,
  MapPin,
  Tractor,
  Loader2,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { checkEngineNumber } from '../services/api';
import { normalizeEngineNumber } from '../utils/engineNormalizer';
import { formatNPR } from '../utils/nepaliValidators';
import { formatDisplayDate } from '../services/nepaliDate';

export default function EngineChecker() {
  const { t, isNepali } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const normalized = normalizeEngineNumber(query);
    if (!normalized) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await checkEngineNumber(normalized);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEngine = (engineNo) => {
    setQuery(engineNo);
    setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      const res = await checkEngineNumber(engineNo);
      setResult(res);
      setLoading(false);
    }, 50);
  };

  const clearSearch = () => {
    setQuery('');
    setResult(null);
    setHasSearched(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex p-3 bg-gov-100 text-gov-800 rounded-2xl mb-1 shadow-xs">
          <Search className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('engineCheckerTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          {t('engineCheckerSubtitle')}
        </p>
      </div>

      {/* Big Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('enterEnginePlaceholder')}
              className="w-full pl-5 pr-32 py-4 text-base sm:text-lg font-mono font-bold tracking-wider border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-gov-500/20 focus:border-gov-600 focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 bg-gov-700 hover:bg-gov-800 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{t('verifyNow')}</span>
            </button>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Test Engines:</span>
            </span>
            <button
              type="button"
              onClick={() => handleTestEngine('M575DI98214X')}
              className="px-2.5 py-1 bg-crimson-50 hover:bg-crimson-100 text-crimson-700 font-mono font-bold rounded-lg border border-crimson-200 transition"
            >
              M575DI98214X (Duplicate)
            </button>
            <button
              type="button"
              onClick={() => handleTestEngine('SK12HP44901B')}
              className="px-2.5 py-1 bg-crimson-50 hover:bg-crimson-100 text-crimson-700 font-mono font-bold rounded-lg border border-crimson-200 transition"
            >
              SK12HP44901B (Duplicate)
            </button>
            <button
              type="button"
              onClick={() => handleTestEngine('KB4501A77219')}
              className="px-2.5 py-1 bg-crimson-50 hover:bg-crimson-100 text-crimson-700 font-mono font-bold rounded-lg border border-crimson-200 transition"
            >
              KB4501A77219 (Duplicate)
            </button>
            <button
              type="button"
              onClick={() => handleTestEngine('SONALIKA-NEW-7788')}
              className="px-2.5 py-1 bg-gov-50 hover:bg-gov-100 text-gov-800 font-mono font-bold rounded-lg border border-gov-200 transition"
            >
              SONALIKA-7788 (Clean)
            </button>
          </div>
        </form>
      </div>

      {/* Result Display Box */}
      {hasSearched && result && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {/* CASE 1: CLEAR / CLEAN */}
          {(!result.exists || (result.exists && !result.has_subsidy)) ? (
            <div className="bg-white rounded-3xl border-2 border-gov-400 p-6 sm:p-8 shadow-xl shadow-gov-950/5 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gov-100 text-gov-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gov-100 text-gov-800 uppercase tracking-wider mb-2">
                  {t('clearToGrant')}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {isNepali ? 'इन्जिन नम्बर पूर्ण रूपमा स्वीकृत छ' : 'Engine Clearance Granted'}
                </h3>
                <p className="font-mono text-sm font-bold text-gov-800 mt-1">
                  Engine: {result.engine_number}
                </p>
              </div>

              <div className="p-4 bg-gov-50/70 rounded-2xl border border-gov-200 text-xs text-gov-900 max-w-lg mx-auto">
                <p className="font-medium leading-relaxed">
                  {isNepali
                    ? 'यो इन्जिन नम्बर नेपालको संघीय मन्त्रालय, ७ वटै प्रदेश तथा ७५३ वटै स्थानीय तहका कुनै पनि अनुदान अभिलेखमा दर्ता भएको छैन। यो मेसिन अनुदान दिन योग्य छ।'
                    : 'No existing subsidy found in any central, provincial, or municipal database across Nepal. This equipment is eligible for grant disbursement.'}
                </p>
              </div>

              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Search Another Machine
              </button>
            </div>
          ) : (
            /* CASE 2: DUPLICATE / FRAUD MATCH */
            <div className="bg-white rounded-3xl border-2 border-crimson-500 overflow-hidden shadow-2xl shadow-crimson-950/10">
              <div className="bg-crimson-600 p-6 text-white text-center">
                <div className="w-14 h-14 rounded-full bg-crimson-700 text-white flex items-center justify-center mx-auto mb-2 animate-pulse shadow-md">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-extrabold bg-white text-crimson-800 uppercase tracking-wider mb-1">
                  {t('duplicateFound')}
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isNepali ? 'गम्भीर चेतावनी: दोहोरो अनुदान दर्ता फेला पर्यो!' : 'ALERT: Duplicate Subsidy Record Found!'}
                </h3>
                <p className="text-xs text-crimson-100 mt-1 max-w-md mx-auto">
                  {isNepali
                    ? 'यो मेसिनमा पहिल्यै सरकारी अनुदान दिइसकिएको छ। अर्को कार्यालय वा व्यक्तिको नाममा पुनः अनुदान लिन निषेध गरिएको छ।'
                    : 'This machinery has already received government subsidy. Secondary disbursement is strictly prohibited.'}
                </p>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Engine Card */}
                <div className="p-4 bg-crimson-50 rounded-2xl border border-crimson-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Verified Engine</span>
                    <p className="font-mono text-base font-extrabold text-crimson-950">
                      {result.engine_number}
                    </p>
                    <p className="text-slate-600 font-semibold">{result.product_name} ({result.category})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Fiscal Year</span>
                    <p className="font-bold text-slate-800 text-sm">{result.subsidy_year_bs} BS</p>
                    <p className="text-gov-800 font-bold">{formatNPR(result.amount)}</p>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-gov-700" />
                      <span>{t('existingOffice')}</span>
                    </p>
                    <p className="font-semibold text-slate-800">{result.office_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Level {result.government_level} ({result.province} Province, {result.district})
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-slate-900 border-b pb-1 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-gov-700" />
                      <span>{t('originalFarmer')}</span>
                    </p>
                    <p className="font-semibold text-slate-800">{result.farmer_name}</p>
                    <p className="text-[11px] text-slate-500">
                      District: {result.farmer_district || result.district}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Clear & Verify Another Engine
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

