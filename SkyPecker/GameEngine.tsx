import React, { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import {
  Bird, Pipe, Coin, Cloud, Particle, TrailParticle, Star, Meteor, Enemy, SceneConfig, PowerUpType, 
  SkyPeckerTypeConfig, EngineHudData, DebuffEffect, DebuffType, EnemyVisualType, GroundElement, 
  StaticGroundFeature, GameEngineProps, GameEngineRef, SkyPeckerTrailEffect, PlayerStats,
  PerformanceMetrics, PowerUpEffect
} from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT, INITIAL_BIRD_R, INITIAL_BIRD_G, INITIAL_BIRD_FLAP_FORCE,
  ENHANCED_SKYPECKER_TYPES, SCENES, PIPE_WIDTH, POWERUP_OPTIONS, ENHANCED_PARTICLE_COLORS, 
  SCENE_TRANSITION_DURATION, SCENE_INTERVAL, COIN_SPAWN_INTERVAL, COIN_SPAWN_CHANCE, MIN_COIN_Y, 
  MAX_COIN_Y, COIN_RADIUS, ENHANCED_ENEMY_TYPES, ENHANCED_DEBUFF_CONFIG, ENEMY_SPAWN_BASE_INTERVAL, 
  ENEMY_SPAWN_DIFFICULTY_FACTOR, INITIAL_DEBUFF_STATE, CAR_COLORS, MAX_GROUND_CARS, CAR_MIN_WIDTH, 
  CAR_MAX_WIDTH, CAR_MIN_HEIGHT, CAR_MAX_HEIGHT, CAR_MIN_SPEED_FACTOR, CAR_MAX_SPEED_FACTOR, 
  STATIC_GROUND_FEATURE_SPREAD, ZEN_MODE_PIPE_GAP_MIN_MULTIPLIER, ZEN_MODE_PIPE_GAP_MAX_MULTIPLIER, 
  ZEN_MODE_PIPE_SPAWN_RATE_MULTIPLIER, MILESTONE_SCORE_INTERVAL, MILESTONE_COIN_REWARD,
  BASE_GAME_SPEED, MAX_GAME_SPEED, SPEED_INCREASE_INTERVAL, SPEED_INCREASE_AMOUNT,
  PERFORMANCE_CONFIG, INTELLIGENT_DIFFICULTY_CONFIG, ZEN_MODE_ENEMY_SPAWN_RATE_MULTIPLIER,
  ENEMY_AI_UPDATE_INTERVAL
} from './constants';
import { Sounds, blendColors, drawSilhouette, manageBackgroundMusic, hexToRgb } from './utils';

