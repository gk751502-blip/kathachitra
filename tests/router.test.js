import test from 'node:test';
import assert from 'node:assert/strict';
import { createRouter } from '../src/core/router.js';

function make(start = 0, count = 6) {
  let s = { step: start };
  const r = createRouter({ count, get: () => s, set: (p) => { s = { ...s, ...p }; } });
  return { r, step: () => s.step };
}

test('go and back follow the path taken', () => {
  const { r, step } = make();
  r.go(1); r.go(2); r.go(5);
  assert.equal(step(), 5);
  assert.equal(r.back(), true); assert.equal(step(), 2);
  assert.equal(r.back(), true); assert.equal(step(), 1);
  assert.equal(r.back(), true); assert.equal(step(), 0);
  assert.equal(r.back(), false);
});

test('steps are clamped to the valid range', () => {
  const { r, step } = make();
  r.go(99); assert.equal(step(), 5);
  r.go(-4); assert.equal(step(), 0);
});

test('after a restart back steps down one screen', () => {
  const { r, step } = make(3);
  assert.equal(r.canBack(), true);
  assert.equal(r.back(), true);
  assert.equal(step(), 2);
});
