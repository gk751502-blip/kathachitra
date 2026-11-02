// प्रॉम्प्ट कंपाइलर: एक ही शॉट कार्ड से इमेज और वीडियो प्रॉम्प्ट बनते हैं, इसलिए दोनों में कैमरा, रोशनी और शैली मेल खाती हैं।
// क्रम: कैमरा और लेंस, किरदार, हरकत, माहौल, रोशनी, शैली, आवाज़।
import { compileAudio, lintAudio } from './audiokit.js';
import { charsInShot } from './bible.js';

const J = (...a) => a.filter(Boolean).join(' ');

export function compile(card, chars, styleLock, opts = {}) {
  const c = card.camera || {};
  const who = charsInShot(card, chars).map((x) => `${x.name}: ${x.look}`).join('; ');
  const image = J(
    `${c.type || 'medium'} shot, ${c.angle || 'eye level'}, ${c.lens || '35mm'} lens.`,
    card.subject && card.subject + '.',
    card.environment && card.environment + '.',
    card.light && `Lighting: ${card.light}.`,
    `Style: ${styleLock}.`,
    who && `Characters: ${who}.`,
    'This is the first frame of the shot, composed with room for the motion. No text, no watermark.');
  const video = J(
    card.continues ? 'Continue seamlessly from the previous clip.' : 'Animate this exact image.',
    'Keep the same characters, faces, costumes, background and composition. Change nothing except the motion described below.',
    `Camera: ${c.move || 'slow push in'}, ${c.lens || '35mm'} lens.`,
    card.action && `Action: ${card.action}.`,
    card.light && `Lighting: ${card.light}.`,
    compileAudio(card, { ...opts, chars }),
    `Duration: ${card.duration} seconds.`);
  return { image_prompt: image, video_prompt: video };
}

export function lint(card, opts = {}) {
  const w = [];
  const c = card.camera || {};
  if (!c.move) w.push('कैमरा की चाल नहीं लिखी।');
  if (!card.action) w.push('हरकत नहीं लिखी।');
  else if (card.action.split(/\s+/).length > 25) w.push('हरकत बहुत लंबी या जटिल है, एक ही मुख्य हरकत रखिए।');
  if (!card.light) w.push('रोशनी नहीं लिखी।');
  return [...w, ...lintAudio(card, opts)];
}
