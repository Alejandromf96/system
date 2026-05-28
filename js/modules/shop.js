'use strict';
/* 
   SISTEMA // SHOP.JS — Store items, purchasing
 */

const Shop = (() => {

  const ITEMS = [
  // ── Recompensas de comida ──
    { id: 'dulce', name: 'Dulce / Snack', icon: '🍫', desc: 'Permiso para un dulce especial', price: 50,  type: 'reward'},
    { id: 'cafe_especial', name: 'Café especial', icon: '☕', desc: 'Un café de especialidad sin culpa', price: 40,  type: 'reward'},
    { id: 'comida_fuera', name: 'Comer afuera', icon: '🍜', desc: 'Una comida en restaurante aprobada', price: 150, type: 'reward'},
    { id: 'pizza', name: 'Pizza o comida favorita', icon: '🍕', desc: 'Una noche de comida sin restricciones', price: 120, type: 'reward'},
    { id: 'postre', name: 'Postre premium', icon: '🍰', desc: 'Un postre que normalmente no te permitirías', price: 80,  type: 'reward'},

    // ── Tiempo libre ──
    { id: 'gaming', name: '1h de Gaming', icon: '🎮', desc: '60 minutos de tiempo libre gaming', price: 80, type:'reward'},
    { id: 'gaming_3h', name: 'Gaming maratón (3h)', icon: '🕹️', desc: '3 horas seguidas sin culpa', price: 200, type:'reward'},
    { id: 'serie', name: '2h de Series', icon: '📺', desc: 'Maratón de series sin culpa', price: 100, type: 'reward'},
    { id: 'pelicula', name: 'Noche de película', icon: '🎬', desc: 'Una película completa cuando quieras', price: 80, type:'reward'},
    { id: 'redes', name: '1h de redes sociales', icon: '📱', desc: 'Scroll libre sin restricciones', price: 60,  type:'reward'},
    { id: 'siesta', name: 'Siesta aprobada', icon: '😴', desc: '30 min de siesta sin culpa por la tarde', price: 70, type:'reward'},

    // ── Salidas y social ──
    { id: 'salida', name: 'Salida / Plan', icon: '🌃', desc: 'Una noche libre aprobada por el Sistema', price: 200, type: 'reward'},
    { id: 'cafe_amigo', name: 'Café con amigo', icon: '👥', desc: 'Una salida social sin remordimientos', price: 100, type: 'reward'},
    { id: 'cine', name: 'Ir al cine', icon: '🎭', desc: 'Una entrada al cine ganada con sudor', price: 180, type:'reward'},

    // ── Compras personales ──
    { id: 'ropa', name: 'Prenda de ropa', icon: '👕', desc: 'Una prenda nueva que tenías en mente', price: 400, type: 'reward'},
    { id: 'libro', name: 'Comprar un libro', icon: '📖', desc: 'Un libro físico o digital que quieras', price: 150, type: 'reward'},
    { id: 'accesorio', name: 'Accesorio personal', icon: '🎧', desc: 'Algo pequeño que deseas hace tiempo', price: 350, type: 'reward'},
    { id: 'regalo', name: 'Regalo Físico grande', icon: '🎁', desc: 'Cómprate algo que deseas (moderado)', price: 500, type: 'reward'},

    // ── Descanso y recuperación ──
    { id: 'rest_day', name: 'Día de Descanso', icon: '🛋️', desc: 'Un día sin misiones físicas', price: 150, type: 'reward'},
    { id: 'spa_day', name: 'Día de autocuidado', icon: '🛁', desc: 'Rutina completa de cuidado personal', price: 180, type: 'reward'},
    { id: 'noche_libre', name: 'Noche sin alarma', icon: '🌙', desc: 'Dormir sin alarma al día siguiente', price: 120, type: 'reward'},
  ];

  const SPECIAL_ITEMS = [
    // ── Pociones de progreso ──
    { id: 'streak_potion', name: 'Poción de Racha', icon: '⚗️',  desc: 'Protege tu racha si fallas 1 día', price: 300, type: 'special', effect: 'streak_protect'},
    { id: 'exp_boost', name: 'Cristal de EXP', icon: '💠',  desc: '+200 EXP al instante', price: 400, type: 'special', effect: 'exp_boost'},
    { id: 'exp_boost_xl', name: 'Cristal de EXP XL', icon: '🔷',  desc: '+500 EXP al instante', price: 900, type: 'special', effect: 'exp_boost_xl'},
    { id: 'stat_shard', name: 'Fragmento de Stat', icon: '🔮',  desc: '+5 a un stat aleatorio', price: 250, type: 'special', effect: 'stat_shard'},
    { id: 'stat_shard_xl', name: 'Fragmento Mayor', icon: '💎',  desc: '+10 a un stat aleatorio', price: 550, type: 'special', effect: 'stat_shard_xl'},
    { id: 'stat_shard_choice', name: 'Fragmento Elegido', icon: '✨',  desc: '+5 a un stat a elección', price: 400, type: 'special', effect: 'stat_shard_choice'},

    // ── Elixires de stat específico ──
    { id: 'elixir_str', name: 'Elixir de Fuerza', icon: '🏋️',  desc: '+8 STR permanente', price: 600, type: 'special', effect: 'elixir_str'},
    { id: 'elixir_int', name: 'Elixir de Mente', icon: '🧠',  desc: '+8 INT permanente', price: 600, type: 'special', effect: 'elixir_int'},
    { id: 'elixir_vit', name: 'Elixir de Vitalidad', icon: '💚',  desc: '+8 VIT permanente', price: 600, type: 'special', effect: 'elixir_vit'},
    { id: 'elixir_wil', name: 'Elixir de Voluntad', icon: '⚡',  desc: '+8 WIL permanente', price: 600, type: 'special', effect: 'elixir_wil'},
    { id: 'elixir_sen', name: 'Elixir de Percepción', icon: '👁️',  desc: '+8 SEN permanente', price: 600, type: 'special', effect: 'elixir_sen'},

    // ── Ítems de dungeon ──
    { id: 'dungeon_key', name: 'Llave de Dungeon', icon: '🗝️',  desc: 'La próxima sesión de dungeon da el doble de EXP', price: 350, type: 'special', effect: 'dungeon_key'},
    { id: 'focus_crystal', name: 'Cristal de Enfoque', icon: '🌀',  desc: 'Ignora una penalización por salir de pestaña', price: 200, type: 'special', effect: 'focus_crystal'},

    // ── Ítems de misiones ──
    { id: 'quest_reset', name: 'Pergamino de Reset', icon: '📜',  desc: 'Reinicia una misión diaria fallida sin penalización',  price: 400, type: 'special', effect: 'quest_reset'},
    { id: 'double_gold', name: 'Amuleto de Oro', icon: '🪙',  desc: 'Las próximas 10 misiones dan el doble de gold', price: 500, type: 'special', effect: 'double_gold'},
  ];

  function getItems() { return ITEMS; }
  function getSpecialItems() { return SPECIAL_ITEMS; }

  function purchase(itemId) {
    const all = [...ITEMS, ...SPECIAL_ITEMS];
    const item = all.find(x => x.id === itemId);
    if (!item) return false;

    const spent = Player.spendGold(item.price);
    if (!spent) {
      Notifications.toast('Monedas insuficientes.', 'error', '◆ SIN FONDOS');
      return false;
    }

    // ── Efectos especiales ──
    switch (item.effect) {

      case 'exp_boost':
        Player.addExp(200, 'Cristal de EXP');
        break;

      case 'exp_boost_xl':
        Player.addExp(500, 'Cristal de EXP XL');
        break;

      case 'stat_shard': {
        const statKeys = ['STR','INT','VIT','SEN','WIL'];
        const rnd = statKeys[Math.floor(Math.random() * statKeys.length)];
        Player.modifyStat(rnd, 5);
        Notifications.toast(`+5 ${rnd}`, 'success', '🔮 Fragmento activado');
        break;
      }

      case 'stat_shard_xl': {
        const statKeys = ['STR','INT','VIT','SEN','WIL'];
        const rnd = statKeys[Math.floor(Math.random() * statKeys.length)];
        Player.modifyStat(rnd, 10);
        Notifications.toast(`+10 ${rnd}`, 'success', '💎 Fragmento Mayor activado');
        break;
      }

      case 'elixir_str':
        Player.modifyStat('STR', 8);
        Notifications.toast('+8 STR permanente', 'success', '🏋️ Elixir de Fuerza');
        break;

      case 'elixir_int':
        Player.modifyStat('INT', 8);
        Notifications.toast('+8 INT permanente', 'success', '🧠 Elixir de Mente');
        break;

      case 'elixir_vit':
        Player.modifyStat('VIT', 8);
        Notifications.toast('+8 VIT permanente', 'success', '💚 Elixir de Vitalidad');
        break;

      case 'elixir_wil':
        Player.modifyStat('WIL', 8);
        Notifications.toast('+8 WIL permanente', 'success', '⚡ Elixir de Voluntad');
        break;

      case 'elixir_sen':
        Player.modifyStat('SEN', 8);
        Notifications.toast('+8 SEN permanente', 'success', '👁️ Elixir de Percepción');
        break;

      case 'dungeon_key':
        Storage.update(s => { s.dungeon.nextSessionDouble = true; });
        Notifications.toast('Próxima sesión: doble EXP', 'gold', '🗝️ Llave activada');
        break;

      case 'focus_crystal':
        Storage.update(s => { s.dungeon.ignoreTabPenalty = true; });
        Notifications.toast('Próxima sesión: tab libre', 'gold', '🌀 Cristal activo');
        break;

      case 'double_gold':
        Storage.update(s => { s.player.doubleGoldCharges = (s.player.doubleGoldCharges || 0) + 10; });
        Notifications.toast('10 misiones con doble gold activadas', 'gold', '🪙 Amuleto de Oro');
        break;

      case 'streak_protect':
        Storage.update(s => { s.player.streakProtected = true; });
        Notifications.toast('Racha protegida para el próximo fallo', 'gold', '⚗️ Poción activada');
        break;
    }

    Storage.update((s) => {
      s.shopHistory.push({
        itemId,
        name: item.name,
        date: new Date().toISOString(),
      });
    });

    Notifications.toast(`${item.name} desbloqueado`, 'gold', `◆ -${item.price} monedas`);
    return true;
  }

  return { getItems, getSpecialItems, purchase };
})();
