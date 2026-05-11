class LakeScene {
  constructor() {
    this.fishing  = new FishingGame();
    this.waveOff  = 0;
    this.monsterMgr = new MonsterManager('zombie');
    // Lake ellipse
    this.LAKE = { cx: 490, cy: 360, rx: 215, ry: 150 };
    // NPC (energy drink vendor)
    this.NPC = { x: 722, y: 215 };

    this.QUEST_NPC  = { id: 'lake', x: 168, y: 462 };
    this.TRADER_NPC = { x: 750, y: 430 };

    this.DIALOGUE_NPCS = [
      { x: 155, y: 300, name: '賞鳥者', color: '#aaffaa',
        lines: [
          '噓——你看那邊，有一隻翠鳥！',
          '這個湖的生態真好，我來觀察三個月了，連鰻魚都有。',
          '上禮拜我在蘆葦叢看到一個影子，比人還大…不知道是什麼。',
        ]},
      { x: 685, y: 168, name: '素描畫家', color: '#ffddaa',
        lines: [
          '……（他正專注地凝視著湖面）',
          '啊，你來釣魚？別靠太近，你嚇到我的模特兒了——就是那隻鷺鷥。',
          '湖水的顏色每天都不一樣。我畫了整整三年，每一張都覺得還不夠。',
        ]},
    ];
  }

  _onLake(x, y) {
    const L = this.LAKE;
    return ((x - L.cx) / L.rx) ** 2 + ((y - L.cy) / L.ry) ** 2 < 1;
  }

  nearbyNPC(player) {
    return Math.hypot(player.x - this.NPC.x, player.y - this.NPC.y) < 65;
  }

  nearbyQuestNPC(player) {
    const q = this.QUEST_NPC;
    return Math.hypot(player.x - q.x, player.y - q.y) < 62 ? q.id : null;
  }

  nearbyTraderNPC(player) {
    const t = this.TRADER_NPC;
    return Math.hypot(player.x - t.x, player.y - t.y) < 65;
  }

  nearbyDialogueNPC(player) {
    for (const npc of this.DIALOGUE_NPCS) {
      if (Math.hypot(player.x - npc.x, player.y - npc.y) < 62) return npc;
    }
    return null;
  }

  nearbySpot(player) {
    for (const s of CONFIG.LAKE_SPOTS) {
      if (Math.hypot(player.x - s.x, player.y - s.y) < s.r + 36) return s;
    }
    return null;
  }

  nearbyExit(player) {
    if (player.x < 55 && player.y > 235 && player.y < 435) return 'harbor';
    if (player.y > 468 && player.x > 330 && player.x < 470) return 'beach';
    // 秘密池塘出口（頂部中央）
    if (player.y - player.h < 70 && player.x > 330 && player.x < 470) return 'pond';
    return null;
  }

  canWalk(x, y, pw, ph) {
    const half = pw / 2;
    if (x - half < 5 || x + half > CONFIG.W - 5) return false;
    if (y > CONFIG.H - 18) return false;
    // 頂部允許通道（前往秘密池塘）
    if (y - ph < 92) {
      if (!(x > 335 && x < 465 && y - ph > 46)) return false;
    }
    if (this._onLake(x, y)) return false;
    return true;
  }

  update(keys, spaceDown, player) {
    this.waveOff += 0.016;
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

    const spd = player.getSpeed();
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
    this._drawBeachPath(ctx, player);
    this._drawPondPath(ctx, player);
    this._drawNPC(ctx);
    this._renderDialogueNPCs(ctx);
    this._renderQuestNPC(ctx, player);
    this._renderTraderNPC(ctx);

    // Nearby prompts
    touch.clearInteractRect();
    if (!this.fishing.state) {
      const qNPCId = this.nearbyQuestNPC(player);
      const exit = this.nearbyExit(player);
      const ns   = this.nearbySpot(player);
      const nearNPC = this.nearbyNPC(player);
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
      } else if (this.nearbyTraderNPC(player)) {
        const label = touch.isMobile ? '👆 神秘商人' : '[E] 神秘商人';
        ctx.font = 'bold 13px sans-serif';
        const tw = ctx.measureText(label).width + 24;
        const lbx = player.x - tw / 2, lby = player.y - 64;
        ctx.fillStyle = 'rgba(30,5,50,0.88)';
        ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.fill();
        ctx.strokeStyle = '#8833cc'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.stroke();
        ctx.fillStyle = '#cc88ff'; ctx.textAlign = 'center';
        ctx.fillText(label, player.x, player.y - 44);
        touch.setInteractRect(lbx - 10, lby - 10, tw + 20, 48);
      } else if (exit) {
        let exitLabel, locked = false;
        if (exit === 'harbor') {
          exitLabel = touch.isMobile ? '👆 返回港口' : '[E] 返回港口';
        } else if (exit === 'beach') {
          locked = !player.isUnlocked('beach');
          exitLabel = locked
            ? '🔒 海灘（需解鎖）'
            : (touch.isMobile ? '👆 前往海灘' : '[E] 前往海灘');
        } else { // pond
          locked = !player.isUnlocked('pond');
          exitLabel = locked
            ? '🔒 秘密池塘（需解鎖）'
            : (touch.isMobile ? '👆 前往秘密池塘' : '[E] 前往秘密池塘');
        }
        ctx.font = 'bold 13px sans-serif';
        const tw = ctx.measureText(exitLabel).width + 24;
        const lbx = player.x - tw / 2, lby = player.y - 64;
        ctx.fillStyle = 'rgba(0,0,0,0.82)';
        ctx.beginPath(); ctx.roundRect(lbx, lby, tw, 28, 7); ctx.fill();
        ctx.fillStyle = locked ? '#ff8866' : '#ffdd55'; ctx.textAlign = 'center';
        ctx.fillText(exitLabel, player.x, player.y - 44);
        if (!locked) touch.setInteractRect(lbx - 10, lby - 10, tw + 20, 48);
      } else if (ns) {
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
    game.daynight.applyOverlay(ctx);
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

  _renderDialogueNPCs(ctx) {
    for (const npc of this.DIALOGUE_NPCS) {
      if (npc.name === '賞鳥者') {
        drawNPCSprite(ctx, npc.x, npc.y, '#4a7a30', '#3a2808');
        // Binoculars
        ctx.fillStyle = '#222233';
        ctx.fillRect(npc.x + 8, npc.y - 22, 8, 5);
        ctx.fillRect(npc.x + 17, npc.y - 22, 8, 5);
        ctx.strokeStyle = '#333344'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(npc.x + 16, npc.y - 20); ctx.lineTo(npc.x + 17, npc.y - 20); ctx.stroke();
      } else {
        // 素描畫家
        drawNPCSprite(ctx, npc.x, npc.y, '#d8d0c0', '#7a5a30');
        // Sketchbook
        ctx.fillStyle = '#f8f4e8';
        ctx.fillRect(npc.x + 9, npc.y - 26, 14, 18);
        ctx.strokeStyle = '#c8baa0'; ctx.lineWidth = 1;
        ctx.strokeRect(npc.x + 9, npc.y - 26, 14, 18);
        ctx.strokeStyle = '#aaa090'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(npc.x + 9, npc.y - 20); ctx.lineTo(npc.x + 23, npc.y - 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(npc.x + 9, npc.y - 14); ctx.lineTo(npc.x + 23, npc.y - 14); ctx.stroke();
      }
    }
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

  _drawBeachPath(ctx, player) {
    const locked = player && !player.isUnlocked('beach');
    // Bottom center dirt path leading to beach
    ctx.fillStyle = locked ? '#5a4a28' : '#d4ba78'; ctx.fillRect(348, 524, 104, CONFIG.H - 524);
    ctx.strokeStyle = locked ? '#3a3018' : '#b09840'; ctx.lineWidth = 1;
    for (let y = 534; y < CONFIG.H; y += 18) {
      ctx.beginPath(); ctx.moveTo(352, y); ctx.lineTo(448, y); ctx.stroke();
    }
    // Gate posts
    [[350, 526], [439, 526]].forEach(([bpx, bpy]) => {
      ctx.fillStyle = '#6a4010'; ctx.fillRect(bpx, bpy, 11, 28);
      ctx.fillStyle = '#8a5820'; ctx.fillRect(bpx - 2, bpy - 5, 15, 9);
    });
    ctx.strokeStyle = '#5a3508'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(355, 536); ctx.lineTo(449, 536); ctx.stroke();
    // Sign
    ctx.fillStyle = locked ? '#3a3020' : '#e8d090'; ctx.fillRect(366, 494, 70, 32);
    ctx.strokeStyle = locked ? '#6a5020' : '#8a6020'; ctx.lineWidth = 1.5; ctx.strokeRect(366, 494, 70, 32);
    ctx.fillStyle = locked ? '#886644' : '#3a2010'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(locked ? '🔒 海灘' : '海灘 ↓', 401, 515);
  }

  _drawPondPath(ctx, player) {
    const locked = player && !player.isUnlocked('pond');
    // Top center path leading to secret pond
    ctx.fillStyle = locked ? '#1a2214' : '#3a5a28'; ctx.fillRect(348, 0, 104, 72);
    ctx.strokeStyle = locked ? '#141a10' : '#2a4a18'; ctx.lineWidth = 1;
    for (let y = 8; y < 70; y += 16) {
      ctx.beginPath(); ctx.moveTo(352, y); ctx.lineTo(448, y); ctx.stroke();
    }
    // 門柱（神秘風格）
    [[348, 46], [440, 46]].forEach(([bpx, bpy]) => {
      ctx.fillStyle = locked ? '#2a1838' : '#3a1060';
      ctx.fillRect(bpx, bpy, 10, 28);
      // 頂部寶珠
      const glowCol = locked ? '#553388' : '#aa55ff';
      ctx.shadowColor = glowCol; ctx.shadowBlur = locked ? 4 : 10;
      ctx.fillStyle = glowCol;
      ctx.beginPath(); ctx.arc(bpx + 5, bpy - 2, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    // 橫樑
    ctx.strokeStyle = locked ? '#3a2050' : '#7722cc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(350, 56); ctx.lineTo(449, 56); ctx.stroke();
    // 標示牌
    ctx.fillStyle = locked ? '#1a1228' : '#1a0a30'; ctx.fillRect(353, 62, 94, 22);
    ctx.strokeStyle = locked ? '#553388' : '#8833cc'; ctx.lineWidth = 1.5; ctx.strokeRect(353, 62, 94, 22);
    ctx.fillStyle = locked ? '#775599' : '#cc88ff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(locked ? '🔒 秘密池塘' : '↑ 秘密池塘', 400, 77);
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

  _renderTraderNPC(ctx) {
    const nx = this.TRADER_NPC.x, ny = this.TRADER_NPC.y;
    const w = 22, h = 32;

    // Aura glow
    const aura = ctx.createRadialGradient(nx, ny - h + 7, 3, nx, ny - h + 7, 22);
    aura.addColorStop(0, 'rgba(180,60,255,0.35)');
    aura.addColorStop(1, 'rgba(180,60,255,0)');
    ctx.fillStyle = aura;
    ctx.fillRect(nx - 26, ny - h - 16, 52, 50);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(nx, ny + 2, w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Robe body (dark purple)
    ctx.fillStyle = '#2a0642'; ctx.fillRect(nx - w / 2, ny - h + 10, w, h - 10);
    ctx.fillStyle = '#7722bb'; ctx.fillRect(nx - w / 2, ny - h + 10, 3, h - 10);
    ctx.fillRect(nx + w / 2 - 3, ny - h + 10, 3, h - 10);

    // Arms holding a scale
    ctx.fillStyle = '#2a0642';
    ctx.fillRect(nx - 18, ny - h + 17, 9, 5);
    ctx.fillRect(nx + 9,  ny - h + 17, 9, 5);
    // Scale prop
    ctx.strokeStyle = '#cc88ff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(nx + 17, ny - h + 19); ctx.lineTo(nx + 17, ny - h + 11); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx + 13, ny - h + 12); ctx.lineTo(nx + 21, ny - h + 12); ctx.stroke();
    ctx.beginPath(); ctx.arc(nx + 13, ny - h + 15, 3, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(nx + 21, ny - h + 15, 3, 0, Math.PI); ctx.stroke();

    // Hood (dark circle with glow edge)
    ctx.fillStyle = '#1a0330'; ctx.beginPath(); ctx.arc(nx, ny - h + 7, w / 2 + 2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = '#9933cc'; ctx.shadowBlur = 6;
    ctx.strokeStyle = '#7722aa'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(nx, ny - h + 7, w / 2 + 2, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing eyes
    const glow = 1.6 + Math.sin(Date.now() / 320) * 0.55;
    ctx.fillStyle = '#ee44ff';
    ctx.shadowColor = '#cc00ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(nx - 3.5, ny - h + 7, glow, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(nx + 3.5, ny - h + 7, glow, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Speech bubble
    const bw = 106, bh = 24, bx = nx - bw - 8, by = ny - h - 38;
    ctx.fillStyle = 'rgba(30,5,55,0.92)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
    ctx.strokeStyle = '#7722cc'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx - 14, by + bh); ctx.lineTo(nx - 8, by + bh + 7); ctx.lineTo(nx - 2, by + bh); ctx.closePath();
    ctx.fillStyle = 'rgba(30,5,55,0.92)'; ctx.fill(); ctx.strokeStyle = '#7722cc'; ctx.stroke();
    ctx.fillStyle = '#cc88ff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('以物換幣...', bx + bw / 2, by + bh / 2 + 4);
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
