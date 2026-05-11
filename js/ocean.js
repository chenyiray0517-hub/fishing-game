class OceanScene {
  constructor() {
    this.fishing = new FishingGame();
    this.waveOff = 0;
    this.bobT    = 0;
    this.sparkles= this.initSparkles();
    this.monsterMgr = new MonsterManager('drowned');
  }

  initSparkles() {
    return Array.from({length:30}, ()=>({
      x: Math.random()*CONFIG.W, y: Math.random()*CONFIG.H,
      r: Math.random()*0.8+0.3, phase: Math.random()*Math.PI*2,
    }));
  }

  nearbySpot(player) {
    for (const s of CONFIG.SPOTS) {
      if (Math.hypot(player.bx-s.x, player.by-s.y) < s.r+36) return s;
    }
    return null;
  }

  update(keys, spaceDown, player) {
    this.waveOff += 0.014;
    this.bobT    += 0.045;
    this.monsterMgr.update(player.bx, player.by);

    if (this.fishing.state) {
      this.fishing.update(keys, spaceDown, player);
      return;
    }

    let dx=0, dy=0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx=-1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx= 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy=-1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy= 1;
    if (dx && dy) { dx*=0.707; dy*=0.707; }

    const spd=CONFIG.BOAT_SPEED, mg=44;
    player.bx = Math.max(mg, Math.min(CONFIG.W-mg, player.bx+dx*spd));
    player.by = Math.max(mg, Math.min(CONFIG.H-mg, player.by+dy*spd));
  }

  tryFish(player) {
    if (this.fishing.state) return;
    const s = this.nearbySpot(player);
    if (!s) return;
    if (player.baitCount <= 0) return;
    this.fishing.start(s, player);
  }

  render(ctx, player) {
    // Deep ocean gradient
    const g = ctx.createLinearGradient(0,0,0,CONFIG.H);
    g.addColorStop(0,'#071830'); g.addColorStop(1,'#0a3a60');
    ctx.fillStyle=g; ctx.fillRect(0,0,CONFIG.W,CONFIG.H);

    // Sparkles (stars on water)
    const t = Date.now()/1000;
    for (const sp of this.sparkles) {
      const a = (Math.sin(sp.phase+t*1.2)+1)/2*0.5+0.1;
      ctx.fillStyle=`rgba(160,220,255,${a})`;
      ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.r,0,Math.PI*2); ctx.fill();
    }

    // Wave lines
    ctx.lineWidth=1.5;
    for(let w=0;w<6;w++){
      const alpha=0.06+w*0.015;
      ctx.strokeStyle=`rgba(100,180,255,${alpha})`;
      ctx.beginPath();
      for(let x=0;x<=CONFIG.W;x+=14){
        const wy=(w*100+this.waveOff*22)%CONFIG.H + Math.sin(x/70+this.waveOff+w*0.6)*7;
        x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
      }
      ctx.stroke();
    }

    // Fishing spots
    for (const s of CONFIG.SPOTS) {
      // Ripple rings
      for(let ring=0;ring<3;ring++){
        const phase=(t*0.65+ring*0.33)%1;
        const r2=s.r*(0.4+phase*0.9), alpha=(1-phase)*0.45;
        ctx.strokeStyle=`rgba(80,200,255,${alpha})`;
        ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(s.x,s.y,r2,0,Math.PI*2); ctx.stroke();
      }
      // Center glow
      const glow=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r);
      glow.addColorStop(0,'rgba(80,200,255,0.18)');
      glow.addColorStop(1,'rgba(80,200,255,0)');
      ctx.fillStyle=glow;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      // Name label
      ctx.fillStyle='rgba(160,220,255,0.75)'; ctx.font='12px sans-serif'; ctx.textAlign='center';
      ctx.fillText(s.name, s.x, s.y-s.r-8);
    }

    // Nearby indicator
    if (!this.fishing.state) {
      const ns = this.nearbySpot(player);
      if (ns) {
        const hasBait = player.baitCount > 0;
        ctx.fillStyle='rgba(0,0,0,0.75)';
        ctx.beginPath(); ctx.roundRect(player.bx-52,player.by-72,104,28,6); ctx.fill();
        ctx.fillStyle=hasBait?'#ffff44':'#ff6644'; ctx.font='bold 13px sans-serif'; ctx.textAlign='center';
        ctx.fillText(hasBait?'[E] 開始釣魚':'魚餌不足！', player.bx, player.by-53);
      }
    }

    this.renderBoat(ctx, player);
    game.daynight.applyOverlay(ctx);
    this.monsterMgr.render(ctx);
    this.fishing.render(ctx);
    this.renderHUD(ctx, player);
  }

  renderBoat(ctx, p) {
    const bob=Math.sin(this.bobT)*2.5;
    ctx.save();
    ctx.translate(p.bx, p.by+bob);

    // Shadow on water
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0,8,34,8,0,0,Math.PI*2); ctx.fill();

    // Hull
    ctx.fillStyle='#e8d090';
    ctx.beginPath();
    ctx.moveTo(-32,-10); ctx.lineTo(32,-10);
    ctx.lineTo(26, 12); ctx.lineTo(-26,12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#8a6020'; ctx.lineWidth=2; ctx.stroke();

    // Stripe
    ctx.fillStyle='#cc4444';
    ctx.fillRect(-32,-2,64,5);

    // Cabin
    ctx.fillStyle='#c8b870'; ctx.fillRect(-16,-24,32,14);
    ctx.strokeStyle='#8a6020'; ctx.lineWidth=1; ctx.strokeRect(-16,-24,32,14);
    // Cabin window
    ctx.fillStyle='rgba(180,230,255,0.7)'; ctx.fillRect(-8,-22,14,10);

    // Mast
    ctx.strokeStyle='#7a5520'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,-24); ctx.lineTo(0,-52); ctx.stroke();
    // Flag
    ctx.fillStyle='#cc3333';
    ctx.beginPath(); ctx.moveTo(0,-52); ctx.lineTo(18,-44); ctx.lineTo(0,-36); ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  renderHUD(ctx, player) {
    // Top bar
    ctx.fillStyle='rgba(0,5,15,0.7)'; ctx.fillRect(0,0,CONFIG.W,46);
    ctx.strokeStyle='#1a3a5a'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0,46); ctx.lineTo(CONFIG.W,46); ctx.stroke();

    ctx.fillStyle='#ffdd55'; ctx.font='bold 16px sans-serif'; ctx.textAlign='left';
    ctx.fillText(`💰 $${player.money}`, 14, 28);
    ctx.fillStyle='#aaddff';
    ctx.fillText(`🪱 魚餌 ${player.baitCount}`, 128, 28);
    ctx.fillStyle='#88ff88';
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
      ctx.fillStyle='#334455'; ctx.font='13px sans-serif'; ctx.textAlign='right';
      ctx.fillText('ESC 返回港口', CONFIG.W-14, 28);
    }
  }
}
