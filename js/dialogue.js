class DialogueSystem {
  constructor() {
    this.active = false;
    this.npc    = null;
    this.line   = 0;
  }

  start(npc) {
    this.npc    = npc;
    this.line   = 0;
    this.active = true;
  }

  advance() {
    if (!this.active) return;
    this.line++;
    if (this.line >= this.npc.lines.length) this.close();
  }

  close() {
    this.active = false;
    this.npc    = null;
    this.line   = 0;
  }

  render(ctx) {
    if (!this.active) return;
    const text   = this.npc.lines[this.line];
    const isLast = this.line >= this.npc.lines.length - 1;

    const PW = 620, PH = 118;
    const PX = (CONFIG.W - PW) / 2;
    const PY = CONFIG.H - PH - 14;

    ctx.fillStyle = 'rgba(4,10,26,0.93)';
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 12); ctx.fill();
    ctx.strokeStyle = '#3a6aaa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 12); ctx.stroke();

    // Name
    ctx.fillStyle = this.npc.color || '#88ccff';
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(this.npc.name, PX + 18, PY + 22);

    // Divider
    ctx.strokeStyle = 'rgba(80,130,200,0.30)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 14, PY + 30); ctx.lineTo(PX + PW - 14, PY + 30); ctx.stroke();

    // Text body
    ctx.fillStyle = '#ddeeff';
    ctx.font = '15px sans-serif';
    _dlgWrap(ctx, text, PX + 18, PY + 55, PW - 36, 23);

    // Hint
    const hint = isLast
      ? (touch.isMobile ? '（點擊關閉）' : '[E] 關閉')
      : (touch.isMobile ? '（點擊繼續）' : '[E] 繼續');
    ctx.fillStyle = '#445566'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(hint, PX + PW - 12, PY + PH - 8);

    // Blinking arrow
    if (!isLast && Math.floor(Date.now() / 420) % 2) {
      ctx.fillStyle = '#6688cc'; ctx.font = 'bold 13px sans-serif';
      ctx.fillText('▼', PX + PW - 12, PY + PH - 24);
    }
  }
}

function _dlgWrap(ctx, text, x, y, maxW, lineH) {
  let line = '', cy = y;
  for (let i = 0; i < text.length; i++) {
    const test = line + text[i];
    if (ctx.measureText(test).width > maxW && line.length > 0) {
      ctx.fillText(line, x, cy);
      line = text[i];
      cy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

// Quest marker bubble above a quest NPC  ('!' = available, '✓' = claimable, null = in progress)
function drawQuestMarker(ctx, x, y, markerType) {
  if (!markerType) return;
  const by = y - 54;
  const col = markerType === '✓' ? '#44ff88' : '#ffdd00';
  ctx.save();
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(x, by, 13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.40)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, by, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(markerType, x, by + 5);
  ctx.restore();
}

// Shared generic person sprite — called by each scene
function drawNPCSprite(ctx, x, y, bodyColor, hairColor) {
  const w = 22, h = 32;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(x, y + 2, w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - w / 2, y - h + 10, w, h - 10);
  ctx.fillStyle = '#f0c890';
  ctx.beginPath(); ctx.arc(x, y - h + 7, w / 2 + 1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hairColor;
  ctx.beginPath(); ctx.arc(x, y - h + 7, w / 2 + 1, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.fillRect(x - 5, y - h + 8, 3, 3);
  ctx.fillRect(x + 2, y - h + 8, 3, 3);
}
