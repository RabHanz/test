import { SceneConfig, SkyPeckerTypeConfig, Achievements, PowerUpType, EnemyVisualType, DebuffType, Enemy, GroundDetailConfig, SkyPeckerTrailEffect, LeaderboardEntry } from './types';
import { hexToRgb, generateSilhouettePoints } from './utils';

export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 700;
export const GROUND_HEIGHT = 60;

export const INITIAL_BIRD_R = 25;
export const INITIAL_BIRD_G = 0.35; // Increased from 0.28 for faster gameplay
export const INITIAL_BIRD_FLAP_FORCE = -7.5; // Increased from -6.8 for more responsiveness

export const PIPE_WIDTH = 80;
export const SCENE_TRANSITION_DURATION = 60;
export const SCENE_INTERVAL = 720;

export const CAR_COLORS = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#DDA0DD', '#778899', '#8A2BE2', '#A52A2A']; 
export const MAX_GROUND_CARS = 5;
export const CAR_MIN_WIDTH = 50;
export const CAR_MAX_WIDTH = 80;
export const CAR_MIN_HEIGHT = 25;
export const CAR_MAX_HEIGHT = 35;
export const CAR_MIN_SPEED_FACTOR = 0.5; 
export const CAR_MAX_SPEED_FACTOR = 0.8;
export const STATIC_GROUND_FEATURE_SPREAD = CANVAS_WIDTH * 1.5;

export const INITIAL_DEBUFF_STATE: null = null;

// Enhanced game speed progression
export const BASE_GAME_SPEED = 2.5; // Increased from 2.0
export const MAX_GAME_SPEED = 4.5; // Maximum speed cap
export const SPEED_INCREASE_INTERVAL = 300; // Frames between speed increases
export const SPEED_INCREASE_AMOUNT = 0.15; // Speed increase per interval

export const POWERUP_OPTIONS: PowerUpType[] = ['shield', 'slow', 'shrink', 'magnet', 'speed'];

export const STARTING_POWERUP_OPTIONS: Array<{ name: string, value: PowerUpType | null }> = [
  { name: 'None', value: null },
  { name: 'Shield', value: 'shield' },
  { name: 'Slow Motion', value: 'slow' },
];

// Enhanced enemy types with intelligent behaviors
export interface EnemyTypeConfig {
  visualType: EnemyVisualType;
  size: number;
  debuffType: DebuffType;
  spawnDifficultyThreshold: number;
  baseSpeedMultiplier?: number;
  color?: string;
  strokeColor?: string;
  aiPattern?: 'static' | 'tracking' | 'ambush' | 'swarm';
  aggressionLevel?: number; // 1-5 scale
  spawnWeight?: number; // Probability weight for spawning
}

