'use strict';
/* 
   SISTEMA // STORAGE.JS — LocalStorage persistence layer
 */

const Storage = (() => {
  let _state = null;

  // ── Load: deserializa desde LocalStorage y migra datos ──
  function load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return deepClone(DEFAULT_STATE);

      const saved = JSON.parse(raw);
      const state = mergeDeep(deepClone(DEFAULT_STATE), saved);

      // Migración automática: añade quests/raids/acciones nuevas
      // sin tocar el progreso existente
      _migrateQuests(state);

      return state;
    } catch {
      return deepClone(DEFAULT_STATE);
    }
  }

  // ── Migración de quests: compara IDs y añade los que falten ──
  function _migrateQuests(state) {
    const lists = [
      { key: 'dailyQuests',     src: DEFAULT_STATE.dailyQuests     },
      { key: 'weeklyRaids',     src: DEFAULT_STATE.weeklyRaids     },
      { key: 'classMissions',   src: DEFAULT_STATE.classMissions   },
      { key: 'negativeActions', src: DEFAULT_STATE.negativeActions },
    ];

    for (const { key, src } of lists) {
      // Asegurarse de que el array existe en el estado guardado
      if (!Array.isArray(state[key])) state[key] = [];

      for (const def of src) {
        const exists = state[key].find(x => x.id === def.id);
        if (!exists) {
          state[key].push(deepClone(def));
        }
      }
    }

    // Migración de claves nuevas en player
    // (para usuarios que tenían versión anterior sin estas claves)
    const playerDefaults = {
      streakProtected:    false,
      doubleGoldCharges:  0,
    };
    for (const [key, val] of Object.entries(playerDefaults)) {
      if (state.player[key] === undefined) {
        state.player[key] = val;
      }
    }

    // Migración de claves nuevas en dungeon
    const dungeonDefaults = {
      nextSessionDouble: false,
      ignoreTabPenalty:  false,
    };
    for (const [key, val] of Object.entries(dungeonDefaults)) {
      if (state.dungeon[key] === undefined) {
        state.dungeon[key] = val;
      }
    }
  }

  // ── Save: serializa a LocalStorage ──
  function save(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[SISTEMA] Storage write failed:', e);
    }
  }

  // ── getState: retorna referencia interna (carga si es null) ──
  function getState() {
    if (!_state) _state = load();
    return _state;
  }

  // ── setState: reemplaza estado completo y persiste ──
  function setState(newState) {
    _state = newState;
    save(_state);
  }

  // ── update: mutación + persistencia en un solo paso ──
  // Uso: Storage.update(s => { s.player.gold += 50; })
  function update(fn) {
    const s = getState();
    fn(s);
    save(s);
    return s;
  }

  // ── reset: vuelve al DEFAULT_STATE y borra LocalStorage ──
  function reset() {
    _state = deepClone(DEFAULT_STATE);
    save(_state);
    return _state;
  }

  // ── deepClone: copia profunda sin referencias compartidas ──
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ── mergeDeep: fusiona source en target ──
  // Regla: los objetos se fusionan recursivamente,
  // los arrays se reemplazan enteros (la migración
  // de quests se encarga de arrays específicos)
  function mergeDeep(target, source) {
    for (const key in source) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  return {
    load,
    save,
    getState,
    setState,
    update,
    reset,
    deepClone,
  };
})();