const GameEngine = forwardRef<GameEngineRef, GameEngineProps>(({
  selectedSkyPeckerTypeIndex, 
  selectedStartPower,
  selectedTrailEffect,
  isZenMode = false,
  onGameOver,
  onCoinCollected,
  onAchievementProgress,
  onPowerupUsed,
  toggleGodModeCallback,
  updateHudData,
  canContinueRun, 
  onContinueRunRequested,
  onMilestoneReached,
  onPauseStateChange,
  playerSkillLevel = 'beginner'
}, ref) => {
  // Canvas and animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameFrameRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Core game objects
  const birdRef = useRef<Bird | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const weatherParticlesRef = useRef<Particle[]>([]);
  const gameParticlesRef = useRef<Particle[]>([]); 
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const groundElementsRef = useRef<GroundElement[]>([]); 
  const staticGroundFeaturesRef = useRef<StaticGroundFeature[]>([]);

  // Game state
  const scoreRef = useRef<number>(0);
  const powerGaugeRef = useRef<number>(0);
  const currentPowerupRef = useRef<PowerUpType>(null);
  const powerupTimeRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const gameSpeedRef = useRef<number>(BASE_GAME_SPEED);
  const comboRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0);

  // Scene management
  const currentSceneIndexRef = useRef<number>(0);
  const nextSceneIndexRef = useRef<number | null>(null);
  const sceneTransitionProgressRef = useRef<number>(0);

  // Game mechanics state
  const allowFirstCrashRef = useRef<boolean>(true);
  const perfectRunRef = useRef<boolean>(true);
  const screenShakeRef = useRef<number>(0);
  const godModeRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);
  const magnetFieldRef = useRef<boolean>(false);
  const coinsCollectedThisRunRef = useRef<number>(0);
  const activeDebuffRef = useRef<DebuffEffect | null>(INITIAL_DEBUFF_STATE);

  // Enhanced bird abilities
  const canNegateDebuffRef = useRef<boolean>(false);
  const hasRevivedRef = useRef<boolean>(false);
  const lastPhaseAttemptFrameRef = useRef<number>(0);
  const isPhasingRef = useRef<boolean>(false);
  const phaseDurationRef = useRef<number>(0);
  const freezeFieldActiveRef = useRef<boolean>(false);

  // Analytics and progression
  const encounteredWeatherTypesThisRunRef = useRef<Set<string>>(new Set());
  const isWaitingForContinueDecisionRef = useRef<boolean>(false); 
  const timesContinuedThisRunRef = useRef<number>(0); 
  const lastMilestoneScoreAwardedRef = useRef<number>(0);
  const enemiesDefeatedThisRunRef = useRef<number>(0);
  const powerupsUsedThisRunRef = useRef<number>(0);

  // Performance monitoring
  const performanceMetricsRef = useRef<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    drawCalls: 0
  });
  const frameTimesRef = useRef<number[]>([]);
  const performanceModeRef = useRef<boolean>(false);

  // Input handling
  const tapStartTimeRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const COLLISION_FORGIVENESS_FACTOR = 0.85;

  // Enhanced AI system
  const aiUpdateFrameRef = useRef<number>(0);
  const playerBehaviorRef = useRef<{
    averageHeight: number,
    flapFrequency: number,
    riskTolerance: number,
    lastPositions: Array<{x: number, y: number, time: number}>
  }>({
    averageHeight: CANVAS_HEIGHT / 2,
    flapFrequency: 0,
    riskTolerance: 0.5,
    lastPositions: []
  });

  // Implement GameEngine interface
  useImperativeHandle(ref, () => ({
    resumeAfterAdContinue: () => {
      if (birdRef.current) {
        birdRef.current.y = CANVAS_HEIGHT / 3; 
        birdRef.current.v = 0;
        currentPowerupRef.current = 'shield'; 
        powerupTimeRef.current = 180; 
        if (!isZenMode) onPowerupUsed('shield');
        Sounds.powerup();
        isWaitingForContinueDecisionRef.current = false;
        pausedRef.current = false; 
        onPauseStateChange(false);
        timesContinuedThisRunRef.current++; 
        
        if (animationFrameIdRef.current === 0) { 
          animationFrameIdRef.current = requestAnimationFrame(gameLoop);
        }
      }
    },
    requestResume: () => {
      if (pausedRef.current) {
        pausedRef.current = false;
        onPauseStateChange(false);
        if (animationFrameIdRef.current === 0 && !isWaitingForContinueDecisionRef.current) {
           animationFrameIdRef.current = requestAnimationFrame(gameLoop);
        }
      }
    },
    requestPause: () => {
      if (!pausedRef.current && !isWaitingForContinueDecisionRef.current) {
        pausedRef.current = true;
        onPauseStateChange(true);
      }
    },
    getGameState: () => ({
      currentScore: scoreRef.current,
      currentCoins: coinsCollectedThisRunRef.current,
      gameTime: gameFrameRef.current / 60, // Convert frames to seconds
      difficulty: difficultyRef.current,
      enemiesDefeated: enemiesDefeatedThisRunRef.current,
      powerupsUsed: powerupsUsedThisRunRef.current,
      perfectRun: perfectRunRef.current,
      currentScene: SCENES[currentSceneIndexRef.current]?.name || 'Unknown'
    }),
    triggerScreenshot: () => {
      const canvas = canvasRef.current;
      if (canvas) {
        return canvas.toDataURL('image/png');
      }
      return null;
    },
    applyPerformanceMode: (enabled: boolean) => {
      performanceModeRef.current = enabled;
      if (enabled) {
        // Reduce particle limits
        PERFORMANCE_CONFIG.MAX_PARTICLES = 75;
        PERFORMANCE_CONFIG.MAX_ENEMIES_ON_SCREEN = 4;
      } else {
        // Restore normal limits
        PERFORMANCE_CONFIG.MAX_PARTICLES = 150;
        PERFORMANCE_CONFIG.MAX_ENEMIES_ON_SCREEN = 8;
      }
    }
  }));

  // Enhanced scene initialization with intelligent features
  const initSceneSpecificElements = useCallback((scene: SceneConfig, gameMoveSpeed: number) => {
    groundElementsRef.current = [];
    if (scene.groundAnimationType === 'passing_cars' && !isZenMode) {
      const carCount = Math.floor(MAX_GROUND_CARS * (performanceModeRef.current ? 0.5 : 1));
      for (let i = 0; i < carCount; i++) {
        const carWidth = CAR_MIN_WIDTH + Math.random() * (CAR_MAX_WIDTH - CAR_MIN_WIDTH);
        const carHeight = CAR_MIN_HEIGHT + Math.random() * (CAR_MAX_HEIGHT - CAR_MIN_HEIGHT);
        const carVariant = Math.random() > 0.7 ? 'truck' : Math.random() > 0.8 ? 'sports' : 'sedan';
        
        groundElementsRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: CANVAS_HEIGHT - GROUND_HEIGHT + carHeight * 0.4 - (Math.random() > 0.5 ? carHeight * 0.6 : 0),
          width: carWidth,
          height: carHeight,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          speedFactor: (CAR_MIN_SPEED_FACTOR + Math.random() * (CAR_MAX_SPEED_FACTOR - CAR_MIN_SPEED_FACTOR)),
          type: 'car',
          variant: carVariant,
          animationFrame: Math.random() * 60
        });
      }
    }

    staticGroundFeaturesRef.current = [];
    const detailConfig = scene.groundDetailConfig;
    if (detailConfig.type !== 'none' && detailConfig.type !== 'road_markings' && detailConfig.density && detailConfig.density > 0) {
      const featureCount = Math.floor((CANVAS_WIDTH * 1.5) / detailConfig.density * (performanceModeRef.current ? 0.7 : 1)); 
      for (let i = 0; i < featureCount; i++) {
        const baseHeight = detailConfig.heightParameters?.base || 10;
        const varianceHeight = detailConfig.heightParameters?.variance || 5;
        const featureHeight = baseHeight + Math.random() * varianceHeight;
        let featureWidth: number | undefined;
        let variant = 'default';
        
        if (detailConfig.type === 'cactus') {
          featureWidth = 5 + Math.random() * 5;
          variant = Math.random() > 0.7 ? 'barrel' : Math.random() > 0.8 ? 'tall' : 'default';
        }
        if (detailConfig.type === 'rocks') {
          featureWidth = 8 + Math.random() * 12;
          variant = Math.random() > 0.6 ? 'cluster' : 'single';
        }
        if (detailConfig.type === 'flowers') {
          featureWidth = featureHeight;
          variant = Math.random() > 0.5 ? 'rose' : Math.random() > 0.7 ? 'tulip' : 'daisy';
        }

        staticGroundFeaturesRef.current.push({
          x: Math.random() * (CANVAS_WIDTH * 1.5), 
          y: CANVAS_HEIGHT - GROUND_HEIGHT - featureHeight,
          type: detailConfig.type as StaticGroundFeature['type'],
          height: featureHeight,
          width: featureWidth,
          color: detailConfig.color,
          variant,
          animationPhase: Math.random() * Math.PI * 2,
          weatherAffected: scene.weather !== 'clear'
        });
      }
    }
  }, [isZenMode]);

  // Enhanced game reset with skill-based initialization
  const resetGame = useCallback(() => {
    const bType = ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex];
    birdRef.current = {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      r: INITIAL_BIRD_R,
      v: 0,
      g: INITIAL_BIRD_G * (bType.gravityMultiplier || 1),
      flapForce: INITIAL_BIRD_FLAP_FORCE * (bType.flapForceMultiplier || 1),
      typeIndex: selectedSkyPeckerTypeIndex,
      rotation: 0,
      animationFrame: 0,
      trailParticles: [],
      lastFlapTime: 0,
      wingAnimationOffset: Math.random() * Math.PI * 2
    };
    
    // Initialize bird abilities
    canNegateDebuffRef.current = bType.canNegateDebuffOnce || false;
    hasRevivedRef.current = false;
    lastPhaseAttemptFrameRef.current = 0;
    isPhasingRef.current = false;
    phaseDurationRef.current = 0;
    freezeFieldActiveRef.current = bType.freezeEnemiesOnHit || false;
    timesContinuedThisRunRef.current = 0;
    isWaitingForContinueDecisionRef.current = false;
    lastMilestoneScoreAwardedRef.current = 0;
    enemiesDefeatedThisRunRef.current = 0;
    powerupsUsedThisRunRef.current = 0;

    // Reset game objects
    pipesRef.current = [];
    coinsRef.current = [];
    enemiesRef.current = [];
    gameParticlesRef.current = [];
    meteorsRef.current = [];
    
    // Initialize clouds with variety
    cloudsRef.current = [
      { x: 80, y: 60, speed: isZenMode ? 0.15 : 0.3, size: 1.0, opacity: 0.8, cloudType: 'normal' },
      { x: 300, y: 100, speed: isZenMode ? 0.25 : 0.5, size: 1.2, opacity: 0.6, cloudType: 'wispy' },
      { x: 180, y: 80, speed: isZenMode ? 0.2 : 0.4, size: 0.9, opacity: 0.7, cloudType: 'normal' },
      { x: 450, y: 120, speed: isZenMode ? 0.18 : 0.35, size: 1.1, opacity: 0.5, cloudType: 'storm' }
    ];
    weatherParticlesRef.current = [];

    // Reset game state
    scoreRef.current = 0;
    coinsCollectedThisRunRef.current = 0;
    powerGaugeRef.current = 0;
    gameSpeedRef.current = BASE_GAME_SPEED;
    
    // Adaptive difficulty based on player skill
    const skillMultiplier = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2,
      'expert': 1.4
    }[playerSkillLevel] || 1.0;
    
    difficultyRef.current = isZenMode ? 0.5 : (0.8 * skillMultiplier);
    comboRef.current = 0;
    comboTimerRef.current = 0;
    activeDebuffRef.current = null;
    
    // Scene selection with enhanced logic
    if (isZenMode) {
      const zenSceneCandidates = SCENES.filter(s => 
        s.type === 'zen' || s.type === 'volcanic_zen' || s.type === 'blooming_zen'
      );
      if (zenSceneCandidates.length > 0) {
        const randomZenScene = zenSceneCandidates[Math.floor(Math.random() * zenSceneCandidates.length)];
        currentSceneIndexRef.current = SCENES.indexOf(randomZenScene);
      } else {
        currentSceneIndexRef.current = SCENES.findIndex(s => s.type === 'zen') !== -1 ? 
          SCENES.findIndex(s => s.type === 'zen') : 0;
      }
    } else {
      const nonZenScenes = SCENES.filter(s => 
        s.type !== 'zen' && s.type !== 'volcanic_zen' && s.type !== 'blooming_zen'
      );
      const randomNonZenIndex = Math.floor(Math.random() * nonZenScenes.length);
      currentSceneIndexRef.current = SCENES.indexOf(nonZenScenes[randomNonZenIndex]);
    }
    
    nextSceneIndexRef.current = null;
    sceneTransitionProgressRef.current = 0;
    
    // Initialize stars for night scenes
    if (SCENES[currentSceneIndexRef.current].name === 'Night' && !isZenMode) initStars();

    // Reset flags and states
    allowFirstCrashRef.current = true;
    perfectRunRef.current = true;
    screenShakeRef.current = 0;
    pausedRef.current = false;
    onPauseStateChange(false); 
    magnetFieldRef.current = false;

    // Initialize power-ups
    if (!isZenMode) {
      currentPowerupRef.current = selectedStartPower;
      if (selectedStartPower === 'shield') {
        powerupTimeRef.current = 600;
        powerupsUsedThisRunRef.current++;
      } else if (selectedStartPower === 'slow') {
        powerupTimeRef.current = 300;
        powerupsUsedThisRunRef.current++;
      } else {
        powerupTimeRef.current = 0;
      }
      if (selectedStartPower) onPowerupUsed(selectedStartPower);
    } else {
      currentPowerupRef.current = null;
      powerupTimeRef.current = 0;
    }
    
    gameFrameRef.current = 0;
    lastFrameTimeRef.current = performance.now();

    // Reset analytics
    encounteredWeatherTypesThisRunRef.current.clear();
    const initialScene = SCENES[currentSceneIndexRef.current];
    if (!isZenMode) {
      encounteredWeatherTypesThisRunRef.current.add(initialScene.weather);
      onAchievementProgress('weatherWizard', 1); 
    }
    
    // Initialize player behavior tracking
    playerBehaviorRef.current = {
      averageHeight: CANVAS_HEIGHT / 2,
      flapFrequency: 0,
      riskTolerance: 0.5,
      lastPositions: []
    };
    
    // Initialize scene elements
    const moveSpeed = (isZenMode ? 1.5 : gameSpeedRef.current) * (1 + difficultyRef.current * 0.1);
    initSceneSpecificElements(initialScene, moveSpeed);

    // Start background music
    const sceneTypeForMusic = SCENES[currentSceneIndexRef.current].type;
    manageBackgroundMusic(sceneTypeForMusic, 'start');
    
    // Start game loop
    if (animationFrameIdRef.current === 0 && !isWaitingForContinueDecisionRef.current) { 
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }

  }, [
    selectedSkyPeckerTypeIndex, selectedStartPower, onPowerupUsed, onAchievementProgress, 
    isZenMode, onPauseStateChange, playerSkillLevel, initSceneSpecificElements
  ]);

  // Enhanced star initialization
  const initStars = useCallback(() => {
    starsRef.current = [];
    const starCount = performanceModeRef.current ? 25 : 50;
    for (let i = 0; i < starCount; i++) {
      starsRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT * 0.6),
        twinkle: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 2,
        brightness: 0.3 + Math.random() * 0.7,
        color: Math.random() > 0.8 ? '#FFE4B5' : '#FFFFFF'
      });
    }
  }, []);

  // Enhanced power-up system with visual effects
  const spawnPowerup = useCallback(() => {
    if (isZenMode) return; 
    const newPowerup = POWERUP_OPTIONS[Math.floor(Math.random() * POWERUP_OPTIONS.length)];
    if (!newPowerup) return;

    currentPowerupRef.current = newPowerup;
    powerGaugeRef.current = 0; 
    powerupsUsedThisRunRef.current++;

    // Enhanced power-up durations and effects
    const powerupDurations = {
      shield: 600,
      slow: 300, 
      shrink: 400,
      magnet: 350,
      speed: 250
    };

    powerupTimeRef.current = powerupDurations[newPowerup] || 300;
    
    // Add visual effect particles
    if (birdRef.current) {
      const powerupColors = {
        shield: '#00FFFF',
        slow: '#4169E1', 
        shrink: '#FF69B4',
        magnet: '#FFD700',
        speed: '#FF4500'
      };
      
      for (let i = 0; i < 15; i++) {
        gameParticlesRef.current.push({
          x: birdRef.current.x,
          y: birdRef.current.y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 40,
          maxLife: 40,
          color: powerupColors[newPowerup] || '#FFFFFF',
          size: 3 + Math.random() * 4,
          type: 'powerup',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    }
    
    Sounds.powerup();
    onPowerupUsed(newPowerup);
    onAchievementProgress('powerMaster', 1);
  }, [onAchievementProgress, onPowerupUsed, isZenMode]);
// Intelligent enemy AI system
  const updateEnemyAI = useCallback((enemy: Enemy, birdX: number, birdY: number, deltaTime: number) => {
    if (!enemy.aiState) enemy.aiState = 'idle';
    if (!enemy.lastStateChange) enemy.lastStateChange = gameFrameRef.current;
    if (!enemy.specialCooldown) enemy.specialCooldown = 0;
    if (!enemy.animationPhase) enemy.animationPhase = 0;

    enemy.animationPhase += deltaTime * 0.1;
    if (enemy.specialCooldown > 0) enemy.specialCooldown--;

    const distanceToBird = Math.sqrt((birdX - enemy.x) ** 2 + (birdY - enemy.y) ** 2);
    const timeSinceStateChange = gameFrameRef.current - enemy.lastStateChange;
    
    // Get enemy config for AI behavior
    const enemyConfig = ENHANCED_ENEMY_TYPES.find(e => e.visualType === enemy.visualType);
    const aggressionLevel = enemyConfig?.aggressionLevel || 1;
    const aiPattern = enemyConfig?.aiPattern || 'static';

    switch (aiPattern) {
      case 'tracking':
        if (distanceToBird < 150 && enemy.aiState !== 'tracking') {
          enemy.aiState = 'tracking';
          enemy.lastStateChange = gameFrameRef.current;
          enemy.targetY = birdY;
        } else if (distanceToBird > 200 && enemy.aiState === 'tracking') {
          enemy.aiState = 'idle';
          enemy.lastStateChange = gameFrameRef.current;
        }

        if (enemy.aiState === 'tracking') {
          const trackingSpeed = 0.8 + (aggressionLevel * 0.2);
          const yDiff = enemy.targetY! - enemy.y;
          enemy.vy = Math.sign(yDiff) * Math.min(Math.abs(yDiff) * 0.05, trackingSpeed);
          
          // Update target occasionally for more dynamic tracking
          if (timeSinceStateChange % 60 === 0) {
            enemy.targetY = birdY + (Math.random() - 0.5) * 100;
          }
        }
        break;

      case 'ambush':
        if (enemy.aiState === 'idle' && distanceToBird < 200 && enemy.specialCooldown === 0) {
          enemy.aiState = 'charging';
          enemy.lastStateChange = gameFrameRef.current;
          enemy.specialCooldown = 300; // 5 second cooldown
          enemy.targetX = birdX;
          enemy.targetY = birdY;
        }

        if (enemy.aiState === 'charging') {
          const chargeSpeed = 2.0 + (aggressionLevel * 0.5);
          if (timeSinceStateChange < 30) {
            // Brief pause before charge
            enemy.vx *= 0.9;
            enemy.vy *= 0.9;
          } else if (timeSinceStateChange < 90) {
            // Rapid charge toward target
            const xDiff = enemy.targetX! - enemy.x;
            const yDiff = enemy.targetY! - enemy.y;
            const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
            if (distance > 10) {
              enemy.vx = (xDiff / distance) * chargeSpeed;
              enemy.vy = (yDiff / distance) * chargeSpeed;
            }
          } else {
            // Return to normal movement
            enemy.aiState = 'retreating';
            enemy.lastStateChange = gameFrameRef.current;
          }
        }

        if (enemy.aiState === 'retreating') {
          enemy.vx *= 0.95;
          enemy.vy *= 0.95;
          if (timeSinceStateChange > 60) {
            enemy.aiState = 'idle';
            enemy.lastStateChange = gameFrameRef.current;
          }
        }
        break;

      case 'swarm':
        // Find other swarm enemies nearby
        const nearbySwarmEnemies = enemiesRef.current.filter(e => 
          e !== enemy && 
          e.visualType === enemy.visualType &&
          Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2) < 120
        );

        if (nearbySwarmEnemies.length > 0 || distanceToBird < 180) {
          enemy.aiState = 'attacking';
          
          // Swarm coordination - move toward bird but maintain formation
          const swarmCenterX = nearbySwarmEnemies.reduce((sum, e) => sum + e.x, enemy.x) / (nearbySwarmEnemies.length + 1);
          const swarmCenterY = nearbySwarmEnemies.reduce((sum, e) => sum + e.y, enemy.y) / (nearbySwarmEnemies.length + 1);
          
          const formationOffsetX = (enemy.spawnFrame || 0) % 3 * 40 - 40;
          const formationOffsetY = Math.floor((enemy.spawnFrame || 0) / 3) % 3 * 30 - 30;
          
          enemy.targetX = birdX + formationOffsetX;
          enemy.targetY = birdY + formationOffsetY;
          
          const swarmSpeed = 1.2 + (aggressionLevel * 0.3);
          const xDiff = enemy.targetX - enemy.x;
          const yDiff = enemy.targetY - enemy.y;
          const distance = Math.sqrt(xDiff ** 2 + yDiff ** 2);
          
          if (distance > 20) {
            enemy.vx = (xDiff / distance) * swarmSpeed;
            enemy.vy = (yDiff / distance) * swarmSpeed;
          }
        } else {
          enemy.aiState = 'idle';
          enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.02) * 0.5;
        }
        break;

      case 'static':
      default:
        // Basic movement patterns based on enemy type
        if (enemy.visualType === 'GHOST') {
          enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.03) * 0.8;
        } else if (enemy.visualType === 'SPRITE') {
          enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.1) * 1.5;
        } else if (enemy.visualType === 'VORTEX') {
          enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.04) * 1.2;
          enemy.vx += Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.03) * 0.2;
        } else {
          enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.02) * 1.0;
        }
        break;
    }

    // Boundary constraints
    enemy.y = Math.max(enemy.size, Math.min(enemy.y, CANVAS_HEIGHT - GROUND_HEIGHT - enemy.size));
    
    // Add trail particles for certain enemy types
    if ((enemy.visualType === 'PHANTOM' || enemy.visualType === 'NEMESIS') && gameFrameRef.current % 3 === 0) {
      if (!enemy.trailParticles) enemy.trailParticles = [];
      
      const trailColor = enemy.visualType === 'PHANTOM' ? 'rgba(100,100,150,0.4)' : 'rgba(128,0,128,0.6)';
      enemy.trailParticles.push({
        x: enemy.x,
        y: enemy.y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 20,
        maxLife: 20,
        color: trailColor,
        size: enemy.size * 0.3,
        type: 'game'
      });
      
      // Limit trail particles
      if (enemy.trailParticles.length > 8) {
        enemy.trailParticles.shift();
      }
    }
  }, []);

  // Enhanced enemy spawning with intelligent patterns
  const spawnEnemy = useCallback(() => {
    if (isZenMode) return;
    if (enemiesRef.current.length >= PERFORMANCE_CONFIG.MAX_ENEMIES_ON_SCREEN) return;
    
    const availableEnemyTypes = ENHANCED_ENEMY_TYPES.filter(type => 
      difficultyRef.current >= type.spawnDifficultyThreshold
    );
    if (availableEnemyTypes.length === 0) return;

    // Weighted enemy selection based on spawn weights
    const totalWeight = availableEnemyTypes.reduce((sum, type) => sum + (type.spawnWeight || 10), 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedEnemyType = availableEnemyTypes[0];
    
    for (const enemyType of availableEnemyTypes) {
      randomWeight -= (enemyType.spawnWeight || 10);
      if (randomWeight <= 0) {
        selectedEnemyType = enemyType;
        break;
      }
    }

    const enemySpeedMultiplier = selectedEnemyType.baseSpeedMultiplier || 1.0;
    const spawnY = MIN_COIN_Y + Math.random() * (MAX_COIN_Y - MIN_COIN_Y);
    
    // Adaptive spawn positioning based on player behavior
    const playerBehavior = playerBehaviorRef.current;
    let adjustedSpawnY = spawnY;
    
    if (playerBehavior.lastPositions.length > 5) {
      const avgPlayerY = playerBehavior.lastPositions.slice(-5).reduce((sum, pos) => sum + pos.y, 0) / 5;
      // Spawn enemies more likely in player's frequent zones
      if (Math.random() < 0.4) {
        adjustedSpawnY = avgPlayerY + (Math.random() - 0.5) * 150;
        adjustedSpawnY = Math.max(MIN_COIN_Y, Math.min(MAX_COIN_Y, adjustedSpawnY));
      }
    }
    
    const newEnemy: Enemy = {
      x: CANVAS_WIDTH + selectedEnemyType.size,
      y: adjustedSpawnY,
      vx: -1.5 * enemySpeedMultiplier,
      vy: 0,
      size: selectedEnemyType.size,
      visualType: selectedEnemyType.visualType,
      debuffType: selectedEnemyType.debuffType,
      life: 1,
      spawnFrame: gameFrameRef.current,
      aiState: 'idle',
      aggressionLevel: selectedEnemyType.aggressionLevel || 1,
      lastStateChange: gameFrameRef.current,
      specialCooldown: 0,
      animationPhase: Math.random() * Math.PI * 2,
      isElite: Math.random() < 0.1 && difficultyRef.current > 5, // 10% chance for elite enemies at high difficulty
      frozenDuration: 0
    };

    // Elite enemies have enhanced stats
    if (newEnemy.isElite) {
      newEnemy.size *= 1.3;
      newEnemy.aggressionLevel = Math.min(5, (newEnemy.aggressionLevel || 1) + 1);
      newEnemy.vx *= 1.2;
    }
    
    enemiesRef.current.push(newEnemy);
  }, [isZenMode]);

  // Enhanced game over handler
  const performActualGameOver = useCallback(() => {
    const gameStats: Partial<PlayerStats> = {
      totalEnemiesDefeated: enemiesDefeatedThisRunRef.current,
      totalPowerupsUsed: powerupsUsedThisRunRef.current
    };
    
    onGameOver(
      scoreRef.current, 
      coinsCollectedThisRunRef.current, 
      perfectRunRef.current, 
      isZenMode,
      gameStats
    );
  }, [onGameOver, isZenMode]);

  const initiateGameOverSequence = useCallback(() => {
    Sounds.gameOverCrash();
    manageBackgroundMusic('', 'stop');
    pausedRef.current = true; 
    onPauseStateChange(true); 
    
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = 0;
    }
    performActualGameOver();
  }, [performActualGameOver, onPauseStateChange]);

  const handleFatalHitLogic = useCallback(() => {
    if (isWaitingForContinueDecisionRef.current) return;

    if (canContinueRun && timesContinuedThisRunRef.current === 0 && !isZenMode) { 
      isWaitingForContinueDecisionRef.current = true;
      pausedRef.current = true; 
      onPauseStateChange(true); 
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = 0;
      }
      onContinueRunRequested();
    } else {
      initiateGameOverSequence();
    }
  }, [canContinueRun, onContinueRunRequested, initiateGameOverSequence, isZenMode, onPauseStateChange]);
  
  // Enhanced particle system
  const addGameParticles = useCallback((x: number, y: number, color: string, count = 8, particleType: Particle['type'] = 'game', sizeOverride?: number, lifeOverride?: number) => {
    if (gameParticlesRef.current.length > PERFORMANCE_CONFIG.MAX_PARTICLES) return;
    
    const actualCount = performanceModeRef.current ? Math.ceil(count * 0.6) : count;
    for (let i = 0; i < actualCount; i++) {
      gameParticlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: lifeOverride || 60,
        maxLife: lifeOverride || 60,
        color: color,
        size: sizeOverride || (3 + Math.random() * 3),
        type: particleType,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: particleType === 'milestone' ? -0.1 : 0.1,
        bounce: particleType === 'combo'
      });
    }
  }, []);

  // Performance monitoring system
  const updatePerformanceMetrics = useCallback((currentTime: number) => {
    const frameTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;
    
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    const avgFrameTime = frameTimesRef.current.reduce((sum, time) => sum + time, 0) / frameTimesRef.current.length;
    const fps = Math.round(1000 / avgFrameTime);
    
    performanceMetricsRef.current = {
      fps,
      frameTime: avgFrameTime,
      particleCount: gameParticlesRef.current.length + weatherParticlesRef.current.length,
      drawCalls: enemiesRef.current.length + pipesRef.current.length + coinsRef.current.length
    };
    
    // Auto-enable performance mode if FPS drops
    if (fps < PERFORMANCE_CONFIG.PERFORMANCE_MODE_THRESHOLD && !performanceModeRef.current) {
      performanceModeRef.current = true;
      PERFORMANCE_CONFIG.MAX_PARTICLES = 75;
      PERFORMANCE_CONFIG.MAX_ENEMIES_ON_SCREEN = 4;
    } else if (fps > 45 && performanceModeRef.current) {
      performanceModeRef.current = false;
      PERFORMANCE_CONFIG.MAX_PARTICLES = 150;
      PERFORMANCE_CONFIG.MAX_ENEMIES_ON_SCREEN = 8;
    }
  }, []);

  // Enhanced trail particle system
  const updateTrailParticles = useCallback(() => {
    if (!selectedTrailEffect || !birdRef.current || isZenMode) return;
    
    const config = selectedTrailEffect.particleConfig;
    const shouldEmit = gameFrameRef.current % Math.max(1, Math.floor(1 / config.emitRate)) === 0;
    
    if (shouldEmit) {
      const currentSkyPeckerConfig = ENHANCED_SKYPECKER_TYPES[birdRef.current.typeIndex];
      const birdDisplaySize = birdRef.current.r * currentSkyPeckerConfig.size;
      const particleSize = birdDisplaySize * (config.baseParticleSize || 0.5);
      
      let trailColor = config.color;
      if (config.color === 'bird_primary') trailColor = currentSkyPeckerConfig.color;
      else if (config.color === 'bird_stroke') trailColor = currentSkyPeckerConfig.stroke;
      else if (config.color === 'rainbow_cycle') {
        const hue = (gameFrameRef.current * 2) % 360;
        trailColor = `hsl(${hue}, 70%, 60%)`;
      }

      const birdRotation = Math.max(-0.5, Math.min(0.5, birdRef.current.v * 0.05));
      const offsetDistance = birdDisplaySize * 1.2;
      
      let particle: Partial<Particle> = {
        x: birdRef.current.x - offsetDistance * Math.cos(birdRotation), 
        y: birdRef.current.y - offsetDistance * Math.sin(birdRotation),
        life: config.particleLife || 20,
        maxLife: config.particleLife || 20,
        color: trailColor,
        size: particleSize,
        trailConfig: config,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      };

      const currentSpeed = gameSpeedRef.current * (1 + difficultyRef.current * 0.1);
      
      switch (config.type) {
        case 'basic_following':
          particle.type = 'trail_basic';
          particle.vx = -currentSpeed * 0.5; 
          particle.vy = 0;
          break;
        case 'sparkle':
          particle.type = 'trail_sparkle';
          const spread = config.velocitySpread || 1.5;
          particle.vx = (Math.random() - 0.5) * spread - currentSpeed * 0.2;
          particle.vy = (Math.random() - 0.5) * spread;
          break;
        case 'bubble':
          particle.type = 'trail_bubble';
          particle.vx = (Math.random() - 0.5) * (config.velocitySpread || 0.5) - currentSpeed * 0.1;
          particle.vy = config.bubbleRiseSpeed || -0.3;
          break;
        case 'fire':
          particle.type = 'fire_ember';
          particle.vx = (Math.random() - 0.5) * 3 - currentSpeed * 0.3;
          particle.vy = (Math.random() - 0.5) * 2 - 1;
          particle.gravity = -0.05;
          break;
        case 'crystal':
          particle.type = 'ice_crystal';
          particle.vx = (Math.random() - 0.5) * 2 - currentSpeed * 0.4;
          particle.vy = (Math.random() - 0.5) * 2;
          particle.rotationSpeed = (Math.random() - 0.5) * 0.3;
          break;
        case 'rainbow':
          particle.type = 'rainbow_shard';
          particle.vx = (Math.random() - 0.5) * 4 - currentSpeed * 0.3;
          particle.vy = (Math.random() - 0.5) * 4;
          break;
      }
      
      // Apply speed-based trail multiplier
      if (config.adaptToSpeed && currentSpeed > BASE_GAME_SPEED) {
        const speedMultiplier = currentSpeed / BASE_GAME_SPEED;
        particle.vx = (particle.vx || 0) * speedMultiplier;
        particle.life = Math.floor((particle.life || 20) * (1 + speedMultiplier * 0.2));
        particle.maxLife = particle.life;
      }
      
      gameParticlesRef.current.push(particle as Particle);
    }
  }, [selectedTrailEffect, isZenMode]);

  // Player behavior analysis for adaptive AI
  const updatePlayerBehaviorAnalysis = useCallback(() => {
    if (!birdRef.current) return;
    
    const behavior = playerBehaviorRef.current;
    const currentTime = gameFrameRef.current;
    
    // Track recent positions
    behavior.lastPositions.push({
      x: birdRef.current.x,
      y: birdRef.current.y,
      time: currentTime
    });
    
    // Keep only recent positions (last 3 seconds)
    behavior.lastPositions = behavior.lastPositions.filter(pos => 
      currentTime - pos.time < 180
    );
    
    if (behavior.lastPositions.length > 10) {
      // Calculate average height preference
      behavior.averageHeight = behavior.lastPositions.reduce((sum, pos) => sum + pos.y, 0) / behavior.lastPositions.length;
      
      // Calculate risk tolerance based on proximity to pipes
      let riskSum = 0;
      let riskCount = 0;
      
      pipesRef.current.forEach(pipe => {
        const distance = Math.abs(birdRef.current!.x - pipe.x);
        if (distance < 100) {
          const gapCenter = (pipe.gapT + pipe.gapB) / 2;
          const distanceFromCenter = Math.abs(birdRef.current!.y - gapCenter);
          const gapSize = pipe.gapB - pipe.gapT;
          const riskRatio = distanceFromCenter / (gapSize / 2);
          riskSum += riskRatio;
          riskCount++;
        }
      });
      
      if (riskCount > 0) {
        behavior.riskTolerance = riskSum / riskCount;
      }
    }
  }, []);
