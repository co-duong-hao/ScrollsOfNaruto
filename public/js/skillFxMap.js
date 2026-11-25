// Complete 200-Card Canon Naruto VFX & SFX Mapping (30 Clans + Signature Jutsus)
// Every card ID (0..199) resolves to a deterministic visual + audio profile.

const CLAN_PROFILES = {
  uchiha: {
    kind: 'fire',
    colors: ['#ef4444', '#f97316', '#fde047'],
    glow: '#dc2626',
    chargeFx: 'fire_charge_01',
    projectileFx: 'fire_projectile_01',
    impactFx: 'fire_impact_01',
    slashFx: 'fire_slash_01',
    shieldFx: 'fire_shield_01',
    specialCast: { type: 'sharingan_eye' },
    sfxCast: 'katon',
    sfxImpact: 'fire_hit',
  },
  mangakyo: {
    kind: 'darkfire',
    colors: ['#dc2626', '#111827', '#a855f7'],
    glow: '#dc2626',
    chargeFx: 'dark_aura_01',
    impactFx: 'dark_impact_01',
    shieldFx: 'dark_shield_01',
    specialCast: { type: 'mangekyo_eye' },
    instantImpact: true,
    sfxCast: 'mangekyo',
    sfxImpact: 'dark_hit',
  },
  rinnegan: {
    kind: 'gravity',
    colors: ['#a855f7', '#e9d5ff', '#6b21a8'],
    glow: '#9333ea',
    chargeFx: 'dark_charge_01',
    projectileFx: 'dark_projectile_01',
    impactFx: 'dark_impact_01',
    shieldFx: 'dark_shield_01',
    specialCast: { type: 'rinnegan_ripple' },
    sfxCast: 'rinnegan',
    sfxImpact: 'gravity_hit',
  },
  hyuga: {
    kind: 'light',
    colors: ['#67e8f9', '#e0f2fe', '#0284c7'],
    glow: '#38bdf8',
    chargeFx: 'light_aura_01',
    impactFx: 'light_impact_01',
    slashFx: 'light_slash_01',
    shieldFx: 'light_shield_01',
    specialImpact: { type: 'byakugan_bagua' },
    sfxCast: 'byakugan',
    sfxImpact: 'gentle_fist',
  },
  'nhẫn cụ': {
    kind: 'weapon',
    colors: ['#e2e8f0', '#94a3b8', '#f97316'],
    glow: '#cbd5e1',
    impactFx: 'rock_impact_01',
    slashFx: 'wind_slash_01',
    specialCast: { type: 'ninja_weapons', variant: 'kunai' },
    sfxCast: 'kunai',
    sfxImpact: 'metal_hit',
  },
  'tia chớp vàng': {
    kind: 'lightning',
    colors: ['#facc15', '#fef08a', '#ffffff'],
    glow: '#facc15',
    chargeFx: 'thunder_aura_01',
    impactFx: 'thunder_strike_02',
    slashFx: 'thunder_slash_01',
    specialCast: { type: 'hiraishin_flash' },
    instantImpact: true,
    sfxCast: 'hiraishin',
    sfxImpact: 'lightning_hit',
  },
  'bom nghệ thuật': {
    kind: 'fire',
    colors: ['#fef08a', '#f97316', '#dc2626'],
    glow: '#f97316',
    chargeFx: 'fire_charge_01',
    projectileFx: 'fire_projectile_01',
    impactFx: 'fire_impact_02',
    sfxCast: 'bomb_throw',
    sfxImpact: 'bomb_explode',
  },
  'nghệ thuật rối': {
    kind: 'poison',
    colors: ['#a855f7', '#cbd5e1', '#78350f'],
    glow: '#9333ea',
    chargeFx: 'poison_aura_01',
    projectileFx: 'poison_projectile_01',
    impactFx: 'poison_impact_01',
    shieldFx: 'rock_shield_01',
    specialCast: { type: 'puppet_threads' },
    sfxCast: 'puppet',
    sfxImpact: 'puppet_hit',
  },
  'cá mập và sóng': {
    kind: 'water',
    colors: ['#0ea5e9', '#38bdf8', '#bae6fd'],
    glow: '#0284c7',
    chargeFx: 'water_aura_01',
    impactFx: 'water_column_01',
    impactFx2: 'water_impact_01',
    slashFx: 'water_slash_01',
    shieldFx: 'water_shield_01',
    sfxCast: 'suiton',
    sfxImpact: 'water_hit',
  },
  'phong ấn': {
    kind: 'seal',
    colors: ['#facc15', '#dc2626', '#fef08a'],
    glow: '#d97706',
    chargeFx: 'light_aura_01',
    impactFx: 'light_column_01',
    specialImpact: { type: 'seal_gate', variant: 'chains' },
    instantImpact: true,
    sfxCast: 'seal',
    sfxImpact: 'seal_hit',
  },
  'sa mạc và máu': {
    kind: 'sand',
    colors: ['#fbbf24', '#d97706', '#fef3c7'],
    glow: '#d97706',
    chargeFx: 'rock_charge_01',
    impactFx: 'rock_column_01',
    shieldFx: 'rock_shield_01',
    specialCast: { type: 'sand_wave' },
    sfxCast: 'sand',
    sfxImpact: 'earth_hit',
  },
  'ảo thuật': {
    kind: 'genjutsu',
    colors: ['#dc2626', '#7e22ce', '#f87171'],
    glow: '#dc2626',
    chargeFx: 'dark_aura_01',
    impactFx: 'dark_impact_01',
    specialCast: { type: 'sharingan_eye' },
    instantImpact: true,
    sfxCast: 'genjutsu',
    sfxImpact: 'genjutsu',
  },
  'thể thuật': {
    kind: 'taijutsu',
    colors: ['#22c55e', '#f97316', '#fef08a'],
    glow: '#22c55e',
    chargeFx: 'wind_aura_01',
    impactFx: 'rock_impact_01',
    slashFx: 'rock_slash_01',
    specialCast: { type: 'eight_gates', variant: 'kaimon' },
    sfxCast: 'taijutsu',
    sfxImpact: 'heavy_hit',
  },
  'hoa anh đào': {
    kind: 'heal',
    colors: ['#f472b6', '#4ade80', '#fbcfe8'],
    glow: '#f472b6',
    chargeFx: 'light_aura_01',
    impactFx: 'light_impact_01',
    specialCast: { type: 'sakura_petals' },
    sfxCast: 'heal',
    sfxImpact: 'sakura_hit',
  },
  'khiển bóng': {
    kind: 'shadow',
    colors: ['#1e1b4b', '#6b21a8', '#cbd5e1'],
    glow: '#7c3aed',
    chargeFx: 'dark_aura_01',
    impactFx: 'dark_slash_01',
    specialCast: { type: 'shadow_bind' },
    instantImpact: true,
    sfxCast: 'shadow',
    sfxImpact: 'dark_hit',
  },
  'ninja sao chép': {
    kind: 'lightning',
    colors: ['#38bdf8', '#fde047', '#ffffff'],
    glow: '#38bdf8',
    chargeFx: 'thunder_charge_01',
    impactFx: 'thunder_strike_01',
    slashFx: 'thunder_slash_01',
    shieldFx: 'rock_shield_01',
    sfxCast: 'chidori',
    sfxImpact: 'lightning_hit',
  },
  'thiên thần giấy': {
    kind: 'paper',
    colors: ['#f8fafc', '#e2e8f0', '#f97316'],
    glow: '#cbd5e1',
    chargeFx: 'wind_aura_01',
    impactFx: 'wind_slash_01',
    shieldFx: 'light_shield_01',
    specialCast: { type: 'paper_storm', variant: 'paper' },
    sfxCast: 'paper',
    sfxImpact: 'slash_hit',
  },
  'mộc độn': {
    kind: 'wood',
    colors: ['#22c55e', '#854d0e', '#bbf7d0'],
    glow: '#16a34a',
    chargeFx: 'rock_charge_01',
    impactFx: 'rock_column_01',
    shieldFx: 'rock_shield_01',
    specialImpact: { type: 'wood_roots' },
    sfxCast: 'wood',
    sfxImpact: 'earth_hit',
  },
  'ma kính băng tinh': {
    kind: 'ice',
    colors: ['#bae6fd', '#38bdf8', '#ffffff'],
    glow: '#38bdf8',
    chargeFx: 'light_aura_01',
    projectileFx: 'ice_projectile_01',
    impactFx: 'ice_impact_01',
    slashFx: 'ice_slash_01',
    shieldFx: 'ice_shield_01',
    sfxCast: 'ice',
    sfxImpact: 'ice_hit',
  },
  'bộ cóc': {
    kind: 'fire',
    colors: ['#f97316', '#84cc16', '#fef08a'],
    glow: '#ea580c',
    chargeFx: 'fire_charge_01',
    projectileFx: 'fire_projectile_01',
    impactFx: 'fire_impact_01',
    sfxCast: 'kuchiyose',
    sfxImpact: 'fire_hit',
  },
  'bộ rắn': {
    kind: 'poison',
    colors: ['#9333ea', '#c084fc', '#fde047'],
    glow: '#a855f7',
    chargeFx: 'poison_aura_01',
    impactFx: 'poison_impact_01',
    sfxCast: 'shadow',
    sfxImpact: 'dark_hit',
  },
  'cửu vĩ': {
    kind: 'fire',
    colors: ['#dc2626', '#f97316', '#facc15'],
    glow: '#ef4444',
    chargeFx: 'fire_aura_01',
    impactFx: 'fire_impact_02',
    specialCast: { type: 'meteor_gravity', variant: 'kyubi' },
    beam: true,
    sfxCast: 'kyubi_roar',
    sfxImpact: 'bomb_explode',
  },
  'côn trùng': {
    kind: 'poison',
    colors: ['#84cc16', '#3f6212', '#a855f7'],
    glow: '#65a30d',
    chargeFx: 'poison_aura_01',
    impactFx: 'poison_impact_01',
    specialCast: { type: 'bug_swarm' },
    sfxCast: 'bugs',
    sfxImpact: 'poison_hit',
  },
  'gió và cánh quạt': {
    kind: 'wind',
    colors: ['#34d399', '#a7f3d0', '#ffffff'],
    glow: '#10b981',
    chargeFx: 'wind_charge_01',
    projectileFx: 'wind_vortex_01',
    impactFx: 'wind_impact_01',
    slashFx: 'wind_slash_01',
    sfxCast: 'futon',
    sfxImpact: 'slash_hit',
  },
  'lôi vân': {
    kind: 'lightning',
    colors: ['#facc15', '#38bdf8', '#ffffff'],
    glow: '#eab308',
    chargeFx: 'thunder_charge_01',
    impactFx: 'thunder_strike_02',
    slashFx: 'thunder_slash_01',
    shieldFx: 'thunder_shield_01',
    sfxCast: 'chidori',
    sfxImpact: 'lightning_hit',
  },
  'thất kiếm': {
    kind: 'water',
    colors: ['#06b6d4', '#67e8f9', '#e2e8f0'],
    glow: '#0891b2',
    chargeFx: 'water_aura_01',
    impactFx: 'water_impact_01',
    slashFx: 'water_slash_01',
    shieldFx: 'water_shield_01',
    sfxCast: 'blade_slash',
    sfxImpact: 'slash_hit',
  },
  'thi cốt mạch': {
    kind: 'earth',
    colors: ['#e2e8f0', '#94a3b8', '#f8fafc'],
    glow: '#cbd5e1',
    chargeFx: 'rock_charge_01',
    impactFx: 'rock_column_01',
    slashFx: 'rock_slash_01',
    shieldFx: 'rock_shield_01',
    sfxCast: 'blade_slash',
    sfxImpact: 'heavy_hit',
  },
  'huyết tế': {
    kind: 'darkfire',
    colors: ['#dc2626', '#7f1d1d', '#fca5a5'],
    glow: '#b91c1c',
    chargeFx: 'dark_aura_01',
    impactFx: 'dark_impact_01',
    slashFx: 'dark_slash_01',
    shieldFx: 'rock_shield_01',
    sfxCast: 'shadow',
    sfxImpact: 'dark_hit',
  },
  'trần thổ': {
    kind: 'earth',
    colors: ['#d97706', '#fcd34d', '#78350f'],
    glow: '#b45309',
    chargeFx: 'rock_charge_01',
    impactFx: 'rock_column_01',
    impactFx2: 'rock_impact_01',
    shieldFx: 'rock_shield_01',
    sfxCast: 'earth_rumble',
    sfxImpact: 'earth_hit',
  },
  thường: {
    kind: 'standard',
    colors: ['#fbbf24', '#f97316', '#f8fafc'],
    glow: '#f59e0b',
    chargeFx: 'light_aura_01',
    impactFx: 'rock_impact_01',
    shieldFx: 'rock_shield_01',
    sfxCast: 'hand_seal',
    sfxImpact: 'hit_deep',
  },
};

