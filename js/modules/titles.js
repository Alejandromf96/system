'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // TITLES.JS — Title unlocks, passive bonuses
═══════════════════════════════════════════════════════════════ */

const Titles = (() => {

  function checkAndUnlock(s) {
    for (const titleDef of TITLES_DEF) {
      if (!s.titles.includes(titleDef.id)) {
        if (titleDef.condition(s)) {
          _unlock(titleDef, s);
        }
      }
    }
  }

  function _unlock(titleDef, s) {
    Storage.update((st) => {
      if (!st.titles.includes(titleDef.id)) {
        st.titles.push(titleDef.id);
        if (!st.player.title) st.player.title = titleDef.id;
      }
    });
    Notifications.toast(
      `"${titleDef.name}" — ${titleDef.bonus}`,
      'gold',
      `★ TÍTULO DESBLOQUEADO`
    );
  }

  function getActiveTitles(s) {
    return TITLES_DEF.filter(t => s.titles.includes(t.id));
  }

  function setActiveTitle(titleId) {
    Storage.update((s) => { s.player.title = titleId; });
  }

  function getDisplayTitle(s) {
    if (!s.player.title) return null;
    return TITLES_DEF.find(t => t.id === s.player.title) || null;
  }

  return { checkAndUnlock, getActiveTitles, setActiveTitle, getDisplayTitle };
})();