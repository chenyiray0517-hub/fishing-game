class GameMap {
  constructor() {
    this.open = false;
  }

  toggle() { this.open = !this.open; }
  close()  { this.open = false; }

  handleKey(key) {
    const k = key.toLowerCase();
    if (key === 'Escape' || k === 'm') this.close();
  }

  handleTouch(p) {
    // 關閉按鈕
    if (p.x > CONFIG.W - 76 && p.x < CONFIG.W - 34 && p.y > 40 && p.y < 80) {
      this.close();
    }
    // 點任意地方也可關閉（點在面板外）
    const PX = 40, PY = 30, PW = 720, PH = 540;
    if (p.x < PX || p.x > PX + PW || p.y < PY || p.y > PY + PH) this.close();
  }

  render(ctx, player) {
    if (!this.open) return;

    // ── 遮罩 ─────────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(4,8,20,0.92)';
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);

    // ── 面板 ─────────────────────────────────────────────────────────
    const PX = 40, PY = 30, PW = 720, PH = 540;
    ctx.fillStyle = '#060e1e';
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 16); ctx.fill();
    ctx.strokeStyle = '#1e3a6a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(PX, PY, PW, PH, 16); ctx.stroke();

    // 羊皮紙底紋
    ctx.fillStyle = 'rgba(255,220,140,0.025)';
    for (let i = 0; i < 8; i++) {
      const rx = PX + 30 + i * 84, ry = PY + 80;
      ctx.beginPath(); ctx.ellipse(rx, ry + i * 50, 60, 200, 0.2, 0, Math.PI * 2); ctx.fill();
    }

    // ── 標題 ─────────────────────────────────────────────────────────
    ctx.fillStyle = '#aaccff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🗺️  世界地圖', CONFIG.W / 2, PY + 38);
    ctx.strokeStyle = '#1a3060'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX + 20, PY + 50); ctx.lineTo(PX + PW - 20, PY + 50); ctx.stroke();

    // 關閉按鈕
    ctx.fillStyle = '#3a2010';
    ctx.beginPath(); ctx.roundRect(CONFIG.W - 76, PY + 10, 32, 28, 7); ctx.fill();
    ctx.fillStyle = '#ffaa55'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✕', CONFIG.W - 60, PY + 29);

    // ── 節點定義 ─────────────────────────────────────────────────────
    // 位置（相對面板）
    const N = {
      harbor: { x: 195, y: 280 },
      ocean:  { x: 195, y: 420 },
      ocean2: { x: 385, y: 440 },
      lake:   { x: 420, y: 270 },
      beach:  { x: 590, y: 370 },
      pond:   { x: 570, y: 160 },
    };
    const nodes = [
      { id: 'harbor', name: '港口',     icon: '⚓', tier: '出發基地',   col: '#6699cc', ...N.harbor },
      { id: 'ocean',  name: '第一海',   icon: '🌊', tier: '初~高級',    col: '#2288cc', ...N.ocean  },
      { id: 'ocean2', name: '第二海',   icon: '🌀', tier: '中~稀有',    col: '#4466aa', ...N.ocean2 },
      { id: 'lake',   name: '湖邊',     icon: '🌿', tier: '初~中級',    col: '#228844', ...N.lake   },
      { id: 'beach',  name: '海灘',     icon: '🏖️', tier: '中~高級',    col: '#cc9922', ...N.beach  },
      { id: 'pond',   name: '秘密池塘', icon: '✨', tier: '高~稀有',    col: '#9944cc', ...N.pond   },
    ];
    const connections = [
      { a: 'harbor', b: 'lake',   label: '步行' },
      { a: 'harbor', b: 'ocean',  label: '第一海' },
      { a: 'ocean',  b: 'ocean2', label: '🌀需海圖' },
      { a: 'lake',   b: 'beach',  label: '🏖️需地圖' },
      { a: 'lake',   b: 'pond',   label: '✨需地圖' },
    ];

    const unlocked = id => player.isUnlocked(id) || id === 'harbor';

    // ── 連接線 ───────────────────────────────────────────────────────
    for (const c of connections) {
      const na = nodes.find(n => n.id === c.a);
      const nb = nodes.find(n => n.id === c.b);
      const bothOk = unlocked(c.a) && unlocked(c.b);
      ctx.setLineDash(bothOk ? [] : [7, 5]);
      ctx.strokeStyle = bothOk ? 'rgba(100,160,255,0.55)' : 'rgba(70,70,110,0.35)';
      ctx.lineWidth = bothOk ? 2.5 : 1.8;

      const ax = PX + na.x, ay = PY + na.y;
      const bx = PX + nb.x, by = PY + nb.y;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.setLineDash([]);

      // 中點標籤
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const pill_w = ctx.measureText(c.label).width + 14;
      ctx.fillStyle = 'rgba(8,14,30,0.85)';
      ctx.beginPath(); ctx.roundRect(mx - pill_w / 2, my - 9, pill_w, 18, 5); ctx.fill();
      ctx.fillStyle = bothOk ? '#88aacc' : '#446688';
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(c.label, mx, my + 4);
    }

    // ── 節點 ─────────────────────────────────────────────────────────
    const currentScene = game.scene === 'ocean2' ? 'ocean2'
                       : game.scene === 'ocean'  ? 'ocean'
                       : game.scene;
    const NW = 104, NH = 72;

    for (const n of nodes) {
      const nx = PX + n.x, ny = PY + n.y;
      const ok  = unlocked(n.id);
      const cur = currentScene === n.id;

      // 外光暈（當前位置）
      if (cur) {
        ctx.shadowColor = n.col; ctx.shadowBlur = 20;
      }

      // 節點底色
      ctx.fillStyle = ok
        ? (cur ? `${n.col}44` : 'rgba(12,24,50,0.85)')
        : 'rgba(14,14,28,0.85)';
      ctx.beginPath(); ctx.roundRect(nx - NW / 2, ny - NH / 2, NW, NH, 10); ctx.fill();

      // 邊框
      ctx.strokeStyle = ok ? (cur ? n.col : '#2a4a70') : '#1e1e38';
      ctx.lineWidth   = cur ? 2.5 : 1.5;
      ctx.beginPath(); ctx.roundRect(nx - NW / 2, ny - NH / 2, NW, NH, 10); ctx.stroke();
      ctx.shadowBlur  = 0;

      // 圖示
      ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(ok ? n.icon : '🔒', nx, ny - 8);

      // 名稱
      ctx.fillStyle = ok ? '#cce8ff' : '#3a4a60';
      ctx.font = `bold 13px sans-serif`;
      ctx.fillText(n.name, nx, ny + 10);

      // 等級
      ctx.fillStyle = ok ? '#667788' : '#2a3040';
      ctx.font = '10px sans-serif';
      ctx.fillText(n.tier, nx, ny + 26);

      // ◀ 現在位置
      if (cur) {
        ctx.fillStyle = '#ffee44'; ctx.font = 'bold 10px sans-serif';
        ctx.fillText('▶ 現在位置', nx, ny - NH / 2 - 6);
      }
    }

    // ── 圖例 ─────────────────────────────────────────────────────────
    const legendY = PY + PH - 18;
    ctx.fillStyle = '#334455'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    const closeHint = touch.isMobile ? '點擊面板外關閉' : 'M 或 ESC 關閉地圖';
    ctx.fillText(closeHint, CONFIG.W / 2, legendY);

    // 解鎖說明
    ctx.fillStyle = '#223344'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('🔒 = 需使用背包中的對應地圖道具才能解鎖', PX + 20, legendY);
  }
}
