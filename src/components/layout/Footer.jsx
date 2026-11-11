import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { isNepali } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-700">
            {isNepali
              ? 'नेपाल कृषि औजार तथा मेसिनरी अनुदान दर्ता प्रणाली (केन्द्रीय दोहोरो अनुदान नियन्त्रण)'
              : 'Nepal Agriculture Machinery Subsidy Registry (Central Anti-Fraud Registry)'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isNepali
              ? 'कृषि तथा पशुपन्छी विकास मन्त्रालय, सिंहदरबार, काठमाडौं, नेपाल'
              : 'Ministry of Agriculture and Livestock Development, Singha Durbar, Kathmandu, Nepal'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span>{isNepali ? 'टोल-फ्री हेल्पलाइन: १६६०-०१-००००' : 'Toll-Free Helpline: 1660-01-0000'}</span>
          <span>•</span>
          <span>Version 1.0.0 (Production Ready)</span>
        </div>
      </div>
    </footer>
  );
}
