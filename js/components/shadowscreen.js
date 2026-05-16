'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // SHADOWSCREEN.JS — Shadows / habits UI
═══════════════════════════════════════════════════════════════ */

const ShadowScreen = (() => {

  function init() {
    document.getElementById('add-habit-btn')?.addEventListener('click', () => {
      document.getElementById('modal-add-habit')?.classList.remove('hidden');
      document.getElementById('habit-name-input')?.focus();
    });

    document.getElementById('habit-confirm-btn')?.addEventListener('click', () => {
      const input = document.getElementById('habit-name-input');
      const name = input?.value?.trim();
      if (name) {
        Shadows.addHabit(name);
        input.value = '';
        document.getElementById('modal-add-habit')?.classList.add('hidden');
        render();
      }
    });

    document.getElementById('habit-cancel-btn')?.addEventListener('click', () => {
      document.getElementById('modal-add-habit')?.classList.add('hidden');
    });

    document.getElementById('habit-name-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('habit-confirm-btn')?.click();
    });
  }

  function render() {
    const s = Storage.getState();
    _renderHabitTracker(s);
    _renderExtractedShadows(s);
  }

  function _renderHabitTracker(s) {
    const list = document.getElementById('habit-tracker-list');
    if (!list) return;
    list.innerHTML = '';

    if (!s.shadowHabits.length) {
      list.innerHTML = '<div class="shadow-empty" style="padding:20px;text-align:center">No hay hábitos registrados. Añade uno para comenzar.</div>';
      return;
    }

    for (const h of s.shadowHabits) {
      const filled = h.days.filter(Boolean).length;
      const pct = Math.floor((filled / 30) * 100);
      const checkedToday = h.checkedToday;

      const card = document.createElement('div');
      card.className = `habit-card${checkedToday ? ' completed' : ''}`;
      card.innerHTML = `
        <div class="habit-card-top">
          <div class="habit-icon">${h.icon}</div>
          <div class="habit-info">
            <div class="habit-name">${h.name}</div>
            <div class="habit-days-label">${filled}/30 días — Racha: ${h.currentStreak}d</div>
          </div>
          <button class="habit-check-btn" data-id="${h.id}">${checkedToday ? '✓' : '+'}</button>
        </div>
        <div class="habit-progress-bg">
          <div class="habit-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="habit-dots">
          ${h.days.map((d, i) => `<div class="habit-dot${d ? ' filled' : ''}" title="Día ${i+1}"></div>`).join('')}
        </div>
      `;

      card.querySelector('.habit-check-btn').addEventListener('click', () => {
        if (!checkedToday) {
          Shadows.checkHabit(h.id);
          render();
          Dashboard.render();
        }
      });

      list.appendChild(card);
    }
  }

  function _renderExtractedShadows(s) {
    const grid = document.getElementById('shadows-grid');
    if (!grid) return;

    if (!s.extractedShadows.length) {
      grid.innerHTML = '<div class="shadow-none">Ninguna sombra extraída aún.<br>Conquista un hábito por 30 días seguidos.</div>';
      return;
    }

    grid.innerHTML = s.extractedShadows.map(sh => `
      <div class="shadow-card">
        <span class="shadow-card-icon">${sh.icon}</span>
        <div class="shadow-card-name">${sh.name}</div>
        <div class="shadow-card-origin">Origen: ${sh.origin}</div>
      </div>
    `).join('');
  }

  return { init, render };
})();