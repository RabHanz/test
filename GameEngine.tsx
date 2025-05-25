
import React, { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import {
  Bird, Pipe, Coin, Cloud, Particle, TrailParticle, Star, Meteor, Enemy, SceneConfig, PowerUpType, SkyPeckerTypeConfig, EngineHudData, DebuffEffect, DebuffType, EnemyVisualType, GroundElement, StaticGroundFeature, GameEngineProps, GameEngineRef
} from './types';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT, INITIAL_BIRD_R, INITIAL_BIRD_G, INITIAL_BIRD_FLAP_FORCE,
  SKYPECKER_TYPES, SCENES, PIPE_WIDTH, POWERUP_OPTIONS, PARTICLE_COLORS, SCENE_TRANSITION_DURATION, SCENE_INTERVAL,
  INITIAL_ACHIEVEMENTS, COIN_SPAWN_INTERVAL, COIN_SPAWN_CHANCE, MIN_COIN_Y, MAX_COIN_Y, COIN_RADIUS,
  ENEMY_TYPES, DEBUFF_CONFIG, ENEMY_SPAWN_BASE_INTERVAL, ENEMY_SPAWN_DIFFICULTY_FACTOR, INITIAL_DEBUFF_STATE,
  CAR_COLORS, MAX_GROUND_CARS, CAR_MIN_WIDTH, CAR_MAX_WIDTH, CAR_MIN_HEIGHT, CAR_MAX_HEIGHT, CAR_MIN_SPEED_FACTOR, CAR_MAX_SPEED_FACTOR, STATIC_GROUND_FEATURE_SPREAD
} from './constants';
import { Sounds, blendColors, drawSilhouette, manageBackgroundMusic, hexToRgb } from './utils';


