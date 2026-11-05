import test from 'node:test';
import assert from 'node:assert/strict';
import { checkClip, meanBrightness } from '../src/logic/critic.js';

test('brightness of black and white pixels', () => {
  assert.equal(meanBrightness(new Uint8ClampedArray(4 * 2000)), 0);
  assert.equal(meanBrightness(new Uint8ClampedArray(4 * 2000).fill(255), 1), 255);
  assert.equal(meanBrightness(new Uint8ClampedArray(0)), 0);
});

test('a good clip has no issues', () => {
  assert.deepEqual(checkClip({ dark: false, duration: 6, width: 1280, height: 720 }, { duration: 6 }), []);
});

test('flags dark, short, long, wrong ratio and low resolution', () => {
  assert.ok(checkClip({ dark: true }, { duration: 6 }).some((s) => s.includes('काला')));
  assert.ok(checkClip({ duration: 2 }, { duration: 6 }).some((s) => s.includes('छोटी')));
  assert.ok(checkClip({ duration: 12 }, { duration: 6 }).some((s) => s.includes('लंबी')));
  assert.ok(checkClip({ width: 720, height: 1280 }, { duration: 6 }).some((s) => s.includes('16:9')));
  assert.ok(checkClip({ width: 480, height: 270 }, { duration: 6 }).some((s) => s.includes('रेज़ोल्यूशन')));
});