export const ENHANCED_ENEMY_TYPES: EnemyTypeConfig[] = [
  // Tier 1: Basic enemies
  { 
    visualType: 'SPIKEBALL', 
    size: 15, 
    debuffType: 'SCREEN_LURCH', 
    spawnDifficultyThreshold: 0.5, 
    baseSpeedMultiplier: 1.0,
    aiPattern: 'static',
    aggressionLevel: 1,
    spawnWeight: 30
  },
  { 
    visualType: 'GHOST', 
    size: 18, 
    debuffType: 'HEAVY_WINGS', 
    spawnDifficultyThreshold: 1.5, 
    baseSpeedMultiplier: 0.7,
    aiPattern: 'tracking',
    aggressionLevel: 2,
    spawnWeight: 25
  },
  
  // Tier 2: Intermediate enemies
  { 
    visualType: 'SPRITE', 
    size: 10, 
    debuffType: 'FLAP_FATIGUE', 
    spawnDifficultyThreshold: 3.0, 
    baseSpeedMultiplier: 1.2, 
    color: '#FF4500', 
    strokeColor: '#FF0000',
    aiPattern: 'ambush',
    aggressionLevel: 3,
    spawnWeight: 20
  },
  { 
    visualType: 'VORTEX', 
    size: 22, 
    debuffType: 'VISION_BLUR', 
    spawnDifficultyThreshold: 4.0, 
    baseSpeedMultiplier: 0.8,
    color: '#8A2BE2',
    strokeColor: '#4B0082',
    aiPattern: 'static',
    aggressionLevel: 3,
    spawnWeight: 15
  },
  
  // Tier 3: Advanced enemies
  { 
    visualType: 'PHANTOM', 
    size: 20, 
    debuffType: 'CONTROLS_INVERT', 
    spawnDifficultyThreshold: 5.5, 
    baseSpeedMultiplier: 1.1,
    color: 'rgba(100,100,150,0.6)',
    strokeColor: '#6A5ACD',
    aiPattern: 'tracking',
    aggressionLevel: 4,
    spawnWeight: 10
  },
  { 
    visualType: 'HUNTER', 
    size: 16, 
    debuffType: 'SPEED_LOCK', 
    spawnDifficultyThreshold: 6.0, 
    baseSpeedMultiplier: 1.4,
    color: '#DC143C',
    strokeColor: '#8B0000',
    aiPattern: 'tracking',
    aggressionLevel: 4,
    spawnWeight: 8
  },
  
  // Tier 4: Elite enemies
  { 
    visualType: 'NEMESIS', 
    size: 25, 
    debuffType: 'GRAVITY_CHAOS', 
    spawnDifficultyThreshold: 8.0, 
    baseSpeedMultiplier: 0.9,
    color: '#800080',
    strokeColor: '#4B0082',
    aiPattern: 'swarm',
    aggressionLevel: 5,
    spawnWeight: 5
  },
  { 
    visualType: 'VOID', 
    size: 30, 
    debuffType: 'POWER_DRAIN', 
    spawnDifficultyThreshold: 10.0, 
    baseSpeedMultiplier: 0.6,
    color: '#000000',
    strokeColor: '#1C1C1C',
    aiPattern: 'ambush',
    aggressionLevel: 5,
    spawnWeight: 2
  }
];

// Enhanced debuff system with more variety and strategic depth
export const ENHANCED_DEBUFF_CONFIG: Record<DebuffType, { 
  duration: number; 
  magnitude: number; 
  stackable?: boolean;
  visualEffect?: string;
  description: string;
}> = {
  HEAVY_WINGS: { 
    duration: 180, 
    magnitude: 1.6, 
    visualEffect: 'weight_particles',
    description: 'Increased gravity makes falling faster'
  },
  FLAP_FATIGUE: { 
    duration: 150, 
    magnitude: 0.4, 
    visualEffect: 'exhaustion_aura',
    description: 'Reduced flap power and responsiveness'
  },
  SCREEN_LURCH: { 
    duration: 30, 
    magnitude: 15, 
    visualEffect: 'screen_shake',
    description: 'Brief disorienting screen shake'
  },
  VISION_BLUR: { 
    duration: 120, 
    magnitude: 0.7, 
    visualEffect: 'blur_overlay',
    description: 'Reduced visual clarity and focus'
  },
  CONTROLS_INVERT: { 
    duration: 100, 
    magnitude: 1.0, 
    visualEffect: 'invert_indicator',
    description: 'Flap controls work in reverse'
  },
  SPEED_LOCK: { 
    duration: 90, 
    magnitude: 0.3, 
    visualEffect: 'slowmo_trail',
    description: 'Movement speed dramatically reduced'
  },
  GRAVITY_CHAOS: { 
    duration: 80, 
    magnitude: 2.0, 
    visualEffect: 'gravity_distortion',
    description: 'Unpredictable gravity fluctuations'
  },
  POWER_DRAIN: { 
    duration: 200, 
    magnitude: 0.5, 
    stackable: true,
    visualEffect: 'drain_spiral',
    description: 'Power gauge fills 50% slower'
  }
};

