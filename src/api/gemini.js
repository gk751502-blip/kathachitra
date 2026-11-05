import { keyStore, settings } from '../core/storage.js';
import { GEMINI } from '../config.js';
import { ApiError } from '../core/errors.js';
import { wait, jitter } from '../core/util.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

async function call(model, body) {
  const key = await keyStore.get();
  if (!key) throw new ApiError('पहले अपनी Gemini चाबी डालिए (⚙ सेटिंग)।', 'nokey');
  for (let attempt = 0; ; attempt++) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), GEMINI.timeoutMs);
    try {
      const r = await fetch(BASE + model + ':generateContent', {
        method: 'POST',
        signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        const block = j.promptFeedback && j.promptFeedback.blockReason;
        if (block) throw new ApiError(`Google ने यह प्रॉम्प्ट रोक दिया (कारण: ${block})। शब्द बदलकर देखिए।`, 'blocked');
        return j;
      }
      const retry = r.status === 429 || r.status >= 500;
      if (!retry || attempt >= GEMINI.retries - 1) {
        throw new ApiError((j.error && j.error.message) || 'त्रुटि ' + r.status, r.status);
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
      if (attempt >= GEMINI.retries - 1) {
        throw new ApiError(e.name === 'AbortError' ? 'समय खत्म हुआ।' : 'इंटरनेट नहीं है।', 'net');
      }
    } finally {
      clearTimeout(timer);
    }
    await wait(jitter(1500 * 2 ** attempt));
  }
}

export async function text(prompt, json = false) {
  const model = await settings.get('tm', GEMINI.textModel);
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  if (json) body.generationConfig = { responseMimeType: 'application/json' };
  const j = await call(model, body);
  const t = j.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!t) throw new ApiError('Google ने खाली जवाब दिया। फिर कोशिश कीजिए।', 'empty');
  return t;
}

export async function image(parts) {
  const model = await settings.get('im', GEMINI.imageModel);
  const j = await call(model, { contents: [{ parts }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } });
  const p = (j.candidates?.[0]?.content?.parts || []).find((x) => x.inlineData);
  if (!p) throw new ApiError('इमेज नहीं मिली। प्रॉम्प्ट बदलकर फिर कोशिश कीजिए।', 'noimg');
  return p.inlineData;
}

export const ping = () => text('ठीक');
