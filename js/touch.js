const touch = {
  isMobile: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

  joystick: {
    active: false, id: null,
    baseX: 80, baseY: 520,
    stickX: 80, stickY: 520,
    dx: 0, dy: 0,
  },

  // Per-frame taps (cleared after each loop)
  actionTapped:   false,
  interactTapped: false,
  shopTap:        null,   // canvas {x,y}

  // Held state
  actionHeld: false,
  actionId:   null,

  // Tug tap (per-frame, cleared after each loop)
  tugTapped: false,

  // Energy drink button tap (per-frame)
  drinkTapped: false,

  // 背包按鈕 tap (per-frame)
  backpackTapped: false,

  // 地圖按鈕 tap (per-frame)
  mapTapped: false,

  // 圖鑑按鈕 tap (per-frame)
  encyclopediaTapped: false,

  // 任務按鈕 tap (per-frame)
  questTapped: false,

  // 武器/釣竿切換 tap (per-frame)
  modeTapped: false,

  // 攻擊按鈕 tap (per-frame)
  attackTapped: false,

  // Interact button bounding rect (set by harbor render each frame)
  _iRect: null,

  init(canvas) {
    this.joystick.baseY  = CONFIG.H - 80;
    this.joystick.stickY = CONFIG.H - 80;
    const o = { passive: false };
    canvas.addEventListener('touchstart',  e => this._start(e), o);
    canvas.addEventListener('touchmove',   e => this._move(e),  o);
    canvas.addEventListener('touchend',    e => this._end(e),   o);
    canvas.addEventListener('touchcancel', e => this._end(e),   o);
  },

  _pos(t) {
    const r = game.canvas.getBoundingClientRect();
    return {
      x: (t.clientX - r.left) * CONFIG.W / r.width,
      y: (t.clientY - r.top)  * CONFIG.H / r.height,
    };
  },

  _hit(p, r) {
    return p.x >= r.x && p.x <= r.x + r.w &&
           p.y >= r.y && p.y <= r.y + r.h;
  },

  setInteractRect(x, y, w, h) { this._iRect = { x, y, w, h }; },
  clearInteractRect()          { this._iRect = null; },

  _start(e) {
    e.preventDefault();
    const scene = game.scene;
    const sceneMap = { ocean: game.ocean, ocean2: game.ocean2, lake: game.lake, beach: game.beach, pond: game.pond };
    const fs = sceneMap[scene]?.fishing?.state ?? null;

    for (const t of e.changedTouches) {
      const p = this._pos(t);

      // 背包覆蓋層 — 任何點擊交給背包
      if (game.backpack?.open) {
        this.shopTap = p; // 複用 shopTap 傳給背包
        continue;
      }

      // Shop modal — any tap goes to shop handler
      if (game.shop.open) {
        this.shopTap = p;
        continue;
      }

      // 背包按鈕（左上角）
      if (Math.hypot(p.x - 28, p.y - 68) < 26) {
        this.backpackTapped = true;
        continue;
      }

      // 地圖按鈕（背包右側）
      if (Math.hypot(p.x - 76, p.y - 68) < 24) {
        this.mapTapped = true;
        continue;
      }

      // 圖鑑按鈕（地圖右側）
      if (Math.hypot(p.x - 124, p.y - 68) < 22) {
        this.encyclopediaTapped = true;
        continue;
      }

      // 任務按鈕（圖鑑右側）
      if (Math.hypot(p.x - 172, p.y - 68) < 22) {
        this.questTapped = true;
        continue;
      }

      // Energy drink button (top-right, always accessible)
      if (game.player.energyDrinks > 0 && Math.hypot(p.x - (CONFIG.W - 52), p.y - 68) < 30) {
        this.drinkTapped = true;
        continue;
      }

      // Tug minigame — any tap counts
      if (fs === 'tug') {
        this.tugTapped = true;
        continue;
      }

      // Back button (top-right HUD) — 各場景都支援
      const backScenes = ['ocean', 'ocean2', 'lake', 'beach', 'pond'];
      if (backScenes.includes(scene) && !fs && p.x > CONFIG.W * 0.72 && p.y < 48) {
        if      (scene === 'lake')   { game.player.x = 752; game.player.y = 325; game.scene = 'harbor'; }
        else if (scene === 'ocean')  { game.scene = 'harbor'; }
        else if (scene === 'ocean2') { game.scene = 'harbor'; }
        else if (scene === 'beach')  { game.player.x = 400; game.player.y = CONFIG.H - 30; game.scene = 'lake'; }
        else if (scene === 'pond')   { game.player.x = 400; game.player.y = 125; game.scene = 'lake'; }
        continue;
      }

      // Interaction button above player (harbor)
      if (this._iRect && this._hit(p, this._iRect)) {
        this.interactTapped = true;
        continue;
      }

      // 武器/釣竿切換按鈕（左側，裝備劍後才顯示）
      if (game.player?.equippedSword && Math.hypot(p.x - 38, p.y - (CONFIG.H - 155)) < 30) {
        this.modeTapped = true;
        continue;
      }

      // Left-bottom quadrant → joystick
      if (p.x < CONFIG.W / 2 && p.y > CONFIG.H * 0.55) {
        const j = this.joystick;
        j.active = true; j.id = t.identifier;
        j.baseX = p.x;  j.baseY = p.y;
        j.stickX = p.x; j.stickY = p.y;
        j.dx = 0; j.dy = 0;
        continue;
      }

      // Right-bottom quadrant → attack (sword mode) or action (rod mode)
      if (p.x > CONFIG.W / 2 && p.y > CONFIG.H * 0.55) {
        if (game.player?.mode === 'sword' && game.player?.equippedSword) {
          this.attackTapped = true;
        } else {
          this.actionTapped = true;
          this.actionHeld   = true;
          this.actionId     = t.identifier;
        }
        continue;
      }
    }
  },

  _move(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const p = this._pos(t);
      const j = this.joystick;
      if (t.identifier === j.id) {
        const dx = p.x - j.baseX, dy = p.y - j.baseY;
        const d = Math.hypot(dx, dy), max = 42;
        const a = Math.atan2(dy, dx);
        j.stickX = j.baseX + Math.cos(a) * Math.min(d, max);
        j.stickY = j.baseY + Math.sin(a) * Math.min(d, max);
        j.dx = d > 8 ? Math.max(-1, Math.min(1, dx / max)) : 0;
        j.dy = d > 8 ? Math.max(-1, Math.min(1, dy / max)) : 0;
      }
    }
  },

  _end(e) {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const j = this.joystick;
      if (t.identifier === j.id) {
        j.active = false; j.id = null; j.dx = 0; j.dy = 0;
      }
      if (t.identifier === this.actionId) {
        this.actionHeld = false; this.actionId = null;
      }
    }
  },

  // Write joystick direction into keys each frame.
  // On mobile, always overwrite arrow states so releasing the joystick
  // immediately clears any residual true values left from the previous frame.
  applyKeys(keys) {
    if (!this.isMobile) return;
    const j = this.joystick;
    keys['ArrowLeft']  = j.active && j.dx < -0.25;
    keys['ArrowRight'] = j.active && j.dx >  0.25;
    keys['ArrowUp']    = j.active && j.dy < -0.25;
    keys['ArrowDown']  = j.active && j.dy >  0.25;
  },

  // Reset per-frame state — call at end of each game loop iteration
  clearFrame() {
    this.actionTapped   = false;
    this.interactTapped = false;
    this.shopTap        = null;
    this.tugTapped      = false;
    this.drinkTapped    = false;
    this.backpackTapped     = false;
    this.mapTapped          = false;
    this.encyclopediaTapped = false;
    this.questTapped        = false;
    this.modeTapped         = false;
    this.attackTapped       = false;
  },

  // ── Rendering ────────────────────────────────────────────────────────

  render(ctx) {
    if (!this.isMobile) return;

    // 背包按鈕（左上角，始終顯示）
    this._drawBackpackBtn(ctx);
    // 地圖按鈕（背包右側）
    this._drawMapBtn(ctx);
    // 圖鑑按鈕（地圖右側）
    this._drawEncyclopediaBtn(ctx);
    // 任務按鈕（圖鑑右側）
    this._drawQuestBtn(ctx);

    const sceneMap = { ocean: game.ocean, ocean2: game.ocean2, lake: game.lake, beach: game.beach, pond: game.pond };
    const fs = sceneMap[game.scene]?.fishing?.state ?? null;

    // 武器/釣竿切換格子（裝備劍後顯示）
    if (game.player?.equippedSword) this._drawModeToggle(ctx);

    // During tug: fishing.js handles all tug UI; skip joystick/action btn
    if (fs === 'tug') return;

    // Joystick: show when not mid-cast
    if (!fs || fs === 'wait') this._drawJoystick(ctx);

    // Action or attack button
    const combatScenes = ['ocean', 'ocean2', 'lake', 'beach', 'pond'];
    if (combatScenes.includes(game.scene)) this._drawActionBtn(ctx, fs);
  },

  _drawMapBtn(ctx) {
    const bx = 76, by = 68;
    const isOpen = game.gamemap?.open;
    ctx.save();
    ctx.fillStyle = isOpen ? 'rgba(40,100,200,0.70)' : 'rgba(20,40,80,0.55)';
    ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isOpen ? '#88ccff' : 'rgba(100,140,200,0.5)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText('🗺️', bx, by + 5);
    ctx.restore();
  },

  _drawQuestBtn(ctx) {
    const bx = 172, by = 68;
    const activeCount = game.player
      ? Object.values(game.player.activeQuests).filter(q => q && q.accepted).length
      : 0;
    const isOpen = game.quest?.hudOpen;
    ctx.save();
    ctx.fillStyle = isOpen ? 'rgba(180,120,20,0.72)' : 'rgba(20,40,80,0.55)';
    ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isOpen ? '#ffcc44' : 'rgba(100,140,200,0.5)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText('📋', bx, by + 5);
    if (activeCount > 0 && !isOpen) {
      ctx.fillStyle = '#ff4444';
      ctx.beginPath(); ctx.arc(bx + 13, by - 13, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif';
      ctx.fillText(String(activeCount), bx + 13, by - 10);
    }
    ctx.restore();
  },

  _drawEncyclopediaBtn(ctx) {
    const bx = 124, by = 68;
    const isOpen = game.encyclopedia?.open;
    ctx.save();
    ctx.fillStyle = isOpen ? 'rgba(140,80,20,0.70)' : 'rgba(20,40,80,0.55)';
    ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isOpen ? '#ffcc88' : 'rgba(100,140,200,0.5)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText('📖', bx, by + 5);
    ctx.restore();
  },

  _drawBackpackBtn(ctx) {
    const bx = 28, by = 68;
    const hasItems = game.player && Object.keys(game.player.items || {}).length > 0;
    const isOpen   = game.backpack?.open;
    ctx.save();
    ctx.fillStyle = isOpen ? 'rgba(40,120,200,0.70)' : 'rgba(20,40,80,0.55)';
    ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isOpen ? '#88ccff' : 'rgba(100,140,200,0.5)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText('🎒', bx, by + 6);
    // 有道具時顯示紅點
    if (hasItems && !isOpen) {
      ctx.fillStyle = '#ff4444';
      ctx.beginPath(); ctx.arc(bx + 14, by - 14, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },

  _drawJoystick(ctx) {
    const j  = this.joystick;
    const bx = j.active ? j.baseX : 80;
    const by = j.active ? j.baseY : CONFIG.H - 80;
    ctx.save();
    // Base ring
    ctx.fillStyle   = 'rgba(255,255,255,0.07)';
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.arc(bx, by, 50, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Stick
    const sx = j.active ? j.stickX : bx;
    const sy = j.active ? j.stickY : by;
    ctx.fillStyle   = 'rgba(255,255,255,0.40)';
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath(); ctx.arc(sx, sy, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  _drawModeToggle(ctx) {
    const bx = 38, by = CONFIG.H - 155, r = 22;
    const isWeapon = game.player?.mode === 'sword';
    ctx.save();
    ctx.fillStyle   = isWeapon ? 'rgba(180,30,30,0.72)' : 'rgba(30,80,150,0.58)';
    ctx.strokeStyle = isWeapon ? '#ff8844' : 'rgba(100,160,255,0.6)';
    ctx.lineWidth   = 1.8;
    ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = '15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(isWeapon ? '⚔️' : '🎣', bx, by + 5);
    ctx.fillStyle = 'rgba(200,200,200,0.80)';
    ctx.font = '8px sans-serif';
    ctx.fillText(isWeapon ? '武器' : '釣竿', bx, by + r + 9);
    ctx.restore();
  },

  _drawActionBtn(ctx, fs) {
    const ax = CONFIG.W - 72, ay = CONFIG.H - 80, r = 44;
    const blink = Math.floor(Date.now() / 180) % 2;

    // Sword mode: attack button
    if (game.player?.mode === 'sword' && game.player?.equippedSword) {
      const cd = game.player.attackCooldown;
      const ready = cd <= 0;
      const pulse = ready ? (Math.sin(Date.now() / 200) + 1) * 0.08 : 0;
      ctx.save();
      ctx.fillStyle   = `rgba(180,20,20,${0.52 + pulse})`;
      ctx.strokeStyle = ready ? '#ff7744' : '#664422';
      ctx.lineWidth   = 2.5;
      ctx.beginPath(); ctx.arc(ax, ay, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = ready ? '#fff' : '#886655';
      ctx.fillText('⚔️', ax, ay + 8);
      if (!ready) {
        const progress = 1 - cd / 25;
        ctx.strokeStyle = 'rgba(255,140,40,0.85)'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ax, ay, r - 4, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    // Rod mode: fishing button
    let label, bg, fg;
    if (!fs) {
      const sceneMap = { ocean: game.ocean, ocean2: game.ocean2, lake: game.lake, beach: game.beach, pond: game.pond };
      const spot = sceneMap[game.scene]?.nearbySpot(game.player);
      if (!spot || game.player.baitCount <= 0) return;
      label = '🎣'; bg = 'rgba(30,150,80,0.45)'; fg = '#66ffaa';
    } else if (fs === 'cast') {
      label = '拋竿!'; bg = 'rgba(220,200,0,0.40)'; fg = '#ffee44';
    } else if (fs === 'bite') {
      label  = '收竿!';
      bg     = blink ? 'rgba(255,60,20,0.70)' : 'rgba(255,180,20,0.50)';
      fg     = '#fff';
    } else {
      return;
    }

    ctx.save();
    ctx.fillStyle   = bg;
    ctx.strokeStyle = fg;
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.arc(ax, ay, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = fg;
    ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, ax, ay + 6);
    ctx.restore();
  },
};