// Enhanced SkyPecker types with proper bird characteristics
export const ENHANCED_SKYPECKER_TYPES: SkyPeckerTypeConfig[] = [
  {
    name: 'Robin Classic',
    color: '#CD853F',
    stroke: '#A0522D',
    size: 1,
    speed: 1,
    description: 'The friendly neighborhood robin. Balanced stats perfect for beginners.',
    flapForceMultiplier: 1,
    gravityMultiplier: 1,
    powerGaugeMultiplier: 1,
    birdType: 'robin',
    unlockCondition: 'default'
  },
  {
    name: 'Swift Sparrow',
    color: '#8B4513',
    stroke: '#654321',
    size: 0.8,
    speed: 1.3,
    description: 'Small and agile! 30% faster movement with enhanced flap response.',
    flapForceMultiplier: 1.2,
    gravityMultiplier: 0.9,
    powerGaugeMultiplier: 1.3,
    birdType: 'sparrow',
    unlockCondition: 'score_25'
  },
  {
    name: 'Eagle Guardian',
    color: '#8B4513',
    stroke: '#5D2F0F',
    size: 1.4,
    speed: 0.8,
    description: 'Majestic and resilient. Ignores first debuff and has enhanced shield duration.',
    flapForceMultiplier: 0.9,
    gravityMultiplier: 0.85,
    canNegateDebuffOnce: true,
    shieldDurationMultiplier: 1.5,
    birdType: 'eagle',
    unlockCondition: 'score_50'
  },
  {
    name: 'Mystic Owl',
    color: '#8A2BE2',
    stroke: '#4B0082',
    size: 1.1,
    speed: 1.0,
    description: 'Wise and ethereal. 20% chance to phase through pipes with mystical powers.',
    flapForceMultiplier: 1.0,
    gravityMultiplier: 1.0,
    pipePhaseChance: 0.2,
    specialAbilityCooldown: 240,
    powerGaugeMultiplier: 1.1,
    birdType: 'owl',
    unlockCondition: 'premium_iap'
  },
  {
    name: 'Phoenix Rising',
    color: '#FF4500',
    stroke: '#DC143C',
    size: 1.2,
    speed: 1.15,
    description: 'Legendary fire bird. Revives once per game with blazing trail effects.',
    flapForceMultiplier: 1.15,
    gravityMultiplier: 1.05,
    reviveOnce: true,
    powerGaugeMultiplier: 1.2,
    trailEffectMultiplier: 1.5,
    birdType: 'phoenix',
    unlockCondition: 'premium_iap'
  },
  {
    name: 'Ice Falcon',
    color: '#87CEEB',
    stroke: '#4682B4',
    size: 0.9,
    speed: 1.4,
    description: 'Arctic hunter with freeze abilities. Slows down enemies on contact.',
    flapForceMultiplier: 1.1,
    gravityMultiplier: 0.95,
    freezeEnemiesOnHit: true,
    powerGaugeMultiplier: 1.15,
    birdType: 'falcon',
    unlockCondition: 'premium_iap'
  }
];

export const SHOP_PRICING = {
  REMOVE_ADS: 2.99,
  PREMIUM_BIRD_BUNDLE: 1.99,
  COSMETIC_PACK: 0.99,
  DAILY_CHALLENGE_PASS: 0.99,
  COIN_PACKS: {
    SMALL: { coins: 500, price: 0.99 },
    MEDIUM: { coins: 1200, price: 1.99 },
    LARGE: { coins: 2500, price: 3.99 }
  }
};

// Enhanced trail effects with more visual variety
export const ENHANCED_TRAIL_EFFECTS: SkyPeckerTrailEffect[] = [
  {
    id: 'default_classic',
    name: 'Classic Trail',
    description: 'Simple following particles',
    cost: 0,
    rarity: 'common',
    previewColor: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
    particleConfig: {
      type: 'basic_following',
      color: 'bird_primary',
      emitRate: 0.3,
      particleLife: 20,
      baseParticleSize: 0.4
    }
  },
  {
    id: 'sparkle_magic',
    name: 'Sparkle Magic',
    description: 'Magical sparkling trail',
    cost: 150,
    rarity: 'rare',
    previewColor: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    particleConfig: {
      type: 'sparkle',
      color: '#FFD700',
      emitRate: 0.5,
      particleLife: 30,
      baseParticleSize: 0.3,
      velocitySpread: 2.0
    }
  },
  {
    id: 'bubble_stream',
    name: 'Bubble Stream',
    description: 'Floating bubble trail',
    cost: 200,
    rarity: 'rare',
    previewColor: 'linear-gradient(135deg, #60A5FA, #DBEAFE)',
    particleConfig: {
      type: 'bubble',
      color: '#87CEEB',
      emitRate: 0.4,
      particleLife: 40,
      baseParticleSize: 0.5,
      bubbleRiseSpeed: -0.2
    }
  },
  {
    id: 'fire_blaze',
    name: 'Fire Blaze',
    description: 'Blazing fire trail',
    cost: 300,
    rarity: 'epic',
    previewColor: 'linear-gradient(135deg, #F97316, #DC2626)',
    particleConfig: {
      type: 'fire',
      color: '#FF4500',
      emitRate: 0.6,
      particleLife: 25,
      baseParticleSize: 0.4,
      adaptToSpeed: true
    }
  },
  {
    id: 'ice_crystal',
    name: 'Ice Crystal',
    description: 'Crystalline ice trail',
    cost: 350,
    rarity: 'epic',
    previewColor: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    particleConfig: {
      type: 'crystal',
      color: '#00FFFF',
      emitRate: 0.4,
      particleLife: 35,
      baseParticleSize: 0.3
    }
  },
  {
    id: 'rainbow_burst',
    name: 'Rainbow Burst',
    description: 'Colorful rainbow trail',
    cost: 500,
    rarity: 'legendary',
    previewColor: 'linear-gradient(135deg, #EC4899, #8B5CF6, #06B6D4, #10B981)',
    particleConfig: {
      type: 'rainbow',
      color: 'rainbow_cycle',
      emitRate: 0.7,
      particleLife: 30,
      baseParticleSize: 0.5,
      velocitySpread: 3.0,
      adaptToSpeed: true
    }
  }
];

