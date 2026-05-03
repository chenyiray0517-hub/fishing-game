const game = {
  canvas: null, ctx: null,
  player: null, shop: null, harbor: null, ocean: null,
  scene: 'harbor',   // 'harbor' | 'ocean'
  keys: {},
  spacePressedThisFrame: false,
  mouse: { x: 400, y: 300 },
};

function init() {
  game.canvas = document.getElementById('gameCanvas');
  game.canvas.width  = CONFIG.W;
  game.canvas.height = CONFIG.H;
  game.ctx = game.canvas.getContext('2d');

  game.player = new Player();
  game.shop   = new ShopUI();
  game.harbor = new HarborScene();
  game.ocean  = new OceanScene();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup',   e => { game.keys[e.key] = false; });

  touch.init(game.canvas);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

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
  // Shop overlay consumes all input
  if (game.shop.open) {
    game.shop.handleKey(key, game.player);
    return;
  }

  // ESC
  if (key === 'Escape') {
    if (game.scene === 'ocean') {
      if (game.ocean.fishing.state) {
        game.ocean.fishing.cancel(game.player);
      } else {
        game.scene = 'harbor';
      }
    }
    return;
  }

  const k = key.toLowerCase();

  if (k === 'e') {
    if (game.scene === 'harbor') {
      const n = game.harbor.nearby(game.player);
      if (!n) return;
      if (n.type === 'boat') {
        game.scene = 'ocean';
      } else if (n.type === 'shop') {
        game.shop.show(n.shopType);
      }
    } else if (game.scene === 'ocean') {
      game.ocean.tryFish(game.player);
    }
  }
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
  if (touch.actionTapped && game.scene === 'ocean') {
    const fs = game.ocean.fishing.state;
    if (!fs) {
      game.ocean.tryFish(game.player);
    } else if (fs === 'cast' || fs === 'bite') {
      game.spacePressedThisFrame = true;
    }
  }

  // Touch interact button → E key
  if (touch.interactTapped) handlePress('e');

  game.shop.update();
  if (game.shop.open) {
    if (touch.shopTap) game.shop.handleTouch(touch.shopTap);
    return;
  }

  if (game.scene === 'harbor') {
    game.harbor.update(game.keys, game.player);
  } else if (game.scene === 'ocean') {
    game.ocean.update(game.keys, game.spacePressedThisFrame, game.player);
  }
}

function render() {
  const ctx = game.ctx;
  ctx.clearRect(0, 0, CONFIG.W, CONFIG.H);

  if (game.scene === 'harbor') {
    game.harbor.render(ctx, game.player);
  } else if (game.scene === 'ocean') {
    game.ocean.render(ctx, game.player);
  }

  if (game.shop.open) {
    game.shop.render(ctx, game.player);
  }

  touch.render(ctx);
}

window.addEventListener('load', init);
