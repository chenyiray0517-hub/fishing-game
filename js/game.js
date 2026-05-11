const game = {
  canvas: null, ctx: null,
  player: null, shop: null, trader: null, backpack: null, gamemap: null, dialogue: null, encyclopedia: null, quest: null,
  harbor: null, ocean: null, ocean2: null, lake: null, beach: null, pond: null,
  daynight: null,
  scene: 'harbor',   // 'harbor' | 'ocean' | 'ocean2' | 'lake' | 'beach' | 'pond'
  keys: {},
  spacePressedThisFrame: false,
  mouse: { x: 400, y: 300 },
  drinkNotify: { text: '', t: 0 },
  waveTimer: 0,   // frames; resets every wave
  waveMsg:   { text: '', t: 0 },
};

function init() {
  game.canvas = document.getElementById('gameCanvas');
  game.canvas.width  = CONFIG.W;
  game.canvas.height = CONFIG.H;
  game.ctx = game.canvas.getContext('2d');

  game.daynight = new DayNight();
  game.player   = new Player();
  game.shop     = new ShopUI();
  game.trader   = new TraderUI();
  game.backpack = new Backpack();
  game.gamemap  = new GameMap();
  game.harbor   = new HarborScene();
  game.ocean    = new OceanScene();
  game.ocean2   = new Ocean2Scene();
  game.lake     = new LakeScene();
  game.beach    = new BeachScene();
  game.pond     = new PondScene();
  game.dialogue     = new DialogueSystem();
  game.encyclopedia = new Encyclopedia();
  game.quest        = new QuestUI();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup',   e => { game.keys[e.key] = false; });

  // Restore wave timer & monsters from last save (must be after scene objects created)
  game.waveTimer = game.player._savedWaveTimer ?? 0;
  const _savedScenes = { ocean: game.ocean, ocean2: game.ocean2, lake: game.lake, beach: game.beach, pond: game.pond };
  for (const [k, s] of Object.entries(_savedScenes)) {
    for (const md of (game.player._savedMonsters?.[k] ?? [])) {
      const m = new Monster(md.type, md.x, md.y);
      m.hp = md.hp; m.maxHp = md.maxHp;
      s.monsterMgr.monsters.push(m);
    }
  }

  // Save state when page is closed/refreshed
  window.addEventListener('beforeunload', () => game.player.save());

  touch.init(game.canvas);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Try to lock orientation to landscape (works on Android; iOS requires manual rotate)
  if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});

  game.canvas.addEventListener('mousemove', e => {
    const r = game.canvas.getBoundingClientRect();
    game.mouse.x = (e.clientX - r.left) * CONFIG.W / r.width;
    game.mouse.y = (e.clientY - r.top)  * CONFIG.H / r.height;
  });

  game.canvas.addEventListener('mousedown', e => {
    const r = game.canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * CONFIG.W / r.width;
    const my = (e.clientY - r.top)  * CONFIG.H / r.height;
    const mp = { x: mx, y: my };
    // Quest panel buttons (accept / decline / claim / close)
    if (game.quest.open) { game.quest.handleTouch(mp, game.player); return; }
    // Quest HUD toggle button (desktop only)
    if (!touch.isMobile && mx >= 8 && mx <= 148 && my >= 92 && my <= 120) {
      game.quest.hudOpen = !game.quest.hudOpen;
      return;
    }
    // Left click attack (PC only, sword mode)
    if (e.button === 0 && !touch.isMobile && game.player.mode === 'sword' &&
        !game.shop.open && !game.trader.open && !game.backpack.open && !game.gamemap.open && !game.dialogue.active) {
      doPlayerAttack();
    }
  });

  requestAnimationFrame(loop);
}

function resizeCanvas() {
  const aspect = CONFIG.W / CONFIG.H;
  const ww = window.innerWidth, wh = window.innerHeight;
  let w, h;
  if (ww / wh > aspect) { h = wh; w = h * aspect; }
  else                   { w = ww; h = w / aspect; }
  game.canvas.style.width  = w + 'px';
  game.canvas.style.height = h + 'px';
}

function onKeyDown(e) {
  const prev = game.keys[e.key];
  game.keys[e.key] = true;

  // Prevent page scroll
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();

  if (e.key === ' ') game.spacePressedThisFrame = true;

  if (!prev) handlePress(e.key);
}