// Revenue optimization constants
export const MONETIZATION_CONFIG = {
  AD_FREQUENCY: {
    INTERSTITIAL_DEATH_COUNT: 3, // Show interstitial every 3 deaths
    BANNER_ROTATION_SECONDS: 30,
    REWARDED_COOLDOWN_SECONDS: 45
  },
  IAP_TRIGGERS: {
    REMOVE_ADS_PROMPT_DEATHS: 10,
    COSMETIC_UPSELL_SCORE: 25,
    PREMIUM_BIRD_UNLOCK_SCORE: 50
  },
  RETENTION_BOOSTS: {
    DAILY_LOGIN_COINS: 50,
    COMEBACK_BONUS_HOURS: 24,
    STREAK_MULTIPLIER_MAX: 3
  }
};

export const INITIAL_ACHIEVEMENTS: Achievements = {
  firstFlight: {name: 'First Flight', desc: 'Score your first point', unlocked: false},
  survivor: {name: 'Survivor', desc: 'Score 25 points', unlocked: false},
  centurion: {name: 'Centurion', desc: 'Score 100 points', unlocked: false},
  coinCollector: {name: 'Coin Collector', desc: 'Collect 100 coins total', unlocked: false, progress: 0, target: 100},
  powerMaster: {name: 'Power Master', desc: 'Use 25 powerups', unlocked: false, progress: 0, target: 25},
  weatherWizard: {name: 'Weather Wizard', desc: 'Play in 5 different weather types', unlocked: false, progress: 0, target: 5},
  comboKing: {name: 'Combo King', desc: 'Get a 15x combo', unlocked: false},
  perfectionist: {name: 'Perfectionist', desc: 'Score 50 points without taking damage', unlocked: false},
  debuffSurvivor: {name: 'Debuff Survivor', desc: 'Survive 10 different debuff types', unlocked: false, progress: 0, target: 8},
  enemyHunter: {name: 'Enemy Hunter', desc: 'Defeat 100 enemies', unlocked: false, progress: 0, target: 100},
  zenMaster: {name: 'Zen Master', desc: 'Score 75 points in Zen Mode', unlocked: false},
  socialButterfly: {name: 'Social Butterfly', desc: 'Share your score 5 times', unlocked: false, progress: 0, target: 5},
  birdCollector: {name: 'Bird Collector', desc: 'Unlock all bird types', unlocked: false, progress: 0, target: ENHANCED_SKYPECKER_TYPES.length}
};

export const GAME_STORAGE_KEY = 'skyPeckerGameProgress_v8_enhanced';
export const DEBUG_KEYS_INFO = "SHIFT+G: God Mode • T: Powerup • C: +Coins • S: +Score • D: +Difficulty • E: Spawn Enemy";

