'use strict';
/* 
   SISTEMA // QUESTSCREEN.JS — Quest screen rendering & events
 */

const QuestScreen = (() => {

  function init() {
    // Quest tab switching
    document.querySelectorAll('.quest-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.quest-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.quest-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panelId = 'panel-' + btn.dataset.tab;
        document.getElementById(panelId)?.classList.add('active');
      });
    });

    // Migration button: merge defaults into saved state
    const migrateBtn = document.getElementById('migrate-quests-btn');
    if (migrateBtn) {
      migrateBtn.addEventListener('click', () => {
        Storage.migrateDefaults();
        Notifications.systemMessage('Sincronizando nuevas misiones...');
        render();
        Dashboard.render();
      });
    }
  }

  function render() {
    const s = Storage.getState();
    _renderDailyQuests(s);
    _renderClassMissions(s);
    _renderWeeklyRaids(s);
    _renderNegativeActions(s);
  }

  function _renderDailyQuests(s) {
    const list = document.getElementById('quest-list-daily');
    if (!list) return;
    list.innerHTML = '';

    for (const q of s.dailyQuests) {
      const card = _makeQuestCard(q, () => {
        if (!q.completed) {
          Quests.completeDailyQuest(q.id);
          render();
          Dashboard.render();
          card.classList.add('just-completed');
        }
      });
      list.appendChild(card);
    }
  }

  function _renderClassMissions(s) {
    const list = document.getElementById('quest-list-class');
    const countEl = document.getElementById('class-weekly-count');
    const barEl = document.getElementById('class-weekly-bar');
    if (!list) return;

    const weekTotal = Quests.getClassWeeklyCount();
    if (countEl) countEl.textContent = weekTotal;
    if (barEl) barEl.style.width = Math.min(100, (weekTotal/3)*100) + '%';

    list.innerHTML = '';
    for (const m of s.classMissions) {
      const card = document.createElement('div');
      card.className = 'quest-card';
      card.innerHTML = `
        <div class="quest-card-inner">
          <button class="quest-complete-btn">+</button>
          <div class="quest-info">
            <div class="quest-name">${m.name}</div>
            <div class="quest-meta">
              <span class="quest-exp">+${m.exp} EXP</span>
              <span class="quest-type-badge class">CLASE</span>
              <span class="quest-streak">×${m.completedThisWeek} esta semana</span>
            </div>
          </div>
        </div>
      `;
      card.querySelector('.quest-complete-btn').addEventListener('click', () => {
        Quests.completeClassMission(m.id);
        render();
        Dashboard.render();
      });
      list.appendChild(card);
    }
  }

  function _renderWeeklyRaids(s) {
    const list = document.getElementById('quest-list-raid');
    if (!list) return;
    list.innerHTML = '';

    for (const r of s.weeklyRaids) {
      const card = _makeQuestCard(
        { ...r, completed: r.completedThisWeek, type: 'raid' },
        () => {
          if (!r.completedThisWeek) {
            Quests.completeWeeklyRaid(r.id);
            render();
            Dashboard.render();
          }
        }
      );
      list.appendChild(card);
    }
  }

  function _renderNegativeActions(s) {
    const list = document.getElementById('quest-list-negative');
    if (!list) return;
    list.innerHTML = '';

    for (const a of s.negativeActions) {
      const card = document.createElement('div');
      card.className = 'quest-card negative';
      card.innerHTML = `
        <div class="quest-card-inner">
          <button class="quest-complete-btn" style="border-color:var(--red);color:var(--red)">!</button>
          <div class="quest-info">
            <div class="quest-name">${a.name}</div>
            <div class="quest-meta">
              <span class="quest-exp" style="color:var(--red)">-${a.expLoss} EXP</span>
              <span class="quest-type-badge negative">DEBUFF</span>
              <span class="quest-streak" style="color:var(--red)">-${a.penalty.amount} ${a.penalty.stat}${a.penalty.statB ? ` -${a.penalty.amountB} ${a.penalty.statB}` : ''}</span>
            </div>
          </div>
        </div>
      `;
      card.querySelector('.quest-complete-btn').addEventListener('click', () => {
        Quests.applyNegative(a.id);
        render();
        Dashboard.render();
        Notifications.triggerDebuff();
      });
      list.appendChild(card);
    }
  }

  function _makeQuestCard(q, onClick) {
    const card = document.createElement('div');
    card.className = `quest-card${q.completed ? ' completed' : ''}`;
    const streak = q.streakDays > 0 ? `<span class="quest-streak">🔥${q.streakDays}d</span>` : '';
    card.innerHTML = `
      <div class="quest-card-inner">
        <button class="quest-complete-btn">${q.completed ? '✓' : ''}</button>
        <div class="quest-info">
          <div class="quest-name">${q.name}</div>
          <div class="quest-meta">
            <span class="quest-exp">+${q.exp} EXP</span>
            <span class="quest-type-badge ${q.type}">${q.type.toUpperCase()}</span>
            ${streak}
          </div>
        </div>
      </div>
    `;
    card.querySelector('.quest-complete-btn').addEventListener('click', onClick);
    return card;
  }

  return { init, render };
})();