function handlePress(key) {
  // 對話進行中：任何按鍵推進或關閉
  if (game.dialogue.active) { game.dialogue.advance(); return; }

  // 地圖覆蓋層
  if (game.gamemap.open) { game.gamemap.handleKey(key); return; }

  // 背包覆蓋層吃掉所有輸入
  if (game.backpack.open) {
    game.backpack.handleKey(key, game.player);
    return;
  }

  // 圖鑑覆蓋層吃掉所有輸入
  if (game.encyclopedia.open) {
    game.encyclopedia.handleKey(key);
    return;
  }

  // 任務覆蓋層吃掉所有輸入
  if (game.quest.open) {
    game.quest.handleKey(key, game.player);
    return;
  }

  // Shop overlay consumes all input
  if (game.shop.open) {
    game.shop.handleKey(key, game.player);
    return;
  }

  // Trader overlay consumes all input
  if (game.trader.open) {
    game.trader.handleKey(key, game.player);
    return;
  }

  const k = key.toLowerCase();

  // M 鍵開關地圖
  if (k === 'm') { game.gamemap.toggle(); return; }

  // G 鍵開關背包
  if (k === 'g') { game.backpack.toggle(); return; }

  // H 鍵開關圖鑑
  if (k === 'h') { game.encyclopedia.toggle(); return; }

  // ESC
  if (key === 'Escape') {
    if (game.dialogue.active) { game.dialogue.close(); return; }
    if (game.scene === 'ocean') {
      if (game.ocean.fishing.state) game.ocean.fishing.cancel(game.player);
      else game.scene = 'harbor';
    } else if (game.scene === 'lake') {
      if (game.lake.fishing.state) game.lake.fishing.cancel(game.player);
      else { game.scene = 'harbor'; game.player.x = 752; game.player.y = 325; }
    } else if (game.scene === 'beach') {
      if (game.beach.fishing.state) game.beach.fishing.cancel(game.player);
      else { game.scene = 'lake'; game.player.x = 400; game.player.y = CONFIG.H - 30; }
    } else if (game.scene === 'ocean2') {
      if (game.ocean2.fishing.state) game.ocean2.fishing.cancel(game.player);
      else game.scene = 'harbor';
    } else if (game.scene === 'pond') {
      if (game.pond.fishing.state) game.pond.fishing.cancel(game.player);
      else { game.scene = 'lake'; game.player.x = 400; game.player.y = 125; }
    }
    return;
  }

  if (k === 'e') {
    if (game.scene === 'harbor') {
      const qId = game.harbor.nearbyQuestNPC(game.player);
      if (qId) { game.quest.openFor(qId, game.player); return; }
      const n = game.harbor.nearby(game.player);
      if (!n) {
        const dNPC = game.harbor.nearbyDialogueNPC(game.player);
        if (dNPC) game.dialogue.start(dNPC);
        return;
      }
      if (n.type === 'boat') {
        game.player.lying = false;
        game.scene = 'ocean';
      } else if (n.type === 'ocean2') {
        if (!game.player.isUnlocked('ocean2')) { game.backpack.open = true; return; }
        game.player.lying = false;
        game.scene = 'ocean2';
      } else if (n.type === 'lake') {
        game.player.lying = false;
        game.scene = 'lake';
        game.player.x = 735; game.player.y = 325;
      } else if (n.type === 'bed') {
        game.player.lying = !game.player.lying;
        game.player.lyingTimer = 0;
      } else if (n.type === 'map') {
        game.gamemap.toggle();
      } else if (n.type === 'shop') {
        game.shop.show(n.shopType);
      }
    } else if (game.scene === 'ocean') {
      game.ocean.tryFish(game.player);
    } else if (game.scene === 'lake') {
      const qId = game.lake.nearbyQuestNPC(game.player);
      if (qId) { game.quest.openFor(qId, game.player); return; }
      if (game.lake.nearbyTraderNPC(game.player)) { game.trader.show(); return; }
      const lakeExit = game.lake.nearbyExit(game.player);
      if (lakeExit === 'harbor') {
        game.scene = 'harbor'; game.player.x = 752; game.player.y = 325;
      } else if (lakeExit === 'beach') {
        if (!game.player.isUnlocked('beach')) {
          game.backpack.open = true; // 提示去背包解鎖
          return;
        }
        game.scene = 'beach'; game.player.x = 400; game.player.y = 148;
      } else if (lakeExit === 'pond') {
        if (!game.player.isUnlocked('pond')) {
          game.backpack.open = true;
          return;
        }
        game.scene = 'pond'; game.player.x = 400; game.player.y = CONFIG.H - 60;
      } else if (game.lake.nearbyNPC(game.player)) {
        game.shop.show('energy');
      } else {
        const dNPC = game.lake.nearbyDialogueNPC(game.player);
        if (dNPC) { game.dialogue.start(dNPC); return; }
        game.lake.tryFish(game.player);
      }
    } else if (game.scene === 'beach') {
      const qId = game.beach.nearbyQuestNPC(game.player);
      if (qId) { game.quest.openFor(qId, game.player); return; }
      const beachExit = game.beach.nearbyExit(game.player);
      if (beachExit === 'lake') {
        game.scene = 'lake'; game.player.x = 400; game.player.y = CONFIG.H - 30;
      } else {
        const dNPC = game.beach.nearbyDialogueNPC(game.player);
        if (dNPC) { game.dialogue.start(dNPC); return; }
        game.beach.tryFish(game.player);
      }
    } else if (game.scene === 'ocean2') {
      game.ocean2.tryFish(game.player);
    } else if (game.scene === 'pond') {
      const qId = game.pond.nearbyQuestNPC(game.player);
      if (qId) { game.quest.openFor(qId, game.player); return; }
      const pondExit = game.pond.nearbyExit(game.player);
      if (pondExit === 'lake') {
        game.scene = 'lake'; game.player.x = 400; game.player.y = 125;
      } else {
        game.pond.tryFish(game.player);
      }
    }
  }

  if (key === '1') { game.player.mode = 'rod'; return; }
  if (key === '2') { if (game.player.equippedSword) game.player.mode = 'sword'; return; }

  if (key === 'f' || key === 'F') { drinkEnergy(); return; }
}

