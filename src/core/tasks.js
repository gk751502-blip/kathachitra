// हर लंबा काम यहाँ दर्ज होता है, ताकि स्क्रीन पर उसकी हालत हमेशा दिखे (ui/progress.js इसे पढ़ेगी)।
import { kv } from './storage.js';
import { debounce } from './util.js';

const tasks = new Map();
const subs = new Set();
let counter = 0;
let timings = {};
const ready = kv.getJson('timings', {}).then((t) => { timings = t; }).catch(() => {});
const saveTimings = debounce(() => kv.setJson('timings', timings).catch(() => {}), 1000);
const emit = () => { const list = [...tasks.values()]; subs.forEach((f) => f(list)); };

export const onTasks = (f) => { subs.add(f); f([...tasks.values()]); return () => subs.delete(f); };
export const typical = (kind) => timings[kind] || null;

export function startTask(title, { kind = '', total = 0, onCancel = null } = {}) {
  const id = ++counter;
  const t = { id, title, kind, total, done: 0, note: '', state: 'run', startedAt: Date.now(), beat: Date.now(), cancellable: !!onCancel };
  tasks.set(id, t);
  emit();
  const upd = (p) => { Object.assign(t, p, { beat: Date.now() }); emit(); };
  const end = (state, note, ms) => { upd({ state, note }); setTimeout(() => { tasks.delete(id); emit(); }, ms); };
  return {
    id,
    task: t,
    progress: (done, total2, note) => upd({ done, ...(total2 != null ? { total: total2 } : {}), ...(note != null ? { note } : {}) }),
    note: (note) => upd({ note }),
    cancel: () => { if (onCancel) onCancel(); end('err', 'रोका गया', 2500); },
    done: (note = 'पूरा हुआ') => {
      if (kind) {
        const ms = Date.now() - t.startedAt;
        timings[kind] = timings[kind] ? timings[kind] * 0.7 + ms * 0.3 : ms;
        saveTimings();
      }
      end('ok', note, 1500);
    },
    fail: (note) => end('err', note, 8000),
  };
}

export async function runTask(title, fn, opts) {
  await ready;
  const t = startTask(title, opts);
  try { const r = await fn(t); t.done(); return r; }
  catch (e) { t.fail(e.message || String(e)); throw e; }
}
