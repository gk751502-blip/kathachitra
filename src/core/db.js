// इमेज और क्लिप जैसी बड़ी फ़ाइलें फ़ोन के IndexedDB में रहती हैं। कुंजी: "प्रोजेक्टID:प्रकार:क्रम"
let dbp;
const open = () => dbp || (dbp = new Promise((res, rej) => {
  const r = indexedDB.open('kathachitra', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('b');
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
}));

const run = async (mode, fn) => {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction('b', mode);
    const req = fn(t.objectStore('b'));
    t.oncomplete = () => res(req ? req.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
};

export const blobs = {
  put: (k, v) => run('readwrite', (s) => s.put(v, k)),
  get: (k) => run('readonly', (s) => s.get(k)),
  del: (k) => run('readwrite', (s) => s.delete(k)),
  keys: (prefix) => run('readonly', (s) => s.getAllKeys(IDBKeyRange.bound(prefix, prefix + '\uffff'))),
  async delPrefix(prefix) {
    const ks = await this.keys(prefix);
    await run('readwrite', (s) => { ks.forEach((k) => s.delete(k)); return null; });
  },
  clear: () => run('readwrite', (s) => s.clear()),
};