let lastT = 0;
function loop(ts) {
  const dt = ts - lastT; lastT = ts;

  update();
  render();

  game.spacePressedThisFrame = false;
  touch.clearFrame();
  requestAnimationFrame(loop);
}

function update() {
  // Apply virtual joystick to keyboard state
  touch.applyKeys(game.keys);

  // Attack / mode toggle from touch
  if (touch.attackTapped) doPlayerAttack();
  if (touch.modeTapped) {
    if (game.player.mode === 'rod' && game.player.equippedSword) game.player.mode = 'sword';
    else game.player.mode = 'rod';
  }

  // Attack & anim cooldowns
  if (game.player.attackCooldown > 0) game.player.attackCooldown--;
  if (game.player.attackAnim > 0) game.player.attackAnim--;

  // Global wave timer: pauses in harbor, runs at night (or always in pond)
  const _isNightScene = game.scene !== 'harbor' &&
    (game.daynight.nightAlpha > 0.3 || game.scene === 'pond');
  if (_isNightScene) {
    game.waveTimer++;
    if (game.waveTimer >= 7200) { // 120 s × 60 fps = 2 分鐘
      game.waveTimer = 0;
      triggerWave();
    }
  }
  if (game.waveMsg.t > 0) game.waveMsg.t--;

  // Auto-save every 30 seconds
  if (Date.now() - game.player._savedAt > 30000) game.player.save();

  // Touch action button → space press (cast / bite)
  if (touch.drinkTapped) drinkEnergy();

  // 地圖觸控
  if (touch.mapTapped && !game.dialogue.active) {
    if (game.gamemap.open) game.gamemap.close();
    else game.gamemap.open = true;
  }

  // 地圖開啟時消耗觸控
  if (game.gamemap.open) {
    if (touch.shopTap) game.gamemap.handleTouch(touch.shopTap);
    return;
  }

  // 背包觸控
  if (touch.backpackTapped && !game.dialogue.active) {
    if (game.backpack.open) game.backpack.close();
    else game.backpack.open = true;
  }

  // 背包開啟時消耗觸控
  if (game.backpack.open) {
    if (touch.shopTap) game.backpack.handleTouch(touch.shopTap, game.player);
    return;
  }

  // 圖鑑觸控
  if (touch.encyclopediaTapped && !game.dialogue.active) {
    if (game.encyclopedia.open) game.encyclopedia.close();
    else game.encyclopedia.open = true;
  }

  // 任務 HUD 按鈕觸控
  if (touch.questTapped && !game.dialogue.active) {
    game.quest.hudOpen = !game.quest.hudOpen;
  }

  // 圖鑑開啟時消耗觸控
  if (game.encyclopedia.open) {
    if (touch.shopTap) game.encyclopedia.handleTouch(touch.shopTap);
    return;
  }

  // 任務開啟時消耗觸控
  if (game.quest.open) {
    if (touch.shopTap) game.quest.handleTouch(touch.shopTap, game.player);
    return;
  }

  const fishingScenes = ['ocean', 'ocean2', 'lake', 'beach', 'pond'];
  if (touch.actionTapped && fishingScenes.includes(game.scene)) {
    const sceneObj = { ocean: game.ocean, ocean2: game.ocean2, lake: game.lake, beach: game.beach, pond: game.pond }[game.scene];
    const fs = sceneObj.fishing.state;
    if (!fs) {
      sceneObj.tryFish(game.player);
    } else if (fs === 'cast' || fs === 'bite') {
      game.spacePressedThisFrame = true;
    }
  }

  // Touch interact button → E key
  if (touch.interactTapped) handlePress('e');

  // 對話進行中：跳過場景更新（玩家停止移動）
  if (game.dialogue.active) { updateSAN(); return; }

  game.shop.update();
  if (game.shop.open) {
    if (touch.shopTap) game.shop.handleTouch(touch.shopTap);
    return;
  }

  game.trader.update();
  if (game.trader.open) {
    if (touch.shopTap) game.trader.handleTouch(touch.shopTap, game.player);
    return;
  }

  if (game.scene === 'harbor') {
    game.harbor.update(game.keys, game.player);
  } else if (game.scene === 'ocean') {
    game.ocean.update(game.keys, game.spacePressedThisFrame, game.player);
  } else if (game.scene === 'ocean2') {
    game.ocean2.update(game.keys, game.spacePressedThisFrame, game.player);
  } else if (game.scene === 'lake') {
    game.lake.update(game.keys, game.spacePressedThisFrame, game.player);
  } else if (game.scene === 'beach') {
    game.beach.update(game.keys, game.spacePressedThisFrame, game.player);
  } else if (game.scene === 'pond') {
    game.pond.update(game.keys, game.spacePressedThisFrame, game.player);
  }

  updateSAN();
}

