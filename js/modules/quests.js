'use strict';
/* 
   SISTEMA // QUESTS.JS — Quest completion, resets, penalties
 */

const Quests = (() => {

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function weekStartStr() {
    const d = new Date();
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }

  // ── Check and run resets ──────────────────────────────────────
  function checkResets() {
    const today = todayStr();
    const weekStart = weekStartStr();
    let needsRender = false;

    Storage.update((s) => {

      // ── Daily reset ──
      if (s.meta.lastDailyReset !== today) {

        // Verificar penalización antes de resetear
        if (s.meta.lastDailyReset) {
          _checkPenalty(s);
        }

        // Actualizar streaks y resetear completado
        for (const q of s.dailyQuests) {
          if (q.completed) q.streakDays = (q.streakDays || 0) + 1;
          else             q.streakDays = 0;
          q.completed = false;
        }

        // Actualizar nombre dinámico de flexiones según nivel actual
        const flexQuest = s.dailyQuests.find(q => q.id === 'dq6');
        if (flexQuest) {
          flexQuest.name = 'Flexiones matutinas — ' + getDailyFlexiones(s.player.level);
        }

        // Reset estadísticas diarias del dungeon
        s.dungeon.sessionsToday  = 0;
        s.dungeon.expEarnedToday = 0;
        s.dungeon.lastSessionDate = today;

        s.meta.lastDailyReset = today;
        needsRender = true;
      }

      // ── Weekly reset ──
      if (s.meta.lastWeeklyReset !== weekStart) {
        for (const cm of s.classMissions) {
          cm.completedThisWeek = 0;
        }
        for (const wr of s.weeklyRaids) {
          wr.completedThisWeek = false;
        }
        s.meta.lastWeeklyReset  = weekStart;
        s.meta.currentWeekStart = weekStart;
        needsRender = true;
      }

    });

    return needsRender;
  }

  // ── Penalty check (se llama solo si hubo un día anterior registrado) ──
  function _checkPenalty(s) {
    const total = s.dailyQuests.length;
    const done  = s.dailyQuests.filter(q => q.completed).length;
    if (done < total) {
      // Si tiene poción de racha activa, consumirla en lugar de penalizar
      if (s.player.streakProtected) {
        s.player.streakProtected = false;
        // No se activa penalización, solo se notifica
        return;
      }
      s.penalty.active = true;
      s.penalty.task   = getPenaltyTask(s.player.level);
      s.penalty.date   = new Date().toISOString().slice(0, 10);
    }
  }

  // ── Complete a daily quest ─────────────────────────────────────
  function completeDailyQuest(questId) {
    const s = Storage.getState();
    const q = s.dailyQuests.find(x => x.id === questId);
    if (!q || q.completed) return;

    // Marcar como completada
    Storage.update((st) => {
      const quest = st.dailyQuests.find(x => x.id === questId);
      quest.completed = true;
    });

    // Dar EXP y subir stat
    Player.modifyStat(q.stat, 1);
    Player.addExp(q.exp, q.name);

    // Actualizar nombre de flexiones para el siguiente día al completar
    // (refleja el nivel que tendrá el jugador mañana)
    if (questId === 'dq6') {
      const updated = Storage.getState();
      Storage.update((st) => {
        const flex = st.dailyQuests.find(x => x.id === 'dq6');
        if (flex) {
          flex.name = 'Flexiones matutinas — ' + getDailyFlexiones(updated.player.level);
        }
      });
    }

    // Bonus si se completan TODAS las misiones del día
    const updated = Storage.getState();
    const allDone = updated.dailyQuests.every(q => q.completed);
    if (allDone) {
      Notifications.toast('¡MISIONES DIARIAS COMPLETADAS!', 'levelup', '🏆 BONUS: +50 EXP');
      Player.addExp(50, 'Bonus Misiones Completas');
    }
  }

  // ── Complete a class mission ───────────────────────────────────
  function completeClassMission(missionId) {
    const s = Storage.getState();
    const m = s.classMissions.find(x => x.id === missionId);
    if (!m) return;

    Storage.update((st) => {
      const mission = st.classMissions.find(x => x.id === missionId);
      mission.completedThisWeek += 1;
    });

    Player.modifyStat(m.stat, 1);
    Player.addExp(m.exp, m.name);

    // Bonus al alcanzar 3 sesiones en la semana
    const updated    = Storage.getState();
    const weeklyTotal = updated.classMissions.reduce((a, c) => a + c.completedThisWeek, 0);
    if (weeklyTotal === 3) {
      Notifications.toast('¡META SEMANAL DE CLASE ALCANZADA!', 'levelup', '📚 BONUS: +80 EXP');
      Player.addExp(80, 'Bonus Clase Semanal');
    }
  }

  // ── Complete a weekly raid ─────────────────────────────────────
  function completeWeeklyRaid(raidId) {
    const s = Storage.getState();
    const r = s.weeklyRaids.find(x => x.id === raidId);
    if (!r || r.completedThisWeek) return;

    Storage.update((st) => {
      const raid = st.weeklyRaids.find(x => x.id === raidId);
      raid.completedThisWeek = true;
    });

    Player.modifyStat(r.stat, 2);
    Player.addExp(r.exp, r.name);

    // Mensajes específicos por raid
    if (raidId === 'wr4') {
      Notifications.toast('¡Saliste a correr! El cuerpo no miente.', 'success', '🏃 RAID COMPLETADA');
    } else if (raidId === 'wr5') {
      Notifications.toast('Mente y espíritu alineados.', 'success', '🙏 RAID COMPLETADA');
    }

    Titles.checkAndUnlock(Storage.getState());
  }

  // ── Apply a negative action ────────────────────────────────────
  function applyNegative(actionId) {
    const s = Storage.getState();
    const action = s.negativeActions.find(x => x.id === actionId);
    if (!action) return;

    Player.modifyStat(action.penalty.stat, -action.penalty.amount);
    if (action.penalty.statB) {
      Player.modifyStat(action.penalty.statB, -action.penalty.amountB);
    }
    Player.removeExp(action.expLoss, action.name);

    Notifications.toast(
      `${action.name}`,
      'error',
      `⚠ DEBUFF: -${action.penalty.amount} ${action.penalty.stat}  -${action.expLoss} EXP`
    );
  }

  // ── Dismiss penalty gate ───────────────────────────────────────
  function clearPenalty() {
    Storage.update((s) => {
      s.penalty.active = false;
      s.penalty.task   = '';
    });
    Notifications.toast('Penalización cumplida. El Sistema te observa.', 'success', '✓ ACCESO RESTAURADO');
  }

  // ── Helpers públicos ───────────────────────────────────────────
  function getClassWeeklyCount() {
    const s = Storage.getState();
    return s.classMissions.reduce((a, c) => a + c.completedThisWeek, 0);
  }

  return {
    checkResets,
    completeDailyQuest,
    completeClassMission,
    completeWeeklyRaid,
    applyNegative,
    clearPenalty,
    getClassWeeklyCount,
  };
})();