// Signature Per-Card Canon Overrides (by card ID)
const CARD_OVERRIDES = {
  // Uchiha & Mangekyo
  0: { specialCast: { type: 'sharingan_eye' }, chargeFx: 'dark_aura_01', sfxCast: 'sharingan' },
  8: { specialCast: { type: 'sharingan_eye' }, chargeFx: 'light_aura_01', shieldFx: 'light_shield_01', sfxCast: 'sharingan' },
  40: { specialCast: { type: 'meteor_gravity', variant: 'susanoo' }, chargeFx: 'dark_shield_01', shieldFx: 'dark_shield_01', sfxCast: 'susanoo' },
  41: { projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_01', specialCast: null, sfxCast: 'katon', sfxImpact: 'fire_hit' },
  42: { projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_01', specialCast: null, sfxCast: 'katon', sfxImpact: 'fire_hit' },
  46: { specialCast: { type: 'mangekyo_eye' }, chargeFx: 'dark_charge_01', sfxCast: 'mangekyo' },
  47: {
    specialCast: { type: 'mangekyo_eye' },
    impactFx: 'dark_impact_01',
    impactFx2: 'fire_impact_02',
    instantImpact: true,
    beam: false,
    sfxCast: 'amaterasu',
    sfxImpact: 'amaterasu',
  },
  48: { specialCast: { type: 'mangekyo_eye' }, impactFx: 'dark_impact_01', instantImpact: true, sfxCast: 'genjutsu', sfxImpact: 'genjutsu' },
  49: { specialCast: { type: 'mangekyo_eye' }, impactFx: 'dark_aura_01', sfxCast: 'teleport' },
  50: { specialCast: { type: 'mangekyo_eye' }, shieldFx: 'dark_shield_01', sfxCast: 'teleport' },
  117: { specialCast: { type: 'mangekyo_eye' }, impactFx: 'dark_aura_01', instantImpact: true, sfxCast: 'genjutsu' },

  // Rasengan / Chidori / Classic Ninjutsu (thường)
  1: {
    kind: 'rasengan',
    colors: ['#38bdf8', '#e0f2fe', '#0284c7'],
    glow: '#38bdf8',
    chargeFx: 'light_aura_01',
    projectileFx: 'wind_vortex_01',
    impactFx: 'wind_impact_01',
    impactFx2: 'light_impact_01',
    sfxCast: 'rasengan',
    sfxImpact: 'rasengan_hit',
  },
  25: {
    kind: 'rasengan',
    colors: ['#38bdf8', '#e0f2fe', '#0284c7'],
    glow: '#38bdf8',
    chargeFx: 'wind_charge_01',
    projectileFx: 'wind_vortex_02',
    impactFx: 'wind_vortex_02',
    impactFx2: 'light_column_01',
    beam: true,
    sfxCast: 'rasengan_big',
    sfxImpact: 'bomb_explode',
  },
  4: { kind: 'fire', colors: ['#ff5a1f', '#fb923c', '#fde047'], glow: '#ff5a1f', chargeFx: 'fire_charge_01', projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_01', sfxCast: 'katon', sfxImpact: 'fire_hit' },
  27: { kind: 'fire', colors: ['#ff5a1f', '#fb923c', '#fde047'], glow: '#ff5a1f', chargeFx: 'fire_charge_01', projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_02', slashFx: 'fire_slash_01', sfxCast: 'katon_big', sfxImpact: 'fire_hit' },
  5: { kind: 'water', colors: ['#0ea5e9', '#38bdf8', '#bae6fd'], glow: '#0284c7', chargeFx: 'water_aura_01', impactFx: 'water_impact_01', sfxCast: 'suiton', sfxImpact: 'water_hit' },
  10: { kind: 'wind', colors: ['#34d399', '#a7f3d0', '#ffffff'], glow: '#10b981', chargeFx: 'wind_charge_01', projectileFx: 'wind_vortex_01', impactFx: 'wind_impact_01', sfxCast: 'futon', sfxImpact: 'slash_hit' },
  28: { kind: 'lightning', colors: ['#fde047', '#38bdf8', '#ffffff'], glow: '#38bdf8', chargeFx: 'thunder_charge_01', impactFx: 'thunder_strike_01', slashFx: 'thunder_slash_01', sfxCast: 'chidori', sfxImpact: 'lightning_hit' },
  7: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: null, sfxCast: 'kuchiyose' },
  24: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'water_aura_01', sfxCast: 'suiton' },
  26: { specialCast: { type: 'smoke_poof' }, chargeFx: 'wind_aura_01', sfxCast: 'smoke_poof' },
  32: { specialCast: { type: 'seal_gate', variant: 'torii' }, shieldFx: 'rock_shield_01', sfxCast: 'earth_rumble' },
  77: { specialCast: { type: 'sakura_petals' }, chargeFx: 'light_aura_01', sfxCast: 'heal' },
  84: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'dark_charge_01', impactFx: 'dark_impact_01', sfxCast: 'edo_tensei' },
  96: { chargeFx: 'rock_charge_01', impactFx: 'rock_column_01', slashFx: 'rock_slash_01', sfxCast: 'earth_rumble', sfxImpact: 'heavy_hit' },
  104: { specialCast: { type: 'smoke_poof', variant: 'kawarimi' }, chargeFx: null, sfxCast: 'smoke_poof' },
  133: { specialCast: { type: 'seal_gate', variant: 'chains' }, chargeFx: 'dark_aura_01', sfxCast: 'shadow' },

  // Ninja tools (nhẫn cụ)
  2: { specialCast: { type: 'ninja_weapons', variant: 'kunai' }, sfxCast: 'kunai', sfxImpact: 'metal_hit' },
  3: { specialCast: { type: 'ninja_weapons', variant: 'shuriken' }, sfxCast: 'kunai', sfxImpact: 'metal_hit' },
  75: { specialCast: { type: 'ninja_weapons', variant: 'kunai' }, slashFx: 'wind_slash_01', sfxCast: 'blade_slash', sfxImpact: 'slash_hit' },
  76: { specialCast: { type: 'ninja_weapons', variant: 'fuma' }, impactFx: 'wind_impact_01', sfxCast: 'futon', sfxImpact: 'slash_hit' },
  101: { specialCast: { type: 'paper_storm', variant: 'bomb' }, impactFx: 'fire_impact_01', sfxCast: 'paper', sfxImpact: 'bomb_explode' },
  102: { specialCast: { type: 'ninja_weapons', variant: 'senbon' }, impactFx: 'poison_impact_01', sfxCast: 'kunai', sfxImpact: 'poison_hit' },
  105: { specialCast: { type: 'smoke_poof' }, chargeFx: null, sfxCast: 'smoke_poof' },
  118: { chargeFx: 'fire_charge_01', impactFx: 'fire_impact_02', impactFx2: 'wind_vortex_02', beam: true, sfxCast: 'katon_big', sfxImpact: 'bomb_explode' },
  119: { specialCast: { type: 'seal_gate', variant: 'chains' }, chargeFx: 'light_aura_01', sfxCast: 'seal' },

  // Hyuga
  6: { specialCast: { type: 'byakugan_bagua' }, specialImpact: null, chargeFx: 'light_aura_01', sfxCast: 'byakugan' },
  34: { specialCast: { type: 'byakugan_bagua' }, shieldFx: 'wind_vortex_01', sfxCast: 'rasengan' },

  // Deidara bombs
  100: { specialCast: { type: 'meteor_gravity' }, impactFx: 'fire_impact_02', impactFx2: 'light_column_01', beam: true, sfxCast: 'c0_nuke', sfxImpact: 'bomb_explode' },
  136: { specialCast: { type: 'meteor_gravity' }, impactFx: 'fire_impact_02', impactFx2: 'light_column_01', beam: true, sfxCast: 'c0_nuke', sfxImpact: 'c0_nuke' },

  // Seals (phong ấn)
  29: { specialCast: { type: 'seal_gate', variant: 'chains' }, specialImpact: { type: 'seal_gate', variant: 'chains' }, impactFx: 'dark_impact_01', impactFx2: 'light_column_01', sfxCast: 'seal', sfxImpact: 'seal_hit' },
  30: { specialImpact: { type: 'seal_gate', variant: 'torii' }, impactFx: 'rock_column_01', sfxCast: 'seal', sfxImpact: 'heavy_hit' },
  31: { specialCast: { type: 'sand_wave' }, specialImpact: { type: 'seal_gate', variant: 'chains' }, impactFx: 'rock_column_01', sfxCast: 'sand', sfxImpact: 'seal_hit' },

  // Rinnegan Six Paths
  52: { specialCast: { type: 'rinnegan_ripple', variant: 'push' }, impactFx: 'wind_vortex_02', impactFx2: 'rock_impact_01', beam: true, sfxCast: 'gravity_push', sfxImpact: 'heavy_hit' },
  53: { specialCast: { type: 'rinnegan_ripple', variant: 'pull' }, impactFx: 'dark_impact_01', instantImpact: true, sfxCast: 'rinnegan', sfxImpact: 'gravity_hit' },
  54: { chargeFx: 'fire_charge_01', projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_01', sfxCast: 'puppet', sfxImpact: 'bomb_explode' },
  55: { slashFx: 'dark_slash_01', impactFx: 'rock_slash_01', sfxCast: 'puppet', sfxImpact: 'metal_hit' },
  56: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'dark_aura_01', sfxCast: 'kuchiyose' },
  60: { specialImpact: { type: 'meteor_gravity' }, impactFx: 'rock_column_01', impactFx2: 'dark_impact_01', sfxCast: 'meteor', sfxImpact: 'c0_nuke' },
  61: { specialImpact: { type: 'meteor_gravity' }, impactFx: 'fire_impact_02', impactFx2: 'rock_column_01', beam: true, sfxCast: 'meteor', sfxImpact: 'c0_nuke' },
  62: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, impactFx: 'dark_impact_01', impactFx2: 'light_column_01', beam: true, sfxCast: 'kyubi_roar', sfxImpact: 'gravity_hit' },

  // Eight Gates & Taijutsu
  64: { specialCast: { type: 'eight_gates', variant: 'shimon' }, chargeFx: 'fire_aura_01', sfxCast: 'eight_gates' },
  72: { specialCast: { type: 'eight_gates', variant: 'kaimon' }, chargeFx: 'wind_aura_01', shieldFx: 'wind_aura_01', sfxCast: 'eight_gates' },
  73: { specialCast: { type: 'eight_gates', variant: 'kaimon' }, impactFx: 'wind_vortex_02', impactFx2: 'rock_impact_01', sfxCast: 'eight_gates', sfxImpact: 'heavy_hit' },
  74: { specialCast: { type: 'eight_gates', variant: 'shimon' }, projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_02', beam: true, sfxCast: 'eight_gates', sfxImpact: 'fire_hit' },

  // Sakura / Tsunade
  80: { specialCast: null, impactFx: 'rock_impact_01', slashFx: 'rock_slash_01', sfxCast: 'taijutsu', sfxImpact: 'heavy_hit' },
  82: { specialCast: { type: 'sakura_petals' }, impactFx: 'rock_column_01', impactFx2: 'rock_impact_01', sfxCast: 'sakura_punch', sfxImpact: 'heavy_hit' },
  81: { specialCast: { type: 'sakura_petals' }, chargeFx: 'light_column_01', sfxCast: 'heal' },
  83: { specialCast: { type: 'sakura_petals' }, chargeFx: 'light_column_01', shieldFx: 'light_shield_01', sfxCast: 'heal' },

  // Copy Ninja (Kakashi)
  89: { chargeFx: 'rock_charge_01', shieldFx: 'rock_shield_01', sfxCast: 'earth_rumble' },
  90: { chargeFx: 'thunder_charge_01', impactFx: 'thunder_strike_02', slashFx: 'thunder_slash_01', sfxCast: 'raikiri', sfxImpact: 'lightning_hit' },
  98: { chargeFx: 'thunder_charge_01', impactFx: 'thunder_strike_02', sfxCast: 'chidori', sfxImpact: 'lightning_hit' },

  // Konan Paper Angel
  91: { specialCast: { type: 'paper_storm', variant: 'bomb' }, impactFx: 'fire_impact_02', impactFx2: 'fire_impact_01', beam: true, sfxCast: 'paper', sfxImpact: 'c0_nuke' },

  // Mokuton
  97: { specialCast: { type: 'wood_roots' }, specialImpact: { type: 'wood_roots' }, impactFx: 'rock_column_01', impactFx2: 'wind_impact_01', beam: true, sfxCast: 'wood', sfxImpact: 'earth_hit' },
  107: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: null, sfxCast: 'wood' },
  108: { specialCast: { type: 'wood_roots' }, chargeFx: 'light_aura_01', sfxCast: 'heal' },

  // Toad Sage (bộ cóc)
  114: { chargeFx: 'light_column_01', shieldFx: 'light_aura_01', sfxCast: 'byakugan' },
  121: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: null, sfxCast: 'kuchiyose' },
  122: { chargeFx: 'fire_charge_01', projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_02', impactFx2: 'wind_vortex_01', sfxCast: 'katon_big', sfxImpact: 'fire_hit' },

  // Bugs
  123: { specialCast: { type: 'bug_swarm', variant: 'toxic' }, impactFx: 'poison_impact_01', sfxCast: 'bugs', sfxImpact: 'poison_hit' },
  127: { specialCast: { type: 'bug_swarm', variant: 'toxic' }, impactFx: 'poison_impact_01', impactFx2: 'fire_impact_02', beam: true, sfxCast: 'bugs', sfxImpact: 'bomb_explode' },

  // Wind & Fan
  131: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'wind_vortex_01', sfxCast: 'kuchiyose' },
  132: { chargeFx: 'wind_vortex_02', shieldFx: 'wind_aura_01', sfxCast: 'futon' },

  // Genjutsu flute
  44: { specialCast: null, chargeFx: 'dark_aura_01', impactFx: 'dark_impact_01', sfxCast: 'genjutsu', sfxImpact: 'genjutsu' },

  // === 61 NEW CANON EXPANSION CARDS (139..199) ===
  // Bộ Rắn
  141: { slashFx: 'wind_slash_01', impactFx: 'dark_slash_01', sfxCast: 'blade_slash', sfxImpact: 'metal_hit' },
  142: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'poison_aura_01', sfxCast: 'kuchiyose' },
  143: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'poison_aura_01', shieldFx: 'dark_shield_01', sfxCast: 'kyubi_roar' },

  // Cửu Vĩ
  144: { specialCast: null, chargeFx: 'fire_aura_01', shieldFx: 'fire_shield_01', sfxCast: 'katon' },
  145: { specialCast: null, slashFx: 'fire_slash_01', impactFx: 'fire_impact_01', sfxCast: 'katon', sfxImpact: 'slash_hit' },
  146: { specialCast: { type: 'meteor_gravity', variant: 'kyubi' }, chargeFx: 'light_column_01', shieldFx: 'fire_aura_01', sfxCast: 'kyubi_roar' },
  147: { chargeFx: 'dark_charge_01', projectileFx: 'dark_projectile_01', impactFx: 'fire_impact_02', impactFx2: 'dark_impact_01', beam: true, sfxCast: 'kyubi_roar', sfxImpact: 'c0_nuke' },
  148: { chargeFx: 'dark_charge_01', projectileFx: 'dark_projectile_01', impactFx: 'fire_impact_02', sfxCast: 'kyubi_roar', sfxImpact: 'bomb_explode' },

  // Tia Chớp Vàng
  150: { specialCast: { type: 'hiraishin_flash' }, shieldFx: 'light_shield_01', sfxCast: 'teleport' },
  151: { specialCast: { type: 'hiraishin_flash' }, impactFx: 'thunder_strike_02', impactFx2: 'wind_vortex_01', sfxCast: 'hiraishin', sfxImpact: 'rasengan_hit' },

  // Ảo Thuật & Khiển Bóng & Ninja Sao Chép
  154: { specialCast: null, chargeFx: 'light_aura_01', impactFx: 'dark_aura_01', instantImpact: true, sfxCast: 'genjutsu', sfxImpact: 'genjutsu' },
  155: { specialCast: null, chargeFx: 'dark_charge_01', impactFx: 'dark_impact_01', instantImpact: true, sfxCast: 'genjutsu', sfxImpact: 'dark_hit' },
  158: { chargeFx: 'rock_charge_01', impactFx: 'rock_column_01', sfxCast: 'earth_rumble', sfxImpact: 'earth_hit' },
  159: { chargeFx: 'thunder_charge_01', impactFx: 'thunder_strike_02', slashFx: 'thunder_slash_01', beam: true, sfxCast: 'raikiri', sfxImpact: 'lightning_hit' },

  // Mộc Độn & Bộ Cóc
  160: { specialCast: { type: 'wood_roots' }, impactFx: 'rock_column_01', sfxCast: 'wood', sfxImpact: 'earth_hit' },
  161: { specialCast: { type: 'wood_roots' }, specialImpact: { type: 'meteor_gravity' }, impactFx: 'rock_column_01', impactFx2: 'light_column_01', beam: true, sfxCast: 'earth_rumble', sfxImpact: 'c0_nuke' },
  162: { chargeFx: 'rock_charge_01', shieldFx: 'rock_shield_01', sfxCast: 'earth_rumble' },
  163: { chargeFx: 'dark_aura_01', impactFx: 'dark_impact_01', instantImpact: true, sfxCast: 'genjutsu', sfxImpact: 'genjutsu' },

  // Uchiha Signatures
  164: { specialCast: null, chargeFx: 'fire_charge_01', projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_02', impactFx2: 'fire_impact_01', beam: true, sfxCast: 'katon_big', sfxImpact: 'bomb_explode' },
  165: {
    kind: 'lightning',
    colors: ['#38bdf8', '#fde047', '#ffffff'],
    glow: '#38bdf8',
    specialCast: null,
    chargeFx: 'thunder_charge_01',
    impactFx: 'thunder_strike_02',
    impactFx2: 'thunder_impact_01',
    instantImpact: true,
    beam: true,
    sfxCast: 'raikiri',
    sfxImpact: 'c0_nuke',
  },
  166: { specialCast: null, projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_01', sfxCast: 'katon', sfxImpact: 'fire_hit' },

  // Thường (Rasenshuriken, Suiryūdan, Chōjū Giga, Gatsūga, Chō Baika, Shintenshin)
  167: {
    kind: 'rasengan',
    colors: ['#34d399', '#e0f2fe', '#38bdf8'],
    glow: '#38bdf8',
    chargeFx: 'wind_charge_01',
    projectileFx: 'wind_vortex_02',
    impactFx: 'wind_vortex_02',
    impactFx2: 'light_column_01',
    beam: true,
    sfxCast: 'rasengan_big',
    sfxImpact: 'c0_nuke',
  },
  168: {
    kind: 'water',
    colors: ['#0ea5e9', '#38bdf8', '#bae6fd'],
    glow: '#0284c7',
    chargeFx: 'water_aura_01',
    impactFx: 'water_column_01',
    impactFx2: 'water_impact_01',
    sfxCast: 'suiton',
    sfxImpact: 'water_hit',
  },
  169: { specialCast: { type: 'paper_storm', variant: 'paper' }, chargeFx: 'dark_aura_01', sfxCast: 'paper' },
  170: {
    kind: 'wind',
    colors: ['#34d399', '#f8fafc', '#10b981'],
    glow: '#10b981',
    chargeFx: 'wind_charge_01',
    impactFx: 'wind_vortex_01',
    slashFx: 'wind_slash_01',
    sfxCast: 'futon',
    sfxImpact: 'slash_hit',
  },
  171: { chargeFx: 'rock_charge_01', shieldFx: 'rock_shield_01', sfxCast: 'earth_rumble' },
  172: {
    kind: 'genjutsu',
    colors: ['#c084fc', '#f472b6', '#ffffff'],
    glow: '#a855f7',
    chargeFx: 'light_aura_01',
    impactFx: 'dark_aura_01',
    instantImpact: true,
    sfxCast: 'genjutsu',
    sfxImpact: 'genjutsu',
  },

  // Thể Thuật (Hirudora, Yagai)
  173: { specialCast: { type: 'eight_gates', variant: 'kaimon' }, chargeFx: 'wind_charge_01', impactFx: 'wind_vortex_02', impactFx2: 'light_column_01', beam: true, sfxCast: 'eight_gates', sfxImpact: 'bomb_explode' },
  174: { specialCast: { type: 'eight_gates', variant: 'shimon' }, chargeFx: 'fire_aura_01', impactFx: 'fire_impact_02', impactFx2: 'dark_impact_01', beam: true, sfxCast: 'eight_gates', sfxImpact: 'c0_nuke' },

  // Lôi Vân
  175: { colors: ['#1e1b4b', '#a855f7', '#38bdf8'], glow: '#7c3aed', chargeFx: 'dark_charge_01', impactFx: 'thunder_strike_01', impactFx2: 'dark_impact_01', sfxCast: 'chidori', sfxImpact: 'lightning_hit' },
  178: { chargeFx: 'thunder_charge_01', impactFx: 'thunder_strike_02', slashFx: 'thunder_slash_01', beam: true, sfxCast: 'raikiri', sfxImpact: 'lightning_hit' },
  179: { kind: 'wind', colors: ['#a855f7', '#f59e0b', '#e2e8f0'], glow: '#d97706', chargeFx: 'wind_charge_01', impactFx: 'wind_vortex_02', impactFx2: 'rock_column_01', beam: true, sfxCast: 'kyubi_roar', sfxImpact: 'bomb_explode' },

  // Thất Kiếm
  180: { specialCast: { type: 'smoke_poof' }, chargeFx: 'water_aura_01', sfxCast: 'smoke_poof' },
  182: { colors: ['#fde047', '#38bdf8', '#ffffff'], glow: '#38bdf8', slashFx: 'thunder_slash_01', impactFx: 'thunder_impact_01', sfxCast: 'chidori', sfxImpact: 'lightning_hit' },
  183: { chargeFx: 'light_aura_01', slashFx: 'light_slash_01', impactFx: 'light_impact_01', sfxCast: 'blade_slash', sfxImpact: 'slash_hit' },
  184: { chargeFx: 'water_aura_01', shieldFx: 'water_shield_01', sfxCast: 'suiton' },

  // Thi Cốt Mạch
  189: { chargeFx: 'rock_charge_01', impactFx: 'rock_column_01', impactFx2: 'rock_slash_01', beam: true, sfxCast: 'earth_rumble', sfxImpact: 'heavy_hit' },

  // Huyết Tế
  192: { specialCast: { type: 'puppet_threads' }, chargeFx: 'dark_aura_01', sfxCast: 'shadow' },
  193: { kind: 'fire', colors: ['#ef4444', '#f97316', '#fde047'], glow: '#dc2626', chargeFx: 'fire_charge_01', projectileFx: 'fire_projectile_01', impactFx: 'fire_impact_02', sfxCast: 'katon_big', sfxImpact: 'fire_hit' },
  194: { specialCast: { type: 'seal_gate', variant: 'chains' }, chargeFx: 'dark_charge_01', impactFx: 'dark_impact_01', impactFx2: 'fire_impact_01', instantImpact: true, sfxCast: 'seal', sfxImpact: 'dark_hit' },

  // Trần Thổ
  197: { specialCast: { type: 'smoke_poof', variant: 'kuchiyose' }, chargeFx: 'rock_charge_01', shieldFx: 'rock_shield_01', sfxCast: 'earth_rumble' },
  199: {
    kind: 'light',
    colors: ['#ffffff', '#e0f2fe', '#38bdf8'],
    glow: '#e0f2fe',
    chargeFx: 'light_aura_01',
    impactFx: 'light_column_01',
    impactFx2: 'light_impact_01',
    beam: true,
    sfxCast: 'srank',
    sfxImpact: 'c0_nuke',
  },
};

export function getCardFxProfile(cardOrCast) {
  if (!cardOrCast) {
    return { ...CLAN_PROFILES.thường, isS: false };
  }
  const clanKey = (cardOrCast.s || 'thường').toLowerCase();
  const base = CLAN_PROFILES[clanKey] || CLAN_PROFILES.thường;
  const ov = cardOrCast.id != null ? CARD_OVERRIDES[cardOrCast.id] : null;
  const merged = ov ? { ...base, ...ov } : { ...base };

  const isS = cardOrCast.r === 'S';
  merged.isS = isS;
  if (merged.beam == null) {
    merged.beam = isS && cardOrCast.t === 'a' && !merged.instantImpact;
  }
  if (!merged.sfxCast) merged.sfxCast = isS ? 'srank' : 'hand_seal';
  if (!merged.sfxImpact) merged.sfxImpact = 'hit_deep';
  return merged;
}