// Enhanced particle effects for better visual feedback
export const ENHANCED_PARTICLE_COLORS = {
  coin: '#FFD700',
  shieldHit: '#00FFFF',
  godModeHit: '#FFD700',
  debuffGhost: '#ADD8E6',
  debuffSprite: '#FFA07A',
  debuffVortex: '#8A2BE2',
  debuffPhantom: '#6A5ACD',
  debuffHunter: '#DC143C',
  debuffNemesis: '#800080',
  debuffVoid: '#1C1C1C',
  revive: '#FFBF00',
  debuffNegated: '#90EE90',
  milestone: '#AF7AC5',
  powerupPickup: '#32CD32',
  comboMultiplier: '#FF69B4',
  perfectRun: '#00FF7F',
  clear: ['#FFFFFF'],
  rain: ['#87CEEB', '#B0E0E6', '#ADD8E6'],
  snow: ['#FFFFFF', '#F0F8FF', '#E6E6FA'],
  storm: ['#696969', '#778899', '#2F4F4F'],
  sandstorm: ['#F4A460', '#D2691E', '#CD853F'],
  ash: ['#696969', '#A9A9A9', '#2F2F2F'],
  aurora: ['#00FF7F', '#7FFFD4', '#40E0D0', '#FF69B4'],
  neon: ['#FF1493', '#00FFFF', '#FFFF00', '#FF4500']
};

// UI/UX Constants for enhanced experience
export const UI_CONFIG = {
  COLORS: {
    PRIMARY: '#6366F1', // Indigo
    SECONDARY: '#8B5CF6', // Purple
    SUCCESS: '#10B981', // Emerald
    WARNING: '#F59E0B', // Amber
    DANGER: '#EF4444', // Red
    BACKGROUND: 'rgba(15, 23, 42, 0.95)', // Slate-900 with transparency
    CARD: 'rgba(30, 41, 59, 0.9)', // Slate-800 with transparency
    TEXT_PRIMARY: '#F1F5F9', // Slate-100
    TEXT_SECONDARY: '#CBD5E1', // Slate-300
    ACCENT: '#14B8A6' // Teal
  },
  ANIMATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024
  }
};

export const DAILY_REWARD_COINS = 75; // Increased from 50
export const DAILY_CHALLENGE_SCORE_TARGETS = [15, 30, 50, 80, 120];
export const DAILY_CHALLENGE_COIN_TARGETS = [8, 15, 25, 40, 60];
export const DAILY_CHALLENGE_REWARD_COINS = 150; // Increased from 100
export const REWARDED_AD_FREE_COINS_AMOUNT = 50; // Increased from 25
export const CONTINUE_RUN_AD_LIMIT = 2; // Increased from 1
export const AD_SIMULATION_DURATION = 3000; // Slightly longer for better UX
export const MILESTONE_SCORE_INTERVAL = 20; // More frequent rewards
export const MILESTONE_COIN_REWARD = 8; // Increased reward

// Enhanced coin and enemy spawn rates for better balance
export const COIN_RADIUS = 14; // Slightly larger for better visibility
export const COIN_SPAWN_INTERVAL = 90; // More frequent coins
export const COIN_SPAWN_CHANCE = 0.8; // Higher spawn chance
export const MIN_COIN_Y = 80;
export const MAX_COIN_Y = CANVAS_HEIGHT - GROUND_HEIGHT - 80;

export const ENEMY_SPAWN_BASE_INTERVAL = 200; // More frequent enemy spawns
export const ENEMY_SPAWN_DIFFICULTY_FACTOR = 25; // Faster scaling
export const ENEMY_AI_UPDATE_INTERVAL = 3; // More responsive AI

// Enhanced scenes with better visual variety
const rawScenes: Array<Omit<SceneConfig, 'colorRGB' | 'silhouette' | 'groundColors' | 'groundDetailConfig' | 'groundAnimationType'>> = [
  {name: 'Dawn Break', sky: '#FFB6C1', type: 'mountains', weather: 'clear'},
  {name: 'Sunny Day', sky: '#87CEEB', type: 'city', weather: 'clear'},
  {name: 'Golden Hour', sky: '#FFA500', type: 'forest', weather: 'clear'},
  {name: 'Starry Night', sky: '#191970', type: 'cityNight', weather: 'clear'},
  {name: 'Thunder Storm', sky: '#2F4F4F', type: 'city', weather: 'rain'},
  {name: 'Winter Peaks', sky: '#E6F3FF', type: 'mountains', weather: 'snow'},
  {name: 'Desert Mirage', sky: '#F4A460', type: 'desert', weather: 'sandstorm'},
  {name: 'Zen Garden', sky: '#E0F2F7', type: 'zen', weather: 'clear'},
  {name: 'Volcanic Twilight', sky: '#8B0000', type: 'volcanic_zen', weather: 'clear'},
  {name: 'Cherry Blossom', sky: '#FFB6C1', type: 'blooming_zen', weather: 'clear'},
  {name: 'Aurora Borealis', sky: '#006400', type: 'mountains', weather: 'aurora'},
  {name: 'Cyberpunk City', sky: '#FF1493', type: 'cityNight', weather: 'neon'}
];

