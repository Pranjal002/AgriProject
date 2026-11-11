/**
 * Bikram Sambat (BS) and Nepali Calendar Utilities
 */

export const FISCAL_YEARS = [
  '2082/83',
  '2081/82',
  '2080/81',
  '2079/80',
  '2078/79',
  '2077/78',
  '2076/77'
];

export const CURRENT_BS_YEAR = 2081;
export const CURRENT_FISCAL_YEAR = '2081/82';

export const BS_MONTHS = [
  { bs: 1, nameEn: 'Baishakh', nameNe: 'बैशाख' },
  { bs: 2, nameEn: 'Jestha', nameNe: 'जेठ' },
  { bs: 3, nameEn: 'Ashadh', nameNe: 'असार' },
  { bs: 4, nameEn: 'Shrawan', nameNe: 'साउन' },
  { bs: 5, nameEn: 'Bhadra', nameNe: 'भदौ' },
  { bs: 6, nameEn: 'Ashwin', nameNe: 'असोज' },
  { bs: 7, nameEn: 'Kartik', nameNe: 'कात्तिक' },
  { bs: 8, nameEn: 'Mangsir', nameNe: 'मंसिर' },
  { bs: 9, nameEn: 'Poush', nameNe: 'पुस' },
  { bs: 10, nameEn: 'Magh', nameNe: 'माघ' },
  { bs: 11, nameEn: 'Falgun', nameNe: 'फागुन' },
  { bs: 12, nameEn: 'Chaitra', nameNe: 'चैत' }
];

/**
 * Approximate conversion from AD date to BS date string
 * (BS is approx 56 years, 8 months, 17 days ahead of AD)
 */
export function formatToBSDate(adDateStr) {
  if (!adDateStr) return 'N/A';
  try {
    const adDate = new Date(adDateStr);
    if (isNaN(adDate.getTime())) return 'N/A';

    const adYear = adDate.getFullYear();
    const adMonth = adDate.getMonth(); // 0-11
    const adDay = adDate.getDate();

    // Approximate BS calculation
    let bsYear = adYear + 57;
    // Before mid-April (Baishakh 1 is usually April 13-14), it belongs to previous BS year
    if (adMonth < 3 || (adMonth === 3 && adDay < 14)) {
      bsYear = adYear + 56;
    }

    let bsMonthIndex = (adMonth + 8) % 12;
    const monthObj = BS_MONTHS[bsMonthIndex];
    return `${bsYear} ${monthObj.nameEn} ${adDay}`;
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Format timestamp into standard readable date
 */
export function formatDisplayDate(dateStr, isNepali = false) {
  if (!dateStr) return isNepali ? 'उपलब्ध छैन' : 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const bsStr = formatToBSDate(dateStr);
    const adStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return `${bsStr} (${adStr})`;
  } catch {
    return dateStr;
  }
}

