/**
 * Local Standalone Test Script for Developer 3 (AI Module)
 * 
 * Run with: node src/ai/localTest.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { analyzeAnswers } = require('./index');
const {
  recursionFixture,
  smallBatchFixture,
  allCorrectFixture,
  singleFlawFixture
} = require('./__fixtures__/fixtures');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✅ PASSED: ${message}`);
  }
}

async function runLocalTests() {
  console.log('================================================================');
  console.log('🚀 Developer 3 — AI Misconception Engine Test Suite');
  console.log('================================================================\n');

  let passedCount = 0;
  let totalTests = 4;

  // ---------------------------------------------------------------------------
  // Test 1: Standard Recursion Base-Case Scenario (8 submissions)
  // ---------------------------------------------------------------------------
  console.log('▶ Test 1: Standard Recursion Base-Case Scenario (8 submissions)...');
  try {
    const res1 = await analyzeAnswers(recursionFixture);
    console.log('Result payload:', JSON.stringify(res1, null, 2));

    assert(Array.isArray(res1.misconceptionGroups), 'misconceptionGroups is an array');
    assert(res1.misconceptionGroups.length >= 2, 'Has at least 2 distinct misconception groups');

    const sumPct = res1.misconceptionGroups.reduce((acc, g) => acc + g.percentage, 0);
    assert(sumPct >= 98 && sumPct <= 102, `Percentages sum to ~100% (actual: ${sumPct}%)`);
    assert(typeof res1.insight === 'string' && res1.insight.length > 10, 'Insight is a non-empty string');
    assert(typeof res1.intervention === 'string' && res1.intervention.length > 10, 'Intervention is a non-empty string');

    passedCount++;
    console.log('✨ Test 1 completed successfully.\n');
  } catch (err) {
    console.error('Test 1 failed with error:', err.message, '\n');
  }

  // ---------------------------------------------------------------------------
  // Test 2: Edge Case — Small Batch (< 5 submissions)
  // ---------------------------------------------------------------------------
  console.log('▶ Test 2: Edge Case — Small Batch (< 5 submissions)...');
  try {
    const res2 = await analyzeAnswers(smallBatchFixture);
    console.log('Result payload:', JSON.stringify(res2, null, 2));

    assert(Array.isArray(res2.misconceptionGroups), 'misconceptionGroups is an array');
    assert(res2.misconceptionGroups[0].label.toLowerCase().includes('insufficient'), 'Returns insufficient data label for small batch');
    assert(res2.misconceptionGroups[0].percentage === 100, 'Insufficient data accounts for 100%');

    passedCount++;
    console.log('✨ Test 2 completed successfully.\n');
  } catch (err) {
    console.error('Test 2 failed with error:', err.message, '\n');
  }

  // ---------------------------------------------------------------------------
  // Test 3: Edge Case — All Correct Submissions
  // ---------------------------------------------------------------------------
  console.log('▶ Test 3: Edge Case — 100% Correct Submissions...');
  try {
    const res3 = await analyzeAnswers(allCorrectFixture);
    console.log('Result payload:', JSON.stringify(res3, null, 2));

    assert(Array.isArray(res3.misconceptionGroups), 'misconceptionGroups is an array');
    const sumPct3 = res3.misconceptionGroups.reduce((acc, g) => acc + g.percentage, 0);
    assert(sumPct3 >= 98 && sumPct3 <= 102, `Percentages sum to ~100% (actual: ${sumPct3}%)`);

    passedCount++;
    console.log('✨ Test 3 completed successfully.\n');
  } catch (err) {
    console.error('Test 3 failed with error:', err.message, '\n');
  }

  // ---------------------------------------------------------------------------
  // Test 4: Edge Case — Single Dominant Misconception
  // ---------------------------------------------------------------------------
  console.log('▶ Test 4: Edge Case — Single Dominant Misconception...');
  try {
    const res4 = await analyzeAnswers(singleFlawFixture);
    console.log('Result payload:', JSON.stringify(res4, null, 2));

    assert(Array.isArray(res4.misconceptionGroups), 'misconceptionGroups is an array');
    const sumPct4 = res4.misconceptionGroups.reduce((acc, g) => acc + g.percentage, 0);
    assert(sumPct4 >= 98 && sumPct4 <= 102, `Percentages sum to ~100% (actual: ${sumPct4}%)`);

    passedCount++;
    console.log('✨ Test 4 completed successfully.\n');
  } catch (err) {
    console.error('Test 4 failed with error:', err.message, '\n');
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`🏁 Summary: ${passedCount}/${totalTests} Tests Passed`);
  console.log('================================================================');

  if (passedCount === totalTests) {
    console.log('🎉 Developer 3 AI Engine is 100% Contract B compliant and ready for handoff!');
  } else {
    process.exit(1);
  }
}

runLocalTests();
