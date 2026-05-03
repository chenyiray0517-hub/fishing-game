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
    this.fishX       = 0;   this.fishY   = 0;
    this.fishVX      = 2;   this.fishVY  = 0.5;
    this.lineY       = 60;  this.lineVY  = 0;
    this.tugChangeT  = 0;
    this.tugProgress = 0;   // 0→1, reach 1 to catch
    this.tugTimeLeft = 10 * 60;  // 10 seconds
    this.tapCooldown = 0;   // mobile tap cooldown (frames)
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

      // ── Timer ────────────────────────────────────────────────────
      this.tugTimeLeft = Math.max(0, this.tugTimeLeft - 1);

      // ── Fish block movement ──────────────────────────────────────
      this.fishX += this.fishVX;
      this.fishY += this.fishVY;
      if (this.fishX < 0)          { this.fishX = 0;          this.fishVX =  Math.abs(this.fishVX); }
      if (this.fishX > BAR_W - FW) { this.fishX = BAR_W - FW; this.fishVX = -Math.abs(this.fishVX); }
      if (this.fishY < 0)          { this.fishY = 0;          this.fishVY =  Math.abs(this.fishVY); }
      if (this.fishY > BAR_H - FH) { this.fishY = BAR_H - FH; this.fishVY = -Math.abs(this.fishVY); }

      // Random velocity kick
      this.tugChangeT++;
      const period = Math.max(40, 100 - this.tugFish.difficulty * 12);
      if (this.tugChangeT >= period) {
        this.tugChangeT = 0;
        const sp = 1.5 + this.tugFish.difficulty * 0.4;
        this.fishVX = (Math.random() - 0.5) * sp * 2.5;
        this.fishVY = (Math.random() - 0.5) * sp * 1.2;
        if (this.fishX <= 0 && this.fishVX < 0)          this.fishVX =  Math.abs(this.fishVX);
        if (this.fishX >= BAR_W - FW && this.fishVX > 0)  this.fishVX = -Math.abs(this.fishVX);
        if (this.fishY <= 0 && this.fishVY < 0)           this.fishVY =  Math.abs(this.fishVY);
        if (this.fishY >= BAR_H - FH && this.fishVY > 0)  this.fishVY = -Math.abs(this.fishVY);
      }
      const minSpd = 0.6;
      if (Math.abs(this.fishVX) < minSpd) this.fishVX = this.fishVX < 0 ? -minSpd : minSpd;
      if (Math.abs(this.fishVY) < minSpd * 0.5) this.fishVY = this.fishVY < 0 ? -minSpd * 0.5 : minSpd * 0.5;

      // ── Progress mechanic ────────────────────────────────────────
      if (touch.isMobile) {
        // Mobile: tap screen to add progress (with cooldown between taps)
        if (this.tapCooldown > 0) this.tapCooldown--;
        if (touch.tugTapped && this.tapCooldown <= 0) {
          const gain = Math.max(0.045, 0.10 - this.tugFish.difficulty * 0.008);
          this.tugProgress = Math.min(1, this.tugProgress + gain);
          this.tapCooldown = 22; // ~0.37 s at 60 fps
        }
        // Slow decay keeps pressure up (skip if at max to allow win check to fire)
        if (this.tugProgress < 1) this.tugProgress = Math.max(0, this.tugProgress - 0.0006);
      } else {
        // Desktop: mouse Y controls line, overlap with fish block fills progress
        const BAR_Y_abs = CONFIG.H / 2 - BAR_H / 2;
        const targetY = Math.max(0, Math.min(BAR_H, game.mouse.y - BAR_Y_abs));
        this.lineY  += (targetY - this.lineY) * 0.30;
        this.lineY   = Math.max(0, Math.min(BAR_H, this.lineY));
        this.lineVY  = 0;

        const following = this.lineY >= this.fishY && this.lineY <= this.fishY + FH;
        if (following) {
          this.tugProgress = Math.min(1, this.tugProgress + 1 / (4 * 60)); // fill in ~4 s of tracking
        } else {
          this.tugProgress = Math.max(0, this.tugProgress - 1 / (9 * 60)); // drain in ~9 s off target
        }
      }

      // ── Win / lose ───────────────────────────────────────────────
      if (this.tugProgress >= 1) {
        player.catchFish(this.tugFish);
        this.state = 'result'; this.resOk = true;
        this.resFish = this.tugFish; this.resT = 160;
      } else if (this.tugTimeLeft <= 0) {
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
      ctx.fillText(touch.isMobile ? '點擊右下按鈕拋竿' : '按 SPACE 拋竿', cx, by+bh+22);

    } else if (this.state === 'wait') {
      const dots='.'.repeat((Math.floor(this.blink/22)%3)+1);
      ctx.fillStyle='#88ccff'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center';
      ctx.fillText(`等待魚上鉤${dots}`, cx, cy);
      if (!touch.isMobile) {
        ctx.fillStyle='#445566'; ctx.font='13px sans-serif';
        ctx.fillText('ESC 取消', cx, cy+30);
      }

    } else if (this.state === 'bite') {
      if (Math.floor(this.biteT/7)%2===0) {
        ctx.fillStyle='#ffff00'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center';
        ctx.fillText('!! 魚上鉤了 !!', cx, cy-10);
      }
      ctx.fillStyle='#ffcc44'; ctx.font='bold 18px sans-serif'; ctx.textAlign='center';
      ctx.fillText(touch.isMobile ? '快點右下按鈕收竿！' : '快按 SPACE 收竿！', cx, cy+36);
      const pct = 1 - this.biteT/75;
      ctx.fillStyle='rgba(255,200,0,0.5)';
      ctx.fillRect(cx-100*pct, cy+58, 200*pct, 10);

    } else if (this.state === 'tug') {
      ctx.save(); // isolate all tug rendering — prevents any stray ctx state from outside
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      const f = this.tugFish;
      const BAR_W = 520, BAR_H = 120;
      const FW = 80, FH = 40;
      const BAR_X = cx - BAR_W/2, BAR_Y = cy - BAR_H/2;

      // Fish name
      ctx.fillStyle = f.color; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.name, cx, BAR_Y - 80);

      // Labels row
      const secsLeft = Math.ceil(this.tugTimeLeft / 60);
      const timeFrac = this.tugTimeLeft / (10 * 60);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#88ffaa'; ctx.textAlign = 'left';
      ctx.fillText('🎣 釣魚進度', BAR_X, BAR_Y - 52);
      ctx.fillStyle = timeFrac < 0.34 ? '#ff6644' : '#aaddff';
      ctx.textAlign = 'right';
      ctx.fillText(`⏱ 剩餘 ${secsLeft} 秒`, BAR_X + BAR_W, BAR_Y - 52);

      // Progress bar
      const progY = BAR_Y - 46, progH = 24;
      ctx.fillStyle = '#0a1a2e';
      ctx.fillRect(BAR_X, progY, BAR_W, progH);
      const progPct = this.tugProgress;
      const progCol = progPct > 0.75 ? '#44ff88' : progPct > 0.4 ? '#88cc44' : '#22aa55';
      ctx.fillStyle = progCol;
      ctx.fillRect(BAR_X, progY, BAR_W * progPct, progH);
      ctx.strokeStyle = '#3a8a5a'; ctx.lineWidth = 1.5;
      ctx.strokeRect(BAR_X, progY, BAR_W, progH);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(progPct * 100)}%`, cx, progY + progH - 6);

      // Main 2D area
      ctx.fillStyle = '#081828';
      ctx.strokeStyle = '#3a6aaa'; ctx.lineWidth = 2;
      ctx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);
      ctx.strokeRect(BAR_X, BAR_Y, BAR_W, BAR_H);

      // Following: desktop only (line overlaps fish block Y range)
      const following = !touch.isMobile && this.lineY >= this.fishY && this.lineY <= this.fishY + FH;
      const blockColor = touch.isMobile ? '#44aaff' : (following ? '#44ff88' : '#ff9900');

      // ── Fish block ───────────────────────────────────────────────
      const bx = BAR_X + this.fishX, by = BAR_Y + this.fishY;
      const pulse = (Math.sin(Date.now() / 120) + 1) / 2;
      ctx.globalAlpha = 0.35 + pulse * 0.65;
      ctx.strokeStyle = blockColor; ctx.lineWidth = 5;
      ctx.strokeRect(bx - 5, by - 5, FW + 10, FH + 10);
      ctx.globalAlpha = 1;
      ctx.fillStyle = blockColor;
      ctx.fillRect(bx, by, FW, FH);
      ctx.strokeStyle = following ? '#ffffff' : '#ffcc55'; ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, FW, FH);

      // Edge arrows pointing at fish block
      const fishMidX = bx + FW / 2, fishMidY = by + FH / 2;
      ctx.fillStyle = blockColor;
      ctx.beginPath();
      ctx.moveTo(fishMidX - 7, BAR_Y + 1); ctx.lineTo(fishMidX + 7, BAR_Y + 1); ctx.lineTo(fishMidX, BAR_Y + 11);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(BAR_X + BAR_W - 1, fishMidY - 7); ctx.lineTo(BAR_X + BAR_W - 1, fishMidY + 7); ctx.lineTo(BAR_X + BAR_W - 12, fishMidY);
      ctx.closePath(); ctx.fill();

      // ── Desktop: horizontal line controlled by mouse ─────────────
      if (!touch.isMobile) {
        const lineAbsY = BAR_Y + this.lineY;
        ctx.strokeStyle = following ? '#ffff44' : '#ffffff'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(BAR_X + 4, lineAbsY); ctx.lineTo(BAR_X + BAR_W - 4, lineAbsY);
        ctx.stroke();
        ctx.fillStyle = following ? '#ffff44' : '#dddddd';
        ctx.beginPath();
        ctx.moveTo(BAR_X + BAR_W + 4,  lineAbsY);
        ctx.lineTo(BAR_X + BAR_W + 16, lineAbsY - 7);
        ctx.lineTo(BAR_X + BAR_W + 16, lineAbsY + 7);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ffcc66'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('移動滑鼠讓釣線對準方塊，填滿進度！', cx, BAR_Y + BAR_H + 28);
      } else {
        ctx.fillStyle = this.tapCooldown > 0 ? 'rgba(255,200,80,0.9)' : '#aaddff';
        ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(this.tapCooldown > 0 ? '冷卻中...' : '點擊螢幕填進度！', cx, BAR_Y + BAR_H + 28);
      }

      ctx.restore(); // end of tug isolation

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