export const SCENES: SceneConfig[] = [
  {
    name: 'Forest',
    sky: '#87CEEB',
    type: 'forest',
    weather: 'clear',
    groundColor: '#228B22',
    groundShadowColor: '#1F5F1F',
    skyGradient: {
      top: '#87CEEB',
      bottom: '#98FB98'
    },
    groundColors: ['#228B22', '#32CD32', '#90EE90'],
    groundDetailConfig: {
      type: 'grass',
      color: '#228B22',
      density: 50,
      heightParameters: { base: 15, variance: 8 }
    }
  },
  {
    name: 'Mountains',
    sky: '#4682B4',
    type: 'mountains',
    weather: 'clear',
    groundColor: '#8B7355',
    groundShadowColor: '#6B5B47',
    skyGradient: {
      top: '#87CEEB',
      bottom: '#F0F8FF'
    },
    groundColors: ['#8B7355', '#CD853F', '#DEB887'],
    groundDetailConfig: {
      type: 'rocks',
      color: '#696969',
      density: 40,
      heightParameters: { base: 10, variance: 5 }
    }
  },
  {
    name: 'City',
    sky: '#B0C4DE',
    type: 'city',
    weather: 'clear',
    groundColor: '#696969',
    groundShadowColor: '#2F4F4F',
    skyGradient: {
      top: '#B0C4DE',
      bottom: '#F5F5DC'
    },
    groundColors: ['#696969', '#778899', '#A9A9A9'],
    groundDetailConfig: {
      type: 'road_markings',
      color: '#FFFFFF',
      density: 0
    },
    groundAnimationType: 'passing_cars'
  },
  {
    name: 'Night',
    sky: '#191970',
    type: 'cityNight',
    weather: 'clear',
    groundColor: '#2F2F2F',
    groundShadowColor: '#1C1C1C',
    skyGradient: {
      top: '#191970',
      bottom: '#000080'
    },
    groundColors: ['#2F2F2F', '#4B4B4B', '#696969'],
    groundDetailConfig: {
      type: 'road_markings',
      color: '#FFFFFF',
      density: 0
    },
    groundAnimationType: 'passing_cars'
  },
  {
    name: 'Desert',
    sky: '#F4A460',
    type: 'desert',
    weather: 'sandstorm',
    groundColor: '#F4A460',
    groundShadowColor: '#D2691E',
    skyGradient: {
      top: '#FFE4B5',
      bottom: '#F4A460'
    },
    groundColors: ['#F4A460', '#D2691E', '#CD853F'],
    groundDetailConfig: {
      type: 'cactus',
      color: '#32CD32',
      density: 80,
      heightParameters: { base: 20, variance: 15 }
    }
  },
  {
    name: 'Zen Garden',
    sky: '#E6E6FA',
    type: 'zen',
    weather: 'clear',
    groundColor: '#F5F5DC',
    groundShadowColor: '#DDBF94',
    skyGradient: {
      top: '#E6E6FA',
      bottom: '#F0F8FF'
    },
    groundColors: ['#F5F5DC', '#DDBF94', '#D2B48C'],
    groundDetailConfig: {
      type: 'flowers',
      color: '#FF69B4',
      density: 30,
      heightParameters: { base: 12, variance: 6 }
    }
  },
  {
    name: 'Volcanic Zen',
    sky: '#2F1B14',
    type: 'volcanic_zen',
    weather: 'ash',
    groundColor: '#8B4513',
    groundShadowColor: '#654321',
    skyGradient: {
      top: '#2F1B14',
      bottom: '#8B4513'
    },
    groundColors: ['#8B4513', '#A0522D', '#CD853F'],
    groundDetailConfig: {
      type: 'rocks',
      color: '#696969',
      density: 25,
      heightParameters: { base: 18, variance: 10 }
    }
  },
  {
    name: 'Blooming Zen',
    sky: '#FFB6C1',
    type: 'blooming_zen',  
    weather: 'clear',
    groundColor: '#98FB98',
    groundShadowColor: '#7CFC00',
    skyGradient: {
      top: '#FFB6C1',
      bottom: '#F0FFF0'
    },
    groundColors: ['#98FB98', '#90EE90', '#7CFC00'],
    groundDetailConfig: {
      type: 'flowers',
      color: '#FF1493',
      density: 60,
      heightParameters: { base: 16, variance: 8 }
    }
  },
  {
    name: 'Space',
    sky: '#000000',
    type: 'mountains',
    weather: 'clear',
    groundColor: '#2F2F2F',
    groundShadowColor: '#1C1C1C',
    skyGradient: {
      top: '#000000',
      bottom: '#191970'
    },
    groundColors: ['#2F2F2F', '#4B4B4B', '#696969'],
    groundDetailConfig: {
      type: 'rocks',
      color: '#696969',
      density: 15,
      heightParameters: { base: 8, variance: 4 }
    }
  },
  {
    name: 'Storm',
    sky: '#2F4F4F',
    type: 'city',
    weather: 'storm',
    groundColor: '#696969',
    groundShadowColor: '#2F4F4F',
    skyGradient: {
      top: '#2F4F4F',
      bottom: '#708090'
    },
    groundColors: ['#696969', '#778899', '#A9A9A9'],
    groundDetailConfig: {
      type: 'road_markings',
      color: '#FFFFFF',
      density: 0
    },
    groundAnimationType: 'passing_cars'
  }
];


