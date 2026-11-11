/**
 * Validation and Formatting Utilities for Nepali Context
 */

/**
 * Validates a Nepali 10-digit mobile number or standard landline
 * Mobile: starts with 98 or 97 and exactly 10 digits
 * Landline: starts with 01 (Kathmandu) or 0xx area code
 */
export function validateNepaliPhone(phone) {
  if (!phone) return { isValid: false, message: 'Phone number is required.' };
  const cleaned = phone.toString().replace(/[\s\-]/g, '');
  
  // Mobile pattern: 98xxxxxxxx or 97xxxxxxxx
  const mobileRegex = /^(98|97)\d{8}$/;
  // Landline pattern: 01xxxxxxx or 0[2-9]\d{7}
  const landlineRegex = /^(0\d{1,2})\d{6,7}$/;

  if (mobileRegex.test(cleaned) || landlineRegex.test(cleaned)) {
    return { isValid: true, cleaned };
  }

  return {
    isValid: false,
    message: 'Enter a valid 10-digit Nepali mobile number (98xxxxxxxx / 97xxxxxxxx) or landline.'
  };
}

/**
 * Validates Nepali Citizenship Number (e.g., 31-01-72-04981 or 1234/567)
 */
export function validateCitizenship(citizenshipNo) {
  if (!citizenshipNo) return { isValid: true }; // optional
  const trimmed = citizenshipNo.trim();
  if (trimmed.length < 4 || trimmed.length > 25) {
    return { isValid: false, message: 'Citizenship number should be between 4 and 25 characters.' };
  }
  return { isValid: true, cleaned: trimmed };
}

/**
 * Formats an amount in NPR (Nepali Rupees) with standard South Asian comma style (Lakhs, Crores)
 * e.g., 750000 -> Rs. 7,50,000
 */
export function formatNPR(amount, includeSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) return includeSymbol ? 'Rs. 0' : '0';
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1] === '00' ? '' : '.' + parts[1];

  // South Asian formatting: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  const result = (isNegative ? '-' : '') + intPart + decPart;
  return includeSymbol ? `Rs. ${result}` : result;
}

/**
 * Converts English digits to Nepali Devanagari numerals
 * e.g. "2081/82" -> "२०८१/८२"
 */
export const nepaliDigitsMap = {
  '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
  '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
};

export function toNepaliDigits(str) {
  if (!str) return '';
  return str.toString().replace(/[0-9]/g, match => nepaliDigitsMap[match] || match);
}
