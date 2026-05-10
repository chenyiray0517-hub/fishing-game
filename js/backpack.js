class Backpack {
  constructor() {
    this.open        = false;
    this.selectedIdx = 0;
    this.scroll      = 0;
    this.tab         = 'items'; // 'items' | 'fish'
    this.notify      = { text: '', t: 0 };
  }

  toggle() { this.open = !this.open; this.selectedIdx = 0; this.scroll = 0; }
  close()  { this.open = false; }

  _switchTab(tab) {
    if (this.tab === tab) return;
    this.tab = tab; this.selectedIdx = 0; this.scroll = 0;
  }

  _fishGroups(player) {
    const map = {};
    for (const f of player.fish) {
      if (!map[f.id]) map[f.id] = { id: f.id, name: f.name, color: f.color, sz: f.sz, count: 0, totalValue: 0, unitValue: f.value };
      map[f.id].count++;
      map[f.id].totalValue += f.value;
    }
    return Object.values(map);
  }

  _clampScroll(listLen, maxRows) {
    if (this.selectedIdx < this.scroll) this.scroll = this.selectedIdx;
    if (this.selectedIdx >= this.scroll + maxRows) this.scroll = this.selectedIdx - maxRows + 1;
    this.scroll = Math.max(0, Math.min(this.scroll, Math.max(0, listLen - maxRows)));
  }

  // ── 鍵盤操作 ────────────────────────────────────────────────────────
  handleKey(key, player) {
    const k = key.toLowerCase();
    if (key === 'Escape' || k === 'g') { this.close(); return; }

    // ← → 切換分頁
    if (key === 'ArrowLeft')  { this._switchTab('items'); return; }
    if (key === 'ArrowRight') { this._switchTab('fish');  return; }

    const list = this.tab === 'items' ? player.itemList() : this._fishGroups(player);
    if (key === 'ArrowUp')   this.selectedIdx = Math.max(0, this.selectedIdx - 1);
    if (key === 'ArrowDown') this.selectedIdx = Math.min(Math.max(0, list.length - 1), this.selectedIdx + 1);

    if (this.tab === 'items' && (key === ' ' || key === 'Enter' || k === 'e')) {
      if (list.length > 0) this._useItem(list[this.selectedIdx]?.cfg, player);
    }
  }

  // ── 觸控操作 ────────────────────────────────────────────────────────
  handleTouch(p, player) {
    const PY = 50, PH = CONFIG.H - 100;

    // 關閉按鈕
    if (p.x > CONFIG.W - 56 && p.y < 88) { this.close(); return; }

    // Tab 按鈕區
    if (p.y >= PY + 56 && p.y <= PY + 86) {
      this._switchTab(p.x < CONFIG.W / 2 ? 'items' : 'fish');
      return;
    }

    const list = this.tab === 'items' ? player.itemList() : this._fishGroups(player);
    const startY = PY + 100;
    const rowH   = 68;
    const maxRows = Math.floor((PH - 130) / rowH);

    for (let i = 0; i < Math.min(list.length - this.scroll, maxRows); i++) {
      const ry = startY + i * rowH;
      if (p.y >= ry && p.y < ry + rowH && p.x > 40 && p.x < CONFIG.W - 40) {
        const actualIdx = i + this.scroll;
        if (this.tab === 'items') {
          if (this.selectedIdx === actualIdx) this._useItem(list[actualIdx].cfg, player);
          else this.selectedIdx = actualIdx;
        } else {
          this.selectedIdx = actualIdx;
        }
        return;
      }
    }

    // 道具頁使用按鈕（底部）
    if (this.tab === 'items') {
      const items = player.itemList();
      if (items.length > 0 && p.y > CONFIG.H - 80 && p.x > CONFIG.W / 2 - 80 && p.x < CONFIG.W / 2 + 80) {
        this._useItem(items[this.selectedIdx]?.cfg, player);
      }
    }
  }

  // ── 使用道具 ────────────────────────────────────────────────────────
  _useItem(cfg, player) {
    if (!cfg) return;
    if (!player.removeItem(cfg.id)) return;

    if (cfg.type === 'unlock') {
      if (player.isUnlocked(cfg.area)) {
        player.addItem(cfg.id);
        const names = { beach: '海灘', pond: '秘密池塘', ocean2: '第二海' };
        this._notify(`${names[cfg.area] || cfg.area} 已經解鎖了！`);
        return;
      }
      player.unlockArea(cfg.area);
      const names = { beach: '海灘', pond: '秘密池塘', ocean2: '第二海' };
      this._notify(`🎉 已解鎖：${names[cfg.area] || cfg.area}！`);

    } else if (cfg.id === 'lucky_charm') {
      player.luckyCharmActive = true;
      this._notify('🍀 幸運符啟動！下次釣魚等待大幅縮短！');

    } else if (cfg.id === 'san_potion') {
      const before = player.san;
      player.san = Math.max(0, player.san - 50);
      if (player.deathTimer > 0 && player.san < 100) player.deathTimer = -1;
      player.save();
      this._notify(`💊 安神藥水！SAN ${before} → ${player.san}`);

    } else if (cfg.id === 'mystery_box') {
      const gold = 500 + Math.floor(Math.random() * 1501);
      player.money += gold;
      player.save();
      this._notify(`🎁 寶箱開啟！獲得 $${gold}！`);
    }
  }

  _notify(text) { this.notify = { text, t: 180 }; }

  // ── 渲染 ────────────────────────────────────────────────────────────
  render(ctx, player) {
    // 通知浮字（背包關閉時也顯示）
    if (this.notify.t > 0) {
      this.notify.t--;
      const a = Math.min(1, this.notify.t / 30);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffe866';
      ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.notify.text, CONFIG.W / 2, CONFIG.H / 2 - 110);
      ctx.restore();
    }

    if (!this.open) return;

    const PX = 40, PY = 50, PW = CONFIG.W - 80, PH = CONFIG.H - 100;

    // 背景遮罩
    ctx.fillStyle = 'rgba(5,10,25,0.88)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // 主面板
    ctx.fillStyle = '#0a1828';
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.fill();
    ctx.strokeStyle = '#2a5080'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.stroke();

    // 標題
    ctx.fillStyle = '#88ccff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🎒 背包', CONFIG.W / 2, PY + 36);

    // 分隔線
    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, PY + 48); ctx.lineTo(PX + PW - 20, PY + 48); ctx.stroke();

    // Tab 按鈕
    const tabW = Math.floor((PW - 44) / 2);
    const TAB_Y = PY + 56, TAB_H = 28;
    [['items','道具'], ['fish','漁獲']].forEach(([t, label], i) => {
      const tx = PX + 22 + i * (tabW + 4);
      const active = this.tab === t;
      ctx.fillStyle = active ? '#1a4a80' : 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.roundRect(tx, TAB_Y, tabW, TAB_H, 6); ctx.fill();
      ctx.strokeStyle = active ? '#4488cc' : '#1a3860'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(tx, TAB_Y, tabW, TAB_H, 6); ctx.stroke();
      ctx.fillStyle = active ? '#88ccff' : '#445566';
      ctx.font = `${active ? 'bold ' : ''}14px sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(label, tx + tabW / 2, TAB_Y + 19);
    });

    // 分隔線2
    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, PY + 92); ctx.lineTo(PX + PW - 20, PY + 92); ctx.stroke();

    // 關閉按鈕
    ctx.fillStyle = '#443322';
    ctx.beginPath(); ctx.roundRect(CONFIG.W - 76, PY + 10, 26, 26, 6); ctx.fill();
    ctx.fillStyle = '#ffaa55'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', CONFIG.W - 63, PY + 28);

    if (this.tab === 'items') this._renderItems(ctx, player, PX, PY, PW, PH);
    else                      this._renderFish(ctx, player, PX, PY, PW, PH);
  }

  // ── 道具頁 ──────────────────────────────────────────────────────────
  _renderItems(ctx, player, PX, PY, PW, PH) {
    const list    = player.itemList();
    const startY  = PY + 100;
    const rowH    = 68;
    const maxRows = Math.floor((PH - 130) / rowH);

    this.selectedIdx = Math.min(this.selectedIdx, Math.max(0, list.length - 1));

    if (list.length === 0) {
      ctx.fillStyle = '#556677'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('背包空空的…', CONFIG.W / 2, CONFIG.H / 2 + 20);
      ctx.fillStyle = '#334455'; ctx.font = '14px sans-serif';
      ctx.fillText('去釣魚，說不定會有驚喜！', CONFIG.W / 2, CONFIG.H / 2 + 50);
      return;
    }

    this._clampScroll(list.length, maxRows);
    const visible = list.slice(this.scroll, this.scroll + maxRows);

    for (let i = 0; i < visible.length; i++) {
      const { cfg, count } = visible[i];
      const actualIdx = i + this.scroll;
      const ry  = startY + i * rowH;
      const sel = actualIdx === this.selectedIdx;

      if (sel) {
        ctx.fillStyle = 'rgba(40,120,200,0.28)';
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.fill();
        ctx.strokeStyle = '#4488cc'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.stroke();
      }

      ctx.fillStyle = sel ? 'rgba(60,140,220,0.30)' : 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(PX + 22, ry + 10, 46, 46, 8); ctx.fill();
      ctx.font = '26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(cfg.icon, PX + 45, ry + 40);

      ctx.fillStyle = sel ? '#ffffff' : '#cce8ff';
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(cfg.name, PX + 80, ry + 26);
      ctx.fillStyle = sel ? '#aaccee' : '#667788';
      ctx.font = '13px sans-serif';
      ctx.fillText(cfg.desc.split('\n')[0], PX + 80, ry + 46);

      ctx.fillStyle = sel ? '#4488cc' : '#223344';
      ctx.beginPath(); ctx.roundRect(PX + PW - 72, ry + 18, 44, 28, 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`×${count}`, PX + PW - 50, ry + 37);
    }

    // 捲動箭頭
    if (this.scroll > 0) {
      ctx.fillStyle = '#4488cc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', CONFIG.W / 2, startY - 6);
    }
    if (this.scroll + maxRows < list.length) {
      ctx.fillStyle = '#4488cc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', CONFIG.W / 2, startY + maxRows * rowH + 12);
    }

    // 底部：詳情 + 使用按鈕
    const sel = list[this.selectedIdx];
    if (sel) {
      const btnY = PY + PH - 56;
      if (sel.cfg.desc.includes('\n')) {
        ctx.fillStyle = '#88aacc'; ctx.font = 'italic 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(sel.cfg.desc.split('\n')[1], CONFIG.W / 2, btnY - 12);
      }
      const alreadyUnlocked = sel.cfg.type === 'unlock' && player.isUnlocked(sel.cfg.area);
      ctx.fillStyle = alreadyUnlocked ? 'rgba(80,80,80,0.6)' : 'rgba(40,160,80,0.90)';
      ctx.beginPath(); ctx.roundRect(CONFIG.W / 2 - 80, btnY, 160, 38, 10); ctx.fill();
      ctx.strokeStyle = alreadyUnlocked ? '#445566' : '#66ffaa'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(CONFIG.W / 2 - 80, btnY, 160, 38, 10); ctx.stroke();
      const btnLabel = sel.cfg.type === 'unlock' ? '解鎖區域' : '使用道具';
      ctx.fillStyle = alreadyUnlocked ? '#445566' : '#ffffff';
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(
        alreadyUnlocked ? '已解鎖' : (touch.isMobile ? `點擊 ${btnLabel}` : `[E] ${btnLabel}`),
        CONFIG.W / 2, btnY + 24
      );
      if (!touch.isMobile) {
        ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif';
        ctx.fillText('↑↓ 選擇　E/Enter 使用　← → 切換分頁　G/ESC 關閉', CONFIG.W / 2, PY + PH - 6);
      }
    }
  }

  // ── 漁獲頁 ──────────────────────────────────────────────────────────
  _renderFish(ctx, player, PX, PY, PW, PH) {
    const groups  = this._fishGroups(player);
    const startY  = PY + 100;
    const rowH    = 68;
    const maxRows = Math.floor((PH - 130) / rowH);
    const totalValue = player.fish.reduce((s, f) => s + f.value, 0);

    this.selectedIdx = Math.min(this.selectedIdx, Math.max(0, groups.length - 1));

    if (groups.length === 0) {
      ctx.fillStyle = '#556677'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('還沒有漁獲…', CONFIG.W / 2, CONFIG.H / 2 + 20);
      ctx.fillStyle = '#334455'; ctx.font = '14px sans-serif';
      ctx.fillText('出海釣魚吧！', CONFIG.W / 2, CONFIG.H / 2 + 50);
      return;
    }

    this._clampScroll(groups.length, maxRows);
    const visible = groups.slice(this.scroll, this.scroll + maxRows);

    for (let i = 0; i < visible.length; i++) {
      const f = visible[i];
      const actualIdx = i + this.scroll;
      const ry  = startY + i * rowH;
      const sel = actualIdx === this.selectedIdx;

      if (sel) {
        ctx.fillStyle = 'rgba(40,160,120,0.25)';
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.fill();
        ctx.strokeStyle = '#44aa88'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.stroke();
      }

      // 魚圖示框
      ctx.fillStyle = sel ? 'rgba(60,180,140,0.22)' : 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(PX + 22, ry + 10, 54, 48, 8); ctx.fill();

      // 魚 sprite（帶剪裁防止溢出）
      ctx.save();
      ctx.beginPath(); ctx.rect(PX + 22, ry + 10, 54, 48); ctx.clip();
      sprites.fish(ctx, f.id, PX + 49, ry + 34, 8, f.color, 1);
      ctx.restore();

      // 名稱
      ctx.fillStyle = sel ? '#ffffff' : '#cceecc';
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(f.name, PX + 86, ry + 26);

      // 單價
      ctx.fillStyle = sel ? '#aaddbb' : '#556677';
      ctx.font = '13px sans-serif';
      ctx.fillText(`$${f.unitValue} / 隻`, PX + 86, ry + 46);

      // 數量徽章
      ctx.fillStyle = sel ? '#2a8a66' : '#1a3322';
      ctx.beginPath(); ctx.roundRect(PX + PW - 72, ry + 18, 44, 28, 6); ctx.fill();
      ctx.fillStyle = '#aaffcc'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`×${f.count}`, PX + PW - 50, ry + 37);
    }

    // 捲動箭頭
    if (this.scroll > 0) {
      ctx.fillStyle = '#44aa88'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▲', CONFIG.W / 2, startY - 6);
    }
    if (this.scroll + maxRows < groups.length) {
      ctx.fillStyle = '#44aa88'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('▼', CONFIG.W / 2, startY + maxRows * rowH + 12);
    }

    // 底部：選中魚合計 + 總計
    const btnY = PY + PH - 56;
    const selGroup = groups[this.selectedIdx];
    if (selGroup) {
      ctx.fillStyle = '#88aacc'; ctx.font = 'italic 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`共 ${selGroup.count} 隻，合計 $${selGroup.totalValue}`, CONFIG.W / 2, btnY - 12);
    }

    ctx.fillStyle = '#aaffcc'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`📦 總漁獲：${player.fish.length} 隻　／　價值 $${totalValue}`, CONFIG.W / 2, btnY + 16);

    ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(touch.isMobile ? '前往漁港販售漁獲' : '前往漁港販售　← → 切換分頁　G/ESC 關閉', CONFIG.W / 2, PY + PH - 6);
  }
}
