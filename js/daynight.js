class DayNight {
  constructor() {
    // 10 分鐘一輪：白天 5 分鐘、黃昏 30 秒、夜晚 4 分鐘、黎明 30 秒
    this.CYCLE  = 600;
    this.DUSK_S = 300;
    this.DUSK_E = 330;
    this.DAWN_S = 570;

    // 上層星星（y<42）：港口場景可見（HUD 在左側），其他場景被 HUD 頂欄蓋住
    this._topStars = [
      [60,12],[150,8],[240,22],[340,10],[435,26],[530,8],[625,20],[725,14],[772,28],
    ];
    // 下層星星（y=52..82）：HUD 頂欄下方，所有場景都可見
    this._botStars = [
      [38,56],[130,72],[230,52],[335,68],[438,80],[545,58],[642,74],[740,58],[770,82],
    ];
  }

  get _t()         { return (Date.now() / 1000) % this.CYCLE; }

  get nightAlpha() {
    const t = this._t;
    if (t < this.DUSK_S)  return 0;
    if (t < this.DUSK_E)  return (t - this.DUSK_S) / (this.DUSK_E - this.DUSK_S);
    if (t < this.DAWN_S)  return 1;
    return 1 - (t - this.DAWN_S) / (this.CYCLE - this.DAWN_S);
  }

  // 在世界層（玩家、背景）之後、HUD 之前呼叫。
  // 秘密池塘永遠是夜晚，不呼叫此方法。
  applyOverlay(ctx) {
    const a = this.nightAlpha;
    if (a <= 0.005) return;

    // ── 暗色遮罩 ──────────────────────────────────────────────────────
    ctx.fillStyle = `rgba(0,4,18,${(a * 0.74).toFixed(3)})`;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    if (a > 0.18) {
      const sa = Math.min(1, (a - 0.18) / 0.35);
      const now = Date.now();

      // 上層星星：只在港口場景繪製（其他場景 HUD 頂欄會蓋住）
      if (typeof game !== 'undefined' && game.scene === 'harbor') {
        for (const [sx, sy] of this._topStars) {
          const tw = (Math.sin(now / 820 + sx * 0.07) + 1) / 2;
          ctx.fillStyle = `rgba(255,255,255,${((0.20 + tw * 0.60) * sa).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(sx, sy, 1.0 + tw * 0.55, 0, Math.PI * 2); ctx.fill();
        }
      }

      // 下層星星：所有場景皆繪製（HUD 頂欄 y=0..46 以下可見）
      for (const [sx, sy] of this._botStars) {
        const tw = (Math.sin(now / 950 + sx * 0.05) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${((0.18 + tw * 0.55) * sa).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(sx, sy, 1.0 + tw * 0.50, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ── 月亮（y=52，在 HUD 頂欄 y=46 以下，所有場景皆可見）─────────
    if (a > 0.42) {
      const ma = Math.min(1, (a - 0.42) / 0.28);
      ctx.save();
      ctx.globalAlpha = ma;
      ctx.shadowColor = '#a0c8ff'; ctx.shadowBlur = 22;
      ctx.fillStyle = '#eaf4ff';
      ctx.beginPath(); ctx.arc(710, 52, 18, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#c4d8ee';
      ctx.beginPath(); ctx.arc(704, 47, 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(716, 58, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // 右上角時間小徽章（在 game.js render 末尾呼叫）
  renderBadge(ctx) {
    const a = this.nightAlpha;
    let icon, label, col;
    if      (a < 0.08) { icon = '☀️'; label = '白天'; col = '#ffee55'; }
    else if (a < 0.50) { icon = '🌆'; label = '黃昏'; col = '#ff9944'; }
    else if (a > 0.92) { icon = '🌙'; label = '夜晚'; col = '#aaddff'; }
    else               { icon = '🌅'; label = '黎明'; col = '#ffbb88'; }

    const bx = CONFIG.W - 88, by = 48, bw = 80, bh = 22;
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 5); ctx.fill();
    ctx.fillStyle = col; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${icon} ${label}`, bx + bw / 2, by + 15);
  }
}
