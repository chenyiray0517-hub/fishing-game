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

    // SAN (sanity) — ephemeral, not saved
    this.san       = 0;
    this.sanTimer  = 0;   // frames since last +1 san
    this.deathTimer = -1; // -1 = alive; >0 = frames until death
    this.lying     = false;
    this.lyingTimer = 0;  // frames since last -1 san

    this.load();
  }

  get rod()       { return CONFIG.RODS.find(r => r.id === this.equippedRod); }
  get baitCfg()   { return CONFIG.BAITS.find(b => b.id === this.equippedBait); }
  get baitCount() { return this.bait[this.equippedBait] || 0; }
  get totalBait() { return Object.values(this.bait).reduce((s,v)=>s+v,0); }

  useBait() {
    if (this.bait[this.equippedBait] > 0) { this.bait[this.equippedBait]--; return true; }
    return false;
  }

  refundBait() { this.bait[this.equippedBait]++; }

  catchFish(fish) { this.fish.push({ ...fish }); this.save(); }

  sellAll() {
    const earned = this.fish.reduce((s,f)=>s+f.value, 0);
    const count  = this.fish.length;
    this.money  += earned;
    this.fish    = [];
    this.save();
    return { earned, count };
  }

  save() {
    try {
      localStorage.setItem('fishingGame_v1', JSON.stringify({
        money:        this.money,
        ownedRods:    this.ownedRods,
        equippedRod:  this.equippedRod,
        bait:         this.bait,
        equippedBait: this.equippedBait,
        upgrades:     this.upgrades,
        fish:         this.fish,
      }));
      this._savedAt = Date.now();
    } catch(e) {}
  }

  load() {
    try {
      const raw = localStorage.getItem('fishingGame_v1');
      if (!raw) return false;
      const d = JSON.parse(raw);
      this.money        = d.money        ?? this.money;
      this.ownedRods    = d.ownedRods    ?? this.ownedRods;
      this.equippedRod  = d.equippedRod  ?? this.equippedRod;
      this.bait         = d.bait         ?? this.bait;
      this.equippedBait = d.equippedBait ?? this.equippedBait;
      this.upgrades     = d.upgrades     ?? this.upgrades;
      this.fish         = d.fish         ?? this.fish;
      // Sanitize: equippedRod must be owned
      if (!this.ownedRods.includes(this.equippedRod))
        this.equippedRod = this.ownedRods[0] || 'wood';
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
