import { image } from '../api/gemini.js';
import { get, patchShot, bk } from '../core/state.js';
import { blobs } from '../core/db.js';
import { b64, fromB64 } from '../core/util.js';
import { startTask } from '../core/tasks.js';
import { LIMITS } from '../config.js';

// संदर्भ: पिछली क्लिप का आख़िरी फ्रेम, नहीं तो पहली इमेज। इससे चेहरा और जगह मेल खाती है।
export async function referenceFor(i) {
  if (i === 0) return null;
  return (await blobs.get(bk('last', i - 1))) || (await blobs.get(bk('img', 0))) || null;
}

export async function makeImage(i) {
  const s = get().shots[i];
  if (!s) throw new Error('यह खाना नहीं मिला।');
  if (s.tries >= LIMITS.imageTries) throw new Error('इस खाने की कोशिशें पूरी हो गईं।');
  const task = startTask(`खाना ${i + 1} की इमेज बन रही है`, { kind: 'image' });
  try {
    const ref = await referenceFor(i);
    const parts = [];
    if (ref) parts.push({ inlineData: { mimeType: ref.type || 'image/jpeg', data: await b64(ref) } });
    parts.push({ text: (ref ? 'Keep the same characters, faces, costumes and place as the reference image. ' : '') + s.image_prompt + ' Aspect ratio 16:9.' });
    const d = await image(parts);
    await blobs.put(bk('img', i), fromB64(d.data, d.mimeType));
    patchShot(i, { status: s.status === 'plan' ? 'image' : s.status, tries: s.tries + 1 });
    task.done('इमेज तैयार');
  } catch (e) {
    task.fail(e.message);
    throw e;
  }
}
