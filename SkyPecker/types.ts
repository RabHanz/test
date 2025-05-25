export interface Bird {
  x: number;
  y: number;
  r: number;
  v: number;
  g: number;
  flapForce: number;
  typeIndex: number;
  rotation?: number;
  animationFrame?: number;
  trailParticles?: TrailParticle[];
  lastFlapTime?: number;
  wingAnimationOffset?: number;
}

export interface Pipe {
  x: number;
  w: number;
  gapT: number;
  gapB: number;
  scored: boolean;
  pipeVariant?: 'standard' | 'metal' | 'stone' | 'crystal';
  weatherEffect?: 'snow' | 'rust' | 'growth';
}

// ✅ FIXED: Updated Coin interface to match GameEngine usage
export interface Coin {
  x: number;
  y: number;
  r: number;
  collected: boolean;
  value: number;
  type: 'bronze' | 'silver' | 'gold' | 'diamond';
  animationFrame: number;
  rotation: number;
  rotationSpeed: number;
  bobOffset: number;
  glowIntensity: number;
}

export interface Cloud {
  x: number;
  y: number;
  speed: number;
  size?: number;
  opacity?: number;
  cloudType?: 'normal' | 'storm' | 'wispy';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife?: number;
  type: 'rain' | 'snow' | 'sand' | 'game' | 'debuff_ghost' | 'debuff_sprite' | 'revive' | 
        'trail_basic' | 'trail_sparkle' | 'trail_bubble' | 'milestone' | 'combo' | 'powerup' |
        'debuff_vortex' | 'debuff_phantom' | 'debuff_hunter' | 'debuff_nemesis' | 'debuff_void' |
        'ice_crystal' | 'fire_ember' | 'rainbow_shard' | 'aurora' | 'neon_glow' | 'weather';
  color?: string;
  size?: number;
  trailConfig?: TrailParticleConfig;
  rotation?: number;
  rotationSpeed?: number;
  gravity?: number;
  bounce?: boolean;
  specialEffect?: string;
}

export interface TrailParticle {
  x: number;
  y: number;
  life: number;
  size: number;
  color?: string;
  alpha?: number;
}

export interface Star {
  x: number;
  y: number;
  twinkle: number;
  size: number;
  brightness?: number;
  color?: string;
}

export interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  tail: Array<{ x: number; y: number; life: number; brightness?: number }>;
  size?: number;
  color?: string;
}

export type DebuffType = 'HEAVY_WINGS' | 'FLAP_FATIGUE' | 'SCREEN_LURCH' | 'VISION_BLUR' | 
                        'CONTROLS_INVERT' | 'SPEED_LOCK' | 'GRAVITY_CHAOS' | 'POWER_DRAIN';

export interface DebuffEffect {
  type: DebuffType;
  duration: number;
  originalGravity?: number;
  originalFlapForce?: number;
  magnitude: number;
  stackLevel?: number;
  visualEffectIntensity?: number;
  appliedTimestamp?: number;
}

export type EnemyVisualType = 'SPIKEBALL' | 'GHOST' | 'SPRITE' | 'VORTEX' | 'PHANTOM' | 
                             'HUNTER' | 'NEMESIS' | 'VOID';

export interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  visualType: EnemyVisualType;
  debuffType: DebuffType;
  life: number;
  spawnFrame?: number;
  aiState?: 'idle' | 'tracking' | 'attacking' | 'retreating' | 'charging';
  targetX?: number;
  targetY?: number;
  aggressionLevel?: number;
  lastStateChange?: number;
  specialCooldown?: number;
  animationPhase?: number;
  trailParticles?: Particle[];
  isElite?: boolean;
  frozenDuration?: number;
}

export interface GroundDetailConfig {
  color: string;
  type: 'blades' | 'tufts' | 'rocks' | 'cactus' | 'road_markings' | 'flowers' | 'grass' | 'mushrooms' | 'crystals' | 'none';
  heightParameters?: { base: number; variance: number };
  density?: number;
  animationSpeed?: number;
  weatherResistance?: boolean;
}

