class Ocean2Scene {
  constructor() {
    this.fishing  = new FishingGame();
    this.waveOff  = 0;
    this.bobT     = 0;
    this.monsterMgr = new MonsterManager('drowned_ocean2');
    // 生物發光粒子
    this.glows = Array.from({ length: 40 }, () => ({
      x: Math.random() * CONFIG.W,
      y: Math.random() * CONFIG.H,
      r: Math.random() * 1.2 + 0.4,
      phase: Math.random() * Math.PI * 2,
      col: Math.random() < 0.5 ? [0,200,255] : [80,255,180],
    }));
  }

  nearbySpot(player) {
    for (const s of CONFIG.OCEAN2_SPOTS) {
      if (Math.hypot(player.bx - s.x, player.by - s.y) < s.r + 36) return s;
    }
    return null;
  }

  update(keys, spaceDown, player) {
    this.waveOff += 0.012;
    this.bobT    += 0.04;
    this.monsterMgr.update(player.bx, player.by);

    if (this.fishing.state) {
      this.fishing.update(keys, spaceDown, player);
      return;
    }

    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx = -1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx =  1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy = -1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy =  1;
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }

    const spd = CONFIG.BOAT_SPEED, mg = 44;
    player.bx = Math.max(mg, Math.min(CONFIG.W - mg, player.bx + dx * spd));
    player.by = Math.max(mg, Math.min(CONFIG.H - mg, player.by + dy * spd));
  }

  tryFish(player) {
    if (this.fishing.state) return;
    const s = this.nearbySpot(player);
    if (!s) return;
    if (player.baitCount <= 0) return;
    this.fishing.start(s, player);
  }

  render(ctx, player) {
    // ── 深邃海底漸層（深紫+深藍） ────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, 0, CONFIG.H);
    bg.addColorStop(0, '#050818'); bg.addColorStop(0.5, '#0a0d28'); bg.addColorStop(1, '#060c20');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // ── 生物發光粒子 ─────────────────────────────────────────────────
    const t = Date.now() / 1000;
    for (const g of this.glows) {
      g.phase += 0.012;
      const a = (Math.sin(g.phase) + 1) / 2;
      const [r, gr, b] = g.col;
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 5);
      grd.addColorStop(0, `rgba(${r},${gr},${b},${(0.4 + a * 0.5).toFixed(2)})`);
      grd.addColorStop(1, `rgba(${r},${gr},${b},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${r},${gr},${b},${(0.6 + a * 0.4).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill();
      // 緩慢漂移
      g.x += Math.cos(g.phase * 0.3) * 0.35;
      g.y += Math.sin(g.phase * 0.25) * 0.28;
      if (g.x < 0) g.x = CONFIG.W; if (g.x > CONFIG.W) g.x = 0;
      if (g.y < 0) g.y = CONFIG.H; if (g.y > CONFIG.H) g.y = 0;
    }

    // ── 深海波流（更慢、更幽暗） ─────────────────────────────────────
    for (let w = 0; w < 8; w++) {
      const alpha = 0.04 + w * 0.01;
      ctx.strokeStyle = `rgba(60,100,180,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= CONFIG.W; x += 16) {
        const wy = (w * 80 + this.waveOff * 14) % CONFIG.H + Math.sin(x / 90 + this.waveOff * 0.8 + w * 0.5) * 9;
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // ── 海底地形（遠景暗影） ─────────────────────────────────────────
    ctx.fillStyle = 'rgba(10,8,30,0.55)';
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.H);
    const peaks = [0,80,140,220,290,370,450,520,600,680,730,800];
    const heights = [520,490,530,475,510,488,525,470,512,495,518,520];
    for (let i = 0; i < peaks.length; i++) ctx.lineTo(peaks[i], heights[i]);
    ctx.lineTo(CONFIG.W, CONFIG.H); ctx.closePath(); ctx.fill();

    // ── 釣魚點 ──────────────────────────────────────────────────────
    for (const s of CONFIG.OCEAN2_SPOTS) {
      // 三色光環
      for (let ring = 0; ring < 3; ring++) {
        const phase = (t * 0.5 + ring * 0.33) % 1;
        const r2 = s.r * (0.4 + phase * 0.9), alpha = (1 - phase) * 0.55;
        ctx.strokeStyle = `rgba(80,160,255,${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, r2, 0, Math.PI * 2); ctx.stroke();
      }
      // 中心光暈
      const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      glow.addColorStop(0, 'rgba(60,140,255,0.22)');
      glow.addColorStop(1, 'rgba(60,140,255,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      // 名稱
      ctx.fillStyle = 'rgba(140,200,255,0.80)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y - s.r - 8);
    }

    // ── 互動提示 ────────────────────────────────────────────────────
    if (!this.fishing.state) {
      const ns = this.nearbySpot(player);
      touch.clearInteractRect();
      if (ns) {
        const hasBait = player.baitCount > 0;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.beginPath(); ctx.roundRect(player.bx - 52, player.by - 72, 104, 28, 6); ctx.fill();
        ctx.fillStyle = hasBait ? '#88ffcc' : '#ff6644';
        ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(hasBait ? (touch.isMobile ? '點右下按鈕釣魚' : '[E] 開始釣魚') : '魚餌不足！', player.bx, player.by - 53);
      }
    }

    this._renderBoat(ctx, player);
    game.daynight.applyOverlay(ctx);
    this.monsterMgr.render(ctx);
    this.fishing.render(ctx);
    this._renderHUD(ctx, player);
  }

  _renderBoat(ctx, p) {
    const bob = Math.sin(this.bobT) * 2.5;
    ctx.save();
    ctx.translate(p.bx, p.by + bob);

    // 影子
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, 9, 36, 8, 0, 0, Math.PI * 2); ctx.fill();

    // 船身（深色調）
    ctx.fillStyle = '#2a3a5a';
    ctx.beginPath();
    ctx.moveTo(-33, -10); ctx.lineTo(33, -10);
    ctx.lineTo(27, 12); ctx.lineTo(-27, 12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1a2840'; ctx.lineWidth = 2; ctx.stroke();

    // 船邊條紋（發光藍）
    ctx.fillStyle = '#2266aa';
    ctx.fillRect(-33, -2, 66, 5);
    // 藍色發光
    ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 6;
    ctx.strokeStyle = '#4488ff'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-33, 0); ctx.lineTo(33, 0); ctx.stroke();
    ctx.shadowBlur = 0;

    // 船艙
    ctx.fillStyle = '#1e2e48'; ctx.fillRect(-16, -24, 32, 14);
    ctx.strokeStyle = '#1a2840'; ctx.lineWidth = 1; ctx.strokeRect(-16, -24, 32, 14);
    ctx.fillStyle = 'rgba(100,180,255,0.4)'; ctx.fillRect(-8, -22, 14, 10);

    // 桅桿
    ctx.strokeStyle = '#2a3a5a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -54); ctx.stroke();
    // 旗（深海藍）
    ctx.fillStyle = '#224488';
    ctx.beginPath(); ctx.moveTo(0, -54); ctx.lineTo(18, -46); ctx.lineTo(0, -38); ctx.closePath(); ctx.fill();

    // 燈籠（前端發光）
    ctx.shadowColor = '#44ccff'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#44ccff';
    ctx.beginPath(); ctx.arc(28, -6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  _renderHUD(ctx, player) {
    ctx.fillStyle = 'rgba(2,4,18,0.80)'; ctx.fillRect(0, 0, CONFIG.W, 46);
    ctx.strokeStyle = '#1a2a4a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(CONFIG.W, 46); ctx.stroke();

    ctx.fillStyle = '#ffdd55'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`💰 $${player.money}`, 14, 28);
    ctx.fillStyle = '#aaddff';
    ctx.fillText(`🪱 魚餌 ${player.baitCount}`, 128, 28);
    ctx.fillStyle = '#88ff88';
    ctx.fillText(`🐟 漁獲 ${player.fish.length} 條`, 260, 28);

    // 區域標題
    ctx.fillStyle = '#4488ff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🌀 第二海', CONFIG.W / 2, 28);

    if (player._savedAt && Date.now() - player._savedAt < 2000) {
      const a = Math.max(0, 1 - (Date.now() - player._savedAt) / 2000);
      ctx.fillStyle = `rgba(80,220,120,${a})`;
      ctx.font = '12px sans-serif';
      ctx.fillText('💾 進度已儲存', CONFIG.W / 2 + 110, 28);
    }

    if (touch.isMobile) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.roundRect(CONFIG.W - 114, 8, 106, 30, 6); ctx.fill();
      ctx.fillStyle = '#6699cc'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('◀ 返回港口', CONFIG.W - 61, 28);
    } else {
      ctx.fillStyle = '#334466'; ctx.font = '13px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('ESC 返回港口', CONFIG.W - 14, 28);
    }
  }
}
