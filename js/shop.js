class ShopUI {
  constructor() {
    this.open = false;
    this.type = null;
    this.sel  = 0;
    this.scrollTop = 0;
    this.msg  = null;
    this.msgT = 0;
  }

  show(type) { this.open = true; this.type = type; this.sel = 0; this.scrollTop = 0; this.msg = null; }
  close()    { this.open = false; this.type = null; }
  notify(text, ok=true) { this.msg = { text, ok }; this.msgT = 130; }

  update() { if (this.msgT > 0) this.msgT--; }

  // Keep sel visible within the scrollable window
  _ensureVisible(total) {
    const vis = this._visCount();
    if (this.sel < this.scrollTop) this.scrollTop = this.sel;
    else if (this.sel >= this.scrollTop + vis) this.scrollTop = this.sel - vis + 1;
    this.scrollTop = Math.max(0, Math.min(this.scrollTop, Math.max(0, total - vis)));
  }

  _visCount() { return 7; }

  handleKey(key, player) {
    if (!this.open) return false;
    const items = this.items(player);
    if (key === 'Escape' || key === 'e' || key === 'E') { this.close(); return true; }
    if (key === 'ArrowUp')   { this.sel = Math.max(0, this.sel-1); this._ensureVisible(items.length); return true; }
    if (key === 'ArrowDown') { this.sel = Math.min(items.length-1, this.sel+1); this._ensureVisible(items.length); return true; }
    if (key === 'Enter') { this.act(player, items[this.sel]); return true; }
    return true;
  }

  items(player) {
    switch (this.type) {
      case 'rod':
        return CONFIG.RODS.slice(1).map((r, i) => {
          const prevRod = CONFIG.RODS[i]; // rod at absolute index i is the prerequisite
          const locked  = !player.ownedRods.includes(prevRod.id);
          return {
            label:    r.name,
            sub:      player.ownedRods.includes(r.id)
                        ? (player.equippedRod === r.id ? '[裝備中]' : '[已擁有]')
                        : locked ? '🔒' : `$${r.price}`,
            hint:     locked ? `需先購買 ${prevRod.name}` : `力道 ${r.power}  射程 ${r.lineLen}`,
            owned:    player.ownedRods.includes(r.id),
            equipped: player.equippedRod === r.id,
            locked,
            data: r,
          };
        });

      case 'bait':
        return CONFIG.BAITS.map(b => {
          const cost = b.price * b.packSize;
          return {
            label:   `${b.name} ×${b.packSize}`,
            sub:     `$${cost}`,
            hint:    `庫存: ${player.bait[b.id]||0}  品質: ${b.quality}`,
            equipped:player.equippedBait === b.id,
            data: b,
          };
        });

      case 'upgrade':
        return CONFIG.UPGRADES.map(u => {
          const lv   = player.upgrades[u.id] || 0;
          const full = lv >= u.maxLv;
          return {
            label:   u.name,
            sub:     full ? '已滿級' : `$${player.upgradeCost(u.id)}`,
            hint:    `${u.desc}  Lv${lv}/${u.maxLv}`,
            full,
            data: u,
          };
        });

      case 'market': {
        if (player.fish.length === 0) return [{ label: '目前沒有魚可賣', sub: '', hint: '', data: null }];
        const grouped = {};
        player.fish.forEach(f => { grouped[f.id] = (grouped[f.id]||0)+1; });
        const list = Object.entries(grouped).map(([id,cnt]) => {
          const f = CONFIG.FISH.find(f=>f.id===id);
          return { label: `${f.name} ×${cnt}`, sub: `$${f.value*cnt}`, hint: `單價 $${f.value}／條`, data: 'sell', fish: f };
        });
        const total = player.fish.reduce((s,f)=>s+f.value,0);
        list.push({ label: '全部賣出', sub: `共 $${total}`, hint: '', data: 'sell_all' });
        return list;
      }

      case 'energy': {
        const full = player.energyDrinks >= 3;
        return [
          {
            label: '能量飲料 🥤',
            sub:   full ? `已達上限 (${player.energyDrinks}/3)` : '$300',
            hint:  `庫存: ${player.energyDrinks}/3  飲用後 SAN -25`,
            full,
            data: { id: 'energyDrink', price: 300 },
          },
          {
            label: touch.isMobile ? '📱 點右上角 🥤 按鈕飲用' : '⌨️ 按 F 鍵飲用',
            sub: '', hint: '隨時使用，立即見效', data: null,
          },
        ];
      }

      case 'sword': {
        const buyable = CONFIG.SWORDS.filter(s => !s.craft);
        return buyable.map((s, i) => {
          const owned    = player.ownedSwords.includes(s.id);
          const equipped = player.equippedSword === s.id;
          const prev     = i > 0 ? buyable[i - 1] : null;
          const locked   = i > 0 && !player.ownedSwords.includes(prev.id);
          return {
            label:      s.name,
            sub:        owned ? (equipped ? '[裝備中]' : '[已擁有]') : locked ? '🔒' : `$${s.price}`,
            hint:       locked ? `需先購買 ${prev.name}` : `攻擊力 ${s.power}`,
            owned, equipped,
            locked,
            swatchColor: s.color,
            data: s,
          };
        });
      }

      default: return [];
    }
  }

  act(player, item) {
    if (!item?.data) return;

    if (this.type === 'rod') {
      const r = item.data;
      if (item.equipped) { this.notify('已裝備中'); return; }
      if (item.owned)    { player.equippedRod = r.id; player.save(); this.notify(`裝備 ${r.name}`); return; }
      if (item.locked)   { this.notify('需先購買前一階釣竿！', false); return; }
      if (player.money < r.price) { this.notify('金幣不足！', false); return; }
      player.money -= r.price; player.ownedRods.push(r.id); player.equippedRod = r.id;
      player.save(); this.notify(`購買 ${r.name}！`);

    } else if (this.type === 'bait') {
      const b = item.data;
      const cost = b.price * b.packSize;
      if (player.equippedBait !== b.id && player.bait[b.id] === 0) {
        player.equippedBait = b.id;
      }
      if (player.money < cost) { this.notify('金幣不足！', false); return; }
      player.money -= cost;
      player.bait[b.id] = (player.bait[b.id]||0) + b.packSize;
      player.equippedBait = b.id;
      player.save(); this.notify(`購買 ${b.name} ×${b.packSize}！`);

    } else if (this.type === 'upgrade') {
      const u = item.data;
      if (item.full) { this.notify('已達最高等級！', false); return; }
      const cost = player.upgradeCost(u.id);
      if (player.money < cost) { this.notify('金幣不足！', false); return; }
      player.money -= cost; player.upgrades[u.id]++;
      player.save(); this.notify(`${u.name} 升至 Lv${player.upgrades[u.id]}！`);

    } else if (this.type === 'energy') {
      if (item.full) { this.notify('能量飲料已達上限 (3/3)！', false); return; }
      if (player.money < 300) { this.notify('金幣不足！', false); return; }
      player.money -= 300; player.energyDrinks++;
      player.save(); this.notify(`購買能量飲料！庫存 ${player.energyDrinks}/3`);

    } else if (this.type === 'sword') {
      const s = item.data;
      if (item.equipped) { this.notify('已裝備中'); return; }
      if (item.owned)    { player.equippedSword = s.id; player.save(); this.notify(`裝備 ${s.name}`); return; }
      if (item.locked)   { this.notify('需先購買前一把劍！', false); return; }
      if (player.money < s.price) { this.notify('金幣不足！', false); return; }
      player.money -= s.price;
      player.ownedSwords.push(s.id);
      player.equippedSword = s.id;
      player.save();
      this.notify(`購買 ${s.name}！`);

    } else if (this.type === 'market') {
      if (item.data === 'sell_all') {
        const { earned, count } = player.sellAll();
        this.notify(count > 0 ? `賣出 ${count} 條魚，獲得 $${earned}！` : '沒有魚', count>0);
        this.sel = 0; this.scrollTop = 0;
      } else if (item.data === 'sell' && item.fish) {
        const id = item.fish.id;
        const count  = player.fish.filter(f => f.id === id).length;
        const earned = count * item.fish.value;
        player.fish  = player.fish.filter(f => f.id !== id);
        player.money += earned;
        player.save();
        this.notify(`賣出 ${item.fish.name} ×${count}，獲得 $${earned}！`);
        const remaining = this.items(player);
        if (this.sel >= remaining.length) this.sel = Math.max(0, remaining.length - 1);
        this.scrollTop = Math.min(this.scrollTop, Math.max(0, remaining.length - this._visCount()));
      }
    }
  }

  handleTouch(p) {
    if (!p) return;
    const W = 500, H = 520, cx = CONFIG.W/2, cy = CONFIG.H/2;
    const x = cx - W/2, y = cy - H/2;

    // Close button
    if (Math.hypot(p.x - (x + W - 22), p.y - (y + 22)) < 26) {
      this.close(); return;
    }

    const items   = this.items(game.player);
    const iH = 62, listY = y + 56;
    const vis = this._visCount();

    for (let vi = 0; vi < vis; vi++) {
      const i  = vi + this.scrollTop;
      if (i >= items.length) break;
      const iy = listY + vi * iH;
      if (p.x >= x + 8 && p.x <= x + W - 8 && p.y >= iy && p.y <= iy + iH) {
        this.sel = i;
        this.act(game.player, items[i]);
        return;
      }
    }
  }

  render(ctx, player) {
    if (!this.open) return;
    const W = 500, H = 520, cx = CONFIG.W/2, cy = CONFIG.H/2;
    const x = cx - W/2, y = cy - H/2;

    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    ctx.fillStyle = '#131e2c';
    ctx.strokeStyle = '#3a6aaa';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, W, H, 12); ctx.fill(); ctx.stroke();

    const titles = { rod:'釣竿商店', bait:'魚餌商店', upgrade:'升級商店', market:'魚市場', energy:'能量飲料販售', sword:'⚔️ 武器商人' };
    ctx.fillStyle = '#88ccff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(titles[this.type]||'', cx, y+34);

    // Close button
    ctx.fillStyle = 'rgba(180,60,50,0.75)';
    ctx.beginPath(); ctx.arc(x + W - 22, y + 22, 16, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', x + W - 22, y + 27);

    ctx.strokeStyle = '#2a4a7a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x+20, y+46); ctx.lineTo(x+W-20, y+46); ctx.stroke();

    const items  = this.items(player);
    const iH = 62, listY = y + 56;
    const vis    = this._visCount();
    const startI = this.scrollTop;
    const endI   = Math.min(items.length, startI + vis);

    // Scroll up indicator
    if (startI > 0) {
      ctx.fillStyle = 'rgba(100,160,255,0.65)';
      ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', cx, listY - 8);
    }

    for (let vi = 0; vi < endI - startI; vi++) {
      const i  = vi + startI;
      const item = items[i];
      const iy = listY + vi * iH;

      if (i === this.sel) {
        ctx.fillStyle = 'rgba(58,106,170,0.35)';
        ctx.fillRect(x+8, iy+2, W-16, iH-4);
      }

      const locked = !!item.locked;

      // Sword sprite icon on the left edge
      if (item.swatchColor) {
        sprites.sword_icon(ctx, item.data.id, x + 14, iy + 31);
      }
      const textX = item.swatchColor ? x + 28 : x + 22;

      ctx.textAlign = 'left';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = item.equipped ? '#ffd700'
                    : item.owned    ? '#88ff88'
                    : item.craft    ? '#7a6a8a'
                    : item.full     ? '#888'
                    : locked        ? '#777799'
                    : '#ddeeff';
      ctx.fillText(item.label, textX, iy + 22);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = locked ? '#556677' : '#8899aa';
      if (item.hint) ctx.fillText(item.hint, textX, iy + 40);

      ctx.textAlign = 'right';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = item.craft  ? '#7a6a8a'
                    : item.full   ? '#666'
                    : locked      ? '#666699'
                    : '#ffdd55';
      ctx.fillText(item.sub, x + W - 18, iy + 24);
    }

    // Scroll down indicator
    if (endI < items.length) {
      ctx.fillStyle = 'rgba(100,160,255,0.65)';
      ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', cx, listY + (endI - startI) * iH + 14);
    }

    const hint = touch.isMobile ? '點擊品項購買／賣出  ✕ 關閉' : '↑↓ 選擇  Enter 確認  E / ESC 關閉';
    ctx.textAlign = 'center'; ctx.font = '13px sans-serif'; ctx.fillStyle = '#445566';
    ctx.fillText(hint, cx, y+H-10);

    if (this.msgT > 0) {
      const alpha = Math.min(1, this.msgT/30);
      ctx.fillStyle = `rgba(${this.msg.ok?'80,220,100':'220,80,60'},${alpha})`;
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.msg.text, cx, y-14);
    }
  }
}