// ✅ FIXED: Added missing properties to SceneConfig
export interface SceneConfig {
  name: string;
  sky: string;
  type: 'mountains' | 'city' | 'forest' | 'cityNight' | 'desert' | 'zen' | 'volcanic_zen' | 'blooming_zen';
  weather: 'clear' | 'rain' | 'snow' | 'sandstorm' | 'aurora' | 'neon' | 'storm' | 'ash';
  colorRGB?: [number, number, number];
  silhouette?: SilhouettePoint[];
  groundColors: [string, string, string];
  groundColor: string;
  groundShadowColor?: string;
  skyGradient: {
    top: string;
    bottom: string;
  };
  groundDetailConfig: GroundDetailConfig;
  groundAnimationType?: 'passing_cars' | 'none';
  ambientParticles?: boolean;
  musicLayer?: string;
  difficultyModifier?: number;
}

export interface SilhouettePoint {
  x: number;
  y?: number;
  h?: number;
  windows?: Array<{ xoff: number; y: number; lit?: boolean }>;
  type?: 'dune' | 'peak' | 'building' | 'tree';
  variant?: string;
}

export type BirdType = 'robin' | 'sparrow' | 'eagle' | 'owl' | 'phoenix' | 'falcon' | 'hummingbird' | 'crow';

export interface SkyPeckerTypeConfig {
  name: string;
  color: string;
  stroke: string;
  size: number;
  speed: number;
  description: string;
  birdType: BirdType;
  unlockCondition: 'default' | 'score_25' | 'score_50' | 'score_100' | 'premium_iap' | 'achievement_unlock';
  flapForceMultiplier?: number;
  gravityMultiplier?: number;
  powerGaugeMultiplier?: number;
  canNegateDebuffOnce?: boolean;
  extraPipeHitAllowed?: number;
  pipePhaseChance?: number;
  reviveOnce?: boolean;
  specialAbilityCooldown?: number;
  shieldDurationMultiplier?: number;
  trailEffectMultiplier?: number;
  freezeEnemiesOnHit?: boolean;
  coinMagnetRange?: number;
  rarityTier?: 'common' | 'rare' | 'epic' | 'legendary';
  animationFrames?: number;
  specialSounds?: string[];
}

export interface Achievement {
  name: string;
  desc: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  rarity?: 'bronze' | 'silver' | 'gold' | 'platinum';
  rewardCoins?: number;
  rewardItem?: string;
  category?: 'gameplay' | 'collection' | 'social' | 'challenge';
  dateUnlocked?: string;
  iconType?: string;
}

export interface Achievements {
  [key: string]: Achievement;
}

export type PowerUpType = 'shield' | 'slow' | 'shrink' | 'magnet' | 'speed' | 'freeze' | 'laser' | 'ghost' | null;

export type GameMode = 'start' | 'play' | 'over' | 'shop' | 'achievements' | 'howtoplay' | 'settings' | 'leaderboard' | 'zen' | 'daily_challenge';

export interface DailyChallenge {
  type: 'score' | 'coins' | 'powerups' | 'enemies' | 'perfect_run';
  target: number;
  reward: number;
  completedToday?: boolean;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  bonusReward?: number;
  streakMultiplier?: number;
}

export interface StoredProgress {
  highScore: number;
  zenHighScore?: number;
  totalCoins: number;
  achievements: Achievements;
  selectedSkyPeckerType: number;
  ownedSkyPeckerIndices: number[];
  hasRemovedAds?: boolean;
  lastDailyRewardClaimed?: string | null;
  dailyChallenge?: DailyChallenge | null;
  lastDailyChallengeCompleted?: string | null;
  ownedTrailEffectIds?: string[];
  selectedTrailEffectId?: string | null;
  playerStats?: PlayerStats;
  settings?: GameSettings;
  socialData?: SocialData;
  purchaseHistory?: PurchaseRecord[];
  lastPlayedVersion?: string;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalTimePlayed: number;
  averageScore: number;
  bestStreak: number;
  totalCoinsCollected: number;
  totalPowerupsUsed: number;
  totalEnemiesDefeated: number;
  favoriteScene?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastSkillAssessment?: number;
  adaptiveDifficultyRating?: number;
}

export interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  hapticFeedback: boolean;
  particleEffects: 'low' | 'medium' | 'high';
  performanceMode: boolean;
  colorblindMode: boolean;
  reducedMotion: boolean;
  language: string;
  tutorialCompleted: boolean;
  analyticsEnabled: boolean;
}

export interface SocialData {
  friendScores?: Record<string, number>;
  shareCount: number;
  lastSharedScore?: number;
  leaderboardPosition?: number;
  challengesSent: number;
  challengesReceived: number;
  socialMediaConnected?: string[];
}

export interface PurchaseRecord {
  itemId: string;
  price: number;
  currency: string;
  timestamp: number;
  platform: 'ios' | 'android' | 'web';
}

export interface EngineHudData {
  score: number;
  powerGauge: number;
  currentPowerup: PowerUpType | null;
  powerupTime: number;
  difficulty: number;
  perfectRun: boolean;
  combo: number;
  activeDebuff: DebuffEffect | null;
  isZenMode?: boolean;
  currentSpeed?: number;
  enemiesOnScreen?: number;
  fps?: number;
}

export interface TrailParticleConfig {
  type: 'basic_following' | 'sparkle' | 'bubble' | 'rainbow' | 'crystal' | 'fire';
  color?: string;
  emitRate: number;
  particleLife?: number;
  baseParticleSize?: number;
  velocitySpread?: number;
  bubbleRiseSpeed?: number;
  specialEffect?: string;
  adaptToSpeed?: boolean;
}

export interface SkyPeckerTrailEffect {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlockCondition?: string;
  particleConfig: TrailParticleConfig;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  previewColor?: string;
}

