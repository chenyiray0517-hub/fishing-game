class HarborScene {
  constructor() {
    this.WATER_Y = 405;
    this.PIER    = { x:316, y:405, w:168, h:148 };
    this.BOAT    = { x:358, y:460, w:84, h:48 };
    this.BED     = { x: 80, y: 375 };
    // 第二海碼頭（左側水域）
    this.DOCK2   = { x:50,  y:405, w:140, h:120 };
    this.BOAT2   = { x:84,  y:455, w:80,  h:44  };
    // 床邊地圖（牆上掛圖）
    this.MAP_PROP = { x: 145, y: 338 };

    this.BUILDINGS = [
      { x:45,  y:88, w:158, h:148, type:'rod',     label:'釣竿商店', color:'#3d2a18', roof:'#7a5520', winCol:'#c8e8ff' },
      { x:228, y:88, w:158, h:148, type:'bait',    label:'魚餌商店', color:'#182838', roof:'#1a5a7a', winCol:'#c8ffd8' },
      { x:414, y:88, w:158, h:148, type:'upgrade', label:'升級商店', color:'#1e2e18', roof:'#3a6620', winCol:'#ffd8c8' },
      { x:600, y:88, w:152, h:148, type:'market',  label:'魚市場',   color:'#2e1818', roof:'#7a2020', winCol:'#ffeec8' },
    ];

    this.waveOff = 0;
    this.bobT    = 0;

    this.QUEST_NPCS = [
      { id: 'ocean',  x: 382, y: 368 },
      { id: 'ocean2', x: 95,  y: 368 },
    ];

    this.DIALOGUE_NPCS = [
      { x: 553, y: 385, name: '老漁夫', color: '#ffcc88',
        lines: [
          '老夫打了四十年的魚，這片海早就認識我了。',
          '想釣大魚，就得先跟海交朋友。心急的人，只能撈到沙丁魚。',
          '聽說最深的地方有條龍魚…老夫這輩子沒見過，但漁夫的眼睛不說謊。',
        ]},
      { x: 580, y: 390, name: '老漁夫的貓', color: '#ffaa44',
        lines: [
          '喵～',
          '（牠盯著你桶裡的魚，眼神充滿期待）',
          '喵嗚……（牠打了個哈欠，開始舔起爪子）',
        ]},
      { x: 228, y: 368, name: '小男孩', color: '#88ddff',
        lines: [
          '哇！你有一艘船耶！',
          '我長大也要當漁夫！這樣每天都能吃魚！',
          '爸爸說海裡有大怪物，但我才不怕呢！',
        ]},
    ];
  }

  nearbyQuestNPC(player) {
    for (const npc of this.QUEST_NPCS) {
      if (Math.hypot(player.x - npc.x, player.y - npc.y) < 62) return npc.id;
    }
    return null;
  }

  nearbyDialogueNPC(player) {
    for (const npc of this.DIALOGUE_NPCS) {
      if (Math.hypot(player.x - npc.x, player.y - npc.y) < 62) return npc;
    }
    return null;
  }

  // Returns nearest interactable or null
  nearby(player) {
    const { x, y } = player;
    for (const b of this.BUILDINGS) {
      const bx = b.x + b.w/2, by = b.y + b.h;
      if (Math.hypot(x-bx, y-by) < 100) return { type:'shop', shopType:b.type };
    }
    const bo = this.BOAT;
    const bcx = bo.x+bo.w/2, bcy = bo.y+bo.h/2;
    if (Math.hypot(x-bcx, y-bcy) < 100) return { type:'boat' };
    // 第二海碼頭
    const bo2 = this.BOAT2;
    const bc2x = bo2.x+bo2.w/2, bc2y = bo2.y+bo2.h/2;
    if (Math.hypot(x-bc2x, y-bc2y) < 90) return { type:'ocean2' };
    // Bed (respawn / san recovery)
    if (Math.hypot(x - this.BED.x, y - this.BED.y) < 58) return { type: 'bed' };
    // 床邊地圖
    if (Math.hypot(x - this.MAP_PROP.x, y - this.MAP_PROP.y) < 62) return { type: 'map' };
    // Lake path (right side, below fish market)
    if (Math.hypot(x - (CONFIG.W - 32), y - 328) < 78) return { type: 'lake' };
    return null;
  }

  canWalk(x, y, pw, ph) {
    const half = pw/2;
    if (x-half < 5 || x+half > CONFIG.W-5) return false;
    if (y-ph < 85) return false;

    // Building collision
    for (const b of this.BUILDINGS) {
      if (x > b.x+half && x < b.x+b.w-half && y > b.y+ph && y < b.y+b.h+ph/2) return false;
    }

    // Water — allow walking on main pier OR second dock
    if (y > this.WATER_Y) {
      const P  = this.PIER;
      const D2 = this.DOCK2;
      const onPier  = x >= P.x+8  && x <= P.x+P.w-8  && y <= P.y+P.h-8;
      const onDock2 = x >= D2.x+8 && x <= D2.x+D2.w-8 && y <= D2.y+D2.h-8;
      if (!onPier && !onDock2) return false;
    }
    return true;
  }

  update(keys, player) {
    this.waveOff += 0.018;
    this.bobT += 0.04;

    // Cancel lying if any movement key pressed
    const moving = keys['ArrowLeft']||keys['a']||keys['A']||
                   keys['ArrowRight']||keys['d']||keys['D']||
                   keys['ArrowUp']||keys['w']||keys['W']||
                   keys['ArrowDown']||keys['s']||keys['S'];
    if (player.lying && moving) player.lying = false;
    if (player.lying) return;

    let dx=0, dy=0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx=-1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx= 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy=-1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy= 1;
    if (dx && dy) { dx*=0.707; dy*=0.707; }

    const spd = CONFIG.PLAYER_SPEED;
    const nx=player.x+dx*spd, ny=player.y+dy*spd;
    if (this.canWalk(nx, player.y, player.w, player.h)) player.x=nx;
    if (this.canWalk(player.x, ny, player.w, player.h)) player.y=ny;

    if (dx || dy) {
      if      (dx<0) player.dir='left';
      else if (dx>0) player.dir='right';
      else if (dy<0) player.dir='up';
      else           player.dir='down';
    }
  }

  render(ctx, player) {
    // Sky
    const sky = ctx.createLinearGradient(0,0,0,88);
    sky.addColorStop(0,'#6ab0d8'); sky.addColorStop(1,'#b8dcf0');
    ctx.fillStyle=sky; ctx.fillRect(0,0,CONFIG.W,88);

    // Clouds
    ctx.fillStyle='rgba(255,255,255,0.6)';
    [[80,30,45],[220,20,35],[500,40,50],[650,25,38]].forEach(([cx,cy,r])=>{
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+r*0.6,cy+4,r*0.7,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx-r*0.5,cy+6,r*0.65,0,Math.PI*2); ctx.fill();
    });

    // Ground
    ctx.fillStyle='#c0a878'; ctx.fillRect(0,88,CONFIG.W,317);
    ctx.fillStyle='rgba(0,0,0,0.04)';
    for(let i=0;i<320;i+=45){ ctx.fillRect(0,88+i,CONFIG.W,1); }

    // Water
    ctx.fillStyle='#186090'; ctx.fillRect(0,this.WATER_Y,CONFIG.W,CONFIG.H-this.WATER_Y);
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=2;
    for(let w=0;w<4;w++){
      ctx.beginPath();
      for(let x=0;x<=CONFIG.W;x+=18){
        const wy=this.WATER_Y+18+w*26+Math.sin(x/55+this.waveOff+w*0.8)*5;
        x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
      }
      ctx.stroke();
    }

    // Pier planks
    const P=this.PIER;
    ctx.fillStyle='#7a5a1a'; ctx.fillRect(P.x,P.y,P.w,P.h);
    ctx.strokeStyle='#5a4010'; ctx.lineWidth=1;
    for(let py=P.y;py<P.y+P.h;py+=16){
      ctx.beginPath(); ctx.moveTo(P.x,py); ctx.lineTo(P.x+P.w,py); ctx.stroke();
    }
    ctx.strokeStyle='#5a4010'; ctx.lineWidth=2; ctx.strokeRect(P.x,P.y,P.w,P.h);

    // Pier bollards
    [[P.x+10,P.y+5],[P.x+P.w-10,P.y+5]].forEach(([bx,by])=>{
      ctx.fillStyle='#4a3a10'; ctx.fillRect(bx-5,by,10,30);
      ctx.fillStyle='#8a6a20'; ctx.beginPath(); ctx.arc(bx,by,7,0,Math.PI*2); ctx.fill();
    });

    // Buildings
    for (const b of this.BUILDINGS) {
      ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(b.x+5,b.y+5,b.w,b.h);
      ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h);
      // Roof
      ctx.fillStyle=b.roof;
      ctx.beginPath();
      ctx.moveTo(b.x-6,b.y+8);
      ctx.lineTo(b.x+b.w/2,b.y-18);
      ctx.lineTo(b.x+b.w+6,b.y+8);
      ctx.closePath(); ctx.fill();
      // Door
      ctx.fillStyle='#1a0f08'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-46,26,46);
      ctx.fillStyle='rgba(50,25,10,0.5)'; ctx.fillRect(b.x+b.w/2-13,b.y+b.h-46,26,46);
      // Door knob
      ctx.fillStyle='#cc9920'; ctx.beginPath(); ctx.arc(b.x+b.w/2+8,b.y+b.h-23,3,0,Math.PI*2); ctx.fill();
      // Windows
      [b.x+14, b.x+b.w-44].forEach(wx=>{
        ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(wx+2,b.y+42,30,26);
        ctx.fillStyle=b.winCol; ctx.globalAlpha=0.75; ctx.fillRect(wx+2,b.y+42,30,26); ctx.globalAlpha=1;
        ctx.strokeStyle='rgba(0,0,0,0.4)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(wx+17,b.y+42); ctx.lineTo(wx+17,b.y+68); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx+2,b.y+55); ctx.lineTo(wx+32,b.y+55); ctx.stroke();
      });
      // Label on sign board
      ctx.fillStyle='#e8d090';
      ctx.fillRect(b.x+8,b.y+b.h-72,b.w-16,22);
      ctx.strokeStyle='#8a6020'; ctx.lineWidth=1; ctx.strokeRect(b.x+8,b.y+b.h-72,b.w-16,22);
      ctx.fillStyle='#3a2010'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center';
      ctx.fillText(b.label, b.x+b.w/2, b.y+b.h-56);
    }

    // Boat
    const bobY=Math.sin(this.bobT)*3;
    const bo=this.BOAT;
    const bx=bo.x, by=bo.y+bobY;
    ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(bx+4,by+8,bo.w,bo.h);
    ctx.fillStyle='#e8d090';
    ctx.beginPath();
    ctx.moveTo(bx,     by+14);
    ctx.lineTo(bx+8,   by+bo.h);
    ctx.lineTo(bx+bo.w-8,by+bo.h);
    ctx.lineTo(bx+bo.w,by+14);
    ctx.lineTo(bx+bo.w-4,by);
    ctx.lineTo(bx+4,   by);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#8a6020'; ctx.lineWidth=2; ctx.stroke();
    // Mast
    ctx.strokeStyle='#7a5520'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(bx+bo.w/2,by); ctx.lineTo(bx+bo.w/2,by-32); ctx.stroke();
    // Flag
    ctx.fillStyle='#cc3333';
    ctx.beginPath(); ctx.moveTo(bx+bo.w/2,by-32); ctx.lineTo(bx+bo.w/2+16,by-24); ctx.lineTo(bx+bo.w/2,by-16); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#3a2010'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
    ctx.fillText('出海', bx+bo.w/2, by+bo.h/2+4);

    // 第二海碼頭
    this._renderDock2(ctx, player);

    // 對話 NPC 繪製
    this._renderDialogueNPCs(ctx);
    // 任務 NPC 繪製
    this._renderQuestNPCs(ctx, player);

    // Nearby prompt
    const qNPCId = this.nearbyQuestNPC(player);
    const n    = this.nearby(player);
    const dNPC = this.nearbyDialogueNPC(player);
    if (qNPCId) {
      const cfg   = CONFIG.QUEST_NPC_DATA[qNPCId];
      const marker = game.quest?.markerFor(qNPCId, player);
      const label = touch.isMobile ? `👆 ${cfg.name}` : `[E] ${cfg.name}`;
      ctx.font = 'bold 13px sans-serif';
      const tw = ctx.measureText(label).width + 24;
      const bx = player.x - tw / 2, by = player.y - 64;
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.beginPath(); ctx.roundRect(bx, by, tw, 28, 7); ctx.fill();
      ctx.fillStyle = marker === '✓' ? '#44ff88' : '#ffdd44';
      ctx.textAlign = 'center'; ctx.fillText(label, player.x, player.y - 44);
      touch.setInteractRect(bx - 10, by - 10, tw + 20, 48);
    } else if (n) {
      const SHOP_LABELS = { rod:'釣竿商店', bait:'魚餌商店', upgrade:'升級商店', market:'魚市場' };
      let labelText, locked = false;
      if (n.type === 'boat') {
        labelText = '出海（第一海）';
      } else if (n.type === 'ocean2') {
        locked = !player.isUnlocked('ocean2');
        labelText = locked ? '🔒 第二海（需解鎖）' : '前往第二海';
      } else if (n.type === 'lake') {
        labelText = '前往湖邊';
      } else if (n.type === 'bed') {
        labelText = player.lying ? '起身' : '躺下 (恢復 SAN)';
      } else if (n.type === 'map') {
        labelText = '查看地圖';
      } else {
        labelText = SHOP_LABELS[n.shopType] || '進入';
      }
      const label = touch.isMobile ? `👆 ${labelText}` : `[E] ${labelText}`;
      const tw = ctx.measureText(label).width + 24;
      const bx = player.x - tw / 2, by = player.y - 64;
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.beginPath(); ctx.roundRect(bx, by, tw, 28, 7); ctx.fill();
      ctx.fillStyle = locked ? '#ff8866' : '#ffff44';
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, player.x, player.y - 44);
      if (!locked) touch.setInteractRect(bx - 10, by - 10, tw + 20, 48);
      else touch.clearInteractRect();
    } else if (dNPC) {
      const label = touch.isMobile ? `👆 和${dNPC.name}說話` : `[E] 和${dNPC.name}說話`;
      ctx.font = 'bold 13px sans-serif';
      const dtw = ctx.measureText(label).width + 20;
      const dbx = player.x - dtw / 2, dby = player.y - 64;
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.beginPath(); ctx.roundRect(dbx, dby, dtw, 28, 7); ctx.fill();
      ctx.fillStyle = '#ffffaa'; ctx.textAlign = 'center';
      ctx.fillText(label, player.x, player.y - 44);
      touch.setInteractRect(dbx - 10, dby - 10, dtw + 20, 48);
    } else {
      touch.clearInteractRect();
    }

    this._renderBed(ctx);
    this._renderMapProp(ctx);
    this._renderLakePath(ctx);
    this.renderPlayer(ctx, player);
    this.renderHUD(ctx, player);
  }

  _renderQuestNPCs(ctx, player) {
    for (const npc of this.QUEST_NPCS) {
      const cfg    = CONFIG.QUEST_NPC_DATA[npc.id];
      const marker = game.quest?.markerFor(npc.id, player) ?? '!';
      drawNPCSprite(ctx, npc.x, npc.y, cfg.bodyColor, cfg.hairColor);
      drawQuestMarker(ctx, npc.x, npc.y, marker);
    }
  }

  _renderDialogueNPCs(ctx) {
    for (const npc of this.DIALOGUE_NPCS) {
      if (npc.name === '老漁夫的貓') {
        this._drawCat(ctx, npc.x, npc.y);
      } else if (npc.name === '小男孩') {
        // Slightly shorter: draw at y-6 so feet are raised
        drawNPCSprite(ctx, npc.x, npc.y - 6, '#e85530', '#1a1a08');
      } else {
        // 老漁夫
        drawNPCSprite(ctx, npc.x, npc.y, '#5a3a18', '#909090');
        // Old fishing rod prop
        ctx.strokeStyle = '#7a5520'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(npc.x - 11, npc.y - 22);
        ctx.lineTo(npc.x - 28, npc.y - 44);
        ctx.stroke();
        ctx.strokeStyle = '#aaddff'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(npc.x - 28, npc.y - 44);
        ctx.lineTo(npc.x - 22, npc.y + 8);
        ctx.stroke();
      }
    }
  }

  _drawCat(ctx, x, y) {
    // Body
    ctx.fillStyle = '#e09040';
    ctx.beginPath(); ctx.ellipse(x, y - 8, 13, 9, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.beginPath(); ctx.arc(x + 11, y - 14, 9, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.fillStyle = '#cc7830';
    ctx.beginPath(); ctx.moveTo(x + 5, y - 20); ctx.lineTo(x + 9, y - 29); ctx.lineTo(x + 14, y - 20); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 14, y - 20); ctx.lineTo(x + 18, y - 29); ctx.lineTo(x + 22, y - 20); ctx.closePath(); ctx.fill();
    // Eyes
    ctx.fillStyle = '#44aa22';
    ctx.beginPath(); ctx.ellipse(x + 8,  y - 14, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 14, y - 14, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(x + 8,  y - 14, 1, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 14, y - 14, 1, 2, 0, 0, Math.PI * 2); ctx.fill();
    // Tail
    ctx.strokeStyle = '#e09040'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x - 12, y - 6);
    ctx.quadraticCurveTo(x - 22, y - 22, x - 14, y - 30); ctx.stroke();
    // Whiskers
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 11, y - 14); ctx.lineTo(x + 27, y - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 11, y - 13); ctx.lineTo(x + 27, y - 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 11, y - 14); ctx.lineTo(x - 1,  y - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 11, y - 13); ctx.lineTo(x - 1,  y - 12); ctx.stroke();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x, y, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
  }

  _renderDock2(ctx, player) {
    const D = this.DOCK2;
    const locked = !player.isUnlocked('ocean2');

    // 碼頭木板
    ctx.fillStyle = locked ? '#3a2a0e' : '#6a4a14';
    ctx.fillRect(D.x, D.y, D.w, D.h);
    ctx.strokeStyle = locked ? '#2a1e08' : '#4a3008'; ctx.lineWidth = 1;
    for (let py = D.y; py < D.y + D.h; py += 14) {
      ctx.beginPath(); ctx.moveTo(D.x, py); ctx.lineTo(D.x + D.w, py); ctx.stroke();
    }
    ctx.strokeStyle = locked ? '#2a1e08' : '#4a3008'; ctx.lineWidth = 2;
    ctx.strokeRect(D.x, D.y, D.w, D.w);

    // 繫船柱
    [[D.x + 10, D.y + 6], [D.x + D.w - 10, D.y + 6]].forEach(([bpx, bpy]) => {
      ctx.fillStyle = '#3a2808'; ctx.fillRect(bpx - 5, bpy, 10, 22);
      ctx.fillStyle = '#6a4810'; ctx.beginPath(); ctx.arc(bpx, bpy, 7, 0, Math.PI * 2); ctx.fill();
    });

    // 第二海船
    const bo2 = this.BOAT2;
    const bobY = Math.sin(this.bobT) * 2.8;
    const bx = bo2.x, by = bo2.y + bobY;

    if (locked) {
      // 鎖定狀態：灰暗老舊船
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(bx + 4, by + 6, bo2.w, bo2.h);
      ctx.fillStyle = '#2e2820';
      ctx.beginPath();
      ctx.moveTo(bx, by + 12); ctx.lineTo(bx + 6, by + bo2.h);
      ctx.lineTo(bx + bo2.w - 6, by + bo2.h); ctx.lineTo(bx + bo2.w, by + 12);
      ctx.lineTo(bx + bo2.w - 4, by); ctx.lineTo(bx + 4, by);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a1410'; ctx.lineWidth = 2; ctx.stroke();
      // 鎖頭圖示
      ctx.fillStyle = '#665544'; ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🔒', bx + bo2.w / 2, by + bo2.h / 2 + 6);
      // 標牌
      ctx.fillStyle = '#2a2010'; ctx.fillRect(bx, by - 28, bo2.w, 20);
      ctx.strokeStyle = '#4a3820'; ctx.lineWidth = 1; ctx.strokeRect(bx, by - 28, bo2.w, 20);
      ctx.fillStyle = '#887766'; ctx.font = 'bold 10px sans-serif';
      ctx.fillText('第二海（需海圖）', bx + bo2.w / 2, by - 14);
    } else {
      // 解鎖狀態：深海風格船（深藍色）
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(bx + 4, by + 6, bo2.w, bo2.h);
      ctx.fillStyle = '#1e2e4a';
      ctx.beginPath();
      ctx.moveTo(bx, by + 12); ctx.lineTo(bx + 6, by + bo2.h);
      ctx.lineTo(bx + bo2.w - 6, by + bo2.h); ctx.lineTo(bx + bo2.w, by + 12);
      ctx.lineTo(bx + bo2.w - 4, by); ctx.lineTo(bx + 4, by);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a2840'; ctx.lineWidth = 2; ctx.stroke();
      // 條紋（藍色發光）
      ctx.fillStyle = '#224488'; ctx.fillRect(bx, by + 6, bo2.w, 4);
      ctx.shadowColor = '#4488ff'; ctx.shadowBlur = 5;
      ctx.strokeStyle = '#4488ff'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(bx, by + 8); ctx.lineTo(bx + bo2.w, by + 8); ctx.stroke();
      ctx.shadowBlur = 0;
      // 桅桿
      ctx.strokeStyle = '#1e2e4a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(bx + bo2.w / 2, by); ctx.lineTo(bx + bo2.w / 2, by - 30); ctx.stroke();
      // 旗（深藍）
      ctx.fillStyle = '#1a3366';
      ctx.beginPath(); ctx.moveTo(bx + bo2.w / 2, by - 30); ctx.lineTo(bx + bo2.w / 2 + 14, by - 22); ctx.lineTo(bx + bo2.w / 2, by - 14); ctx.closePath(); ctx.fill();
      // 前端藍燈
      ctx.shadowColor = '#44aaff'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#44aaff';
      ctx.beginPath(); ctx.arc(bx + bo2.w - 4, by + 4, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // 標牌
      ctx.fillStyle = '#3a2010'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('前往第二海', bx + bo2.w / 2, by + bo2.h / 2 + 5);
    }
  }

  _renderMapProp(ctx) {
    const mx = this.MAP_PROP.x, my = this.MAP_PROP.y;
    // 木框
    ctx.fillStyle = '#6a3e10'; ctx.fillRect(mx - 24, my - 28, 48, 38);
    ctx.strokeStyle = '#4a2808'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - 24, my - 28, 48, 38);
    // 地圖紙
    ctx.fillStyle = '#e8d8a0'; ctx.fillRect(mx - 20, my - 24, 40, 30);
    // 地圖內容（簡易圖案）
    ctx.strokeStyle = '#8a6820'; ctx.lineWidth = 1;
    // 陸地輪廓
    ctx.beginPath(); ctx.moveTo(mx - 14, my - 18); ctx.lineTo(mx - 4, my - 12); ctx.lineTo(mx + 8, my - 16); ctx.lineTo(mx + 14, my - 8); ctx.stroke();
    // 海域
    ctx.strokeStyle = '#4488aa'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(mx - 8, my + 2, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx + 8, my, 5, 0, Math.PI * 2); ctx.stroke();
    // 紅X標記
    ctx.strokeStyle = '#cc3322'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(mx + 10, my - 18); ctx.lineTo(mx + 16, my - 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx + 16, my - 18); ctx.lineTo(mx + 10, my - 12); ctx.stroke();
    // 標籤
    ctx.fillStyle = '#4a3010'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('地圖', mx, my + 18);
  }

  _renderBed(ctx) {
    const bx = this.BED.x, by = this.BED.y;
    // Wooden frame
    ctx.fillStyle = '#8a5c2a'; ctx.fillRect(bx - 24, by - 46, 48, 56);
    // Mattress
    ctx.fillStyle = '#e8d8c0'; ctx.fillRect(bx - 20, by - 44, 40, 48);
    // Pillow
    ctx.fillStyle = '#f8f2ea';
    ctx.beginPath(); ctx.roundRect(bx - 16, by - 42, 32, 16, 4); ctx.fill();
    ctx.strokeStyle = '#ddd0c0'; ctx.lineWidth = 1; ctx.strokeRect(bx - 16, by - 42, 32, 16);
    // Blanket
    ctx.fillStyle = '#5872b8'; ctx.fillRect(bx - 20, by - 25, 40, 29);
    ctx.strokeStyle = '#4860a0'; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(bx - 20, by - 20 + i * 8); ctx.lineTo(bx + 20, by - 20 + i * 8); ctx.stroke();
    }
    // Bed frame outline
    ctx.strokeStyle = '#6a3e10'; ctx.lineWidth = 2;
    ctx.strokeRect(bx - 24, by - 46, 48, 56);
    // Label
    ctx.fillStyle = '#aa8855'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('床', bx, by + 16);
  }

  _renderLakePath(ctx) {
    const px = 750, py1 = 252, py2 = 405;
    // Dirt path strip on right edge
    const pg = ctx.createLinearGradient(px - 20, 0, CONFIG.W, 0);
    pg.addColorStop(0, '#c0a878'); pg.addColorStop(0.5, '#b8966a'); pg.addColorStop(1, '#b09060');
    ctx.fillStyle = pg; ctx.fillRect(px - 20, py1, CONFIG.W - (px - 20), py2 - py1);
    ctx.strokeStyle = '#9a7848'; ctx.lineWidth = 1;
    for (let y = py1 + 10; y < py2; y += 20) {
      ctx.beginPath();
      ctx.moveTo(px - 14, y + Math.sin(y * 0.18) * 3);
      ctx.lineTo(CONFIG.W, y + Math.sin(y * 0.18 + 1.2) * 3);
      ctx.stroke();
    }
    // Wooden gate posts
    [[px - 2, py1 + 4], [px - 2, py2 - 32]].forEach(([bpx, bpy]) => {
      ctx.fillStyle = '#6a4010'; ctx.fillRect(bpx, bpy, 11, 30);
      ctx.fillStyle = '#8a5820'; ctx.fillRect(bpx - 2, bpy - 5, 15, 9);
    });
    ctx.strokeStyle = '#5a3508'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(px + 3, py1 + 28); ctx.lineTo(px + 3, py2 - 10); ctx.stroke();
    // Tree silhouettes hinting at forest beyond
    [[CONFIG.W - 12, py1 + 28], [CONFIG.W - 10, py2 - 48]].forEach(([tx, ty]) => {
      ctx.fillStyle = '#3a6810';
      ctx.beginPath(); ctx.arc(tx, ty, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a3008'; ctx.fillRect(tx - 4, ty + 18, 8, 16);
    });
    // Signpost
    ctx.fillStyle = '#5a3508'; ctx.fillRect(px + 12, py1 + 58, 5, 42);
    ctx.fillStyle = '#e8d090'; ctx.fillRect(px + 16, py1 + 54, 60, 34);
    ctx.strokeStyle = '#8a6020'; ctx.lineWidth = 1.5; ctx.strokeRect(px + 16, py1 + 54, 60, 34);
    ctx.fillStyle = '#3a2010'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('湖邊', px + 46, py1 + 72);
    ctx.fillStyle = '#cc4422'; ctx.font = 'bold 15px sans-serif';
    ctx.fillText('→', px + 46, py1 + 88);
  }

  renderPlayer(ctx, p) {
    // Lying in bed
    if (p.lying) {
      const bx = this.BED.x, by = this.BED.y - 20;
      ctx.fillStyle = '#5872b8';
      ctx.beginPath(); ctx.ellipse(bx, by, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f0c890'; ctx.beginPath(); ctx.arc(bx - 14, by - 1, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.arc(bx - 14, by - 1, 8, Math.PI, 0); ctx.fill();
      const t = Date.now() / 700;
      ctx.fillStyle = 'rgba(130,190,255,0.9)'; ctx.textAlign = 'left';
      ctx.font = `${12 + Math.sin(t) * 1.5}px sans-serif`; ctx.fillText('z', bx + 14, by - 18);
      ctx.font = `${10 + Math.sin(t + 1) * 1.5}px sans-serif`; ctx.fillText('z', bx + 20, by - 27);
      ctx.font = `${8 + Math.sin(t + 2) * 1.5}px sans-serif`; ctx.fillText('z', bx + 25, by - 35);
      return;
    }

    const { x, y, w, h, dir } = p;
    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(x,y+2,w/2,5,0,0,Math.PI*2); ctx.fill();
    // Body
    ctx.fillStyle='#3a6ab8'; ctx.fillRect(x-w/2,y-h+10,w,h-10);
    // Head
    ctx.fillStyle='#f0c890'; ctx.beginPath(); ctx.arc(x,y-h+7,w/2+1,0,Math.PI*2); ctx.fill();
    // Hair
    ctx.fillStyle='#3a2010'; ctx.beginPath(); ctx.arc(x,y-h+7,w/2+1,Math.PI,0); ctx.fill();
    // Eyes
    ctx.fillStyle='#222';
    if (dir==='down'||dir==='up') {
      ctx.fillRect(x-5,y-h+8,3,3); ctx.fillRect(x+2,y-h+8,3,3);
    } else if (dir==='right') {
      ctx.fillRect(x+1,y-h+7,3,3);
    } else {
      ctx.fillRect(x-4,y-h+7,3,3);
    }
    // Rod sprite in player's hand
    if (dir==='right'||dir==='down') {
      sprites.rod(ctx, p.equippedRod, x+w/2, y-h+18, x+w/2+28, y-h-10);
    } else {
      sprites.rod(ctx, p.equippedRod, x-w/2, y-h+18, x-w/2-28, y-h-10);
    }
  }

  renderHUD(ctx, player) {
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(8,8,196,80);
    ctx.strokeStyle='#2a4a7a'; ctx.lineWidth=1; ctx.strokeRect(8,8,196,80);

    ctx.fillStyle='#ffdd55'; ctx.font='bold 16px sans-serif'; ctx.textAlign='left';
    ctx.fillText(`💰 $${player.money}`, 18, 30);
    ctx.fillStyle='#aaddff'; ctx.font='14px sans-serif';
    ctx.fillText(`魚餌: ${player.baitCount}  [${player.baitCfg?.name||'無'}]`, 18, 52);
    ctx.fillStyle='#88ff88';
    ctx.fillText(`釣竿: ${player.rod?.name||'無'}`, 18, 72);

    if (player.fish.length>0) {
      ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(CONFIG.W-146,8,138,30);
      ctx.fillStyle='#88ff88'; ctx.font='14px sans-serif'; ctx.textAlign='right';
      ctx.fillText(`🐟 ${player.fish.length} 條魚`, CONFIG.W-14,28);
    }

    if (player._savedAt && Date.now() - player._savedAt < 2000) {
      const a = Math.max(0, 1 - (Date.now() - player._savedAt) / 2000);
      ctx.fillStyle = `rgba(80,220,120,${a})`;
      ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText('💾 進度已儲存', CONFIG.W - 8, CONFIG.H - 34);
    }

    // Controls hint
    ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,CONFIG.H-28,CONFIG.W,28);
    ctx.fillStyle='#445566'; ctx.font='12px sans-serif'; ctx.textAlign='center';
    const hint = touch.isMobile
      ? '左搖桿移動  靠近建築後點上方按鈕互動  🎒背包  🗺️地圖'
      : 'WASD / 方向鍵 移動  E 互動  G 背包  M 地圖';
    ctx.fillText(hint, CONFIG.W/2, CONFIG.H-10);
  }
}
