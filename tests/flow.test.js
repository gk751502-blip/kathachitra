import test from 'node:test';
import assert from 'node:assert/strict';
import { pickMode, recipe, estimate } from '../src/logic/flow.js';

test('mode choice', () => {
  assert.equal(pickMode({ continues: true }, 0), 'frames');
  assert.equal(pickMode({ continues: true }, 3), 'extend');
  assert.equal(pickMode({ faceDrift: true }, 2), 'ingredients');
  assert.equal(pickMode({}, 2), 'frames');
});

test('recipe steps differ by mode and mention camera and dialogue', () => {
  const a = recipe({ duration: 6, camera: { move: 'orbit' }, dialogue: 'hi' }, 1);
  assert.equal(a.mode, 'frames');
  assert.ok(a.steps.some((s) => s.includes('orbit')));
  assert.ok(a.steps.some((s) => s.includes('संवाद')));
  const b = recipe({ duration: 6, camera: { move: 'static' }, continues: true }, 2);
  assert.equal(b.mode, 'extend');
  assert.ok(!b.steps.some((s) => s.includes('कैमरा आइकन')));
  assert.ok(recipe({ duration: 6, faceDrift: true }, 2).steps.some((s) => s.includes('Ingredients')));
});

test('credit estimate', () => {
  assert.equal(estimate(5), 100);
  assert.equal(estimate(5, 'quality'), 500);
});
