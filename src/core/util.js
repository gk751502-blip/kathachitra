export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const jitter = (ms) => ms * (0.8 + Math.random() * 0.4);

export const debounce = (fn, ms) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

export const fmtDur = (sec) => {
  sec = Math.round(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  return m ? `${m}:${String(s).padStart(2, '0')}` : `${s} सेकंड`;
};

export const b64 = (blob) => new Promise((res, rej) => {
  const f = new FileReader();
  f.onload = () => res(String(f.result).split(',')[1]);
  f.onerror = rej;
  f.readAsDataURL(blob);
});

export const fromB64 = (data, type) => {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type });
};
