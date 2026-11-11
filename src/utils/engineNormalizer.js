/**
 * Engine Number Normalization Utility
 * Normalizes engine numbers to uppercase alphanumeric string with all
 * whitespace, dashes, slashes, and special characters removed.
 * e.g., " ab- 1234 / X " -> "AB1234X"
 */

export function normalizeEngineNumber(engineNo) {
  if (!engineNo) return '';
  return engineNo.toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * Validates that an engine number has sufficient length and valid format
 */
export function validateEngineNumber(engineNo) {
  const normalized = normalizeEngineNumber(engineNo);
  if (!normalized) {
    return { isValid: false, message: 'Engine number is required.' };
  }
  if (normalized.length < 4) {
    return { isValid: false, message: 'Engine number must be at least 4 characters long.' };
  }
  if (normalized.length > 25) {
    return { isValid: false, message: 'Engine number must be at most 25 characters.' };
  }
  return { isValid: true, normalized };
}

