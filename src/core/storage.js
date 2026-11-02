import { Preferences } from '@capacitor/preferences';

const get = async (k) => (await Preferences.get({ key: k })).value;
const set = (k, v) => Preferences.set({ key: k, value: String(v) });
const del = (k) => Preferences.remove({ key: k });
const getJson = async (k, d) => {
  try { const v = await get(k); return v ? JSON.parse(v) : d; } catch { return d; }
};
const setJson = (k, v) => set(k, JSON.stringify(v));

export const kv = { get, set, del, getJson, setJson };

// ध्यान: Preferences ऐप की निजी स्टोरेज है, Keystore की एन्क्रिप्टेड तिजोरी नहीं।
// असली तिजोरी बाद में इसी फ़ाइल में बदली जाएगी, बाकी कोड को छेड़ना नहीं पड़ेगा।
export const keyStore = {
  get: () => get('gkey'),
  set: (v) => set('gkey', v),
  del: () => del('gkey'),
};

export const settings = {
  get: async (k, d) => (await get('s:' + k)) || d,
  set: (k, v) => set('s:' + k, v),
  del: (k) => del('s:' + k),
};
