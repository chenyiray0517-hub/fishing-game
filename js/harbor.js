class HarborScene {
  constructor() {
    this.WATER_Y = 405;
    this.PIER    = { x:316, y:405, w:168, h:148 };
    this.BOAT    = { x:358, y:460, w:84, h:48 };

    this.BUILDINGS = [
      { x:45,  y:88, w:158, h:148, type:'rod',     label:'釣竿商店', color:'#3d2a18', roof:'#7a5520', winCol:'#c8e8ff' },
      { x:228, y:88, w:158, h:148, type:'bait',    label:'魚餌商店', color:'#182838', roof:'#1a5a7a', winCol:'#c8ffd8' },
      { x:414, y:88, w:158, h:148, type:'upgrade', label:'升級商店', color:'#1e2e18', roof:'#3a6620', winCol:'#ffd8c8' },
      { x:600, y:88, w:152, h:148, type:'market',  label:'魚市場',   color:'#2e1818', roof:'#7a2020', winCol:'#ffeec8' },
    ];

    this.waveOff = 0;
    this.bobT    = 0;
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

    // Water
    if (y > this.WATER_Y) {
      const P = this.PIER;
      if (x < P.x+8 || x > P.x+P.w-8) return false;
      if (y > P.y+P.h-8) return false;
    }
    return true;
  }

  update(keys, player) {
    this.waveOff += 0.018;
    this.bobT += 0.04;

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

    // Nearby prompt
    const n = this.nearby(player);
    if (n) {
      const SHOP_LABELS = { rod:'釣竿商店', bait:'魚餌商店', upgrade:'升級商店', market:'魚市場' };
      const labelText = n.type === 'boat' ? '出海' : (SHOP_LABELS[n.shopType] || '進入');
      const label = touch.isMobile ? `👆 ${labelText}` : `[E] ${labelText}`;
      const tw = ctx.measureText(label).width + 24;
      const bx = player.x - tw / 2, by = player.y - 64;
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.beginPath(); ctx.roundRect(bx, by, tw, 28, 7); ctx.fill();
      ctx.fillStyle = '#ffff44'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(label, player.x, player.y - 44);
      // Register tap area for mobile (slightly larger than visual button)
      touch.setInteractRect(bx - 10, by - 10, tw + 20, 48);
    } else {
      touch.clearInteractRect();
    }

    this.renderPlayer(ctx, player);
    this.renderHUD(ctx, player);
  }

  renderPlayer(ctx, p) {
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
    // Rod (if equipped, show small rod)
    ctx.strokeStyle='#8B6914'; ctx.lineWidth=2;
    if (dir==='right'||dir==='down') {
      ctx.beginPath(); ctx.moveTo(x+w/2,y-h+18); ctx.lineTo(x+w/2+16,y-h-4); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(x-w/2,y-h+18); ctx.lineTo(x-w/2-16,y-h-4); ctx.stroke();
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
    const hint = touch.isMobile ? '左搖桿移動  靠近建築後點上方按鈕互動' : 'WASD / 方向鍵 移動  E 互動';
    ctx.fillText(hint, CONFIG.W/2, CONFIG.H-10);
  }
}
