const game = {
  canvas: null, ctx: null,
  player: null, shop: null, harbor: null, ocean: null,
  scene: 'harbor',   // 'harbor' | 'ocean'
  keys: {},
  spacePressedThisFrame: false,
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

  requestAnimationFrame(loop);
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
  requestAnimationFrame(loop);
}

function update() {
  game.shop.update();
  if (game.shop.open) return;

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
}

window.addEventListener('load', init);