function drinkEnergy() {
  const p = game.player;
  if (p.energyDrinks <= 0) return;
  p.energyDrinks--;
  p.san = Math.max(0, p.san - 25);
  if (p.deathTimer > 0 && p.san < 100) p.deathTimer = -1;
  p.save();
  game.drinkNotify = { text: `🥤 SAN -25 → ${p.san}`, t: 130 };
}

function updateSAN() {
  const p = game.player;

  // Death countdown
  if (p.deathTimer > 0) {
    p.deathTimer--;
    if (p.deathTimer <= 0) {
      p.fish = [];
      p.san = 0; p.sanTimer = 0; p.deathTimer = -1; p.lying = false;
      p.save();
      game.ocean.fishing.reset();
      game.ocean2.fishing.reset();
      game.lake.fishing.reset();
      game.beach.fishing.reset();
      game.pond.fishing.reset();
      game.scene = 'harbor';
      p.x = game.harbor.BED.x; p.y = game.harbor.BED.y;
    }
    return;
  }

  // Lying in bed recovers SAN (3/sec)
  if (p.lying && game.scene === 'harbor') {
    p.lyingTimer++;
    if (p.lyingTimer >= 60) { p.lyingTimer = 0; p.san = Math.max(0, p.san - 3); }
    return;
  }
  if (p.lying) p.lying = false; // cancel lying outside harbor

  // Passive SAN increase: +1 every 3 seconds (180 frames), not in harbor
  if (game.scene !== 'harbor') {
    p.sanTimer++;
    if (p.sanTimer >= 180) { p.sanTimer = 0; p.san = Math.min(100, p.san + 1); }
  }

  // Trigger death countdown
  if (p.san >= 100 && p.deathTimer < 0) p.deathTimer = 5 * 60;
}

