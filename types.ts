
export interface Bird {
  x: number;
  y: number;
  r: number;
  v: number; // velocity
  g: number; // gravity
  flapForce: number;
  typeIndex: number;
}

export interface Pipe {
  x: number;
  w: number;
  gapT: number; // top of the gap
  gapB: number; // bottom of the gap
  scored: boolean;
  frozen?: boolean; // Original property, though freeze powerup removed
}

export interface Coin {
  x: number;
  y: number;
  r: number;
  taken: boolean;
}

export interface Cloud {
  x: number;
  y: number;
  speed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife?: number;
  type: 'rain' | 'snow' | 'sand' | 'game' | 'debuff_ghost' | 'debuff_sprite' | 'revive';
  color?: string;
  size?: number;
}

export interface TrailParticle {
  x: number;
  y: number;
  life: number;
  size: number;
}

export interface Star {
  x: number;
  y: number;
  twinkle: number;
  size: number;
}

export interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  trail: Array<{ x: number; y: number; life: number }>;
}

export type DebuffType = 'HEAVY_WINGS' | 'FLAP_FATIGUE' | 'SCREEN_LURCH';

export interface DebuffEffect {
  type: DebuffType;
  duration: number;
  originalGravity?: number;
  originalFlapForce?: number;
  magnitude: number; // e.g., gravity multiplier, flap reduction percentage, shake intensity
}

export type EnemyVisualType = 'SPIKEBALL' | 'GHOST' | 'SPRITE';

export interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  visualType: EnemyVisualType;
  debuffType: DebuffType;
  life: number; // Could be 1 for one-hit apply debuff
  spawnFrame?: number; // For unique animation offsets
}

export interface GroundDetailConfig {
  color: string;
  type: 'blades' | 'tufts' | 'rocks' | 'cactus' | 'road_markings' | 'none';
  heightParameters?: { base: number; variance: number };
  density?: number; // Optional: items per CANVAS_WIDTH for static features
}

export interface SceneConfig {
  name: string;
  sky: string;
  type: 'mountains' | 'city' | 'forest' | 'cityNight' | 'desert';
  weather: 'clear' | 'rain' | 'snow' | 'sandstorm';
  colorRGB?: [number, number, number]; // Pre-calculated RGB for sky
  silhouette?: SilhouettePoint[]; // For drawing background
  groundColors: [string, string, string]; // Gradient for ground: [top, middle, bottom]
  groundDetailConfig: GroundDetailConfig;
  groundAnimationType?: 'passing_cars' | 'none';
}

export interface SilhouettePoint {
  x: number;
  y?: number; // For mountains/dunes
  h?: number; // For city buildings
  windows?: Array<{ xoff: number; y: number }>; // For city night buildings
  type?: 'dune'; // For desert
}


export interface SkyPeckerTypeConfig {
  name: string;
  color: string;
  stroke: string;
  size: number; // Base size multiplier for collision
  speed: number; // Base physics speed multiplier (affects flap, gravity application rate)
  description: string; // For UI
  // Unique abilities / stat modifiers
  flapForceMultiplier?: number; // Multiplier for INITIAL_BIRD_FLAP_FORCE
  gravityMultiplier?: number;   // Multiplier for INITIAL_BIRD_G
  powerGaugeMultiplier?: number; // How fast PWR gauge fills (e.g., 1.2 for 20% faster)
  canNegateDebuffOnce?: boolean; // e.g., Tank - one debuff ignored per run
  extraPipeHitAllowed?: number;  // e.g., Tank - absorb N extra pipe/boundary hits after first free one
  pipePhaseChance?: number;      // e.g., Ghost - 0.0 to 1.0 chance to pass through pipe section
  reviveOnce?: boolean;          // e.g., Phoenix - one self-revive per game
  specialAbilityCooldown?: number; // Cooldown in frames for abilities like pipe phasing
}

export interface Achievement {
  name:string;
  desc: string;
  unlocked: boolean;
  progress?: number; // For achievements with counters
  target?: number; // For progress-based achievements, if needed for display
}

export interface Achievements {
  [key: string]: Achievement;
}

export type PowerUpType = 'shield' | 'slow' | 'shrink' | 'magnet' | 'speed' | null;

export type GameMode = 'start' | 'play' | 'over' | 'shop' | 'achievements' | 'howtoplay' | 'settings'; // Added settings

export interface DailyChallenge {
  type: 'score' | 'coins';
  target: number;
  reward: number;
  completedToday?: boolean;
  description: string;
}

export interface StoredProgress {
  highScore: number;
  totalCoins: number;
  achievements: Achievements;
  selectedSkyPeckerType: number;
  ownedSkyPeckerIndices: number[];
  hasRemovedAds?: boolean; // Optional for backward compatibility
  lastDailyRewardClaimed?: string | null; // ISO date string
  dailyChallenge?: DailyChallenge | null;
  lastDailyChallengeCompleted?: string | null; // ISO date string
}

// Data structure for HUD elements controlled by GameEngine
export interface EngineHudData {
  score: number;
  powerGauge: number;
  currentPowerup: PowerUpType | null;
  powerupTime: number;
  difficulty: number;
  perfectRun: boolean;
  combo: number;
  activeDebuff: DebuffEffect | null;
}

export interface GameEngineProps {
  selectedSkyPeckerTypeIndex: number;
  selectedStartPower: PowerUpType | null;
  onGameOver: (score: number, coinsCollectedThisRun: number, perfectRun: boolean) => void;
  onCoinCollected: (value: number) => void;
  onAchievementProgress: (achievementKey: string, progressIncrement: number) => void;
  onPowerupUsed: (type: PowerUpType) => void;
  toggleGodModeCallback: (isActive: boolean) => void;
  updateHudData: (data: EngineHudData) => void;
  canContinueRun: boolean; // New prop
  onContinueRunRequested: () => void; // New prop
}

export interface GameEngineRef { // For App.tsx to call methods on GameEngine
  resumeAfterAdContinue: () => void;
}

export interface GroundElement { // For animated elements like cars
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speedFactor: number; // Speed relative to game's moveSpeed
  type: 'car';
}

export interface StaticGroundFeature {
  x: number;
  y: number;
  type: 'blades' | 'tufts' | 'rocks' | 'cactus';
  height: number;
  width?: number; // e.g. for cactus base or rock width
  color: string;
}
