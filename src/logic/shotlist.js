import { text } from '../api/gemini.js';
import { director, repairPrompt, styleLock } from '../api/prompts.js';
import { parseBatch } from '../api/schema.js';
import { compile, lint } from './promptkit.js';
import { normalizeChars, mergeChars } from './bible.js';
import { get, set } from '../core/state.js';
import { startTask } from '../core/tasks.js';
import { LIMITS } from '../config.js';

export const shotCount = (len) => Math.max(3, Math.round(len / LIMITS.secondsPerShot));

async function fetchBatch(prompt, want, task) {
  let res = parseBatch(await text(prompt, true), want);
  if (!res.ok) {
    task.note('जवाब ठीक नहीं था, सुधरवा रहे हैं');
    res = parseBatch(await text(repairPrompt(prompt, res.problems), true), want);
  }
  if (!res.ok) throw new Error('AI का जवाब पढ़ा नहीं जा सका। ' + res.problems.join(' '));
  return res;
}

// हिस्सों में सूची बनती है और हर हिस्से के बाद सहेजी जाती है, इसलिए बीच में रुकने पर वहीं से जारी होती है।
export async function buildShotlist() {
  const st = get();
  const n = shotCount(st.len);
  const opts = { mode: st.audioMode, music: st.musicMode === 'flow' ? 'flow' : 'none' };
  const lock = styleLock(st.style);
  const task = startTask('दृश्य सूची बन रही है', { kind: 'shotlist-batch', total: n });
  let chars = st.characters;
  let all = st.shots.length < n ? [...st.shots] : [];
  try {
    let guard = 0;
    while (all.length < n) {
      if (++guard > n) throw new Error('सूची आगे नहीं बढ़ रही।');
      const a = all.length;
      const b = Math.min(n, a + LIMITS.shotBatch);
      task.progress(a, n, `शॉट ${a + 1} से ${b}`);
      const last = a ? all[a - 1].note : '';
      const res = await fetchBatch(director(st, n, a, b, { chars, last }), b - a, task);
      chars = a ? mergeChars(chars, normalizeChars(res.characters)) : normalizeChars(res.characters);
      all = all.concat(res.shots.map((s) => ({ ...s, ...compile(s, chars, lock, opts), warn: lint(s, opts), status: 'plan', tries: 0 })));
      set({ characters: chars, shots: all });
    }
    task.done(`${all.length} खाने तैयार`);
    return all;
  } catch (e) {
    task.fail(e.message);
    throw e;
  }
}
