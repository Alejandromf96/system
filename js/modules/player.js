'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // PLAYER.JS — Level, EXP, rank, stats management
═══════════════════════════════════════════════════════════════ */

const Player = (() => {

  // ── Add EXP and handle level ups ──
  function addExp(amount, source = '') {
    const s = Storage.getState();

    // Title bonus
    let multiplier = 1;
    if (s.titles.includes('awakened')) multiplier += 0.10;
    if (s.titles.includes('dawn_walker')) multiplier += 0.05;

    const finalExp = Math.floor(amount * multiplier);
    const goldGained = getGoldForExp(finalExp);

    s.player.exp += finalExp;
    s.player.gold += goldGained;

    let leveledUp = false;
    let newLevel = s.player.level;

    // Level up loop
    while (s.player.exp >= s.player.expToNext && s.player.level < 100) {
      s.player.exp -= s.player.expToNext;
      s.player.level += 1;
      s.player.expToNext = getExpForLevel(s.player.level + 1);
      s.player.rank = getRankFromLevel(s.player.level);
      leveledUp = true;
      newLevel = s.player.level;

      // Stat bonuses on level up
      _applyLevelUpStats(s);
    }

    Storage.setState(s);

    if (leveledUp) {
      Notifications.showLevelUp(newLevel, s.player.rank);
    }

    if (source) {
      Notifications.toast(`+${finalExp} EXP  +${goldGained}◆`, 'success', `⚔ ${source}`);
    }

    Titles.checkAndUnlock(s);
    return { exp: finalExp, gold: goldGained, leveledUp, newLevel };
  }

  // ── Remove EXP (penalty) ──
  function removeExp(amount, reason = '') {
    const s = Storage.update((s) => {
      s.player.exp = Math.max(0, s.player.exp - amount);
    });
    Notifications.toast(`-${amount} EXP`, 'error', `⚠ ${reason}`);
    Notifications.triggerDebuff();
  }

  // ── Modify a stat ──
  function modifyStat(statKey, delta) {
    Storage.update((s) => {
      if (s.stats[statKey]) {
        s.stats[statKey].value = Math.max(0, Math.min(999, s.stats[statKey].value + delta));
      }
    });
  }

  // ── Stat bonuses on level up ──
  function _applyLevelUpStats(s) {
    const bonuses = {
      1: { STR: 1 },
      5: { STR: 1, VIT: 1 },
      10: { INT: 1, WIL: 1 },
      15: { STR: 1, SEN: 1 },
      20: { VIT: 1, INT: 1 },
    };
    const mod = s.player.level % 5 === 0 ? 5 : s.player.level % 2 === 0 ? 0 : 0;
    // Every level: +1 to a rotating stat
    const statKeys = Object.keys(s.stats);
    const idx = (s.player.level - 1) % statKeys.length;
    s.stats[statKeys[idx]].value += 1;
  }

  // ── Add gold ──
  function addGold(amount) {
    Storage.update((s) => {
      s.player.gold += amount;
      if (s.titles.includes('shadow_lord')) {
        s.player.gold += Math.floor(amount * 0.10);
      }
    });
  }

  // ── Spend gold ──
  function spendGold(amount) {
    const s = Storage.getState();
    if (s.player.gold < amount) return false;
    Storage.update((s) => { s.player.gold -= amount; });
    return true;
  }

  // ── Update streak ──
  function updateStreak() {
    Storage.update((s) => {
      const today = _todayStr();
      if (s.player.lastLogin === _yesterdayStr()) {
        s.player.streak += 1;
      } else if (s.player.lastLogin !== today) {
        s.player.streak = 1;
      }
      s.player.lastLogin = today;
    });
  }

  function _todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function _yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  return { addExp, removeExp, modifyStat, addGold, spendGold, updateStreak };
})();