const GameEngine = forwardRef<GameEngineRef, GameEngineProps>(({
  selectedSkyPeckerTypeIndex, 
  selectedStartPower,
  onGameOver,
  onCoinCollected,
  onAchievementProgress,
  onPowerupUsed,
  toggleGodModeCallback,
  updateHudData,
  canContinueRun, // New prop
  onContinueRunRequested, // New prop
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameFrameRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>(0);

  const birdRef = useRef<Bird | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const weatherParticlesRef = useRef<Particle[]>([]);
  const gameParticlesRef = useRef<Particle[]>([]);
  const trailEffectRef = useRef<TrailParticle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const groundElementsRef = useRef<GroundElement[]>([]); 
  const staticGroundFeaturesRef = useRef<StaticGroundFeature[]>([]);


  const scoreRef = useRef<number>(0);
  const powerGaugeRef = useRef<number>(0);
  const currentPowerupRef = useRef<PowerUpType>(null);
  const powerupTimeRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const comboRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0); 
  
  const currentSceneIndexRef = useRef<number>(0);
  const nextSceneIndexRef = useRef<number | null>(null);
  const sceneTransitionProgressRef = useRef<number>(0);

  const allowFirstCrashRef = useRef<boolean>(true);
  const perfectRunRef = useRef<boolean>(true);
  const screenShakeRef = useRef<number>(0);
  const godModeRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);
  const magnetFieldRef = useRef<boolean>(false);
  const coinsCollectedThisRunRef = useRef<number>(0);
  const activeDebuffRef = useRef<DebuffEffect | null>(INITIAL_DEBUFF_STATE);

  const canNegateDebuffRef = useRef<boolean>(false);
  const hasRevivedRef = useRef<boolean>(false);
  const lastPhaseAttemptFrameRef = useRef<number>(0);
  const isPhasingRef = useRef<boolean>(false);
  const phaseDurationRef = useRef<number>(0);

  const encounteredWeatherTypesThisRunRef = useRef<Set<string>>(new Set());
  const isWaitingForContinueDecisionRef = useRef<boolean>(false); // New ref
  const timesContinuedThisRunRef = useRef<number>(0); // New ref (tracks continues for this specific game run)


  useImperativeHandle(ref, () => ({
    resumeAfterAdContinue: () => {
      if (birdRef.current) {
        birdRef.current.y = CANVAS_HEIGHT / 3; // Reset to a safe position
        birdRef.current.v = 0;
        currentPowerupRef.current = 'shield'; // Give temporary shield
        powerupTimeRef.current = 180; // 3 seconds shield
        onPowerupUsed('shield');
        Sounds.powerup();
        isWaitingForContinueDecisionRef.current = false;
        pausedRef.current = false; // Ensure game is not paused
        timesContinuedThisRunRef.current++;
        // Re-engage game loop if it was fully stopped (though requestAnimationFrame usually keeps trying)
        if (animationFrameIdRef.current === 0) { 
          animationFrameIdRef.current = requestAnimationFrame(gameLoop);
        }
      }
    }
  }));

  const initSceneSpecificElements = (scene: SceneConfig, gameMoveSpeed: number) => {
    groundElementsRef.current = [];
    if (scene.groundAnimationType === 'passing_cars') {
      for (let i = 0; i < Math.floor(MAX_GROUND_CARS / 2); i++) {
        const carWidth = CAR_MIN_WIDTH + Math.random() * (CAR_MAX_WIDTH - CAR_MIN_WIDTH);
        const carHeight = CAR_MIN_HEIGHT + Math.random() * (CAR_MAX_HEIGHT - CAR_MIN_HEIGHT);
        groundElementsRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: CANVAS_HEIGHT - GROUND_HEIGHT + carHeight * 0.4 - (Math.random() > 0.5 ? carHeight * 0.6 : 0),
          width: carWidth,
          height: carHeight,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          speedFactor: (CAR_MIN_SPEED_FACTOR + Math.random() * (CAR_MAX_SPEED_FACTOR - CAR_MIN_SPEED_FACTOR)),
          type: 'car',
        });
      }
    }

    staticGroundFeaturesRef.current = [];
    const detailConfig = scene.groundDetailConfig;
    if (detailConfig.type !== 'none' && detailConfig.type !== 'road_markings' && detailConfig.density && detailConfig.density > 0) {
        const featureCount = Math.floor((CANVAS_WIDTH * 1.5) / detailConfig.density); 
        for (let i = 0; i < featureCount; i++) {
            const baseHeight = detailConfig.heightParameters?.base || 10;
            const varianceHeight = detailConfig.heightParameters?.variance || 5;
            const featureHeight = baseHeight + Math.random() * varianceHeight;
            let featureWidth: number | undefined;
            if (detailConfig.type === 'cactus') featureWidth = 5 + Math.random() * 5;
            if (detailConfig.type === 'rocks') featureWidth = 8 + Math.random() * 12;


            staticGroundFeaturesRef.current.push({
                x: Math.random() * (CANVAS_WIDTH * 1.5), 
                y: CANVAS_HEIGHT - GROUND_HEIGHT - featureHeight,
                type: detailConfig.type,
                height: featureHeight,
                width: featureWidth,
                color: detailConfig.color,
            });
        }
    }
  };


  const resetGame = useCallback(() => {
    const bType = SKYPECKER_TYPES[selectedSkyPeckerTypeIndex];
    birdRef.current = {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      r: INITIAL_BIRD_R,
      v: 0,
      g: INITIAL_BIRD_G * (bType.gravityMultiplier || 1),
      flapForce: INITIAL_BIRD_FLAP_FORCE * bType.speed * (bType.flapForceMultiplier || 1),
      typeIndex: selectedSkyPeckerTypeIndex,
    };
    
    canNegateDebuffRef.current = bType.canNegateDebuffOnce || false;
    hasRevivedRef.current = false;
    lastPhaseAttemptFrameRef.current = 0;
    isPhasingRef.current = false;
    phaseDurationRef.current = 0;
    timesContinuedThisRunRef.current = 0;
    isWaitingForContinueDecisionRef.current = false;


    pipesRef.current = [];
    coinsRef.current = [];
    enemiesRef.current = [];
    gameParticlesRef.current = [];
    trailEffectRef.current = [];
    meteorsRef.current = [];
    cloudsRef.current = [
      { x: 80, y: 60, speed: 0.3 },
      { x: 300, y: 100, speed: 0.5 },
      { x: 180, y: 80, speed: 0.4 },
    ];
    weatherParticlesRef.current = [];

    scoreRef.current = 0;
    coinsCollectedThisRunRef.current = 0;
    powerGaugeRef.current = 0;
    difficultyRef.current = 1;
    comboRef.current = 0;
    comboTimerRef.current = 0;
    activeDebuffRef.current = null;
    
    currentSceneIndexRef.current = Math.floor(Math.random() * SCENES.length);
    nextSceneIndexRef.current = null;
    sceneTransitionProgressRef.current = 0;
    if (SCENES[currentSceneIndexRef.current].name === 'Night') initStars();

    allowFirstCrashRef.current = true;
    perfectRunRef.current = true;
    screenShakeRef.current = 0;
    pausedRef.current = false;
    magnetFieldRef.current = false;

    currentPowerupRef.current = selectedStartPower;
    if (selectedStartPower === 'shield') powerupTimeRef.current = 600;
    else if (selectedStartPower === 'slow') powerupTimeRef.current = 300;
    else powerupTimeRef.current = 0;
    
    if (selectedStartPower) onPowerupUsed(selectedStartPower);

    gameFrameRef.current = 0;

    encounteredWeatherTypesThisRunRef.current.clear();
    const initialScene = SCENES[currentSceneIndexRef.current];
    encounteredWeatherTypesThisRunRef.current.add(initialScene.weather);
    onAchievementProgress('weatherWizard', 1); 
    
    initSceneSpecificElements(initialScene, 2 * (1 + difficultyRef.current * 0.1));


    manageBackgroundMusic(SCENES[currentSceneIndexRef.current].type, 'start');
    if (animationFrameIdRef.current === 0 && !isWaitingForContinueDecisionRef.current) { // Start loop if not already running
        animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }

  }, [selectedSkyPeckerTypeIndex, selectedStartPower, onPowerupUsed, onAchievementProgress, /*gameLoop*/]); // gameLoop removed from deps to break cycle with onGameOver

  const initStars = () => {
    starsRef.current = [];
    for (let i = 0; i < 50; i++) {
      starsRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (CANVAS_HEIGHT * 0.6),
        twinkle: Math.random() * Math.PI * 2,
        size: 1 + Math.random() * 2,
      });
    }
  };
  
  const spawnPowerup = useCallback(() => {
    const newPowerup = POWERUP_OPTIONS[Math.floor(Math.random() * POWERUP_OPTIONS.length)];
    if (!newPowerup) return;

    currentPowerupRef.current = newPowerup;
    powerGaugeRef.current = 0; 

    if (newPowerup === 'shield') powerupTimeRef.current = 600;
    else if (newPowerup === 'speed') {
      powerupTimeRef.current = 300;
      onAchievementProgress('speedDemon', 1);
    }
    else powerupTimeRef.current = 300;
    
    Sounds.powerup();
    onPowerupUsed(newPowerup);
    onAchievementProgress('powerMaster', 1);
  }, [onAchievementProgress, onPowerupUsed]);

  const handleFatalHitLogic = () => {
      if (canContinueRun && timesContinuedThisRunRef.current === 0) { // Only allow one continue per actual game run
        isWaitingForContinueDecisionRef.current = true;
        pausedRef.current = true; // Soft pause game logic
        onContinueRunRequested();
      } else {
        handleGameOver();
      }
  };

  const handleGameOver = useCallback(() => {
    Sounds.gameOverCrash();
    manageBackgroundMusic('', 'stop');
    // animationFrameIdRef.current will be cancelled by useEffect cleanup
    onGameOver(scoreRef.current, coinsCollectedThisRunRef.current, perfectRunRef.current);
  }, [onGameOver]);
  
  const addGameParticles = (x: number, y: number, color: string, count = 8, particleType: Particle['type'] = 'game') => {
    for (let i = 0; i < count; i++) {
      gameParticlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 60,
        maxLife: 60,
        color: color,
        size: 3 + Math.random() * 3,
        type: particleType,
      });
    }
  };

  const spawnEnemy = useCallback(() => {
    const availableEnemyTypes = ENEMY_TYPES.filter(type => difficultyRef.current >= type.spawnDifficultyThreshold);
    if (availableEnemyTypes.length === 0) return;

    const enemyTypeConfig = availableEnemyTypes[Math.floor(Math.random() * availableEnemyTypes.length)];
    const enemySpeedMultiplier = enemyTypeConfig.baseSpeedMultiplier || 1.0;
    
    enemiesRef.current.push({
        x: CANVAS_WIDTH + enemyTypeConfig.size,
        y: MIN_COIN_Y + Math.random() * (MAX_COIN_Y - MIN_COIN_Y), 
        vx: -1.5 * enemySpeedMultiplier, 
        vy: 0,
        size: enemyTypeConfig.size,
        visualType: enemyTypeConfig.visualType,
        debuffType: enemyTypeConfig.debuffType,
        life: 1, 
        spawnFrame: gameFrameRef.current,
    });
  }, []);


  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !birdRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (pausedRef.current && !isWaitingForContinueDecisionRef.current) { // Standard pause
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Paused", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
      manageBackgroundMusic('', 'stop'); 
      return;
    } else if (isWaitingForContinueDecisionRef.current) { // Paused, waiting for App.tsx
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
       // Potentially draw a "Waiting..." or frozen screen, or just the last frame
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Watch Ad to Continue?", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
      ctx.font = "16px Arial";
      ctx.fillText("(Simulated)", CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20);
      manageBackgroundMusic('', 'stop');
      return;
    }
    
    if (!pausedRef.current && SCENES[currentSceneIndexRef.current]) {
        manageBackgroundMusic(SCENES[currentSceneIndexRef.current].type, 'start'); 
    }


    gameFrameRef.current++;
    const currentSkyPeckerConfig = SKYPECKER_TYPES[birdRef.current.typeIndex];

    if (activeDebuffRef.current) {
        activeDebuffRef.current.duration--;
        const debuff = activeDebuffRef.current;
        switch (debuff.type) {
            case 'HEAVY_WINGS':
                birdRef.current.g = debuff.originalGravity! * debuff.magnitude;
                break;
            case 'FLAP_FATIGUE':
                birdRef.current.flapForce = debuff.originalFlapForce! * (1 - debuff.magnitude);
                break;
            case 'SCREEN_LURCH':
                break;
        }
        if (activeDebuffRef.current.duration <= 0) {
            birdRef.current.g = INITIAL_BIRD_G * (currentSkyPeckerConfig.gravityMultiplier || 1);
            birdRef.current.flapForce = INITIAL_BIRD_FLAP_FORCE * currentSkyPeckerConfig.speed * (currentSkyPeckerConfig.flapForceMultiplier || 1);
            activeDebuffRef.current = null;
        }
    } else {
        birdRef.current.g = INITIAL_BIRD_G * (currentSkyPeckerConfig.gravityMultiplier || 1);
        birdRef.current.flapForce = INITIAL_BIRD_FLAP_FORCE * currentSkyPeckerConfig.speed * (currentSkyPeckerConfig.flapForceMultiplier || 1);
    }


    birdRef.current.v += birdRef.current.g;
    birdRef.current.y += birdRef.current.v * currentSkyPeckerConfig.speed;
    
    if (isPhasingRef.current) {
        phaseDurationRef.current--;
        if (phaseDurationRef.current <= 0) {
            isPhasingRef.current = false;
        }
    }


    if (gameFrameRef.current % 400 === 0 && difficultyRef.current < 6.0) {
      difficultyRef.current = Math.min(difficultyRef.current + 0.15, 6.0);
    }
    
    const gameSpeedMultiplier = (currentPowerupRef.current === 'slow' ? 0.5 : (currentPowerupRef.current === 'speed' ? 3 : 2));
    const moveSpeed = gameSpeedMultiplier * (1 + difficultyRef.current * 0.1);


    if (gameFrameRef.current > 0 && gameFrameRef.current % SCENE_INTERVAL === 0) {
        const newIdx = (currentSceneIndexRef.current + 1) % SCENES.length;
        if (newIdx !== currentSceneIndexRef.current) {
            nextSceneIndexRef.current = newIdx;
            sceneTransitionProgressRef.current = 0;
            if (SCENES[newIdx].name === 'Night') initStars();
        }
    }
    if (nextSceneIndexRef.current !== null) {
        sceneTransitionProgressRef.current++;
        if (sceneTransitionProgressRef.current >= SCENE_TRANSITION_DURATION) {
            currentSceneIndexRef.current = nextSceneIndexRef.current; 
            nextSceneIndexRef.current = null;
            sceneTransitionProgressRef.current = 0;

            const newScene = SCENES[currentSceneIndexRef.current];
            if (!encounteredWeatherTypesThisRunRef.current.has(newScene.weather)) {
                encounteredWeatherTypesThisRunRef.current.add(newScene.weather);
                onAchievementProgress('weatherWizard', 1);
            }
            manageBackgroundMusic(newScene.type, 'changeScene');
            initSceneSpecificElements(newScene, moveSpeed); 
        }
    }
    
    const basePipeSpawnRate = 100; 
    const minPipeSpawnRate = 70;
    const maxPipeSpawnRate = 120;
    const safeDifficulty = Math.min(Math.max(difficultyRef.current, 1), 6);
    let effectivePipeSpawnRate = Math.max(minPipeSpawnRate, Math.min(maxPipeSpawnRate, basePipeSpawnRate - safeDifficulty * 5));

    if (currentPowerupRef.current === 'slow') {
        effectivePipeSpawnRate = Math.floor(effectivePipeSpawnRate * 1.85); 
    }


    if (gameFrameRef.current % Math.floor(effectivePipeSpawnRate) === 0) {
      const baseGapMin = 220;
      const baseGapMax = 280;
      const difficultyReduction = safeDifficulty * 7; 
      const minGapHeight = Math.max(190, baseGapMin - difficultyReduction); 
      const maxGapH = Math.max(minGapHeight + 30, baseGapMax - difficultyReduction); 
      
      const gapH = minGapHeight + Math.random() * (maxGapH - minGapHeight);
      
      const topMargin = 80;
      const bottomMargin = GROUND_HEIGHT + 40; 
      const availableSpace = CANVAS_HEIGHT - topMargin - bottomMargin - gapH;
      
      let gy = topMargin + Math.random() * Math.max(20, availableSpace);
      if (availableSpace < 20 || gapH <=0 ) { 
        const safeDefaultGap = 200;
        gy = topMargin + (CANVAS_HEIGHT - topMargin - bottomMargin - safeDefaultGap) / 2;
         pipesRef.current.push({
            x: CANVAS_WIDTH + PIPE_WIDTH,
            w: PIPE_WIDTH,
            gapT: gy,
            gapB: gy + safeDefaultGap,
            scored: false,
        });
      } else {
         pipesRef.current.push({
            x: CANVAS_WIDTH + PIPE_WIDTH,
            w: PIPE_WIDTH,
            gapT: gy,
            gapB: gy + gapH,
            scored: false,
        });
      }
    }

    if (gameFrameRef.current % COIN_SPAWN_INTERVAL === 0) {
        if (Math.random() < COIN_SPAWN_CHANCE) {
            const newCoinX = CANVAS_WIDTH + COIN_RADIUS;
            const newCoinY = MIN_COIN_Y + Math.random() * (MAX_COIN_Y - MIN_COIN_Y);
            const newCoinR = COIN_RADIUS;

            let canSpawn = true;
            for (const pipe of pipesRef.current) {
                if (pipe.x > CANVAS_WIDTH + PIPE_WIDTH + COIN_RADIUS) continue;
                const horizontalOverlap = newCoinX + newCoinR > pipe.x && newCoinX - newCoinR < pipe.x + pipe.w;
                if (horizontalOverlap) {
                    const collidesWithTopPipe = newCoinY - newCoinR < pipe.gapT && newCoinY + newCoinR > 0;
                    const collidesWithBottomPipe = newCoinY + newCoinR > pipe.gapB && newCoinY - newCoinR < (CANVAS_HEIGHT - GROUND_HEIGHT);
                    if (collidesWithTopPipe || collidesWithBottomPipe) {
                        canSpawn = false;
                        break; 
                    }
                }
            }
            if (canSpawn) {
                coinsRef.current.push({ x: newCoinX, y: newCoinY, r: newCoinR, taken: false });
            }
        }
    }


    pipesRef.current.forEach(p => p.x -= moveSpeed);
    coinsRef.current.forEach(c => { if (!c.taken) c.x -= moveSpeed; });
    enemiesRef.current.forEach(e => e.x += e.vx * (1 + difficultyRef.current * 0.05) - moveSpeed );
    
    staticGroundFeaturesRef.current.forEach(feat => {
        feat.x -= moveSpeed;
        if (feat.x + (feat.width || 10) < 0) { 
            feat.x += STATIC_GROUND_FEATURE_SPREAD + Math.random() * 50; 
            const currentScene = SCENES[currentSceneIndexRef.current]; 
            const detailConfig = currentScene.groundDetailConfig;
            if(detailConfig.heightParameters) {
                 feat.height = detailConfig.heightParameters.base + Math.random() * detailConfig.heightParameters.variance;
            }
            feat.y = CANVAS_HEIGHT - GROUND_HEIGHT - feat.height;
        }
    });
    groundElementsRef.current.forEach(car => { 
        car.x -= car.speedFactor * moveSpeed;
        if (car.x + car.width / 2 < 0) { 
            car.x = CANVAS_WIDTH + car.width + Math.random() * CANVAS_WIDTH * 0.5;
            car.color = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
            car.speedFactor = (CAR_MIN_SPEED_FACTOR + Math.random() * (CAR_MAX_SPEED_FACTOR - CAR_MIN_SPEED_FACTOR));
            car.y = CANVAS_HEIGHT - GROUND_HEIGHT + car.height * 0.4 - (Math.random() > 0.5 ? car.height * 0.6 : 0); 
        }
    });


    pipesRef.current = pipesRef.current.filter(p => p.x + p.w > 0);
    coinsRef.current = coinsRef.current.filter(c => c.x + c.r > 0); 
    enemiesRef.current = enemiesRef.current.filter(e => e.x + e.size > 0 && e.life > 0);


    if (currentPowerupRef.current) {
      powerupTimeRef.current--;
      if (powerupTimeRef.current <= 0) {
        currentPowerupRef.current = null;
        magnetFieldRef.current = false;
      }
      if (currentPowerupRef.current === 'magnet') {
        magnetFieldRef.current = true;
        coinsRef.current.forEach(c => {
          if (!c.taken) {
            let dx = birdRef.current!.x - c.x;
            let dy = birdRef.current!.y - c.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) { 
              c.x += dx * 0.1;
              c.y += dy * 0.1;
            }
          }
        });
      } else {
        magnetFieldRef.current = false;
      }
    }

    const enemySpawnInterval = Math.max(60, ENEMY_SPAWN_BASE_INTERVAL - difficultyRef.current * ENEMY_SPAWN_DIFFICULTY_FACTOR);
    if (gameFrameRef.current % Math.floor(enemySpawnInterval) === 0) {
        spawnEnemy();
    }

    enemiesRef.current.forEach(enemy => {
        enemy.y += enemy.vy;
        if (enemy.visualType === 'GHOST') {
           enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.03) * 0.5; 
        } else if (enemy.visualType === 'SPRITE') {
            enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.1) * 1.5; 
        } else { 
            enemy.vy = Math.sin((gameFrameRef.current + (enemy.spawnFrame || 0)) * 0.02) * 1.0;
        }
        enemy.y = Math.max(enemy.size, Math.min(enemy.y, CANVAS_HEIGHT - GROUND_HEIGHT - enemy.size));

        let dx = birdRef.current!.x - enemy.x;
        let dy = birdRef.current!.y - enemy.y;
        const birdSizeWithPowerup = birdRef.current!.r * currentSkyPeckerConfig.size * (currentPowerupRef.current === 'shrink' ? 0.6 : 1);
        if (Math.sqrt(dx * dx + dy * dy) < birdSizeWithPowerup + enemy.size) {
          if (godModeRef.current || currentPowerupRef.current === 'shield') {
            addGameParticles(enemy.x, enemy.y, godModeRef.current ? PARTICLE_COLORS.godModeHit : PARTICLE_COLORS.shieldHit, 6);
            enemy.life = 0; 
            Sounds.powerup();
          } else if (!activeDebuffRef.current) { 
            if (currentSkyPeckerConfig.canNegateDebuffOnce && canNegateDebuffRef.current) {
                canNegateDebuffRef.current = false;
                Sounds.debuffNegated();
                addGameParticles(birdRef.current.x, birdRef.current.y, PARTICLE_COLORS.debuffNegated, 10);
                enemy.life = 0;
            } else {
                const debuffConfig = DEBUFF_CONFIG[enemy.debuffType];
                activeDebuffRef.current = {
                    type: enemy.debuffType,
                    duration: debuffConfig.duration,
                    magnitude: debuffConfig.magnitude,
                    originalGravity: birdRef.current.g, 
                    originalFlapForce: birdRef.current.flapForce,
                };
                if (enemy.debuffType === 'HEAVY_WINGS') {
                    Sounds.debuffHeavyWings();
                    addGameParticles(birdRef.current.x, birdRef.current.y, PARTICLE_COLORS.debuffGhost || '#ADD8E6', 10, 'debuff_ghost');
                } else if (enemy.debuffType === 'FLAP_FATIGUE') {
                    Sounds.debuffFlapFatigue();
                    addGameParticles(birdRef.current.x, birdRef.current.y, PARTICLE_COLORS.debuffSprite || '#FFA07A', 10, 'debuff_sprite');
                } else if (enemy.debuffType === 'SCREEN_LURCH') {
                    screenShakeRef.current = debuffConfig.magnitude; 
                    Sounds.debuffScreenLurch();
                }
                perfectRunRef.current = false; 
                enemy.life = 0; 
            }
          }
        }
    });
    
    const primaryScene = SCENES[currentSceneIndexRef.current];
    if (primaryScene.weather === 'rain') {
        for (let i = 0; i < 2; i++) weatherParticlesRef.current.push({ x: Math.random() * CANVAS_WIDTH, y: -5, vx: -1, vy: 8, life: 100, type: 'rain' });
    } else if (primaryScene.weather === 'snow') {
        for (let i = 0; i < 1; i++) weatherParticlesRef.current.push({ x: Math.random() * CANVAS_WIDTH, y: -5, vx: Math.random() * 2 - 1, vy: 1 + Math.random(), life: 150, type: 'snow' });
    } else if (primaryScene.weather === 'sandstorm') {
        if (Math.random() < 0.3) weatherParticlesRef.current.push({ x: CANVAS_WIDTH + 10, y: Math.random() * CANVAS_HEIGHT, vx: -3 - Math.random() * 2, vy: Math.random() * 0.5 - 0.25, life: 80, type: 'sand' });
    }
    weatherParticlesRef.current = weatherParticlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life--;
        return p.life > 0 && p.x > -10 && p.x < CANVAS_WIDTH + 10 && p.y < CANVAS_HEIGHT + 10;
    });

    gameParticlesRef.current = gameParticlesRef.current.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.vx *= 0.98; p.life--;
        return p.life > 0;
    });
    
    if (currentPowerupRef.current === 'speed' || selectedSkyPeckerTypeIndex === 1 ) { 
        trailEffectRef.current.push({ x: birdRef.current.x, y: birdRef.current.y, life: 20, size: birdRef.current.r * currentSkyPeckerConfig.size * 0.8 });
    }
    trailEffectRef.current = trailEffectRef.current.filter(t => { t.life--; return t.life > 0; });

    if (primaryScene.name === 'Night' && Math.random() < 0.005) { 
        meteorsRef.current.push({ x: Math.random() * CANVAS_WIDTH, y: -10, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 3, life: 100, trail: [] });
    }
    meteorsRef.current = meteorsRef.current.filter(m => {
        m.x += m.vx; m.y += m.vy; m.life--;
        m.trail.push({ x: m.x, y: m.y, life: 20 });
        m.trail = m.trail.filter(t => { t.life--; return t.life > 0; });
        return m.life > 0 && m.y < CANVAS_HEIGHT;
    });

    cloudsRef.current.forEach(c => {
        c.x -= c.speed * 0.5; 
        if (c.x < -80) c.x = CANVAS_WIDTH + Math.random() * 60;
    });

    if (comboTimerRef.current > 0) {
        comboTimerRef.current--;
        if (comboTimerRef.current === 0) {
            comboRef.current = 0;
        }
    }
    
    const birdSize = birdRef.current.r * currentSkyPeckerConfig.size * (currentPowerupRef.current === 'shrink' ? 0.6 : 1);
    for (const p of pipesRef.current) {
      let didPhaseThisHit = false;
      if (birdRef.current.x + birdSize > p.x && birdRef.current.x - birdSize < p.x + p.w) {
        if (birdRef.current.y - birdSize < p.gapT || birdRef.current.y + birdSize > p.gapB) {
          if (currentSkyPeckerConfig.pipePhaseChance && 
              !isPhasingRef.current &&
              gameFrameRef.current - lastPhaseAttemptFrameRef.current > (currentSkyPeckerConfig.specialAbilityCooldown || 0)) {
            lastPhaseAttemptFrameRef.current = gameFrameRef.current;
            if (Math.random() < currentSkyPeckerConfig.pipePhaseChance) {
                isPhasingRef.current = true;
                phaseDurationRef.current = 20; 
                Sounds.pipePhase();
                addGameParticles(birdRef.current.x, birdRef.current.y, 'rgba(200,200,255,0.5)', 15);
                didPhaseThisHit = true;
            }
          }

          if (didPhaseThisHit) {
            // Successfully phased
          } else if (godModeRef.current || currentPowerupRef.current === 'shield') {
            addGameParticles(birdRef.current.x, birdRef.current.y, godModeRef.current ? PARTICLE_COLORS.godModeHit : PARTICLE_COLORS.shieldHit, 4);
            Sounds.powerup(); 
          } else {
            if (currentSkyPeckerConfig.reviveOnce && !hasRevivedRef.current && !allowFirstCrashRef.current) {
                hasRevivedRef.current = true;
                birdRef.current.y = p.gapT + (p.gapB - p.gapT) / 2; 
                birdRef.current.v = birdRef.current.flapForce * 0.3;
                currentPowerupRef.current = 'shield';
                powerupTimeRef.current = 120; 
                onPowerupUsed('shield'); 
                Sounds.revive();
                addGameParticles(birdRef.current.x, birdRef.current.y, PARTICLE_COLORS.revive, 20);
                screenShakeRef.current = 10;
                perfectRunRef.current = false; 
            } else if (allowFirstCrashRef.current) {
              allowFirstCrashRef.current = false;
              perfectRunRef.current = false; 
              screenShakeRef.current = 10;
              Sounds.pipeHit();
            } else {
              screenShakeRef.current = 15;
              handleFatalHitLogic(); // MODIFIED
              return;
            }
          }
        }
      }
      if (p.x + p.w < birdRef.current.x && !p.scored) {
        p.scored = true;
        scoreRef.current++;
        Sounds.flap(); 
        
        if (scoreRef.current === 1) onAchievementProgress('firstFlight', 1);
        if (scoreRef.current >= 15 && perfectRunRef.current) onAchievementProgress('untouchable', 1);
        if (scoreRef.current === 25) onAchievementProgress('survivor', 1);
        if (scoreRef.current === 50) onAchievementProgress('perfectionist', 1);
        if (scoreRef.current === 100) onAchievementProgress('legendary', 1);
      }
    }

    const checkBoundaryCollision = (isTopBoundary: boolean) => {
        if (!(godModeRef.current || currentPowerupRef.current === 'shield')) {
            if (currentSkyPeckerConfig.reviveOnce && !hasRevivedRef.current && !allowFirstCrashRef.current) {
                hasRevivedRef.current = true;
                birdRef.current!.y = CANVAS_HEIGHT / 2;
                birdRef.current!.v = birdRef.current!.flapForce * 0.3;
                currentPowerupRef.current = 'shield';
                powerupTimeRef.current = 120;
                onPowerupUsed('shield');
                Sounds.revive();
                addGameParticles(birdRef.current!.x, birdRef.current!.y, PARTICLE_COLORS.revive, 20);
                screenShakeRef.current = 10;
                perfectRunRef.current = false;
            } else if (allowFirstCrashRef.current) {
                allowFirstCrashRef.current = false;
                perfectRunRef.current = false;
                screenShakeRef.current = 5;
                Sounds.pipeHit();
            } else {
                screenShakeRef.current = 15;
                handleFatalHitLogic(); // MODIFIED
                return true; 
            }
        } else {
            Sounds.powerup();
            addGameParticles(birdRef.current!.x, birdRef.current!.y, PARTICLE_COLORS.shieldHit, 3);
        }
        return false; 
    };

    if (birdRef.current.y + birdSize > CANVAS_HEIGHT - GROUND_HEIGHT) { 
      birdRef.current.y = CANVAS_HEIGHT - GROUND_HEIGHT - birdSize;
      birdRef.current.v = 0;
      if (checkBoundaryCollision(false)) return;
    }
    if (birdRef.current.y - birdSize < 0) { 
      birdRef.current.y = birdSize;
      birdRef.current.v = 0;
      if (checkBoundaryCollision(true)) return;
    }

    coinsRef.current.forEach(c => {
      if (!c.taken) {
        let dx = birdRef.current!.x - c.x;
        let dy = birdRef.current!.y - c.y;
        let collectRadius = birdSize + c.r + (magnetFieldRef.current ? 30 : 0);
        if (Math.sqrt(dx * dx + dy * dy) < collectRadius) {
          c.taken = true;
          coinsCollectedThisRunRef.current++;
          onCoinCollected(1); 
          const powerGaugeIncrease = 20 * (currentSkyPeckerConfig.powerGaugeMultiplier || 1);
          powerGaugeRef.current = Math.min(100, powerGaugeRef.current + powerGaugeIncrease);
          addGameParticles(c.x, c.y, PARTICLE_COLORS.coin, 5);
          Sounds.coin();
          
          comboRef.current++;
          comboTimerRef.current = 90; 
          if (comboRef.current >= 10) onAchievementProgress('comboKing', 1);

          if (powerGaugeRef.current >= 100) {
            spawnPowerup();
          }
        }
      }
    });
    coinsRef.current = coinsRef.current.filter(c => !c.taken && c.x + c.r > 0); 

    // DRAWING PHASE
    let currentBgColor = SCENES[currentSceneIndexRef.current].sky;
    if (nextSceneIndexRef.current !== null) {
        const t = sceneTransitionProgressRef.current / SCENE_TRANSITION_DURATION;
        const color1RGB = SCENES[currentSceneIndexRef.current].colorRGB;
        const color2RGB = SCENES[nextSceneIndexRef.current!].colorRGB;
        if (color1RGB && color2RGB) {
            currentBgColor = blendColors(color1RGB, color2RGB, t);
        }
    }
    ctx.fillStyle = currentBgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


    if (screenShakeRef.current > 0) {
      ctx.save();
      ctx.translate(Math.random() * screenShakeRef.current - screenShakeRef.current / 2, Math.random() * screenShakeRef.current - screenShakeRef.current / 2);
      screenShakeRef.current = Math.max(0, screenShakeRef.current * 0.9 - 0.5) ; 
    }
    
    const sceneToRenderDetailsFor = nextSceneIndexRef.current !== null && sceneTransitionProgressRef.current > SCENE_TRANSITION_DURATION / 2 
                                    ? SCENES[nextSceneIndexRef.current] 
                                    : primaryScene;

    if (sceneToRenderDetailsFor.name === 'Night') {
        starsRef.current.forEach(star => {
            star.twinkle += 0.1;
            ctx.globalAlpha = 0.5 + Math.sin(star.twinkle) * 0.3;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    const sunMoonX = CANVAS_WIDTH - 80, sunMoonY = 100;
    if (sceneToRenderDetailsFor.name === 'Night' || sceneToRenderDetailsFor.name === 'Storm') { 
        ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(sunMoonX, sunMoonY, 18, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#E0E0E0'; 
        ctx.beginPath(); ctx.arc(sunMoonX - 5, sunMoonY - 3, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sunMoonX + 5, sunMoonY + 5, 2, 0, Math.PI * 2); ctx.fill();
    } else { 
        ctx.fillStyle = '#FFD700'; ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(sunMoonX, sunMoonY, 20, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 4) + gameFrameRef.current * 0.01;
            ctx.beginPath();
            ctx.moveTo(sunMoonX + Math.cos(angle) * 25, sunMoonY + Math.sin(angle) * 25);
            ctx.lineTo(sunMoonX + Math.cos(angle) * 35, sunMoonY + Math.sin(angle) * 35);
            ctx.stroke();
        }
    }
    
    if (nextSceneIndexRef.current !== null) {
        const t = sceneTransitionProgressRef.current / SCENE_TRANSITION_DURATION;
        ctx.globalAlpha = 1 - t;
        drawSilhouette(ctx, SCENES[currentSceneIndexRef.current]);
        ctx.globalAlpha = t;
        drawSilhouette(ctx, SCENES[nextSceneIndexRef.current]);
        ctx.globalAlpha = 1;
    } else {
        drawSilhouette(ctx, SCENES[currentSceneIndexRef.current]);
    }


    ctx.fillStyle = "rgba(255,255,255,0.6)";
    cloudsRef.current.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 25, 0, Math.PI * 2);
        ctx.arc(c.x + 30, c.y + 8, 20, 0, Math.PI * 2);
        ctx.arc(c.x - 25, c.y + 8, 18, 0, Math.PI * 2);
        ctx.arc(c.x + 10, c.y - 15, 22, 0, Math.PI * 2);
        ctx.fill();
    });
    
    trailEffectRef.current.forEach(t => {
        ctx.globalAlpha = t.life / 20 * 0.5;
        ctx.fillStyle = currentSkyPeckerConfig.color;
        ctx.beginPath(); ctx.arc(t.x, t.y, t.size * (t.life / 20), 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    weatherParticlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life / 100;
        if (p.type === 'rain') {
            ctx.strokeStyle = '#87CEEB'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2); ctx.stroke();
        } else if (p.type === 'snow') {
            ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === 'sand') {
            ctx.fillStyle = '#DEB887'; ctx.fillRect(p.x, p.y, 3, 3);
        }
        ctx.globalAlpha = 1;
    });

    let groundColor1 = sceneToRenderDetailsFor.groundColors[0];
    let groundColor2 = sceneToRenderDetailsFor.groundColors[1];
    let groundColor3 = sceneToRenderDetailsFor.groundColors[2];

    if (nextSceneIndexRef.current !== null) {
        const t = sceneTransitionProgressRef.current / SCENE_TRANSITION_DURATION;
        const rgb1_curr = hexToRgb(SCENES[currentSceneIndexRef.current].groundColors[0]);
        const rgb2_curr = hexToRgb(SCENES[currentSceneIndexRef.current].groundColors[1]);
        const rgb3_curr = hexToRgb(SCENES[currentSceneIndexRef.current].groundColors[2]);
        const rgb1_next = hexToRgb(SCENES[nextSceneIndexRef.current].groundColors[0]);
        const rgb2_next = hexToRgb(SCENES[nextSceneIndexRef.current].groundColors[1]);
        const rgb3_next = hexToRgb(SCENES[nextSceneIndexRef.current].groundColors[2]);

        if (rgb1_curr && rgb1_next) groundColor1 = blendColors(rgb1_curr, rgb1_next, t);
        if (rgb2_curr && rgb2_next) groundColor2 = blendColors(rgb2_curr, rgb2_next, t);
        if (rgb3_curr && rgb3_next) groundColor3 = blendColors(rgb3_curr, rgb3_next, t);
    }
    
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, groundColor1);
    groundGradient.addColorStop(0.5, groundColor2);
    groundGradient.addColorStop(1, groundColor3);
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

    const groundDetailScene = sceneToRenderDetailsFor; 
    
    staticGroundFeaturesRef.current.forEach(feat => {
        ctx.fillStyle = feat.color;
        const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
        switch (feat.type) {
            case 'blades':
                ctx.fillRect(feat.x, groundY - feat.height, 2, feat.height);
                break;
            case 'tufts':
                const tuftBaseWidth = 8; 
                ctx.beginPath();
                ctx.moveTo(feat.x, groundY);
                ctx.lineTo(feat.x - tuftBaseWidth / 2, groundY - feat.height * 0.7);
                ctx.lineTo(feat.x, groundY - feat.height);
                ctx.lineTo(feat.x + tuftBaseWidth / 2, groundY - feat.height * 0.7);
                ctx.closePath();
                ctx.fill();
                break;
            case 'cactus':
                const cactusWidth = feat.width || 8;
                ctx.fillRect(feat.x - cactusWidth / 2, groundY - feat.height, cactusWidth, feat.height);
                if (feat.height > 20) { 
                    ctx.fillRect(feat.x - cactusWidth / 2 - cactusWidth * 0.6, groundY - feat.height * 0.7, cactusWidth * 0.6, feat.height * 0.3);
                    ctx.fillRect(feat.x + cactusWidth / 2, groundY - feat.height * 0.6, cactusWidth * 0.6, feat.height * 0.3);
                }
                break;
            case 'rocks':
                 const rockRadius = feat.height; 
                 ctx.beginPath();
                 ctx.arc(feat.x, groundY - rockRadius * 0.3, rockRadius, Math.PI + Math.random()*0.2, Math.PI * 2 - Math.random()*0.2, false);
                 ctx.closePath();
                 ctx.fill();
                break;
        }
    });
    
    if (groundDetailScene.groundDetailConfig.type === 'road_markings') {
        ctx.fillStyle = groundDetailScene.groundDetailConfig.color;
        const dashLength = 30; const dashGap = 30;
        const roadMarkingScrollSpeedFactor = 0.98; 
        const startOffset = (gameFrameRef.current * (moveSpeed * roadMarkingScrollSpeedFactor)) % (dashLength + dashGap);
        for (let x = -startOffset; x < CANVAS_WIDTH; x += (dashLength + dashGap)) {
            ctx.fillRect(x, CANVAS_HEIGHT - GROUND_HEIGHT / 2 - 2, dashLength, 4); 
        }
    }


    if (groundDetailScene.groundAnimationType === 'passing_cars') {
        if (groundElementsRef.current.length < MAX_GROUND_CARS && Math.random() < 0.025) { 
            const carWidth = CAR_MIN_WIDTH + Math.random() * (CAR_MAX_WIDTH - CAR_MIN_WIDTH);
            const carHeight = CAR_MIN_HEIGHT + Math.random() * (CAR_MAX_HEIGHT - CAR_MIN_HEIGHT);
            groundElementsRef.current.push({
                x: CANVAS_WIDTH + carWidth * 1.5, 
                y: CANVAS_HEIGHT - GROUND_HEIGHT + carHeight * 0.35 - (Math.random() > 0.5 ? carHeight * 0.7 : 0), 
                width: carWidth,
                height: carHeight,
                color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
                speedFactor: (CAR_MIN_SPEED_FACTOR + Math.random() * (CAR_MAX_SPEED_FACTOR - CAR_MIN_SPEED_FACTOR)),
                type: 'car',
            });
        }

        groundElementsRef.current.forEach(car => {
            ctx.fillStyle = car.color;
            const bodyHeight = car.height * 0.7;
            const cabinHeight = car.height * 0.45;
            const cabinWidth = car.width * 0.6;
            
            ctx.fillRect(car.x - car.width / 2, car.y - bodyHeight / 2, car.width, bodyHeight);
            ctx.fillRect(car.x - cabinWidth / 2, car.y - bodyHeight / 2 - cabinHeight + (bodyHeight * 0.1) , cabinWidth, cabinHeight);
            
            ctx.fillStyle = '#2D2D2D';
            const wheelRadius = car.height * 0.22;
            ctx.beginPath();
            ctx.arc(car.x - car.width * 0.3, car.y + bodyHeight * 0.3, wheelRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(car.x + car.width * 0.3, car.y + bodyHeight * 0.3, wheelRadius, 0, Math.PI * 2);
            ctx.fill();

            const lightWidth = car.width * 0.1;
            const lightHeight = car.height * 0.15;
            ctx.fillStyle = '#FFFFE0'; 
            ctx.fillRect(car.x - car.width / 2 - lightWidth*0.2, car.y - lightHeight * 1.5, lightWidth, lightHeight);
            ctx.fillRect(car.x - car.width / 2 - lightWidth*0.2, car.y + lightHeight * 0.5, lightWidth, lightHeight);
            
            ctx.fillStyle = '#FF4444'; 
            ctx.fillRect(car.x + car.width / 2 - lightWidth*0.8, car.y - lightHeight*1.5, lightWidth, lightHeight);
            ctx.fillRect(car.x + car.width / 2 - lightWidth*0.8, car.y + lightHeight*0.5, lightWidth, lightHeight);
        });
    }


    pipesRef.current.forEach(p => {
        let grad = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
        grad.addColorStop(0, '#66BB6A'); grad.addColorStop(0.3, '#4CAF50'); grad.addColorStop(0.7, '#388E3C'); grad.addColorStop(1, '#2E7D32');
        ctx.fillStyle = grad;
        ctx.fillRect(p.x, 0, p.w, p.gapT);
        ctx.fillRect(p.x, p.gapB, p.w, CANVAS_HEIGHT - p.gapB - GROUND_HEIGHT);
        ctx.fillStyle = '#558B2F'; 
        ctx.fillRect(p.x - 5, p.gapT - 20, p.w + 10, 20);
        ctx.fillRect(p.x - 5, p.gapB, p.w + 10, 20);
    });

    coinsRef.current.forEach(c => { 
        if (c.taken) return;
        const rotation = (gameFrameRef.current * 0.1) % (Math.PI * 2);
        const scaleX = Math.cos(rotation);
        ctx.save();
        ctx.translate(c.x, c.y); ctx.scale(Math.abs(scaleX), 1);
        let g = ctx.createRadialGradient(0, 0, 2, 0, 0, c.r);
        g.addColorStop(0, "#FFF176"); g.addColorStop(0.7, "#FFC107"); g.addColorStop(1, "#FF8F00");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#E65100"; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
        if (magnetFieldRef.current) { 
            let dx = birdRef.current!.x - c.x; let dy = birdRef.current!.y - c.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) {
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 - dist/200})`; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(birdRef.current!.x, birdRef.current!.y); ctx.stroke();
            }
        }
    });
    
    enemiesRef.current.forEach(enemy => {
        const enemySpawnFrame = enemy.spawnFrame || gameFrameRef.current;
        if (enemy.visualType === 'SPIKEBALL') {
            ctx.fillStyle = '#4B0082'; ctx.strokeStyle = '#2C004C'; ctx.lineWidth = 2;
            const spikes = 5; const outerRadius = enemy.size; const innerRadius = enemy.size * 0.5;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = (i % 2 === 0) ? outerRadius : innerRadius;
                const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2 + (enemySpawnFrame * 0.01);
                const xPoint = enemy.x + radius * Math.cos(angle);
                const yPoint = enemy.y + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(xPoint, yPoint); else ctx.lineTo(xPoint, yPoint);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.size * 0.25, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'black'; ctx.beginPath();
            let pupilOffsetX = 0, pupilOffsetY = 0;
            if (birdRef.current) {
                const angleToBird = Math.atan2(birdRef.current.y - enemy.y, birdRef.current.x - enemy.x);
                const maxPupilOffset = enemy.size * 0.08;
                pupilOffsetX = Math.cos(angleToBird) * maxPupilOffset; pupilOffsetY = Math.sin(angleToBird) * maxPupilOffset;
            }
            ctx.arc(enemy.x + pupilOffsetX, enemy.y + pupilOffsetY, enemy.size * 0.12, 0, Math.PI * 2); ctx.fill();
        } else if (enemy.visualType === 'GHOST') {
            ctx.save();
            ctx.globalAlpha = 0.6 + Math.sin(enemySpawnFrame * 0.05 + enemy.x * 0.1) * 0.15; 
            ctx.fillStyle = `rgba(173, 216, 230, ${0.5 + Math.sin(enemySpawnFrame * 0.05) * 0.2})`; 
            ctx.beginPath();
            const wobbleX = Math.sin(enemySpawnFrame * 0.1 + enemy.y * 0.05) * (enemy.size * 0.1);
            const wobbleY = Math.cos(enemySpawnFrame * 0.08 + enemy.x * 0.05) * (enemy.size * 0.1);
            ctx.ellipse(enemy.x + wobbleX, enemy.y + wobbleY, enemy.size, enemy.size * 1.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(0,0,0,${0.4 + Math.sin(enemySpawnFrame*0.05)*0.1})`;
            ctx.beginPath(); ctx.arc(enemy.x - enemy.size * 0.2 + wobbleX, enemy.y - enemy.size * 0.1, enemy.size * 0.1, 0, Math.PI * 2); ctx.fill(); 
            ctx.beginPath(); ctx.arc(enemy.x + enemy.size * 0.2 + wobbleX, enemy.y - enemy.size * 0.1, enemy.size * 0.1, 0, Math.PI * 2); ctx.fill(); 
            ctx.lineWidth = Math.max(1, enemy.size * 0.05);
            ctx.beginPath(); ctx.arc(enemy.x + wobbleX, enemy.y + enemy.size * 0.3, enemy.size * 0.25, 0.2 * Math.PI, 0.8 * Math.PI, false); ctx.stroke(); 
            ctx.restore();
        } else if (enemy.visualType === 'SPRITE') {
            const spriteConfig = ENEMY_TYPES.find(et => et.visualType === 'SPRITE');
            ctx.fillStyle = spriteConfig?.color || '#FF4500';
            ctx.strokeStyle = spriteConfig?.strokeColor || '#FF0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const angleOffset = enemySpawnFrame * 0.1;
            for (let i = 0; i < 5; i++) { 
                let angle = (i * 2 * Math.PI / 5) + angleOffset;
                let x1 = enemy.x + enemy.size * Math.cos(angle);
                let y1 = enemy.y + enemy.size * Math.sin(angle);
                ctx.lineTo(x1, y1);
                angle += (Math.PI / 5); 
                let x2 = enemy.x + (enemy.size * 0.5) * Math.cos(angle);
                let y2 = enemy.y + (enemy.size * 0.5) * Math.sin(angle);
                ctx.lineTo(x2, y2);
            }
            ctx.closePath(); ctx.fill(); ctx.stroke();
        }
    });

    ctx.save();
    ctx.translate(birdRef.current.x, birdRef.current.y);
    ctx.rotate(Math.max(-0.5, Math.min(0.5, birdRef.current.v * 0.05)));
    
    const birdDisplaySize = birdSize; 
    if (isPhasingRef.current) {
        ctx.globalAlpha = 0.5;
    }
    ctx.fillStyle = currentSkyPeckerConfig.color;
    ctx.beginPath(); ctx.arc(0, 0, birdDisplaySize, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = currentSkyPeckerConfig.stroke; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = currentSkyPeckerConfig.stroke; ctx.beginPath();
    ctx.ellipse(-birdDisplaySize/3, Math.sin(gameFrameRef.current * 0.5) * 5, birdDisplaySize/2, birdDisplaySize/4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(birdDisplaySize/3, -birdDisplaySize/4, birdDisplaySize/5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(birdDisplaySize/3 + 1, -birdDisplaySize/4, birdDisplaySize/8, 0, Math.PI*2); ctx.fill();
    if (isPhasingRef.current) {
        ctx.globalAlpha = 1.0;
    }
    ctx.restore();


    if (currentPowerupRef.current === 'shield' || godModeRef.current) {
        ctx.beginPath();
        ctx.arc(birdRef.current.x, birdRef.current.y, birdDisplaySize + 8 + Math.sin(gameFrameRef.current*0.2)*2, 0, Math.PI*2);
        ctx.strokeStyle = godModeRef.current ? 'rgba(255,215,0,0.7)' : 'rgba(0,255,255,0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
        if (powerupTimeRef.current < 180 && powerupTimeRef.current > 0 && powerupTimeRef.current % 30 < 15 && currentPowerupRef.current === 'shield') { 
             ctx.strokeStyle = 'rgba(255,0,0,0.7)'; ctx.stroke();
        }
    }
    
    gameParticlesRef.current.forEach(p => {
        if (!p.color || p.size === undefined || p.maxLife === undefined) return;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    meteorsRef.current.forEach(m => {
        m.trail.forEach((t, i) => {
            ctx.globalAlpha = t.life / 20 * 0.3; ctx.fillStyle = '#FFAA00';
            ctx.beginPath(); ctx.arc(t.x, t.y, 1 + i * 0.2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(m.x, m.y, 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFAA00'; ctx.beginPath(); ctx.arc(m.x, m.y, 1.5, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (screenShakeRef.current > 0) {
      ctx.restore(); 
    }
    
    updateHudData({
        score: scoreRef.current,
        powerGauge: powerGaugeRef.current,
        currentPowerup: currentPowerupRef.current,
        powerupTime: powerupTimeRef.current,
        difficulty: difficultyRef.current,
        perfectRun: perfectRunRef.current,
        combo: (comboRef.current > 0 && comboTimerRef.current > 0) ? comboRef.current : 0,
        activeDebuff: activeDebuffRef.current,
    });

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  }, [
    selectedSkyPeckerTypeIndex, 
    handleGameOver, 
    onCoinCollected, 
    onAchievementProgress, 
    spawnPowerup, 
    updateHudData,
    spawnEnemy,
    onPowerupUsed,
    canContinueRun, 
    onContinueRunRequested,
  ]);

  useEffect(() => {
    resetGame(); 

    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        canvas.style.width = `${CANVAS_WIDTH}px`;
        canvas.style.height = `${CANVAS_HEIGHT}px`;
        const ctx = canvas.getContext('2d');
        ctx?.scale(dpr, dpr);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      manageBackgroundMusic('', 'stop'); 
    };
  }, [resetGame]); 

  useEffect(() => {
    animationFrameIdRef.current = 0; // Ensure it's reset before starting
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((pausedRef.current && !isWaitingForContinueDecisionRef.current) && e.key.toLowerCase() !== 'p') return;


      switch (e.key.toLowerCase()) {
        case ' ': case 'arrowup':
          if (birdRef.current && !pausedRef.current && !isWaitingForContinueDecisionRef.current) {
            birdRef.current.v = birdRef.current.flapForce; 
            Sounds.flap();
          }
          break;
        case 'p':
          if(!isWaitingForContinueDecisionRef.current) { // Don't allow standard pause if waiting for continue decision
             pausedRef.current = !pausedRef.current;
          }
          break;
        case 'g':
          if (e.shiftKey) { 
            godModeRef.current = !godModeRef.current;
            toggleGodModeCallback(godModeRef.current); 
            Sounds.achievement();
          }
          break;
        case 't': if (godModeRef.current) spawnPowerup(); break;
        case 'c': if (godModeRef.current) { 
            const currentSkyPeckerConfigForPower = SKYPECKER_TYPES[birdRef.current!.typeIndex];
            const powerGaugeIncrease = 20 * (currentSkyPeckerConfigForPower.powerGaugeMultiplier || 1);
            onCoinCollected(50); 
            powerGaugeRef.current = Math.min(100, powerGaugeRef.current + powerGaugeIncrease * 50); 
        } break;
        case 's': if (godModeRef.current) scoreRef.current += 10; break;
        case 'd': if (godModeRef.current) difficultyRef.current = Math.min(difficultyRef.current + 0.5, 6.0); break;
      }
    };
    
    const handleCanvasClick = () => {
        if (birdRef.current && !pausedRef.current && !isWaitingForContinueDecisionRef.current) {
            birdRef.current.v = birdRef.current.flapForce; 
            Sounds.flap();
        }
    };

    const currentCanvas = canvasRef.current;
    document.addEventListener('keydown', handleKeyDown);
    currentCanvas?.addEventListener('click', handleCanvasClick);
    
    return () => {
      if(animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = 0;
      document.removeEventListener('keydown', handleKeyDown);
      currentCanvas?.removeEventListener('click', handleCanvasClick);
    };
  }, [gameLoop, spawnPowerup, onCoinCollected, toggleGodModeCallback]); 

  return (
    <canvas
      ref={canvasRef}
      className="block border-2 border-gray-700 rounded-lg shadow-2xl mx-auto"
      style={{ touchAction: 'none' }} 
    />
  );
});

export default GameEngine;