function render() {
  const ctx = game.ctx;
  ctx.clearRect(0, 0, CONFIG.W, CONFIG.H);

  if (game.scene === 'harbor') {
    game.harbor.render(ctx, game.player);
  } else if (game.scene === 'ocean') {
    game.ocean.render(ctx, game.player);
  } else if (game.scene === 'ocean2') {
    game.ocean2.render(ctx, game.player);
  } else if (game.scene === 'lake') {
    game.lake.render(ctx, game.player);
  } else if (game.scene === 'beach') {
    game.beach.render(ctx, game.player);
  } else if (game.scene === 'pond') {
    game.pond.render(ctx, game.player);
  }

  renderAttackAnim(ctx, game.player);
  renderWaveMsg(ctx);

  if (game.shop.open) {
    game.shop.render(ctx, game.player);
  }
  if (game.trader.open) {
    game.trader.render(ctx, game.player);
  }

  touch.render(ctx);
  renderSAN(ctx, game.player);
  renderHP(ctx, game.player);
  if (!touch.isMobile) renderWeaponMode(ctx, game.player);
  if (game.scene !== 'pond') game.daynight.renderBadge(ctx);
  game.quest.renderHUDBtn(ctx, game.player);
  game.quest.renderHUD(ctx, game.player);
  game.backpack.render(ctx, game.player);
  game.encyclopedia.render(ctx, game.player);
  game.quest.render(ctx, game.player);
  game.gamemap.render(ctx, game.player);
  game.dialogue.render(ctx);
}

