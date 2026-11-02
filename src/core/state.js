import { kv } from './storage.js';
import { blobs } from './db.js';
import { uid, debounce } from './util.js';

export const SCHEMA = 1;

const fresh = (id) => ({
  schema: SCHEMA, pid: id, title: 'नया प्रोजेक्ट', step: 0,
  idea: '', style: 'रियलिस्टिक सिनेमा', theme: 'धार्मिक कथा', src: '', len: 30,
  audioMode: 'flow-en', musicMode: 'auto',
  characters: [], shots: [], cur: 0, edl: null,
  createdAt: Date.now(), updatedAt: Date.now(),
});

let s = fresh(uid());
const subs = new Set();
const emit = () => subs.forEach((f) => f(s));

export const get = () => s;
export const on = (f) => { subs.add(f); return () => subs.delete(f); };
export const bk = (kind, i = '') => `${s.pid}:${kind}${i === '' ? '' : ':' + i}`;

const saveNow = async () => {
  await kv.setJson('project:' + s.pid, s);
  const idx = (await kv.getJson('projects', [])).filter((p) => p.id !== s.pid);
  idx.unshift({ id: s.pid, title: s.title, updatedAt: s.updatedAt });
  await kv.setJson('projects', idx);
  await kv.set('current', s.pid);
};
const persist = debounce(() => saveNow().catch(() => {}), 300);

export function set(p) {
  s = { ...s, ...p, updatedAt: Date.now() };
  emit();
  persist();
}
export const patchShot = (i, p) => set({ shots: s.shots.map((x, k) => (k === i ? { ...x, ...p } : x)) });

const switchTo = async (id) => {
  const raw = await kv.getJson('project:' + id, null);
  if (!raw) throw new Error('प्रोजेक्ट नहीं मिला।');
  s = { ...fresh(id), ...raw };
  await kv.set('current', id);
  emit();
};

export async function load() {
  const id = await kv.get('current');
  if (id) { try { await switchTo(id); } catch { /* पहली बार */ } }
}
export async function newProject(title) {
  await saveNow().catch(() => {});
  s = { ...fresh(uid()), title: title || 'नया प्रोजेक्ट' };
  emit();
  await saveNow();
  return s.pid;
}
export async function openProject(id) {
  await saveNow().catch(() => {});
  await switchTo(id);
}
export const listProjects = () => kv.getJson('projects', []);

export async function deleteProject(id) {
  await blobs.delPrefix(id + ':');
  await kv.del('project:' + id);
  const idx = (await kv.getJson('projects', [])).filter((p) => p.id !== id);
  await kv.setJson('projects', idx);
  if (id === s.pid) {
    if (idx[0]) await switchTo(idx[0].id);
    else { s = fresh(uid()); emit(); await saveNow(); }
  }
}
