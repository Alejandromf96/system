'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // DASHBOARD.JS — Dashboard screen rendering
═══════════════════════════════════════════════════════════════ */

const Dashboard = (() => {

  function render() {
    const s = Storage.getState();
    _renderPlayerCard(s);
    _renderStats(s);
    _renderDailySummary(s);
    _renderTitles(s);
    _renderShadowAlliesMini(s);
  }

  function _renderPlayerCard(s) {
    const { player } = s;
    const rankLower = player.rank.toLowerCase();

    // Name
    const nameEl = document.getElementById('player-name-display');
    if (nameEl) nameEl.textContent = player.name.toUpperCase() || 'JUGADOR';

    // Title
    const titleEl = document.getElementById('player-title-display');
    const titleDef = Titles.getDisplayTitle(s);
    if (titleEl) titleEl.textContent = titleDef ? `${titleDef.icon} ${titleDef.name}` : '— Sin Título —';

    // Rank badge
    const rankEl = document.getElementById('player-rank-badge');
    if (rankEl) {
      rankEl.textContent = player.rank;
      rankEl.className = `player-rank-badge rank-${rankLower}`;
    }

    // Level
    const lvlEl = document.getElementById('player-level-display');
    if (lvlEl) lvlEl.textContent = player.level;

    // EXP
    const expDisplay = document.getElementById('exp-display');
    const expBar = document.getElementById('exp-bar-fill');
    const expGlow = document.getElementById('exp-bar-glow');
    const pct = Math.min(100, Math.floor((player.exp / player.expToNext) * 100));
    if (expDisplay) expDisplay.textContent = `${player.exp} / ${player.expToNext}`;
    if (expBar) expBar.style.width = pct + '%';
    if (expGlow) expGlow.style.width = pct + '%';

    // Gold & streak
    const goldEl = document.getElementById('gold-display');
    const streakEl = document.getElementById('streak-display');
    if (goldEl) goldEl.textContent = player.gold.toLocaleString();
    if (streakEl) streakEl.textContent = player.streak;
  }

  function _renderStats(s) {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const statOrder = ['STR','INT','VIT','SEN','WIL'];
    const statLabels = { STR:'Fuerza', INT:'Inteligencia', VIT:'Vitalidad', SEN:'Percepción', WIL:'Voluntad' };

    for (const key of statOrder) {
      const stat = s.stats[key];
      const pct = Math.min(100, Math.floor(stat.value / 1.5));
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div class="stat-card-accent" style="background:${stat.color}"></div>
        <div class="stat-header">
          <span class="stat-name">${key}</span>
          <span class="stat-badge" style="color:${stat.color}">${_statGrade(stat.value)}</span>
        </div>
        <div class="stat-value" style="color:${stat.color}">${stat.value}</div>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width:${pct}%;background:${stat.color}"></div>
        </div>
        <div class="stat-label-full">${statLabels[key]}</div>
      `;
      grid.appendChild(card);
    }
  }

  function _statGrade(val) {
    if (val < 20) return 'F';
    if (val < 35) return 'E';
    if (val < 50) return 'D';
    if (val < 70) return 'C';
    if (val < 90) return 'B';
    if (val < 120) return 'A';
    return 'S';
  }

  function _renderDailySummary(s) {
    const el = document.getElementById('daily-summary');
    if (!el) return;
    el.innerHTML = '';
    for (const q of s.dailyQuests) {
      const item = document.createElement('div');
      item.className = `daily-summary-item${q.completed ? ' done' : ''}`;
      item.innerHTML = `
        <div class="daily-check">${q.completed ? '✓' : ''}</div>
        <div class="daily-summary-text">${q.name}</div>
        <div class="daily-summary-exp">+${q.exp} EXP</div>
      `;
      el.appendChild(item);
    }
  }

  function _renderTitles(s) {
    const el = document.getElementById('titles-list');
    if (!el) return;
    const active = Titles.getActiveTitles(s);
    if (!active.length) {
      el.innerHTML = '<div class="title-empty">Ningún título desbloqueado aún. ¡Completa desafíos!</div>';
      return;
    }
    el.innerHTML = active.map(t => `
      <div class="title-badge ${t.color}" title="${t.desc}">
        ${t.icon} ${t.name}
      </div>
    `).join('');
  }

  function _renderShadowAlliesMini(s) {
    const el = document.getElementById('shadow-allies-mini');
    if (!el) return;
    if (!s.extractedShadows.length) {
      el.innerHTML = '<div class="shadow-empty">Ninguna sombra extraída aún. Conquista hábitos por 30 días.</div>';
      return;
    }
    el.innerHTML = s.extractedShadows.map(sh => `
      <div class="shadow-mini-card">
        <div class="shadow-mini-icon">${sh.icon}</div>
        <div class="shadow-mini-name">${sh.icon} ${sh.name.replace('Sombra: ','')}</div>
        <div class="shadow-mini-level">ALIADO</div>
      </div>
    `).join('');
  }

  return { render };
})();