'use strict';
/*
   SISTEMA // APP.JS — Main orchestrator
   Responsabilidades:
   - Boot sequence (animación de inicio)
   - Setup de primer uso (nombre del jugador)
   - Penalty gate (bloqueo si no se cumplieron misiones)
   - Navegación entre pantallas
   - Reloj en tiempo real del header
   - Reset de misiones a las 00:00
   - Inicialización de todos los módulos/componentes
 */

const App = (() => {

  // ── Variables de estado de la UI 
  let _currentScreen = 'dashboard';
  let _clockInterval = null;
  let _midnightCheckInterval = null;

  // ── Mensajes de boot del sistema 
  const BOOT_MESSAGES = [
    'Inicializando núcleo del jugador...',
    'Cargando estadísticas de atributos...',
    'Verificando misiones pendientes...',
    'Sincronizando registro de sombras...',
    'Analizando historial de rachas...',
    'Comprobando penalizaciones activas...',
    'Protocolo de nivelación activo.',
    'El Sistema te observa. Bienvenido.',
  ];

   
  //  ENTRY POINT
  
  function init() {
    _runBootSequence();
  }

  
  //  BOOT SEQUENCE
  
  function _runBootSequence() {
    const bar = document.getElementById('boot-bar');
    const msg = document.getElementById('boot-msg');
    if (!bar || !msg) { _afterBoot(); return; }

    let step = 0;
    const totalSteps = BOOT_MESSAGES.length;
    const stepDuration = 220; // ms por paso

    const advance = () => {
      if (step >= totalSteps) {
        _afterBoot();
        return;
      }
      const pct = Math.round(((step + 1) / totalSteps) * 100);
      bar.style.width = pct + '%';
      msg.textContent = BOOT_MESSAGES[step];
      step++;
      setTimeout(advance, stepDuration);
    };

    // Pequeño delay inicial para que el CSS cargue
    setTimeout(advance, 200);
  }

  
  //  POST-BOOT LOGIC
  
  function _afterBoot() {
    // Ocultar boot screen
    const bootEl = document.getElementById('system-boot');
    if (bootEl) {
      bootEl.style.transition = 'opacity 0.5s ease';
      bootEl.style.opacity = '0';
      setTimeout(() => bootEl.classList.add('hidden'), 500);
    }

    // Cargar estado
    const s = Storage.getState();

    // Primer uso: pedir nombre
    if (!s.player.setup || !s.player.name) {
      _showSetupModal();
      return;
    }

    _startApp();
  }

  
  //  SETUP MODAL (primer uso)
  
  function _showSetupModal() {
    const modal = document.getElementById('modal-setup');
    if (modal) modal.classList.remove('hidden');

    const confirmBtn = document.getElementById('setup-confirm-btn');
    const nameInput  = document.getElementById('setup-name-input');

    const confirm = () => {
      const name = nameInput?.value?.trim();
      if (!name) {
        nameInput?.focus();
        return;
      }
      Storage.update((s) => {
        s.player.name = name;
        s.player.setup = true;
      });
      modal?.classList.add('hidden');
      Notifications.systemMessage(`Jugador "${name.toUpperCase()}" registrado. Que comience la cacería.`);
      _startApp();
    };

    confirmBtn?.addEventListener('click', confirm);
    nameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirm();
    });
  }

  
  //  INICIAR APP COMPLETA
  
  function _startApp() {
    // Actualizar racha
    Player.updateStreak();

    // Verificar resets de misiones
    Quests.checkResets();
    Shadows.resetDailyChecks();

    // Inicializar módulos UI
    QuestScreen.init();
    DungeonScreen.init();
    ShadowScreen.init();

    // Mostrar app
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.classList.remove('hidden');
      appEl.style.opacity = '0';
      requestAnimationFrame(() => {
        appEl.style.transition = 'opacity 0.4s ease';
        appEl.style.opacity = '1';
      });
    }

    // Verificar penalty gate
    _checkPenaltyGate();

    // Render inicial de todas las pantallas
    _renderAll();

    // Iniciar reloj
    _startClock();

    // Iniciar verificador de medianoche
    _startMidnightChecker();

    // Configurar navegación
    _initNavigation();

    // Mensaje de bienvenida del sistema
    setTimeout(() => {
      const s = Storage.getState();
      const hour = new Date().getHours();
      let greeting;
      if (hour < 6)        greeting = 'Entrenamiento nocturno activo. El Sistema no duerme.';
      else if (hour < 12)  greeting = `Buenos días, ${s.player.name}. Las misiones te esperan.`;
      else if (hour < 18)  greeting = `Tarde productiva, ${s.player.name}. No pierdas el ritmo.`;
      else                 greeting = `Noche de progreso, ${s.player.name}. Cada rep cuenta.`;
      Notifications.systemMessage(greeting);
    }, 800);
  }

 
  //  PENALTY GATE
  
  function _checkPenaltyGate() {
    const s = Storage.getState();
    if (!s.penalty.active) return;

    const gate = document.getElementById('penalty-gate');
    const taskEl = document.getElementById('penalty-task-text');
    const btn = document.getElementById('penalty-complete-btn');

    if (taskEl) taskEl.textContent = s.penalty.task;
    if (gate)   gate.classList.remove('hidden');

    btn?.addEventListener('click', () => {
      Quests.clearPenalty();
      gate?.classList.add('hidden');
      Player.addExp(20, 'Penalización completada');
      Dashboard.render();
    }, { once: true });
  }

  
  //  RENDER GLOBAL
  
  function _renderAll() {
    Dashboard.render();
    QuestScreen.render();
    DungeonScreen.render();
    ShopScreen.render();
    ShadowScreen.render();
  }

  
  //  NAVEGACIÓN
  
  function _initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.screen;
        if (target === _currentScreen) return;
        _navigateTo(target);
      });
    });
  }

  function _navigateTo(screenName) {
    // Quitar active de nav
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === screenName);
    });

    // Ocultar pantalla actual, mostrar nueva
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const next = document.getElementById('screen-' + screenName);
    if (next) next.classList.add('active');

    _currentScreen = screenName;

    // Re-render de la pantalla activa para datos frescos
    switch (screenName) {
      case 'dashboard': Dashboard.render();   break;
      case 'quests':    QuestScreen.render(); break;
      case 'dungeon':   DungeonScreen.render(); break;
      case 'shop':      ShopScreen.render();  break;
      case 'shadows':   ShadowScreen.render(); break;
    }
  }

  
  //  RELOJ EN TIEMPO REAL
  
  function _startClock() {
    const update = () => {
      const now = new Date();
      const dateEl = document.getElementById('header-date');
      const timeEl = document.getElementById('header-time');

      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-CL', {
          weekday: 'short', day: '2-digit', month: 'short'
        }).toUpperCase();
      }

      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('es-CL', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: false
        });
      }
    };

    update();
    _clockInterval = setInterval(update, 1000);
  }

  
  //  VERIFICADOR DE MEDIANOCHE (reset automático de misiones)
  
  function _startMidnightChecker() {
    _midnightCheckInterval = setInterval(() => {
      const now = new Date();
      // Verificar si cruzamos medianoche
      if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() < 5) {
        Quests.checkResets();
        Shadows.resetDailyChecks();
        _renderAll();
        Notifications.systemMessage('00:00 — Reinicio del Sistema. Nuevas misiones disponibles.');
      }
    }, 5000); // chequeamos cada 5 segundos
  }

  // ── Expose para debugging en consola ──
  window._Sistema = { Storage, Player, Quests, Notifications };

  return { init };
})();

window._Sistema = { ...window._Sistema, App };


//  BOOTSTRAP — Esperar a que el DOM esté listo

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
