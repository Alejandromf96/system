'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // SHOP.JS — Store items, purchasing
═══════════════════════════════════════════════════════════════ */

const Shop = (() => {

  const ITEMS = [
    { id: 'dulce',      name: 'Dulce / Snack',    icon: '🍫', desc: 'Permiso para un dulce especial',      price: 50,  type: 'reward' },
    { id: 'gaming',     name: '1h de Gaming',      icon: '🎮', desc: '60 minutos de tiempo libre gaming',   price: 80,  type: 'reward' },
    { id: 'serie',      name: '2h de Series',      icon: '📺', desc: 'Maratón de series sin culpa',         price: 100, type: 'reward' },
    { id: 'salida',     name: 'Salida / Plan',      icon: '🌃', desc: 'Una noche libre aprobada por el Sistema', price: 200, type: 'reward' },
    { id: 'regalo',     name: 'Regalo Físico',      icon: '🎁', desc: 'Comprate algo que deseas (moderado)', price: 500, type: 'reward' },
    { id: 'rest_day',   name: 'Día de Descanso',    icon: '😴', desc: 'Un día sin misiones físicas',         price: 150, type: 'reward' },
  ];

  const SPECIAL_ITEMS = [
    { id: 'streak_potion', name: 'Poción de Racha',  icon: '⚗️',  desc: 'Protege tu racha si fallas 1 día',    price: 300, type: 'special', effect: 'streak_protect' },
    { id: 'exp_boost',     name: 'Cristal de EXP',   icon: '💠',  desc: '+200 EXP al instante',                price: 400, type: 'special', effect: 'exp_boost'     },
    { id: 'stat_shard',    name: 'Fragmento de Stat', icon: '🔮', desc: '+5 a un stat aleatorio',              price: 250, type: 'special', effect: 'stat_shard'    },
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

    // Apply special effects
    if (item.effect === 'exp_boost') {
      Player.addExp(200, 'Cristal de EXP');
    } else if (item.effect === 'stat_shard') {
      const statKeys = ['STR','INT','VIT','SEN','WIL'];
      const rndStat = statKeys[Math.floor(Math.random() * statKeys.length)];
      Player.modifyStat(rndStat, 5);
      Notifications.toast(`+5 ${rndStat}`, 'success', '🔮 Fragmento activado');
    }

    Storage.update((s) => {
      s.shopHistory.push({ itemId, name: item.name, date: new Date().toISOString() });
    });

    Notifications.toast(`${item.name} desbloqueado`, 'gold', `◆ -${item.price} monedas`);
    return true;
  }

  return { getItems, getSpecialItems, purchase };
})();