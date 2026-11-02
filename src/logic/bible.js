// किरदार बाइबल: हर किरदार का हुलिया और आवाज़ का वर्णन, जो हर प्रॉम्प्ट में एक जैसा जुड़ता है।
const str = (v) => (typeof v === 'string' ? v.trim() : '');

export function normalizeChars(list) {
  return (Array.isArray(list) ? list : [])
    .map((c) => ({ name: str(c && c.name), look: str(c && c.look), voice: str(c && c.voice) }))
    .filter((c) => c.name);
}

// पुराने किरदार नहीं बदलते, सिर्फ़ नए जुड़ते हैं।
export function mergeChars(old, incoming) {
  const out = [...old];
  for (const c of incoming) if (!out.some((o) => o.name === c.name)) out.push(c);
  return out;
}

// शॉट में जो किरदार हैं वही लौटाता है। शॉट में सूची न हो तो सब।
export function charsInShot(card, chars) {
  const names = card.characters || [];
  if (!names.length) return chars || [];
  return (chars || []).filter((c) => names.includes(c.name));
}
