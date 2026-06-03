// js/switcher.js
export function makeSwitcher(lenses, getCtx) {
  let current = null;
  function switchTo(name) {
    const prev = current;
    current = name;                 // set first, so getCtx() reflects the target lens
    const ctx = getCtx();
    if (prev && lenses[prev].clear) lenses[prev].clear(ctx);
    lenses[name].render(ctx);
  }
  return { switchTo, get current() { return current; } };
}
