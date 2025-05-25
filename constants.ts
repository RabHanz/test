
import { SceneConfig, SkyPeckerTypeConfig, Achievements, PowerUpType, EnemyVisualType, DebuffType, Enemy, GroundDetailConfig } from './types';
import { hexToRgb, generateSilhouettePoints } from './utils';

export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 700;
export const GROUND_HEIGHT = 60;

export const INITIAL_BIRD_R = 25; // Base radius, actual visual size modified by SkyPeckerTypeConfig.size
export const INITIAL_BIRD_G = 0.4;
export const INITIAL_BIRD_FLAP_FORCE = -8;

export const PIPE_WIDTH = 80;
export const SCENE_TRANSITION_DURATION = 60; // frames
export const SCENE_INTERVAL = 720; // frames to change scene

export const POWERUP_OPTIONS: PowerUpType[] = ['shield', 'slow', 'shrink', 'magnet', 'speed'];

export const STARTING_POWERUP_OPTIONS: Array<{ name: string, value: PowerUpType | null }> = [
  { name: 'None', value: null },
  { name: 'Shield', value: 'shield' },
  { name: 'Slow Motion', value: 'slow' },
];


const rawScenes: Array<Omit<SceneConfig, 'colorRGB' | 'silhouette' | 'groundColors' | 'groundDetailConfig' | 'groundAnimationType'>> = [
  {name: 'Morning', sky: '#A3C1FF', type: 'mountains', weather: 'clear'},
  {name: 'Day', sky: '#70C5CE', type: 'city', weather: 'clear'},
  {name: 'Sunset', sky: '#FF8C42', type: 'forest', weather: 'clear'},
  {name: 'Night', sky: '#001f33', type: 'cityNight', weather: 'clear'},
  {name: 'Storm', sky: '#4A4A4A', type: 'city', weather: 'rain'},
  {name: 'Snow', sky: '#E6F3FF', type: 'mountains', weather: 'snow'},
  {name: 'Desert', sky: '#FFA500', type: 'desert', weather: 'sandstorm'}
];

export const SCENES: SceneConfig[] = rawScenes.map(s => {
  let groundColors: [string, string, string];
  let groundDetailConfig: GroundDetailConfig;
  let groundAnimationType: SceneConfig['groundAnimationType'] = 'none';

  switch (s.type) {
    case 'mountains':
      if (s.weather === 'snow') {
        groundColors = ['#F0F8FF', '#E6F3FF', '#DDEEFF']; // Snowy ground
        groundDetailConfig = { color: '#FFFFFF', type: 'tufts', heightParameters: { base: 15, variance: 5 }, density: 25 }; // Taller, snow-covered tufts
      } else { // Clear weather mountains
        groundColors = ['#8BC34A', '#689F38', '#4CAF50']; // Grassy
        groundDetailConfig = { color: '#4CAF50', type: 'blades', heightParameters: { base: 20, variance: 8 }, density: 15 }; // Taller grass
      }
      break;
    case 'city':
      groundColors = s.weather === 'rain' ? ['#404040', '#353535', '#2A2A2A'] : ['#555555', '#484848', '#3D3D3D']; // Wet dark road or regular road
      groundDetailConfig = { color: '#A0A0A0', type: 'road_markings', density: 0 }; // Road lines
      groundAnimationType = 'passing_cars';
      break;
    case 'cityNight':
      groundColors = ['#303030', '#252525', '#1A1A1A']; // Very dark road
      groundDetailConfig = { color: '#505050', type: 'road_markings', density: 0 };
      groundAnimationType = 'passing_cars';
      break;
    case 'forest':
      groundColors = ['#556B2F', '#3A5220', '#2E4015']; // Dark green, earthy
      groundDetailConfig = { color: '#6B8E23', type: 'tufts', heightParameters: { base: 22, variance: 10 }, density: 20 }; // Taller forest floor tufts
      break;
    case 'desert':
      groundColors = ['#E0C080', '#D2B48C', '#C0A070']; // Lighter sand colors
      groundDetailConfig = { color: '#556B2F', type: 'cactus', heightParameters: { base: 35, variance: 20 }, density: 50 }; // Cactus, less dense
      break;
    default: // Fallback, should not happen with current rawScenes
      groundColors = ['#8BC34A', '#689F38', '#33691E'];
      groundDetailConfig = { color: '#4CAF50', type: 'blades', heightParameters: { base: 18, variance: 6 }, density: 20 };
  }

  return {
    ...s,
    colorRGB: hexToRgb(s.sky) as [number, number, number],
    silhouette: generateSilhouettePoints(s, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT),
    groundColors,
    groundDetailConfig,
    groundAnimationType,
  };
});


