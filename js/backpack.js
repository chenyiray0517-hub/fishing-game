class Backpack {
  constructor() {
    this.open        = false;
    this.selectedIdx = 0;
    this.notify      = { text: '', t: 0 };
  }

  toggle() { this.open = !this.open; this.selectedIdx = 0; }
  close()  { this.open = false; }

  // ── 鍵盤操作 ────────────────────────────────────────────────────────
  handleKey(key, player) {
    const list = player.itemList();
    const k = key.toLowerCase();

    if (key === 'Escape' || k === 'g') { this.close(); return; }

    if (key === 'ArrowUp')   this.selectedIdx = Math.max(0, this.selectedIdx - 1);
    if (key === 'ArrowDown') this.selectedIdx = Math.min(list.length - 1, this.selectedIdx + 1);

    if (key === ' ' || key === 'Enter' || k === 'e') {
      if (list.length > 0) this._useItem(list[this.selectedIdx]?.cfg, player);
    }
  }

  // ── 觸控操作 ────────────────────────────────────────────────────────
  handleTouch(p, player) {
    const list = player.itemList();

    // 關閉按鈕
    if (p.x > CONFIG.W - 56 && p.y < 88) { this.close(); return; }

    // 道具列表點擊
    const startY = 130;
    const rowH   = 70;
    for (let i = 0; i < list.length; i++) {
      const ry = startY + i * rowH;
      if (p.y >= ry && p.y < ry + rowH && p.x > 40 && p.x < CONFIG.W - 40) {
        if (this.selectedIdx === i) {
          this._useItem(list[i].cfg, player);
        } else {
          this.selectedIdx = i;
        }
        return;
      }
    }

    // 使用按鈕區域（底部）
    if (list.length > 0 && p.y > CONFIG.H - 80 && p.x > CONFIG.W / 2 - 80 && p.x < CONFIG.W / 2 + 80) {
      this._useItem(list[this.selectedIdx]?.cfg, player);
    }
  }

  // ── 使用道具 ────────────────────────────────────────────────────────
  _useItem(cfg, player) {
    if (!cfg) return;
    if (!player.removeItem(cfg.id)) return;

    if (cfg.type === 'unlock') {
      if (player.isUnlocked(cfg.area)) {
        player.addItem(cfg.id); // 退回（已解鎖）
        this._notify(`${cfg.area === 'beach' ? '海灘' : '秘密池塘'} 已經解鎖了！`);
        return;
      }
      player.unlockArea(cfg.area);
      const areaName = cfg.area === 'beach' ? '海灘' : '秘密池塘';
      this._notify(`🎉 已解鎖：${areaName}！`);

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
    // 通知浮字（不需要開啟背包也能顯示）
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

    const list = player.itemList();

    // ── 背景遮罩 ────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(5,10,25,0.88)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // ── 主面板 ──────────────────────────────────────────────────────
    const PX = 40, PY = 50, PW = CONFIG.W - 80, PH = CONFIG.H - 100;
    ctx.fillStyle = '#0a1828';
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.fill();
    ctx.strokeStyle = '#2a5080'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.stroke();

    // 標題
    ctx.fillStyle = '#88ccff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🎒 背包', CONFIG.W / 2, PY + 36);
    ctx.strokeStyle = '#1a3860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, PY + 50); ctx.lineTo(PX + PW - 20, PY + 50); ctx.stroke();

    // 關閉按鈕
    ctx.fillStyle = '#443322';
    ctx.beginPath(); ctx.roundRect(CONFIG.W - 76, PY + 10, 26, 26, 6); ctx.fill();
    ctx.fillStyle = '#ffaa55'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', CONFIG.W - 63, PY + 28);

    // 空背包提示
    if (list.length === 0) {
      ctx.fillStyle = '#556677'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('背包空空的…', CONFIG.W / 2, CONFIG.H / 2);
      ctx.fillStyle = '#334455'; ctx.font = '14px sans-serif';
      ctx.fillText('去釣魚，說不定會有驚喜！', CONFIG.W / 2, CONFIG.H / 2 + 30);
      return;
    }

    // ── 道具列表 ────────────────────────────────────────────────────
    const startY = PY + 68;
    const rowH   = 68;
    const maxRows = Math.floor((PH - 120) / rowH);

    for (let i = 0; i < Math.min(list.length, maxRows); i++) {
      const { cfg, count } = list[i];
      const ry  = startY + i * rowH;
      const sel = i === this.selectedIdx;

      // 行背景
      if (sel) {
        ctx.fillStyle = 'rgba(40,120,200,0.28)';
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.fill();
        ctx.strokeStyle = '#4488cc'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(PX + 14, ry + 2, PW - 28, rowH - 4, 8); ctx.stroke();
      }

      // 圖示背景
      ctx.fillStyle = sel ? 'rgba(60,140,220,0.30)' : 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(PX + 22, ry + 10, 46, 46, 8); ctx.fill();
      ctx.font = '26px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(cfg.icon, PX + 45, ry + 40);

      // 名稱與描述
      ctx.fillStyle = sel ? '#ffffff' : '#cce8ff';
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(cfg.name, PX + 80, ry + 26);

      const descLine = cfg.desc.split('\n')[0];
      ctx.fillStyle = sel ? '#aaccee' : '#667788';
      ctx.font = '13px sans-serif';
      ctx.fillText(descLine, PX + 80, ry + 46);

      // 數量徽章
      ctx.fillStyle = sel ? '#4488cc' : '#223344';
      ctx.beginPath(); ctx.roundRect(PX + PW - 72, ry + 18, 44, 28, 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`×${count}`, PX + PW - 50, ry + 37);
    }

    // ── 選中道具詳情 + 使用按鈕 ─────────────────────────────────────
    const sel = list[this.selectedIdx];
    if (sel) {
      const btnY = PY + PH - 56;

      // 描述（完整第二行）
      if (sel.cfg.desc.includes('\n')) {
        const line2 = sel.cfg.desc.split('\n')[1];
        ctx.fillStyle = '#88aacc'; ctx.font = 'italic 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(line2, CONFIG.W / 2, btnY - 12);
      }

      // 使用按鈕
      const btnLabel = sel.cfg.type === 'unlock' ? '解鎖區域' : '使用道具';
      const isLocked = sel.cfg.type === 'unlock' && !player.isUnlocked(sel.cfg.area);
      const btnColor = isLocked || sel.cfg.type === 'consume'
        ? 'rgba(40,160,80,0.90)' : 'rgba(80,80,80,0.80)';
      const alreadyUnlocked = sel.cfg.type === 'unlock' && player.isUnlocked(sel.cfg.area);

      ctx.fillStyle = alreadyUnlocked ? 'rgba(80,80,80,0.6)' : btnColor;
      ctx.beginPath(); ctx.roundRect(CONFIG.W / 2 - 80, btnY, 160, 38, 10); ctx.fill();
      ctx.strokeStyle = alreadyUnlocked ? '#445566' : '#66ffaa'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(CONFIG.W / 2 - 80, btnY, 160, 38, 10); ctx.stroke();

      ctx.fillStyle = alreadyUnlocked ? '#445566' : '#ffffff';
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(
        alreadyUnlocked ? '已解鎖' : (touch.isMobile ? `點擊 ${btnLabel}` : `[E] ${btnLabel}`),
        CONFIG.W / 2, btnY + 24
      );

      // 操作提示（桌面）
      if (!touch.isMobile) {
        ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif';
        ctx.fillText('↑↓ 選擇　E/Enter 使用　G/ESC 關閉', CONFIG.W / 2, PY + PH - 6);
      }
    }
  }
}
