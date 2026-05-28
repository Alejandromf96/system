'use strict';
/* 
   SISTEMA // DUNGEONSCREEN.JS — Dungeon timer UI
 */

const DungeonScreen = (() => {
  let _selectedMinutes = 25;

  function init() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (Dungeon.isRunning()) return;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _selectedMinutes = parseInt(btn.dataset.minutes);
        _updateTimerDisplay(_selectedMinutes * 60, _selectedMinutes * 60, false, 0);
      });
    });

    // Start / abandon
    document.getElementById('dungeon-start-btn')?.addEventListener('click', _startDungeon);
    document.getElementById('dungeon-abandon-btn')?.addEventListener('click', _abandonDungeon);

    Dungeon.setCallbacks(_onTick, _onComplete);
    _renderStats();
  }

  function _startDungeon() {
    document.getElementById('dungeon-start-btn')?.classList.add('hidden');
    document.getElementById('dungeon-abandon-btn')?.classList.remove('hidden');
    document.getElementById('dungeon-tab-warning')?.classList.add('hidden');
    document.getElementById('dungeon-phase-label').textContent = 'EN PROGRESO';
    Dungeon.start(_selectedMinutes);
  }

  function _abandonDungeon() {
    Dungeon.abandon();
    document.getElementById('dungeon-start-btn')?.classList.remove('hidden');
    document.getElementById('dungeon-abandon-btn')?.classList.add('hidden');
    document.getElementById('dungeon-phase-label').textContent = 'ABANDONADO';
    Notifications.toast('Dungeon abandonado. Recompensa reducida.', 'error', '⚠ SESIÓN CANCELADA');
    _updateTimerDisplay(_selectedMinutes * 60, _selectedMinutes * 60, false, 0);
  }

  function _onTick(remaining, total, tabLeft, tabLeftCount) {
    _updateTimerDisplay(remaining, total, tabLeft, tabLeftCount);

    if (tabLeftCount > 0) {
      document.getElementById('dungeon-tab-warning')?.classList.remove('hidden');
    }
  }

  function _onComplete(expEarned, tabLeftCount) {
    document.getElementById('dungeon-start-btn')?.classList.remove('hidden');
    document.getElementById('dungeon-abandon-btn')?.classList.add('hidden');
    document.getElementById('dungeon-phase-label').textContent = 'COMPLETADO';
    document.getElementById('dungeon-tab-warning')?.classList.add('hidden');

    const msg = tabLeftCount > 0
      ? `Dungeon completado (penalizado por salir ${tabLeftCount}x). +${expEarned} EXP`
      : `¡Dungeon completado con honor! +${expEarned} EXP`;
    Notifications.toast(msg, 'levelup', '⏱ DUNGEON COMPLETADO');

    _updateTimerDisplay(_selectedMinutes * 60, _selectedMinutes * 60, false, 0);
    _renderStats();
    Dashboard.render();
  }

  function _updateTimerDisplay(remaining, total, tabLeft, tabLeftCount) {
    const timerEl = document.getElementById('dungeon-timer-display');
    const ringFill = document.getElementById('ring-fill');

    if (timerEl) timerEl.textContent = Dungeon.formatTime(remaining);

    if (ringFill) {
      const progress = total > 0 ? 1 - (remaining / total) : 0;
      const offset = Dungeon.getDashOffset(progress);
      ringFill.style.strokeDashoffset = offset;
      ringFill.style.strokeDasharray = Dungeon.CIRCUMFERENCE;

      if (tabLeft) {
        ringFill.style.stroke = 'var(--red)';
      } else {
        ringFill.style.stroke = 'var(--purple)';
      }
    }
  }

  function _renderStats() {
    const s = Storage.getState();
    const sToday = document.getElementById('dungeon-sessions-today');
    const sTotal = document.getElementById('dungeon-total-time');
    const sExp = document.getElementById('dungeon-exp-earned');
    if (sToday) sToday.textContent = s.dungeon.sessionsToday;
    if (sTotal) sTotal.textContent = Math.floor(s.dungeon.totalMinutesEver / 60) + 'h ' + (s.dungeon.totalMinutesEver % 60) + 'm';
    if (sExp) sExp.textContent = s.dungeon.expEarnedToday;
  }

  function render() {
    _renderStats();
  }

  return { init, render };
})();
