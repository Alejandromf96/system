'use strict';
/* 
   SISTEMA // DUNGEON.JS — Focus timer, tab detection, rewards
 */

const Dungeon = (() => {
  let _timer = null;
  let _totalSeconds = 0;
  let _remainingSeconds = 0;
  let _running = false;
  let _tabLeft = false;
  let _tabLeftCount = 0;
  let _onTick = null;
  let _onComplete = null;

  const CIRCUMFERENCE = 2 * Math.PI * 88; // ~553

  function setCallbacks(onTick, onComplete) {
    _onTick = onTick;
    _onComplete = onComplete;
  }

  function start(minutes) {
    if (_running) return;
    _totalSeconds = minutes * 60;
    _remainingSeconds = _totalSeconds;
    _tabLeft = false;
    _tabLeftCount = 0;
    _running = true;

    _timer = setInterval(_tick, 1000);
    _setupVisibilityListener();
  }

  function abandon() {
    _running = false;
    clearInterval(_timer);
    _timer = null;
    _removeVisibilityListener();
  }

  function _tick() {
    if (!_running) return;
    _remainingSeconds -= 1;

    if (_onTick) _onTick(_remainingSeconds, _totalSeconds, _tabLeft, _tabLeftCount);

    if (_remainingSeconds <= 0) {
      _complete();
    }
  }

  function _complete() {
    _running = false;
    clearInterval(_timer);
    _timer = null;
    _removeVisibilityListener();

    const minutes = Math.floor(_totalSeconds / 60);
    const s = Storage.getState();

    // Aplicar doble EXP si hay llave activa
    let expEarned = _calculateReward(minutes);
    if (s.dungeon.nextSessionDouble) {
      expEarned = expEarned * 2;
      Storage.update(st => { st.dungeon.nextSessionDouble = false; });
      Notifications.toast('Llave consumida — doble EXP aplicado', 'gold', '🗝️');
    }

    Storage.update((st) => {
      st.dungeon.sessionsToday    += 1;
      st.dungeon.totalMinutesEver += minutes;
      st.dungeon.expEarnedToday   += expEarned;
    });

    Player.addExp(expEarned, `Dungeon ${minutes} min`);
    Player.modifyStat('INT', Math.floor(minutes / 15));

    if (_onComplete) _onComplete(expEarned, _tabLeftCount);
  }

  function _calculateReward(minutes) {
    let base = minutes * 2;
    const s = Storage.getState();
    if (_tabLeftCount > 0 && !s.dungeon.ignoreTabPenalty) {
      base = Math.floor(base * 0.5);
    }
    if (_tabLeftCount > 0 && s.dungeon.ignoreTabPenalty) {
      Storage.update(st => { st.dungeon.ignoreTabPenalty = false; });
      Notifications.toast('Cristal consumido — penalización ignorada', 'gold', '🌀');
    }
    return base;
  }

  function _setupVisibilityListener() {
    document.addEventListener('visibilitychange', _onVisibility);
  }

  function _removeVisibilityListener() {
    document.removeEventListener('visibilitychange', _onVisibility);
  }

  function _onVisibility() {
    if (document.hidden && _running) {
      _tabLeft = true;
      _tabLeftCount += 1;
    }
  }

  function isRunning() { return _running; }

  function getProgress() {
    if (_totalSeconds === 0) return 0;
    return 1 - (_remainingSeconds / _totalSeconds);
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function getDashOffset(progress) {
    return CIRCUMFERENCE * (1 - progress);
  }

  return { start, abandon, isRunning, getProgress, formatTime, getDashOffset, setCallbacks, CIRCUMFERENCE };
})();