export const SKYPECKER_TYPES: SkyPeckerTypeConfig[] = [ 
  {
    name: 'Classic', color: '#FFD700', stroke: '#A27C1A', size: 1, speed: 1,
    description: 'The all-rounder. Balanced stats, perfect for learning the ropes.',
    flapForceMultiplier: 1,
    gravityMultiplier: 1,
    powerGaugeMultiplier: 1,
  },
  {
    name: 'Speedy', color: '#FF4444', stroke: '#AA0000', size: 0.8, speed: 1.2,
    description: 'Fast and agile! Smaller size helps dodge. Fills power gauge 20% faster.',
    flapForceMultiplier: 1.05, 
    gravityMultiplier: 1.0,   
    powerGaugeMultiplier: 1.2, 
  },
  {
    name: 'Tank', color: '#44AA44', stroke: '#006600', size: 1.3, speed: 0.8,
    description: 'Big and tough! Can ignore one enemy debuff per run. Slower movement.',
    flapForceMultiplier: 0.95, 
    gravityMultiplier: 0.9,   
    canNegateDebuffOnce: true,
  },
  {
    name: 'Phantom', color: 'rgba(180,180,220,0.7)', stroke: '#666699', size: 0.9, speed: 1,
    description: 'Ethereal. Has a 15% chance to phase through pipes unharmed (cooldown applies).',
    flapForceMultiplier: 1,
    gravityMultiplier: 1,
    pipePhaseChance: 0.15,
    specialAbilityCooldown: 300, 
  },
  {
    name: 'Phoenix', color: '#FF6600', stroke: '#CC3300', size: 1.1, speed: 1.1,
    description: 'Legendary! Revives once per game with a brief shield after a fatal pipe/boundary hit.',
    flapForceMultiplier: 1.1,  
    gravityMultiplier: 1.05, 
    reviveOnce: true,
    powerGaugeMultiplier: 1.1, 
  }
];

export const SHOP_ITEM_COST_MULTIPLIER = 75; 

export const INITIAL_ACHIEVEMENTS: Achievements = {
  firstFlight: {name: 'First Flight', desc: 'Score your first point', unlocked: false},
  coinCollector: {name: 'Coin Collector', desc: 'Collect 50 coins total', unlocked: false, progress: 0, target: 50},
  survivor: {name: 'Survivor', desc: 'Score 25 points', unlocked: false},
  powerMaster: {name: 'Power Master', desc: 'Use 10 powerups', unlocked: false, progress: 0, target: 10},
  weatherWizard: {name: 'Weather Wizard', desc: 'Play in 3 different weather types', unlocked: false, progress: 0, target: 3}, 
  comboKing: {name: 'Combo King', desc: 'Get a 10x combo', unlocked: false},
  perfectionist: {name: 'Perfectionist', desc: 'Score 50 points', unlocked: false},
  legendary: {name: 'Legendary', desc: 'Score 100 points', unlocked: false},
  untouchable: {name: 'Untouchable', desc: 'Score 15 without pipes/boundary damage', unlocked: false},
  speedDemon: {name: 'Speed Demon', desc: 'Use speed boost 5 times', unlocked: false, progress: 0, target: 5},
  skyPeckerCollector: {name: 'SkyPecker Hoarder', desc: 'Unlock all SkyPecker types', unlocked: false, progress: 0, target: SKYPECKER_TYPES.length} 
};

