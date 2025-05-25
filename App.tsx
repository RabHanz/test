
import React, { useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import GameEngine from './GameEngine';
import { GameMode, Achievements, PowerUpType, StoredProgress, SkyPeckerTypeConfig, EngineHudData, DebuffType, EnemyVisualType, DailyChallenge, GameEngineRef } from './types';
import { 
    SKYPECKER_TYPES, INITIAL_ACHIEVEMENTS, STARTING_POWERUP_OPTIONS, GAME_STORAGE_KEY, 
    SHOP_ITEM_COST_MULTIPLIER, CANVAS_WIDTH, CANVAS_HEIGHT, DEBUG_KEYS_INFO,
    POWERUP_OPTIONS, ENEMY_TYPES, DEBUFF_CONFIG, INITIAL_BIRD_R,
    DAILY_REWARD_COINS, DAILY_CHALLENGE_SCORE_TARGETS, DAILY_CHALLENGE_COIN_TARGETS,
    DAILY_CHALLENGE_REWARD_COINS, REWARDED_AD_FREE_COINS_AMOUNT, CONTINUE_RUN_AD_LIMIT,
    AD_SIMULATION_DURATION
} from './constants';
import { Sounds, setMasterBgmVolume, setMasterSfxVolume } from './utils';

interface SkyPeckerPreviewCanvasProps { 
  skyPeckerConfig: SkyPeckerTypeConfig; 
  size: number; 
}

const SkyPeckerPreviewCanvas: React.FC<SkyPeckerPreviewCanvasProps> = ({ skyPeckerConfig, size }) => { 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const birdDisplayRadius = (INITIAL_BIRD_R * skyPeckerConfig.size) * (size / (INITIAL_BIRD_R * 2.5));
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.save();
    ctx.translate(centerX, centerY);

    ctx.fillStyle = skyPeckerConfig.color;
    ctx.beginPath();
    ctx.arc(0, 0, birdDisplayRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = skyPeckerConfig.stroke;
    ctx.lineWidth = Math.max(1, birdDisplayRadius * 0.08);
    ctx.stroke();

    ctx.fillStyle = skyPeckerConfig.stroke;
    ctx.beginPath();
    const wingWidth = birdDisplayRadius / 1.5;
    const wingHeight = birdDisplayRadius / 3;
    ctx.ellipse(-birdDisplayRadius / 3, 0, wingWidth, wingHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    const eyeOuterRadius = birdDisplayRadius / 3.5;
    const eyeInnerRadius = birdDisplayRadius / 6;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(birdDisplayRadius / 3, -birdDisplayRadius / 4, eyeOuterRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(birdDisplayRadius / 3 + eyeOuterRadius / 4, -birdDisplayRadius / 4, eyeInnerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    ctx.moveTo(birdDisplayRadius * 0.9, -birdDisplayRadius * 0.15);
    ctx.lineTo(birdDisplayRadius * 1.3, 0);
    ctx.lineTo(birdDisplayRadius * 0.9, birdDisplayRadius * 0.15);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

  }, [skyPeckerConfig, size]);

  return <canvas ref={canvasRef} className="rounded-full"></canvas>;
};


const MenuButton: React.FC<{ onClick: () => void; selected?: boolean; children: ReactNode, className?: string, disabled?: boolean }> = 
({ onClick, selected, children, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full md:w-80 py-3 px-6 my-2 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
      ${disabled ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
        : selected ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900 ring-yellow-300' 
                   : 'bg-purple-600 hover:bg-purple-500 text-white ring-purple-400'} 
      ${className}`}
  >
    {children}
  </button>
);

const SkyPeckerDisplayCard: React.FC<{ 
    skyPecker: SkyPeckerTypeConfig, 
    isSelectedForGame?: boolean,
    isSelectedInShop?: boolean,
    isOwned: boolean,
    cost: number,
    canAfford: boolean,
    onSelectOrPurchase: () => void,
    currentCoins?: number,
}> = ({ skyPecker, isSelectedForGame, isSelectedInShop, isOwned, cost, canAfford, onSelectOrPurchase, currentCoins }) => { 
    
    let buttonText = '';
    let buttonAction = onSelectOrPurchase;
    let buttonDisabled = false;
    let buttonClass = 'bg-yellow-500 hover:bg-yellow-400 text-gray-900';

    if (isOwned) {
        if (isSelectedForGame) {
            buttonText = 'SELECTED';
            buttonDisabled = true;
            buttonClass = 'bg-green-600 text-white cursor-not-allowed';
        } else {
            buttonText = 'SELECT';
            buttonClass = 'bg-green-500 hover:bg-green-400 text-gray-900';
        }
    } else {
        buttonText = `BUY (${cost} Coins)`;
        if (!canAfford) {
            buttonDisabled = true;
            buttonClass = 'bg-red-700 text-red-300 cursor-not-allowed';
        }
    }

    return (
    <div 
        className={`p-4 rounded-xl shadow-xl transition-all duration-200 flex flex-col justify-between h-full
                    ${isSelectedInShop ? 'ring-4 ring-yellow-400 bg-purple-700' : 'bg-gray-800 hover:bg-gray-700'}`}
        onClick={!isSelectedForGame && isOwned ? onSelectOrPurchase : undefined}
    >
      <div>
        <div className="flex items-center mb-3">
            <SkyPeckerPreviewCanvas skyPeckerConfig={skyPecker} size={60}/>
            <h3 className="ml-4 text-2xl font-bold text-white">{skyPecker.name}</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3 h-16 overflow-y-auto">{skyPecker.description}</p>
        <div className="text-xs text-gray-400 space-y-1 mb-3">
            <p>Base Size: {skyPecker.size}x, Base Speed: {skyPecker.speed}x</p>
            {skyPecker.flapForceMultiplier !== 1 && <p>Flap Power: {skyPecker.flapForceMultiplier && skyPecker.flapForceMultiplier > 1 ? '+' : ''}{Math.round(((skyPecker.flapForceMultiplier || 1) - 1) * 100)}%</p>}
            {skyPecker.gravityMultiplier !== 1 && <p>Gravity Effect: {skyPecker.gravityMultiplier && skyPecker.gravityMultiplier > 1 ? '+' : ''}{Math.round(((skyPecker.gravityMultiplier || 1) - 1) * 100)}%</p>}
            {skyPecker.powerGaugeMultiplier !== 1 && <p>PWR Gauge Speed: +{Math.round(((skyPecker.powerGaugeMultiplier || 1) - 1) * 100)}%</p>}
            {skyPecker.canNegateDebuffOnce && <p className="text-green-400">Special: Ignores one debuff.</p>}
            {skyPecker.pipePhaseChance && <p className="text-purple-400">Special: {skyPecker.pipePhaseChance*100}% chance to phase pipes.</p>}
            {skyPecker.reviveOnce && <p className="text-orange-400">Special: Revives once per game.</p>}
        </div>
      </div>
      <button 
        onClick={onSelectOrPurchase}
        disabled={buttonDisabled}
        className={`w-full py-2.5 px-4 rounded-md font-semibold text-sm mt-2 transition-colors duration-150 ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};


const App: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('start');
  const [highScore, setHighScore] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievements>(() => JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)));
  const [selectedSkyPeckerTypeIndex, setSelectedSkyPeckerTypeIndex] = useState<number>(0); 
  const [ownedSkyPeckerIndices, setOwnedSkyPeckerIndices] = useState<number[]>([0]); 
  const [selectedStartPower, setSelectedStartPower] = useState<PowerUpType | null>(null);
  
  const [mainMenuSelection, setMainMenuSelection] = useState<number>(0); 
  const [shopSelection, setShopSelection] = useState<number>(0); 

  const [activeAchievementNotification, setActiveAchievementNotification] = useState<string | null>(null);
  const achievementTimeoutRef = useRef<number | null>(null);
  const [isGodModeActive, setIsGodModeActive] = useState<boolean>(false);

  const [bgmVolume, setBgmVolumeState] = useState<number>(0.3);
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.5);

  const [engineHud, setEngineHud] = useState<EngineHudData>({
    score: 0, powerGauge: 0, currentPowerup: null, powerupTime: 0, difficulty: 1, perfectRun: true, combo: 0, activeDebuff: null,
  });

  // ICP Features State
  const [hasRemovedAds, setHasRemovedAds] = useState<boolean>(false);
  const [lastDailyRewardClaimed, setLastDailyRewardClaimed] = useState<string | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [lastDailyChallengeCompleted, setLastDailyChallengeCompleted] = useState<string | null>(null);
  
  const [showAdOverlay, setShowAdOverlay] = useState<boolean>(false);
  type AdActionType = 'continueRun' | 'doubleCoins' | 'freeCoins' | 'dailyReward' | 'dailyChallengeReward' | 'interstitial';
  const [adActionType, setAdActionType] = useState<AdActionType | null>(null);
  const adRewardCallbackRef = useRef<(() => void) | null>(null);
  const gameEngineRef = useRef<GameEngineRef>(null);
  const continueRunCountThisGameSessionRef = useRef<number>(0);
  const coinsCollectedThisRunForGameOverScreenRef = useRef<number>(0);


  const saveProgress = useCallback(() => {
    const progressToStore: StoredProgress = { 
        highScore, totalCoins, achievements, 
        selectedSkyPeckerType: selectedSkyPeckerTypeIndex, 
        ownedSkyPeckerIndices,
        hasRemovedAds,
        lastDailyRewardClaimed,
        dailyChallenge,
        lastDailyChallengeCompleted
    };
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(progressToStore));
  }, [highScore, totalCoins, achievements, selectedSkyPeckerTypeIndex, ownedSkyPeckerIndices, hasRemovedAds, lastDailyRewardClaimed, dailyChallenge, lastDailyChallengeCompleted]);

  useEffect(() => {
    const storedProgressRaw = localStorage.getItem(GAME_STORAGE_KEY);
    if (storedProgressRaw) {
      try {
        const storedProgress = JSON.parse(storedProgressRaw) as StoredProgress;
        setHighScore(storedProgress.highScore || 0);
        setTotalCoins(storedProgress.totalCoins || 0);
        setOwnedSkyPeckerIndices(storedProgress.ownedSkyPeckerIndices && storedProgress.ownedSkyPeckerIndices.length > 0 ? storedProgress.ownedSkyPeckerIndices : [0]);
        
        const mergedAchievements = { ...INITIAL_ACHIEVEMENTS };
        for (const key in storedProgress.achievements) {
            if (mergedAchievements[key] && storedProgress.achievements[key]) {
                mergedAchievements[key].unlocked = storedProgress.achievements[key].unlocked;
                if (storedProgress.achievements[key].progress !== undefined) {
                     mergedAchievements[key].progress = storedProgress.achievements[key].progress;
                }
            }
        }
        setAchievements(mergedAchievements);
        setSelectedSkyPeckerTypeIndex(storedProgress.selectedSkyPeckerType || 0); 
        setHasRemovedAds(storedProgress.hasRemovedAds || false);
        setLastDailyRewardClaimed(storedProgress.lastDailyRewardClaimed || null);
        setDailyChallenge(storedProgress.dailyChallenge || null);
        setLastDailyChallengeCompleted(storedProgress.lastDailyChallengeCompleted || null);

      } catch (error) { console.error("Failed to parse stored progress:", error); localStorage.removeItem(GAME_STORAGE_KEY); }
    }
    setMasterBgmVolume(bgmVolume); 
    setMasterSfxVolume(sfxVolume); 
  }, []); // Load once on mount

  useEffect(() => { // Save whenever relevant state changes
    saveProgress();
  }, [saveProgress]);

  useEffect(() => { setMasterBgmVolume(bgmVolume); }, [bgmVolume]);
  useEffect(() => { setMasterSfxVolume(sfxVolume); }, [sfxVolume]);

  // Generate Daily Challenge
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!dailyChallenge || (lastDailyChallengeCompleted && lastDailyChallengeCompleted !== todayStr && dailyChallenge.completedToday) || (!dailyChallenge.completedToday && lastDailyChallengeCompleted !== todayStr) ) {
        const challengeType = Math.random() < 0.5 ? 'score' : 'coins';
        let target, description;
        if (challengeType === 'score') {
            target = DAILY_CHALLENGE_SCORE_TARGETS[Math.floor(Math.random() * DAILY_CHALLENGE_SCORE_TARGETS.length)];
            description = `Score ${target} points in a single run.`;
        } else {
            target = DAILY_CHALLENGE_COIN_TARGETS[Math.floor(Math.random() * DAILY_CHALLENGE_COIN_TARGETS.length)];
            description = `Collect ${target} coins in a single run.`;
        }
        setDailyChallenge({ type: challengeType, target, reward: DAILY_CHALLENGE_REWARD_COINS, completedToday: false, description });
        // If a new challenge is generated for a new day, reset lastDailyChallengeCompleted if it wasn't for today
        if(lastDailyChallengeCompleted !== todayStr) {
            setLastDailyChallengeCompleted(null); // Allow completing the new challenge
        }
    }
  }, [mode]); // Re-check when returning to start screen


  const showNotification = useCallback((message: string) => {
    if (achievementTimeoutRef.current) clearTimeout(achievementTimeoutRef.current);
    setActiveAchievementNotification(message);
    achievementTimeoutRef.current = window.setTimeout(() => setActiveAchievementNotification(null), 3500);
  }, []);

  const handleAchievementUnlocked = useCallback((achievementKey: string, achievementName: string) => {
    setAchievements(prev => {
      if (prev[achievementKey] && !prev[achievementKey].unlocked) {
        showNotification(achievementName); 
        Sounds.achievement();
        const newAchievements = { ...prev, [achievementKey]: { ...prev[achievementKey], unlocked: true, progress: prev[achievementKey].target || prev[achievementKey].progress } };
        
        const allSkyPeckersOwned = SKYPECKER_TYPES.every((_, index) => ownedSkyPeckerIndices.includes(index) || index === 0);
        if (allSkyPeckersOwned && achievementKey !== 'skyPeckerCollector' && newAchievements.skyPeckerCollector && !newAchievements.skyPeckerCollector.unlocked) {
           newAchievements.skyPeckerCollector = {...newAchievements.skyPeckerCollector, unlocked: true, progress: SKYPECKER_TYPES.length};
           setTimeout(() => showNotification(INITIAL_ACHIEVEMENTS.skyPeckerCollector.name), 500);
        }
        return newAchievements;
      }
      return prev;
    });
  }, [showNotification, ownedSkyPeckerIndices]); 

  useEffect(() => { 
    const allSkyPeckersOwned = SKYPECKER_TYPES.every((_, index) => ownedSkyPeckerIndices.includes(index));
    if (allSkyPeckersOwned && achievements.skyPeckerCollector && !achievements.skyPeckerCollector.unlocked) {
      handleAchievementUnlocked('skyPeckerCollector', INITIAL_ACHIEVEMENTS.skyPeckerCollector.name);
    }
  }, [ownedSkyPeckerIndices, achievements, handleAchievementUnlocked]);


  const handleCoinCollected = useCallback((value: number) => {
    setTotalCoins(prevTotalCoins => {
        const newTotal = prevTotalCoins + value;
        setAchievements(prevAch => {
            const coinCollectorAch = prevAch.coinCollector;
            let updatedAch = { ...prevAch };
            if (coinCollectorAch && !coinCollectorAch.unlocked) { 
                const target = coinCollectorAch.target || 50;
                const newProgress = Math.min((coinCollectorAch.progress || 0) + value, target);
                 updatedAch.coinCollector = { ...coinCollectorAch, progress: newProgress };
                if (newProgress >= target ) { // Check newProgress against target
                   handleAchievementUnlocked('coinCollector', coinCollectorAch.name);
                }
            }
            return updatedAch;
        });
        return newTotal;
    });
  }, [handleAchievementUnlocked]); 
  
  const handleAchievementProgress = useCallback((achievementKey: string, progressIncrement: number) => {
    setAchievements(prev => {
      const ach = prev[achievementKey];
      if (ach && !ach.unlocked) {
        const newProgress = (ach.progress || 0) + progressIncrement;
        if (ach.target && newProgress >= ach.target) {
          handleAchievementUnlocked(achievementKey, ach.name); 
          // Return previous state because handleAchievementUnlocked will set the new one
          // This avoids a double update if target is met exactly.
          return prev; 
        }
        return { ...prev, [achievementKey]: { ...ach, progress: newProgress } };
      }
      return prev;
    });
  }, [handleAchievementUnlocked]);

  const handlePowerupUsed = useCallback((type: PowerUpType) => {
    if (type) {
        handleAchievementProgress('powerMaster', 1);
        if(type === 'speed') handleAchievementProgress('speedDemon', 1);
    }
  }, [handleAchievementProgress]);

  const triggerAd = (type: AdActionType, callback: () => void) => {
    if (hasRemovedAds && type !== 'interstitial') { // Interstitials are skipped if ads removed
        callback();
        return;
    }
    if (type === 'interstitial' && hasRemovedAds) return; // Skip interstitial if ads removed

    setAdActionType(type);
    adRewardCallbackRef.current = callback;
    setShowAdOverlay(true);
  };

  const handleGameOver = useCallback((score: number, coinsCollectedThisRun: number, perfectRun: boolean) => {
    if (score > highScore) setHighScore(score);
    coinsCollectedThisRunForGameOverScreenRef.current = coinsCollectedThisRun;
    setEngineHud(prev => ({ ...prev, score, perfectRun }));
    
    // Daily Challenge Check
    if (dailyChallenge && !dailyChallenge.completedToday) {
        let challengeMet = false;
        if (dailyChallenge.type === 'score' && score >= dailyChallenge.target) challengeMet = true;
        if (dailyChallenge.type === 'coins' && coinsCollectedThisRun >= dailyChallenge.target) challengeMet = true;

        if (challengeMet) {
            showNotification(`Daily Challenge Complete! +${dailyChallenge.reward} Coins`);
            setTotalCoins(prev => prev + dailyChallenge.reward);
            const todayStr = new Date().toISOString().split('T')[0];
            setDailyChallenge(prev => prev ? {...prev, completedToday: true} : null);
            setLastDailyChallengeCompleted(todayStr);
            Sounds.achievement();
        }
    }
    
    if (!hasRemovedAds) {
        triggerAd('interstitial', () => setMode('over'));
    } else {
        setMode('over');
    }
  }, [highScore, dailyChallenge, hasRemovedAds, showNotification]);

  const startGame = () => { 
    continueRunCountThisGameSessionRef.current = 0; // Reset for new game session
    setMode('play'); 
    Sounds.uiConfirm(); 
  };
  const updateHudCb = useCallback((data: EngineHudData) => setEngineHud(data), []);
  const toggleGodModeCb = useCallback((isActive: boolean) => setIsGodModeActive(isActive), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAdOverlay) return; // Prevent menu navigation if ad is showing

      if (mode === 'start') {
        const menuItemsCount = 5; // Play, Customizer, How To Play, Achievements, Settings
        if (e.key === 'ArrowUp') setMainMenuSelection(prev => (prev - 1 + menuItemsCount) % menuItemsCount);
        else if (e.key === 'ArrowDown') setMainMenuSelection(prev => (prev + 1) % menuItemsCount);
        else if (e.key === 'Enter' || e.key === ' ') {
          Sounds.uiClick();
          if (mainMenuSelection === 0) startGame();
          else if (mainMenuSelection === 1) { setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); }
          else if (mainMenuSelection === 2) setMode('howtoplay');
          else if (mainMenuSelection === 3) setMode('achievements');
          else if (mainMenuSelection === 4) setMode('settings');
        }
      } else if (mode === 'shop') {
        if (e.key === 'ArrowUp') setShopSelection(prev => (prev - 1 + SKYPECKER_TYPES.length) % SKYPECKER_TYPES.length);
        else if (e.key === 'ArrowDown') setShopSelection(prev => (prev + 1) % SKYPECKER_TYPES.length);
        else if (e.key === 'Enter' || e.key === ' ') {
          const cost = shopSelection === 0 ? 0 : shopSelection * SHOP_ITEM_COST_MULTIPLIER;
          const isOwned = ownedSkyPeckerIndices.includes(shopSelection);
          if (isOwned) {
            setSelectedSkyPeckerTypeIndex(shopSelection); Sounds.uiConfirm(); setMode('start');
          } else if (totalCoins >= cost) {
            setTotalCoins(prev => prev - cost); setOwnedSkyPeckerIndices(prev => [...prev, shopSelection].sort((a,b)=>a-b));
            setSelectedSkyPeckerTypeIndex(shopSelection); Sounds.uiConfirm(); setMode('start');
          } else { Sounds.uiDeny(); }
        } else if (e.key === 'Escape') { setMode('start'); Sounds.uiClick(); }
      } else if (mode === 'achievements' || mode === 'howtoplay' || mode === 'settings') {
        if (e.key === 'Escape') { setMode('start'); Sounds.uiClick(); }
      } else if (mode === 'over') {
         if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { setMode('start'); Sounds.uiClick(); }
      }else if (mode === 'play') {
        if (e.key === 'Escape') { setMode('start'); Sounds.uiClick(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, mainMenuSelection, shopSelection, selectedSkyPeckerTypeIndex, totalCoins, ownedSkyPeckerIndices, startGame, showAdOverlay]);

  const handleContinueRunRequested = () => {
      triggerAd('continueRun', () => {
          gameEngineRef.current?.resumeAfterAdContinue();
          continueRunCountThisGameSessionRef.current++;
      });
  };
  
  const canContinueRun = continueRunCountThisGameSessionRef.current < CONTINUE_RUN_AD_LIMIT;


  const renderStartScreen = (): ReactNode => {
    const selectedSkyPecker = SKYPECKER_TYPES[selectedSkyPeckerTypeIndex];
    const menuOptions = ["PLAY GAME", "SKYPECKER CUSTOMIZER", "HOW TO PLAY", "ACHIEVEMENTS", "SETTINGS"]; 
    const today = new Date();
    const canClaimDailyReward = !lastDailyRewardClaimed || !isSameDay(new Date(lastDailyRewardClaimed), today);

    return (
    <div className="flex flex-col items-center justify-between h-full text-white p-4 space-y-3 md:space-y-4">
      <header className="text-center mt-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-wider mb-1 text-shadow-pop">SKYPECKER</h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400 tracking-wide text-shadow">POWERUP EDITION</h2>
      </header>

      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 w-full max-w-4xl">
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-2 mb-4 md:mb-0">
          {menuOptions.map((text, i) => (
            <MenuButton key={text}
              onClick={() => {
                setMainMenuSelection(i); Sounds.uiClick();
                if (i === 0) startGame();
                else if (i === 1) { setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); }
                else if (i === 2) setMode('howtoplay');
                else if (i === 3) setMode('achievements');
                else if (i === 4) setMode('settings');
              }}
              selected={mainMenuSelection === i}
            > {text} </MenuButton>
          ))}
           {/* Daily Reward Button */}
          <MenuButton 
            onClick={() => {
              if (canClaimDailyReward) {
                triggerAd('dailyReward', () => {
                  setTotalCoins(prev => prev + DAILY_REWARD_COINS);
                  setLastDailyRewardClaimed(new Date().toISOString());
                  showNotification(`Daily Reward! +${DAILY_REWARD_COINS} Coins`);
                  Sounds.coin();
                });
              }
            }}
            className={canClaimDailyReward ? "bg-green-600 hover:bg-green-500" : "bg-gray-600"}
            disabled={!canClaimDailyReward}
            selected={false} 
          >
            {canClaimDailyReward ? `CLAIM DAILY REWARD (+${DAILY_REWARD_COINS} Coins)` : "DAILY REWARD CLAIMED"}
          </MenuButton>
        </div>
        
        <div className="w-full md:w-1/2 p-4 bg-black/40 rounded-xl shadow-2xl backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-2 text-yellow-300 text-center">Selected SkyPecker</h3>
          <div className="flex justify-center mb-2">
            <SkyPeckerPreviewCanvas skyPeckerConfig={selectedSkyPecker} size={80}/>
          </div>
          <p className="text-md font-bold text-center mb-0.5">{selectedSkyPecker.name}</p>
          <p className="text-xs text-gray-300 text-center mb-2 h-8 overflow-y-auto">{selectedSkyPecker.description}</p>
          
          <div className="mb-3">
            <p className="text-sm mb-1 text-center text-gray-200">Starting Power-Up:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {STARTING_POWERUP_OPTIONS.map(opt => (
                <button key={opt.name} onClick={() => {setSelectedStartPower(opt.value); Sounds.uiClick();}}
                        className={`p-1.5 rounded-md text-xs font-medium transition-colors duration-150 truncate shadow-md
                                   ${selectedStartPower === opt.value ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}>
                  {opt.name}
                </button>          
              ))}
            </div>
          </div>
          {dailyChallenge && (
            <div className="mt-2 p-2 bg-purple-900/50 rounded-md">
              <h4 className="text-sm font-semibold text-yellow-200 mb-1">Daily Challenge:</h4>
              <p className="text-xs text-gray-200">{dailyChallenge.description}</p>
              <p className="text-xs text-gray-300">Reward: {dailyChallenge.reward} Coins</p>
              {dailyChallenge.completedToday && <p className="text-xs text-green-400 font-bold">COMPLETED TODAY!</p>}
            </div>
          )}
        </div>
      </div>
      <footer className="text-center pb-2">
        <p className="text-xs text-gray-400">ARROW KEYS or CLICK. ENTER/SPACE to select.</p>
        {/* <p className="text-xs text-gray-400">In-game: {DEBUG_KEYS_INFO}</p> */}
      </footer>
    </div>
  )};

  const renderShopScreen = (): ReactNode => (
    <div className="flex flex-col items-center h-full text-white p-4 overflow-y-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 my-6 text-shadow-lg">SKYPECKER CUSTOMIZER</h1>
      <p className="text-xl mb-6">My Coins: <span className="font-bold text-yellow-300">{totalCoins}</span></p>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SKYPECKER_TYPES.map((skyPecker, i) => {
          const cost = i === 0 ? 0 : i * SHOP_ITEM_COST_MULTIPLIER;
          const isOwned = ownedSkyPeckerIndices.includes(i);
          return (
            <SkyPeckerDisplayCard 
                key={skyPecker.name}
                skyPecker={skyPecker}
                isSelectedForGame={selectedSkyPeckerTypeIndex === i}
                isSelectedInShop={shopSelection === i}
                isOwned={isOwned}
                cost={cost}
                canAfford={totalCoins >= cost}
                currentCoins={totalCoins}
                onSelectOrPurchase={() => {
                    if (isOwned) {
                        setSelectedSkyPeckerTypeIndex(i); Sounds.uiConfirm(); 
                    } else if (totalCoins >= cost) {
                        setTotalCoins(prev => prev - cost); 
                        setOwnedSkyPeckerIndices(prev => [...prev, i].sort((a,b)=>a-b));
                        setSelectedSkyPeckerTypeIndex(i);
                        Sounds.uiConfirm();
                    } else {
                        Sounds.uiDeny();
                    }
                    setShopSelection(i);
                }}
            />
          );
        })}
      </div>
      <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} className="mt-8 md:w-auto">
        BACK TO MENU
      </MenuButton>
    </div>
  );

  const renderHowToPlayScreen = (): ReactNode => { /* ... same as before ... */ 
    const sectionTitleClass = "text-2xl font-bold text-yellow-400 mb-3 mt-5 border-b-2 border-yellow-500/50 pb-1";
    const textClass = "text-gray-200 leading-relaxed text-sm";
    const itemClass = "p-3.5 bg-black/30 rounded-lg mb-3 shadow-lg backdrop-blur-xs";
    const keyClass = "px-2 py-0.5 text-xs font-semibold text-gray-900 bg-gray-300 border border-gray-400 rounded shadow";
    const powerupColors: Record<string, string> = { shield: 'bg-cyan-400', slow: 'bg-blue-400', shrink: 'bg-pink-400', magnet: 'bg-yellow-400', speed: 'bg-red-400'};
    const enemyDebuffColors: Record<string, string> = { GHOST: 'bg-sky-300', SPRITE: 'bg-orange-400', SPIKEBALL: 'bg-indigo-400'};
    const debuffNameMapping: Record<DebuffType, string> = {
      HEAVY_WINGS: "Heavy Wings", FLAP_FATIGUE: "Flap Fatigue", SCREEN_LURCH: "Screen Lurch"
    };

    return (
    <div className="flex flex-col items-center h-full text-white p-4 md:p-6 overflow-y-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 my-6 text-shadow-lg">HOW TO PLAY</h1>
      <div className="w-full max-w-3xl space-y-5 text-left">
        <section>
          <h2 className={sectionTitleClass}>Controls</h2>
          <div className={itemClass}>
            <p className={textClass}><strong className="text-green-300">Flap:</strong> Press <kbd className={keyClass}>SPACE</kbd> or <kbd className={keyClass}>ARROW UP</kbd> or <strong className="text-green-300">CLICK/TAP</strong> game screen.</p>
            <p className={textClass}><strong className="text-green-300">Pause:</strong> Press <kbd className={keyClass}>P</kbd>.</p>
          </div>
        </section>
        <section>
          <h2 className={sectionTitleClass}>Objective</h2>
          <div className={itemClass}>
            <p className={textClass}>Guide your SkyPecker through pipe gaps to score. Collect coins to unlock diverse SkyPeckers in the "SkyPecker Customizer". Each SkyPecker has unique abilities!</p>
            <p className={textClass}>The challenge increases as you progress. Dodge pipes, environmental hazards, and beware of enemies that apply debuffs!</p>
          </div>
        </section>
        <section>
          <h2 className={sectionTitleClass}>Power-Ups</h2>
          <p className={`${textClass} mb-2`}>Fill the <strong className="text-yellow-300">PWR</strong> gauge by collecting coins. A full gauge activates a random power-up!</p>
          {POWERUP_OPTIONS.filter(p=>p).map(powerup => (
            <div key={powerup} className={`${itemClass} flex items-center`}>
              <span className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${powerupColors[powerup!] || 'bg-gray-400'}`}></span>
              <strong className="text-purple-300 capitalize mr-2 text-md">{powerup}:</strong>
              <span className="text-xs text-gray-300">
                {powerup === 'shield' && "Invincible to pipes & boundaries temporarily."}
                {powerup === 'slow' && "Slows down overall game speed."}
                {powerup === 'shrink' && "SkyPecker becomes smaller, aiding navigation."}
                {powerup === 'magnet' && "Pulls nearby coins towards you."}
                {powerup === 'speed' && "Boosts SkyPecker and game speed. High risk, potential high reward!"}
              </span>
            </div>
          ))}
        </section>
        <section>
          <h2 className={sectionTitleClass}>Enemies & Debuffs</h2>
          {ENEMY_TYPES.map(enemyConf => {
            const debuffConf = DEBUFF_CONFIG[enemyConf.debuffType];
            let debuffDesc = "";
            if (enemyConf.debuffType === 'HEAVY_WINGS') debuffDesc = `SkyPecker falls faster for ${Math.ceil(debuffConf.duration/60)}s.`;
            if (enemyConf.debuffType === 'FLAP_FATIGUE') debuffDesc = `Flap power reduced for ${Math.ceil(debuffConf.duration/60)}s.`;
            if (enemyConf.debuffType === 'SCREEN_LURCH') debuffDesc = `Brief, disorienting screen shake.`;
            return (
            <div key={enemyConf.visualType} className={`${itemClass} flex items-start`}>
                <span className={`w-4 h-4 rounded-full mr-3 mt-1 flex-shrink-0 ${enemyDebuffColors[enemyConf.visualType] || 'bg-gray-400'}`}></span>
                <div>
                    <strong className="text-purple-300 capitalize text-md">{enemyConf.visualType.toLowerCase().replace('_', ' ')}:</strong>
                    <p className="text-xs text-gray-300">Applies <strong className="text-red-300">{debuffNameMapping[enemyConf.debuffType]}</strong>. {debuffDesc}</p>
                </div>
            </div>
          )})}
        </section>
      </div>
      <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} className="mt-8 md:w-auto">
        BACK TO MENU
      </MenuButton>
    </div>
  )};

  const renderAchievementsScreen = (): ReactNode => ( /* ... same as before ... */ 
    <div className="flex flex-col items-center h-full text-white p-4 md:p-6 overflow-y-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 my-6 text-shadow-lg">ACHIEVEMENTS</h1>
      <div className="w-full max-w-2xl space-y-3">
        {Object.entries(achievements).map(([key, ach]) => (
          <div key={key} 
               className={`p-4 rounded-lg shadow-lg transition-all duration-300 border-2
                          ${ach.unlocked ? 'bg-green-700/80 border-green-500' : 'bg-gray-700/80 border-gray-600 opacity-80 hover:opacity-100'}`}>
            <div className="flex items-center mb-1.5">
              <span className={`text-3xl mr-3 ${ach.unlocked ? 'text-yellow-300 animate-bounce' : 'text-gray-500'}`}>🏆</span>
              <h3 className={`text-lg font-semibold ${ach.unlocked ? 'text-white' : 'text-gray-300'}`}>{ach.name}</h3>
            </div>
            <p className={`text-sm ${ach.unlocked ? 'text-green-200' : 'text-gray-400'}`}>{ach.desc}</p>
            {ach.target && !ach.unlocked && (ach.progress !== undefined && ach.progress < ach.target) &&
              <div className="mt-2.5">
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (ach.progress || 0) / ach.target * 100)}%` }}></div>
                </div>
                <p className="text-xs text-right text-yellow-300 mt-1">{ach.progress || 0} / {ach.target}</p>
              </div>
            }
          </div>
        ))}
      </div>
      <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} className="mt-8 md:w-auto">
        BACK TO MENU
      </MenuButton>
    </div>
  );

  const renderGameOverScreen = (): ReactNode => (
    <div className="flex flex-col items-center justify-center h-full text-white p-4 text-center">
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-red-500 mb-6 animate-bounce text-shadow-xl">GAME OVER</h1>
      <p className="text-4xl mb-3">Score: <span className="text-yellow-300 font-bold">{engineHud.score}</span></p>
      <p className="text-2xl mb-1">High Score: <span className="text-green-400 font-bold">{highScore}</span></p>
      <p className="text-lg mb-6">Coins This Run: <span className="text-yellow-500">{coinsCollectedThisRunForGameOverScreenRef.current}</span></p>

      {engineHud.score === highScore && engineHud.score > 0 && <p className="text-3xl text-yellow-200 mb-4 animate-pulse">NEW HIGH SCORE!</p>}
      {engineHud.perfectRun && engineHud.score > 0 && <p className="text-2xl text-green-300 mb-4">PERFECT RUN!</p>}

      <div className="space-y-3">
        {canContinueRun && (
            <MenuButton onClick={() => triggerAd('continueRun', () => {
                gameEngineRef.current?.resumeAfterAdContinue();
                continueRunCountThisGameSessionRef.current++; // Increment after ad success
                setMode('play');
            })} className="bg-blue-600 hover:bg-blue-500 md:w-auto px-10 py-3 text-xl">
                CONTINUE (Watch Ad)
            </MenuButton>
        )}
        {coinsCollectedThisRunForGameOverScreenRef.current > 0 && (
            <MenuButton onClick={() => triggerAd('doubleCoins', () => {
                setTotalCoins(prev => prev + coinsCollectedThisRunForGameOverScreenRef.current);
                showNotification(`+${coinsCollectedThisRunForGameOverScreenRef.current} Coins Doubled!`);
                Sounds.coin();
                coinsCollectedThisRunForGameOverScreenRef.current = 0; // Prevent re-doubling
            })} className="bg-teal-600 hover:bg-teal-500 md:w-auto px-10 py-3 text-xl">
                DOUBLE COINS (Watch Ad)
            </MenuButton>
        )}
        <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} className="md:w-auto px-10 py-4 text-2xl">
            PLAY AGAIN
        </MenuButton>
        <button onClick={() => console.log("Share Score:", engineHud.score)} 
                className="text-sm text-purple-300 hover:text-purple-200 mt-2">
          Share Score (Placeholder)
        </button>
      </div>
    </div>
  );

  const renderSettingsModal = (): ReactNode => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-md text-white relative">
            <button onClick={() => { setMode('start'); Sounds.uiClick(); }} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Settings</h2>
            <div className="space-y-6">
                <div>
                  <label htmlFor="bgmVolumeSet" className="text-sm text-gray-300 block mb-1">BGM Volume: {Math.round(bgmVolume*100)}%</label>
                  <input type="range" id="bgmVolumeSet" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e)=> setBgmVolumeState(parseFloat(e.target.value))} 
                         className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"/>
                </div>
                <div>
                  <label htmlFor="sfxVolumeSet" className="text-sm text-gray-300 block mb-1">SFX Volume: {Math.round(sfxVolume*100)}%</label>
                  <input type="range" id="sfxVolumeSet" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e)=> setSfxVolumeState(parseFloat(e.target.value))}
                         className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"/>
                </div>
                <MenuButton onClick={() => triggerAd('freeCoins', () => {
                    setTotalCoins(prev => prev + REWARDED_AD_FREE_COINS_AMOUNT);
                    showNotification(`+${REWARDED_AD_FREE_COINS_AMOUNT} Free Coins!`);
                    Sounds.coin();
                })} className="bg-green-600 hover:bg-green-500 w-full text-sm">
                    GET {REWARDED_AD_FREE_COINS_AMOUNT} FREE COINS (Ad)
                </MenuButton>
                <MenuButton 
                    onClick={() => {
                        setHasRemovedAds(true); 
                        showNotification("Ads Removed!"); 
                        Sounds.uiConfirm();
                    }} 
                    disabled={hasRemovedAds}
                    className="bg-blue-600 hover:bg-blue-500 w-full text-sm">
                    {hasRemovedAds ? "ADS REMOVED" : "REMOVE ADS (Simulated IAP)"}
                </MenuButton>
                <MenuButton onClick={() => console.log("Leaderboard Clicked")} className="bg-gray-600 hover:bg-gray-500 w-full text-sm">
                    LEADERBOARD (Placeholder)
                </MenuButton>
            </div>
        </div>
    </div>
  );

  const renderAdOverlay = (): ReactNode => {
    const [timer, setTimer] = useState(Math.floor(AD_SIMULATION_DURATION / 1000));
    const isInterstitial = adActionType === 'interstitial';
    const adTitle = isInterstitial ? "Advertisement" : "Watching Rewarded Ad";
    let adMessage = "";
    if (adActionType === 'continueRun') adMessage = "for a chance to continue your run!";
    if (adActionType === 'doubleCoins') adMessage = `to double your ${coinsCollectedThisRunForGameOverScreenRef.current} coins!`;
    if (adActionType === 'freeCoins') adMessage = `for ${REWARDED_AD_FREE_COINS_AMOUNT} free coins!`;
    if (adActionType === 'dailyReward') adMessage = `for your ${DAILY_REWARD_COINS} coin daily reward!`;
    if (adActionType === 'dailyChallengeReward') adMessage = `for your ${dailyChallenge?.reward} coin challenge reward!`;


    useEffect(() => {
        if (!showAdOverlay) return;
        setTimer(Math.floor(AD_SIMULATION_DURATION / 1000)); // Reset timer
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (isInterstitial) {
                        setShowAdOverlay(false);
                        setAdActionType(null);
                        adRewardCallbackRef.current?.();
                        adRewardCallbackRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [showAdOverlay, isInterstitial]);

    const handleClaim = () => {
        setShowAdOverlay(false);
        setAdActionType(null);
        adRewardCallbackRef.current?.();
        adRewardCallbackRef.current = null;
        Sounds.uiConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4 text-white text-center">
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">{adTitle}</h2>
            <p className="mb-2 text-lg">{adMessage}</p>
            <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-6">
                (Ad Placeholder)
            </div>
            {!isInterstitial && timer > 0 && <p className="mb-4">Claim reward in: {timer}s</p>}
            {!isInterstitial && timer === 0 && (
                <MenuButton onClick={handleClaim} className="bg-green-600 hover:bg-green-500 px-8 py-3">
                    CLAIM REWARD
                </MenuButton>
            )}
             {isInterstitial && <p className="text-sm text-gray-400">Ad will close automatically...</p>}
        </div>
    );
};


  const getDebuffDisplayName = (type: DebuffType | null): string => {
    if (!type) return "";
    return type.toLowerCase().replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const renderHud = (): ReactNode => ( /* ... same as before ... */ 
    <div className="absolute top-0 left-0 right-0 p-3 md:p-4 text-white pointer-events-none z-10 text-shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-start space-y-2">
          <div className="bg-black/70 p-3 rounded-lg shadow-xl backdrop-blur-sm">
            <p className="text-xl font-bold">Score: <span className="text-yellow-300">{engineHud.score}</span></p>
            <p className="text-sm">Best: <span className="text-green-300">{highScore}</span></p>
            <p className="text-sm">Coins: <span className="text-yellow-500">{totalCoins}</span></p>
            {engineHud.combo >= 2 && <p className="text-md font-semibold text-orange-400 animate-pulse">Combo: {engineHud.combo}x</p>}
            {isGodModeActive && <p className="text-xs text-red-400 animate-pulse mt-1">GOD MODE</p>}
          </div>
          <div className="bg-black/70 p-2 rounded-lg shadow-xl text-left backdrop-blur-sm">
            <p className="text-xs">Difficulty: {engineHud.difficulty.toFixed(1)}</p>
            {engineHud.perfectRun && engineHud.score > 0 && <p className="text-xs text-green-400">Perfect Run!</p>}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          {engineHud.currentPowerup && (
            <div className="bg-black/70 p-2 rounded-lg shadow-xl text-right backdrop-blur-sm">
              <p className="text-sm font-semibold capitalize text-cyan-300">{engineHud.currentPowerup}</p>
              <p className={`text-xs ${engineHud.powerupTime < 120 && engineHud.powerupTime > 0 && engineHud.powerupTime % 30 < 15 ? 'text-red-400 animate-ping' : 'text-gray-300'}`}>
                Time: {Math.ceil(engineHud.powerupTime / 60)}s
              </p>
            </div>
          )}
           {engineHud.activeDebuff && (
            <div className="bg-black/70 p-2 rounded-lg shadow-xl text-right backdrop-blur-sm">
              <p className="text-sm font-semibold capitalize text-red-400 animate-pulse">{getDebuffDisplayName(engineHud.activeDebuff.type)}</p>
              <p className="text-xs text-gray-300">
                Time: {Math.ceil(engineHud.activeDebuff.duration / 60)}s
              </p>
            </div>
          )}
          <div className="bg-black/70 p-1 rounded-full shadow-lg flex items-center h-6 w-24 backdrop-blur-sm">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 transition-all duration-300"
              style={{ width: `${engineHud.powerGauge}%` }}
            ></div>
            <span className="absolute left-1/2 transform -translate-x-1/2 text-xs font-bold text-black mix-blend-overlay">
              PWR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center overflow-hidden font-['Inter',_sans-serif]">
      <div className={`relative transition-opacity duration-500 ${mode === 'play' ? 'opacity-100' : 'opacity-100'}`}
           style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>

        {mode !== 'play' && (
             <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center">
                {mode === 'start' && renderStartScreen()}
                {mode === 'shop' && renderShopScreen()}
                {mode === 'achievements' && renderAchievementsScreen()}
                {mode === 'over' && renderGameOverScreen()}
                {mode === 'howtoplay' && renderHowToPlayScreen()}
                {mode === 'settings' && renderSettingsModal()}
             </div>
        )}
        
        {mode === 'play' && (
          <GameEngine
            ref={gameEngineRef} // Attach ref
            key={`${selectedSkyPeckerTypeIndex}-${selectedStartPower}-${ownedSkyPeckerIndices.join(',')}-${continueRunCountThisGameSessionRef.current}`} 
            selectedSkyPeckerTypeIndex={selectedSkyPeckerTypeIndex}
            selectedStartPower={selectedStartPower}
            onGameOver={handleGameOver}
            onCoinCollected={handleCoinCollected}
            onAchievementProgress={handleAchievementProgress}
            onPowerupUsed={handlePowerupUsed}
            updateHudData={updateHudCb}
            toggleGodModeCallback={toggleGodModeCb}
            canContinueRun={canContinueRun}
            onContinueRunRequested={handleContinueRunRequested}
          />
        )}
        {mode === 'play' && renderHud()}
        {activeAchievementNotification && (
          <div className="fixed top-5 sm:top-10 right-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 p-4 rounded-xl shadow-2xl z-50
                          transform transition-all duration-500 ease-out opacity-100 translate-x-0 animate-fade-in-down">
            <p className="font-bold text-lg flex items-center"><span className="text-2xl mr-2">🏆</span>Achievement Unlocked!</p>
            <p className="ml-8">{activeAchievementNotification}</p>
          </div>
        )}
         {showAdOverlay && renderAdOverlay()}
         {!hasRemovedAds && mode !== 'play' && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-700/80 flex items-center justify-center text-white text-sm z-20">
                (Banner Ad Placeholder)
            </div>
         )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .text-shadow-lg { text-shadow: 3px 3px 6px rgba(0,0,0,0.4); }
        .text-shadow-xl { text-shadow: 4px 4px 8px rgba(0,0,0,0.5); }
        .text-shadow-pop { text-shadow: 0 0 8px rgba(255,255,255,0.7), 0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(255,215,0,0.5); }
        .text-shadow-sm { text-shadow: 1px 1px 3px rgba(0,0,0,0.4); }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-25px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius:4px;}
        ::-webkit-scrollbar-thumb { background-color: rgba(139, 92, 246, 0.6); border-radius: 4px; border: 2px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background-color: rgba(139, 92, 246, 0.8); }
      `}</style>
    </div>
  );
};

export default App;
