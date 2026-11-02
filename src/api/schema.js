// AI के JSON जवाब को पढ़ना, जाँचना और ठीक आकार में लाना।
const DURATIONS = [4, 6, 8];
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const nearest = (d) => DURATIONS.reduce((p, c) => (Math.abs(c - d) < Math.abs(p - d) ? c : p), 6);

export function extractJson(text) {
  let t = String(text || '').trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  return a >= 0 && b > a ? t.slice(a, b + 1) : t;
}

export function normalizeShot(s) {
  s = s || {};
  const c = s.camera && typeof s.camera === 'object' ? s.camera : {};
  return {
    duration: nearest(Number(s.duration) || 6),
    note: str(s.note),
    characters: Array.isArray(s.characters) ? s.characters.map(str).filter(Boolean) : [],
    camera: { type: str(c.type) || 'medium', move: str(c.move) || 'slow push in', lens: str(c.lens) || '35mm', angle: str(c.angle) || 'eye level' },
    subject: str(s.subject), action: str(s.action), environment: str(s.environment), light: str(s.light),
    continues: s.continues === true,
    dialogue: str(s.dialogue), speaker: str(s.speaker), delivery: str(s.delivery),
    narration: str(s.narration), sfx: str(s.sfx), ambience: str(s.ambience),
  };
}

export function parseBatch(text, expected = 0) {
  let d;
  try { d = JSON.parse(extractJson(text)); } catch { return { ok: false, problems: ['JSON पढ़ा नहीं जा सका।'] }; }
  if (!d || !Array.isArray(d.shots) || !d.shots.length) return { ok: false, problems: ['"shots" की सूची नहीं मिली।'] };
  let shots = d.shots.map(normalizeShot);
  if (expected > 0) shots = shots.slice(0, expected);
  const bad = shots.filter((s) => !s.action || !s.subject).length;
  if (bad > shots.length / 2) return { ok: false, problems: ['आधे से ज़्यादा शॉट में subject या action नहीं है।'] };
  return { ok: true, characters: Array.isArray(d.characters) ? d.characters : [], shots, problems: [] };
}
