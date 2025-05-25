
import React, { useState, useEffect, useCallback, ReactNode, useRef, useLayoutEffect } from 'react';
import GameEngine from './GameEngine';
import { GameMode, Achievements, PowerUpType, StoredProgress, SkyPeckerTypeConfig, EngineHudData, DebuffType, EnemyVisualType, DailyChallenge, GameEngineRef, SkyPeckerTrailEffect, LeaderboardEntry } from './types';
import { 
    SKYPECKER_TYPES, INITIAL_ACHIEVEMENTS, STARTING_POWERUP_OPTIONS, GAME_STORAGE_KEY, 
    SHOP_ITEM_COST_MULTIPLIER, CANVAS_WIDTH, CANVAS_HEIGHT, DEBUG_KEYS_INFO,
    POWERUP_OPTIONS, ENEMY_TYPES, DEBUFF_CONFIG, INITIAL_BIRD_R,
    DAILY_REWARD_COINS, DAILY_CHALLENGE_SCORE_TARGETS, DAILY_CHALLENGE_COIN_TARGETS,
    DAILY_CHALLENGE_REWARD_COINS, REWARDED_AD_FREE_COINS_AMOUNT, CONTINUE_RUN_AD_LIMIT,
    AD_SIMULATION_DURATION, SKYPECKER_TRAIL_EFFECTS, DEFAULT_TRAIL_ID, MOCK_LEADERBOARD_ENTRIES,
    MILESTONE_COIN_REWARD, MILESTONE_SCORE_INTERVAL
} from './constants';
import { Sounds, setMasterBgmVolume, setMasterSfxVolume, manageBackgroundMusic } from './utils';

interface SkyPeckerPreviewCanvasProps { 
  skyPeckerConfig: SkyPeckerTypeConfig; 
  size: number; 
  selectedTrail?: SkyPeckerTrailEffect | null; 
}

