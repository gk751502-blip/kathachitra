import test from 'node:test';
import assert from 'node:assert/strict';
import { compile, lint } from '../src/logic/promptkit.js';
import { compileAudio } from '../src/logic/audiokit.js';
import { parseBatch } from '../src/api/schema.js';
import { mergeChars, charsInShot, normalizeChars } from '../src/logic/bible.js';

const chars = normalizeChars([
  { name: 'Ram', look: 'tall man, blue skin, crown', voice: 'calm deep male voice in his 40s' },
  { name: 'Sita', look: 'woman in saffron sari', voice: 'soft warm female voice' },
]);
const card = {
  duration: 6,
  camera: { type: 'aerial drone', move: 'orbit', lens: '24mm', angle: 'high angle' },
  subject: 'Ram stands on a cliff', action: 'Ram raises a bow as wind moves his cloak',
  environment: 'Mountain at golden hour', light: 'low warm sun',
  dialogue: 'The path is hard.', speaker: 'Ram', delivery: 'steady, unhurried',
  sfx: 'bowstring creaking', ambience: 'temple bells', characters: ['Ram'],
};

test('compile uses only characters in the shot and the voice', () => {
  const r = compile(card, chars, 'cinematic look', { mode: 'flow-en', music: 'none' });
  assert.match(r.image_prompt, /Ram: tall man/);
  assert.doesNotMatch(r.image_prompt, /Sita/);
  assert.match(r.video_prompt, /Voice of Ram: calm deep male voice/);
  assert.match(r.video_prompt, /No background music/);
  assert.match(r.video_prompt, /Animate this exact image/);
});

test('sfx-only mode has no speech', () => {
  assert.match(compileAudio(card, { mode: 'sfx-only', chars }), /No speech, no dialogue/);
});

test('hindi mode says in Hindi, music flow adds music', () => {
  const a = compileAudio(card, { mode: 'flow-hi', music: 'flow', chars });
  assert.match(a, /says in Hindi/);
  assert.match(a, /soft underscore/);
});

test('lint flags long dialogue', () => {
  assert.ok(lint({ ...card, dialogue: 'a b c d e f g h i j k l m n' }).some((w) => w.includes('लंबा')));
  assert.deepEqual(lint(card), []);
});

test('parseBatch handles fences, snaps duration, caps count', () => {
  const raw = '```json\n' + JSON.stringify({ characters: [], shots: [
    { duration: 7, subject: 'a', action: 'b' }, { duration: 5, subject: 'c', action: 'd' }, { duration: 9, subject: 'e', action: 'f' },
  ] }) + '\n```';
  const r = parseBatch(raw, 2);
  assert.equal(r.ok, true);
  assert.equal(r.shots.length, 2);
  assert.ok([4, 6, 8].includes(r.shots[0].duration));
});

test('parseBatch rejects junk', () => {
  assert.equal(parseBatch('hello').ok, false);
  assert.equal(parseBatch('{"shots":[{"note":"x"},{"note":"y"}]}').ok, false);
});

test('mergeChars keeps old', () => {
  assert.equal(mergeChars(chars, [{ name: 'Ram', look: 'other', voice: '' }, { name: 'Lakshman', look: 'x', voice: 'y' }]).length, 3);
  assert.equal(charsInShot({ characters: [] }, chars).length, 2);
});
