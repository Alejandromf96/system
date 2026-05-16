'use strict';
/* ═══════════════════════════════════════════════════════════════
   SISTEMA // SHOPSCREEN.JS — Shop UI
═══════════════════════════════════════════════════════════════ */

const ShopScreen = (() => {

  function render() {
    const s = Storage.getState();
    _updateGold(s);
    _renderItems(s);
    _renderSpecialItems(s);
  }

  function _updateGold(s) {
    const el = document.getElementById('shop-gold-amount');
    if (el) el.textContent = s.player.gold.toLocaleString();
  }

  function _renderItems(s) {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const item of Shop.getItems()) {
      grid.appendChild(_makeItemCard(item, s.player.gold));
    }
  }

  function _renderSpecialItems(s) {
    const grid = document.getElementById('shop-special-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const item of Shop.getSpecialItems()) {
      grid.appendChild(_makeItemCard(item, s.player.gold));
    }
  }

  function _makeItemCard(item, gold) {
    const canAfford = gold >= item.price;
    const card = document.createElement('div');
    card.className = `shop-item${!canAfford ? ' cant-afford' : ''}`;
    card.innerHTML = `
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-desc">${item.desc}</div>
      <div class="shop-item-price"><span class="gold-icon">◆</span>${item.price}</div>
      <button class="btn-buy" ${!canAfford ? 'disabled' : ''}>COMPRAR</button>
    `;
    card.querySelector('.btn-buy').addEventListener('click', () => {
      if (Shop.purchase(item.id)) {
        render();
        Dashboard.render();
      }
    });
    return card;
  }

  return { render };
})();