// स्क्रीनों का क्रम और "पीछे" जाना। back() झूठ लौटाए तो ऐप बंद करना ठीक है।
export function createRouter({ count, get, set }) {
  const stack = [];
  const clampStep = (n) => Math.max(0, Math.min(count - 1, n));

  function go(n) {
    const to = clampStep(n);
    const from = get().step;
    if (to !== from) stack.push(from);
    set({ step: to });
  }
  function back() {
    if (stack.length) { set({ step: stack.pop() }); return true; }
    if (get().step > 0) { set({ step: get().step - 1 }); return true; }
    return false;
  }
  return { go, next: () => go(get().step + 1), back, canBack: () => stack.length > 0 || get().step > 0 };
}
