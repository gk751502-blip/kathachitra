// टेक्स्ट हमेशा textContent की तरह डलता है, इसलिए AI या फ़ाइल का टेक्स्ट पन्ने में कोड नहीं बन सकता।
export const $ = (s, r = document) => r.querySelector(s);

export function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  e.append(...kids.flat().filter((x) => x != null && x !== false));
  return e;
}

export const bar = (...b) => h('footer', { class: 'bar' }, ...b);

export function toast(t, bad) {
  const m = $('#msg');
  if (!m) return;
  const d = h('div', { class: bad ? 'err' : '' }, t);
  m.replaceChildren(d);
  if (!bad) setTimeout(() => d.remove(), 3500);
}
