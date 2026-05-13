class QuestUI {
  constructor() {
    this.open    = false;   // quest panel overlay open
    this.npcId   = null;
    this.hudOpen = false;   // mobile: left-side HUD expanded
  }

  openFor(npcId, player) {
    this.npcId = npcId;
    this.open  = true;
    if (!player.activeQuests[npcId]) this._generate(npcId, player);
  }

  close() { this.open = false; this.npcId = null; }

  _generate(npcId, player) {
    const cfg     = CONFIG.QUEST_NPC_DATA[npcId];
    const fishId  = cfg.fish[Math.floor(Math.random() * cfg.fish.length)];
    const fishCfg = CONFIG.FISH.find(f => f.id === fishId);
    const qty     = _questQty(fishCfg.difficulty);
    const reward  = Math.ceil(fishCfg.value * qty * 1.5);
    player.activeQuests[npcId] = { fishId, qty, reward, accepted: false };
    player.save();
  }

  _count(fishId, player) {
    return player.fish.filter(f => f.id === fishId).length;
  }

  _accept(npcId, player) {
    const q = player.activeQuests[npcId];
    if (!q) return;
    q.accepted = true;
    player.save();
    this.close();
  }

  _decline(npcId, player) {
    player.activeQuests[npcId] = null;
    player.save();
    this.close();
  }

  _cancel(npcId, player) {
    player.activeQuests[npcId] = null;
    player.save();
    this.close();
  }

  _claim(npcId, player) {
    const q = player.activeQuests[npcId];
    if (!q || !q.accepted) return;
    if (this._count(q.fishId, player) < q.qty) return;
    let removed = 0;
    player.fish = player.fish.filter(f => {
      if (f.id === q.fishId && removed < q.qty) { removed++; return false; }
      return true;
    });
    player.money += q.reward;
    player.activeQuests[npcId] = null;
    player.save();
    this.close();
  }

  // '!' = new/pending, '✓' = claimable, null = in-progress
  markerFor(npcId, player) {
    const q = player.activeQuests[npcId];
    if (!q || !q.accepted) return '!';
    return this._count(q.fishId, player) >= q.qty ? '✓' : null;
  }

  _activeList(player) {
    return Object.entries(player.activeQuests)
      .filter(([, q]) => q && q.accepted)
      .map(([id, q]) => ({ id, q }));
  }

  // true if any quest (other than npcId) is currently accepted
  _otherActive(npcId, player) {
    return Object.entries(player.activeQuests)
      .some(([id, q]) => id !== npcId && q && q.accepted);
  }

  handleKey(key, player) {
    if (!this.open) return false;
    if (key === 'Escape') { this.close(); return true; }
    if (key === 'e' || key === 'E') {
      const q = player.activeQuests[this.npcId];
      if (!q) { this.close(); return true; }
      if (!q.accepted && !this._otherActive(this.npcId, player)) {
        this._accept(this.npcId, player); return true;
      }
      if (q.accepted && this._count(q.fishId, player) >= q.qty) {
        this._claim(this.npcId, player); return true;
      }
      this.close(); return true;
    }
    return true;
  }

  handleTouch(p, player) {
    if (!this.open) return;
    const PX = 40, PY = 50, PW = 720, PH = 500;
    // X button
    if (Math.hypot(p.x - (PX + PW - 20), p.y - (PY + 20)) < 18) { this.close(); return; }
    const q = player.activeQuests[this.npcId];
    if (!q) return;

    if (!q.accepted) {
      // Decline button (left)
      if (p.x > PX + PW/2 - 170 && p.x < PX + PW/2 - 20 &&
          p.y > PY + PH - 106 && p.y < PY + PH - 54)
        this._decline(this.npcId, player);
      // Accept button (right) — only when no other quest is active
      if (!this._otherActive(this.npcId, player) &&
          p.x > PX + PW/2 + 20 && p.x < PX + PW/2 + 170 &&
          p.y > PY + PH - 106 && p.y < PY + PH - 54)
        this._accept(this.npcId, player);
    } else if (this._count(q.fishId, player) >= q.qty) {
      if (p.x > PX + PW/2 - 110 && p.x < PX + PW/2 + 110 &&
          p.y > PY + PH - 106 && p.y < PY + PH - 50)
        this._claim(this.npcId, player);
    } else {
      // 放棄委託按鈕
      if (p.x > PX + PW/2 - 75 && p.x < PX + PW/2 + 75 &&
          p.y > PY + PH - 106 && p.y < PY + PH - 62)
        this._cancel(this.npcId, player);
    }
  }

  // ── Panel overlay ────────────────────────────────────────────────────
  render(ctx, player) {
    if (!this.open) return;
    const npcId = this.npcId;
    const cfg   = CONFIG.QUEST_NPC_DATA[npcId];
    const q     = player.activeQuests[npcId];
    const PX = 40, PY = 50, PW = 720, PH = 500;

    ctx.fillStyle = 'rgba(8,16,36,0.97)';
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.fill();
    ctx.strokeStyle = '#2a5080'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 14); ctx.stroke();

    // Title
    ctx.fillStyle = '#ffdd88'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${cfg.name} 的委託`, PX + PW / 2, PY + 44);
    ctx.strokeStyle = 'rgba(80,130,200,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 24, PY + 58); ctx.lineTo(PX + PW - 24, PY + 58); ctx.stroke();

    if (q) {
      const fishCfg  = CONFIG.FISH.find(f => f.id === q.fishId);
      const progress = this._count(q.fishId, player);
      const done     = q.accepted && progress >= q.qty;
      const n        = Math.min(Math.round(fishCfg.difficulty), 6);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#aaddff'; ctx.font = '15px sans-serif';
      ctx.fillText('委託內容', PX + 40, PY + 96);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`釣取 ${fishCfg.name} × ${q.qty} 條`, PX + 40, PY + 126);

      ctx.fillStyle = '#ffdd55'; ctx.font = '16px sans-serif';
      ctx.fillText(`報酬：$${q.reward}`, PX + 40, PY + 166);
      ctx.fillStyle = '#556677'; ctx.font = '13px sans-serif';
      ctx.fillText(`（市場售價 $${fishCfg.value * q.qty}，多出 $${q.reward - fishCfg.value * q.qty}）`, PX + 40, PY + 186);

      ctx.fillStyle = '#ff9944'; ctx.font = '16px sans-serif';
      ctx.fillText('難度：' + '★'.repeat(n) + '☆'.repeat(6 - n), PX + 40, PY + 214);

      if (q.accepted) {
        // Progress bar
        ctx.fillStyle = done ? '#44ff88' : '#aaddff'; ctx.font = '15px sans-serif';
        ctx.fillText(`進度：${progress} / ${q.qty}`, PX + 40, PY + 258);
        const barW = PW - 80, barH = 24, barX = PX + 40, barY = PY + 270;
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
        if (progress > 0) {
          ctx.fillStyle = done ? '#44ff88' : '#3388ff';
          ctx.beginPath(); ctx.roundRect(barX, barY, Math.min(progress / q.qty, 1) * barW, barH, 6); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.stroke();

        if (done) {
          const blink = Math.floor(Date.now() / 400) % 2;
          const btnX = PX + PW/2 - 110, btnY = PY + PH - 106, btnW = 220, btnH = 52;
          ctx.fillStyle = blink ? 'rgba(30,180,80,0.90)' : 'rgba(20,140,60,0.80)';
          ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 12); ctx.fill();
          ctx.strokeStyle = '#55ffaa'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 12); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('完成任務！領取報酬', PX + PW/2, btnY + 34);
        } else {
          ctx.fillStyle = '#445566'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('繼續釣魚後回來交付', PX + PW/2, PY + PH - 122);
          // 放棄委託按鈕
          const canX = PX + PW/2 - 75, canY = PY + PH - 106, canW = 150, canH = 44;
          ctx.fillStyle = 'rgba(80,20,20,0.85)';
          ctx.beginPath(); ctx.roundRect(canX, canY, canW, canH, 10); ctx.fill();
          ctx.strokeStyle = '#aa4444'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(canX, canY, canW, canH, 10); ctx.stroke();
          ctx.fillStyle = '#ffaaaa'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('放棄委託', canX + canW/2, canY + 28);
        }
        // Close hint
        const closeHint = touch.isMobile ? '右上角 ✕ 關閉' : '[ESC] 關閉';
        ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
        ctx.fillText(closeHint, PX + PW - 16, PY + PH - 12);
      } else {
        // Not yet accepted
        const blocked = this._otherActive(npcId, player);

        // Decline button (always shown)
        const decX = PX + PW/2 - 170, decY = PY + PH - 106, decW = 150, decH = 52;
        ctx.fillStyle = 'rgba(70,40,40,0.85)';
        ctx.beginPath(); ctx.roundRect(decX, decY, decW, decH, 10); ctx.fill();
        ctx.strokeStyle = '#886666'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(decX, decY, decW, decH, 10); ctx.stroke();
        ctx.fillStyle = '#ddaaaa'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('拒絕委託', decX + decW/2, decY + 34);

        // Accept button — greyed out when blocked
        const accX = PX + PW/2 + 20, accY = PY + PH - 106, accW = 150, accH = 52;
        ctx.fillStyle = blocked ? 'rgba(40,50,60,0.75)' : 'rgba(20,110,55,0.88)';
        ctx.beginPath(); ctx.roundRect(accX, accY, accW, accH, 10); ctx.fill();
        ctx.strokeStyle = blocked ? '#445566' : '#44cc88'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(accX, accY, accW, accH, 10); ctx.stroke();
        ctx.fillStyle = blocked ? '#556677' : '#aaffcc';
        ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('接受委託', accX + accW/2, accY + 34);

        if (blocked) {
          ctx.fillStyle = '#ff8866'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('⚠ 請先完成目前的委託', PX + PW/2, PY + PH - 26);
        }

        const kHint = blocked
          ? (touch.isMobile ? '[ESC] 關閉' : '[ESC] 關閉')
          : (touch.isMobile ? '點擊按鈕選擇' : '[E] 接受  [ESC] 關閉');
        ctx.fillStyle = '#445566'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(kHint, PX + PW/2, PY + PH - 12);
      }
    }

    // X button
    ctx.fillStyle = 'rgba(80,100,130,0.55)';
    ctx.beginPath(); ctx.arc(PX + PW - 20, PY + 20, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aabbcc'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', PX + PW - 20, PY + 25);
  }

  // ── Toggle button (both platforms, always visible) ───────────────────
  renderHUDBtn(ctx, player) {
    if (touch.isMobile) return; // mobile uses touch.js button
    const list  = this._activeList(player);
    const bx = 8, by = 92, bw = 140, bh = 28;
    ctx.fillStyle = this.hudOpen ? 'rgba(20,100,180,0.82)' : 'rgba(8,20,40,0.76)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
    ctx.strokeStyle = this.hudOpen ? '#4488ff' : 'rgba(40,90,160,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.stroke();
    ctx.fillStyle = '#aaddff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('📋 進行中委託', bx + 10, by + 19);
    ctx.fillStyle = '#6699cc'; ctx.textAlign = 'right';
    ctx.fillText(this.hudOpen ? '▲' : '▼', bx + bw - 8, by + 19);
    if (list.length > 0 && !this.hudOpen) {
      ctx.fillStyle = '#ff4444';
      ctx.beginPath(); ctx.arc(bx + bw - 2, by + 2, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(list.length), bx + bw - 2, by + 6);
    }
  }

  // ── Left-side HUD (toggle on both platforms) ─────────────────────────
  renderHUD(ctx, player) {
    const list = this._activeList(player);
    if (!this.hudOpen || list.length === 0) return;

    // On desktop the toggle button occupies y=92..120, so panel starts below it
    const PX = 8, startY = touch.isMobile ? 92 : 124, W = 198, rowH = 56, headerH = 30;
    const totalH = headerH + list.length * rowH + 8;

    ctx.fillStyle = 'rgba(8,20,40,0.88)';
    ctx.beginPath(); ctx.roundRect(PX, startY, W, totalH, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(40,90,160,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(PX, startY, W, totalH, 8); ctx.stroke();

    ctx.fillStyle = '#aaddff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('📋 進行中委託', PX + 10, startY + 20);

    list.forEach(({ id, q }, i) => {
      const cfg      = CONFIG.QUEST_NPC_DATA[id];
      const fishCfg  = CONFIG.FISH.find(f => f.id === q.fishId);
      const progress = this._count(q.fishId, player);
      const done     = progress >= q.qty;
      const ry       = startY + headerH + i * rowH;

      ctx.strokeStyle = 'rgba(60,100,160,0.28)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PX + 8, ry); ctx.lineTo(PX + W - 8, ry); ctx.stroke();

      ctx.fillStyle = '#667788'; ctx.font = '11px sans-serif';
      ctx.fillText(cfg.name, PX + 10, ry + 15);

      ctx.fillStyle = done ? '#44ff88' : '#eef2ff'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${fishCfg.name}  ${progress} / ${q.qty}`, PX + 10, ry + 31);

      const bw = W - 20, bh = 5, bx = PX + 10, by = ry + 39;
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 2); ctx.fill();
      const fill = Math.min(progress / q.qty, 1) * bw;
      if (fill > 0) {
        ctx.fillStyle = done ? '#44ff88' : '#3388ff';
        ctx.beginPath(); ctx.roundRect(bx, by, fill, bh, 2); ctx.fill();
      }
    });
  }
}

function _questQty(difficulty) {
  if (difficulty < 1.5) return 15;
  if (difficulty < 2.5) return 10;
  if (difficulty < 3.5) return 7;
  if (difficulty < 4.5) return 4;
  return 2;
}
