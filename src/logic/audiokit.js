// वीडियो प्रॉम्प्ट का आवाज़ वाला हिस्सा। mode: flow-en | flow-hi | sfx-only, music: none | flow
const find = (chars, name) => (chars || []).find((c) => c.name === name);

export function compileAudio(card, { mode = 'flow-en', music = 'none', chars = [] } = {}) {
  const p = [];
  const speaks = mode !== 'sfx-only' && card.dialogue;
  if (speaks) {
    const who = card.speaker || 'The character';
    const c = find(chars, who);
    if (c && c.voice) p.push(`Voice of ${who}: ${c.voice}.`);
    p.push(`${who} says${mode === 'flow-hi' ? ' in Hindi' : ''}: "${card.dialogue}"${card.delivery ? ` (${card.delivery})` : ''}.`);
  } else {
    p.push('No speech, no dialogue.');
  }
  if (card.sfx) p.push(`SFX: ${card.sfx}.`);
  if (card.ambience) p.push(`Ambience: ${card.ambience}.`);
  p.push(music === 'flow' ? 'Music: soft underscore, kept quiet beneath the dialogue.' : 'No background music.');
  p.push('Mix: dialogue clearly in the foreground, SFX at the exact moments, ambience low and continuous. No subtitles, no on-screen text.');
  return 'Audio: ' + p.join(' ');
}

export function lintAudio(card, { mode = 'flow-en' } = {}) {
  const w = [];
  const words = (card.dialogue || '').split(/\s+/).filter(Boolean).length;
  if (mode !== 'sfx-only' && words > card.duration * 2) w.push('संवाद इस अवधि के लिए लंबा है।');
  if (mode === 'sfx-only' && card.dialogue) w.push('इस रणनीति में Flow संवाद नहीं बोलेगा, कथन ऐप की आवाज़ में जुड़ेगा।');
  if (!card.sfx && !card.ambience) w.push('ध्वनि-प्रभाव या माहौल की आवाज़ नहीं लिखी।');
  return w;
}
