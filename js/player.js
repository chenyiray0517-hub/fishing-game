class Player {
  constructor() {
    // Harbor position (feet center)
    this.x = 400; this.y = 310;
    this.w = 22; this.h = 32;
    this.dir = 'down';

    // Ocean boat position
    this.bx = 400; this.by = 480;

    this.money = CONFIG.START_MONEY;
    this.ownedRods = ['wood'];
    this.equippedRod = 'wood';
    this.bait = { worm: CONFIG.START_BAIT_COUNT, shrimp: 0, lure: 0 };
    this.equippedBait = 'worm';
    this.upgrades = { line: 0, hook: 0, reel: 0 };
    this.fish = [];
    this._savedAt = 0;

    // Energy drinks — saved
    this.energyDrinks = 0;

    // Items (backpack) — saved  {id: count}
    this.items = {};

    // Encyclopedia: fish species ever caught — saved  {id: true}
    this.caughtIds = {};

    // Unlocked areas — saved
    this.unlockedAreas = ['harbor', 'ocean', 'lake'];

    // Quest state — saved  { lake: {fishId,qty,reward}|null, ... }
    this.activeQuests = { lake: null, beach: null, pond: null, ocean: null, ocean2: null };

    // Weapons — saved
    this.ownedSwords  = [];
    this.equippedSword = null;

    // Lucky charm active — ephemeral
    this.luckyCharmActive = false;

    // SAN (sanity) — ephemeral, not saved
    this.san       = 0;
    this.sanTimer  = 0;   // frames since last +1 san
    this.deathTimer = -1; // -1 = alive; >0 = frames until death
    this.lying     = false;
    this.lyingTimer = 0;  // frames since last -1 san

    // Combat — ephemeral (not saved)
    this.hp = 100; this.maxHp = 100;
    this.hitFlash = 0;
    this.attackCooldown = 0;
    this.attackAnim = 0;
    this.mode = 'rod'; // 'rod' | 'sword'

    this.load();
  }

  get rod()        { return CONFIG.RODS.find(r => r.id === this.equippedRod); }
  get baitCfg()    { return CONFIG.BAITS.find(b => b.id === this.equippedBait); }
  get baitCount()  { return this.bait[this.equippedBait] || 0; }
  get totalBait()  { return Object.values(this.bait).reduce((s,v)=>s+v,0); }
  get swordCfg()   { return this.equippedSword ? CONFIG.SWORDS.find(s => s.id === this.equippedSword) : null; }

  useBait() {
    if (this.bait[this.equippedBait] > 0) { this.bait[this.equippedBait]--; return true; }
    return false;
  }

  refundBait() { this.bait[this.equippedBait]++; }

  catchFish(fish) {
    this.fish.push({ ...fish });
    this.caughtIds[fish.id] = true;
    this.save();
  }

  sellAll() {
    const earned = this.fish.reduce((s,f)=>s+f.value, 0);
    const count  = this.fish.length;
    this.money  += earned;
    this.fish    = [];
    this.save();
    return { earned, count };
  }

  // ── 背包道具 ────────────────────────────────────────────────────────
  addItem(id) {
    this.items[id] = (this.items[id] || 0) + 1;
    this.save();
  }

  removeItem(id) {
    if (!this.items[id]) return false;
    this.items[id]--;
    if (this.items[id] <= 0) delete this.items[id];
    this.save();
    return true;
  }

  hasItem(id)   { return (this.items[id] || 0) > 0; }
  itemCount(id) { return this.items[id] || 0; }

  // 所有擁有的道具清單 [{cfg, count}]
  itemList() {
    return CONFIG.ITEMS
      .filter(cfg => (this.items[cfg.id] || 0) > 0)
      .map(cfg => ({ cfg, count: this.items[cfg.id] }));
  }

  takeDamage(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
    this.hitFlash = 18;
    if (this.hp <= 0) {
      this.hp = 100;
      this.money = Math.floor(this.money * 0.8);
      this.fish = [];
      this.save();
      for (const s of [game.ocean, game.ocean2, game.lake, game.beach, game.pond]) {
        s.fishing.reset();
        if (s.monsterMgr) for (const m of s.monsterMgr.monsters) m.dead = true;
      }
      game.scene = 'harbor';
      this.x = game.harbor.BED.x;
      this.y = game.harbor.BED.y;
    }
  }

  unlockArea(area) {
    if (!this.unlockedAreas.includes(area)) {
      this.unlockedAreas.push(area);
      this.save();
    }
  }

  isUnlocked(area) { return this.unlockedAreas.includes(area); }

  save() {
    try {
      localStorage.setItem('fishingGame_v1', JSON.stringify({
        money:          this.money,
        ownedRods:      this.ownedRods,
        equippedRod:    this.equippedRod,
        bait:           this.bait,
        equippedBait:   this.equippedBait,
        upgrades:       this.upgrades,
        fish:           this.fish,
        energyDrinks:   this.energyDrinks,
        items:          this.items,
        unlockedAreas:  this.unlockedAreas,
        caughtIds:      this.caughtIds,
        activeQuests:   this.activeQuests,
        ownedSwords:    this.ownedSwords,
        equippedSword:  this.equippedSword,
      }));
      this._savedAt = Date.now();
    } catch(e) {}
  }

  load() {
    try {
      const raw = localStorage.getItem('fishingGame_v1');
      if (!raw) return false;
      const d = JSON.parse(raw);
      this.money          = d.money          ?? this.money;
      this.ownedRods      = d.ownedRods      ?? this.ownedRods;
      this.equippedRod    = d.equippedRod    ?? this.equippedRod;
      this.bait           = d.bait           ?? this.bait;
      this.equippedBait   = d.equippedBait   ?? this.equippedBait;
      this.upgrades       = d.upgrades       ?? this.upgrades;
      this.fish           = d.fish           ?? this.fish;
      this.energyDrinks   = d.energyDrinks   ?? this.energyDrinks;
      this.items          = d.items          ?? this.items;
      this.unlockedAreas  = d.unlockedAreas  ?? this.unlockedAreas;
      this.caughtIds      = d.caughtIds      ?? this.caughtIds;
      this.ownedSwords    = d.ownedSwords    ?? this.ownedSwords;
      this.equippedSword  = d.equippedSword  ?? this.equippedSword;
      if (d.activeQuests) {
        for (const k of Object.keys(this.activeQuests)) {
          const q = d.activeQuests[k];
          // migrate old saves that lacked `accepted` → treat as accepted
          this.activeQuests[k] = q ? { ...q, accepted: q.accepted ?? true } : null;
        }
      }
      // Sanitize: equippedRod must be owned
      if (!this.ownedRods.includes(this.equippedRod))
        this.equippedRod = this.ownedRods[0] || 'wood';
      // Ensure base areas are always unlocked
      for (const a of ['harbor', 'ocean', 'lake'])
        if (!this.unlockedAreas.includes(a)) this.unlockedAreas.push(a);
      return true;
    } catch(e) { return false; }
  }

  getLineLen()        { return this.rod.lineLen * (1 + this.upgrades.line * 0.2); }
  getBiteMultiplier() { return 1 - this.upgrades.hook * 0.2; }
  getReelPower()      { return this.rod.power * (1 + this.upgrades.reel * 0.25); }

  upgradeCost(id) {
    const u = CONFIG.UPGRADES.find(u=>u.id===id);
    return u.costBase * (1 + (this.upgrades[id] || 0));
  }
}
