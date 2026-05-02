const CONFIG = {
  W: 800, H: 600,
  PLAYER_SPEED: 2.8,
  BOAT_SPEED: 2.5,

  RODS: [
    { id: 'wood',   name: '木製釣竿', price: 0,    power: 1.0, lineLen: 180 },
    { id: 'iron',   name: '鐵製釣竿', price: 280,  power: 1.5, lineLen: 220 },
    { id: 'carbon', name: '碳纖釣竿', price: 700,  power: 2.2, lineLen: 270 },
    { id: 'master', name: '大師釣竿', price: 1800, power: 3.2, lineLen: 340 },
  ],

  BAITS: [
    { id: 'worm',   name: '蚯蚓',   price: 5,  packSize: 10, quality: 1.0, color: '#aa7744' },
    { id: 'shrimp', name: '蝦餌',   price: 12, packSize: 10, quality: 1.6, color: '#ff8866' },
    { id: 'lure',   name: '假餌',   price: 28, packSize:  5, quality: 2.2, color: '#44aaff' },
  ],

  UPGRADES: [
    { id: 'line',  name: '延長釣線',  costBase: 150, maxLv: 3, desc: '每級增加拋竿距離 +20%' },
    { id: 'hook',  name: '魚鉤強化',  costBase: 200, maxLv: 3, desc: '每級縮短等待時間 -20%' },
    { id: 'reel',  name: '捲線器升級', costBase: 260, maxLv: 3, desc: '每級加快收竿力道 +25%' },
  ],

  FISH: [
    { id: 'sardine',   name: '沙丁魚', value: 12,  color: '#87ceeb', difficulty: 0.7, sz: 12 },
    { id: 'bass',      name: '鱸魚',   value: 45,  color: '#5580a0', difficulty: 1.5, sz: 16 },
    { id: 'tuna',      name: '鮪魚',   value: 110, color: '#204070', difficulty: 2.6, sz: 20 },
    { id: 'swordfish', name: '旗魚',   value: 240, color: '#3355bb', difficulty: 3.8, sz: 24 },
    { id: 'dragon',    name: '龍魚',   value: 780, color: '#ffd700', difficulty: 5.2, sz: 30 },
  ],

  SPOTS: [
    { x: 175, y: 145, r: 40, name: '淺灘',    fish: ['sardine','bass'],                biteTime:[2,5]  },
    { x: 530, y: 115, r: 38, name: '礁石區',   fish: ['sardine','bass','tuna'],         biteTime:[3,7]  },
    { x: 690, y: 290, r: 45, name: '深水區',   fish: ['bass','tuna','swordfish'],       biteTime:[4,9]  },
    { x: 120, y: 430, r: 35, name: '暗礁',     fish: ['bass','tuna'],                  biteTime:[3,8]  },
    { x: 430, y: 460, r: 52, name: '神秘深淵', fish: ['tuna','swordfish','dragon'],     biteTime:[6,12] },
  ],

  START_MONEY: 150,
  START_BAIT_COUNT: 5,
};
