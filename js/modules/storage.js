'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // STORAGE.JS — LocalStorage persistence layer
═══════════════════════════════════════════════════════════════ */

const Storage = (() => {
  let _state = null;

  function load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return deepClone(DEFAULT_STATE);
      return mergeDeep(deepClone(DEFAULT_STATE), JSON.parse(raw));
    } catch {
      return deepClone(DEFAULT_STATE);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[SISTEMA] Storage write failed:', e);
    }
  }

  function getState() {
    if (!_state) _state = load();
    return _state;
  }

  function setState(newState) {
    _state = newState;
    save(_state);
  }

  function update(fn) {
    const s = getState();
    fn(s);
    save(s);
    return s;
  }

  // ── Deep clone ──
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ── Deep merge (target <- source, doesn't override arrays) ──
  function mergeDeep(target, source) {
    for (const key in source) {
      const srcVal = source[key];
      const tgtVal = target[key];

      // Recurse into plain objects
      if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
        if (!tgtVal) target[key] = {};
        mergeDeep(target[key], srcVal);

      // Merge arrays by `id` when both target and source are arrays (keep saved items, add missing defaults)
      } else if (Array.isArray(srcVal) && Array.isArray(tgtVal)) {
        // Preserve saved items by id, but keep defaults for missing items.
        const srcById = new Map(srcVal.map(it => [it && it.id, it]));
        const merged = tgtVal.map(defItem => {
          if (defItem && defItem.id && srcById.has(defItem.id)) return srcById.get(defItem.id);
          return defItem;
        });
        // Append any source items that are new (not present in defaults)
        for (const item of srcVal) {
          if (!item || !item.id) continue;
          if (!merged.find(m => m && m.id === item.id)) merged.push(item);
        }
        target[key] = merged;

      // Fallback: copy value if key exists in defaults (or if source explicitly provides it)
      } else {
        if (key in target || key in source) {
          target[key] = srcVal;
        }
      }
    }
    return target;
  }

  function reset() {
    _state = deepClone(DEFAULT_STATE);
    save(_state);
    return _state;
  }

  // ── Merge defaults into current saved state (safe migration) ──
  function migrateDefaults() {
    const current = getState();
    const merged = mergeDeep(deepClone(DEFAULT_STATE), deepClone(current));
    _state = merged;
    save(_state);
    return _state;
  }

  return { load, save, getState, setState, update, reset, deepClone, migrateDefaults };
})();