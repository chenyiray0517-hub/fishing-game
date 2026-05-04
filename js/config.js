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
    // 秘密池塘限定特殊魚
    { id: 'moonfish',    name: '月亮魚', value: 320,  color: '#c0e8ff', difficulty: 3.5, sz: 20 },
    { id: 'crystal_eel', name: '水晶鰻', value: 480,  color: '#88ffee', difficulty: 4.2, sz: 18 },
    { id: 'spirit_carp', name: '靈鯉',   value: 650,  color: '#ff88cc', difficulty: 4.8, sz: 22 },
    { id: 'void_squid',  name: '虛空魷', value: 900,  color: '#aa55ff', difficulty: 5.6, sz: 24 },
    // 第二海限定深海魚
    { id: 'deep_marlin', name: '深海旗魚', value: 450,  color: '#3366bb', difficulty: 4.5, sz: 26 },
    { id: 'abyss_shark', name: '深淵鯊',   value: 680,  color: '#334466', difficulty: 5.3, sz: 28 },
    { id: 'sea_dragon',  name: '海龍',     value: 1100, color: '#44bbff', difficulty: 6.2, sz: 32 },
  ],

  LAKE_SPOTS: [
    { x:680, y:340, r:40, name:'東岸',   fish:['carp','sardine','catfish','trout'],    biteTime:[2,5],  itemDrops:[{id:'beach_map',chance:0.06},{id:'pond_map',chance:0.025}] },
    { x:490, y:500, r:44, name:'蘆葦叢', fish:['carp','trout','eel','bass'],            biteTime:[3,7],  itemDrops:[{id:'beach_map',chance:0.06},{id:'pond_map',chance:0.025}] },
    { x:350, y:290, r:46, name:'深潭',   fish:['eel','trout','giant_cat','swordfish'],  biteTime:[5,11], itemDrops:[{id:'beach_map',chance:0.06},{id:'pond_map',chance:0.04}]  },
  ],

  SPOTS: [
    { x: 175, y: 145, r: 40, name: '淺灘',    fish: ['sardine','catfish','bass'],          biteTime:[2,5],  itemDrops:[{id:'beach_map',chance:0.06},{id:'pond_map',chance:0.02}] },
    { x: 530, y: 115, r: 38, name: '礁石區',   fish: ['sardine','bass','flounder','octopus'],biteTime:[3,7],  itemDrops:[{id:'beach_map',chance:0.06},{id:'pond_map',chance:0.02}] },
    { x: 690, y: 290, r: 45, name: '深水區',   fish: ['bass','tuna','swordfish','shark'],   biteTime:[4,9],  itemDrops:[{id:'beach_map',chance:0.05},{id:'pond_map',chance:0.025},{id:'ocean2_map',chance:0.04}] },
    { x: 120, y: 430, r: 35, name: '暗礁',     fish: ['catfish','bass','tuna','flounder'],  biteTime:[3,8],  itemDrops:[{id:'beach_map',chance:0.05},{id:'pond_map',chance:0.02},{id:'ocean2_map',chance:0.035}] },
    { x: 430, y: 460, r: 52, name: '神秘深淵', fish: ['tuna','swordfish','shark','dragon'], biteTime:[6,12], itemDrops:[{id:'pond_map',chance:0.05},{id:'beach_map',chance:0.04},{id:'ocean2_map',chance:0.06}] },
  ],

  // 海灘：需解鎖，整體明顯優於海洋/湖邊（avg $150~$460），等待更長
  BEACH_SPOTS: [
    { x: 170, y: 335, r: 38, name: '礁岩', fish: ['trout','flounder','octopus','eel'],          biteTime:[4,9],  itemDrops:[{id:'pond_map',chance:0.05},{id:'lucky_charm',chance:0.02}] },
    { x: 400, y: 358, r: 44, name: '沙洲', fish: ['eel','tuna','swordfish','shark'],             biteTime:[6,11], itemDrops:[{id:'pond_map',chance:0.05},{id:'lucky_charm',chance:0.02}] },
    { x: 630, y: 340, r: 40, name: '外礁', fish: ['swordfish','shark','giant_cat','dragon'],     biteTime:[8,15], itemDrops:[{id:'pond_map',chance:0.06},{id:'lucky_charm',chance:0.03}] },
  ],

  // 第二海：需第二海海圖解鎖，深海獨家魚種（avg $380~$740），難度高
  OCEAN2_SPOTS: [
    { x: 210, y: 195, r: 44, name: '深淵入口', fish: ['eel','tuna','deep_marlin','swordfish'],       biteTime:[5,11], itemDrops:[{id:'pond_map',chance:0.04}] },
    { x: 430, y: 300, r: 52, name: '海底山',   fish: ['tuna','deep_marlin','abyss_shark','swordfish'],biteTime:[7,14], itemDrops:[{id:'pond_map',chance:0.05}] },
    { x: 645, y: 195, r: 46, name: '幽冥海溝', fish: ['abyss_shark','sea_dragon','deep_marlin'],      biteTime:[9,17], itemDrops:[{id:'pond_map',chance:0.06}] },
  ],

  // 秘密池塘：最高級區域，獨家魚種（avg $480~$623），難度最高
  POND_SPOTS: [
    { x: 200, y: 320, r: 42, name: '苔岸',   fish: ['moonfish','crystal_eel','spirit_carp'],              biteTime:[5,11], itemDrops:[{id:'lucky_charm',chance:0.12},{id:'san_potion',chance:0.08},{id:'mystery_box',chance:0.06}] },
    { x: 400, y: 365, r: 50, name: '幽深處', fish: ['spirit_carp','crystal_eel','void_squid','moonfish'],  biteTime:[7,14], itemDrops:[{id:'lucky_charm',chance:0.10},{id:'san_potion',chance:0.10},{id:'mystery_box',chance:0.08}] },
    { x: 610, y: 315, r: 44, name: '月影潭', fish: ['moonfish','void_squid','spirit_carp'],                biteTime:[6,13], itemDrops:[{id:'lucky_charm',chance:0.12},{id:'san_potion',chance:0.08},{id:'mystery_box',chance:0.07}] },
  ],

  // 道具定義
  ITEMS: [
    { id: 'beach_map',   name: '海灘地圖',    type: 'unlock',  area: 'beach',  icon: '🗺️',
      desc: '標記著通往海灘神秘路線的舊地圖。\n使用後解鎖海灘區域。' },
    { id: 'pond_map',    name: '秘密池塘地圖', type: 'unlock',  area: 'pond',   icon: '📜',
      desc: '古舊的羊皮紙，上面畫著\n一處隱藏水潭的位置。使用後解鎖。' },
    { id: 'ocean2_map',  name: '第二海海圖',   type: 'unlock',  area: 'ocean2', icon: '🌀',
      desc: '印有深海航線的神秘海圖。\n使用後解鎖前往第二海的航道。' },
    { id: 'lucky_charm', name: '幸運符',       type: 'consume', icon: '🍀',
      desc: '帶有靈氣的符咒。\n下次出釣的等待時間縮短 80%。' },
    { id: 'san_potion',  name: '安神藥水',     type: 'consume', icon: '💊',
      desc: '散發淡淡香氣的神秘藥水。\n使用後立即降低 SAN 值 50。' },
    { id: 'mystery_box', name: '神秘寶箱',     type: 'consume', icon: '🎁',
      desc: '不知道裡面裝了什麼…\n打開後獲得 $500～$2000 的金幣。' },
  ],

  START_MONEY: 150,
  START_BAIT_COUNT: 5,
};