function renderSAN(ctx, p) {
  if (p.san <= 0 && p.deathTimer < 0) return;

  // Player canvas position
  const px = (game.scene === 'ocean') ? p.bx : p.x;
  const py = (game.scene === 'ocean') ? p.by - 68 : p.y - p.h - 12;

  // SAN bar above player head
  const barW = 44, barH = 5, bx = px - barW / 2;
  const col = p.san >= 90 ? '#ff2222' : p.san >= 70 ? '#ff8800' : '#4488ff';
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(bx - 1, py - 1, barW + 2, barH + 2);
  ctx.fillStyle = col; ctx.fillRect(bx, py, barW * p.san / 100, barH);
  ctx.fillStyle = '#ccc'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`SAN ${p.san}`, px, py - 3);

  // Red vignette builds up from san 70
  if (p.san >= 70) {
    const intensity = (p.san - 70) / 30;
    const vg = ctx.createRadialGradient(CONFIG.W/2, CONFIG.H/2, CONFIG.W*0.28, CONFIG.W/2, CONFIG.H/2, CONFIG.W*0.82);
    vg.addColorStop(0, 'rgba(140,0,0,0)');
    vg.addColorStop(1, `rgba(140,0,0,${(intensity * 0.52).toFixed(3)})`);
    ctx.fillStyle = vg; ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
  }

  // Warning at 90+ (flashing text below HUD)
  if (p.san >= 90 && p.deathTimer < 0) {
    if (Math.floor(Date.now() / 380) % 2) {
      ctx.fillStyle = 'rgba(255,40,40,0.95)';
      ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⚠ 神智崩潰！快回床上休息！', CONFIG.W / 2, 70);
    }
  }

  // Drink notification
  if (game.drinkNotify.t > 0) {
    game.drinkNotify.t--;
    const a = Math.min(1, game.drinkNotify.t / 30);
    ctx.fillStyle = `rgba(80,220,120,${a.toFixed(3)})`;
    ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(game.drinkNotify.text, CONFIG.W / 2, CONFIG.H / 2 - 90);
  }

  // Mobile drink button (top-right, below HUD)
  if (touch.isMobile && p.energyDrinks > 0) {
    const bx = CONFIG.W - 52, by = 68, br = 24;
    ctx.fillStyle = 'rgba(20,140,60,0.52)';
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#66ffaa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.fillText('🥤', bx, by + 6);
    ctx.fillStyle = '#ffff44'; ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`×${p.energyDrinks}`, bx + 16, by - 13);
  }

  // Death countdown overlay
  if (p.deathTimer > 0) {
    const secs = Math.ceil(p.deathTimer / 60);
    const pulse = (Math.sin(Date.now() / 180) + 1) / 2;
    ctx.fillStyle = `rgba(120,0,0,${(0.28 + pulse * 0.28).toFixed(3)})`;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
    ctx.fillStyle = '#ff5555'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('你快失去理智了…', CONFIG.W / 2, CONFIG.H / 2 - 22);
    ctx.fillStyle = '#ffaaaa'; ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${secs} 秒後死亡`, CONFIG.W / 2, CONFIG.H / 2 + 22);
  }
}

function triggerWave() {
  const sceneObj = {
    ocean: game.ocean, ocean2: game.ocean2,
    lake: game.lake, beach: game.beach, pond: game.pond,
  }[game.scene];
  if (!sceneObj?.monsterMgr) return;
  const count = 3 + Math.floor(Math.random() * 3); // 3–5
  sceneObj.monsterMgr.spawnWave(count);
  game.waveMsg = { text: `⚠ 一波怪物來襲！(${count} 隻)`, t: 220 };
}

function doPlayerAttack() {
  const p = game.player;
  if (p.mode !== 'sword' || !p.equippedSword) return;
  if (p.attackCooldown > 0) return;
  p.attackCooldown = 25;
  p.attackAnim = 12;
  const isBoat = game.scene === 'ocean' || game.scene === 'ocean2';
  const px = isBoat ? p.bx : p.x;
  const py = isBoat ? p.by : p.y;
  const sceneObj = { ocean: game.ocean, ocean2: game.ocean2, lake: game.lake, beach: game.beach, pond: game.pond }[game.scene];
  sceneObj?.monsterMgr?.checkAttack(px, py, 58, (p.swordCfg?.power ?? 5) * p.getAtkMult());
}

function renderWaveMsg(ctx) {
  if (game.waveMsg.t <= 0) return;
  const a = Math.min(1, game.waveMsg.t / 40);
  ctx.save();
  ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
  const tw = ctx.measureText(game.waveMsg.text).width;
  ctx.fillStyle = `rgba(0,0,0,${(a * 0.62).toFixed(3)})`;
  ctx.beginPath(); ctx.roundRect(CONFIG.W / 2 - tw / 2 - 10, 90, tw + 20, 28, 6); ctx.fill();
  ctx.fillStyle = `rgba(255,100,80,${a.toFixed(3)})`;
  ctx.fillText(game.waveMsg.text, CONFIG.W / 2, 110);
  ctx.restore();
}

function renderAttackAnim(ctx, p) {
  if (p.attackAnim <= 0) return;
  const isBoat = game.scene === 'ocean' || game.scene === 'ocean2';
  const px = isBoat ? p.bx : p.x;
  const py = isBoat ? p.by : p.y - p.h / 2;
  const prog = 1 - p.attackAnim / 12;
  const r = 16 + prog * 42;
  const a = (1 - prog) * 0.88;
  ctx.save();
  ctx.strokeStyle = `rgba(255,220,60,${a.toFixed(3)})`;
  ctx.lineWidth = 3 + (1 - prog) * 5;
  ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function renderHP(ctx, p) {
  if (p.hitFlash > 0) {
    const a = (p.hitFlash / 18) * 0.40;
    ctx.fillStyle = `rgba(220,20,20,${a.toFixed(3)})`;
    ctx.fillRect(0, 0, CONFIG.W, CONFIG.H);
    p.hitFlash--;
  }
  if (p.hp >= p.maxHp) return;
  const barW = 88, barH = 10, bx = 10, by = CONFIG.H - 24;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.beginPath(); ctx.roundRect(bx - 2, by - 2, barW + 4, barH + 4, 4); ctx.fill();
  ctx.fillStyle = '#440000'; ctx.fillRect(bx, by, barW, barH);
  const ratio = p.hp / p.maxHp;
  ctx.fillStyle = ratio > 0.5 ? '#44dd44' : ratio > 0.25 ? '#ddaa00' : '#ee2222';
  ctx.fillRect(bx, by, barW * ratio, barH);
  ctx.fillStyle = '#ddd'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`HP ${p.hp}/${p.maxHp}`, bx, by - 3);
}

function renderWeaponMode(ctx, p) {
  if (!p.equippedSword) return;
  const isWeapon = p.mode === 'sword';
  const label = isWeapon
    ? `⚔️ ${p.swordCfg.name}  [1=釣竿]`
    : `🎣 釣竿  [2=武器]`;
  ctx.save();
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'right';
  const tw = ctx.measureText(label).width;
  const bx = CONFIG.W - 8, by = CONFIG.H - 8;
  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  ctx.beginPath(); ctx.roundRect(bx - tw - 8, by - 16, tw + 12, 20, 4); ctx.fill();
  ctx.fillStyle = isWeapon ? '#ffaa44' : '#88ccff';
  ctx.fillText(label, bx, by - 2);
  ctx.restore();
}

window.addEventListener('load', init);
