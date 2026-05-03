const CONFIG = {
  W: 800, H: 600,
  PLAYER_SPEED: 2.8,
  BOAT_SPEED: 2.5,

  RODS: [
    { id: 'wood',   name: '木製釣竿', price: 0,     power: 1.0, lineLen: 180 },
    { id: 'iron',   name: '鐵製釣竿', price: 280,   power: 1.5, lineLen: 220 },
    { id: 'carbon', name: '碳纖釣竿', price: 700,   power: 2.2, lineLen: 270 },
    { id: 'master', name: '大師釣竿', price: 1800,  power: 3.2, lineLen: 340 },
    { id: 'legend', name: '傳說釣竿', price: 4500,  power: 4.5, lineLen: 420 },
    { id: 'deep',   name: '深海釣竿', price: 9800,  power: 6.0, lineLen: 520 },
    { id: 'divine', name: '神器釣竿', price: 24000, power: 8.5, lineLen: 660 },
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
    { id: 'sardine',    name: '沙丁魚', value: 12,  color: '#87ceeb', difficulty: 0.7, sz: 12 },
    { id: 'catfish',    name: '鯰魚',   value: 22,  color: '#7a6040', difficulty: 1.0, sz: 14 },
    { id: 'carp',       name: '鯉魚',   value: 35,  color: '#d4a04a', difficulty: 1.2, sz: 15 },
    { id: 'bass',       name: '鱸魚',   value: 45,  color: '#5580a0', difficulty: 1.5, sz: 16 },
    { id: 'trout',      name: '鱒魚',   value: 85,  color: '#6a9a60', difficulty: 2.4, sz: 17 },
    { id: 'flounder',   name: '比目魚', value: 68,  color: '#a08060', difficulty: 2.0, sz: 18 },
    { id: 'octopus',    name: '章魚',   value: 96,  color: '#9966aa', difficulty: 2.8, sz: 18 },
    { id: 'eel',        name: '鰻魚',   value: 165, color: '#4a6a40', difficulty: 3.6, sz: 16 },
    { id: 'tuna',       name: '鮪魚',   value: 110, color: '#204070', difficulty: 2.6, sz: 20 },
    { id: 'swordfish',  name: '旗魚',   value: 240, color: '#3355bb', difficulty: 3.8, sz: 24 },
    { id: 'shark',      name: '鯊魚',   value: 360, color: '#607080', difficulty: 4.5, sz: 26 },
    { id: 'giant_cat',  name: '巨鯰',   value: 450, color: '#7a6040', difficulty: 5.0, sz: 28 },
    { id: 'dragon',     name: '龍魚',   value: 780, color: '#ffd700', difficulty: 5.2, sz: 30 },
  ],

  LAKE_SPOTS: [
    { x:680, y:340, r:40, name:'東岸',   fish:['carp','sardine','catfish','trout'],    biteTime:[2,5]  },
    { x:490, y:500, r:44, name:'蘆葦叢', fish:['carp','trout','eel','bass'],            biteTime:[3,7]  },
    { x:350, y:290, r:46, name:'深潭',   fish:['eel','trout','giant_cat','swordfish'],  biteTime:[5,11] },
  ],

  SPOTS: [
    { x: 175, y: 145, r: 40, name: '淺灘',    fish: ['sardine','catfish','bass'],                 biteTime:[2,5]  },
    { x: 530, y: 115, r: 38, name: '礁石區',   fish: ['sardine','bass','flounder','octopus'],      biteTime:[3,7]  },
    { x: 690, y: 290, r: 45, name: '深水區',   fish: ['bass','tuna','swordfish','shark'],          biteTime:[4,9]  },
    { x: 120, y: 430, r: 35, name: '暗礁',     fish: ['catfish','bass','tuna','flounder'],         biteTime:[3,8]  },
    { x: 430, y: 460, r: 52, name: '神秘深淵', fish: ['tuna','swordfish','shark','dragon'],        biteTime:[6,12] },
  ],

  START_MONEY: 150,
  START_BAIT_COUNT: 5,
};
