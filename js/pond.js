class PondScene {
  constructor() {
    this.fishing  = new FishingGame();
    this.waveOff  = 0;
    this.mistOff  = 0;
    this.monsterMgr = new MonsterManager('sprite', true);
    // 水潭橢圓
    this.POND = { cx: 400, cy: 310, rx: 195, ry: 140 };
    this.QUEST_NPC = { id: 'pond', x: 680, y: 490 };
    // 浮動粒子（螢火蟲效果）
    this.fireflies = Array.from({ length: 18 }, () => ({
      x: 80 + Math.random() * 640,
      y: 100 + Math.random() * 400,
      r: 2.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      spd: 0.005 + Math.random() * 0.008,
    }));
  }

  _onPond(x, y) {
    const P = this.POND;
    return ((x - P.cx) / P.rx) ** 2 + ((y - P.cy) / P.ry) ** 2 < 1;
  }

  nearbySpot(player) {
    for (const s of CONFIG.POND_SPOTS) {
      if (Math.hypot(player.x - s.x, player.y - s.y) < s.r + 36) return s;
    }
    return null;
  }

  nearbyQuestNPC(player) {
    const q = this.QUEST_NPC;
    return Math.hypot(player.x - q.x, player.y - q.y) < 62 ? q.id : null;
  }

  nearbyExit(player) {
    if (player.y > CONFIG.H - 60 && player.x > 330 && player.x < 470) return 'lake';
    return null;
  }

  canWalk(x, y, pw, ph) {
    const half = pw / 2;
    if (x - half < 5 || x + half > CONFIG.W - 5) return false;
    if (y - ph < 58 || y > CONFIG.H - 18) return false;
    if (this._onPond(x, y)) return false;
    return true;
  }

  update(keys, spaceDown, player) {
    this.waveOff += 0.014;
    this.mistOff += 0.006;
    for (const f of this.fireflies) f.phase += f.spd;
    this.monsterMgr.update(player.x, player.y);

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

    const spd = CONFIG.PLAYER_SPEED * 0.9;
    const nx = player.x + dx * spd, ny = player.y + dy * spd;
    if (this.canWalk(nx, player.y, player.w, player.h)) player.x = nx;
    if (this.canWalk(player.x, ny, player.w, player.h)) player.y = ny;
    if (dx || dy) {
      if      (dx < 0) player.dir = 'left';
      else if (dx > 0) player.dir = 'right';
      else if (dy < 0) player.dir = 'up';
      else             player.dir = 'down';
    }
  }

  tryFish(player) {
    if (this.fishing.state) return;
    const s = this.nearbySpot(player);
    if (!s) return;
    if (player.baitCount <= 0) return;
    this.fishing.start(s, player);
  }

  render(ctx, player) {
    // ── 夜色天空 ─────────────────────────────────────────────────────
    const sky = ctx.createLinearGradient(0, 0, 0, CONFIG.H);
    sky.addColorStop(0, '#060d1a'); sky.addColorStop(0.45, '#0d1e38'); sky.addColorStop(1, '#0a1828');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // 星星
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    [[60,30],[140,18],[250,40],[380,12],[510,28],[660,20],[750,38],
     [90,55],[320,60],[480,48],[720,55],[180,70],[580,65]].forEach(([sx,sy]) => {
      const tw = (Math.sin(Date.now()/800 + sx) + 1) / 2;
      ctx.globalAlpha = 0.3 + tw * 0.5;
      ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 月亮
    ctx.fillStyle = '#e8f4ff'; ctx.shadowColor = '#a0c8ff'; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(680, 55, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0d8f0';
    ctx.beginPath(); ctx.arc(672, 48, 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // ── 地面（暗苔地） ──────────────────────────────────────────────
    const gnd = ctx.createLinearGradient(0, 60, 0, CONFIG.H);
    gnd.addColorStop(0, '#0e1f10'); gnd.addColorStop(1, '#0a1808');
    ctx.fillStyle = gnd; ctx.fillRect(0, 60, CONFIG.W, CONFIG.H - 60);

    // ── 霧氣效果 ────────────────────────────────────────────────────
    for (let i = 0; i < 5; i++) {
      const mx = 80 + i * 150 + Math.sin(this.mistOff + i * 1.4) * 55;
      const my = 380 + Math.cos(this.mistOff * 0.7 + i) * 25;
      const mr = 70 + i * 12;
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
      mg.addColorStop(0, 'rgba(120,180,140,0.10)');
      mg.addColorStop(1, 'rgba(120,180,140,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(mx, my, mr, mr * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    }

    // ── 茂密森林（四周） ────────────────────────────────────────────
    this._drawForest(ctx);

    // ── 水潭 ────────────────────────────────────────────────────────
    const P = this.POND;
    const pondG = ctx.createRadialGradient(P.cx - 40, P.cy - 35, 10, P.cx, P.cy, Math.max(P.rx, P.ry));
    pondG.addColorStop(0, '#2a6880'); pondG.addColorStop(0.5, '#143855'); pondG.addColorStop(1, '#0a2038');
    ctx.fillStyle = pondG;
    ctx.beginPath(); ctx.ellipse(P.cx, P.cy, P.rx, P.ry, 0, 0, Math.PI * 2); ctx.fill();

    // 月亮倒影
    const reflectG = ctx.createRadialGradient(P.cx + 60, P.cy - 30, 2, P.cx + 60, P.cy - 30, 40);
    reflectG.addColorStop(0, 'rgba(200,230,255,0.35)');
    reflectG.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = reflectG; ctx.beginPath(); ctx.ellipse(P.cx + 60, P.cy - 30, 40, 20, 0, 0, Math.PI * 2); ctx.fill();

    // 水波紋
    const t = Date.now() / 1000;
    ctx.strokeStyle = 'rgba(160,220,255,0.10)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 7; i++) {
      const wx = P.cx + Math.cos(this.waveOff * 0.7 + i * 0.9) * P.rx * 0.52;
      const wy = P.cy + Math.sin(this.waveOff * 0.55 + i * 0.8) * P.ry * 0.48;
      const wr = 18 + Math.sin(t + i * 0.6) * 7;
      ctx.beginPath(); ctx.ellipse(wx, wy, wr, wr * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // 潭岸光暈
    ctx.strokeStyle = 'rgba(80,180,220,0.18)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(P.cx, P.cy, P.rx + 4, P.ry + 4, 0, 0, Math.PI * 2); ctx.stroke();

    // ── 蓮葉 ────────────────────────────────────────────────────────
    [[P.cx-90,P.cy+50],[P.cx+110,P.cy-40],[P.cx-30,P.cy+85],[P.cx+70,P.cy+65]].forEach(([lx,ly]) => {
      ctx.fillStyle = 'rgba(20,80,20,0.75)';
      ctx.beginPath(); ctx.ellipse(lx, ly, 18, 12, Math.random() * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(30,120,30,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 8, ly - 10); ctx.stroke();
    });

    // ── 釣魚點 ──────────────────────────────────────────────────────
    for (const s of CONFIG.POND_SPOTS) {
      for (let ring = 0; ring < 3; ring++) {
        const phase = (t * 0.4 + ring * 0.33) % 1;
        const r2 = s.r * (0.4 + phase * 0.9), alpha = (1 - phase) * 0.50;
        ctx.strokeStyle = `rgba(120,200,255,${alpha})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, r2, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(160,220,255,0.90)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y - s.r - 8);
    }

    // ── 螢火蟲 ──────────────────────────────────────────────────────
    for (const f of this.fireflies) {
      const a = (Math.sin(f.phase) + 1) / 2;
      const fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 3);
      fg.addColorStop(0, `rgba(180,255,140,${(0.5 + a * 0.5).toFixed(2)})`);
      fg.addColorStop(1, 'rgba(180,255,140,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(220,255,180,${(0.7 + a * 0.3).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      // 緩慢漂移
      f.x += Math.cos(f.phase * 0.5) * 0.3;
      f.y += Math.sin(f.phase * 0.4) * 0.25;
      if (f.x < 40 || f.x > 760) f.phase += Math.PI;
      if (f.y < 80 || f.y > CONFIG.H - 60) f.phase += Math.PI;
    }

    // ── 回湖邊出口 ──────────────────────────────────────────────────
    this._drawExitPath(ctx);
    this._renderQuestNPC(ctx, player);

    // ── 互動提示 ────────────────────────────────────────────────────
    touch.clearInteractRect();
    if (!this.fishing.state) {
      const qNPCId = this.nearbyQuestNPC(player);
      const exit = this.nearbyExit(player);
      const ns   = this.nearbySpot(player);
      if (qNPCId) {
        const cfg    = CONFIG.QUEST_NPC_DATA[qNPCId];
        const marker = game.quest?.markerFor(qNPCId, player);
        const label  = touch.isMobile ? `👆 ${cfg.name}` : `[E] ${cfg.name}`;
        ctx.font = 'bold 13px sans-serif';
        const tw = ctx.measureText(label).width + 24;
        const lbx = player.x - tw / 2, lby = player.y - 64;
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.fill();
        ctx.fillStyle = marker === '✓' ? '#44ff88' : '#cc99ff'; ctx.textAlign = 'center';
        ctx.fillText(label, player.x, player.y - 44);
        touch.setInteractRect(lbx - 10, lby - 10, tw + 20, 48);
      } else if (exit) {
        const exitLabel = touch.isMobile ? '👆 返回湖邊' : '[E] 返回湖邊';
        ctx.font = 'bold 13px sans-serif';
        const tw = ctx.measureText(exitLabel).width + 24;
        const lbx = player.x - tw / 2, lby = player.y - 64;
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.fill();
        ctx.fillStyle = '#ffdd55'; ctx.textAlign = 'center';
        ctx.fillText(exitLabel, player.x, player.y - 44);
        touch.setInteractRect(lbx - 10, lby - 10, tw + 20, 48);
      } else if (ns) {
        const hasBait = player.baitCount > 0;
        ctx.fillStyle = 'rgba(0,0,0,0.78)';
        ctx.beginPath(); ctx.roundRect(player.x - 52, player.y - 72, 104, 28, 6); ctx.fill();
        ctx.fillStyle = hasBait ? '#aaffcc' : '#ff6644'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(hasBait ? (touch.isMobile ? '點右下按鈕釣魚' : '[E] 開始釣魚') : '魚餌不足！', player.x, player.y - 53);
      }
    }

    this._renderPlayer(ctx, player);
    this.monsterMgr.render(ctx);
    this.fishing.render(ctx);
    this._renderHUD(ctx, player);
  }

  _renderQuestNPC(ctx, player) {
    const q   = this.QUEST_NPC;
    const cfg = CONFIG.QUEST_NPC_DATA[q.id];
    const marker = game.quest?.markerFor(q.id, player) ?? '!';
    drawNPCSprite(ctx, q.x, q.y, cfg.bodyColor, cfg.hairColor);
    drawQuestMarker(ctx, q.x, q.y, marker);
  }

  _drawForest(ctx) {
    const trees = [
      // 上排
      [20,72],[70,65],[125,70],[185,68],[240,74],[300,66],[460,68],[520,72],[580,66],[640,70],[700,65],[760,70],[790,74],
      // 下排
      [15,510],[55,525],[110,518],[160,522],[220,515],
      [560,518],[610,522],[665,515],[720,520],[770,514],[795,520],
      // 左側
      [18,120],[14,180],[18,250],[15,340],[18,420],
      // 右側
      [782,120],[786,180],[782,250],[786,340],[782,420],
    ];
    for (const [tx, ty] of trees) {
      ctx.fillStyle = '#1a0f04'; ctx.fillRect(tx - 5, ty + 18, 10, 28);
      // 主葉冠（暗綠）
      ctx.fillStyle = '#0e2a0a';
      ctx.beginPath(); ctx.arc(tx, ty, 26, 0, Math.PI * 2); ctx.fill();
      // 高光（微微發光感）
      ctx.fillStyle = 'rgba(20,60,15,0.7)';
      ctx.beginPath(); ctx.arc(tx - 6, ty - 8, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tx + 7, ty - 4, 13, 0, Math.PI * 2); ctx.fill();
      // 微弱藍緣光
      ctx.strokeStyle = 'rgba(40,100,80,0.15)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(tx, ty, 27, 0, Math.PI * 2); ctx.stroke();
    }
  }

  _drawExitPath(ctx) {
    // 底部中央往下的小徑（回湖邊）
    ctx.fillStyle = '#1a2e10'; ctx.fillRect(346, CONFIG.H - 80, 108, 80);
    ctx.strokeStyle = '#0e1e08'; ctx.lineWidth = 1;
    for (let y = CONFIG.H - 70; y < CONFIG.H; y += 16) {
      ctx.beginPath(); ctx.moveTo(350, y); ctx.lineTo(450, y); ctx.stroke();
    }
    // 門柱（發光的紫色）
    [[348, CONFIG.H - 78], [440, CONFIG.H - 78]].forEach(([bx, by]) => {
      ctx.fillStyle = '#2a1040'; ctx.fillRect(bx, by, 10, 36);
      ctx.shadowColor = '#8844cc'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#8844cc'; ctx.fillRect(bx - 1, by - 6, 13, 8);
      ctx.shadowBlur = 0;
    });
    // 標示牌
    ctx.fillStyle = '#1a0a30'; ctx.fillRect(362, CONFIG.H - 102, 76, 28);
    ctx.strokeStyle = '#6633aa'; ctx.lineWidth = 1.5; ctx.strokeRect(362, CONFIG.H - 102, 76, 28);
    ctx.fillStyle = '#cc99ff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('↓ 返回湖邊', 400, CONFIG.H - 82);
  }

  _renderPlayer(ctx, p) {
    const { x, y, w, h, dir } = p;
    // 玩家身影（在黑暗中略帶藍色調）
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a4a88'; ctx.fillRect(x - w / 2, y - h + 10, w, h - 10);
    ctx.fillStyle = '#c8a070'; ctx.beginPath(); ctx.arc(x, y - h + 7, w / 2 + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0a04'; ctx.beginPath(); ctx.arc(x, y - h + 7, w / 2 + 1, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#111';
    if (dir === 'down' || dir === 'up') {
      ctx.fillRect(x - 5, y - h + 8, 3, 3); ctx.fillRect(x + 2, y - h + 8, 3, 3);
    } else if (dir === 'right') {
      ctx.fillRect(x + 1, y - h + 7, 3, 3);
    } else {
      ctx.fillRect(x - 4, y - h + 7, 3, 3);
    }
    if (dir === 'right' || dir === 'down') {
      sprites.rod(ctx, p.equippedRod, x + w / 2, y - h + 18, x + w / 2 + 28, y - h - 10);
    } else {
      sprites.rod(ctx, p.equippedRod, x - w / 2, y - h + 18, x - w / 2 - 28, y - h - 10);
    }
  }

  _renderHUD(ctx, player) {
    ctx.fillStyle = 'rgba(5,8,22,0.82)'; ctx.fillRect(0, 0, CONFIG.W, 46);
    ctx.strokeStyle = '#2a1860'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(CONFIG.W, 46); ctx.stroke();

    ctx.fillStyle = '#ffdd55'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`💰 $${player.money}`, 14, 28);
    ctx.fillStyle = '#aaddff';
    ctx.fillText(`🪱 魚餌 ${player.baitCount}`, 128, 28);
    ctx.fillStyle = '#88ff88';
    ctx.fillText(`🐟 漁獲 ${player.fish.length} 條`, 260, 28);

    // 區域標籤
    ctx.fillStyle = '#cc99ff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✨ 秘密池塘', CONFIG.W / 2, 28);

    if (player._savedAt && Date.now() - player._savedAt < 2000) {
      const a = Math.max(0, 1 - (Date.now() - player._savedAt) / 2000);
      ctx.fillStyle = `rgba(80,220,120,${a})`;
      ctx.font = '12px sans-serif';
      ctx.fillText('💾 進度已儲存', CONFIG.W / 2 + 100, 28);
    }

    if (touch.isMobile) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.roundRect(CONFIG.W - 120, 8, 112, 30, 6); ctx.fill();
      ctx.fillStyle = '#aa88cc'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('↓ 返回湖邊', CONFIG.W - 64, 28);
    } else {
      ctx.fillStyle = '#443366'; ctx.font = '13px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('ESC 返回湖邊', CONFIG.W - 14, 28);
    }
  }
}
