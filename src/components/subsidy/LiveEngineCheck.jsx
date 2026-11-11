import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertOctagon, Loader2, ShieldAlert, Building2, Calendar, User, Info } from 'lucide-react';
import { normalizeEngineNumber } from '../../utils/engineNormalizer';
import { checkEngineNumber } from '../../services/api';
import { formatNPR } from '../../utils/nepaliValidators';
import { useLanguage } from '../../context/LanguageContext';

export default function LiveEngineCheck({
  engineNumber,
  onCheckResult,
  allowFlagAnyway = false,
  onToggleFlagAnyway
}) {
  const { t, isNepali } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const normalized = normalizeEngineNumber(engineNumber);

  useEffect(() => {
    if (!normalized || normalized.length < 4) {
      setResult(null);
      if (onCheckResult) onCheckResult(null);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await checkEngineNumber(normalized);
        setResult(res);
        if (onCheckResult) onCheckResult(res);
      } catch (err) {
        console.error('Check engine error:', err);
      } finally {
        setLoading(false);
      }
    }, 350); // Debounce 350ms for smooth live typing

    return () => clearTimeout(timeoutId);
  }, [normalized]);

  if (!normalized) {
    return (
      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400" />
        <span>{isNepali ? 'इन्जिन नम्बर टाइप गर्दा राष्ट्रिय डाटाबेसमा स्वतः जाँच हुनेछ।' : 'Engine number will be verified live across national registry as you type.'}</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        <Loader2 className="w-4 h-4 animate-spin text-gov-700" />
        <span>{t('checkingEngine')}</span>
      </div>
    );
  }

  if (!result) return null;

  // Case 1: CLEAR
  if (!result.exists || (result.exists && !result.has_subsidy)) {
    return (
      <div className="mt-2.5 p-3 bg-gov-50 border border-gov-300 rounded-xl flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-gov-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-gov-900 flex items-center gap-1.5">
            <span>{isNepali ? 'इन्जिन नम्बर सुरक्षित (सफा) छ' : 'Engine Number Verified Clean'}</span>
            <span className="font-mono bg-gov-200/60 px-1.5 py-0.2 rounded text-[11px] text-gov-950 font-bold">
              {normalized}
            </span>
          </p>
          <p className="text-gov-700 mt-0.5">
            {isNepali
              ? 'यो इन्जिन नम्बर नेपालको कुनै पनि संघीय, प्रादेशिक वा स्थानीय कार्यालयमा दर्ता भएको छैन।'
              : 'No existing subsidy found across all Nepal offices. Safe to proceed.'}
          </p>
        </div>
      </div>
    );
  }

  // Case 2: DUPLICATE FOUND!
  return (
    <div className="mt-2.5 p-4 bg-crimson-50 border-2 border-crimson-400 rounded-xl shadow-md shadow-crimson-900/5 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-crimson-600 text-white rounded-lg shrink-0">
          <AlertOctagon className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 text-xs text-crimson-950">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="font-bold text-sm text-crimson-900 flex items-center gap-1.5">
              <span>{t('engineDuplicateWarning')}</span>
              <span className="font-mono bg-crimson-200 px-2 py-0.5 rounded text-xs text-crimson-950 font-extrabold tracking-wider">
                {result.engine_number}
              </span>
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-crimson-700 text-white uppercase tracking-wider">
              {isNepali ? 'दोहोरो अभिलेख' : 'DUPLICATE MATCH'}
            </span>
          </div>

          <p className="text-crimson-800 mt-1 font-medium">
            {isNepali
              ? `यो मेसिन (${result.product_name || result.category}) मा पहिल्यै सरकारी अनुदान दिइसकिएको छ:`
              : `This machinery (${result.product_name || result.category}) has already received government subsidy:`}
          </p>

          {/* Existing subsidy metadata box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 p-3 bg-white/90 rounded-lg border border-crimson-200 text-slate-700 font-sans">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-crimson-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t('existingOffice')}
                </span>
                <span className="font-semibold text-slate-800">{result.office_name}</span>
                <span className="text-[11px] text-slate-500 block">
                  ({result.province}, {result.district})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-crimson-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t('inFiscalYear')}
                </span>
                <span className="font-semibold text-slate-800">{result.subsidy_year_bs} BS</span>
                <span className="text-[11px] text-slate-500 block">
                  {formatNPR(result.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 pt-1 border-t border-slate-100">
              <User className="w-4 h-4 text-crimson-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {t('originalFarmer')}
                </span>
                <span className="font-semibold text-slate-800">{result.farmer_name}</span>
                {result.farmer_district && (
                  <span className="text-slate-500 text-[11px] ml-1">({result.farmer_district})</span>
                )}
              </div>
            </div>
          </div>

          {/* Block / Flag Notice */}
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-crimson-700 font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-crimson-600 shrink-0" />
              <span>{t('saveBlockedNotice')}</span>
            </p>

            {onToggleFlagAnyway && (
              <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-crimson-300 text-xs font-semibold text-crimson-900 hover:bg-crimson-100/50 transition">
                <input
                  type="checkbox"
                  checked={allowFlagAnyway}
                  onChange={(e) => onToggleFlagAnyway(e.target.checked)}
                  className="rounded border-crimson-400 text-crimson-600 focus:ring-crimson-500"
                />
                <span>{isNepali ? 'जालसाजी सतर्कता सहित दर्ता गर्ने' : 'Save anyway & trigger fraud alert'}</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
