import assert from 'node:assert';
import { normalizeEngineNumber, validateEngineNumber } from '../src/utils/engineNormalizer.js';
import { validateNepaliPhone, formatNPR, toNepaliDigits } from '../src/utils/nepaliValidators.js';
import { checkEngineNumber, createSubsidy, getDuplicateAlerts, getDashboardStats, getSubsidies, resetDemoDatabase } from '../src/services/api.js';

console.log('🧪 Starting Automated Verification of Nepal Agriculture Subsidy Registry...\n');

// 1. Test Engine Normalization
console.log('Test 1: Engine Normalization');
assert.strictEqual(normalizeEngineNumber(' ab- 1234 / X '), 'AB1234X');
assert.strictEqual(normalizeEngineNumber('m-575-di-98214-x'), 'M575DI98214X');
assert.strictEqual(normalizeEngineNumber(''), '');
console.log('✅ Engine normalization passed.');

// 2. Test Phone Validator & Formatting
console.log('\nTest 2: Phone Validation & Currency Formatting');
assert.strictEqual(validateNepaliPhone('9845012345').isValid, true);
assert.strictEqual(validateNepaliPhone('9712345678').isValid, true);
assert.strictEqual(validateNepaliPhone('12345').isValid, false);
assert.strictEqual(formatNPR(750000), 'Rs. 7,50,000');
assert.strictEqual(formatNPR(1000000), 'Rs. 10,00,000');
assert.strictEqual(toNepaliDigits('2081/82'), '२०८१/८२');
console.log('✅ Validation and currency formatting passed.');

// 3. Test Universal Cross-Nepal Engine Duplicate Checker
console.log('\nTest 3: Live Universal Cross-Nepal Engine Duplicate Checker');
const dupCheck = await checkEngineNumber('m 575 di 98214 x');
assert.strictEqual(dupCheck.exists, true);
assert.strictEqual(dupCheck.has_subsidy, true);
assert.strictEqual(dupCheck.engine_number, 'M575DI98214X');
assert.strictEqual(dupCheck.farmer_name, 'Ram Bahadur Thapa');
console.log(`✅ Duplicate machine detected: Engine "${dupCheck.engine_number}" previously subsidized by "${dupCheck.office_name}" in ${dupCheck.subsidy_year_bs} BS for "${dupCheck.farmer_name}".`);

const cleanCheck = await checkEngineNumber('KUBOTA-VIRGIN-9988');
assert.strictEqual(cleanCheck.exists, false);
console.log('✅ Clean machine verified: Engine "KUBOTA-VIRGIN-9988" is clear across all Nepal offices.');

// 4. Test Duplicate Subsidy Blocking and Automatic Duplicate Alert Logging
console.log('\nTest 4: Duplicate Subsidy Blocking & Alert Generation');
let duplicateBlocked = false;
try {
  await createSubsidy({
    farmerData: { name: 'Test Farmer', phone: '9841112233', province: 'Koshi', district: 'Jhapa', municipality: 'Damak' },
    productData: { category: 'Tractor', name: 'Mahindra', brand: 'Mahindra', engine_number: 'M575DI98214X' },
    subsidyData: { subsidy_year_bs: '2081/82', amount: 500000, percentage: 50, office_id: '55555555-5555-5555-5555-555555555555' },
    currentUser: { id: 'u4444444-4444-4444-4444-444444444444', full_name: 'Rita Bhattarai', office_id: '55555555-5555-5555-5555-555555555555', role: 'data_entry' }
  });
} catch (err) {
  duplicateBlocked = true;
  assert.ok(err.message.includes('DUPLICATE_ENGINE_ERROR'));
  console.log('✅ Duplicate save blocked successfully with message:\n   "' + err.message + '"');
}
assert.strictEqual(duplicateBlocked, true, 'Duplicate save should have been blocked!');

// Check that duplicate alert was automatically inserted
const alerts = await getDuplicateAlerts('open');
const loggedAlert = alerts.find(a => a.engine_number === 'M575DI98214X');
assert.ok(loggedAlert, 'Duplicate alert must be logged in duplicate_alerts table');
console.log('✅ Duplicate alert row created automatically in duplicate_alerts with status: ' + loggedAlert.status);

// 5. Test Clean Subsidy Registration
console.log('\nTest 5: Clean Subsidy Registration');
const uniqueEngine = `CLEAN-ENG-${Date.now()}`;
const newSub = await createSubsidy({
  farmerData: { name: 'Gita Adhikari', phone: '9845998877', province: 'Gandaki', district: 'Kaski', municipality: 'Pokhara', ward: '05' },
  productData: { category: 'Power Tiller', name: 'Shaktiman Rotary Tiller', brand: 'Shaktiman', engine_number: uniqueEngine },
  subsidyData: { subsidy_year_bs: '2081/82', amount: 150000, percentage: 50, office_id: '66666666-6666-6666-6666-666666666666' },
  currentUser: { id: 'u1111111-1111-1111-1111-111111111111', full_name: 'Dr. Hari Bahadur KC', role: 'super_admin' }
});
assert.ok(newSub.id);
console.log(`✅ Clean subsidy created successfully (ID: ${newSub.id}, Engine: ${uniqueEngine}).`);

// Verify newly registered machine is now caught as duplicate if someone tries again
const recheck = await checkEngineNumber(uniqueEngine);
assert.strictEqual(recheck.exists, true);
assert.strictEqual(recheck.farmer_name, 'Gita Adhikari');
console.log(`✅ Subsequent duplicate check for "${uniqueEngine}" now correctly returns duplicate status.`);

// 6. Test Dashboard Aggregations
console.log('\nTest 6: Dashboard Metrics & Charts');
const stats = await getDashboardStats({ role: 'super_admin' });
assert.ok(stats.totalSubsidies >= 5);
assert.ok(stats.totalFarmers >= 5);
assert.ok(stats.openAlertsCount >= 1);
console.log(`✅ Dashboard stats verified: Total Subsidies: ${stats.totalSubsidies}, Total Farmers: ${stats.totalFarmers}, Open Fraud Alerts: ${stats.openAlertsCount}`);

console.log('\n🎉 ALL 6 TEST SUITES PASSED FLAWLESSLY!\n');
