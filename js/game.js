const game = {
  canvas: null, ctx: null,
  player: null, shop: null, backpack: null, gamemap: null, dialogue: null, encyclopedia: null, quest: null,
  harbor: null, ocean: null, ocean2: null, lake: null, beach: null, pond: null,
  scene: 'harbor',   // 'harbor' | 'ocean' | 'ocean2' | 'lake' | 'beach' | 'pond'
  keys: {},
  spacePressedThisFrame: false,
  mouse: { x: 400, y: 300 },
  drinkNotify: { text: '', t: 0 },
};

function init() {
  game.canvas = document.getElementById('gameCanvas');
  game.canvas.width  = CONFIG.W;
  game.canvas.height = CONFIG.H;
  game.ctx = game.canvas.getContext('2d');

  game.player   = new Player();
  game.shop     = new ShopUI();
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

  if (game.shop.open) {
    game.shop.render(ctx, game.player);
  }

  touch.render(ctx);
  renderSAN(ctx, game.player);
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

window.addEventListener('load', init);
