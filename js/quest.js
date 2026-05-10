class QuestUI {
  constructor() {
    this.open  = false;
    this.npcId = null;
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
    player.activeQuests[npcId] = { fishId, qty, reward };
    player.save();
  }

  _count(fishId, player) {
    return player.fish.filter(f => f.id === fishId).length;
  }

  _claim(npcId, player) {
    const q = player.activeQuests[npcId];
    if (!q) return;
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

  // Returns the marker type for a given npcId: '!' | '✓' | null
  markerFor(npcId, player) {
    const q = player.activeQuests[npcId];
    if (!q) return '!';
    return this._count(q.fishId, player) >= q.qty ? '✓' : null;
  }

  handleKey(key, player) {
    if (!this.open) return false;
    if (key === 'Escape' || key === 'e' || key === 'E') { this.close(); return true; }
    if ((key === ' ' || key === 'Enter') && this.npcId) {
      const q = player.activeQuests[this.npcId];
      if (q && this._count(q.fishId, player) >= q.qty) this._claim(this.npcId, player);
    }
    return true;
  }

  handleTouch(p, player) {
    if (!this.open) return;
    const PX = 40, PY = 50, PW = 720, PH = 500;
    if (Math.hypot(p.x - (PX + PW - 20), p.y - (PY + 20)) < 18) { this.close(); return; }
    const q = player.activeQuests[this.npcId];
    if (!q) return;
    if (this._count(q.fishId, player) >= q.qty) {
      const btnX = PX + PW / 2 - 110, btnY = PY + PH - 100;
      if (p.x > btnX && p.x < btnX + 220 && p.y > btnY && p.y < btnY + 56)
        this._claim(this.npcId, player);
    }
  }

  render(ctx, player) {
    if (!this.open) return;
    const npcId = this.npcId;
    const cfg   = CONFIG.QUEST_NPC_DATA[npcId];
    const q     = player.activeQuests[npcId];
    const PX = 40, PY = 50, PW = 720, PH = 500;

    // Panel
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
      const done     = progress >= q.qty;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#aaddff'; ctx.font = '15px sans-serif';
      ctx.fillText('委託內容', PX + 40, PY + 95);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`釣取 ${fishCfg.name} × ${q.qty} 條`, PX + 40, PY + 126);

      ctx.fillStyle = '#ffdd55'; ctx.font = '16px sans-serif';
      ctx.fillText(`報酬：$${q.reward}`, PX + 40, PY + 168);

      const n = Math.min(Math.round(fishCfg.difficulty), 6);
      ctx.fillStyle = '#ff9944';
      ctx.fillText('難度：' + '★'.repeat(n) + '☆'.repeat(6 - n), PX + 40, PY + 198);

      ctx.fillStyle = done ? '#44ff88' : '#aaddff'; ctx.font = '15px sans-serif';
      ctx.fillText(`進度：${progress} / ${q.qty}`, PX + 40, PY + 248);

      // Progress bar
      const barW = PW - 80, barH = 24, barX = PX + 40, barY = PY + 260;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
      const fill = Math.min(progress / q.qty, 1) * barW;
      if (fill > 0) {
        ctx.fillStyle = done ? '#44ff88' : '#3388ff';
        ctx.beginPath(); ctx.roundRect(barX, barY, fill, barH, 6); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.stroke();

      if (done) {
        const blink  = Math.floor(Date.now() / 400) % 2;
        const btnX = PX + PW / 2 - 110, btnY = PY + PH - 100, btnW = 220, btnH = 56;
        ctx.fillStyle = blink ? 'rgba(30,180,80,0.90)' : 'rgba(20,140,60,0.80)';
        ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 12); ctx.fill();
        ctx.strokeStyle = '#55ffaa'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 12); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('完成任務！領取報酬', PX + PW / 2, PY + PH - 62);
      } else {
        ctx.fillStyle = '#445566'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('繼續釣魚後回來交付', PX + PW / 2, PY + PH - 62);
      }
    }

    // Close hint
    const hint = touch.isMobile ? '右上角 ✕ 關閉' : '[E / ESC] 關閉';
    ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(hint, PX + PW - 16, PY + PH - 12);

    // X button
    ctx.fillStyle = 'rgba(80,100,130,0.55)';
    ctx.beginPath(); ctx.arc(PX + PW - 20, PY + 20, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#aabbcc'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', PX + PW - 20, PY + 25);
  }
}

function _questQty(difficulty) {
  if (difficulty < 1.5) return 15;
  if (difficulty < 2.5) return 10;
  if (difficulty < 3.5) return 7;
  if (difficulty < 4.5) return 4;
  return 2;
}
