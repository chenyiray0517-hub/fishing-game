class LakeScene {
  constructor() {
    this.fishing  = new FishingGame();
    this.waveOff  = 0;
    // Lake ellipse
    this.LAKE = { cx: 490, cy: 360, rx: 215, ry: 150 };
    // NPC (energy drink vendor)
    this.NPC = { x: 722, y: 215 };
  }

  _onLake(x, y) {
    const L = this.LAKE;
    return ((x - L.cx) / L.rx) ** 2 + ((y - L.cy) / L.ry) ** 2 < 1;
  }

  nearbyNPC(player) {
    return Math.hypot(player.x - this.NPC.x, player.y - this.NPC.y) < 65;
  }

  nearbySpot(player) {
    for (const s of CONFIG.LAKE_SPOTS) {
      if (Math.hypot(player.x - s.x, player.y - s.y) < s.r + 36) return s;
    }
    return null;
  }

  canWalk(x, y, pw, ph) {
    const half = pw / 2;
    if (x - half < 5 || x + half > CONFIG.W - 5) return false;
    if (y - ph < 92 || y > CONFIG.H - 18) return false;
    if (this._onLake(x, y)) return false;
    return true;
  }

  update(keys, spaceDown, player) {
    this.waveOff += 0.016;

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

    const spd = CONFIG.PLAYER_SPEED;
    const nx = player.x + dx * spd, ny = player.y + dy * spd;
    if (this.canWalk(nx, player.y, player.w, player.h)) player.x = nx;
    if (this.canWalk(player.x, ny, player.w, player.h)) player.y = ny;
    if (dx || dy) {
      if      (dx < 0) player.dir = 'left';
      else if (dx > 0) player.dir = 'right';
      else if (dy < 0) player.dir = 'up';
      else             player.dir = 'down';
    }

    // Auto-exit to harbor when walking off left edge
    if (player.x < 18 && player.y > 240 && player.y < 430) {
      game.scene = 'harbor';
      player.x = 752; player.y = 325;
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
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, 92);
    sky.addColorStop(0, '#7ac4e8'); sky.addColorStop(1, '#c4eaf8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CONFIG.W, 92);

    // Sun
    ctx.fillStyle = '#fff8b8'; ctx.shadowColor = '#ffe050'; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.arc(692, 40, 22, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    [[90, 28, 36], [250, 22, 28], [460, 34, 42], [610, 19, 26]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.6, cy + 4, r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - r * 0.5, cy + 5, r * 0.65, 0, Math.PI * 2); ctx.fill();
    });

    // Grass
    const grassG = ctx.createLinearGradient(0, 92, 0, CONFIG.H);
    grassG.addColorStop(0, '#5a9e3a'); grassG.addColorStop(1, '#488030');
    ctx.fillStyle = grassG; ctx.fillRect(0, 92, CONFIG.W, CONFIG.H - 92);

    this._drawTrees(ctx);

    // Lake water
    const L = this.LAKE;
    const lakeG = ctx.createRadialGradient(L.cx - 55, L.cy - 45, 18, L.cx, L.cy, Math.max(L.rx, L.ry));
    lakeG.addColorStop(0, '#90d8ec'); lakeG.addColorStop(0.55, '#48accc'); lakeG.addColorStop(1, '#286e9a');
    ctx.fillStyle = lakeG;
    ctx.beginPath(); ctx.ellipse(L.cx, L.cy, L.rx, L.ry, 0, 0, Math.PI * 2); ctx.fill();

    // Shore ring
    ctx.strokeStyle = 'rgba(90,210,245,0.32)'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(L.cx, L.cy, L.rx + 3, L.ry + 3, 0, 0, Math.PI * 2); ctx.stroke();

    // Water shimmer
    const t = Date.now() / 1000;
    ctx.strokeStyle = 'rgba(255,255,255,0.11)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const wx = L.cx + Math.cos(this.waveOff * 0.85 + i * 1.1) * L.rx * 0.58;
      const wy = L.cy + Math.sin(this.waveOff * 0.65 + i * 0.95) * L.ry * 0.52;
      const wr = 16 + Math.sin(t + i * 0.8) * 6;
      ctx.beginPath(); ctx.ellipse(wx, wy, wr, wr * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
    }

    this._drawReeds(ctx);

    // Fishing spots
    for (const s of CONFIG.LAKE_SPOTS) {
      for (let ring = 0; ring < 3; ring++) {
        const phase = (t * 0.5 + ring * 0.33) % 1;
        const r2 = s.r * (0.4 + phase * 0.9), alpha = (1 - phase) * 0.38;
        ctx.strokeStyle = `rgba(80,220,160,${alpha})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, r2, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(110,230,190,0.85)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y - s.r - 8);
    }

    this._drawExitPath(ctx);
    this._drawNPC(ctx);

    // Nearby prompts
    touch.clearInteractRect();
    if (!this.fishing.state) {
      const ns = this.nearbySpot(player);
      const nearNPC = this.nearbyNPC(player);
      if (ns) {
        const hasBait = player.baitCount > 0;
        ctx.fillStyle = 'rgba(0,0,0,0.78)';
        ctx.beginPath(); ctx.roundRect(player.x - 52, player.y - 72, 104, 28, 6); ctx.fill();
        ctx.fillStyle = hasBait ? '#ffff44' : '#ff6644'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(hasBait ? (touch.isMobile ? '點右下按鈕釣魚' : '[E] 開始釣魚') : '魚餌不足！', player.x, player.y - 53);
      } else if (nearNPC) {
        const label = touch.isMobile ? '👆 購買能量飲料' : '[E] 購買能量飲料';
        ctx.font = 'bold 13px sans-serif';
        const tw = ctx.measureText(label).width + 24;
        const lbx = player.x - tw / 2, lby = player.y - 64;
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.fill();
        ctx.fillStyle = '#88ff88'; ctx.textAlign = 'center';
        ctx.fillText(label, player.x, player.y - 44);
        touch.setInteractRect(lbx - 10, lby - 10, tw + 20, 48);
      }
    }

    this._renderPlayer(ctx, player);
    this.fishing.render(ctx);
    this._renderHUD(ctx, player);
  }

  _drawTrees(ctx) {
    const trees = [
      // Top edge forest
      [38,96],[90,90],[145,98],[200,93],[268,96],[340,91],[560,94],[618,89],[672,97],[728,91],[782,96],
      // Right side
      [782,145],[788,205],[784,268],
      // Bottom-right corner
      [762,498],[785,522],[744,542],[788,558],
      // Bottom (south of lake)
      [592,546],[645,552],[700,548],
      // Left side (above exit)
      [16,122],[20,172],[15,224],
    ];
    for (const [tx, ty] of trees) {
      ctx.fillStyle = '#4a3208'; ctx.fillRect(tx - 5, ty + 15, 10, 24);
      ctx.fillStyle = '#286a18';
      ctx.beginPath(); ctx.arc(tx, ty, 25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#389228';
      ctx.beginPath(); ctx.arc(tx - 7, ty - 7, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tx + 8, ty - 4, 14, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawReeds(ctx) {
    // Reeds near south shore, close to 蘆葦叢 spot
    ctx.strokeStyle = '#6a8820'; ctx.lineWidth = 2;
    for (let i = -7; i <= 7; i++) {
      const rx = 490 + i * 13;
      const ry = 503 + (i % 3) * 4;
      ctx.beginPath(); ctx.moveTo(rx, ry + 22); ctx.lineTo(rx + (i % 2) * 5, ry - 28); ctx.stroke();
      ctx.fillStyle = '#8aaa10';
      ctx.beginPath(); ctx.ellipse(rx + (i % 2) * 5, ry - 28, 3.5, 8, (i % 3) * 0.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawNPC(ctx) {
    const nx = this.NPC.x, ny = this.NPC.y;
    const w = 22, h = 32;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(nx, ny + 2, w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Body (white lab coat with green trim)
    ctx.fillStyle = '#d8dce0'; ctx.fillRect(nx - w / 2, ny - h + 10, w, h - 10);
    ctx.fillStyle = '#4aaa55'; ctx.fillRect(nx - w / 2, ny - h + 10, 4, h - 10);
    ctx.fillRect(nx + w / 2 - 4, ny - h + 10, 4, h - 10);
    // Head
    ctx.fillStyle = '#f5b870'; ctx.beginPath(); ctx.arc(nx, ny - h + 7, w / 2 + 1, 0, Math.PI * 2); ctx.fill();
    // Hair (dark, messy)
    ctx.fillStyle = '#2a1a08'; ctx.beginPath(); ctx.arc(nx, ny - h + 7, w / 2 + 1, Math.PI, 0); ctx.fill();
    ctx.fillRect(nx - w / 2, ny - h + 4, 6, 6);
    // Eyes & smile
    ctx.fillStyle = '#333';
    ctx.fillRect(nx - 5, ny - h + 8, 3, 3); ctx.fillRect(nx + 2, ny - h + 8, 3, 3);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(nx, ny - h + 12, 4, 0.1, Math.PI - 0.1); ctx.stroke();
    // Cooler box (blue, with can icon)
    ctx.fillStyle = '#2255aa'; ctx.fillRect(nx + w / 2 + 1, ny - h + 14, 14, 18);
    ctx.strokeStyle = '#4477cc'; ctx.lineWidth = 1; ctx.strokeRect(nx + w / 2 + 1, ny - h + 14, 14, 18);
    ctx.fillStyle = '#aaccff'; ctx.fillRect(nx + w / 2 + 3, ny - h + 16, 10, 6);
    ctx.fillStyle = '#88aaee'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🥤', nx + w / 2 + 8, ny - h + 29);
    // Speech bubble
    const bw = 110, bh = 28, bx = nx - bw / 2 - 12, by = ny - h - 40;
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 7); ctx.fill();
    ctx.strokeStyle = '#aac8aa'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx - 8, by + bh); ctx.lineTo(nx - 2, by + bh + 9); ctx.lineTo(nx + 6, by + bh); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.94)'; ctx.fill(); ctx.strokeStyle = '#aac8aa'; ctx.stroke();
    ctx.fillStyle = '#226622'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('能量飲料 $300！', bx + bw / 2, by + bh / 2 + 4);
  }

  _drawExitPath(ctx) {
    // Left edge dirt path back to harbor
    ctx.fillStyle = '#b8966a'; ctx.fillRect(0, 255, 42, 148);
    ctx.strokeStyle = '#9a7848'; ctx.lineWidth = 1;
    for (let y = 265; y < 398; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y + Math.sin(y * 0.2) * 2); ctx.lineTo(38, y + Math.sin(y * 0.2 + 1) * 2); ctx.stroke();
    }
    // Gate posts mirroring harbor entrance
    [[30, 258], [30, 372]].forEach(([bpx, bpy]) => {
      ctx.fillStyle = '#6a4010'; ctx.fillRect(bpx, bpy, 11, 28);
      ctx.fillStyle = '#8a5820'; ctx.fillRect(bpx - 2, bpy - 5, 15, 9);
    });
    ctx.strokeStyle = '#5a3508'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(35, 280); ctx.lineTo(35, 376); ctx.stroke();
    // Exit sign
    ctx.fillStyle = '#e8d090'; ctx.fillRect(36, 308, 56, 34);
    ctx.strokeStyle = '#8a6020'; ctx.lineWidth = 1.5; ctx.strokeRect(36, 308, 56, 34);
    ctx.fillStyle = '#3a2010'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('← 港口', 64, 330);
  }

  _renderPlayer(ctx, p) {
    const { x, y, w, h, dir } = p;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a6ab8'; ctx.fillRect(x - w / 2, y - h + 10, w, h - 10);
    ctx.fillStyle = '#f0c890'; ctx.beginPath(); ctx.arc(x, y - h + 7, w / 2 + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.arc(x, y - h + 7, w / 2 + 1, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#222';
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
    ctx.fillStyle = 'rgba(0,28,8,0.72)'; ctx.fillRect(0, 0, CONFIG.W, 46);
    ctx.strokeStyle = '#184a18'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 46); ctx.lineTo(CONFIG.W, 46); ctx.stroke();

    ctx.fillStyle = '#ffdd55'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`💰 $${player.money}`, 14, 28);
    ctx.fillStyle = '#aaddff';
    ctx.fillText(`🪱 魚餌 ${player.baitCount}`, 128, 28);
    ctx.fillStyle = '#88ff88';
    ctx.fillText(`🐟 漁獲 ${player.fish.length} 條`, 260, 28);

    if (player._savedAt && Date.now() - player._savedAt < 2000) {
      const a = Math.max(0, 1 - (Date.now() - player._savedAt) / 2000);
      ctx.fillStyle = `rgba(80,220,120,${a})`;
      ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('💾 進度已儲存', 370, 28);
    }

    if (touch.isMobile) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.roundRect(CONFIG.W - 114, 8, 106, 30, 6); ctx.fill();
      ctx.fillStyle = '#88aacc'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('◀ 返回港口', CONFIG.W - 61, 28);
    } else {
      ctx.fillStyle = '#334455'; ctx.font = '13px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('ESC 返回港口', CONFIG.W - 14, 28);
    }
  }
}