// Main game loop with enhanced features
  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    // Performance monitoring
    updatePerformanceMetrics(timestamp);

    if (pausedRef.current || isWaitingForContinueDecisionRef.current) {
      if (!isWaitingForContinueDecisionRef.current) { 
         manageBackgroundMusic('', 'stop'); 
      }
      if (animationFrameIdRef.current !== 0 || pausedRef.current || isWaitingForContinueDecisionRef.current) {
         animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }
    
    if (!ctx || !canvas || !birdRef.current) {
      if (animationFrameIdRef.current !== 0) { 
         animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      }
      return;
    }
    
    // Manage background music
    if (!pausedRef.current && SCENES[currentSceneIndexRef.current]) {
      const sceneTypeForMusic = SCENES[currentSceneIndexRef.current].type;
      if(gameFrameRef.current > 0) { 
           manageBackgroundMusic(sceneTypeForMusic, 'start'); 
      }
    }

    gameFrameRef.current++;
    const currentSkyPeckerConfig = ENHANCED_SKYPECKER_TYPES[birdRef.current.typeIndex];

    // Enhanced physics with adaptive difficulty
    const baseG = INITIAL_BIRD_G * (currentSkyPeckerConfig.gravityMultiplier || 1);
    const baseFlapForce = INITIAL_BIRD_FLAP_FORCE * (currentSkyPeckerConfig.flapForceMultiplier || 1);

    // Apply debuff effects
    if (activeDebuffRef.current && !isZenMode) {
      activeDebuffRef.current.duration--;
      const debuff = activeDebuffRef.current;
      
      switch (debuff.type) {
        case 'HEAVY_WINGS':
          birdRef.current.g = baseG * debuff.magnitude;
          break;
        case 'FLAP_FATIGUE':
          birdRef.current.flapForce = baseFlapForce * (1 - debuff.magnitude);
          break;
        case 'VISION_BLUR':
          // Visual effect handled in rendering
          break;
        case 'CONTROLS_INVERT':
          // Handled in input processing
          break;
        case 'SPEED_LOCK':
          gameSpeedRef.current = Math.min(gameSpeedRef.current, BASE_GAME_SPEED * debuff.magnitude);
          break;
        case 'GRAVITY_CHAOS':
          const chaosGravity = baseG * (1 + Math.sin(gameFrameRef.current * 0.1) * debuff.magnitude);
          birdRef.current.g = chaosGravity;
          break;
        case 'POWER_DRAIN':
          // Handled in power gauge filling
          break;
        case 'SCREEN_LURCH':
          // Handled in screen shake
          break;
      }
      
      if (activeDebuffRef.current.duration <= 0) {
        birdRef.current.g = baseG;
        birdRef.current.flapForce = baseFlapForce;
        gameSpeedRef.current = Math.min(gameSpeedRef.current, MAX_GAME_SPEED);
        activeDebuffRef.current = null;
      }
    } else {
      birdRef.current.g = baseG;
      birdRef.current.flapForce = baseFlapForce;
    }

    // Enhanced bird physics and animation
    birdRef.current.v += birdRef.current.g;
    birdRef.current.y += birdRef.current.v * currentSkyPeckerConfig.speed;
    birdRef.current.rotation = Math.max(-0.6, Math.min(0.6, birdRef.current.v * 0.06));
    birdRef.current.animationFrame = (birdRef.current.animationFrame || 0) + 1;
    
    // Handle bird phasing ability
    if (isPhasingRef.current) {
      phaseDurationRef.current--;
      if (phaseDurationRef.current <= 0) {
        isPhasingRef.current = false;
      }
    }

    // Dynamic difficulty and speed scaling
    const difficultyIncreaseInterval = isZenMode ? 800 : 400;
    const maxDifficulty = isZenMode ? 2.0 : 8.0;
    
    if (gameFrameRef.current % difficultyIncreaseInterval === 0 && difficultyRef.current < maxDifficulty) {
      const difficultyIncrease = isZenMode ? 0.05 : 0.12;
      difficultyRef.current = Math.min(difficultyRef.current + difficultyIncrease, maxDifficulty);
    }
    
    // Enhanced speed progression
    if (gameFrameRef.current % SPEED_INCREASE_INTERVAL === 0 && gameSpeedRef.current < MAX_GAME_SPEED) {
      const speedIncrease = isZenMode ? SPEED_INCREASE_AMOUNT * 0.5 : SPEED_INCREASE_AMOUNT;
      gameSpeedRef.current = Math.min(gameSpeedRef.current + speedIncrease, MAX_GAME_SPEED);
    }
    
    const gameSpeedMultiplier = currentPowerupRef.current === 'slow' && !isZenMode ? 0.4 : 
                               currentPowerupRef.current === 'speed' && !isZenMode ? 3.2 : 
                               isZenMode ? 1.3 : gameSpeedRef.current;
    const moveSpeed = gameSpeedMultiplier * (1 + difficultyRef.current * 0.08);
    
    const birdDisplaySize = birdRef.current.r * currentSkyPeckerConfig.size * 
                           (currentPowerupRef.current === 'shrink' && !isZenMode ? 0.6 : 1);
    const birdCollisionRadius = birdDisplaySize * COLLISION_FORGIVENESS_FACTOR;

    // Update trail particles
    updateTrailParticles();
    
    // Update player behavior analysis
    updatePlayerBehaviorAnalysis();

    // Enhanced scene transitions
    if (gameFrameRef.current > 0 && gameFrameRef.current % SCENE_INTERVAL === 0 && !isZenMode) { 
      let newIdx = (currentSceneIndexRef.current + 1) % SCENES.length;
      while(SCENES[newIdx].type === 'zen' || SCENES[newIdx].type === 'volcanic_zen' || SCENES[newIdx].type === 'blooming_zen') { 
        newIdx = (newIdx + 1) % SCENES.length;
      }

      if (newIdx !== currentSceneIndexRef.current) {
        nextSceneIndexRef.current = newIdx;
        sceneTransitionProgressRef.current = 0;
        if (SCENES[newIdx].name === 'Night') initStars();
      }
    }
    
    if (nextSceneIndexRef.current !== null) {
      sceneTransitionProgressRef.current++;
      if (sceneTransitionProgressRef.current >= SCENE_TRANSITION_DURATION) {
        currentSceneIndexRef.current = nextSceneIndexRef.current!; 
        nextSceneIndexRef.current = null;
        sceneTransitionProgressRef.current = 0;

        const newScene = SCENES[currentSceneIndexRef.current];
        if (!isZenMode && !encounteredWeatherTypesThisRunRef.current.has(newScene.weather)) {
          encounteredWeatherTypesThisRunRef.current.add(newScene.weather);
          onAchievementProgress('weatherWizard', 1);
        }
        manageBackgroundMusic(newScene.type, 'changeScene');
        initSceneSpecificElements(newScene, moveSpeed); 
      }
    }
    
    // Enhanced pipe spawning with adaptive difficulty
    const basePipeSpawnRate = isZenMode ? 120 : 95;
    const minPipeSpawnRate = isZenMode ? 100 : 65;
    const maxPipeSpawnRate = isZenMode ? 150 : 130;
    const safeDifficulty = Math.min(Math.max(difficultyRef.current, 1), maxDifficulty);
    let effectivePipeSpawnRate = Math.max(minPipeSpawnRate, Math.min(maxPipeSpawnRate, basePipeSpawnRate - safeDifficulty * 6));
    
    if (isZenMode) {
      effectivePipeSpawnRate *= ZEN_MODE_PIPE_SPAWN_RATE_MULTIPLIER;
    }

    if (currentPowerupRef.current === 'slow' && !isZenMode) {
      effectivePipeSpawnRate = Math.floor(effectivePipeSpawnRate * 1.9); 
    }

    // Pipe generation with enhanced variety
    if (gameFrameRef.current % Math.floor(effectivePipeSpawnRate) === 0) {
      let baseGapMin = isZenMode ? 240 : 210;
      let baseGapMax = isZenMode ? 300 : 270;
      
      if (isZenMode) {
        baseGapMin *= ZEN_MODE_PIPE_GAP_MIN_MULTIPLIER;
        baseGapMax *= ZEN_MODE_PIPE_GAP_MAX_MULTIPLIER;
      }
      
      const difficultyReduction = safeDifficulty * (isZenMode ? 4 : 8); 
      const minGapHeight = Math.max(isZenMode ? 220 : 180, baseGapMin - difficultyReduction); 
      const maxGapH = Math.max(minGapHeight + 40, baseGapMax - difficultyReduction); 
      
      const gapH = minGapHeight + Math.random() * (maxGapH - minGapHeight);
      
      const topMargin = 80;
      const bottomMargin = GROUND_HEIGHT + 40; 
      const availableSpace = CANVAS_HEIGHT - topMargin - bottomMargin - gapH;
      
      let gy = topMargin + Math.random() * Math.max(20, availableSpace);
      
      // Adaptive pipe positioning based on player behavior
      if (playerBehaviorRef.current.lastPositions.length > 5 && Math.random() < 0.3) {
        const avgPlayerY = playerBehaviorRef.current.averageHeight;
        gy = Math.max(topMargin, Math.min(CANVAS_HEIGHT - bottomMargin - gapH, avgPlayerY - gapH/2));
      }
      
      if (availableSpace < 20 || gapH <= 0) { 
        const safeDefaultGap = isZenMode ? 280 : 220;
        gy = topMargin + (CANVAS_HEIGHT - topMargin - bottomMargin - safeDefaultGap) / 2;
        pipesRef.current.push({
          x: CANVAS_WIDTH + PIPE_WIDTH,
          w: PIPE_WIDTH,
          gapT: gy,
          gapB: gy + safeDefaultGap,
          scored: false,
          pipeVariant: Math.random() > 0.8 ? 'metal' : 'standard'
        });
      } else {
        pipesRef.current.push({
          x: CANVAS_WIDTH + PIPE_WIDTH,
          w: PIPE_WIDTH,
          gapT: gy,
          gapB: gy + gapH,
          scored: false,
          pipeVariant: Math.random() > 0.8 ? 'metal' : 'standard'
        });
      }
    }

    // Enhanced coin spawning with variety
    if (gameFrameRef.current % COIN_SPAWN_INTERVAL === 0) {
      if (Math.random() < COIN_SPAWN_CHANCE) {
        const newCoinX = CANVAS_WIDTH + COIN_RADIUS;
        const coinY = MIN_COIN_Y + Math.random() * (MAX_COIN_Y - MIN_COIN_Y);
        
        // Enhanced coin types with different values and behaviors
        const coinTypes = ['bronze', 'silver', 'gold', 'diamond'] as const;
        const coinWeights = [70, 20, 8, 2]; // Probability weights
        let totalWeight = coinWeights.reduce((sum, weight) => sum + weight, 0);
        let randomWeight = Math.random() * totalWeight;
        let coinType: typeof coinTypes[number] = 'bronze';
        
        for (let i = 0; i < coinTypes.length; i++) {
          randomWeight -= coinWeights[i];
          if (randomWeight <= 0) {
            coinType = coinTypes[i];
            break;
          }
        }
        
        const coinValues = { bronze: 1, silver: 3, gold: 5, diamond: 10 };
        const coinSizes = { bronze: COIN_RADIUS, silver: COIN_RADIUS * 1.2, gold: COIN_RADIUS * 1.4, diamond: COIN_RADIUS * 1.6 };
        
        coinsRef.current.push({
          x: newCoinX,
          y: coinY,
          r: coinSizes[coinType],
          collected: false,
          value: coinValues[coinType],
          type: coinType,
          animationFrame: 0,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          bobOffset: Math.random() * Math.PI * 2,
          glowIntensity: coinType === 'diamond' ? 1 : coinType === 'gold' ? 0.7 : coinType === 'silver' ? 0.4 : 0.2
        });
      }
    }
    
    // Enhanced enemy spawning with adaptive patterns
    if (!isZenMode) {
      const baseEnemySpawnRate = ENEMY_SPAWN_BASE_INTERVAL - (difficultyRef.current * ENEMY_SPAWN_DIFFICULTY_FACTOR);
      const clampedEnemySpawnRate = Math.max(120, Math.min(baseEnemySpawnRate, 600));
      
      if (gameFrameRef.current % Math.floor(clampedEnemySpawnRate) === 0) {
        spawnEnemy();
      }
    } else if (gameFrameRef.current % Math.floor(800 * ZEN_MODE_ENEMY_SPAWN_RATE_MULTIPLIER) === 0) {
      // Very rare enemy spawns in zen mode for variety
      if (Math.random() < 0.1) spawnEnemy();
    }

    // Update all game objects with enhanced behaviors
    
    // Update pipes with collision detection
    pipesRef.current = pipesRef.current.filter(pipe => {
      pipe.x -= moveSpeed;
      
      // Enhanced collision detection with forgiveness
      if (!pipe.scored && birdRef.current && birdRef.current.x > pipe.x + pipe.w) {
        pipe.scored = true;
        scoreRef.current++;
        comboRef.current++;
        comboTimerRef.current = 180; // 3 seconds at 60fps
        
        // Milestone rewards
        if (scoreRef.current > 0 && scoreRef.current % MILESTONE_SCORE_INTERVAL === 0 && 
            scoreRef.current > lastMilestoneScoreAwardedRef.current) {
          lastMilestoneScoreAwardedRef.current = scoreRef.current;
          onMilestoneReached(scoreRef.current, MILESTONE_COIN_REWARD);
          addGameParticles(birdRef.current.x, birdRef.current.y, '#FFD700', 12, 'milestone', 4, 80);
        }
        
        // Combo system rewards
        if (comboRef.current >= 5 && comboRef.current % 5 === 0) {
          const bonusCoins = Math.floor(comboRef.current / 5);
          coinsCollectedThisRunRef.current += bonusCoins;
          onCoinCollected(bonusCoins);
          addGameParticles(birdRef.current.x, birdRef.current.y, '#FF6B6B', 8, 'combo', 3, 40);
          Sounds.milestone();
        }
        
        Sounds.point();
      }
      
      // Enhanced pipe collision with phasing ability
      const birdInPipeX = birdRef.current && 
        birdRef.current.x + birdCollisionRadius > pipe.x && 
        birdRef.current.x - birdCollisionRadius < pipe.x + pipe.w;
      
      if (birdInPipeX && birdRef.current && !godModeRef.current && !isPhasingRef.current) {
        const birdInTopPipe = birdRef.current.y - birdCollisionRadius < pipe.gapT;
        const birdInBottomPipe = birdRef.current.y + birdCollisionRadius > pipe.gapB;
        
        if (birdInTopPipe || birdInBottomPipe) {
          // Check for phasing ability
          if (currentSkyPeckerConfig.pipePhaseChance && 
              Math.random() < currentSkyPeckerConfig.pipePhaseChance && 
              gameFrameRef.current - lastPhaseAttemptFrameRef.current > 120) {
            lastPhaseAttemptFrameRef.current = gameFrameRef.current;
            isPhasingRef.current = true;
            phaseDurationRef.current = 60; // 1 second
            addGameParticles(birdRef.current.x, birdRef.current.y, '#9370DB', 15, 'game', 3, 30);
            Sounds.powerup();
          } else {
            perfectRunRef.current = false;
            if (allowFirstCrashRef.current) {
              allowFirstCrashRef.current = false;
              screenShakeRef.current = 20;
              addGameParticles(birdRef.current.x, birdRef.current.y, '#FF4444', 20, 'game');
            } else {
              handleFatalHitLogic();
              return pipe.x > -pipe.w;
            }
          }
        }
      }
      
      return pipe.x > -pipe.w;
    });

    // Update coins with enhanced magnetic attraction
    coinsRef.current = coinsRef.current.filter(coin => {
      coin.x -= moveSpeed;
      coin.animationFrame = (coin.animationFrame || 0) + 1;
      coin.rotation = (coin.rotation || 0) + (coin.rotationSpeed || 0.1);
      
      // Enhanced bob animation based on coin type
      const bobSpeed = coin.type === 'diamond' ? 0.15 : coin.type === 'gold' ? 0.12 : 0.1;
      coin.bobOffset = (coin.bobOffset || 0) + bobSpeed;
      const bobAmount = coin.type === 'diamond' ? 3 : coin.type === 'gold' ? 2 : 1.5;
      coin.y += Math.sin(coin.bobOffset) * bobAmount - Math.sin(coin.bobOffset - bobSpeed) * bobAmount;
      
      // Magnetic attraction
      if (birdRef.current && magnetFieldRef.current && currentPowerupRef.current === 'magnet') {
        const dx = birdRef.current.x - coin.x;
        const dy = birdRef.current.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const magnetRange = 120;
        
        if (distance < magnetRange && distance > 0) {
          const magnetStrength = 0.3 * (1 - distance / magnetRange);
          coin.x += (dx / distance) * magnetStrength * moveSpeed;
          coin.y += (dy / distance) * magnetStrength * moveSpeed;
        }
      }
      
      // Enhanced collision detection
      if (birdRef.current && !coin.collected) {
        const dx = birdRef.current.x - coin.x;
        const dy = birdRef.current.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionRadius = birdCollisionRadius + coin.r;
        
        if (distance < collisionRadius) {
          coin.collected = true;
          coinsCollectedThisRunRef.current += coin.value;
          onCoinCollected(coin.value);
          
          // Enhanced power gauge filling
          const powerGaugeBonus = coin.value * (currentSkyPeckerConfig.powerGaugeMultiplier || 1);
          const debuffReduction = activeDebuffRef.current?.type === 'POWER_DRAIN' ? 0.5 : 1;
          powerGaugeRef.current = Math.min(100, powerGaugeRef.current + (powerGaugeBonus * 2.5 * debuffReduction));
          
          // Spawn power-up when gauge is full
          if (powerGaugeRef.current >= 100 && !isZenMode) {
            spawnPowerup();
          }
          
          // Enhanced particle effects based on coin type
          const particleColors = {
            bronze: '#CD7F32',
            silver: '#C0C0C0', 
            gold: '#FFD700',
            diamond: '#B9F2FF'
          };
          const particleCount = { bronze: 6, silver: 8, gold: 12, diamond: 20 }[coin.type];
          addGameParticles(coin.x, coin.y, particleColors[coin.type], particleCount, 'game', 
            coin.type === 'diamond' ? 4 : 3, coin.type === 'diamond' ? 60 : 40);
          
          Sounds.coin();
          return false;
        }
      }
      
      return coin.x > -coin.r;
    });

    // Enhanced enemy updates with AI system
    if (aiUpdateFrameRef.current % ENEMY_AI_UPDATE_INTERVAL === 0) {
      enemiesRef.current.forEach(enemy => {
        if (birdRef.current) {
          updateEnemyAI(enemy, birdRef.current.x, birdRef.current.y, ENEMY_AI_UPDATE_INTERVAL);
        }
      });
    }
    aiUpdateFrameRef.current++;

    // Update enemies with enhanced behaviors
    enemiesRef.current = enemiesRef.current.filter(enemy => {
      // Apply freeze effect
      if (enemy.frozenDuration && enemy.frozenDuration > 0) {
        enemy.frozenDuration--;
        if (enemy.frozenDuration % 4 < 2) { // Flicker effect
          enemy.vx *= 0.1;
          enemy.vy *= 0.1;
        }
      } else {
        // Normal movement
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
      }
      
      // Update trail particles for certain enemy types
      if (enemy.trailParticles) {
        enemy.trailParticles = enemy.trailParticles.filter(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life--;
          return particle.life > 0;
        });
      }
      
      // Enhanced collision detection with abilities
      if (birdRef.current && !godModeRef.current && !isPhasingRef.current) {
        const dx = birdRef.current.x - enemy.x;
        const dy = birdRef.current.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionRadius = birdCollisionRadius + enemy.size;
        
        if (distance < collisionRadius) {
          // Check if bird can negate debuff
          if (canNegateDebuffRef.current && activeDebuffRef.current === null) {
            canNegateDebuffRef.current = false;
            addGameParticles(birdRef.current.x, birdRef.current.y, '#00FFFF', 12, 'game', 4, 50);
            Sounds.powerup();
            enemiesDefeatedThisRunRef.current++;
            
            // Remove this enemy
            return false;
          }
          
          // Apply freeze field effect
          if (freezeFieldActiveRef.current) {
            enemiesRef.current.forEach(e => {
              if (e !== enemy) {
                e.frozenDuration = 180; // 3 seconds
              }
            });
            freezeFieldActiveRef.current = false;
            addGameParticles(birdRef.current.x, birdRef.current.y, '#87CEEB', 20, 'game', 3, 60);
          }
          
          // Apply debuff effect
          if (enemy.debuffType && !activeDebuffRef.current) {
            const debuffConfig = ENHANCED_DEBUFF_CONFIG[enemy.debuffType];
            if (debuffConfig) {
              activeDebuffRef.current = {
                type: enemy.debuffType,
                duration: debuffConfig.baseDuration,
                magnitude: debuffConfig.magnitude
              };
              
              // Special screen effects for certain debuffs
              if (enemy.debuffType === 'SCREEN_LURCH') {
                screenShakeRef.current = 30;
              }
            }
          }
          
          perfectRunRef.current = false;
          screenShakeRef.current = Math.max(screenShakeRef.current, 15);
          addGameParticles(enemy.x, enemy.y, '#FF6B6B', 15, 'game');
          enemiesDefeatedThisRunRef.current++;
          
          if (allowFirstCrashRef.current) {
            allowFirstCrashRef.current = false;
          } else {
            handleFatalHitLogic();
            return enemy.x > -enemy.size;
          }
          
          return false; // Remove enemy after collision
        }
      }
      
      return enemy.x > -enemy.size;
    });

    // Update all particle systems
    gameParticlesRef.current = gameParticlesRef.current.filter(particle => {
      particle.x += particle.vx || 0;
      particle.y += particle.vy || 0;
      
      if (particle.gravity) {
        particle.vy = (particle.vy || 0) + particle.gravity;
      }
      
      if (particle.bounce && particle.y > CANVAS_HEIGHT - GROUND_HEIGHT - particle.size) {
        particle.y = CANVAS_HEIGHT - GROUND_HEIGHT - particle.size;
        particle.vy = -(particle.vy || 0) * 0.7;
      }
      
      if (particle.rotation !== undefined && particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed;
      }
      
      particle.life--;
      return particle.life > 0;
    });

    // Update weather particles
    const currentScene = SCENES[currentSceneIndexRef.current];
    if (currentScene.weather !== 'clear' && !performanceModeRef.current) {
      const particleSpawnRate = currentScene.weather === 'storm' ? 2 : 
                               currentScene.weather === 'snow' ? 1 : 
                               currentScene.weather === 'ash' ? 1 : 0;
      
      if (gameFrameRef.current % Math.max(1, 3 - particleSpawnRate) === 0) {
        const weatherColors = ENHANCED_PARTICLE_COLORS[currentScene.weather] || ['#FFFFFF'];
        const color = weatherColors[Math.floor(Math.random() * weatherColors.length)];
        
        weatherParticlesRef.current.push({
          x: CANVAS_WIDTH + Math.random() * 50,
          y: Math.random() * CANVAS_HEIGHT * 0.8,
          vx: -moveSpeed * (0.5 + Math.random() * 0.5),
          vy: currentScene.weather === 'snow' ? Math.random() * 2 : 
              currentScene.weather === 'ash' ? -0.5 + Math.random() : 
              Math.random() * 4,
          life: 300 + Math.random() * 200,
          maxLife: 300 + Math.random() * 200,
          color: color,
          size: currentScene.weather === 'storm' ? 2 + Math.random() * 2 : 
                 currentScene.weather === 'snow' ? 3 + Math.random() * 3 : 
                 1 + Math.random() * 2,
          type: 'weather',
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }

    weatherParticlesRef.current = weatherParticlesRef.current.filter(particle => {
      particle.x += particle.vx || 0;
      particle.y += particle.vy || 0;
      particle.life--;
      
      if (particle.rotation !== undefined && particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed;
      }
      
      return particle.life > 0 && particle.x > -20;
    });

    // Update clouds with enhanced movement
    cloudsRef.current.forEach(cloud => {
      cloud.x -= cloud.speed * moveSpeed * 0.3;
      if (cloud.x < -100) {
        cloud.x = CANVAS_WIDTH + 50 + Math.random() * 100;
        cloud.y = 60 + Math.random() * 80;
        cloud.cloudType = Math.random() > 0.7 ? 'storm' : Math.random() > 0.8 ? 'wispy' : 'normal';
      }
    });

    // Update stars for night scenes
    if (SCENES[currentSceneIndexRef.current].name === 'Night') {
      starsRef.current.forEach(star => {
        star.twinkle += 0.05 + Math.random() * 0.05;
        if (star.twinkle > Math.PI * 2) star.twinkle -= Math.PI * 2;
      });
    }

    // Update meteors
    meteorsRef.current = meteorsRef.current.filter(meteor => {
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life--;
      return meteor.life > 0 && meteor.x > -50;
    });

    // Spawn meteors occasionally in space scenes
    if (SCENES[currentSceneIndexRef.current].name === 'Space' && Math.random() < 0.002) {
      meteorsRef.current.push({
        x: CANVAS_WIDTH + 20,
        y: Math.random() * CANVAS_HEIGHT * 0.6,
        vx: -8 - Math.random() * 4,
        vy: 2 + Math.random() * 3,
        life: 120,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#FFE4B5' : '#FFA500',
        tail: []
      });
    }

    // Update ground elements (cars, etc.)
    groundElementsRef.current.forEach(element => {
      if (element.type === 'car') {
        element.x -= moveSpeed * element.speedFactor;
        element.animationFrame = (element.animationFrame || 0) + 0.1;
        
        if (element.x < -element.width - 50) {
          element.x = CANVAS_WIDTH + Math.random() * 200;
          element.color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
          element.variant = Math.random() > 0.7 ? 'truck' : Math.random() > 0.8 ? 'sports' : 'sedan';
        }
      }
    });

    // Update power-up timers
    if (currentPowerupRef.current && powerupTimeRef.current > 0 && !isZenMode) {
      powerupTimeRef.current--;
      
      if (currentPowerupRef.current === 'magnet') {
        magnetFieldRef.current = true;
      }
      
      if (powerupTimeRef.current <= 0) {
        currentPowerupRef.current = null;
        magnetFieldRef.current = false;
      }
    }

    // Update combo timer
    if (comboTimerRef.current > 0) {
      comboTimerRef.current--;
      if (comboTimerRef.current <= 0) {
        comboRef.current = 0;
      }
    }

    // Check ground collision with revival ability
    if (birdRef.current.y > CANVAS_HEIGHT - GROUND_HEIGHT - birdCollisionRadius && !godModeRef.current) {
      if (currentSkyPeckerConfig.reviveOnce && !hasRevivedRef.current) {
        hasRevivedRef.current = true;
        birdRef.current.y = CANVAS_HEIGHT / 3;
        birdRef.current.v = -8;
        currentPowerupRef.current = 'shield';
        powerupTimeRef.current = 300;
        addGameParticles(birdRef.current.x, birdRef.current.y, '#FF4500', 25, 'game', 5, 80);
        Sounds.powerup();
        screenShakeRef.current = 30;
      } else {
        perfectRunRef.current = false;
        handleFatalHitLogic();
      }
    }

    // Update screen shake
    if (screenShakeRef.current > 0) {
      screenShakeRef.current--;
    }

    // Bird boundary constraints
    if (birdRef.current.y < 0) {
      birdRef.current.y = 0;
      birdRef.current.v = Math.max(0, birdRef.current.v);
    }

    // Update HUD data
    updateHudData({
      score: scoreRef.current,
      powerGauge: powerGaugeRef.current,
      currentPowerup: currentPowerupRef.current,
      powerupTime: powerupTimeRef.current,
      difficulty: difficultyRef.current,
      perfectRun: perfectRunRef.current,
      combo: comboRef.current,
      activeDebuff: activeDebuffRef.current,
      isZenMode: isZenMode,
      currentSpeed: gameSpeedMultiplier,
      enemiesOnScreen: enemiesRef.current.length,
      fps: performanceMetricsRef.current.fps
    });

    // ============ RENDERING SECTION ============
    
    // Clear canvas with scene-appropriate background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    

    const nextScene = nextSceneIndexRef.current !== null ? SCENES[nextSceneIndexRef.current] : null;
    const transitionProgress = sceneTransitionProgressRef.current / SCENE_TRANSITION_DURATION;
    
    // Enhanced background rendering with transitions
    if (nextScene && transitionProgress > 0) {
      // Transition between scenes
      const currentColor = hexToRgb(currentScene.skyGradient.top);
      const nextColor = hexToRgb(nextScene.skyGradient.top);
      const blendedTopColor = blendColors(currentColor, nextColor, transitionProgress);
      
      const currentBottomColor = hexToRgb(currentScene.skyGradient.bottom);
      const nextBottomColor = hexToRgb(nextScene.skyGradient.bottom);
      const blendedBottomColor = blendColors(currentBottomColor, nextBottomColor, transitionProgress);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, `rgb(${blendedTopColor.r},${blendedTopColor.g},${blendedTopColor.b})`);
      gradient.addColorStop(1, `rgb(${blendedBottomColor.r},${blendedBottomColor.g},${blendedBottomColor.b})`);
      ctx.fillStyle = gradient;
    } else {
      // Normal scene background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, currentScene.skyGradient.top);
      gradient.addColorStop(1, currentScene.skyGradient.bottom);
      ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply screen shake
    if (screenShakeRef.current > 0) {
      const shakeIntensity = screenShakeRef.current * 0.5;
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity
      );
    }

    // Apply debuff visual effects
    if (activeDebuffRef.current && !isZenMode) {
      const debuff = activeDebuffRef.current;
      
      if (debuff.type === 'VISION_BLUR') {
        ctx.save();
        ctx.filter = `blur(${debuff.magnitude * 2}px)`;
      }
      
      if (debuff.type === 'SCREEN_LURCH') {
        ctx.save();
        const lurchAmount = Math.sin(gameFrameRef.current * 0.2) * debuff.magnitude * 10;
        ctx.translate(lurchAmount, lurchAmount * 0.5);
      }
    }

    // Render stars for night scenes
    if (SCENES[currentSceneIndexRef.current].name === 'Night') {
      starsRef.current.forEach(star => {
        const twinkleAlpha = (Math.sin(star.twinkle) + 1) * 0.5;
        ctx.globalAlpha = star.brightness * twinkleAlpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // Render meteors
    meteorsRef.current.forEach(meteor => {
      // Meteor trail
      ctx.strokeStyle = meteor.color;
      ctx.lineWidth = meteor.size;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(meteor.x - meteor.vx * 3, meteor.y - meteor.vy * 3);
      ctx.stroke();
      
      // Meteor head
      ctx.globalAlpha = 1;
      ctx.fillStyle = meteor.color;
      ctx.beginPath();
      ctx.arc(meteor.x, meteor.y, meteor.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render clouds with enhanced variety
    cloudsRef.current.forEach(cloud => {
      ctx.globalAlpha = cloud.opacity;
      
      const cloudColor = cloud.cloudType === 'storm' ? '#4A5568' : 
                        cloud.cloudType === 'wispy' ? '#E2E8F0' : '#F7FAFC';
      
      ctx.fillStyle = cloudColor;
      
      // Enhanced cloud shapes
      const cloudSize = 30 * cloud.size;
      ctx.beginPath();
      
      if (cloud.cloudType === 'wispy') {
        // Elongated wispy clouds
        ctx.ellipse(cloud.x, cloud.y, cloudSize * 1.5, cloudSize * 0.6, 0, 0, Math.PI * 2);
        ctx.ellipse(cloud.x + cloudSize * 0.5, cloud.y, cloudSize * 1.2, cloudSize * 0.4, 0, 0, Math.PI * 2);
      } else {
        // Standard puffy clouds
        ctx.arc(cloud.x, cloud.y, cloudSize, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloudSize * 0.5, cloud.y, cloudSize * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloudSize * 0.3, cloud.y, cloudSize * 0.6, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloudSize * 0.2, cloud.y - cloudSize * 0.4, cloudSize * 0.7, 0, Math.PI * 2);
      }
      
      ctx.fill();
      
      // Storm cloud lightning effect
      if (cloud.cloudType === 'storm' && Math.random() < 0.005) {
        ctx.strokeStyle = '#FFE135';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(cloud.x, cloud.y + cloudSize);
        ctx.lineTo(cloud.x + (Math.random() - 0.5) * 20, cloud.y + cloudSize + 30);
        ctx.lineTo(cloud.x + (Math.random() - 0.5) * 30, cloud.y + cloudSize + 60);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;

    // Render weather particles
    weatherParticlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      if (currentScene.weather === 'snow') {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentScene.weather === 'storm') {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation || 0);
        ctx.fillRect(-particle.size/2, -particle.size/4, particle.size, particle.size/2);
        ctx.restore();
      } else {
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size * 2);
      }
    });
    ctx.globalAlpha = 1;

    // Render ground with enhanced details
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, currentScene.groundColor);
    groundGradient.addColorStop(1, currentScene.groundShadowColor || currentScene.groundColor);
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

    // Render ground detail markings
    if (currentScene.groundDetailConfig.type === 'road_markings' && !isZenMode) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT + 25);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT + 25);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Render static ground features
    staticGroundFeaturesRef.current.forEach(feature => {
      feature.x -= moveSpeed * 0.3; // Move slower than other elements
      
      ctx.save();
      ctx.translate(feature.x + (feature.width || 0) / 2, feature.y + feature.height / 2);
      
      // Weather effects on features
      if (feature.weatherAffected && currentScene.weather === 'storm') {
        const sway = Math.sin(gameFrameRef.current * 0.1 + feature.animationPhase) * 2;
        ctx.rotate(sway * 0.02);
      }
      
      const featureColor = feature.color || currentScene.groundDetailConfig.color || '#228B22';
      ctx.fillStyle = featureColor;
      
      switch (feature.type) {
        case 'cactus':
          // Draw cactus based on variant
          if (feature.variant === 'barrel') {
            ctx.fillRect(-feature.width! / 2, -feature.height / 2, feature.width!, feature.height);
            // Add spines
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(Math.cos(angle) * feature.width! / 3, Math.sin(angle) * feature.height / 3);
              ctx.lineTo(Math.cos(angle) * feature.width! / 2, Math.sin(angle) * feature.height / 2);
              ctx.stroke();
            }
          } else if (feature.variant === 'tall') {
            ctx.fillRect(-feature.width! / 4, -feature.height / 2, feature.width! / 2, feature.height);
            // Add arms
            ctx.fillRect(-feature.width! / 2, -feature.height / 4, feature.width! / 4, feature.height / 6);
            ctx.fillRect(feature.width! / 4, -feature.height / 3, feature.width! / 4, feature.height / 6);
          } else {
            ctx.fillRect(-feature.width! / 3, -feature.height / 2, feature.width! * 2 / 3, feature.height);
          }
          break;
          
        case 'rocks':
          ctx.fillStyle = '#696969';
          if (feature.variant === 'cluster') {
            for (let i = 0; i < 3; i++) {
              const rockSize = feature.height / (2 + i);
              const offsetX = (i - 1) * feature.width! / 4;
              const offsetY = (i % 2) * rockSize / 3;
              ctx.beginPath();
              ctx.arc(offsetX, offsetY, rockSize / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, feature.height / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'flowers':
          // Draw stem
          ctx.fillStyle = '#228B22';
          ctx.fillRect(-1, -feature.height / 2, 2, feature.height);
          
          // Draw flower based on variant
          const flowerSize = feature.height / 3;
          if (feature.variant === 'rose') {
            ctx.fillStyle = '#FF1493';
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * flowerSize / 3, Math.sin(angle) * flowerSize / 3 - feature.height / 3, 
                      flowerSize / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (feature.variant === 'tulip') {
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.ellipse(0, -feature.height / 3, flowerSize / 2, flowerSize, 0, 0, Math.PI * 2);
            ctx.fill();
          } else { // daisy
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              ctx.beginPath();
              ctx.ellipse(Math.cos(angle) * flowerSize / 2, Math.sin(angle) * flowerSize / 2 - feature.height / 3, 
                         flowerSize / 4, flowerSize / 8, angle, 0, Math.PI * 2);
              ctx.fill();
            }
            // Center
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, -feature.height / 3, flowerSize / 4, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'grass':
          ctx.strokeStyle = featureColor;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          for (let i = 0; i < 5; i++) {
            const grassX = (i - 2) * 3;
            const grassHeight = feature.height * (0.7 + Math.random() * 0.3);
            const sway = Math.sin(gameFrameRef.current * 0.05 + i) * 2;
            ctx.beginPath();
            ctx.moveTo(grassX, feature.height / 2);
            ctx.lineTo(grassX + sway, -grassHeight / 2);
            ctx.stroke();
          }
          break;
      }
      
      ctx.restore();
      
      // Reset feature position if it's moved off screen
      if (feature.x < -100) {
        feature.x = CANVAS_WIDTH + Math.random() * 200;
      }
    });

    // Render moving ground elements (cars)
    groundElementsRef.current.forEach(element => {
      if (element.type === 'car') {
        ctx.save();
        ctx.translate(element.x + element.width / 2, element.y);
        
        // Car body based on variant
        ctx.fillStyle = element.color;
        
        if (element.variant === 'truck') {
          // Truck cab
          ctx.fillRect(-element.width / 2, -element.height, element.width * 0.4, element.height);
          // Truck bed
          ctx.fillRect(-element.width / 2 + element.width * 0.4, -element.height * 0.7, 
                      element.width * 0.6, element.height * 0.7);
        } else if (element.variant === 'sports') {
          // Low sports car profile
          ctx.fillRect(-element.width / 2, -element.height * 0.6, element.width, element.height * 0.6);
          // Windshield
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(-element.width / 4, -element.height * 0.9, element.width / 2, element.height * 0.3);
        } else { // sedan
          // Main body
          ctx.fillRect(-element.width / 2, -element.height * 0.7, element.width, element.height * 0.7);
          // Roof
          ctx.fillRect(-element.width / 3, -element.height, element.width * 2 / 3, element.height * 0.4);
        }
        
        // Wheels
        ctx.fillStyle = '#2F2F2F';
        const wheelRadius = element.height * 0.15;
        const wheelY = -wheelRadius / 2;
        ctx.beginPath();
        ctx.arc(-element.width / 3, wheelY, wheelRadius, 0, Math.PI * 2);
        ctx.arc(element.width / 3, wheelY, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Wheel rotation animation
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        const rotation = element.animationFrame || 0;
        [-element.width / 3, element.width / 3].forEach(wheelX => {
          ctx.save();
          ctx.translate(wheelX, wheelY);
          ctx.rotate(rotation);
          ctx.beginPath();
          ctx.moveTo(-wheelRadius * 0.7, 0);
          ctx.lineTo(wheelRadius * 0.7, 0);
          ctx.moveTo(0, -wheelRadius * 0.7);
          ctx.lineTo(0, wheelRadius * 0.7);
          ctx.stroke();
          ctx.restore();
        });
        
        ctx.restore();
      }
    });

    // Render pipes with enhanced variety
    pipesRef.current.forEach(pipe => {
      const pipeColor = pipe.pipeVariant === 'metal' ? '#C0C0C0' : '#32CD32';
      const pipeShadowColor = pipe.pipeVariant === 'metal' ? '#A0A0A0' : '#228B22';
      
      // Pipe shadows for depth
      ctx.fillStyle = pipeShadowColor;
      ctx.fillRect(pipe.x + 3, 0, pipe.w, pipe.gapT);
      ctx.fillRect(pipe.x + 3, pipe.gapB, pipe.w, CANVAS_HEIGHT - pipe.gapB);
      
      // Main pipes
      ctx.fillStyle = pipeColor;
      ctx.fillRect(pipe.x, 0, pipe.w, pipe.gapT);
      ctx.fillRect(pipe.x, pipe.gapB, pipe.w, CANVAS_HEIGHT - pipe.gapB);
      
      // Pipe caps/rims
      const rimColor = pipe.pipeVariant === 'metal' ? '#E0E0E0' : '#90EE90';
      ctx.fillStyle = rimColor;
      const rimHeight = 15;
      ctx.fillRect(pipe.x - 5, pipe.gapT - rimHeight, pipe.w + 10, rimHeight);
      ctx.fillRect(pipe.x - 5, pipe.gapB, pipe.w + 10, rimHeight);
      
      // Pipe texture details
      if (pipe.pipeVariant === 'metal') {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const lineY = pipe.gapT / 4 * (i + 1);
          ctx.beginPath();
          ctx.moveTo(pipe.x, lineY);
          ctx.lineTo(pipe.x + pipe.w, lineY);
          ctx.stroke();
          
          const bottomLineY = pipe.gapB + (CANVAS_HEIGHT - pipe.gapB) / 4 * (i + 1);
          ctx.beginPath();
          ctx.moveTo(pipe.x, bottomLineY);
          ctx.lineTo(pipe.x + pipe.w, bottomLineY);
          ctx.stroke();
        }
      }
    });

    // Render coins with enhanced animations and effects
    coinsRef.current.forEach(coin => {
      if (coin.collected) return;
      
      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.rotate(coin.rotation || 0);
      
      // Coin glow effect for special coins
      if (coin.glowIntensity && coin.glowIntensity > 0) {
        const glowRadius = coin.r * (2 + Math.sin(coin.animationFrame * 0.1) * 0.5);
        const glowGradient = ctx.createRadialGradient(0, 0, coin.r, 0, 0, glowRadius);
        
        const glowColors = {
          bronze: 'rgba(205, 127, 50, 0.3)',
          silver: 'rgba(192, 192, 192, 0.4)',
          gold: 'rgba(255, 215, 0, 0.5)',
          diamond: 'rgba(185, 242, 255, 0.6)'
        };
        
        glowGradient.addColorStop(0, glowColors[coin.type || 'bronze']);
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Coin body
      const coinColors = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        diamond: '#B9F2FF'
      };
      
      const coinShadowColors = {
        bronze: '#8B5A2B',
        silver: '#A0A0A0',
        gold: '#DAA520',
        diamond: '#87CEEB'
      };
      
      // Coin shadow
      ctx.fillStyle = coinShadowColors[coin.type || 'bronze'];
      ctx.beginPath();
      ctx.arc(2, 2, coin.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Main coin
      ctx.fillStyle = coinColors[coin.type || 'bronze'];
      ctx.beginPath();
      ctx.arc(0, 0, coin.r, 0, Math.PI * 2);
      ctx.fill();
      
      // Coin inner details
      ctx.strokeStyle = coinShadowColors[coin.type || 'bronze'];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, coin.r * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      
      // Special coin markings
      if (coin.type === 'diamond') {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${coin.r}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♦', 0, 0);
      } else if (coin.type === 'gold') {
        ctx.fillStyle = '#FFE135';
        ctx.font = `${coin.r * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
      }
      
      ctx.restore();
    });

    // Render enemies with enhanced AI-driven animations
    enemiesRef.current.forEach(enemy => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      
      // Elite enemy glow
      if (enemy.isElite) {
        const eliteGlow = ctx.createRadialGradient(0, 0, enemy.size, 0, 0, enemy.size * 2);
        eliteGlow.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        eliteGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = eliteGlow;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Frozen effect
      if (enemy.frozenDuration && enemy.frozenDuration > 0) {
        const iceGlow = ctx.createRadialGradient(0, 0, enemy.size * 0.5, 0, 0, enemy.size * 1.2);
        iceGlow.addColorStop(0, 'rgba(135, 206, 235, 0.6)');
        iceGlow.addColorStop(1, 'rgba(135, 206, 235, 0)');
        ctx.fillStyle = iceGlow;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Enemy visualization based on type
      const enemyConfig = ENHANCED_ENEMY_TYPES.find(e => e.visualType === enemy.visualType);
      const enemyColor = enemyConfig?.color || '#FF6B6B';
      
      ctx.rotate(enemy.animationPhase || 0);
      
      switch (enemy.visualType) {
        case 'SPIKEBALL':
          // Spiky ball with animated spikes
          ctx.fillStyle = enemyColor;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Animated spikes
          ctx.strokeStyle = '#8B0000';
          ctx.lineWidth = 2;
          const spikeCount = 8;
          for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2;
            const spikeLength = enemy.size * (0.5 + Math.sin(gameFrameRef.current * 0.1 + i) * 0.2);
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * enemy.size, Math.sin(angle) * enemy.size);
            ctx.lineTo(Math.cos(angle) * (enemy.size + spikeLength), Math.sin(angle) * (enemy.size + spikeLength));
            ctx.stroke();
          }
          break;
          
        case 'GHOST':
          // Translucent ghost with wispy trail
          ctx.globalAlpha = 0.7 + Math.sin(gameFrameRef.current * 0.1) * 0.2;
          ctx.fillStyle = enemyColor;
          
          // Ghost body (oval)
          ctx.beginPath();
          ctx.ellipse(0, 0, enemy.size, enemy.size * 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Ghost tail (wavy bottom)
          const waveCount = 4;
          ctx.beginPath();
          ctx.moveTo(-enemy.size, enemy.size * 0.5);
          for (let i = 0; i <= waveCount; i++) {
            const x = (-enemy.size) + (i / waveCount) * (enemy.size * 2);
            const y = enemy.size * 0.5 + Math.sin(gameFrameRef.current * 0.15 + i) * enemy.size * 0.3;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(enemy.size, enemy.size * 0.5);
          ctx.fill();
          
          // Ghost eyes
          ctx.globalAlpha = 1;
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(-enemy.size * 0.3, -enemy.size * 0.3, enemy.size * 0.15, 0, Math.PI * 2);
          ctx.arc(enemy.size * 0.3, -enemy.size * 0.3, enemy.size * 0.15, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'SPRITE':
          // Magical sprite with sparkle effects
          ctx.fillStyle = enemyColor;
          
          // Sprite body (diamond shape)
          ctx.beginPath();
          ctx.moveTo(0, -enemy.size);
          ctx.lineTo(enemy.size * 0.7, 0);
          ctx.lineTo(0, enemy.size);
          ctx.lineTo(-enemy.size * 0.7, 0);
          ctx.closePath();
          ctx.fill();
          
          // Wings
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = '#E6E6FA';
          const wingFlap = Math.sin(gameFrameRef.current * 0.3) * 0.3;
          
          // Left wing
          ctx.save();
          ctx.rotate(wingFlap);
          ctx.beginPath();
          ctx.ellipse(-enemy.size * 0.5, 0, enemy.size * 0.4, enemy.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Right wing
          ctx.save();
          ctx.rotate(-wingFlap);
          ctx.beginPath();
          ctx.ellipse(enemy.size * 0.5, 0, enemy.size * 0.4, enemy.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          ctx.globalAlpha = 1;
          
          // Sparkle effects
          if (gameFrameRef.current % 15 === 0) {
            for (let i = 0; i < 3; i++) {
              const sparkleX = (Math.random() - 0.5) * enemy.size * 2;
              const sparkleY = (Math.random() - 0.5) * enemy.size * 2;
              
              ctx.fillStyle = '#FFD700';
              ctx.save();
              ctx.translate(sparkleX, sparkleY);
              ctx.rotate(Math.random() * Math.PI);
              ctx.fillRect(-2, -0.5, 4, 1);
              ctx.fillRect(-0.5, -2, 1, 4);
              ctx.restore();
            }
          }
          break;
          
        case 'VORTEX':
          // Spinning vortex enemy
          const vortexSpeed = 0.2;
          ctx.strokeStyle = enemyColor;
          ctx.lineWidth = 3;
          
          // Spiral pattern
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const spiralTurns = 3;
            const points = 30;
            
            for (let j = 0; j <= points; j++) {
              const t = j / points;
              const angle = t * spiralTurns * Math.PI * 2 + gameFrameRef.current * vortexSpeed + i * Math.PI * 2 / 3;
              const radius = enemy.size * t;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              if (j === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.stroke();
          }
          
          // Central core
          ctx.fillStyle = enemyColor;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.size * 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        default:
          // Default enemy rendering
          ctx.fillStyle = enemyColor;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
      }
      
      ctx.restore();
      
      // Render enemy trail particles
      if (enemy.trailParticles) {
        enemy.trailParticles.forEach(particle => {
          const alpha = particle.life / particle.maxLife;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
    });

    // Render bird with enhanced animations and abilities
    if (birdRef.current) {
      ctx.save();
      ctx.translate(birdRef.current.x, birdRef.current.y);
      ctx.rotate(birdRef.current.rotation);
      
      // Power-up visual effects
      if (currentPowerupRef.current && !isZenMode) {
        const powerupGlows = {
          shield: 'rgba(0, 255, 255, 0.3)',
          slow: 'rgba(65, 105, 225, 0.3)',
          shrink: 'rgba(255, 105, 180, 0.3)',
          magnet: 'rgba(255, 215, 0, 0.4)',
          speed: 'rgba(255, 69, 0, 0.4)'
        };
        
        const glowColor = powerupGlows[currentPowerupRef.current];
        if (glowColor) {
          const glowRadius = birdDisplaySize * (currentPowerupRef.current === 'shrink' ? 2 : 1.5);
          const powerupGlow = ctx.createRadialGradient(0, 0, birdDisplaySize, 0, 0, glowRadius);
          powerupGlow.addColorStop(0, glowColor);
          powerupGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = powerupGlow;
          ctx.beginPath();
          ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Phasing effect
      if (isPhasingRef.current) {
        ctx.globalAlpha = 0.5 + Math.sin(gameFrameRef.current * 0.5) * 0.3;
      }
      
      // Enhanced bird rendering with type-specific features
      const birdConfig = ENHANCED_SKYPECKER_TYPES[birdRef.current.typeIndex];
      const wingFlap = Math.sin((birdRef.current.animationFrame || 0) * 0.3 + (birdRef.current.wingAnimationOffset || 0)) * 0.4;
      
      // Bird body
      ctx.fillStyle = birdConfig.color;
      ctx.beginPath();
      
      // Different body shapes based on bird type
      switch (birdConfig.birdType) {
        case 'sparrow':
          ctx.ellipse(0, 0, birdDisplaySize * 0.9, birdDisplaySize * 1.1, 0, 0, Math.PI * 2);
          break;
        case 'eagle':
          ctx.ellipse(0, 0, birdDisplaySize * 1.2, birdDisplaySize * 0.9, 0, 0, Math.PI * 2);
          break;
        case 'owl':
          ctx.arc(0, 0, birdDisplaySize, 0, Math.PI * 2);
          break;
        case 'phoenix':
          ctx.ellipse(0, 0, birdDisplaySize * 1.1, birdDisplaySize * 1.1, 0, 0, Math.PI * 2);
          break;
        case 'falcon':
          ctx.ellipse(0, 0, birdDisplaySize * 0.8, birdDisplaySize * 1.2, 0, 0, Math.PI * 2);
          break;
        default: // robin
          ctx.ellipse(0, 0, birdDisplaySize, birdDisplaySize * 1.05, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      
      // Bird outline
      ctx.strokeStyle = birdConfig.stroke;
      ctx.lineWidth = Math.max(1.5, birdDisplaySize * 0.08);
      ctx.stroke();
      
      // Wings with animation
      ctx.fillStyle = birdConfig.stroke;
      ctx.save();
      ctx.translate(-birdDisplaySize * 0.3, birdDisplaySize * 0.1);
      ctx.rotate(wingFlap);
      
      switch (birdConfig.birdType) {
        case 'eagle':
          ctx.beginPath();
          ctx.ellipse(0, 0, birdDisplaySize * 0.8, birdDisplaySize * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'sparrow':
          ctx.beginPath();
          ctx.ellipse(0, 0, birdDisplaySize * 0.5, birdDisplaySize * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'phoenix':
          // Flame-like wing
          ctx.fillStyle = '#FF6600';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-birdDisplaySize * 0.4, -birdDisplaySize * 0.2, -birdDisplaySize * 0.6, -birdDisplaySize * 0.1);
          ctx.quadraticCurveTo(-birdDisplaySize * 0.8, birdDisplaySize * 0.1, -birdDisplaySize * 0.4, birdDisplaySize * 0.3);
          ctx.quadraticCurveTo(-birdDisplaySize * 0.2, birdDisplaySize * 0.1, 0, 0);
          ctx.fill();
          break;
        case 'owl':
          ctx.beginPath();
          ctx.ellipse(0, 0, birdDisplaySize * 0.6, birdDisplaySize * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          ctx.beginPath();
          ctx.ellipse(0, 0, birdDisplaySize * 0.6, birdDisplaySize * 0.35, Math.PI / 7, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.restore();
      
      // Eyes based on bird type
      const eyeSize = birdDisplaySize / 3;
      const eyeX = birdDisplaySize / 2.8;
      const eyeY = -birdDisplaySize / 3.5;
      
      if (birdConfig.birdType === 'owl') {
        // Large owl eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX - birdDisplaySize * 0.1, eyeY, eyeSize * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + birdDisplaySize * 0.1, eyeY, eyeSize * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX - birdDisplaySize * 0.1, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + birdDisplaySize * 0.1, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX + eyeSize / 5, eyeY + eyeSize / 10, eyeSize * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Beak based on bird type
      ctx.fillStyle = birdConfig.birdType === 'eagle' ? '#8B4513' : '#FDBA74';
      ctx.beginPath();
      
      switch (birdConfig.birdType) {
        case 'eagle':
          // Hooked eagle beak
          ctx.moveTo(birdDisplaySize * 0.8, -birdDisplaySize * 0.05);
          ctx.quadraticCurveTo(birdDisplaySize * 1.3, -birdDisplaySize * 0.1, birdDisplaySize * 1.2, birdDisplaySize * 0.1);
          ctx.quadraticCurveTo(birdDisplaySize * 1.1, birdDisplaySize * 0.15, birdDisplaySize * 0.8, birdDisplaySize * 0.05);
          break;
        case 'sparrow':
          // Small pointed beak
          ctx.moveTo(birdDisplaySize * 0.7, -birdDisplaySize * 0.05);
          ctx.lineTo(birdDisplaySize * 1.1, 0);
          ctx.lineTo(birdDisplaySize * 0.7, birdDisplaySize * 0.05);
          break;
        case 'owl':
          // Curved owl beak
          ctx.moveTo(birdDisplaySize * 0.6, -birdDisplaySize * 0.1);
          ctx.quadraticCurveTo(birdDisplaySize * 0.9, -birdDisplaySize * 0.05, birdDisplaySize * 0.8, birdDisplaySize * 0.1);
          ctx.quadraticCurveTo(birdDisplaySize * 0.7, birdDisplaySize * 0.05, birdDisplaySize * 0.6, -birdDisplaySize * 0.1);
          break;
        default:
          // Standard triangular beak
          ctx.moveTo(birdDisplaySize * 0.8, -birdDisplaySize * 0.1);
          ctx.lineTo(birdDisplaySize * 1.25, 0);
          ctx.lineTo(birdDisplaySize * 0.8, birdDisplaySize * 0.1);
      }
      ctx.closePath();
      ctx.fill();
      
      // Special effects for legendary birds
      if (birdConfig.birdType === 'phoenix' && Math.random() < 0.1) {
        // Phoenix aura
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(gameFrameRef.current * 0.1) * 0.2;
        const auraGrad = ctx.createRadialGradient(0, 0, birdDisplaySize * 0.5, 0, 0, birdDisplaySize * 1.5);
        auraGrad.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        auraGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, birdDisplaySize * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Render all particles with enhanced effects
    gameParticlesRef.current.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      ctx.save();
      ctx.translate(particle.x, particle.y);
      
      if (particle.rotation !== undefined) {
        ctx.rotate(particle.rotation);
      }
      
      switch (particle.type) {
        case 'trail_sparkle':
          // Sparkle particle
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-particle.size/2, 0);
          ctx.lineTo(particle.size/2, 0);
          ctx.moveTo(0, -particle.size/2);
          ctx.lineTo(0, particle.size/2);
          ctx.stroke();
          break;
          
        case 'trail_bubble':
          // Bubble particle
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
          
        case 'fire_ember':
          // Fire ember
          const emberGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
          emberGrad.addColorStop(0, '#FF4500');
          emberGrad.addColorStop(0.5, '#FF6347');
          emberGrad.addColorStop(1, '#FF0000');
          ctx.fillStyle = emberGrad;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'ice_crystal':
          // Ice crystal
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          break;
          
        case 'rainbow_shard':
          // Rainbow shard
          const rainbowHue = (gameFrameRef.current + particle.x + particle.y) % 360;
          ctx.fillStyle = `hsl(${rainbowHue}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'milestone':
          // Milestone particle with extra shine
          const milestoneGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
          milestoneGrad.addColorStop(0, '#FFD700');
          milestoneGrad.addColorStop(0.7, '#FFA500');
          milestoneGrad.addColorStop(1, '#FF8C00');
          ctx.fillStyle = milestoneGrad;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Star shine effect
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-particle.size, 0);
          ctx.lineTo(particle.size, 0);
          ctx.moveTo(0, -particle.size);
          ctx.lineTo(0, particle.size);
          ctx.stroke();
          break;
          
        case 'combo':
          // Combo particle with pulsing effect
          const comboSize = particle.size * (1 + Math.sin(gameFrameRef.current * 0.2) * 0.3);
          ctx.beginPath();
          ctx.arc(0, 0, comboSize, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        default:
          // Standard particle
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
      }
      
      ctx.restore();
    });
    ctx.globalAlpha = 1;

    // Restore context if debuff effects were applied
    if (activeDebuffRef.current && !isZenMode) {
      if (activeDebuffRef.current.type === 'VISION_BLUR' || activeDebuffRef.current.type === 'SCREEN_LURCH') {
        ctx.restore();
      }
    }

    // Restore screen shake
    if (screenShakeRef.current > 0) {
      ctx.restore();
    }

    // Render UI overlays and effects
    
    // Magnet field visualization
    if (magnetFieldRef.current && birdRef.current && !isZenMode) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      const magnetGrad = ctx.createRadialGradient(
        birdRef.current.x, birdRef.current.y, 0,
        birdRef.current.x, birdRef.current.y, 120
      );
      magnetGrad.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
      magnetGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = magnetGrad;
      ctx.beginPath();
      ctx.arc(birdRef.current.x, birdRef.current.y, 120, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Debuff overlay effects
    if (activeDebuffRef.current && !isZenMode) {
      const debuff = activeDebuffRef.current;
      
      if (debuff.type === 'VISION_BLUR') {
        // Additional blur overlay
        ctx.save();
        ctx.globalAlpha = debuff.magnitude * 0.3;
        ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }
      
      if (debuff.type === 'GRAVITY_CHAOS') {
        // Chaotic visual distortion
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = `hsl(${gameFrameRef.current * 5}, 70%, 50%)`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.restore();
      }
    }

    // Scene transition overlay
    if (nextSceneIndexRef.current !== null && transitionProgress > 0) {
      ctx.save();
      ctx.globalAlpha = Math.sin(transitionProgress * Math.PI) * 0.3;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
    }

    // Continue the game loop
    if (!pausedRef.current && !isWaitingForContinueDecisionRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      animationFrameIdRef.current = 0;
    }
  }, [
    updatePerformanceMetrics, isZenMode, updateTrailParticles, updatePlayerBehaviorAnalysis,
    initStars, spawnEnemy, spawnPowerup, addGameParticles, handleFatalHitLogic, 
    updateEnemyAI, onMilestoneReached, onCoinCollected, updateHudData, onPauseStateChange,
    currentSkyPeckerConfig, selectedTrailEffect, playerSkillLevel, initSceneSpecificElements
  ]);

  // Enhanced input handling with gesture recognition
  const handleInput = useCallback((isFlap: boolean, flapStrength: number = 1.0) => {
    if (!birdRef.current || pausedRef.current || isWaitingForContinueDecisionRef.current) return;
    
    const now = performance.now();
    const timeSinceLastFlap = now - birdRef.current.lastFlapTime;
    
    if (isFlap && timeSinceLastFlap > 50) { // Prevent spam clicking
      birdRef.current.lastFlapTime = now;
      
      // Apply controls invert debuff
      const flapDirection = activeDebuffRef.current?.type === 'CONTROLS_INVERT' ? 1 : -1;
      
      // Enhanced flap mechanics with strength variation
      const baseFlapForce = birdRef.current.flapForce;
      const strengthMultiplier = Math.max(0.5, Math.min(2.0, flapStrength));
      const actualFlapForce = baseFlapForce * strengthMultiplier * flapDirection;
      
      birdRef.current.v = actualFlapForce;
      
      // Reset combo timer on flap
      if (comboTimerRef.current > 0) {
        comboTimerRef.current = 180; // Extend combo window
      }
      
      Sounds.flap();
    }
  }, []);

  // Touch/Mouse input handlers with enhanced gesture recognition
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    tapStartTimeRef.current = performance.now();
    lastTapTimeRef.current = performance.now();
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    if (tapStartTimeRef.current === null) return;
    
    const tapDuration = performance.now() - tapStartTimeRef.current;
    const flapStrength = Math.min(2.0, 0.5 + (tapDuration / 300)); // Longer hold = stronger flap
    
    handleInput(true, flapStrength);
    tapStartTimeRef.current = null;
  }, [handleInput]);

  // Keyboard input handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      handleInput(true, 1.0);
    }
    
    // Debug controls (only in development)
    if (process.env.NODE_ENV === 'development') {
      if (e.code === 'KeyG') {
        godModeRef.current = !godModeRef.current;
        toggleGodModeCallback(godModeRef.current);
      }
    }
  }, [handleInput, toggleGodModeCallback]);

  // Initialize game and setup event listeners
  useEffect(() => {
    resetGame();
    
    // Keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    
    // Canvas event listeners for touch/mouse
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown as any);
      canvas.addEventListener('pointerup', handlePointerUp as any);
      canvas.addEventListener('touchstart', (e) => e.preventDefault());
      canvas.addEventListener('touchend', (e) => e.preventDefault());
      canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }
    
    return () => {
      // Cleanup
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('pointerdown', handlePointerDown as any);
        canvas.removeEventListener('pointerup', handlePointerUp as any);
      }
      
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = 0;
      }
      
      manageBackgroundMusic('', 'stop');
    };
  }, [resetGame, handleKeyDown, handlePointerDown, handlePointerUp]);

  // Component cleanup
  useEffect(() => {
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block cursor-pointer select-none touch-none"
      style={{
        imageRendering: 'pixelated',
        maxWidth: '100%',
        maxHeight: '100vh',
        objectFit: 'contain'
      }}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0}
      role="game"
      aria-label="SkyPecker Game Canvas"
    />
  );
});

GameEngine.displayName = 'GameEngine';

export default GameEngine;