// Performance optimization constants
export const PERFORMANCE_CONFIG = {
  MAX_PARTICLES: 150, // Limit particles for performance
  PARTICLE_CLEANUP_INTERVAL: 60, // Clean up old particles every 60 frames
  MAX_ENEMIES_ON_SCREEN: 8, // Limit concurrent enemies
  COLLISION_OPTIMIZATION_DISTANCE: 100, // Only check collisions within this distance
  RENDER_DISTANCE: CANVAS_WIDTH + 100, // Objects beyond this aren't rendered
  TARGET_FPS: 60,
  PERFORMANCE_MODE_THRESHOLD: 30 // Switch to performance mode if FPS drops below this
};

export const ZEN_MODE_PIPE_GAP_MIN_MULTIPLIER = 1.4; // Slightly more forgiving
export const ZEN_MODE_PIPE_GAP_MAX_MULTIPLIER = 1.3;
export const ZEN_MODE_PIPE_SPAWN_RATE_MULTIPLIER = 1.2; // Slower spawning
export const ZEN_MODE_ENEMY_SPAWN_RATE_MULTIPLIER = 0.3; // Much fewer enemies in zen

// New constants for enhanced features
export const INTELLIGENT_DIFFICULTY_CONFIG = {
  SKILL_ASSESSMENT_WINDOW: 10, // Assess player skill over last 10 games
  EASY_PLAYER_THRESHOLD: 15, // Average score below this = easy adjustments
  HARD_PLAYER_THRESHOLD: 75, // Average score above this = hard adjustments
  DIFFICULTY_ADJUSTMENT_FACTOR: 0.1, // How much to adjust difficulty
  ADAPTIVE_ENEMY_SPAWN_FACTOR: 0.2 // How much enemy spawning adapts to skill
};

export const SOCIAL_FEATURES_CONFIG = {
  SCREENSHOT_SHARE_ENABLED: true,
  LEADERBOARD_CACHE_DURATION: 300000, // 5 minutes
  FRIEND_CHALLENGE_DURATION: 86400000, // 24 hours
  VIRAL_SHARE_INCENTIVE_COINS: 25
};

// Audio enhancement constants
export const AUDIO_CONFIG = {
  SOUND_POOLS: {
    FLAP: 3, // Multiple flap sounds for variety
    COIN: 4, // Multiple coin sounds
    HIT: 5, // Multiple hit sounds
    POWERUP: 3 // Multiple powerup sounds
  },
  DYNAMIC_MUSIC_LAYERS: 4, // Number of adaptive music layers
  SPATIAL_AUDIO_ENABLED: true, // 3D positioned audio for better immersion
  ADAPTIVE_VOLUME_DUCKING: true // Automatically adjust volumes based on gameplay intensity
};

export const ENEMY_AI_PATTERNS = {
  STATIC: 'static',
  TRACKING: 'tracking', 
  AMBUSH: 'ambush',
  SWARM: 'swarm',
  PATROL: 'patrol'
};