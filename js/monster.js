class Monster {
  constructor(type, x, y) {
    const cfg = CONFIG.MONSTERS[type];
    this.type = type;
    this.x = x; this.y = y;
    this.hp = cfg.hp; this.maxHp = cfg.hp;
    this.speed = cfg.speed;
    this.damage = cfg.damage;
    this.attackRange = 28;
    this.attackCooldown = Math.floor(Math.random() * 60);
    this.dead = false;
    this.deathAlpha = 1;
    this.hitFlash = 0;
    this.kbx = 0; this.kby = 0;
    this.walkT = Math.random() * 100;
  }

  update(px, py) {
    if (this.dead) { this.deathAlpha = Math.max(0, this.deathAlpha - 0.038); return; }
    this.kbx *= 0.76; this.kby *= 0.76;
    this.x += this.kbx; this.y += this.kby;
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.attackCooldown > 0) this.attackCooldown--;
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.attackRange + 2) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
      this.walkT++;
    } else if (this.attackCooldown <= 0) {
      game.player.takeDamage(this.damage);
      this.attackCooldown = 90;
    }
  }

  draw(ctx) {
    if (this.deathAlpha <= 0) return;
    ctx.save();
    if (this.dead) ctx.globalAlpha = this.deathAlpha;
    if (this.hitFlash > 0 && Math.floor(this.hitFlash / 3) % 2 === 0) {
      ctx.save();
      ctx.filter = 'brightness(5) saturate(0)';
      this._drawBody(ctx);
      ctx.restore();
    } else {
      this._drawBody(ctx);
    }
    if (!this.dead) this._drawHpBar(ctx);
    ctx.restore();
  }

  _drawBody(ctx) {
    const cfg = CONFIG.MONSTERS[this.type];
    const x = Math.round(this.x), y = Math.round(this.y);
    const walk = Math.sin(this.walkT * 0.18) * 2.5;

    if (this.type === 'sprite') {
      // Glowing aura
      const aura = ctx.createRadialGradient(x, y - 18, 2, x, y - 18, 22);
      aura.addColorStop(0, 'rgba(180,80,255,0.32)');
      aura.addColorStop(1, 'rgba(180,80,255,0)');
      ctx.fillStyle = aura;
      ctx.fillRect(x - 26, y - 42, 52, 44);
      // Wings
      ctx.save();
      ctx.globalAlpha *= 0.60;
      ctx.fillStyle = '#cc88ff';
      ctx.beginPath(); ctx.ellipse(x - 12, y - 18, 7, 13, -0.45, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + 12, y - 18, 7, 13,  0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Legs
    ctx.fillStyle = cfg.legColor;
    ctx.fillRect(x - 6, y - 2, 5, 8 + (walk > 0 ? walk : 0));
    ctx.fillRect(x + 1, y - 2, 5, 8 + (walk < 0 ? -walk : 0));

    // Body
    ctx.fillStyle = cfg.color;
    ctx.fillRect(x - 9, y - 20, 18, 20);

    // Arms
    ctx.fillStyle = cfg.headColor;
    if (this.type !== 'sprite') {
      ctx.fillRect(x - 18, y - 17, 9, 5);
      ctx.fillRect(x + 9,  y - 17, 9, 5);
    } else {
      ctx.fillRect(x - 14, y - 16, 5, 4);
      ctx.fillRect(x + 9,  y - 16, 5, 4);
    }

    // Head
    ctx.fillStyle = cfg.headColor;
    ctx.fillRect(x - 8, y - 34, 16, 14);

    // Eyes glow
    const glow = 1.5 + Math.sin(Date.now() / 280 + this.walkT * 0.05) * 0.6;
    ctx.fillStyle = cfg.eyeColor;
    ctx.beginPath(); ctx.arc(x - 3, y - 28, glow, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 3, y - 28, glow, 0, Math.PI * 2); ctx.fill();

    // Name tag
    ctx.fillStyle = 'rgba(0,0,0,0.60)';
    ctx.fillRect(x - 16, y - 48, 32, 11);
    ctx.fillStyle = cfg.nameColor;
    ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(cfg.name, x, y - 39);
  }

  _drawHpBar(ctx) {
    const w = 34, h = 4, bx = this.x - w / 2, by = this.y - 54;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(bx - 1, by - 1, w + 2, h + 2);
    ctx.fillStyle = '#3a0000';
    ctx.fillRect(bx, by, w, h);
    const r = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = r > 0.6 ? '#44dd44' : r > 0.3 ? '#ddaa00' : '#ee2222';
    ctx.fillRect(bx, by, w * r, h);
  }
}

class MonsterManager {
  constructor(monsterType, alwaysNight = false) {
    this.monsterType = monsterType;
    this.alwaysNight = alwaysNight;
    this.monsters = [];
    this.spawnTimer = 0;
    this.killNotify = null;
    this.killNotifyT = 0;
  }

  _isNight() {
    return this.alwaysNight || game.daynight.nightAlpha > 0.3;
  }

  _spawnPos() {
    const m = 50;
    switch (Math.floor(Math.random() * 4)) {
      case 0: return { x: m + Math.random() * (CONFIG.W - m * 2), y: 65 };
      case 1: return { x: CONFIG.W - m, y: 65 + Math.random() * (CONFIG.H - 110) };
      case 2: return { x: m + Math.random() * (CONFIG.W - m * 2), y: CONFIG.H - 32 };
      default: return { x: m, y: 65 + Math.random() * (CONFIG.H - 110) };
    }
  }

  update(px, py) {
    const cfg = CONFIG.MONSTERS[this.monsterType];
    const alive = this.monsters.filter(m => !m.dead).length;

    if (this._isNight()) {
      this.spawnTimer++;
      if (this.spawnTimer >= cfg.spawnInterval && alive < cfg.maxCount) {
        this.spawnTimer = 0;
        const pos = this._spawnPos();
        this.monsters.push(new Monster(this.monsterType, pos.x, pos.y));
      }
    } else {
      this.spawnTimer = 0;
      for (const m of this.monsters) if (!m.dead) m.dead = true;
    }

    for (const m of this.monsters) m.update(px, py);
    this.monsters = this.monsters.filter(m => m.deathAlpha > 0);
    if (this.killNotifyT > 0) this.killNotifyT--;
  }

  checkAttack(px, py, range, damage) {
    let hit = false;
    for (const m of this.monsters) {
      if (m.dead) continue;
      const dist = Math.hypot(px - m.x, py - m.y);
      if (dist < range) {
        m.hp -= damage;
        m.hitFlash = 14;
        const nd = Math.max(0.01, dist);
        m.kbx += ((m.x - px) / nd) * 10;
        m.kby += ((m.y - py) / nd) * 10;
        if (m.hp <= 0) {
          m.dead = true;
          const reward = CONFIG.MONSTERS[m.type].reward;
          game.player.money += reward;
          game.player.save();
          this.killNotify = `+$${reward}`;
          this.killNotifyT = 90;
        }
        hit = true;
      }
    }
    return hit;
  }

  render(ctx) {
    for (const m of this.monsters) m.draw(ctx);
    if (this.killNotifyT > 0) {
      const a = Math.min(1, this.killNotifyT / 30);
      ctx.fillStyle = `rgba(255,220,60,${a.toFixed(3)})`;
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(this.killNotify, CONFIG.W / 2, CONFIG.H / 2 - 80);
    }
  }
}
