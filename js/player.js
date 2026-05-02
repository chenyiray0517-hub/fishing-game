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

  catchFish(fish) { this.fish.push({ ...fish }); }

  sellAll() {
    const earned = this.fish.reduce((s,f)=>s+f.value, 0);
    const count  = this.fish.length;
    this.money  += earned;
    this.fish    = [];
    return { earned, count };
  }

  getLineLen()        { return this.rod.lineLen * (1 + this.upgrades.line * 0.2); }
  getBiteMultiplier() { return 1 - this.upgrades.hook * 0.2; }
  getReelPower()      { return this.rod.power * (1 + this.upgrades.reel * 0.25); }

  upgradeCost(id) {
    const u = CONFIG.UPGRADES.find(u=>u.id===id);
    return u.costBase * (1 + (this.upgrades[id] || 0));
  }
}
