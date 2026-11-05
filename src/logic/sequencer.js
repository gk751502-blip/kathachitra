import { get, set, patchShot, bk } from '../core/state.js';
import { blobs } from '../core/db.js';
import { probeClip } from './lastframe.js';
import { checkClip } from './critic.js';

// ताला: खाना i तभी खुलता है जब पिछला खाना मंज़ूर हो चुका हो।
export const isOpen = (i) => i === 0 || get().shots[i - 1]?.status === 'ok';

export async function attachClip(i, file) {
  const info = await probeClip(file);
  const shot = get().shots[i];
  await blobs.put(bk('clip', i), file);
  await blobs.put(bk('last', i), info.blob);
  patchShot(i, {
    status: 'clip',
    dark: info.dark,
    issues: checkClip(info, shot),
    clipInfo: { duration: info.duration, width: info.width, height: info.height },
  });
}

export function approve(i) {
  patchShot(i, { status: 'ok' });
  set({ cur: Math.min(get().shots.length - 1, i + 1) });
}

export async function redo(i) {
  await blobs.del(bk('clip', i));
  await blobs.del(bk('last', i));
  patchShot(i, { status: 'image', dark: false, issues: [], clipInfo: null });
}

export function progress() {
  const s = get().shots;
  return { ok: s.filter((x) => x.status === 'ok').length, total: s.length };
}