export interface GameEngineProps {
  selectedSkyPeckerTypeIndex: number;
  selectedStartPower: PowerUpType | null;
  selectedTrailEffect: SkyPeckerTrailEffect | null;
  isZenMode?: boolean;
  onGameOver: (score: number, coinsCollectedThisRun: number, perfectRun: boolean, isZenMode?: boolean, playerStats?: Partial<PlayerStats>) => void;
  onCoinCollected: (value: number) => void;
  onAchievementProgress: (achievementKey: string, progressIncrement: number) => void;
  onPowerupUsed: (type: PowerUpType) => void;
  toggleGodModeCallback: (isActive: boolean) => void;
  updateHudData: (data: EngineHudData) => void;
  canContinueRun: boolean;
  onContinueRunRequested: () => void;
  onMilestoneReached?: (score: number, coins: number) => void;
  onPauseStateChange: (isPaused: boolean) => void;
  onAdTrigger?: (adType: 'interstitial' | 'rewarded' | 'banner') => void;
  onIAPTrigger?: (itemId: string) => void;
  playerSkillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface GameEngineRef {
  resumeAfterAdContinue: () => void;
  requestResume: () => void;
  requestPause: () => void;
  getGameState: () => GameState;
  triggerScreenshot: () => string | null;
  applyPerformanceMode: (enabled: boolean) => void;
}

export interface GameState {
  currentScore: number;
  currentCoins: number;
  gameTime: number;
  difficulty: number;
  enemiesDefeated: number;
  powerupsUsed: number;
  perfectRun: boolean;
  currentScene: string;
}

export interface GroundElement {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speedFactor: number;
  type: 'car' | 'train' | 'boat';
  variant?: string;
  animationFrame?: number;
}

export interface StaticGroundFeature {
  x: number;
  y: number;
  type: 'blades' | 'tufts' | 'rocks' | 'cactus' | 'flowers' | 'grass' | 'mushrooms' | 'crystals';
  height: number;
  width?: number;
  color: string;
  variant?: string;
  animationPhase?: number;
  weatherAffected?: boolean;
}

export interface LeaderboardEntry {
  rank?: number;
  name: string;
  score: number;
  isPlayer?: boolean;
  avatar?: string;
  country?: string;
  timestamp?: number;
  birdUsed?: string;
  gameMode?: 'normal' | 'zen';
}

export interface PowerUpEffect {
  type: PowerUpType;
  duration: number;
  magnitude: number;
  visualEffect?: string;
  soundEffect?: string;
  stackable?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onTick?: () => void;
}

export interface AdConfig {
  interstitialFrequency: number;
  rewardedCooldown: number;
  bannerRefreshRate: number;
  maxAdsPerSession: number;
  adFreeGracePeriod: number;
}

export interface IAPConfig {
  removeAdsPrice: number;
  coinPackPrices: Record<string, number>;
  premiumBirdPrices: Record<string, number>;
  subscriptionPrice?: number;
}

export interface NotificationData {
  id: string;
  type: 'achievement' | 'milestone' | 'reward' | 'info' | 'warning' | 'social';
  title: string;
  message: string;
  duration?: number;
  priority?: 'low' | 'medium' | 'high';
  actionButton?: string;
  onAction?: () => void;
  icon?: string;
  color?: string;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  particleCount: number;
  drawCalls: number;
  memoryUsage?: number;
  batteryImpact?: 'low' | 'medium' | 'high';
}

export interface InputState {
  isTapping: boolean;
  tapStartTime?: number;
  tapDuration?: number;
  lastTapTime?: number;
  tapStrength?: number;
  multiTouchActive?: boolean;
  gestureType?: 'tap' | 'hold' | 'swipe' | 'pinch';
}

export interface AudioContext {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  currentMusicTrack?: string;
  soundPools: Record<string, HTMLAudioElement[]>;
  spatialAudioEnabled: boolean;
  adaptiveVolumeEnabled: boolean;
}

export interface AnalyticsEvent {
  eventName: string;
  parameters: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  gameVersion: string;
}

export interface UITheme {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  animations: Record<string, number>;
  breakpoints: Record<string, number>;
  spacing: Record<string, number | string>;
  shadows: Record<string, string>;
  gradients: Record<string, string>;
}

export interface ResponsiveConfig {
  mobile: {
    maxWidth: number;
    scaling: number;
    touchTargetSize: number;
  };
  tablet: {
    maxWidth: number;
    scaling: number;
    touchTargetSize: number;
  };
  desktop: {
    minWidth: number;
    scaling: number;
    touchTargetSize: number;
  };
}

export interface LocalizationData {
  [key: string]: {
    [language: string]: string;
  };
}

export interface TutorialStep {
  id: string;
  target?: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'tap' | 'swipe' | 'wait' | 'highlight';
  skippable?: boolean;
  prerequisite?: string;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targetAudience?: string[];
  expiryDate?: Date;
  description?: string;
}

export interface ErrorReport {
  id: string;
  timestamp: number;
  error: Error;
  stackTrace: string;
  gameState: Partial<GameState>;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  reproductionSteps?: string[];
}

export interface BackgroundTaskConfig {
  enabledInBackground: boolean;
  maxBackgroundTime: number;
  backgroundSaveInterval: number;
  pauseAnimations: boolean;
  reducedProcessing: boolean;
}

export interface CloudSaveData {
  lastSyncTime: number;
  syncVersion: number;
  playerProgress: StoredProgress;
  checksum: string;
  conflictResolution?: 'local' | 'remote' | 'merge';
}

export interface MultiplayerConfig {
  enabled: boolean;
  maxPlayers: number;
  matchmakingTimeout: number;
  latencyThreshold: number;
  serverRegions: string[];
  friendChallengeEnabled: boolean;
}

export interface AccessibilityConfig {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  screenReader: boolean;
  voiceOver: boolean;
  subtitles: boolean;
  hapticFeedback: boolean;
}

export interface LiveOpsEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  eventType: 'limited_time_bird' | 'double_coins' | 'special_challenge' | 'themed_content';
  rewards: Array<{
    type: 'coins' | 'bird' | 'trail' | 'achievement';
    value: string | number;
    rarity?: string;
  }>;
  requirements?: Array<{
    type: 'score' | 'games_played' | 'coins_collected';
    value: number;
  }>;
  active: boolean;
  playerParticipated?: boolean;
  progress?: number;
}