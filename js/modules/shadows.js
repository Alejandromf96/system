'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // SHADOWS.JS — Shadow habit tracking, extraction
═══════════════════════════════════════════════════════════════ */

const Shadows = (() => {

  const SHADOW_ICONS = ['🌑','💀','⚔️','🗡️','🌫️','🕷️','🐉','☽','🌒','💫'];

  function addHabit(name) {
    if (!name.trim()) return;
    Storage.update((s) => {
      s.shadowHabits.push({
        id: 'sh_' + Date.now(),
        name: name.trim(),
        days: Array(30).fill(false),
        currentStreak: 0,
        startDate: new Date().toISOString().slice(0,10),
        icon: SHADOW_ICONS[Math.floor(Math.random() * SHADOW_ICONS.length)],
        checkedToday: false,
        lastCheck: null,
      });
    });
  }

  function checkHabit(habitId) {
    const today = new Date().toISOString().slice(0,10);
    const s = Storage.getState();
    const h = s.shadowHabits.find(x => x.id === habitId);
    if (!h || h.checkedToday) return;

    let extracted = false;

    Storage.update((s) => {
      const habit = s.shadowHabits.find(x => x.id === habitId);
      // Find first empty slot
      const emptyIdx = habit.days.indexOf(false);
      if (emptyIdx !== -1) habit.days[emptyIdx] = true;
      habit.currentStreak += 1;
      habit.checkedToday = true;
      habit.lastCheck = today;

      // Check if 30 days conquered
      const filledDays = habit.days.filter(Boolean).length;
      if (filledDays >= 30) {
        // Extract shadow!
        s.extractedShadows.push({
          id: habit.id,
          name: 'Sombra: ' + habit.name,
          icon: habit.icon,
          origin: habit.name,
          extractedDate: today,
        });
        // Remove from habits
        s.shadowHabits = s.shadowHabits.filter(x => x.id !== habitId);
        extracted = true;
      }
    });

    Player.addExp(15, 'Hábito de sombra: ' + h.name);
    Player.modifyStat('WIL', 1);

    if (extracted) {
      Notifications.toast('¡SOMBRA EXTRAÍDA! El hábito se convirtió en tu aliado.', 'levelup', '☽ EXTRACCIÓN COMPLETADA');
      Titles.checkAndUnlock(Storage.getState());
    }
  }

  function resetDailyChecks() {
    const today = new Date().toISOString().slice(0,10);
    Storage.update((s) => {
      for (const h of s.shadowHabits) {
        if (h.lastCheck !== today) {
          h.checkedToday = false;
        }
      }
    });
  }

  return { addHabit, checkHabit, resetDailyChecks };
})();