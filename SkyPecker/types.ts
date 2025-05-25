
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
  gapT: number; // top of thegap
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
  type: 'rain' | 'snow' | 'sand' | 'game' | 'debuff_ghost' | 'debuff_sprite' | 'revive' | 'trail_basic' | 'trail_sparkle' | 'trail_bubble' | 'milestone';
  color?: string;
  size?: number;
  trailConfig?: TrailParticleConfig; // Added for specific trail behaviors
}

export interface TrailParticle { // This might be deprecated in favor of using Particle with trail types
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
  type: 'blades' | 'tufts' | 'rocks' | 'cactus' | 'road_markings' | 'flowers' | 'none'; // Added 'flowers'
  heightParameters?: { base: number; variance: number };
  density?: number; // Optional: items per CANVAS_WIDTH for static features
}

export interface SceneConfig {
  name: string;
  sky: string;
  type: 'mountains' | 'city' | 'forest' | 'cityNight' | 'desert' | 'zen' | 'volcanic_zen' | 'blooming_zen'; // Added zen types
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

export type GameMode = 'start' | 'play' | 'over' | 'shop' | 'achievements' | 'howtoplay' | 'settings' | 'leaderboard' | 'zen'; // Added zen

export interface DailyChallenge {
  type: 'score' | 'coins';
  target: number;
  reward: number;
  completedToday?: boolean;
  description: string;
}

export interface StoredProgress {
  highScore: number;
  zenHighScore?: number; // New for Zen mode
  totalCoins: number;
  achievements: Achievements;
  selectedSkyPeckerType: number;
  ownedSkyPeckerIndices: number[];
  hasRemovedAds?: boolean; // Optional for backward compatibility
  lastDailyRewardClaimed?: string | null; // ISO date string
  dailyChallenge?: DailyChallenge | null;
  lastDailyChallengeCompleted?: string | null; // ISO date string
  ownedTrailEffectIds?: string[]; 
  selectedTrailEffectId?: string | null; 
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
  isZenMode?: boolean; // To indicate to HUD
}

export interface TrailParticleConfig {
  type: 'basic_following' | 'sparkle' | 'bubble';
  color?: string; // Specific color, or 'skypecker_primary' / 'skypecker_stroke'
  emitRate: number; // Particles per frame (e.g., 1 for basic, 0.5 for less frequent)
  particleLife?: number; 
  baseParticleSize?: number; 
  // For sparkle:
  velocitySpread?: number;
  // For bubble:
  bubbleRiseSpeed?: number;
}

export interface SkyPeckerTrailEffect {
  id: string;
  name: string;
  description: string;
  cost: number;
  particleConfig: TrailParticleConfig;
}

export interface GameEngineProps {
  selectedSkyPeckerTypeIndex: number;
  selectedStartPower: PowerUpType | null;
  selectedTrailEffect: SkyPeckerTrailEffect | null; 
  isZenMode?: boolean; // New prop for Zen Mode
  onGameOver: (score: number, coinsCollectedThisRun: number, perfectRun: boolean, isZenMode?: boolean) => void;
  onCoinCollected: (value: number) => void;
  onAchievementProgress: (achievementKey: string, progressIncrement: number) => void;
  onPowerupUsed: (type: PowerUpType) => void;
  toggleGodModeCallback: (isActive: boolean) => void;
  updateHudData: (data: EngineHudData) => void;
  canContinueRun: boolean;
  onContinueRunRequested: () => void;
  onMilestoneReached?: (score: number, coins: number) => void; // New for milestone rewards
  onPauseStateChange: (isPaused: boolean) => void; // For HTML pause menu
}

export interface GameEngineRef { 
  resumeAfterAdContinue: () => void;
  requestResume: () => void; // For HTML pause menu to resume game
  requestPause: () => void; // For HTML pause menu to pause game (e.g. from HUD button)
}

export interface GroundElement { 
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speedFactor: number; 
  type: 'car';
}

export interface StaticGroundFeature {
  x: number;
  y: number;
  type: 'blades' | 'tufts' | 'rocks' | 'cactus' | 'flowers'; // Added 'flowers'
  height: number;
  width?: number; 
  color: string;
}

export interface LeaderboardEntry {
  rank?: number; // Optional, can be set at display time
  name: string;
  score: number;
  isPlayer?: boolean; // To highlight player's score
}
