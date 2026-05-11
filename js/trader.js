class TraderUI {
  constructor() {
    this.open = false;
    this.tab  = 0;   // 0=賣道具  1=兌換材料  2=鍛造武器
    this.sel  = 0;
    this.qty  = 1;
    this.scrollTop = 0;
    this.msg  = null;
    this.msgT = 0;
  }

  show()  { this.open = true; this.tab = 0; this.sel = 0; this.qty = 1; this.scrollTop = 0; this.msg = null; }
  close() { this.open = false; }
  notify(text, ok = true) { this.msg = { text, ok }; this.msgT = 140; }
  update() { if (this.msgT > 0) this.msgT--; }
  _visCount() { return 6; }

  // ── item builders ──────────────────────────────────────────────────
  _sellItems(player) {
    return player.itemList().map(({ cfg, count }) => ({
      cfg, count, coinPer: cfg.type === 'unlock' ? 10 : 5,
    }));
  }

  _exchangeList() {
    return [
      { id: 'netherstone', name: '獄髓',    cost: 40, icon: '💎' },
      { id: 'myth_gem',    name: '神話寶石', cost: 80, icon: '💠' },
    ];
  }

  _craftList() {
    return [
      { swordId: 'nether', name: '獄髓劍', mat: 'netherstone', matName: '獄髓',    matQty: 10, power: 320 },
      { swordId: 'myth',   name: '神話劍', mat: 'myth_gem',    matName: '神話寶石', matQty: 10, power: 500 },
    ];
  }

  _currentItems(player) {
    if (this.tab === 0) return this._sellItems(player);
    if (this.tab === 1) return this._exchangeList();
    return this._craftList();
  }

  // ── navigation ─────────────────────────────────────────────────────
  _ensureVisible(total) {
    const vis = this._visCount();
    if (this.sel < this.scrollTop) this.scrollTop = this.sel;
    else if (this.sel >= this.scrollTop + vis) this.scrollTop = this.sel - vis + 1;
    this.scrollTop = Math.max(0, Math.min(this.scrollTop, Math.max(0, total - vis)));
  }

  handleKey(key, player) {
    if (!this.open) return false;
    if (key === 'Escape' || key === 'e' || key === 'E') { this.close(); return true; }

    // Tab switch (1/2/3 won't leak to game.js because we return true)
    if (key === '1') { this.tab = 0; this.sel = 0; this.qty = 1; this.scrollTop = 0; return true; }
    if (key === '2') { this.tab = 1; this.sel = 0; this.qty = 1; this.scrollTop = 0; return true; }
    if (key === '3') { this.tab = 2; this.sel = 0; this.qty = 1; this.scrollTop = 0; return true; }

    const items = this._currentItems(player);
    if (key === 'ArrowUp')   { this.sel = Math.max(0, this.sel - 1); this.qty = 1; this._ensureVisible(items.length); return true; }
    if (key === 'ArrowDown') { this.sel = Math.min(items.length - 1, this.sel + 1); this.qty = 1; this._ensureVisible(items.length); return true; }

    if (key === 'ArrowLeft') {
      this.qty = Math.max(1, this.qty - 1);
      return true;
    }
    if (key === 'ArrowRight') {
      const item = items[this.sel];
      if (this.tab === 0 && item) this.qty = Math.min(item.count, this.qty + 1);
      else if (this.tab === 1)    this.qty = Math.min(99, this.qty + 1);
      return true;
    }
    if (key === 'Enter') { this.act(player, items[this.sel]); return true; }
    return true;
  }

  // ── actions ────────────────────────────────────────────────────────
  act(player, item) {
    if (!item) return;

    if (this.tab === 0) {
      const qty = Math.min(this.qty, player.itemCount(item.cfg.id));
      if (qty <= 0) { this.notify('沒有道具可賣！', false); return; }
      for (let i = 0; i < qty; i++) player.removeItem(item.cfg.id);
      player.specialCoins += qty * item.coinPer;
      player.save();
      this.notify(`賣出 ${item.cfg.name} ×${qty}，獲得 ${qty * item.coinPer} 特殊幣！`);
      this.qty = 1;
      const rem = this._sellItems(player);
      if (this.sel >= rem.length) this.sel = Math.max(0, rem.length - 1);

    } else if (this.tab === 1) {
      const cost = item.cost * this.qty;
      if (player.specialCoins < cost) { this.notify(`特殊幣不足！需要 ${cost}`, false); return; }
      player.specialCoins -= cost;
      player.craftMaterials[item.id] = (player.craftMaterials[item.id] || 0) + this.qty;
      player.save();
      this.notify(`兌換 ${item.name} ×${this.qty}！`);
      this.qty = 1;

    } else if (this.tab === 2) {
      if (player.ownedSwords.includes(item.swordId)) { this.notify('已擁有此武器！', false); return; }
      const have = player.craftMaterials[item.mat] || 0;
      if (have < item.matQty) { this.notify(`${item.matName} 不足！(${have}/${item.matQty})`, false); return; }
      player.craftMaterials[item.mat] -= item.matQty;
      player.ownedSwords.push(item.swordId);
      player.equippedSword = item.swordId;
      player.save();
      this.notify(`🎉 ${item.name} 鍛造成功！`);
    }
  }

  // ── touch ──────────────────────────────────────────────────────────
  handleTouch(p, player) {
    if (!p) return;
    const W = 540, H = 480, cx = CONFIG.W / 2, cy = CONFIG.H / 2;
    const x = cx - W / 2, y = cy - H / 2;

    if (Math.hypot(p.x - (x + W - 22), p.y - (y + 22)) < 26) { this.close(); return; }

    const tabW = W / 3;
    if (p.y >= y + 50 && p.y <= y + 74) {
      const ti = Math.floor((p.x - x) / tabW);
      if (ti >= 0 && ti < 3) { this.tab = ti; this.sel = 0; this.qty = 1; this.scrollTop = 0; return; }
    }

    const items = this._currentItems(player);
    const iH = 62, listY = y + 78;
    const vis = this._visCount();

    for (let vi = 0; vi < vis; vi++) {
      const i = vi + this.scrollTop;
      if (i >= items.length) break;
      const iy = listY + vi * iH;
      if (p.y < iy || p.y > iy + iH || p.x < x + 8 || p.x > x + W - 8) continue;

      this.sel = i;

      if (this.tab === 0 || this.tab === 1) {
        const minusX = x + W - 110, plusX = x + W - 50;
        const midY = iy + iH / 2;
        if (Math.hypot(p.x - minusX, p.y - midY) < 16) { this.qty = Math.max(1, this.qty - 1); return; }
        if (Math.hypot(p.x - plusX,  p.y - midY) < 16) {
          if (this.tab === 0) this.qty = Math.min(items[i]?.count || 1, this.qty + 1);
          else                this.qty = Math.min(99, this.qty + 1);
          return;
        }
      }

      this.act(player, items[i]);
      return;
    }
  }

  // ── render ─────────────────────────────────────────────────────────
  render(ctx, player) {
    if (!this.open) return;
    const W = 540, H = 480, cx = CONFIG.W / 2, cy = CONFIG.H / 2;
    const x = cx - W / 2, y = cy - H / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    ctx.fillStyle = '#0d1020';
    ctx.strokeStyle = '#8833cc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, W, H, 12); ctx.fill(); ctx.stroke();

    ctx.shadowColor = '#6611aa'; ctx.shadowBlur = 12;
    ctx.strokeStyle = '#aa55ff'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(x + 2, y + 2, W - 4, H - 4, 11); ctx.stroke();
    ctx.shadowBlur = 0;

    // Title
    ctx.fillStyle = '#cc88ff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('神秘商人', cx, y + 26);

    // Stats row
    const ns = player.craftMaterials?.netherstone || 0;
    const mg = player.craftMaterials?.myth_gem || 0;
    ctx.fillStyle = '#ffdd88'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`💰 特殊幣: ${player.specialCoins}   💎 獄髓 ×${ns}   💠 神話寶石 ×${mg}`, cx, y + 42);

    // Close button
    ctx.fillStyle = 'rgba(180,60,50,0.75)';
    ctx.beginPath(); ctx.arc(x + W - 22, y + 22, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', x + W - 22, y + 27);

    // Tabs
    const tabLabels = ['賣道具', '兌換材料', '鍛造武器'];
    const tabW = W / 3;
    for (let t = 0; t < 3; t++) {
      const tx = x + t * tabW;
      ctx.fillStyle = this.tab === t ? 'rgba(136,51,204,0.42)' : 'rgba(255,255,255,0.04)';
      ctx.fillRect(tx, y + 50, tabW, 24);
      ctx.strokeStyle = this.tab === t ? '#aa55ff' : '#2a1a3a';
      ctx.lineWidth = 1; ctx.strokeRect(tx, y + 50, tabW, 24);
      ctx.fillStyle = this.tab === t ? '#cc88ff' : '#7766aa';
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(tabLabels[t], tx + tabW / 2, y + 66);
    }

    ctx.strokeStyle = '#2a1a3a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 10, y + 74); ctx.lineTo(x + W - 10, y + 74); ctx.stroke();

    // Item list
    const items = this._currentItems(player);
    const iH = 62, listY = y + 78;
    const vis = this._visCount();
    const startI = this.scrollTop;
    const endI   = Math.min(items.length, startI + vis);

    if (items.length === 0) {
      ctx.fillStyle = '#556677'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.tab === 0 ? '背包中沒有道具可賣' : '', cx, listY + 40);
    }

    if (startI > 0) {
      ctx.fillStyle = 'rgba(136,51,204,0.7)';
      ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', cx, listY - 6);
    }

    for (let vi = 0; vi < endI - startI; vi++) {
      const i = vi + startI;
      const item = items[i];
      const iy = listY + vi * iH;
      const isSel = i === this.sel;

      if (isSel) {
        ctx.fillStyle = 'rgba(136,51,204,0.22)';
        ctx.fillRect(x + 8, iy + 2, W - 16, iH - 4);
      }

      if (this.tab === 0) {
        const { cfg, count, coinPer } = item;
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#ddeeff';
        ctx.fillText(`${cfg.icon} ${cfg.name}`, x + 16, iy + 22);
        ctx.font = '12px sans-serif'; ctx.fillStyle = '#8899aa';
        ctx.fillText(`庫存: ${count}  每個 ${coinPer} 幣`, x + 16, iy + 40);
        if (isSel) {
          const qty = Math.min(this.qty, count);
          this._drawQtyControls(ctx, x, W, iy, iH, qty, qty * coinPer, '幣');
        } else {
          ctx.textAlign = 'right'; ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#ffdd55';
          ctx.fillText(`${coinPer} 幣/個`, x + W - 18, iy + 22);
        }

      } else if (this.tab === 1) {
        const { id, name, cost, icon } = item;
        const have = player.craftMaterials?.[id] || 0;
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#ddeeff';
        ctx.fillText(`${icon} ${name}`, x + 16, iy + 22);
        ctx.font = '12px sans-serif'; ctx.fillStyle = '#8899aa';
        ctx.fillText(`庫存: ${have}  每個 ${cost} 幣`, x + 16, iy + 40);
        if (isSel) {
          const total = cost * this.qty;
          this._drawQtyControls(ctx, x, W, iy, iH, this.qty, total, '幣', player.specialCoins < total);
        } else {
          ctx.textAlign = 'right'; ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#ffdd55';
          ctx.fillText(`${cost} 幣/個`, x + W - 18, iy + 22);
        }

      } else {
        const { swordId, name, mat, matName, matQty, power } = item;
        const have = player.craftMaterials?.[mat] || 0;
        const owned = player.ownedSwords.includes(swordId);
        const canCraft = !owned && have >= matQty;
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = owned ? '#88ff88' : canCraft ? '#ffd700' : '#aa8888';
        ctx.fillText(`⚔️ ${name}`, x + 16, iy + 22);
        ctx.font = '12px sans-serif'; ctx.fillStyle = '#8899aa';
        ctx.fillText(
          owned ? '已擁有此武器' : `需 ${matName} ×${matQty}（擁有 ${have}）  攻擊力 ${power}`,
          x + 16, iy + 40
        );
        ctx.textAlign = 'right'; ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = owned ? '#44ff88' : canCraft ? '#ffdd55' : '#ff5544';
        ctx.fillText(owned ? '已擁有' : canCraft ? '可鍛造 [Enter]' : '材料不足', x + W - 18, iy + 24);
      }
    }

    if (endI < items.length) {
      ctx.fillStyle = 'rgba(136,51,204,0.7)';
      ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', cx, listY + (endI - startI) * iH + 14);
    }

    const hint = touch.isMobile
      ? '點選品項確認  −/+ 調整數量  ✕ 關閉'
      : '↑↓選擇  ←→數量  Enter確認  1/2/3換頁  E/ESC關閉';
    ctx.textAlign = 'center'; ctx.font = '12px sans-serif'; ctx.fillStyle = '#445566';
    ctx.fillText(hint, cx, y + H - 10);

    if (this.msgT > 0) {
      const alpha = Math.min(1, this.msgT / 30);
      ctx.fillStyle = `rgba(${this.msg.ok ? '80,220,100' : '220,80,60'},${alpha})`;
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.msg.text, cx, y - 14);
    }
  }

  _drawQtyControls(ctx, panelX, panelW, iy, iH, qty, total, unit, warn = false) {
    const midY  = iy + iH / 2;
    const minusX = panelX + panelW - 110;
    const plusX  = panelX + panelW - 50;

    ctx.fillStyle = 'rgba(100,60,160,0.88)';
    ctx.beginPath(); ctx.arc(minusX, midY, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('−', minusX, midY + 5);

    ctx.fillStyle = '#ffdd88'; ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`×${qty}`, panelX + panelW - 80, midY + 5);

    ctx.fillStyle = 'rgba(100,60,160,0.88)';
    ctx.beginPath(); ctx.arc(plusX, midY, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif';
    ctx.fillText('+', plusX, midY + 5);

    ctx.textAlign = 'right'; ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = warn ? '#ff6644' : '#ffdd55';
    ctx.fillText(`${total} ${unit}`, panelX + panelW - 18, iy + 22);
  }
}