export const GAME_STORAGE_KEY = 'skyPeckerGameProgress_v4_icp'; // Updated for new structure

export const DEBUG_KEYS_INFO = "SHIFT+G: God Mode • T: Powerup • C: +Coins • S: +Score • D: +Difficulty";

export const PARTICLE_COLORS = {
  coin: '#FFD700',
  shieldHit: '#00FFFF',
  godModeHit: '#FFD700',
  debuffGhost: '#ADD8E6', 
  debuffSprite: '#FFA07A',
  revive: '#FFBF00', 
  debuffNegated: '#90EE90', 
};

export const COIN_RADIUS = 12;
export const COIN_SPAWN_INTERVAL = 100; 
export const COIN_SPAWN_CHANCE = 0.7; 
export const MIN_COIN_Y = 80; 
export const MAX_COIN_Y = CANVAS_HEIGHT - GROUND_HEIGHT - 80;

export const ENEMY_SPAWN_BASE_INTERVAL = 240; 
export const ENEMY_SPAWN_DIFFICULTY_FACTOR = 30;

export interface EnemyTypeConfig {
  visualType: EnemyVisualType;
  size: number;
  debuffType: DebuffType;
  spawnDifficultyThreshold: number;
  baseSpeedMultiplier?: number; 
  color?: string; 
  strokeColor?: string; 
}

export const ENEMY_TYPES: EnemyTypeConfig[] = [
  { visualType: 'GHOST', size: 18, debuffType: 'HEAVY_WINGS', spawnDifficultyThreshold: 1.5, baseSpeedMultiplier: 0.7 },
  { visualType: 'SPRITE', size: 10, debuffType: 'FLAP_FATIGUE', spawnDifficultyThreshold: 3.0, baseSpeedMultiplier: 1.2, color: '#FF4500', strokeColor: '#FF0000'},
  { visualType: 'SPIKEBALL', size: 15, debuffType: 'SCREEN_LURCH', spawnDifficultyThreshold: 0.5, baseSpeedMultiplier: 1.0 },
];

export const DEBUFF_CONFIG: Record<DebuffType, { duration: number; magnitude: number }> = {
  HEAVY_WINGS: { duration: 180, magnitude: 1.6 }, 
  FLAP_FATIGUE: { duration: 150, magnitude: 0.4 }, 
  SCREEN_LURCH: { duration: 30, magnitude: 15 }, 
};

export const INITIAL_DEBUFF_STATE: null = null;

export const CAR_COLORS = ['#FF6347', '#4682B4', '#32CD32', '#FFD700', '#DDA0DD', '#778899', '#8A2BE2', '#A52A2A']; 
export const MAX_GROUND_CARS = 5;
export const CAR_MIN_WIDTH = 50;
export const CAR_MAX_WIDTH = 80;
export const CAR_MIN_HEIGHT = 25;
export const CAR_MAX_HEIGHT = 35;
export const CAR_MIN_SPEED_FACTOR = 0.5; 
export const CAR_MAX_SPEED_FACTOR = 0.8;
export const STATIC_GROUND_FEATURE_SPREAD = CANVAS_WIDTH * 1.5; 

// ICP Monetization and Engagement Constants
export const DAILY_REWARD_COINS = 50;
export const DAILY_CHALLENGE_SCORE_TARGETS = [20, 30, 40, 50];
export const DAILY_CHALLENGE_COIN_TARGETS = [10, 15, 20, 25];
export const DAILY_CHALLENGE_REWARD_COINS = 100;
export const REWARDED_AD_FREE_COINS_AMOUNT = 25;
export const CONTINUE_RUN_AD_LIMIT = 1; // Max times player can continue per game session (resets on app load)
export const AD_SIMULATION_DURATION = 2500; // ms for simulated ad watching
