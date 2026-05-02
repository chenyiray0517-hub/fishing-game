class FishingGame {
  constructor() { this.reset(); }

  reset() {
    this.state    = null; // null|'cast'|'wait'|'bite'|'tug'|'result'
    this.spot     = null;
    this.castPow  = 0;
    this.castDir  = 1;
    this.waitT    = 0;
    this.waitDur  = 0;
    this.blink    = 0;
    this.biteT    = 0;
    this.tugFish  = null;
    this.resOk    = false;
    this.resFish  = null;
    this.resT     = 0;
    // Tug minigame
    this.fishX    = 0;  this.fishY  = 0;
    this.fishVX   = 2;  this.fishVY = 0.5;
    this.lineY    = 60; this.lineVY = 0;
    this.tugTotal = 0;  this.followT = 0;
    this.tugChangeT = 0;
  }

  start(spot, player) {
    if (!player.useBait()) return false;
    this.spot    = spot;
    this.state   = 'cast';
    this.castPow = 0; this.castDir = 1;
    return true;
  }

  cancel(player) {
    if (this.state === 'cast' || this.state === 'wait') player.refundBait();
    this.reset();
  }

  update(keys, spaceDown, player) {
    if (!this.state) return;

    if (this.state === 'cast') {
      this.castPow += this.castDir * 0.022;
      if (this.castPow >= 1) { this.castPow = 1; this.castDir = -1; }
      if (this.castPow <= 0) { this.castPow = 0; this.castDir =  1; }
      if (spaceDown) {
        this.state   = 'wait';
        const [lo, hi] = this.spot.biteTime;
        this.waitDur = Math.round((lo + Math.random()*(hi-lo)) * 60 * player.getBiteMultiplier());
        this.waitT   = 0; this.blink = 0;
      }

    } else if (this.state === 'wait') {
      this.waitT++; this.blink++;
      if (this.waitT >= this.waitDur) {
        this.state   = 'bite';
        const ids    = this.spot.fish;
        this.tugFish = { ...CONFIG.FISH.find(f => f.id === ids[Math.floor(Math.random()*ids.length)]) };
        this.biteT   = 0;
      }

    } else if (this.state === 'bite') {
      this.biteT++;
      if (spaceDown) {
        this.state = 'tug';
        const sp = 1.5 + this.tugFish.difficulty * 0.4;
        this.fishX      = 220; // center of 520-80
        this.fishY      = 40;  // center of 120-40
        this.fishVX     = (Math.random() > 0.5 ? 1 : -1) * sp;
        this.fishVY     = (Math.random() > 0.5 ? 0.5 : -0.5) * sp * 0.4;
        this.lineY      = 60;  // middle of bar
        this.lineVY     = 0;
        this.tugTotal   = 0;
        this.followT    = 0;
        this.tugChangeT = 0;
      } else if (this.biteT > 75) {
        this.state   = 'result'; this.resOk = false;
        this.resFish = this.tugFish; this.resT = 100;
      }

    } else if (this.state === 'tug') {
      const BAR_W = 520, BAR_H = 120;
      const FW = 80, FH = 40;
      const TUG_FRAMES    = 15 * 60; // 15 seconds
      const FOLLOW_NEEDED =  6 * 60; // need 6 seconds overlap

      this.tugTotal++;

      // ── Fish block movement ──────────────────────────────────────
      this.fishX += this.fishVX;
      this.fishY += this.fishVY;
      if (this.fishX < 0)          { this.fishX = 0;          this.fishVX =  Math.abs(this.fishVX); }
      if (this.fishX > BAR_W - FW) { this.fishX = BAR_W - FW; this.fishVX = -Math.abs(this.fishVX); }
      if (this.fishY < 0)          { this.fishY = 0;          this.fishVY =  Math.abs(this.fishVY); }
      if (this.fishY > BAR_H - FH) { this.fishY = BAR_H - FH; this.fishVY = -Math.abs(this.fishVY); }

      // Random velocity kick — harder fish change more often
      this.tugChangeT++;
      const period = Math.max(40, 100 - this.tugFish.difficulty * 12);
      if (this.tugChangeT >= period) {
        this.tugChangeT = 0;
        const sp = 1.5 + this.tugFish.difficulty * 0.4;
        this.fishVX = (Math.random() - 0.5) * sp * 2.5;
        this.fishVY = (Math.random() - 0.5) * sp * 1.2;
      }
      // Ensure fish never stops — guarantee minimum speed
      const minSpd = 0.6;
      if (Math.abs(this.fishVX) < minSpd) this.fishVX = this.fishVX < 0 ? -minSpd : minSpd;
      if (Math.abs(this.fishVY) < minSpd * 0.5) this.fishVY = this.fishVY < 0 ? -minSpd * 0.5 : minSpd * 0.5;

      // ── Player line physics ──────────────────────────────────────
      if (keys[' '] || keys['Space']) this.lineVY -= 0.8; // SPACE → up
      this.lineVY += 0.3;   // gravity → down
      this.lineVY *= 0.92;  // damping
      this.lineY  += this.lineVY;
      if (this.lineY < 0)     { this.lineY = 0;     this.lineVY = 0; }
      if (this.lineY > BAR_H) { this.lineY = BAR_H; this.lineVY = 0; }

      // ── Overlap: line Y inside fish block Y range ────────────────
      if (this.lineY >= this.fishY && this.lineY <= this.fishY + FH) {
        this.followT++;
      }

      // ── Win / lose ───────────────────────────────────────────────
      if (this.followT >= FOLLOW_NEEDED) {
        player.catchFish(this.tugFish);
        this.state = 'result'; this.resOk = true;
        this.resFish = this.tugFish; this.resT = 160;
      } else if (this.tugTotal >= TUG_FRAMES) {
        this.state = 'result'; this.resOk = false;
        this.resFish = this.tugFish; this.resT = 120;
      }

    } else if (this.state === 'result') {
      this.resT--;
      if (this.resT <= 0) this.reset();
    }
  }

  render(ctx) {
    if (!this.state) return;

    const cx = CONFIG.W/2, cy = CONFIG.H/2;
    ctx.fillStyle = 'rgba(0,5,20,0.65)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    if (this.state === 'cast') {
      const bw=54, bh=200, bx=cx-bw/2, by=cy-bh/2-10;
      ctx.fillStyle = '#0d1a28'; ctx.strokeStyle = '#3a6aaa'; ctx.lineWidth=2;
      ctx.fillRect(bx,by,bw,bh); ctx.strokeRect(bx,by,bw,bh);
      const fh = this.castPow * (bh-4);
      const col = this.castPow>0.85?'#ff4444':this.castPow>0.5?'#ffaa00':'#44cc66';
      ctx.fillStyle=col; ctx.fillRect(bx+2, by+bh-2-fh, bw-4, fh);
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1;
      for(let i=1;i<4;i++){
        const ty=by+bh*i/4;
        ctx.beginPath(); ctx.moveTo(bx,ty); ctx.lineTo(bx+bw,ty); ctx.stroke();
      }
      ctx.fillStyle='#cce8ff'; ctx.font='bold 15px sans-serif'; ctx.textAlign='center';
      ctx.fillText('拋竿力道', cx, by-12);
      ctx.fillStyle='#ffff88'; ctx.font='14px sans-serif';
      ctx.fillText('按 SPACE 拋竿', cx, by+bh+22);

    } else if (this.state === 'wait') {
      const dots='.'.repeat((Math.floor(this.blink/22)%3)+1);
      ctx.fillStyle='#88ccff'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
      ctx.fillText(`等待魚上鉤${dots}`, cx, cy);
      ctx.fillStyle='#445566'; ctx.font='13px sans-serif';
      ctx.fillText('ESC 取消', cx, cy+30);

    } else if (this.state === 'bite') {
      if (Math.floor(this.biteT/7)%2===0) {
        ctx.fillStyle='#ffff00'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center';
        ctx.fillText('!! 魚上鉤了 !!', cx, cy-10);
      }
      ctx.fillStyle='#ffcc44'; ctx.font='bold 18px sans-serif'; ctx.textAlign='center';
      ctx.fillText('快按 SPACE 收竿！', cx, cy+36);
      const pct = 1 - this.biteT/75;
      ctx.fillStyle='rgba(255,200,0,0.5)';
      ctx.fillRect(cx-100*pct, cy+58, 200*pct, 10);

    } else if (this.state === 'tug') {
      const f = this.tugFish;
      const BAR_W = 520, BAR_H = 120;
      const FW = 80, FH = 40;
      const BAR_X = cx - BAR_W/2, BAR_Y = cy - BAR_H/2;
      const TUG_FRAMES    = 15 * 60;
      const FOLLOW_NEEDED =  6 * 60;
      const following = this.lineY >= this.fishY && this.lineY <= this.fishY + FH;

      // Fish name
      ctx.fillStyle = f.color; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.name, cx, BAR_Y - 52);

      // ── Two info bars above the main bar ────────────────────────
      const infoW = BAR_W, infoH = 14;
      const infoX = BAR_X;

      // Bar 1: game time countdown  (top)
      const infoY1 = BAR_Y - 34;
      ctx.fillStyle = '#0a1a2e';
      ctx.fillRect(infoX, infoY1, infoW, infoH);
      const timePct = Math.max(0, (TUG_FRAMES - this.tugTotal) / TUG_FRAMES);
      ctx.fillStyle = timePct < 0.34 ? '#ff6644' : '#3a6aaa';
      ctx.fillRect(infoX, infoY1, infoW * timePct, infoH);
      ctx.strokeStyle = '#3a6aaa'; ctx.lineWidth = 1;
      ctx.strokeRect(infoX, infoY1, infoW, infoH);
      const remaining = Math.ceil(Math.max(0, TUG_FRAMES - this.tugTotal) / 60);
      ctx.fillStyle = timePct < 0.34 ? '#ff8866' : '#aaddff';
      ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`⏱ 剩餘時間  ${remaining} 秒`, infoX + 4, infoY1 - 3);

      // Bar 2: follow progress  (below bar 1)
      const infoY2 = BAR_Y - 14;
      ctx.fillStyle = '#0a1a2e';
      ctx.fillRect(infoX, infoY2, infoW, infoH);
      const followPct = Math.min(1, this.followT / FOLLOW_NEEDED);
      ctx.fillStyle = followPct > 0.8 ? '#44ff88' : followPct > 0.4 ? '#88cc44' : '#22aa44';
      ctx.fillRect(infoX, infoY2, infoW * followPct, infoH);
      ctx.strokeStyle = '#3a6aaa'; ctx.lineWidth = 1;
      ctx.strokeRect(infoX, infoY2, infoW, infoH);
      const followSec = Math.min(6, this.followT / 60);
      ctx.fillStyle = '#88ff88';
      ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`🎣 跟釣進度  ${followSec.toFixed(1)} / 6.0 秒`, infoX + 4, infoY2 - 3);

      // Main bar background
      ctx.fillStyle = '#081828';
      ctx.strokeStyle = '#3a6aaa'; ctx.lineWidth = 2;
      ctx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
      ctx.strokeRect(BAR_X, BAR_Y, BAR_W, BAR_H);

      // Fish block — always draw with outline so it's never invisible
      const bx = BAR_X + this.fishX, by = BAR_Y + this.fishY;
      ctx.fillStyle = following ? '#44ff88' : '#22dd55';
      ctx.fillRect(bx, by, FW, FH);
      ctx.strokeStyle = following ? '#aaffcc' : '#55ee77';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, FW, FH);

      // Player line (horizontal, full bar width)
      const lineAbsY = BAR_Y + this.lineY;
      ctx.strokeStyle = following ? '#ffff44' : '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(BAR_X + 4, lineAbsY);
      ctx.lineTo(BAR_X + BAR_W - 4, lineAbsY);
      ctx.stroke();
      // Arrow on right edge
      ctx.fillStyle = following ? '#ffff44' : '#dddddd';
      ctx.beginPath();
      ctx.moveTo(BAR_X + BAR_W + 4,  lineAbsY);
      ctx.lineTo(BAR_X + BAR_W + 16, lineAbsY - 7);
      ctx.lineTo(BAR_X + BAR_W + 16, lineAbsY + 7);
      ctx.closePath(); ctx.fill();

      // Instruction
      ctx.fillStyle = '#ffcc66'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('按住 SPACE 讓線往上，跟著綠色方塊！', cx, BAR_Y + BAR_H + 28);

    } else if (this.state === 'result') {
      if (this.resOk) {
        const alpha = Math.min(1, this.resT/30);
        ctx.fillStyle=`rgba(50,220,100,${alpha})`; ctx.font='bold 30px sans-serif'; ctx.textAlign='center';
        ctx.fillText('釣到了！', cx, cy-18);
        ctx.fillStyle=this.resFish.color; ctx.font='bold 24px sans-serif';
        ctx.fillText(this.resFish.name, cx, cy+18);
        ctx.fillStyle='#ffdd55'; ctx.font='20px sans-serif';
        ctx.fillText(`+$${this.resFish.value}`, cx, cy+50);
      } else {
        ctx.fillStyle='rgba(220,70,50,0.9)'; ctx.font='bold 30px sans-serif'; ctx.textAlign='center';
        ctx.fillText('魚跑掉了！', cx, cy);
      }
    }
  }
}