const SkyPeckerPreviewCanvas: React.FC<SkyPeckerPreviewCanvasProps> = ({ skyPeckerConfig, size, selectedTrail }) => { 
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

    // Simple background gradient for canvas
    const grad = ctx.createLinearGradient(0,0,0,size);
    grad.addColorStop(0, "rgba(200, 200, 255, 0.1)");
    grad.addColorStop(1, "rgba(150, 150, 200, 0.2)");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);


    if (selectedTrail) {
        const trailConfig = selectedTrail.particleConfig;
        let trailColor = trailConfig.color;
        if (trailColor === 'skypecker_primary') trailColor = skyPeckerConfig.color;
        else if (trailColor === 'skypecker_stroke') trailColor = skyPeckerConfig.stroke;
        
        ctx.fillStyle = trailColor || skyPeckerConfig.color;
        ctx.globalAlpha = 0.6;
        for(let i=0; i<3; i++) {
            const trailSize = (size / 9) * (1 - i*0.25);
            if (trailConfig.type === 'bubble') {
                 ctx.beginPath();
                 ctx.arc(size / 2 - (i * size*0.09) - size*0.12, size / 2 + (i*size*0.06) , trailSize, 0, Math.PI * 2);
                 ctx.fill();
            } else { 
                 ctx.beginPath();
                 ctx.arc(size / 2 - (i * size*0.12) - size*0.12, size / 2 , trailSize, 0, Math.PI * 2);
                 ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    const birdDisplayRadius = (INITIAL_BIRD_R * skyPeckerConfig.size) * (size / (INITIAL_BIRD_R * 3)); // Adjusted for better fit
    const centerX = size / 2;
    const centerY = size / 2;

    ctx.save();
    ctx.translate(centerX, centerY);

    ctx.fillStyle = skyPeckerConfig.color;
    ctx.beginPath();
    ctx.arc(0, 0, birdDisplayRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = skyPeckerConfig.stroke;
    ctx.lineWidth = Math.max(1.5, birdDisplayRadius * 0.1); // Thicker stroke
    ctx.stroke();

    // Simplified wing
    ctx.fillStyle = skyPeckerConfig.stroke;
    ctx.beginPath();
    ctx.ellipse(-birdDisplayRadius / 2.5, birdDisplayRadius * 0.1, birdDisplayRadius * 0.6, birdDisplayRadius * 0.35, Math.PI / 7, 0, Math.PI * 2);
    ctx.fill();

    const eyeOuterRadius = birdDisplayRadius / 3;
    const eyeInnerRadius = birdDisplayRadius / 5;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(birdDisplayRadius / 2.8, -birdDisplayRadius / 3.5, eyeOuterRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(birdDisplayRadius / 2.8 + eyeOuterRadius / 5, -birdDisplayRadius / 3.5 + eyeOuterRadius / 10, eyeInnerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FDBA74'; // Orange-300
    ctx.beginPath();
    ctx.moveTo(birdDisplayRadius * 0.8, -birdDisplayRadius * 0.1);
    ctx.lineTo(birdDisplayRadius * 1.25, 0);
    ctx.lineTo(birdDisplayRadius * 0.8, birdDisplayRadius * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

  }, [skyPeckerConfig, size, selectedTrail]);

  return <canvas ref={canvasRef} className="rounded-full shadow-lg"></canvas>;
};

const TrailDisplayCard: React.FC<{ 
    trailEffect: SkyPeckerTrailEffect, 
    isSelected: boolean,
    isOwned: boolean,
    canAfford: boolean,
    onSelectOrPurchase: () => void,
}> = ({ trailEffect, isSelected, isOwned, canAfford, onSelectOrPurchase }) => {
    let buttonText = '';
    let buttonDisabled = false;
    let buttonClass = 'bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold';

    if (isOwned) {
        if (isSelected) {
            buttonText = 'EQUIPPED';
            buttonDisabled = true;
            buttonClass = 'bg-green-600 text-white cursor-not-allowed font-semibold';
        } else {
            buttonText = 'EQUIP';
            buttonClass = 'bg-green-500 hover:bg-green-400 text-slate-900 font-semibold';
        }
    } else {
        buttonText = `BUY (${trailEffect.cost} Coins)`;
        if (!canAfford) {
            buttonDisabled = true;
            buttonClass = 'bg-red-700 hover:bg-red-600 text-red-100 cursor-not-allowed font-semibold';
        }
    }
    const particleTypePreview = trailEffect.particleConfig.type.split('_')[1] || trailEffect.particleConfig.type;

    return (
    <div 
        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between h-full backdrop-blur-md group
                    ${isSelected && isOwned ? 'ring-2 sm:ring-4 ring-teal-400 bg-purple-700/80' : 'bg-slate-800/70 hover:bg-slate-700/80 hover:-translate-y-1 hover:scale-[1.02]'}`}
        onClick={!isSelected && isOwned ? onSelectOrPurchase : undefined} 
        style={{cursor: (!isSelected && isOwned) ? 'pointer' : 'default'}}
    >
      <div>
        <div className="flex items-center mb-2 sm:mb-3">
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex items-center justify-center text-lg sm:text-xl shadow-inner" 
                  style={{backgroundColor: trailEffect.particleConfig.color === 'skypecker_primary' || trailEffect.particleConfig.color === 'skypecker_stroke' ? '#52525B' : trailEffect.particleConfig.color || '#71717A' }}>
                {trailEffect.particleConfig.color && (trailEffect.particleConfig.color.startsWith('skypecker_') || trailEffect.particleConfig.color.includes('rgba')) ? '🎨' : '✨'}
             </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">{trailEffect.name}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3 h-12 sm:h-14 overflow-y-auto custom-scrollbar">{trailEffect.description}</p>
        <p className="text-xs text-slate-400">Type: <span className="capitalize font-medium text-purple-300">{particleTypePreview}</span></p>
        <p className="text-xs text-slate-400">Cost: <span className="font-medium text-yellow-300">{trailEffect.cost} Coins</span></p>
      </div>
      <button 
        onClick={onSelectOrPurchase}
        disabled={buttonDisabled}
        className={`w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm mt-3 sm:mt-4 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
}


const MenuButton: React.FC<{ 
    onClick: () => void; 
    selected?: boolean; 
    children: ReactNode, 
    className?: string, 
    disabled?: boolean,
    variant?: 'primary' | 'secondary' | 'special' | 'zen' | 'daily';
}> = ({ onClick, selected, children, className, disabled, variant = 'primary' }) => {
    let baseClasses = "w-full py-2.5 px-4 my-1 text-sm sm:text-base sm:py-3 sm:px-5 sm:my-1.5 rounded-full shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center space-x-2 relative overflow-hidden";
    let colorClasses = "";
    let hoverEffectClass = "hover:brightness-110 hover:shadow-xl";

    switch(variant) {
        case 'secondary':
            colorClasses = selected 
                ? 'bg-purple-500 text-white ring-purple-300 font-semibold'
                : 'bg-slate-700 text-slate-200 ring-slate-500 font-medium';
            hoverEffectClass = selected ? 'hover:bg-purple-400' : 'hover:bg-slate-600';
            break;
        case 'special': 
            colorClasses = 'bg-green-500 text-white ring-green-300 font-semibold';
            hoverEffectClass = 'hover:bg-green-400';
            break;
        case 'zen':
             colorClasses = selected
                ? 'bg-sky-500 text-white ring-sky-300 font-semibold'
                : 'bg-sky-700 text-slate-100 ring-sky-500 font-medium';
            hoverEffectClass = selected ? 'hover:bg-sky-400' : 'hover:bg-sky-600';
            break;
        case 'daily':
            colorClasses = 'bg-amber-500 text-slate-900 ring-amber-300 font-semibold';
            hoverEffectClass = 'hover:bg-amber-400';
            break;
        case 'primary':
        default:
            colorClasses = selected 
                ? 'bg-teal-500 text-slate-900 ring-teal-300 font-bold sm:text-lg sm:py-3.5' // Adjusted primary selected
                : 'bg-purple-600 text-white ring-purple-400 font-semibold';
            hoverEffectClass = selected ? 'hover:bg-teal-400' : 'hover:bg-purple-500';
            if (!selected && !disabled) { // Add subtle glow for non-selected primary buttons
                baseClasses += " group"; // For pseudo-element hover
                children = <>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></span>
                    {children}
                </>;
            }
            break;
    }
    if (disabled) {
        colorClasses = 'bg-slate-600 text-slate-400 cursor-not-allowed ring-slate-500 font-medium opacity-70';
        hoverEffectClass = ''; // No hover effect for disabled
    } else {
        colorClasses += ' active:scale-95'; // Keep active scale
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${colorClasses} ${hoverEffectClass} ${className}`}
        >
            {children}
        </button>
    );
};

const SkyPeckerDisplayCard: React.FC<{ 
    skyPecker: SkyPeckerTypeConfig, 
    isSelectedForGame?: boolean,
    isSelectedInShop?: boolean,
    isOwned: boolean,
    cost: number,
    canAfford: boolean,
    onSelectOrPurchase: () => void,
    currentCoins?: number,
    selectedTrail?: SkyPeckerTrailEffect | null,
}> = ({ skyPecker, isSelectedForGame, isSelectedInShop, isOwned, cost, canAfford, onSelectOrPurchase, selectedTrail }) => { 
    
    let buttonText = '';
    let buttonDisabled = false;
    let buttonClass = 'bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold';

    if (isOwned) {
        if (isSelectedForGame) {
            buttonText = 'EQUIPPED';
            buttonDisabled = true;
            buttonClass = 'bg-green-600 text-white cursor-not-allowed font-semibold';
        } else {
            buttonText = 'EQUIP';
            buttonClass = 'bg-green-500 hover:bg-green-400 text-slate-900 font-semibold';
        }
    } else {
        buttonText = `UNLOCK (${cost} Coins)`;
        if (!canAfford) {
            buttonDisabled = true;
            buttonClass = 'bg-red-700 hover:bg-red-600 text-red-100 cursor-not-allowed font-semibold';
        }
    }

    return (
    <div 
        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between h-full backdrop-blur-md group
                    ${isSelectedInShop ? 'ring-2 sm:ring-4 ring-teal-400 bg-purple-700/80' : 'bg-slate-800/70 hover:bg-slate-700/80 hover:-translate-y-1 hover:scale-[1.02]'}`}
        onClick={!isSelectedForGame && isOwned ? onSelectOrPurchase : undefined}
        style={{cursor: (!isSelectedForGame && isOwned) ? 'pointer' : 'default'}}
    >
      <div>
        <div className="flex items-center mb-2 sm:mb-3">
            <SkyPeckerPreviewCanvas skyPeckerConfig={skyPecker} size={50} selectedTrail={selectedTrail} />
            <h3 className="ml-3 text-lg sm:text-xl font-bold text-slate-100">{skyPecker.name}</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3 h-14 sm:h-16 overflow-y-auto custom-scrollbar">{skyPecker.description}</p>
        <div className="text-xs text-slate-400 space-y-0.5 sm:space-y-1 mb-2 sm:mb-3">
            <p>Size: <span className="font-medium text-purple-300">{skyPecker.size}x</span>, Speed: <span className="font-medium text-purple-300">{skyPecker.speed}x</span></p>
            {skyPecker.flapForceMultiplier !== 1 && <p>Flap: <span className={`font-medium ${ (skyPecker.flapForceMultiplier || 1) > 1 ? 'text-green-400' : 'text-red-400'}`}>{skyPecker.flapForceMultiplier && skyPecker.flapForceMultiplier > 1 ? '+' : ''}{Math.round(((skyPecker.flapForceMultiplier || 1) - 1) * 100)}%</span></p>}
            {skyPecker.gravityMultiplier !== 1 && <p>Gravity: <span className={`font-medium ${ (skyPecker.gravityMultiplier || 1) < 1 ? 'text-green-400' : 'text-red-400'}`}>{skyPecker.gravityMultiplier && skyPecker.gravityMultiplier > 1 ? '+' : ''}{Math.round(((skyPecker.gravityMultiplier || 1) - 1) * 100)}%</span></p>}
            {skyPecker.powerGaugeMultiplier !== 1 && <p>PWR Gauge: <span className="font-medium text-yellow-300">+{Math.round(((skyPecker.powerGaugeMultiplier || 1) - 1) * 100)}%</span></p>}
            {skyPecker.canNegateDebuffOnce && <p className="text-sky-300">Special: Ignores one debuff.</p>}
            {skyPecker.pipePhaseChance && <p className="text-indigo-300">Special: {skyPecker.pipePhaseChance*100}% chance to phase.</p>}
            {skyPecker.reviveOnce && <p className="text-orange-300">Special: Revives once.</p>}
        </div>
      </div>
      <button 
        onClick={onSelectOrPurchase}
        disabled={buttonDisabled}
        className={`w-full py-2 px-3 sm:py-2.5 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm mt-2 sm:mt-3 transition-all duration-150 transform hover:scale-105 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${buttonClass}`}
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
  const [zenHighScore, setZenHighScore] = useState<number>(0); 
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievements>(() => JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)));
  const [selectedSkyPeckerTypeIndex, setSelectedSkyPeckerTypeIndex] = useState<number>(0); 
  const [ownedSkyPeckerIndices, setOwnedSkyPeckerIndices] = useState<number[]>([0]); 
  const [selectedStartPower, setSelectedStartPower] = useState<PowerUpType | null>(null);
  
  const [mainMenuSelection, setMainMenuSelection] = useState<number>(0); 
  const [shopSelection, setShopSelection] = useState<number>(0); 
  const [shopTab, setShopTab] = useState<'skypeckers' | 'trails'>('skypeckers'); 

  const [activeNotification, setActiveNotification] = useState<{id: string, message: string, type: 'achievement' | 'milestone' | 'reward' | 'info'} | null>(null);
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
  const notificationTimeoutRef = useRef<number | null>(null);
  const [isGodModeActive, setIsGodModeActive] = useState<boolean>(false);

  const [bgmVolume, setBgmVolumeState] = useState<number>(0.2); 
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.4); 

  const [engineHud, setEngineHud] = useState<EngineHudData>({
    score: 0, powerGauge: 0, currentPowerup: null, powerupTime: 0, difficulty: 1, perfectRun: true, combo: 0, activeDebuff: null, isZenMode: false,
  });

  const [hasRemovedAds, setHasRemovedAds] = useState<boolean>(false);
  const [lastDailyRewardClaimed, setLastDailyRewardClaimed] = useState<string | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [lastDailyChallengeCompleted, setLastDailyChallengeCompleted] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState<'settings' | 'leaderboard' | 'adOverlay' | null>(null);
  type AdActionType = 'continueRun' | 'doubleCoins' | 'freeCoins' | 'dailyReward' | 'dailyChallengeReward' | 'interstitial';
  const [adActionType, setAdActionType] = useState<AdActionType | null>(null);
  const adRewardCallbackRef = useRef<(() => void) | null>(null);
  const gameEngineRef = useRef<GameEngineRef>(null);
  const continueRunCountThisGameSessionRef = useRef<number>(0);
  const coinsCollectedThisRunForGameOverScreenRef = useRef<number>(0);

  const [ownedTrailEffectIds, setOwnedTrailEffectIds] = useState<string[]>([DEFAULT_TRAIL_ID]);
  const [selectedTrailEffectId, setSelectedTrailEffectId] = useState<string | null>(DEFAULT_TRAIL_ID);
  const [currentPlayedModeIsZen, setCurrentPlayedModeIsZen] = useState(false);
  const milestoneCountThisRunRef = useRef<number>(0);
  
  const [scale, setScale] = useState(1);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isGamePaused, setIsGamePaused] = useState<boolean>(false);


  // Calculate and apply scale for the game area
  const updateScale = useCallback(() => {
    const rootEl = document.getElementById('root');
    if (!rootEl || !gameAreaRef.current) return;

    const screenWidth = rootEl.clientWidth;
    const screenHeight = rootEl.clientHeight;
    
    const scaleX = screenWidth / CANVAS_WIDTH;
    const scaleY = screenHeight / CANVAS_HEIGHT;
    
    const newScale = Math.min(scaleX, scaleY);
    // Adjusted clamp: min 0.4, max 1.5 (or could be higher for large desktop screens)
    const finalScale = Math.max(0.4, Math.min(newScale, 1.5)); 
    setScale(finalScale);

    if (gameAreaRef.current) {
        gameAreaRef.current.style.transform = `scale(${finalScale})`;
        // Parent div already handles centering with flexbox
    }
  }, []);

  useLayoutEffect(() => { // Changed from useEffect to useLayoutEffect
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);


  const saveProgress = useCallback(() => {
    const progressToStore: StoredProgress = { 
        highScore, 
        zenHighScore, 
        totalCoins, achievements, 
        selectedSkyPeckerType: selectedSkyPeckerTypeIndex, 
        ownedSkyPeckerIndices,
        hasRemovedAds,
        lastDailyRewardClaimed,
        dailyChallenge,
        lastDailyChallengeCompleted,
        ownedTrailEffectIds,
        selectedTrailEffectId
    };
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(progressToStore));
  }, [highScore, zenHighScore, totalCoins, achievements, selectedSkyPeckerTypeIndex, ownedSkyPeckerIndices, hasRemovedAds, lastDailyRewardClaimed, dailyChallenge, lastDailyChallengeCompleted, ownedTrailEffectIds, selectedTrailEffectId]);

  useEffect(() => {
    const storedProgressRaw = localStorage.getItem(GAME_STORAGE_KEY);
    if (storedProgressRaw) {
      try {
        const storedProgress = JSON.parse(storedProgressRaw) as StoredProgress;
        setHighScore(storedProgress.highScore || 0);
        setZenHighScore(storedProgress.zenHighScore || 0);
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
        Object.keys(INITIAL_ACHIEVEMENTS).forEach(key => {
            if (!mergedAchievements[key]) {
                mergedAchievements[key] = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS[key]));
            }
        });

        setAchievements(mergedAchievements);
        setSelectedSkyPeckerTypeIndex(storedProgress.selectedSkyPeckerType || 0); 
        setHasRemovedAds(storedProgress.hasRemovedAds || false);
        setLastDailyRewardClaimed(storedProgress.lastDailyRewardClaimed || null);
        setDailyChallenge(storedProgress.dailyChallenge || null);
        setLastDailyChallengeCompleted(storedProgress.lastDailyChallengeCompleted || null);
        setOwnedTrailEffectIds(storedProgress.ownedTrailEffectIds || [DEFAULT_TRAIL_ID]);
        setSelectedTrailEffectId(storedProgress.selectedTrailEffectId || DEFAULT_TRAIL_ID);

      } catch (error) { console.error("Failed to parse stored progress:", error); localStorage.removeItem(GAME_STORAGE_KEY); }
    }
    setMasterBgmVolume(bgmVolume); 
    setMasterSfxVolume(sfxVolume); 
  }, []); // Empty dependency array for initial load

  useEffect(() => { 
    saveProgress();
  }, [saveProgress]);

  useEffect(() => { setMasterBgmVolume(bgmVolume); }, [bgmVolume]);
  useEffect(() => { setMasterSfxVolume(sfxVolume); }, [sfxVolume]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!dailyChallenge || (lastDailyChallengeCompleted && lastDailyChallengeCompleted !== todayStr && dailyChallenge.completedToday) || (!dailyChallenge.completedToday && lastDailyChallengeCompleted !== todayStr) ) {
        const challengeType = Math.random() < 0.5 ? 'score' : 'coins';
        let target, description;
        if (challengeType === 'score') {
            target = DAILY_CHALLENGE_SCORE_TARGETS[Math.floor(Math.random() * DAILY_CHALLENGE_SCORE_TARGETS.length)];
            description = `Score ${target} points in a single Normal Mode run.`;
        } else {
            target = DAILY_CHALLENGE_COIN_TARGETS[Math.floor(Math.random() * DAILY_CHALLENGE_COIN_TARGETS.length)];
            description = `Collect ${target} coins in a single run.`;
        }
        setDailyChallenge({ type: challengeType, target, reward: DAILY_CHALLENGE_REWARD_COINS, completedToday: false, description });
        if(lastDailyChallengeCompleted !== todayStr) {
            setLastDailyChallengeCompleted(null); 
        }
    }
  }, [mode]); // Re-check daily challenge when mode changes


  const showUINotification = useCallback((message: string, type: 'achievement' | 'milestone' | 'reward' | 'info' = 'info') => {
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    const id = Date.now().toString();
    setActiveNotification({id, message, type});
    setNotificationVisible(true); 
    
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotificationVisible(false);
      setTimeout(() => setActiveNotification(prev => prev && prev.id === id ? null : prev), 300);
    }, type === 'milestone' ? 2200 : 3200);
  }, []);

  const handleAchievementUnlocked = useCallback((achievementKey: string, achievementName: string) => {
    setAchievements(prev => {
      if (prev[achievementKey] && !prev[achievementKey].unlocked) {
        showUINotification(`Unlocked: ${achievementName}`, 'achievement'); 
        Sounds.achievement();
        const newAchievements = { ...prev, [achievementKey]: { ...prev[achievementKey], unlocked: true, progress: prev[achievementKey].target || prev[achievementKey].progress } };
        
        const allSkyPeckersOwned = SKYPECKER_TYPES.every((_, index) => ownedSkyPeckerIndices.includes(index) || index === 0);
        if (allSkyPeckersOwned && achievementKey !== 'skyPeckerCollector' && newAchievements.skyPeckerCollector && !newAchievements.skyPeckerCollector.unlocked) {
           newAchievements.skyPeckerCollector = {...newAchievements.skyPeckerCollector, unlocked: true, progress: SKYPECKER_TYPES.length};
           setTimeout(() => showUINotification(`Unlocked: ${INITIAL_ACHIEVEMENTS.skyPeckerCollector.name}`, 'achievement'), 500);
        }
        return newAchievements;
      }
      return prev;
    });
  }, [showUINotification, ownedSkyPeckerIndices]); 

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
                if (newProgress >= target ) { 
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
           return { ...prev, [achievementKey]: { ...ach, unlocked: true, progress: ach.target } };
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
    if (hasRemovedAds && type !== 'interstitial') {
      callback();
      return;
    }
    setAdActionType(type);
    adRewardCallbackRef.current = callback;
    setModalOpen('adOverlay');
  };

  const handleGameOver = useCallback((score: number, coinsCollectedThisRun: number, perfectRun: boolean, gameWasZenMode?: boolean) => {
    setIsGamePaused(false); // Ensure HTML pause menu is hidden
    if (gameWasZenMode) {
        if (score > zenHighScore) setZenHighScore(score);
        if (score >= 50) handleAchievementUnlocked('zenMaster', INITIAL_ACHIEVEMENTS.zenMaster.name);
    } else {
        if (score > highScore) setHighScore(score);
        if (dailyChallenge && !dailyChallenge.completedToday && dailyChallenge.type === 'score' && score >= dailyChallenge.target) {
            showUINotification(`Daily Challenge: +${dailyChallenge.reward} Coins!`, 'reward');
            setTotalCoins(prev => prev + dailyChallenge.reward);
            const todayStr = new Date().toISOString().split('T')[0];
            setDailyChallenge(prev => prev ? {...prev, completedToday: true} : null);
            setLastDailyChallengeCompleted(todayStr);
            Sounds.achievement();
        }
    }
    
    if (dailyChallenge && !dailyChallenge.completedToday && dailyChallenge.type === 'coins' && coinsCollectedThisRun >= dailyChallenge.target) {
        showUINotification(`Daily Challenge: +${dailyChallenge.reward} Coins!`, 'reward');
        setTotalCoins(prev => prev + dailyChallenge.reward);
        const todayStr = new Date().toISOString().split('T')[0];
        setDailyChallenge(prev => prev ? {...prev, completedToday: true} : null);
        setLastDailyChallengeCompleted(todayStr);
        Sounds.achievement();
    }

    if (milestoneCountThisRunRef.current >= 5 && !gameWasZenMode) {
        handleAchievementUnlocked('milestoneHunter', INITIAL_ACHIEVEMENTS.milestoneHunter.name);
    }

    coinsCollectedThisRunForGameOverScreenRef.current = coinsCollectedThisRun;
    setEngineHud(prev => ({ ...prev, score, perfectRun, isZenMode: gameWasZenMode }));
    
    triggerAd('interstitial', () => setMode('over'));
  }, [highScore, zenHighScore, dailyChallenge, hasRemovedAds, showUINotification, handleAchievementUnlocked]); 

  const handleMilestoneReached = useCallback((score: number, coins: number) => {
    setTotalCoins(prev => prev + coins);
    showUINotification(`+${coins} Coins! (Score: ${score})`, 'milestone');
    Sounds.milestone();
    milestoneCountThisRunRef.current +=1;
  }, [showUINotification]);

  const startGame = (isZen: boolean = false) => { 
    setCurrentPlayedModeIsZen(isZen);
    continueRunCountThisGameSessionRef.current = 0; 
    milestoneCountThisRunRef.current = 0; 
    setIsGamePaused(false); // Ensure pause menu is hidden when starting
    setMode('play'); 
    Sounds.uiConfirm(); 
  };
  const updateHudCb = useCallback((data: EngineHudData) => setEngineHud(data), []);
  const toggleGodModeCb = useCallback((isActive: boolean) => setIsGodModeActive(isActive), []);
  const handlePauseStateChange = useCallback((paused: boolean) => setIsGamePaused(paused), []);

  const handleQuitToMenu = () => {
    setIsGamePaused(false);
    manageBackgroundMusic('', 'stop'); // Explicitly stop BGM
    setMode('start');
    Sounds.uiClick();
  };

  const handleResumeGame = () => {
    gameEngineRef.current?.requestResume();
    // setIsGamePaused(false); // GameEngine will notify via onPauseStateChange
    Sounds.uiClick();
  };
  
  const handleRequestPauseFromHud = () => {
    gameEngineRef.current?.requestPause();
    Sounds.uiClick();
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalOpen || (isGamePaused && mode === 'play')) return; // Block menu navigation if HTML pause menu is up or other modals

      if (mode === 'start') {
        const menuItemsCount = 6; 
        if (e.key === 'ArrowUp') setMainMenuSelection(prev => (prev - 1 + menuItemsCount) % menuItemsCount);
        else if (e.key === 'ArrowDown') setMainMenuSelection(prev => (prev + 1) % menuItemsCount);
        else if (e.key === 'Enter' || e.key === ' ') {
          Sounds.uiClick();
          if (mainMenuSelection === 0) startGame(false); 
          else if (mainMenuSelection === 1) startGame(true); 
          else if (mainMenuSelection === 2) { setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); setShopTab('skypeckers');}
          else if (mainMenuSelection === 3) setMode('howtoplay');
          else if (mainMenuSelection === 4) setMode('achievements');
          else if (mainMenuSelection === 5) setModalOpen('settings');
        }
      } else if (mode === 'shop') {
          const itemsInCurrentTab = shopTab === 'skypeckers' ? SKYPECKER_TYPES.length : SKYPECKER_TRAIL_EFFECTS.length;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              setShopTab(prev => prev === 'skypeckers' ? 'trails' : 'skypeckers');
              setShopSelection(0); 
              Sounds.uiClick();
          } else if (e.key === 'ArrowUp') {
              setShopSelection(prev => (prev - 1 + itemsInCurrentTab) % itemsInCurrentTab);
              Sounds.uiClick();
          } else if (e.key === 'ArrowDown') {
              setShopSelection(prev => (prev + 1) % itemsInCurrentTab);
              Sounds.uiClick();
          } else if (e.key === 'Enter' || e.key === ' ') {
              if (shopTab === 'skypeckers') {
                  const cost = shopSelection === 0 ? 0 : shopSelection * SHOP_ITEM_COST_MULTIPLIER;
                  const isOwned = ownedSkyPeckerIndices.includes(shopSelection);
                  if (isOwned) {
                      setSelectedSkyPeckerTypeIndex(shopSelection); Sounds.uiConfirm(); setMode('start');
                  } else if (totalCoins >= cost) {
                      setTotalCoins(prev => prev - cost); setOwnedSkyPeckerIndices(prev => [...prev, shopSelection].sort((a,b)=>a-b));
                      setSelectedSkyPeckerTypeIndex(shopSelection); Sounds.uiConfirm(); setMode('start');
                  } else { Sounds.uiDeny(); }
              } else { 
                  const trail = SKYPECKER_TRAIL_EFFECTS[shopSelection];
                  const isOwned = ownedTrailEffectIds.includes(trail.id);
                  if (isOwned) {
                      setSelectedTrailEffectId(trail.id); Sounds.uiConfirm(); setMode('start');
                  } else if (totalCoins >= trail.cost) {
                      setTotalCoins(prev => prev - trail.cost); setOwnedTrailEffectIds(prev => [...prev, trail.id]);
                      setSelectedTrailEffectId(trail.id); Sounds.uiConfirm(); setMode('start');
                  } else { Sounds.uiDeny(); }
              }
          } else if (e.key === 'Escape') { setMode('start'); Sounds.uiClick(); }
      } else if (mode === 'achievements' || mode === 'howtoplay') {
        if (e.key === 'Escape') { setMode('start'); Sounds.uiClick(); }
      } else if (mode === 'over') {
         if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { setMode('start'); Sounds.uiClick(); }
      }else if (mode === 'play') {
        // 'P' for pause is handled inside GameEngine to toggle internal state and notify App
        // 'Escape' here could also trigger pause or quit, but for simplicity let 'P' be the main pause trigger.
        if (e.key === 'Escape' && !isGamePaused) { 
             handleRequestPauseFromHud(); // Use the same pause request as the HUD button
        } else if (e.key === 'Escape' && isGamePaused) {
            handleResumeGame(); // Escape from pause menu resumes
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, mainMenuSelection, shopSelection, shopTab, selectedSkyPeckerTypeIndex, totalCoins, ownedSkyPeckerIndices, ownedTrailEffectIds, selectedTrailEffectId, startGame, modalOpen, isGamePaused, handleResumeGame, handleRequestPauseFromHud]);

  const handleContinueRunRequested = () => {
      setIsGamePaused(false); // Hide any game-native pause indication if ad takes over.
      triggerAd('continueRun', () => {
          gameEngineRef.current?.resumeAfterAdContinue();
          setMode('play'); 
      });
  };
  
  const canContinueRun = continueRunCountThisGameSessionRef.current < CONTINUE_RUN_AD_LIMIT && !currentPlayedModeIsZen; 
  const currentSelectedTrailEffect = SKYPECKER_TRAIL_EFFECTS.find(t => t.id === selectedTrailEffectId) || SKYPECKER_TRAIL_EFFECTS.find(t=>t.id === DEFAULT_TRAIL_ID)!;


  const renderStartScreen = (): ReactNode => {
    const selectedSkyPecker = SKYPECKER_TYPES[selectedSkyPeckerTypeIndex];
    const today = new Date();
    const canClaimDailyReward = !lastDailyRewardClaimed || !isSameDay(new Date(lastDailyRewardClaimed), today);

    return (
    <div className="flex flex-col items-center justify-center h-full text-slate-100 p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4">
      <header className="text-center mt-2 sm:mt-4">
        <h1 className="text-4xl xs:text-5xl sm:text-6xl font-black tracking-wider mb-0.5 sm:mb-1 text-shadow-pop-light">SKYPECKER</h1>
        <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-teal-300 tracking-wide text-shadow-md">POWERUP EDITION</h2>
      </header>

      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6 w-full max-w-xs sm:max-w-sm md:max-w-3xl lg:max-w-4xl">
        <div className="w-full md:w-2/5 flex flex-col items-center space-y-1.5 sm:space-y-2 mb-4 md:mb-0">
          <MenuButton onClick={() => { setMainMenuSelection(0); Sounds.uiClick(); startGame(false);}} selected={mainMenuSelection === 0} variant="primary" className="max-w-xs"> PLAY GAME </MenuButton>
          <MenuButton onClick={() => { setMainMenuSelection(1); Sounds.uiClick(); startGame(true);}} selected={mainMenuSelection === 1} variant="zen" className="max-w-xs"> ZEN MODE </MenuButton>
          <MenuButton onClick={() => { setMainMenuSelection(2); Sounds.uiClick(); setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); setShopTab('skypeckers');}} selected={mainMenuSelection === 2} variant="secondary" className="max-w-xs"> CUSTOMIZER </MenuButton>
          <MenuButton onClick={() => { setMainMenuSelection(3); Sounds.uiClick(); setMode('howtoplay');}} selected={mainMenuSelection === 3} variant="secondary" className="max-w-xs"> HOW TO PLAY </MenuButton>
          <MenuButton onClick={() => { setMainMenuSelection(4); Sounds.uiClick(); setMode('achievements');}} selected={mainMenuSelection === 4} variant="secondary" className="max-w-xs"> ACHIEVEMENTS </MenuButton>
          <MenuButton onClick={() => { setMainMenuSelection(5); Sounds.uiClick(); setModalOpen('settings');}} selected={mainMenuSelection === 5} variant="secondary" className="max-w-xs"> SETTINGS </MenuButton>
          <MenuButton 
            onClick={() => {
              if (canClaimDailyReward) {
                triggerAd('dailyReward', () => {
                  setTotalCoins(prev => prev + DAILY_REWARD_COINS);
                  setLastDailyRewardClaimed(new Date().toISOString());
                  showUINotification(`Daily Reward: +${DAILY_REWARD_COINS} Coins!`, 'reward');
                  Sounds.coin();
                });
              }
            }}
            variant="daily"
            disabled={!canClaimDailyReward}
            selected={false} 
            className="max-w-xs"
          >
            {canClaimDailyReward ? <>🎁 CLAIM DAILY REWARD <span className="text-xs ml-1 hidden xs:inline"> (+{DAILY_REWARD_COINS})</span></> : "DAILY REWARD CLAIMED"}
          </MenuButton>
        </div>
        
        <div className="w-full md:w-3/5 p-3 sm:p-4 bg-slate-800/60 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-md">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-teal-300 text-center">Current Setup</h3>
            <div className="flex flex-col xs:flex-row justify-center items-center mb-2 sm:mb-3 xs:space-x-3">
                <SkyPeckerPreviewCanvas skyPeckerConfig={selectedSkyPecker} size={60} selectedTrail={currentSelectedTrailEffect}/>
                 <div className="mt-1 xs:mt-0">
                    <p className="text-lg sm:text-xl font-bold text-center text-slate-100">{selectedSkyPecker.name}</p>
                    <p className="text-xs text-purple-300 text-center">Trail: {currentSelectedTrailEffect.name}</p>
                 </div>
            </div>
            <p className="text-xs text-slate-300 text-center mb-2 sm:mb-3 h-8 xs:h-10 overflow-y-auto custom-scrollbar px-1 sm:px-2">{selectedSkyPecker.description}</p>
          
          <div className="mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm mb-1 sm:mb-1.5 text-center text-slate-200">Starting Power-Up (Normal):</p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {STARTING_POWERUP_OPTIONS.map(opt => (
                <button key={opt.name} onClick={() => {setSelectedStartPower(opt.value); Sounds.uiClick();}}
                        className={`py-1.5 px-1 sm:py-2 rounded-md sm:rounded-lg text-xs font-medium transition-all duration-150 shadow-md transform hover:scale-105 focus:outline-none focus:ring-1
                                   ${selectedStartPower === opt.value ? 'bg-teal-500 text-white ring-teal-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-200 ring-slate-500'}`}>
                  {opt.name}
                </button>          
              ))}
            </div>
          </div>
          {dailyChallenge && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-purple-800/50 rounded-lg sm:rounded-xl shadow-inner">
              <h4 className="text-xs sm:text-sm font-semibold text-yellow-300 mb-0.5 sm:mb-1">Daily Challenge:</h4>
              <p className="text-xs text-slate-200">{dailyChallenge.description}</p>
              <p className="text-xs text-slate-300">Reward: <span className="font-medium text-yellow-300">{dailyChallenge.reward} Coins</span></p>
              {dailyChallenge.completedToday && <p className="text-xs text-green-400 font-bold mt-0.5 sm:mt-1">COMPLETED TODAY!</p>}
            </div>
          )}
        </div>
      </div>
      <footer className="text-center pb-1 sm:pb-2 mt-auto">
        <p className="text-xs text-slate-400">ARROWS or CLICK. ENTER/SPACE to select.</p>
      </footer>
    </div>
  )};

  const renderShopScreen = (): ReactNode => (
    <div className="flex flex-col items-center h-full text-slate-100 p-2 xs:p-3 sm:p-4 overflow-y-auto custom-scrollbar">
      <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-teal-300 my-4 sm:my-6 tracking-wide text-shadow-lg-dark">CUSTOMIZER</h1>
      <p className="text-lg sm:text-xl mb-3 sm:mb-4">My Coins: <span className="font-bold text-yellow-300">{totalCoins}</span></p>
      <div className="flex space-x-2 sm:space-x-3 mb-4 sm:mb-6 bg-slate-900/50 p-1 sm:p-1.5 rounded-full shadow-md">
          <button 
              onClick={() => { setShopTab('skypeckers'); setShopSelection(0); Sounds.uiClick(); }}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ease-in-out
                          ${shopTab === 'skypeckers' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'}`}
          >SkyPeckers</button>
          <button 
              onClick={() => { setShopTab('trails'); setShopSelection(0); Sounds.uiClick(); }}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ease-in-out
                          ${shopTab === 'trails' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-300 hover:bg-slate-700/70 hover:text-white'}`}
          >Trails</button>
      </div>

      {shopTab === 'skypeckers' && (
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
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
                    selectedTrail={currentSelectedTrailEffect}
                    onSelectOrPurchase={() => {
                        if (isOwned) {
                            setSelectedSkyPeckerTypeIndex(i); Sounds.uiConfirm(); 
                        } else if (totalCoins >= cost) {
                            setTotalCoins(prev => prev - cost); 
                            setOwnedSkyPeckerIndices(prev => [...prev, i].sort((a,b)=>a-b));
                            setSelectedSkyPeckerTypeIndex(i);
                            Sounds.uiConfirm();
                        } else { Sounds.uiDeny(); }
                        setShopSelection(i);
                    }}
                />
            );
            })}
        </div>
      )}
      {shopTab === 'trails' && (
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
            {SKYPECKER_TRAIL_EFFECTS.map((trail, i) => {
                const isOwned = ownedTrailEffectIds.includes(trail.id);
                return (
                    <TrailDisplayCard
                        key={trail.id}
                        trailEffect={trail}
                        isSelected={selectedTrailEffectId === trail.id}
                        isOwned={isOwned}
                        canAfford={totalCoins >= trail.cost}
                        onSelectOrPurchase={() => {
                            if (isOwned) {
                                setSelectedTrailEffectId(trail.id); Sounds.uiConfirm();
                            } else if (totalCoins >= trail.cost) {
                                setTotalCoins(prev => prev - trail.cost);
                                setOwnedTrailEffectIds(prev => [...prev, trail.id]);
                                setSelectedTrailEffectId(trail.id);
                                Sounds.uiConfirm();
                            } else { Sounds.uiDeny(); }
                            setShopSelection(i);
                        }}
                    />
                );
            })}
        </div>
      )}
      <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} variant="secondary" className="mt-6 sm:mt-8 w-auto max-w-xs px-8 sm:px-10">
        BACK TO MENU
      </MenuButton>
       <p className="text-xs text-slate-400 mt-3 sm:mt-4">ARROW KEYS (L/R tabs, U/D select). ENTER/SPACE confirm.</p>
    </div>
  );

  const renderHowToPlayScreen = (): ReactNode => { 
    const sectionTitleClass = "text-xl sm:text-2xl font-bold text-teal-300 mb-2 sm:mb-3 mt-4 sm:mt-5 border-b-2 border-teal-500/30 pb-1 sm:pb-2 tracking-wide";
    const textClass = "text-slate-200 leading-relaxed text-xs sm:text-sm";
    const itemClass = "p-3 sm:p-4 bg-slate-800/60 rounded-lg sm:rounded-xl mb-3 sm:mb-4 shadow-lg backdrop-blur-sm";
    const keyClass = "px-1.5 py-0.5 text-xs font-semibold text-slate-900 bg-slate-300 border border-slate-400 rounded-sm shadow-sm mx-0.5";
    const powerupColors: Record<string, string> = { shield: 'bg-sky-500', slow: 'bg-blue-500', shrink: 'bg-pink-500', magnet: 'bg-yellow-500', speed: 'bg-red-500'};
    const enemyDebuffColors: Record<string, string> = { GHOST: 'bg-indigo-400', SPRITE: 'bg-orange-500', SPIKEBALL: 'bg-purple-500'};
    const debuffNameMapping: Record<DebuffType, string> = {
      HEAVY_WINGS: "Heavy Wings", FLAP_FATIGUE: "Flap Fatigue", SCREEN_LURCH: "Screen Lurch"
    };

    return (
    <div className="flex flex-col items-center h-full text-slate-100 p-2 xs:p-3 sm:p-4 overflow-y-auto custom-scrollbar">
      <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-teal-300 my-4 sm:my-6 tracking-wide text-shadow-lg-dark">HOW TO PLAY</h1>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl space-y-4 text-left">
        <section>
          <h2 className={sectionTitleClass}>Controls</h2>
          <div className={itemClass}>
            <p className={textClass}><strong className="text-green-300">Flap:</strong> Press <kbd className={keyClass}>SPACE</kbd> or <kbd className={keyClass}>ARROW UP</kbd> or <strong className="text-green-300">CLICK/TAP</strong> game screen.</p>
            <p className={textClass}><strong className="text-green-300">Pause:</strong> Press <kbd className={keyClass}>P</kbd> or tap the <strong className="text-teal-300">❚❚</strong> button in-game.</p>
          </div>
        </section>
        <section>
          <h2 className={sectionTitleClass}>Game Modes</h2>
           <div className={itemClass}>
            <strong className="text-purple-300 text-md sm:text-lg">Normal Mode:</strong>
            <p className={`${textClass} mt-1`}>Navigate your SkyPecker through pipes to score. Collect coins to unlock new SkyPeckers and stylish Trails. Dodge hazards and tricky enemies. Fill the <strong className="text-yellow-300">PWR</strong> gauge for awesome power-ups!</p>
          </div>
           <div className={itemClass}>
            <strong className="text-sky-300 text-md sm:text-lg">Zen Mode:</strong>
            <p className={`${textClass} mt-1`}>A serene and relaxing experience. No enemies, debuffs, or power-ups. Pipe gaps are wider and the pace is calmer. Perfect for unwinding and enjoying the flow.</p>
          </div>
        </section>
        <section>
          <h2 className={sectionTitleClass}>Power-Ups (Normal Mode)</h2>
          <p className={`${textClass} mb-2 sm:mb-3`}>Collect coins to fill the <strong className="text-yellow-300">PWR</strong> gauge. When full, a random power-up activates!</p>
          {POWERUP_OPTIONS.filter(p=>p).map(powerup => (
            <div key={powerup} className={`${itemClass} flex items-center space-x-2 sm:space-x-3`}>
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex-shrink-0 shadow-md ${powerupColors[powerup!] || 'bg-slate-400'}`}></span>
              <strong className="text-purple-300 capitalize text-sm sm:text-md">{powerup}:</strong>
              <span className="text-xs text-slate-300">
                {powerup === 'shield' && "Temporary invincibility."}
                {powerup === 'slow' && "Slows down game speed."}
                {powerup === 'shrink' && "SkyPecker becomes smaller."}
                {powerup === 'magnet' && "Pulls nearby coins."}
                {powerup === 'speed' && "Boosts speed. High risk!"}
              </span>
            </div>
          ))}
        </section>
        <section>
          <h2 className={sectionTitleClass}>Enemies & Debuffs (Normal Mode)</h2>
          {ENEMY_TYPES.map(enemyConf => {
            const debuffConf = DEBUFF_CONFIG[enemyConf.debuffType];
            let debuffDesc = "";
            if (enemyConf.debuffType === 'HEAVY_WINGS') debuffDesc = `SkyPecker falls faster for ${Math.ceil(debuffConf.duration/60)}s.`;
            if (enemyConf.debuffType === 'FLAP_FATIGUE') debuffDesc = `Flap power reduced for ${Math.ceil(debuffConf.duration/60)}s.`;
            if (enemyConf.debuffType === 'SCREEN_LURCH') debuffDesc = `Brief screen shake.`;
            return (
            <div key={enemyConf.visualType} className={`${itemClass} flex items-start space-x-2 sm:space-x-3`}>
                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mt-0.5 flex-shrink-0 shadow-md ${enemyDebuffColors[enemyConf.visualType] || 'bg-slate-400'}`}></span>
                <div>
                    <strong className="text-purple-300 capitalize text-sm sm:text-md">{enemyConf.visualType.toLowerCase().replace('_', ' ')}:</strong>
                    <p className="text-xs text-slate-300 mt-0.5">Applies <strong className="text-red-300">{debuffNameMapping[enemyConf.debuffType]}</strong>. {debuffDesc}</p>
                </div>
            </div>
          )})}
        </section>
      </div>
      <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} variant="secondary" className="mt-6 sm:mt-8 w-auto max-w-xs px-8 sm:px-10">
        BACK TO MENU
      </MenuButton>
    </div>
  )};

  const renderAchievementsScreen = (): ReactNode => ( 
    <div className="flex flex-col items-center h-full text-slate-100 p-2 xs:p-3 sm:p-4 overflow-y-auto custom-scrollbar">
      <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-teal-300 my-4 sm:my-6 tracking-wide text-shadow-lg-dark">ACHIEVEMENTS</h1>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg space-y-3 sm:space-y-4">
        {Object.entries(achievements).map(([key, ach]) => (
          <div key={key} 
               className={`p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 border-2 backdrop-blur-sm
                          ${ach.unlocked ? 'bg-green-700/60 border-green-500/70' : 'bg-slate-800/60 border-slate-700/70 opacity-80 hover:opacity-100'}`}>
            <div className="flex items-center mb-1.5 sm:mb-2">
              <span className={`text-2xl sm:text-3xl mr-2 sm:mr-3 ${ach.unlocked ? 'text-yellow-300 filter brightness-125' : 'text-slate-500'}`}>
                {ach.unlocked ? '🌟' : '🏆'}
              </span>
              <h3 className={`text-sm sm:text-base font-semibold ${ach.unlocked ? 'text-slate-100' : 'text-slate-300'}`}>{ach.name}</h3>
            </div>
            <p className={`text-xs sm:text-sm ${ach.unlocked ? 'text-green-200' : 'text-slate-400'}`}>{ach.desc}</p>
            {ach.target && !ach.unlocked && (ach.progress !== undefined && ach.progress < ach.target) &&
              <div className="mt-2 sm:mt-3">
                <div className="w-full bg-slate-700 rounded-full h-2.5 sm:h-3.5 shadow-inner">
                  <div className="bg-teal-500 h-2.5 sm:h-3.5 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (ach.progress || 0) / ach.target * 100)}%` }}></div>
                </div>
                <p className="text-xs text-right text-teal-300 mt-1 sm:mt-1.5">{(ach.progress || 0)} / {ach.target}</p>
              </div>
            }
          </div>
        ))}
      </div>
      <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} variant="secondary" className="mt-6 sm:mt-8 w-auto max-w-xs px-8 sm:px-10">
        BACK TO MENU
      </MenuButton>
    </div>
  );

  const renderGameOverScreen = (): ReactNode => {
    const currentModeHighScore = currentPlayedModeIsZen ? zenHighScore : highScore;
    const modeName = currentPlayedModeIsZen ? "Zen Mode" : "Normal Mode";
    return (
    <div className="flex flex-col items-center justify-center h-full text-slate-100 p-3 sm:p-4 text-center">
      <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black text-red-500 mb-2 sm:mb-3 filter brightness-110 text-shadow-xl-dark">GAME OVER</h1>
      <p className="text-lg sm:text-xl mb-3 sm:mb-4 text-sky-300">({modeName})</p>
      <p className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">Score: <span className="text-yellow-300 font-bold">{engineHud.score}</span></p>
      <p className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-1.5">High Score ({modeName}): <span className="text-green-300 font-bold">{currentModeHighScore}</span></p>
      <p className="text-base sm:text-lg mb-4 sm:mb-6">Coins This Run: <span className="text-yellow-400">{coinsCollectedThisRunForGameOverScreenRef.current}</span></p>

      {engineHud.score === currentModeHighScore && engineHud.score > 0 && <p className="text-xl sm:text-2xl md:text-3xl text-yellow-200 mb-3 sm:mb-4 animate-pulse">🎉 NEW HIGH SCORE! 🎉</p>}
      {engineHud.perfectRun && engineHud.score > 0 && !currentPlayedModeIsZen && <p className="text-lg sm:text-xl md:text-2xl text-teal-300 mb-3 sm:mb-4">✨ PERFECT RUN! ✨</p>}

      <div className="space-y-2.5 sm:space-y-3 mt-1 sm:mt-2">
        {canContinueRun && ( 
            <MenuButton onClick={() => triggerAd('continueRun', () => {
                gameEngineRef.current?.resumeAfterAdContinue();
                setMode('play');
            })} variant="special" className="bg-sky-600 hover:bg-sky-500 text-white w-auto max-w-xs px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base">
                CONTINUE (Ad)
            </MenuButton>
        )}
        {coinsCollectedThisRunForGameOverScreenRef.current > 0 && (
            <MenuButton onClick={() => triggerAd('doubleCoins', () => {
                setTotalCoins(prev => prev + coinsCollectedThisRunForGameOverScreenRef.current);
                showUINotification(`+${coinsCollectedThisRunForGameOverScreenRef.current} Coins Doubled!`, 'reward');
                Sounds.coin();
                coinsCollectedThisRunForGameOverScreenRef.current = 0; 
            })} variant="special" className="bg-amber-500 hover:bg-amber-400 text-slate-900 w-auto max-w-xs px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base">
                DOUBLE COINS (Ad)
            </MenuButton>
        )}
        <MenuButton onClick={() => { setMode('start'); Sounds.uiClick(); }} variant="primary" className="w-auto max-w-xs px-8 sm:px-10 py-2.5 sm:py-3 text-base sm:text-lg">
            PLAY AGAIN
        </MenuButton>
        <button onClick={() => console.log("Share Score (Mock):", engineHud.score)} 
                className="text-xs sm:text-sm text-purple-300 hover:text-purple-200 mt-2 sm:mt-3 transition-colors">
          Share Score (Mock)
        </button>
      </div>
    </div>
  )};

  const renderSettingsModal = (): ReactNode => (
    <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-3 sm:p-4 
                    transition-opacity duration-300 ease-in-out ${modalOpen === 'settings' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-slate-800/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-sm text-slate-100 relative border border-slate-700
                         transform transition-all duration-300 ease-in-out ${modalOpen === 'settings' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <button onClick={() => { setModalOpen(null); Sounds.uiClick(); }} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-slate-400 hover:text-white text-2xl sm:text-3xl transition-colors">&times;</button>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-300 mb-6 sm:mb-8 text-center tracking-wide">Settings</h2>
            <div className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="bgmVolumeSet" className="text-xs sm:text-sm text-slate-300 block mb-1 sm:mb-1.5">BGM Volume: {Math.round(bgmVolume*100)}%</label>
                  <input type="range" id="bgmVolumeSet" min="0" max="1" step="0.01" value={bgmVolume} onChange={(e)=> setBgmVolumeState(parseFloat(e.target.value))} 
                         className="w-full h-2 sm:h-2.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500"/>
                </div>
                <div>
                  <label htmlFor="sfxVolumeSet" className="text-xs sm:text-sm text-slate-300 block mb-1 sm:mb-1.5">SFX Volume: {Math.round(sfxVolume*100)}%</label>
                  <input type="range" id="sfxVolumeSet" min="0" max="1" step="0.01" value={sfxVolume} onChange={(e)=> setSfxVolumeState(parseFloat(e.target.value))}
                         className="w-full h-2 sm:h-2.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-500"/>
                </div>
                <MenuButton onClick={() => triggerAd('freeCoins', () => {
                    setTotalCoins(prev => prev + REWARDED_AD_FREE_COINS_AMOUNT);
                    showUINotification(`+${REWARDED_AD_FREE_COINS_AMOUNT} Free Coins!`, 'reward');
                    Sounds.coin();
                })} variant="special" className="w-full text-xs sm:text-sm py-2 sm:py-2.5">
                    GET {REWARDED_AD_FREE_COINS_AMOUNT} FREE COINS (Ad)
                </MenuButton>
                <MenuButton 
                    onClick={() => {
                        setHasRemovedAds(true); 
                        showUINotification("Ads Removed!", 'info'); 
                        Sounds.uiConfirm();
                    }} 
                    disabled={hasRemovedAds}
                     variant="special" className={`${hasRemovedAds ? 'bg-slate-600 hover:bg-slate-600' : 'bg-sky-600 hover:bg-sky-500'} w-full text-xs sm:text-sm py-2 sm:py-2.5`}>
                    {hasRemovedAds ? "ADS REMOVED" : "REMOVE ADS (IAP)"}
                </MenuButton>
                <MenuButton onClick={() => { setModalOpen('leaderboard'); Sounds.uiClick(); }} variant="secondary" className="w-full text-xs sm:text-sm py-2 sm:py-2.5">
                    LEADERBOARD
                </MenuButton>
            </div>
        </div>
    </div>
  );

  const renderLeaderboardScreen = (): ReactNode => {
    const displayedLeaderboard = [...MOCK_LEADERBOARD_ENTRIES].sort((a, b) => b.score - a.score);
    let playerNormalRank = -1, playerZenRank = -1;

    if (highScore > 0) {
        const potentialRank = displayedLeaderboard.findIndex(entry => highScore > entry.score);
        if (potentialRank !== -1) {
            displayedLeaderboard.splice(potentialRank, 0, { name: "YOU (Normal)", score: highScore, isPlayer: true });
        } else if (displayedLeaderboard.length < 10) {
            displayedLeaderboard.push({ name: "YOU (Normal)", score: highScore, isPlayer: true });
        }
        displayedLeaderboard.sort((a, b) => b.score - a.score);
        if (displayedLeaderboard.length > 10) displayedLeaderboard.length = 10;
        playerNormalRank = displayedLeaderboard.findIndex(e => e.isPlayer && e.name.includes("Normal")) +1;
    }
    
    if (zenHighScore > 0) {
        const zenAlreadyShownByNormal = displayedLeaderboard.find(e => e.isPlayer && e.name.includes("Normal") && e.score === zenHighScore);
        if (!zenAlreadyShownByNormal) {
            const potentialZenRank = displayedLeaderboard.findIndex(entry => zenHighScore > entry.score && !entry.isPlayer); 
             if (potentialZenRank !== -1 && displayedLeaderboard.findIndex(e=> e.isPlayer && e.score === zenHighScore) === -1) { 
                displayedLeaderboard.splice(potentialZenRank, 0, { name: "YOU (Zen)", score: zenHighScore, isPlayer: true });
            } else if (displayedLeaderboard.length < 10 && displayedLeaderboard.findIndex(e=> e.isPlayer && e.score === zenHighScore) === -1) {
                 displayedLeaderboard.push({ name: "YOU (Zen)", score: zenHighScore, isPlayer: true });
            }
        }
        displayedLeaderboard.sort((a, b) => b.score - a.score);
        if (displayedLeaderboard.length > 10) displayedLeaderboard.length = 10;
        playerZenRank = displayedLeaderboard.findIndex(e => e.isPlayer && e.name.includes("Zen")) + 1;
    }

    const finalLeaderboard = displayedLeaderboard.reduce((acc, current) => {
        if (current.isPlayer) {
            const existingPlayerEntry = acc.find(e => e.isPlayer && e.score === current.score);
            if (existingPlayerEntry) { 
                if (current.name.includes("Normal") && !existingPlayerEntry.name.includes("Normal")) { 
                    return acc.filter(e => !(e.isPlayer && e.score === current.score)).concat([current]);
                }
                return acc; 
            }
        }
        return acc.concat([current]);
    }, [] as LeaderboardEntry[]).sort((a,b) => b.score - a.score).slice(0,10);


    return (
        <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-3 sm:p-4
                        transition-opacity duration-300 ease-in-out ${modalOpen === 'leaderboard' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-slate-800/90 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-sm text-slate-100 relative border border-slate-700
                             transform transition-all duration-300 ease-in-out ${modalOpen === 'leaderboard' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <button onClick={() => { setModalOpen('settings'); Sounds.uiClick(); }} className="absolute top-2 sm:top-3 right-2 sm:right-3 text-slate-400 hover:text-white text-2xl sm:text-3xl transition-colors">&times;</button>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-300 mb-6 sm:mb-8 text-center tracking-wide">Leaderboard <span className="text-xs sm:text-sm text-slate-400">(Mock)</span></h2>
                <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
                    {finalLeaderboard.map((entry, index) => (
                        <div key={index} className={`flex justify-between items-center p-2 sm:p-3 rounded-md sm:rounded-lg shadow-md
                                                    ${entry.isPlayer ? 'bg-purple-600/80 ring-1 sm:ring-2 ring-purple-400/70' : 'bg-slate-700/70'}`}>
                            <span className={`font-medium text-xs sm:text-sm ${entry.isPlayer ? 'text-yellow-200' : 'text-slate-200'}`}>
                                <span className="inline-block w-5 sm:w-6 text-left">{index + 1}.</span>{entry.name}
                            </span>
                            <span className={`font-bold text-sm sm:text-lg ${entry.isPlayer ? 'text-yellow-100' : 'text-teal-300'}`}>{entry.score}</span>
                        </div>
                    ))}
                    {playerNormalRank === 0 && highScore > 0 && !finalLeaderboard.find(e=> e.isPlayer && e.name.includes("Normal")) && (
                         <div className="flex justify-between items-center p-2 sm:p-3 rounded-md sm:rounded-lg bg-purple-700/70 mt-2 sm:mt-3 border-t-2 border-purple-500/50 pt-2 sm:pt-3">
                            <span className="font-medium text-xs sm:text-sm text-yellow-300">... Your Rank (Normal)</span>
                            <span className="font-bold text-sm sm:text-lg text-yellow-200">{highScore}</span>
                        </div>
                    )}
                     {playerZenRank === 0 && zenHighScore > 0 && !finalLeaderboard.find(e=> e.isPlayer && e.name.includes("Zen")) && (
                         <div className="flex justify-between items-center p-2 sm:p-3 rounded-md sm:rounded-lg bg-sky-700/70 mt-2 sm:mt-3 border-t-2 border-sky-500/50 pt-2 sm:pt-3">
                            <span className="font-medium text-xs sm:text-sm text-yellow-300">... Your Rank (Zen)</span>
                            <span className="font-bold text-sm sm:text-lg text-yellow-200">{zenHighScore}</span>
                        </div>
                    )}
                </div>
                <MenuButton onClick={() => { setModalOpen('settings'); Sounds.uiClick(); }} variant="secondary" className="mt-6 sm:mt-8 w-full text-xs sm:text-sm py-2 sm:py-2.5">
                    BACK TO SETTINGS
                </MenuButton>
            </div>
        </div>
    );
  };

  const renderAdOverlay = (): ReactNode => {
    const [timer, setTimer] = useState(Math.floor(AD_SIMULATION_DURATION / 1000));
    const isInterstitial = adActionType === 'interstitial';
    const adTitle = isInterstitial ? "Advertisement" : "Rewarded Ad";
    let adMessage = "";
    if (adActionType === 'continueRun') adMessage = "Watch to continue your run!";
    if (adActionType === 'doubleCoins') adMessage = `Watch to double your ${coinsCollectedThisRunForGameOverScreenRef.current} coins!`;
    if (adActionType === 'freeCoins') adMessage = `Watch for ${REWARDED_AD_FREE_COINS_AMOUNT} free coins!`;
    if (adActionType === 'dailyReward') adMessage = `Watch for your ${DAILY_REWARD_COINS} coin daily reward!`;
    if (adActionType === 'dailyChallengeReward') adMessage = `Watch for your ${dailyChallenge?.reward} coin challenge reward!`;


    useEffect(() => {
        if (modalOpen !== 'adOverlay') return;
        setTimer(Math.floor(AD_SIMULATION_DURATION / 1000)); 
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (isInterstitial) {
                        setModalOpen(null);
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
    }, [modalOpen, isInterstitial]);

    const handleClaim = () => {
        setModalOpen(null);
        setAdActionType(null);
        adRewardCallbackRef.current?.();
        adRewardCallbackRef.current = null;
        Sounds.uiConfirm();
    };

    return (
        <div className={`fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4 sm:p-6 text-slate-100 text-center
                        transition-opacity duration-300 ease-in-out ${modalOpen === 'adOverlay' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`transform transition-all duration-300 ease-in-out ${modalOpen === 'adOverlay' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <h2 className="text-2xl sm:text-3xl font-bold text-teal-300 mb-4 sm:mb-5 tracking-wide">{adTitle}</h2>
                <p className="mb-3 sm:mb-4 text-sm sm:text-lg">{adMessage}</p>
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 shadow-xl">
                    (Ad Placeholder)
                </div>
                {!isInterstitial && timer > 0 && <p className="mb-4 sm:mb-5 text-slate-300">Claim reward in: <span className="font-semibold text-yellow-300">{timer}s</span></p>}
                {!isInterstitial && timer === 0 && (
                    <MenuButton onClick={handleClaim} variant="special" className="bg-green-500 hover:bg-green-400 text-white px-8 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-lg">
                        CLAIM REWARD
                    </MenuButton>
                )}
                {isInterstitial && <p className="text-xs sm:text-sm text-slate-400">Ad will close automatically...</p>}
            </div>
        </div>
    );
};


  const getDebuffDisplayName = (type: DebuffType | null): string => {
    if (!type) return "";
    return type.toLowerCase().replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const renderHud = (): ReactNode => {
    const currentModeHighScore = engineHud.isZenMode ? zenHighScore : highScore;
    const modeName = engineHud.isZenMode ? "Zen" : "Normal";
    return ( 
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 text-slate-100 pointer-events-none z-10 text-shadow-sm-dark">
      <div className="flex justify-between items-start">
        {/* Left HUD Elements */}
        <div className="flex flex-col items-start space-y-1 sm:space-y-1.5">
          <div className="bg-slate-900/70 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg min-w-[100px] sm:min-w-[120px]">
            <p className="text-sm sm:text-base font-bold leading-tight">Score: <span className="text-yellow-300">{engineHud.score}</span></p>
            {engineHud.isZenMode && <span className="text-xs text-sky-300">(Zen)</span>}
            <p className="text-xs text-slate-300">Best ({modeName.substring(0,3)}): <span className="text-green-300">{currentModeHighScore}</span></p>
            <p className="text-xs text-slate-300">Coins: <span className="text-yellow-400">{totalCoins}</span></p>
          </div>
           {engineHud.combo >= 2 && !engineHud.isZenMode && 
            <div className="bg-slate-900/70 backdrop-blur-sm p-1 px-1.5 sm:p-1.5 sm:px-2 rounded-md sm:rounded-lg shadow-lg">
              <p className="text-xs sm:text-sm font-semibold text-orange-400 animate-pulse">Combo: {engineHud.combo}x</p>
            </div>
           }
          {isGodModeActive && 
            <div className="bg-red-700/70 backdrop-blur-sm p-0.5 px-1 sm:p-1 sm:px-2 rounded-sm sm:rounded-md shadow-lg">
              <p className="text-xs text-red-100 animate-pulse font-semibold">GOD</p>
            </div>
          }
        </div>

        {/* Right HUD Elements & Pause Button */}
        <div className="flex flex-col items-end space-y-1 sm:space-y-1.5">
          {mode === 'play' && !isGamePaused && (
            <button
                onClick={handleRequestPauseFromHud}
                aria-label="Pause Game"
                className="pointer-events-auto bg-slate-800/70 hover:bg-slate-700/80 backdrop-blur-sm p-2 sm:p-2.5 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-teal-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4h3a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm7 0h3a1 1 0 011 1v10a1 1 0 01-1 1h-3a1 1 0 01-1-1V5a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            </button>
          )}
          {engineHud.currentPowerup && !engineHud.isZenMode && (
            <div className="bg-slate-900/70 backdrop-blur-sm p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-lg text-right min-w-[80px] sm:min-w-[90px]">
              <p className="text-xs sm:text-sm font-semibold capitalize text-teal-300">{engineHud.currentPowerup}</p>
              <p className={`text-xs ${engineHud.powerupTime < 120 && engineHud.powerupTime > 0 && engineHud.powerupTime % 30 < 15 ? 'text-red-400 animate-ping' : 'text-slate-300'}`}>
                {Math.ceil(engineHud.powerupTime / 60)}s
              </p>
            </div>
          )}
           {engineHud.activeDebuff && !engineHud.isZenMode && (
            <div className="bg-red-800/70 backdrop-blur-sm p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-lg text-right min-w-[80px] sm:min-w-[90px]">
              <p className="text-xs sm:text-sm font-semibold capitalize text-red-200 animate-pulse">{getDebuffDisplayName(engineHud.activeDebuff.type)}</p>
              <p className="text-xs text-slate-300">
                {Math.ceil(engineHud.activeDebuff.duration / 60)}s
              </p>
            </div>
          )}
          {!engineHud.isZenMode && (
            <div className="bg-slate-900/70 backdrop-blur-sm p-0.5 sm:p-1 rounded-full shadow-lg flex items-center h-4 sm:h-5 w-20 sm:w-24 relative overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-200 ease-linear"
                style={{ width: `${engineHud.powerGauge}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 mix-blend-screen brightness-150">
                PWR
              </span>
            </div>
          )}
          <div className="bg-slate-900/70 backdrop-blur-sm p-1 px-1.5 sm:p-1.5 sm:px-2 rounded-md sm:rounded-lg shadow-lg">
            <p className="text-xs text-slate-300">Diff: {engineHud.difficulty.toFixed(1)}</p>
             {engineHud.perfectRun && engineHud.score > 0 && !engineHud.isZenMode && <p className="text-xs text-teal-300">Perfect!</p>}
          </div>
        </div>
      </div>
    </div>
  )};
  
  const NotificationIcon: React.FC<{type: 'achievement' | 'milestone' | 'reward' | 'info'}> = ({type}) => {
    switch(type) {
        case 'achievement': return <span className="text-xl sm:text-2xl mr-2 sm:mr-2.5">🏆</span>;
        case 'milestone': return <span className="text-xl sm:text-2xl mr-2 sm:mr-2.5">✨</span>;
        case 'reward': return <span className="text-xl sm:text-2xl mr-2 sm:mr-2.5">💰</span>;
        case 'info':
        default: return <span className="text-xl sm:text-2xl mr-2 sm:mr-2.5">ℹ️</span>;
    }
  };

  const mainContentOpacity = modalOpen || (mode === 'play' && isGamePaused) ? 0.3 : 1;
  const mainContentFilter = modalOpen || (mode === 'play' && isGamePaused) ? 'blur(4px)' : 'none';


  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center overflow-hidden font-['Inter',_sans-serif]">
      <div 
        ref={gameAreaRef}
        className={`relative transition-all duration-300 ease-in-out origin-center`}
        style={{ 
            width: CANVAS_WIDTH, 
            height: CANVAS_HEIGHT, 
            opacity: mainContentOpacity,
            filter: mainContentFilter,
            // transform is set by updateScale
        }}
      >

        {mode !== 'play' && (
             <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                {mode === 'start' && renderStartScreen()}
                {mode === 'shop' && renderShopScreen()}
                {mode === 'achievements' && renderAchievementsScreen()}
                {mode === 'over' && renderGameOverScreen()}
                {mode === 'howtoplay' && renderHowToPlayScreen()}
             </div>
        )}
        
        {mode === 'play' && (
          <GameEngine
            ref={gameEngineRef} 
            key={`${selectedSkyPeckerTypeIndex}-${selectedStartPower}-${ownedSkyPeckerIndices.join(',')}-${continueRunCountThisGameSessionRef.current}-${selectedTrailEffectId}-${currentPlayedModeIsZen}`} 
            selectedSkyPeckerTypeIndex={selectedSkyPeckerTypeIndex}
            selectedStartPower={selectedStartPower}
            selectedTrailEffect={currentSelectedTrailEffect}
            isZenMode={currentPlayedModeIsZen}
            onGameOver={handleGameOver}
            onCoinCollected={handleCoinCollected}
            onAchievementProgress={handleAchievementProgress}
            onPowerupUsed={handlePowerupUsed}
            updateHudData={updateHudCb}
            toggleGodModeCallback={toggleGodModeCb}
            canContinueRun={canContinueRun}
            onContinueRunRequested={handleContinueRunRequested}
            onMilestoneReached={handleMilestoneReached}
            onPauseStateChange={handlePauseStateChange}
          />
        )}
        {mode === 'play' && renderHud()}
        {activeNotification && (
          <div className={`fixed top-4 sm:top-6 right-4 sm:right-6 text-slate-900 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl z-50 max-w-[calc(100%-2rem)] xs:max-w-xs
                          transform transition-all duration-300 ease-out 
                          ${notificationVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}
                          ${activeNotification.type === 'achievement' ? 'bg-gradient-to-r from-yellow-300 to-amber-400' : 
                            activeNotification.type === 'milestone' ? 'bg-gradient-to-r from-purple-300 to-pink-300' :
                            activeNotification.type === 'reward' ? 'bg-gradient-to-r from-green-300 to-lime-300' :
                            'bg-gradient-to-r from-sky-300 to-cyan-300'}`}>
            <p className="font-bold text-sm sm:text-md flex items-center">
                <NotificationIcon type={activeNotification.type} />
                {activeNotification.message.split(':')[0]}
            </p>
            {activeNotification.message.includes(':') && <p className="ml-8 sm:ml-9 text-xs sm:text-sm">{activeNotification.message.split(':')[1].trim()}</p>}
          </div>
        )}
{/* Simplified condition for banner ad: show if not ads removed, not in play mode, and no modal open. */}
         {!hasRemovedAds && mode !== 'play' && !modalOpen && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-8 w-[280px] sm:w-[300px] bg-slate-700/70 backdrop-blur-sm rounded-md sm:rounded-lg flex items-center justify-center text-slate-300 text-xs z-20 shadow-md">
                (Banner Ad Placeholder)
            </div>
         )}
      </div>
      
      {/* HTML Pause Menu Overlay */}
      {mode === 'play' && isGamePaused && !modalOpen && ( /* Don't show if ad overlay is up */
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-teal-300 mb-6 sm:mb-8 text-shadow-lg-dark">PAUSED</h2>
            <MenuButton 
                onClick={handleResumeGame} 
                variant="special" 
                className="mb-4 w-full max-w-[240px] sm:max-w-xs text-base sm:text-lg py-3 sm:py-3.5 bg-green-500 hover:bg-green-400"
            >
                RESUME GAME
            </MenuButton>
            <MenuButton 
                onClick={handleQuitToMenu} 
                variant="secondary" 
                className="w-full max-w-[240px] sm:max-w-xs text-base sm:text-lg py-3 sm:py-3.5 bg-red-600 hover:bg-red-500 text-white"
            >
                QUIT TO MENU
            </MenuButton>
        </div>
      )}

      {renderSettingsModal()}
      {renderLeaderboardScreen()}
      {renderAdOverlay()}
      
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .text-shadow { text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
        .text-shadow-md { text-shadow: 1px 1px 3px rgba(0,0,0,0.25); } 
        .text-shadow-lg { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } 
        .text-shadow-xl { text-shadow: 2px 2px 5px rgba(0,0,0,0.35); } 
        .text-shadow-pop-light { text-shadow: 0 0 6px rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.3), 0 0 18px rgba(56,189,248,0.3); } 
        .text-shadow-lg-dark { text-shadow: 1px 1px 3px rgba(0,0,0,0.6); } 
        .text-shadow-xl-dark { text-shadow: 2px 2px 5px rgba(0,0,0,0.7); } 
        .text-shadow-sm-dark { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
        
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.3); 
            border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(124, 58, 237, 0.5); 
            border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(124, 58, 237, 0.7); 
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 6px; 
          background: #334155; 
          border-radius: 3px;
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          background: #334155; 
          border-radius: 3px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -5px; 
          height: 16px; 
          width: 16px;
          background-color: #8B5CF6; 
          border-radius: 50%;
          border: 2px solid #E5E7EB; 
          cursor: pointer;
          transition: background-color 0.15s ease-in-out;
        }
        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          background-color: #8B5CF6; 
          border-radius: 50%;
          border: 2px solid #E5E7EB; 
          cursor: pointer;
          transition: background-color 0.15s ease-in-out;
        }
        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3); 
        }
        input[type="range"]:focus::-moz-range-thumb {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
        }
         input[type="range"].accent-teal-500::-webkit-slider-thumb { background-color: #14B8A6; } 
         input[type="range"].accent-teal-500::-moz-range-thumb { background-color: #14B8A6; }
         input[type="range"].accent-teal-500:focus::-webkit-slider-thumb { box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.3); }
         input[type="range"].accent-teal-500:focus::-moz-range-thumb { box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.3); }

      `}</style>
    </div>
  );
};

export default App;
