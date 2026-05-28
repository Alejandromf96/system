'use strict';
/* 
   SISTEMA // NOTIFICATIONS.JS — Toasts, level up, debuff
 */

const Notifications = (() => {

  function toast(msg, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-msg">${msg}</div>
    `;
    container.appendChild(el);

    setTimeout(() => {
      el.remove();
    }, 3600);
  }

  function showLevelUp(level, rank) {
    const overlay = document.getElementById('levelup-overlay');
    const numEl = document.getElementById('levelup-num');
    const rankEl = document.getElementById('levelup-rank');
    if (!overlay) return;

    numEl.textContent = level;
    rankEl.textContent = `RANGO ${rank}`;
    rankEl.className = `levelup-rank rank-${rank.toLowerCase()}`;

    overlay.classList.remove('hidden');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 3500);
  }

  function triggerDebuff() {
    const overlay = document.getElementById('debuff-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('hidden'), 600);
  }

  function systemMessage(msg) {
    toast(msg, 'info', '◈ EL SISTEMA');
  }

  return { toast, showLevelUp, triggerDebuff, systemMessage };
})();
