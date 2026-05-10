class BeachScene {
  constructor() {
    this.fishing  = new FishingGame();
    this.waveOff  = 0;
    this.WATER_Y  = 285;

    this.QUEST_NPC = { id: 'beach', x: 540, y: 250 };

    this.DIALOGUE_NPCS = [
      { x: 88, y: 254, name: '衝浪客', color: '#ffcc44',
        lines: [
          '嘿！今天的浪超棒的！',
          '你來這裡釣魚？外礁那邊的旗魚可以拉斷普通的釣線，要用好一點的竿子。',
          '上週我在海面上看到一道黑影，跟我衝浪板差不多長…嚇壞我了。',
        ]},
      { x: 714, y: 240, name: '老人', color: '#ccddff',
        lines: [
          '孩子，你知道這片海以前叫什麼名字嗎？',
          '老漁夫傳說，深海底部住著一位神明，能給漁夫帶來運氣。',
          '你看到的那條龍魚…說不定就是祂的化身。',
        ]},
    ];
  }

  nearbyQuestNPC(player) {
    const q = this.QUEST_NPC;
    return Math.hypot(player.x - q.x, player.y - q.y) < 62 ? q.id : null;
  }

  nearbyDialogueNPC(player) {
    for (const npc of this.DIALOGUE_NPCS) {
      if (Math.hypot(player.x - npc.x, player.y - npc.y) < 62) return npc;
    }
    return null;
  }

  nearbyExit(player) {
    if (player.y < 165 && player.x > 330 && player.x < 470) return 'lake';
    return null;
  }

  nearbySpot(player) {
    for (const s of CONFIG.BEACH_SPOTS) {
      if (Math.hypot(player.x - s.x, player.y - s.y) < s.r + 36) return s;
    }
    return null;
  }

  canWalk(x, y, pw, ph) {
    const half = pw / 2;
    if (x - half < 5 || x + half > CONFIG.W - 5) return false;
    if (y - ph < 92 || y > this.WATER_Y) return false;
    return true;
  }

  update(keys, spaceDown, player) {
    this.waveOff += 0.018;

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

  }

  tryFish(player) {
    if (this.fishing.state) return;
    const s = this.nearbySpot(player);
    if (!s) return;
    if (player.baitCount <= 0) return;
    this.fishing.start(s, player);
  }

  render(ctx, player) {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 92);
    sky.addColorStop(0, '#5ab8f0'); sky.addColorStop(1, '#aad8f8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CONFIG.W, 92);

    // Sun
    ctx.fillStyle = '#fff8c0'; ctx.shadowColor = '#ffd840'; ctx.shadowBlur = 28;
    ctx.beginPath(); ctx.arc(110, 46, 26, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    [[320, 26, 36], [530, 20, 28], [700, 32, 42]].forEach(([cx, cy, r]) => {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.6, cy + 4, r * 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - r * 0.5, cy + 5, r * 0.65, 0, Math.PI * 2); ctx.fill();
    });

    // Sand
    const sandG = ctx.createLinearGradient(0, 92, 0, this.WATER_Y);
    sandG.addColorStop(0, '#e8d490'); sandG.addColorStop(1, '#d4bc68');
    ctx.fillStyle = sandG; ctx.fillRect(0, 92, CONFIG.W, this.WATER_Y - 92);

    // Sand texture (subtle dots)
    ctx.fillStyle = 'rgba(160,120,40,0.07)';
    for (let i = 0; i < 90; i++) {
      const sx = (i * 131 + 44) % CONFIG.W;
      const sy = 100 + (i * 67) % (this.WATER_Y - 112);
      ctx.beginPath(); ctx.arc(sx, sy, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // Seashells
    [[115, 248], [308, 262], [542, 255], [718, 244], [440, 240]].forEach(([sx, sy]) => {
      ctx.strokeStyle = '#d8b0a8'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 7); ctx.stroke();
    });

    // Rocks near reef spots
    [[140, 278], [185, 274], [615, 275], [650, 272]].forEach(([rx, ry]) => {
      ctx.fillStyle = '#8a7a60';
      ctx.beginPath(); ctx.ellipse(rx, ry, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a09070';
      ctx.beginPath(); ctx.ellipse(rx - 3, ry - 3, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
    });

    this._drawPalmTrees(ctx);
    this._drawExitPath(ctx);
    this._renderDialogueNPCs(ctx);
    this._renderQuestNPC(ctx, player);

    // Ocean water
    const waterG = ctx.createLinearGradient(0, this.WATER_Y, 0, CONFIG.H);
    waterG.addColorStop(0,   '#58c8e8');
    waterG.addColorStop(0.25,'#30a0cc');
    waterG.addColorStop(1,   '#0a3e7a');
    ctx.fillStyle = waterG; ctx.fillRect(0, this.WATER_Y, CONFIG.W, CONFIG.H - this.WATER_Y);

    // Wave foam at shoreline
    for (let w = 0; w < 3; w++) {
      const alpha = 0.40 - w * 0.10;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 2.8 - w * 0.6;
      ctx.beginPath();
      for (let x = 0; x <= CONFIG.W; x += 10) {
        const wy = this.WATER_Y + w * 20 + Math.sin(x / 58 + this.waveOff + w * 1.3) * 7;
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Water shimmer
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) {
      const wx = 50 + i * 82 + Math.sin(this.waveOff * 0.8 + i * 0.7) * 28;
      const wy = this.WATER_Y + 55 + Math.cos(this.waveOff + i * 0.9) * 30;
      const wr = 14 + i * 1.5;
      ctx.beginPath(); ctx.ellipse(wx, wy, wr, wr * 0.32, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // Fishing spots
    const t = Date.now() / 1000;
    for (const s of CONFIG.BEACH_SPOTS) {
      for (let ring = 0; ring < 3; ring++) {
        const phase = (t * 0.5 + ring * 0.33) % 1;
        const r2 = s.r * (0.4 + phase * 0.9), alpha = (1 - phase) * 0.40;
        ctx.strokeStyle = `rgba(140,230,255,${alpha})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, r2, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(200,245,255,0.90)'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y - s.r - 8);
    }

    // Nearby prompts
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
        ctx.fillStyle = marker === '✓' ? '#44ff88' : '#ffdd44'; ctx.textAlign = 'center';
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
        ctx.fillStyle = hasBait ? '#ffff44' : '#ff6644'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(hasBait ? (touch.isMobile ? '點右下按鈕釣魚' : '[E] 開始釣魚') : '魚餌不足！', player.x, player.y - 53);
      } else {
        const dNPC = this.nearbyDialogueNPC(player);
        if (dNPC) {
          const label = touch.isMobile ? `👆 和${dNPC.name}說話` : `[E] 和${dNPC.name}說話`;
          ctx.font = 'bold 13px sans-serif';
          const tw = ctx.measureText(label).width + 20;
          const lbx = player.x - tw / 2, lby = player.y - 64;
          ctx.fillStyle = 'rgba(0,0,0,0.82)';
          ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.fill();
          ctx.fillStyle = '#ffffaa'; ctx.textAlign = 'center';
          ctx.fillText(label, player.x, player.y - 44);
          touch.setInteractRect(lbx - 10, lby - 10, tw + 20, 48);
        }
      }
    }

    this._renderPlayer(ctx, player);
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

  _renderDialogueNPCs(ctx) {
    for (const npc of this.DIALOGUE_NPCS) {
      if (npc.name === '衝浪客') {
        drawNPCSprite(ctx, npc.x, npc.y, '#ff7722', '#d4a040');
        // Surfboard leaning behind
        ctx.fillStyle = '#1a88cc';
        ctx.save();
        ctx.translate(npc.x - 16, npc.y - 18);
        ctx.rotate(-0.22);
        ctx.fillRect(-4, -28, 8, 42);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -28, 8, 6);
        ctx.restore();
      } else {
        // 老人 — light clothing, white hair, sitting pose hinted by y offset
        drawNPCSprite(ctx, npc.x, npc.y, '#d8d0b8', '#c8c8c8');
        // Sunhat
        ctx.fillStyle = '#d4b860';
        ctx.beginPath(); ctx.ellipse(npc.x, npc.y - 29, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#c8a840';
        ctx.beginPath(); ctx.ellipse(npc.x, npc.y - 31, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  _drawExitPath(ctx) {
    // Dirt path at top center leading back to lake
    ctx.fillStyle = '#c8a870'; ctx.fillRect(348, 46, 104, 100);
    ctx.strokeStyle = '#a88840'; ctx.lineWidth = 1;
    for (let y = 56; y < 144; y += 18) {
      ctx.beginPath(); ctx.moveTo(352, y); ctx.lineTo(448, y); ctx.stroke();
    }
    // Gate posts
    [[350, 112], [439, 112]].forEach(([bpx, bpy]) => {
      ctx.fillStyle = '#6a4010'; ctx.fillRect(bpx, bpy, 11, 28);
      ctx.fillStyle = '#8a5820'; ctx.fillRect(bpx - 2, bpy - 5, 15, 9);
    });
    ctx.strokeStyle = '#5a3508'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(355, 122); ctx.lineTo(449, 122); ctx.stroke();
    // Sign
    ctx.fillStyle = '#e8d090'; ctx.fillRect(368, 130, 66, 32);
    ctx.strokeStyle = '#8a6020'; ctx.lineWidth = 1.5; ctx.strokeRect(368, 130, 66, 32);
    ctx.fillStyle = '#3a2010'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('↑ 湖邊', 401, 150);
  }

  _drawPalmTrees(ctx) {
    const palms = [[55, 210], [748, 200], [690, 238], [125, 248]];
    for (const [px, py] of palms) {
      // Trunk (curved)
      ctx.strokeStyle = '#8a6030'; ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + 10, py - 28, px + 5, py - 62);
      ctx.stroke();
      // Leaves
      const leafAngles = [0, 1.2, 2.4, 3.7, 5.0];
      const leafColors = ['#288a18', '#3aaa22', '#208018', '#38a020', '#259018'];
      for (let i = 0; i < 5; i++) {
        const a = leafAngles[i];
        const lx = px + 5 + Math.cos(a) * 38;
        const ly = py - 62 + Math.sin(a) * 16;
        ctx.strokeStyle = leafColors[i]; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(px + 5, py - 62); ctx.lineTo(lx, ly); ctx.stroke();
      }
      // Coconuts
      ctx.fillStyle = '#7a5828';
      ctx.beginPath(); ctx.arc(px + 3, py - 58, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + 9, py - 63, 4, 0, Math.PI * 2); ctx.fill();
    }
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
    ctx.fillStyle = 'rgba(0,18,40,0.74)'; ctx.fillRect(0, 0, CONFIG.W, 46);
    ctx.strokeStyle = '#185878'; ctx.lineWidth = 1;
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
      ctx.beginPath(); ctx.roundRect(CONFIG.W - 120, 8, 112, 30, 6); ctx.fill();
      ctx.fillStyle = '#88aacc'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('↑ 返回湖邊', CONFIG.W - 64, 28);
    } else {
      ctx.fillStyle = '#334455'; ctx.font = '13px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('ESC 返回湖邊', CONFIG.W - 14, 28);
    }
  }
}
