import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // App Branding
    appName: 'Nepal Agriculture Machinery Subsidy Registry',
    appNameShort: 'NAMSR',
    govHeader: 'Government of Nepal • Ministry of Agriculture and Livestock Development',
    centralPortal: 'Central Machinery Registry & Fraud Prevention System',
    
    // Navigation
    navDashboard: 'Dashboard',
    navSubsidies: 'Subsidy Registry',
    navAddSubsidy: 'Register Subsidy',
    navEngineChecker: 'Universal Engine Check',
    navFarmers: 'Farmers Directory',
    navProducts: 'Machinery Catalog',
    navDuplicateAlerts: 'Duplicate Alerts',
    navOfficesUsers: 'Offices & Users',
    navAuditLog: 'Audit Trail',
    navProfile: 'My Profile',
    navLogout: 'Sign Out',

    // Dashboard Cards & Stats
    totalSubsidized: 'Total Subsidized Machines',
    totalFarmers: 'Farmers Benefited',
    totalOffices: 'Registered Offices',
    openAlerts: 'Active Duplicate Alerts',
    totalDisbursed: 'Total Subsidy Disbursed',
    duplicatePreventionNotice: 'Central Engine Registry prevents any machine from receiving multiple subsidies.',
    
    // Charts
    chartSubsidiesByYear: 'Subsidies by Fiscal Year (BS)',
    chartSubsidiesByProvince: 'Subsidies Distribution by Province',
    chartSubsidiesByCategory: 'Machinery by Category',
    chartSubsidiesByGovLevel: 'Grants by Administrative Tier',
    levelFederal: 'Federal (Level 1)',
    levelProvincial: 'Provincial (Level 2)',
    levelLocal: 'Local / Municipality (Level 3)',

    // Duplicate Alert Section
    duplicateEntriesTitle: 'Duplicate / Fraud Alert Watchlist',
    duplicateEntriesSubtitle: 'Attempts detected where engine numbers were already registered in another office or year.',
    engineNumber: 'Engine Number',
    attemptedOffice: 'Attempted By Office',
    existingOffice: 'Original Registered Office',
    originalFarmer: 'Original Beneficiary',
    alertStatus: 'Alert Status',
    action: 'Action',
    viewDetails: 'View Details',
    resolveAlert: 'Review & Resolve',
    noOpenAlerts: 'No open duplicate fraud alerts detected. System is clean.',

    // Common Actions & Statuses
    search: 'Search...',
    filter: 'Filter',
    exportExcel: 'Export Excel (CSV)',
    exportPDF: 'Print / PDF Report',
    add: 'Add New',
    save: 'Save Record',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Proceed to Next Step',
    previous: 'Previous Step',
    status: 'Status',
    statusOpen: 'Open (Action Required)',
    statusUnderReview: 'Under Review',
    statusResolved: 'Resolved / Dismissed',
    statusConfirmedFraud: 'Confirmed Duplicate Fraud',
    
    // Form & Wizard
    step1Farmer: 'Step 1: Farmer Information',
    step2Product: 'Step 2: Machinery & Engine Check',
    step3Subsidy: 'Step 3: Subsidy Terms & Review',
    
    // Live Engine Check
    liveCheckTitle: 'Real-Time Engine Duplicate Verification',
    checkingEngine: 'Verifying across national registry...',
    engineClear: 'CLEAN: Engine number is not registered anywhere in Nepal. Ready for subsidy.',
    engineDuplicateWarning: 'DUPLICATE ALERT: This machine has ALREADY been subsidized!',
    engineAlreadySubsidizedBy: 'Already subsidized by',
    inFiscalYear: 'in Fiscal Year',
    toFarmer: 'to farmer',
    saveBlockedNotice: 'Submission is blocked or flagged automatically to prevent duplicate disbursement fraud.',
    
    // Farmer Fields
    farmerName: 'Farmer Full Name',
    fatherName: "Father's Name",
    grandfatherName: "Grandfather's Name",
    citizenshipNo: 'Citizenship Number',
    phone: 'Phone Number',
    province: 'Province',
    district: 'District',
    municipality: 'Municipality / Rural Municipality',
    ward: 'Ward No.',
    tole: 'Tole / Village',
    searchExistingFarmer: 'Search Existing Farmer',
    orCreateNew: 'Or Register New Farmer',

    // Product Fields
    machineryCategory: 'Machinery Category',
    machineryName: 'Machine Model / Name',
    brand: 'Manufacturer / Brand',
    modelNo: 'Model Number',
    chassisNo: 'Chassis Number (Optional)',
    photoUpload: 'Machinery Photos',
    dragDropPhoto: 'Click or drag machinery photos here (Auto-compressed)',

    // Subsidy Fields
    subsidyYearBS: 'Fiscal Year (Bikram Sambat)',
    subsidyAmount: 'Subsidy Amount (NPR)',
    subsidyPercentage: 'Subsidy Percentage (%)',
    grantingOffice: 'Granting Office',
    remarks: 'Remarks & Funding Program',

    // Roles
    roleSuperAdmin: 'Super Admin (Federal MoALD)',
    roleOfficeAdmin: 'Office Administrator',
    roleDataEntry: 'Data Entry Officer',
    roleViewer: 'Auditor / Viewer',

    // Engine Checker Page
    engineCheckerTitle: 'National Machinery Engine Number Verification',
    engineCheckerSubtitle: 'Instant search across Federal, 7 Provincial, and 753 Local Government registries',
    enterEnginePlaceholder: 'Enter engine number (e.g. M575DI98214X or AB-1234)...',
    verifyNow: 'Verify Engine Number',
    clearToGrant: 'Clearance Granted',
    duplicateFound: 'Duplicate Record Found',

    // Demo Bar
    demoModeActive: 'Demo Mode: Running locally with instant sample data. Configure Supabase in .env anytime.',
    switchUser: 'Switch User Role:',
    resetDemoData: 'Reset Demo Data',
  },

  ne: {
    // App Branding
    appName: 'नेपाल कृषि औजार तथा मेसिनरी अनुदान दर्ता प्रणाली',
    appNameShort: 'कृषि अनुदान',
    govHeader: 'नेपाल सरकार • कृषि तथा पशुपन्छी विकास मन्त्रालय',
    centralPortal: 'केन्द्रीय मेसिनरी दर्ता तथा दोहोरो अनुदान रोकथाम प्रणाली',

    // Navigation
    navDashboard: 'ड्यासबोर्ड',
    navSubsidies: 'अनुदान अभिलेख',
    navAddSubsidy: 'नयाँ अनुदान दर्ता',
    navEngineChecker: 'इन्जिन नम्बर जाँच',
    navFarmers: 'कृषक विवरण',
    navProducts: 'मेसिनरी क्याटलग',
    navDuplicateAlerts: 'दोहोरो दर्ता सतर्कता',
    navOfficesUsers: 'कार्यालय र प्रयोगकर्ता',
    navAuditLog: 'सम्पादित अभिलेख (अडिट)',
    navProfile: 'मेरो प्रोफाइल',
    navLogout: 'लग-आउट',

    // Dashboard Cards & Stats
    totalSubsidized: 'कुल अनुदानित मेसिनरी',
    totalFarmers: 'लाभान्वित कृषक संख्या',
    totalOffices: 'दर्ता भएका कार्यालयहरू',
    openAlerts: 'सक्रिय दोहोरो सतर्कता',
    totalDisbursed: 'कुल वितरण गरिएको अनुदान रकम',
    duplicatePreventionNotice: 'केन्द्रीय इन्जिन अभिलेखले एउटै मेसिनमा दोहोरो अनुदान लिनबाट पूर्णतः रोक्दछ।',

    // Charts
    chartSubsidiesByYear: 'आर्थिक वर्ष अनुसार अनुदान वितरण (वि.सं.)',
    chartSubsidiesByProvince: 'प्रदेशगत अनुदान वितरण',
    chartSubsidiesByCategory: 'औजारको किसिम अनुसार',
    chartSubsidiesByGovLevel: 'तहगत अनुदान वितरण',
    levelFederal: 'संघीय (तह १)',
    levelProvincial: 'प्रादेशिक (तह २)',
    levelLocal: 'स्थानीय तह (तह ३)',

    // Duplicate Alert Section
    duplicateEntriesTitle: 'दोहोरो / नक्कल अनुदान सतर्कता सूची',
    duplicateEntriesSubtitle: 'अन्य कार्यालय वा वर्षमा पहिल्यै दर्ता भइसकेको इन्जिन नम्बर पुनः दर्ता गर्न खोज्दा पत्ता लागेका केसहरू।',
    engineNumber: 'इन्जिन नम्बर',
    attemptedOffice: 'प्रयास गरिएको कार्यालय',
    existingOffice: 'पहिले दर्ता भएको कार्यालय',
    originalFarmer: 'पहिलेको लाभग्राही कृषक',
    alertStatus: 'सतर्कता स्थिति',
    action: 'कार्य',
    viewDetails: 'विवरण हेर्नुहोस्',
    resolveAlert: 'समीक्षा तथा समाधान',
    noOpenAlerts: 'कुनै पनि दोहोरो दर्ता सतर्कता छैन। प्रणाली सुरक्षित छ।',

    // Common Actions & Statuses
    search: 'खोजी गर्नुहोस्...',
    filter: 'फिल्टर',
    exportExcel: 'एक्सेल (CSV) डाउनलोड',
    exportPDF: 'प्रिन्ट / PDF प्रतिवेदन',
    add: 'नयाँ थप्नुहोस्',
    save: 'सुरक्षित गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    delete: 'हटाउनुहोस्',
    edit: 'सम्पादन',
    back: 'पछाडि',
    next: 'अर्को चरण',
    previous: 'अघिल्लो चरण',
    status: 'स्थिति',
    statusOpen: 'कारबाही बाँकी (खुला)',
    statusUnderReview: 'अनुसन्धान / समीक्षामा',
    statusResolved: 'समाधान भएको / खारेज',
    statusConfirmedFraud: 'पुष्टि भएको दोहोरो जालसाजी',

    // Form & Wizard
    step1Farmer: 'चरण १: कृषकको व्यक्तिगत विवरण',
    step2Product: 'चरण २: मेसिनरी तथा इन्जिन जाँच',
    step3Subsidy: 'चरण ३: अनुदान सम्झौता तथा समीक्षा',

    // Live Engine Check
    liveCheckTitle: 'प्रत्यक्ष इन्जिन दोहोरो दर्ता जाँच',
    checkingEngine: 'राष्ट्रिय प्रणालीमा प्रमाणीकरण हुँदैछ...',
    engineClear: 'स्वीकृत: यो इन्जिन नम्बर नेपालको कुनै पनि कार्यालयमा दर्ता भएको छैन।',
    engineDuplicateWarning: 'गम्भीर चेतावनी: यो मेसिनमा पहिल्यै अनुदान दिइसकिएको छ!',
    engineAlreadySubsidizedBy: 'पहिले अनुदान दिने कार्यालय:',
    inFiscalYear: 'आर्थिक वर्ष:',
    toFarmer: 'लाभग्राही कृषक:',
    saveBlockedNotice: 'दोहोरो अनुदान रोक्नको लागि यो दर्ता कार्य रोकिएको छ र सतर्कता सूचीमा पठाइएको छ।',

    // Farmer Fields
    farmerName: 'कृषकको पूरा नाम',
    fatherName: 'बुबाको नाम',
    grandfatherName: 'हजुरबुबाको नाम',
    citizenshipNo: 'नागरिकता नम्बर',
    phone: 'मोबाइल / फोन नम्बर',
    province: 'प्रदेश',
    district: 'जिल्ला',
    municipality: 'नगरपालिका / गाउँपालिका',
    ward: 'वडा नं.',
    tole: 'टोल / बस्ती',
    searchExistingFarmer: 'दर्ता भइसकेको कृषक खोज्नुहोस्',
    orCreateNew: 'वा नयाँ कृषक दर्ता गर्नुहोस्',

    // Product Fields
    machineryCategory: 'मेसिनरीको वर्ग',
    machineryName: 'मेसिनको नाम / मोडल',
    brand: 'कम्पनी / ब्रान्ड',
    modelNo: 'मोडल नम्बर',
    chassisNo: 'च्यासिस नम्बर (ऐच्छिक)',
    photoUpload: 'मेसिनरीको फोटो',
    dragDropPhoto: 'फोटो यहाँ छनोट वा तानेर ल्याउनुहोस् (स्वतः साइज घट्नेछ)',

    // Subsidy Fields
    subsidyYearBS: 'आर्थिक वर्ष (वि.सं.)',
    subsidyAmount: 'अनुदान रकम (रु.)',
    subsidyPercentage: 'अनुदान प्रतिशत (%)',
    grantingOffice: 'अनुदान दिने कार्यालय',
    remarks: 'कार्यक्रमको विवरण / कैफियत',

    // Roles
    roleSuperAdmin: 'सुपर एडमिन (सिंहदरबार, संघीय मन्त्रालय)',
    roleOfficeAdmin: 'कार्यालय प्रमुख / प्रशासक',
    roleDataEntry: 'डाटा एन्ट्री अधिकृत',
    roleViewer: 'लेखापरीक्षक / अवलोकनकर्ता',

    // Engine Checker Page
    engineCheckerTitle: 'राष्ट्रिय मेसिनरी इन्जिन नम्बर प्रमाणीकरण पोर्टल',
    engineCheckerSubtitle: 'संघ, ७ प्रदेश र ७५३ वटै स्थानीय तहका अनुदान अभिलेखमा एकैसाथ द्रुत खोजी',
    enterEnginePlaceholder: 'इन्जिन नम्बर प्रविष्ट गर्नुहोस् (जस्तै: M575DI98214X वा AB-1234)...',
    verifyNow: 'इन्जिन नम्बर जाँच्नुहोस्',
    clearToGrant: 'अनुदान योग्य (सफा)',
    duplicateFound: 'दोहोरो रेकर्ड फेला पर्यो',

    // Demo Bar
    demoModeActive: 'डेमो मोड: स्थानीय नमुना डाटामा चलिरहेको छ। .env मा Supabase जोड्न सकिनेछ।',
    switchUser: 'प्रयोगकर्ता बदल्नुहोस्:',
    resetDemoData: 'डेमो डाटा रिसेट',
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('namr_lang') || 'en';
  });

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'ne' : 'en';
    setLang(next);
    localStorage.setItem('namr_lang', next);
  };

  const t = (key, fallback = '') => {
    return translations[lang]?.[key] || translations.en?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, isNepali: lang === 'ne' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

