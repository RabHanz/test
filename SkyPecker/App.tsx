import React, { useState, useEffect, useCallback, ReactNode, useRef, useLayoutEffect } from 'react';
import GameEngine from './GameEngine';
import { 
  GameMode, Achievements, PowerUpType, StoredProgress, SkyPeckerTypeConfig, EngineHudData, 
  DebuffType, EnemyVisualType, DailyChallenge, GameEngineRef, SkyPeckerTrailEffect, LeaderboardEntry,
  PlayerStats, GameSettings, NotificationData, BirdType, PerformanceMetrics
} from './types';
import { 
  ENHANCED_SKYPECKER_TYPES, INITIAL_ACHIEVEMENTS, STARTING_POWERUP_OPTIONS, GAME_STORAGE_KEY, 
  CANVAS_WIDTH, CANVAS_HEIGHT, DEBUG_KEYS_INFO, POWERUP_OPTIONS, ENHANCED_ENEMY_TYPES, 
  ENHANCED_DEBUFF_CONFIG, INITIAL_BIRD_R, DAILY_REWARD_COINS, DAILY_CHALLENGE_SCORE_TARGETS, 
  DAILY_CHALLENGE_COIN_TARGETS, DAILY_CHALLENGE_REWARD_COINS, REWARDED_AD_FREE_COINS_AMOUNT, 
  CONTINUE_RUN_AD_LIMIT, AD_SIMULATION_DURATION, ENHANCED_TRAIL_EFFECTS, MILESTONE_COIN_REWARD, 
  MILESTONE_SCORE_INTERVAL, UI_CONFIG, MONETIZATION_CONFIG, PERFORMANCE_CONFIG, SHOP_PRICING,
  INTELLIGENT_DIFFICULTY_CONFIG, SOCIAL_FEATURES_CONFIG
} from './constants';
import { Sounds, setMasterBgmVolume, setMasterSfxVolume, manageBackgroundMusic } from './utils';

interface SkyPeckerPreviewCanvasProps { 
  skyPeckerConfig: SkyPeckerTypeConfig; 
  size: number; 
  selectedTrail?: SkyPeckerTrailEffect | null;
  showAnimation?: boolean;
  previewMode?: 'static' | 'animated' | 'flying';
}

const SkyPeckerPreviewCanvas: React.FC<SkyPeckerPreviewCanvasProps> = ({ 
  skyPeckerConfig, 
  size, 
  selectedTrail, 
  showAnimation = false,
  previewMode = 'static'
}) => { 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const animationTimeRef = useRef<number>(0);

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

    const drawBird = (animationTime: number) => {
      ctx.clearRect(0, 0, size, size);

      // Enhanced background gradient
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      grad.addColorStop(0.7, "rgba(200, 220, 255, 0.05)");
      grad.addColorStop(1, "rgba(150, 170, 220, 0.1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Trail effect preview
      if (selectedTrail && previewMode !== 'static') {
        const trailConfig = selectedTrail.particleConfig;
        let trailColor = trailConfig.color;
        if (trailColor === 'bird_primary') trailColor = skyPeckerConfig.color;
        else if (trailColor === 'bird_stroke') trailColor = skyPeckerConfig.stroke;
        
        ctx.fillStyle = trailColor || skyPeckerConfig.color;
        ctx.globalAlpha = 0.6;
        for(let i = 0; i < 4; i++) {
          const trailSize = (size / 12) * (1 - i * 0.2);
          const offsetX = size / 2 - (i * size * 0.08) - size * 0.15;
          const offsetY = size / 2 + Math.sin(animationTime * 0.05 + i) * (size * 0.03);
          
          if (trailConfig.type === 'bubble') {
            ctx.beginPath();
            ctx.arc(offsetX, offsetY, trailSize, 0, Math.PI * 2);
            ctx.fill();
          } else if (trailConfig.type === 'sparkle') {
            drawSparkle(ctx, offsetX, offsetY, trailSize, animationTime + i);
          } else {
            ctx.beginPath();
            ctx.arc(offsetX, offsetY, trailSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      const birdRadius = (INITIAL_BIRD_R * skyPeckerConfig.size) * (size / 120);
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Bird animation based on type and mode
      let bobOffset = 0;
      let wingFlap = 0;
      let rotation = 0;
      
      if (showAnimation || previewMode === 'animated' || previewMode === 'flying') {
        bobOffset = Math.sin(animationTime * 0.03) * (size * 0.02);
        wingFlap = Math.sin(animationTime * 0.15) * 0.3;
        if (previewMode === 'flying') {
          rotation = Math.sin(animationTime * 0.02) * 0.1;
        }
      }

      ctx.save();
      ctx.translate(centerX, centerY + bobOffset);
      ctx.rotate(rotation);

      // Draw bird based on type with enhanced details
      drawEnhancedBird(ctx, skyPeckerConfig, birdRadius, wingFlap, animationTime);

      ctx.restore();
    };

    const drawSparkle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 0.1);
      ctx.strokeStyle = ctx.fillStyle as string;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size/2, 0);
      ctx.lineTo(size/2, 0);
      ctx.moveTo(0, -size/2);
      ctx.lineTo(0, size/2);
      ctx.stroke();
      ctx.restore();
    };

    const drawEnhancedBird = (ctx: CanvasRenderingContext2D, config: SkyPeckerTypeConfig, radius: number, wingFlap: number, time: number) => {
      const birdType = config.birdType || 'robin';
      
      // Body
      ctx.fillStyle = config.color;
      ctx.beginPath();
      
      // Different body shapes based on bird type
      switch (birdType) {
        case 'sparrow':
          ctx.ellipse(0, 0, radius * 0.9, radius * 1.1, 0, 0, Math.PI * 2);
          break;
        case 'eagle':
          ctx.ellipse(0, 0, radius * 1.2, radius * 0.9, 0, 0, Math.PI * 2);
          break;
        case 'owl':
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          break;
        case 'phoenix':
          ctx.ellipse(0, 0, radius * 1.1, radius * 1.1, 0, 0, Math.PI * 2);
          break;
        case 'falcon':
          ctx.ellipse(0, 0, radius * 0.8, radius * 1.2, 0, 0, Math.PI * 2);
          break;
        default: // robin
          ctx.ellipse(0, 0, radius, radius * 1.05, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Body outline
      ctx.strokeStyle = config.stroke;
      ctx.lineWidth = Math.max(1.5, radius * 0.08);
      ctx.stroke();

      // Wings with animation
      ctx.fillStyle = config.stroke;
      ctx.save();
      ctx.translate(-radius * 0.3, radius * 0.1);
      ctx.rotate(wingFlap);
      
      switch (birdType) {
        case 'eagle':
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.8, radius * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'sparrow':
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.5, radius * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'phoenix':
            // Flame-like wing
            ctx.fillStyle = '#FF6600';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-radius * 0.4, -radius * 0.2, -radius * 0.6, -radius * 0.1);
            ctx.quadraticCurveTo(-radius * 0.8, radius * 0.1, -radius * 0.4, radius * 0.3);
            ctx.quadraticCurveTo(-radius * 0.2, radius * 0.1, 0, 0);
            ctx.fill();
            // Flame gradient
            const flameGrad = ctx.createLinearGradient(-radius * 0.4, 0, -radius * 0.8, 0);
            flameGrad.addColorStop(0, '#FF4500');
            flameGrad.addColorStop(1, '#FF0000');
            ctx.fillStyle = flameGrad;
            ctx.fill();
            break;
          case 'owl':
            // Rounded wing
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 0.6, radius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          default:
            // Standard wing
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * 0.6, radius * 0.35, Math.PI / 7, 0, Math.PI * 2);
            ctx.fill();
      }
      ctx.restore();

      // Eyes based on bird type
      const eyeSize = radius / 3;
      const eyeX = radius / 2.8;
      const eyeY = -radius / 3.5;
      
      if (birdType === 'owl') {
        // Large owl eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX - radius * 0.1, eyeY, eyeSize * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + radius * 0.1, eyeY, eyeSize * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX - radius * 0.1, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + radius * 0.1, eyeY, eyeSize * 0.7, 0, Math.PI * 2);
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
      ctx.fillStyle = birdType === 'eagle' ? '#8B4513' : '#FDBA74';
      ctx.beginPath();
      
      switch (birdType) {
        case 'eagle':
          // Hooked eagle beak
          ctx.moveTo(radius * 0.8, -radius * 0.05);
          ctx.quadraticCurveTo(radius * 1.3, -radius * 0.1, radius * 1.2, radius * 0.1);
          ctx.quadraticCurveTo(radius * 1.1, radius * 0.15, radius * 0.8, radius * 0.05);
          break;
        case 'sparrow':
          // Small pointed beak
          ctx.moveTo(radius * 0.7, -radius * 0.05);
          ctx.lineTo(radius * 1.1, 0);
          ctx.lineTo(radius * 0.7, radius * 0.05);
          break;
        case 'owl':
          // Curved owl beak
          ctx.moveTo(radius * 0.6, -radius * 0.1);
          ctx.quadraticCurveTo(radius * 0.9, -radius * 0.05, radius * 0.8, radius * 0.1);
          ctx.quadraticCurveTo(radius * 0.7, radius * 0.05, radius * 0.6, -radius * 0.1);
          break;
        default:
          // Standard triangular beak
          ctx.moveTo(radius * 0.8, -radius * 0.1);
          ctx.lineTo(radius * 1.25, 0);
          ctx.lineTo(radius * 0.8, radius * 0.1);
      }
      ctx.closePath();
      ctx.fill();

      // Special effects for legendary birds
      if (birdType === 'phoenix' && (showAnimation || previewMode === 'flying')) {
        // Phoenix aura
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.1) * 0.2;
        const auraGrad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.5);
        auraGrad.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        auraGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    if (showAnimation || previewMode !== 'static') {
      const animate = () => {
        animationTimeRef.current += 1;
        drawBird(animationTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      drawBird(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [skyPeckerConfig, size, selectedTrail, showAnimation, previewMode]);

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
  let buttonClass = 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold shadow-lg';

  if (isOwned) {
    if (isSelected) {
      buttonText = 'EQUIPPED';
      buttonDisabled = true;
      buttonClass = 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed font-semibold shadow-inner';
    } else {
      buttonText = 'EQUIP';
      buttonClass = 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold shadow-lg';
    }
  } else {
    buttonText = `${trailEffect.cost} Coins`;
    if (!canAfford) {
      buttonDisabled = true;
      buttonClass = 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-red-100 cursor-not-allowed font-semibold shadow-inner';
    }
  }

  const rarityColors = {
    common: 'border-slate-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-orange-400'
  };

  const rarity = trailEffect.rarity || 'common';

  return (
    <div 
      className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between h-full backdrop-blur-md border-2 transform hover:scale-[1.02] hover:-translate-y-1
                  ${isSelected && isOwned ? `ring-4 ring-teal-400 bg-gradient-to-br from-purple-700/80 to-indigo-800/80 ${rarityColors[rarity]}` : 
                  `bg-gradient-to-br from-slate-800/70 to-slate-900/70 hover:from-slate-700/80 hover:to-slate-800/80 ${rarityColors[rarity]}`}`}
      onClick={!isSelected && isOwned ? onSelectOrPurchase : undefined} 
      style={{cursor: (!isSelected && isOwned) ? 'pointer' : 'default'}}
    >
      {rarity !== 'common' && (
        <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg
                        ${rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                          rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                          'bg-gradient-to-r from-orange-500 to-orange-600 text-white'}`}>
          {rarity}
        </div>
      )}
      
      <div>
        <div className="flex items-center mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full mr-3 flex items-center justify-center text-2xl shadow-inner bg-gradient-to-br from-slate-600 to-slate-700" 
                 style={{background: trailEffect.previewColor || 'linear-gradient(135deg, #64748B, #475569)'}}>
              {getTrailIcon(trailEffect.particleConfig.type)}
            </div>
            {isOwned && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">{trailEffect.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < (rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2) ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-300 mb-3 h-16 overflow-y-auto custom-scrollbar leading-relaxed">{trailEffect.description}</p>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Type:</span>
            <span className="capitalize font-medium text-purple-300">{trailEffect.particleConfig.type.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Cost:</span>
            <span className="font-medium text-yellow-300 flex items-center">
              <span className="text-yellow-400 mr-1">🪙</span>
              {trailEffect.cost}
            </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onSelectOrPurchase}
        disabled={buttonDisabled}
        className={`w-full py-3 px-4 rounded-xl text-sm mt-4 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:transform-none ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const getTrailIcon = (type: string): string => {
  switch (type) {
    case 'sparkle': return '✨';
    case 'bubble': return '🫧';
    case 'fire': return '🔥';
    case 'crystal': return '💎';
    case 'rainbow': return '🌈';
    default: return '⭐';
  }
};

const MenuButton: React.FC<{ 
  onClick: () => void; 
  selected?: boolean; 
  children: ReactNode, 
  className?: string, 
  disabled?: boolean,
  variant?: 'primary' | 'secondary' | 'special' | 'zen' | 'daily' | 'danger';
  icon?: string;
  badge?: string | number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, selected, children, className, disabled, variant = 'primary', icon, badge, size = 'md' }) => {
  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-6 text-lg'
  };

  let baseClasses = `relative w-full ${sizeClasses[size]} my-1.5 rounded-xl shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center space-x-2 overflow-hidden backdrop-blur-sm`;
  let colorClasses = "";
  let hoverEffectClass = "hover:scale-105 hover:shadow-xl";

  switch(variant) {
    case 'secondary':
      colorClasses = selected 
        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white ring-purple-300 font-semibold shadow-purple-500/25'
        : 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 ring-slate-500 font-medium hover:from-slate-600 hover:to-slate-500';
      break;
    case 'special': 
      colorClasses = 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white ring-green-300 font-semibold shadow-green-500/25';
      break;
    case 'zen':
      colorClasses = selected
        ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white ring-sky-300 font-semibold shadow-sky-500/25'
        : 'bg-gradient-to-r from-sky-700 to-cyan-700 text-slate-100 ring-sky-500 font-medium hover:from-sky-600 hover:to-cyan-600';
      break;
    case 'daily':
      colorClasses = 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white ring-amber-300 font-semibold shadow-amber-500/25';
      break;
    case 'danger':
      colorClasses = 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white ring-red-300 font-semibold shadow-red-500/25';
      break;
    case 'primary':
    default:
      colorClasses = selected 
        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white ring-teal-300 font-bold shadow-teal-500/25'
        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white ring-purple-400 font-semibold shadow-purple-500/20';
      break;
  }

  if (disabled) {
    colorClasses = 'bg-gradient-to-r from-slate-600 to-slate-700 text-slate-400 cursor-not-allowed ring-slate-500 font-medium opacity-50';
    hoverEffectClass = '';
  } else {
    colorClasses += ' active:scale-95';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${colorClasses} ${hoverEffectClass} ${className}`}
    >
      {icon && <span className="text-xl">{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
          {badge}
        </span>
      )}
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
  showStats?: boolean;
}> = ({ 
  skyPecker, 
  isSelectedForGame, 
  isSelectedInShop, 
  isOwned, 
  cost, 
  canAfford, 
  onSelectOrPurchase, 
  selectedTrail,
  showStats = true
}) => { 
  let buttonText = '';
  let buttonDisabled = false;
  let buttonClass = 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold shadow-lg';

  if (isOwned) {
    if (isSelectedForGame) {
      buttonText = 'EQUIPPED';
      buttonDisabled = true;
      buttonClass = 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed font-semibold shadow-inner';
    } else {
      buttonText = 'EQUIP';
      buttonClass = 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold shadow-lg';
    }
  } else {
    if (skyPecker.unlockCondition === 'premium_iap') {
      buttonText = `PREMIUM - $${SHOP_PRICING.PREMIUM_BIRD_BUNDLE}`;
      buttonClass = 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg';
    } else {
      buttonText = `${cost} Coins`;
      if (!canAfford) {
        buttonDisabled = true;
        buttonClass = 'bg-gradient-to-r from-red-700 to-red-800 text-red-100 cursor-not-allowed font-semibold shadow-inner';
      }
    }
  }

  const rarityColors = {
    common: 'border-slate-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-orange-400'
  };

  const rarity = skyPecker.rarityTier || 'common';

  return (
    <div 
      className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between h-full backdrop-blur-md border-2 transform hover:scale-[1.02] hover:-translate-y-1
                  ${isSelectedInShop ? `ring-4 ring-teal-400 bg-gradient-to-br from-purple-700/80 to-indigo-800/80 ${rarityColors[rarity]}` : 
                  `bg-gradient-to-br from-slate-800/70 to-slate-900/70 hover:from-slate-700/80 hover:to-slate-800/80 ${rarityColors[rarity]}`}`}
      onClick={!isSelectedForGame && isOwned ? onSelectOrPurchase : undefined}
      style={{cursor: (!isSelectedForGame && isOwned) ? 'pointer' : 'default'}}
    >
      {rarity !== 'common' && (
        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg
                        ${rarity === 'rare' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                          rarity === 'epic' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                          'bg-gradient-to-r from-orange-500 to-orange-600 text-white'}`}>
          {rarity}
        </div>
      )}
      
      <div>
        <div className="flex items-center mb-3">
          <div className="relative">
            <SkyPeckerPreviewCanvas 
              skyPeckerConfig={skyPecker} 
              size={60} 
              selectedTrail={selectedTrail}
              showAnimation={true}
              previewMode="animated"
            />
            {isOwned && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors">{skyPecker.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2) ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-300 mb-3 h-16 overflow-y-auto custom-scrollbar leading-relaxed">{skyPecker.description}</p>
        
        {showStats && (
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-slate-700/50 rounded-lg p-2">
              <div className="text-slate-400">Size</div>
              <div className="font-medium text-purple-300">{skyPecker.size}x</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2">
              <div className="text-slate-400">Speed</div>
              <div className="font-medium text-purple-300">{skyPecker.speed}x</div>
            </div>
            {skyPecker.flapForceMultiplier !== 1 && (
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-slate-400">Flap</div>
                <div className={`font-medium ${(skyPecker.flapForceMultiplier || 1) > 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {skyPecker.flapForceMultiplier && skyPecker.flapForceMultiplier > 1 ? '+' : ''}{Math.round(((skyPecker.flapForceMultiplier || 1) - 1) * 100)}%
                </div>
              </div>
            )}
            {skyPecker.powerGaugeMultiplier !== 1 && (
              <div className="bg-slate-700/50 rounded-lg p-2">
                <div className="text-slate-400">PWR</div>
                <div className="font-medium text-yellow-300">+{Math.round(((skyPecker.powerGaugeMultiplier || 1) - 1) * 100)}%</div>
              </div>
            )}
          </div>
        )}
        
        {/* Special abilities */}
        <div className="space-y-1 text-xs">
          {skyPecker.canNegateDebuffOnce && <div className="flex items-center text-sky-300"><span className="mr-2">🛡️</span>Ignores first debuff</div>}
          {skyPecker.pipePhaseChance && <div className="flex items-center text-indigo-300"><span className="mr-2">👻</span>{(skyPecker.pipePhaseChance*100).toFixed(0)}% phase chance</div>}
          {skyPecker.reviveOnce && <div className="flex items-center text-orange-300"><span className="mr-2">🔥</span>Phoenix revival</div>}
          {skyPecker.freezeEnemiesOnHit && <div className="flex items-center text-cyan-300"><span className="mr-2">❄️</span>Freezes enemies</div>}
        </div>
      </div>
      
      <button 
        onClick={onSelectOrPurchase}
        disabled={buttonDisabled}
        className={`w-full py-3 px-4 rounded-xl text-sm mt-4 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:transform-none ${buttonClass}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const NotificationToast: React.FC<{
  notification: NotificationData;
  visible: boolean;
  onDismiss: () => void;
}> = ({ notification, visible, onDismiss }) => {
  const typeStyles = {
    achievement: 'from-yellow-500/90 to-amber-600/90 text-yellow-900',
    milestone: 'from-purple-500/90 to-pink-600/90 text-purple-900',
    reward: 'from-green-500/90 to-emerald-600/90 text-green-900',
    info: 'from-blue-500/90 to-sky-600/90 text-blue-900',
    warning: 'from-orange-500/90 to-red-600/90 text-orange-900',
    social: 'from-indigo-500/90 to-purple-600/90 text-indigo-900'
  };

  const icons = {
    achievement: '🏆',
    milestone: '✨',
    reward: '💰',
    info: 'ℹ️',
    warning: '⚠️',
    social: '👥'
  };

  return (
    <div className={`fixed top-6 right-6 max-w-sm z-50 transform transition-all duration-300 ease-out ${
      visible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
    }`}>
      <div className={`bg-gradient-to-r ${typeStyles[notification.type]} p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">
            {notification.icon || icons[notification.type]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base mb-1">{notification.title}</h4>
            <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
            {notification.actionButton && (
              <button 
                onClick={notification.onAction}
                className="mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
              >
                {notification.actionButton}
              </button>
            )}
          </div>
          <button 
            onClick={onDismiss}
            className="text-lg hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

const PerformanceIndicator: React.FC<{ metrics: PerformanceMetrics }> = ({ metrics }) => (
  <div className="fixed bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded-lg backdrop-blur-sm z-40">
    <div>FPS: {metrics.fps.toFixed(0)}</div>
    <div>Particles: {metrics.particleCount}</div>
    <div className={`font-bold ${metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
      {metrics.fps < 30 ? 'PERF MODE' : metrics.fps < 50 ? 'MEDIUM' : 'SMOOTH'}
    </div>
  </div>
);

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const App: React.FC = () => {
  // Core game state
  const [mode, setMode] = useState<GameMode>('start');
  const [highScore, setHighScore] = useState<number>(0);
  const [zenHighScore, setZenHighScore] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievements>(() => JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)));
  const [selectedSkyPeckerTypeIndex, setSelectedSkyPeckerTypeIndex] = useState<number>(0);
  const [ownedSkyPeckerIndices, setOwnedSkyPeckerIndices] = useState<number[]>([0]);
  const [selectedStartPower, setSelectedStartPower] = useState<PowerUpType | null>(null);

  // UI state
  const [mainMenuSelection, setMainMenuSelection] = useState<number>(0);
  const [shopSelection, setShopSelection] = useState<number>(0);
  const [shopTab, setShopTab] = useState<'skypeckers' | 'trails'>('skypeckers');

  // Enhanced notification system
  const [activeNotifications, setActiveNotifications] = useState<NotificationData[]>([]);
  const notificationTimeoutRefs = useRef<Map<string, number>>(new Map());

  // Game engine state
  const [isGodModeActive, setIsGodModeActive] = useState<boolean>(false);
  const [engineHud, setEngineHud] = useState<EngineHudData>({
    score: 0, powerGauge: 0, currentPowerup: null, powerupTime: 0, difficulty: 1, 
    perfectRun: true, combo: 0, activeDebuff: null, isZenMode: false, currentSpeed: 2.5, 
    enemiesOnScreen: 0, fps: 60
  });

  // Audio settings
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.3);
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.5);

  // Monetization and progression
  const [hasRemovedAds, setHasRemovedAds] = useState<boolean>(false);
  const [lastDailyRewardClaimed, setLastDailyRewardClaimed] = useState<string | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [lastDailyChallengeCompleted, setLastDailyChallengeCompleted] = useState<string | null>(null);

  // Enhanced features
  const [ownedTrailEffectIds, setOwnedTrailEffectIds] = useState<string[]>(['default_classic']);
  const [selectedTrailEffectId, setSelectedTrailEffectId] = useState<string | null>('default_classic');
  const [currentPlayedModeIsZen, setCurrentPlayedModeIsZen] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalGamesPlayed: 0,
    totalTimePlayed: 0,
    averageScore: 0,
    bestStreak: 0,
    totalCoinsCollected: 0,
    totalPowerupsUsed: 0,
    totalEnemiesDefeated: 0,
    skillLevel: 'beginner',
    lastSkillAssessment: Date.now(),
    adaptiveDifficultyRating: 1.0
  });

  // Modal and overlay state
  const [modalOpen, setModalOpen] = useState<'settings' | 'leaderboard' | 'adOverlay' | 'achievements' | 'shop' | null>(null);
  const [adActionType, setAdActionType] = useState<'continueRun' | 'doubleCoins' | 'freeCoins' | 'dailyReward' | 'dailyChallengeReward' | 'interstitial' | null>(null);
  const adRewardCallbackRef = useRef<(() => void) | null>(null);

  // Game references and state
  const gameEngineRef = useRef<GameEngineRef>(null);
  const continueRunCountThisGameSessionRef = useRef<number>(0);
  const coinsCollectedThisRunForGameOverScreenRef = useRef<number>(0);
  const milestoneCountThisRunRef = useRef<number>(0);
  const deathCountThisSession = useRef<number>(0);

  // Responsive design
  const [scale, setScale] = useState(1);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isGamePaused, setIsGamePaused] = useState<boolean>(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    drawCalls: 0
  });

  // Enhanced scaling for responsive design
  const updateScale = useCallback(() => {
    const rootEl = document.getElementById('root');
    if (!rootEl || !gameAreaRef.current) return;

    const screenWidth = rootEl.clientWidth;
    const screenHeight = rootEl.clientHeight;
    
    const scaleX = screenWidth / CANVAS_WIDTH;
    const scaleY = screenHeight / CANVAS_HEIGHT;
    
    const newScale = Math.min(scaleX, scaleY);
    const finalScale = Math.max(0.5, Math.min(newScale, 2.0)); // Enhanced scaling range
    setScale(finalScale);

    if (gameAreaRef.current) {
      gameAreaRef.current.style.transform = `scale(${finalScale})`;
    }
  }, []);

  useLayoutEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // Enhanced notification system
  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const fullNotification: NotificationData = { ...notification, id };
    
    setActiveNotifications(prev => [...prev.slice(-2), fullNotification]); // Keep max 3 notifications
    
    const timeoutId = window.setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== id));
      notificationTimeoutRefs.current.delete(id);
    }, notification.duration || (notification.type === 'milestone' ? 2500 : 3500));
    
    notificationTimeoutRefs.current.set(id, timeoutId);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    const timeoutId = notificationTimeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      notificationTimeoutRefs.current.delete(id);
    }
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Enhanced progress saving with analytics
const saveProgress = useCallback(() => {
  const progressToStore: StoredProgress = { 
    highScore, 
    zenHighScore, 
    totalCoins, 
    achievements, 
    selectedSkyPeckerType: selectedSkyPeckerTypeIndex, 
    ownedSkyPeckerIndices,
    hasRemovedAds,
    lastDailyRewardClaimed,
    dailyChallenge,
    lastDailyChallengeCompleted,
    ownedTrailEffectIds,
    selectedTrailEffectId,
    playerStats,
    settings: {
      masterVolume: (bgmVolume + sfxVolume) / 2,
      sfxVolume,
      musicVolume: bgmVolume,
      hapticFeedback: true,
      particleEffects: 'high',
      performanceMode: false,
      colorblindMode: false,
      reducedMotion: false,
      language: 'en',
      tutorialCompleted: true,
      analyticsEnabled: true
    },
    lastPlayedVersion: 'v2.0.0'
  };
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(progressToStore));
}, [
  highScore, zenHighScore, totalCoins, achievements, selectedSkyPeckerTypeIndex, 
  ownedSkyPeckerIndices, hasRemovedAds, lastDailyRewardClaimed, dailyChallenge, 
  lastDailyChallengeCompleted, ownedTrailEffectIds, selectedTrailEffectId, 
  playerStats, bgmVolume, sfxVolume
]);

  // Enhanced progress loading with migration support
  useEffect(() => {
    const storedProgressRaw = localStorage.getItem(GAME_STORAGE_KEY);
    if (storedProgressRaw) {
      try {
        const storedProgress = JSON.parse(storedProgressRaw) as StoredProgress;
        setHighScore(storedProgress.highScore || 0);
        setZenHighScore(storedProgress.zenHighScore || 0);
        setTotalCoins(storedProgress.totalCoins || 0);
        setOwnedSkyPeckerIndices(storedProgress.ownedSkyPeckerIndices?.length > 0 ? storedProgress.ownedSkyPeckerIndices : [0]);
        
        // Enhanced achievement merging
        const mergedAchievements = { ...INITIAL_ACHIEVEMENTS };
        for (const key in storedProgress.achievements) {
          if (mergedAchievements[key] && storedProgress.achievements[key]) {
            mergedAchievements[key] = {
              ...mergedAchievements[key],
              ...storedProgress.achievements[key]
            };
          }
        }
        setAchievements(mergedAchievements);
        
        setSelectedSkyPeckerTypeIndex(Math.min(storedProgress.selectedSkyPeckerType || 0, ENHANCED_SKYPECKER_TYPES.length - 1));
        setHasRemovedAds(storedProgress.hasRemovedAds || false);
        setLastDailyRewardClaimed(storedProgress.lastDailyRewardClaimed || null);
        setDailyChallenge(storedProgress.dailyChallenge || null);
        setLastDailyChallengeCompleted(storedProgress.lastDailyChallengeCompleted || null);
        setOwnedTrailEffectIds(storedProgress.ownedTrailEffectIds || ['default_classic']);
        setSelectedTrailEffectId(storedProgress.selectedTrailEffectId || 'default_classic');
        
        // Load player stats with defaults
        if (storedProgress.playerStats) {
          setPlayerStats({
            totalGamesPlayed: storedProgress.playerStats.totalGamesPlayed || 0,
            totalTimePlayed: storedProgress.playerStats.totalTimePlayed || 0,
            averageScore: storedProgress.playerStats.averageScore || 0,
            bestStreak: storedProgress.playerStats.bestStreak || 0,
            totalCoinsCollected: storedProgress.playerStats.totalCoinsCollected || 0,
            totalPowerupsUsed: storedProgress.playerStats.totalPowerupsUsed || 0,
            totalEnemiesDefeated: storedProgress.playerStats.totalEnemiesDefeated || 0,
            skillLevel: storedProgress.playerStats.skillLevel || 'beginner',
            lastSkillAssessment: storedProgress.playerStats.lastSkillAssessment || Date.now(),
            adaptiveDifficultyRating: storedProgress.playerStats.adaptiveDifficultyRating || 1.0
          });
        }
        
        // Load audio settings
        if (storedProgress.settings) {
          setBgmVolumeState(storedProgress.settings.musicVolume || 0.3);
          setSfxVolumeState(storedProgress.settings.sfxVolume || 0.5);
        }

      } catch (error) { 
        console.error("Failed to parse stored progress:", error); 
        localStorage.removeItem(GAME_STORAGE_KEY);
        showNotification({
          type: 'warning',
          title: 'Save Data Error',
          message: 'Previous save data was corrupted and has been reset.',
          duration: 5000
        });
      }
    }
    setMasterBgmVolume(bgmVolume); 
    setMasterSfxVolume(sfxVolume); 
  }, []);

  useEffect(() => { 
    saveProgress();
  }, [saveProgress]);

  useEffect(() => { setMasterBgmVolume(bgmVolume); }, [bgmVolume]);
  useEffect(() => { setMasterSfxVolume(sfxVolume); }, [sfxVolume]);

  // Enhanced daily challenge generation
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const needsNewChallenge =
        !dailyChallenge ||
        dailyChallenge.challengeDate !== todayStr ||
        (dailyChallenge.challengeDate === todayStr && dailyChallenge.completedToday);
    
    if (needsNewChallenge) {
      const challengeTypes = ['score', 'coins', 'powerups', 'enemies'] as const;
      const challengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
      let target: number, description: string, difficulty: 'easy' | 'medium' | 'hard';

      const skillMultiplier = playerStats.skillLevel === 'beginner' ? 0.7 :
                              playerStats.skillLevel === 'intermediate' ? 1.0 :
                              playerStats.skillLevel === 'advanced' ? 1.3 : 1.6;

      switch (challengeType) {
        case 'score':
          const scoreTargets = DAILY_CHALLENGE_SCORE_TARGETS.map(t => Math.floor(t * skillMultiplier));
          target = scoreTargets[Math.floor(Math.random() * scoreTargets.length)];
          description = `Score ${target} points in a single Normal Mode run.`;
          difficulty = target < 25 ? 'easy' : target < 75 ? 'medium' : 'hard';
          break;
        case 'coins':
          const coinTargets = DAILY_CHALLENGE_COIN_TARGETS.map(t => Math.floor(t * skillMultiplier));
          target = coinTargets[Math.floor(Math.random() * coinTargets.length)];
          description = `Collect ${target} coins in a single run.`;
          difficulty = target < 15 ? 'easy' : target < 35 ? 'medium' : 'hard';
          break;
        case 'powerups':
          target = Math.max(3, Math.floor(5 * skillMultiplier));
          description = `Use ${target} power-ups in a single run.`;
          difficulty = target < 5 ? 'easy' : target < 8 ? 'medium' : 'hard';
          break;
        case 'enemies':
          target = Math.max(5, Math.floor(10 * skillMultiplier));
          description = `Defeat ${target} enemies in a single run.`;
          difficulty = target < 8 ? 'easy' : target < 15 ? 'medium' : 'hard';
          break;
        default: // Should not happen with defined types, but good for safety
          target = 25;
          description = 'Score 25 points in a single run.';
          difficulty = 'medium';
      }

      const baseReward = DAILY_CHALLENGE_REWARD_COINS;
      const difficultyMultiplier = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.5 : 1.0;
      const reward = Math.floor(baseReward * difficultyMultiplier);

      setDailyChallenge({
        type: challengeType,
        target,
        reward,
        completedToday: false, // A new challenge is never completed initially
        description,
        difficulty,
        bonusReward: Math.floor(reward * 0.5),
        challengeDate: todayStr, // Set the date for the new challenge
      });

      // If the last completion was for a different day, reset it.
      if (lastDailyChallengeCompleted && lastDailyChallengeCompleted !== todayStr) {
        setLastDailyChallengeCompleted(null);
      }
    }
  }, [mode, playerStats.skillLevel, lastDailyChallengeCompleted, dailyChallenge]);

  // Enhanced achievement system
  const handleAchievementUnlocked = useCallback((achievementKey: string, achievementName: string) => {
    setAchievements(prev => {
      if (prev[achievementKey] && !prev[achievementKey].unlocked) {
        const achievement = prev[achievementKey];
        const newAchievements = { 
          ...prev, 
          [achievementKey]: { 
            ...achievement, 
            unlocked: true, 
            progress: achievement.target || achievement.progress,
            dateUnlocked: new Date().toISOString()
          } 
        };
        
        // Award coins for achievement
        const rewardCoins = achievement.rewardCoins || 25;
        setTotalCoins(prevCoins => prevCoins + rewardCoins);
        
        showNotification({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `${achievementName} (+${rewardCoins} coins)`,
          duration: 3500,
          priority: 'high'
        });
        
        Sounds.achievement();
        
        // Check for collection achievements
        const allBirdsOwned = ENHANCED_SKYPECKER_TYPES.every((_, index) => ownedSkyPeckerIndices.includes(index));
        if (allBirdsOwned && achievementKey !== 'birdCollector' && newAchievements.birdCollector && !newAchievements.birdCollector.unlocked) {
          setTimeout(() => {
            handleAchievementUnlocked('birdCollector', INITIAL_ACHIEVEMENTS.birdCollector.name);
          }, 1000);
        }
        
        return newAchievements;
      }
      return prev;
    });
  }, [showNotification, ownedSkyPeckerIndices]);

  // Enhanced coin collection with analytics
  const handleCoinCollected = useCallback((value: number) => {
    setTotalCoins(prevTotalCoins => {
      const newTotal = prevTotalCoins + value;
      setPlayerStats(prev => ({
        ...prev,
        totalCoinsCollected: prev.totalCoinsCollected + value
      }));
      
      setAchievements(prevAch => {
        const coinCollectorAch = prevAch.coinCollector;
        let updatedAch = { ...prevAch };
        if (coinCollectorAch && !coinCollectorAch.unlocked) { 
          const target = coinCollectorAch.target || 100;
          const newProgress = Math.min((coinCollectorAch.progress || 0) + value, target);
          updatedAch.coinCollector = { ...coinCollectorAch, progress: newProgress };
          if (newProgress >= target) { 
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
          return { ...prev, [achievementKey]: { ...ach, unlocked: true, progress: ach.target, dateUnlocked: new Date().toISOString() } };
        }
        return { ...prev, [achievementKey]: { ...ach, progress: newProgress } };
      }
      return prev;
    });
  }, [handleAchievementUnlocked]);

  const handlePowerupUsed = useCallback((type: PowerUpType) => {
    if (type) {
      setPlayerStats(prev => ({
        ...prev,
        totalPowerupsUsed: prev.totalPowerupsUsed + 1
      }));
      handleAchievementProgress('powerMaster', 1);
    }
  }, [handleAchievementProgress]);

  // Enhanced ad management
  const triggerAd = (type: 'continueRun' | 'doubleCoins' | 'freeCoins' | 'dailyReward' | 'dailyChallengeReward' | 'interstitial', callback: () => void) => {
    if (hasRemovedAds && type !== 'interstitial') {
      callback();
      return;
    }
    
    // Ad frequency management
    if (type === 'interstitial') {
      deathCountThisSession.current++;
      if (deathCountThisSession.current < MONETIZATION_CONFIG.AD_FREQUENCY.INTERSTITIAL_DEATH_COUNT) {
        callback();
        return;
      }
      deathCountThisSession.current = 0;
    }
    
    setAdActionType(type);
    adRewardCallbackRef.current = callback;
    setModalOpen('adOverlay');
  };

  // Enhanced game over handler with analytics
  const handleGameOver = useCallback((
    score: number, 
    coinsCollectedThisRun: number, 
    perfectRun: boolean, 
    gameWasZenMode?: boolean,
    gameStats?: Partial<PlayerStats>
  ) => {
    setIsGamePaused(false);
    
    // Update player statistics
    setPlayerStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
      averageScore: Math.floor((prev.averageScore * prev.totalGamesPlayed + score) / (prev.totalGamesPlayed + 1)),
      bestStreak: Math.max(prev.bestStreak, score),
      totalEnemiesDefeated: prev.totalEnemiesDefeated + (gameStats?.totalEnemiesDefeated || 0),
      lastSkillAssessment: Date.now()
    }));
    
    // Skill assessment for adaptive difficulty
    const skillAssessmentWindow = 10;
    const currentAverage = playerStats.averageScore;
    let newSkillLevel = playerStats.skillLevel;
    
    if (playerStats.totalGamesPlayed >= skillAssessmentWindow) {
      if (currentAverage < INTELLIGENT_DIFFICULTY_CONFIG.EASY_PLAYER_THRESHOLD) {
        newSkillLevel = 'beginner';
      } else if (currentAverage < 50) {
        newSkillLevel = 'intermediate';
      } else if (currentAverage < INTELLIGENT_DIFFICULTY_CONFIG.HARD_PLAYER_THRESHOLD) {
        newSkillLevel = 'advanced';
      } else {
        newSkillLevel = 'expert';
      }
      
      if (newSkillLevel !== playerStats.skillLevel) {
        setPlayerStats(prev => ({ ...prev, skillLevel: newSkillLevel }));
        showNotification({
          type: 'info',
          title: 'Skill Assessment',
          message: `You've been classified as ${newSkillLevel} level!`,
          duration: 4000
        });
      }
    }
    
    // High score updates
    if (gameWasZenMode) {
      if (score > zenHighScore) {
        setZenHighScore(score);
        showNotification({
          type: 'milestone',
          title: 'New Zen High Score!',
          message: `${score} points - Amazing zen mastery!`,
          duration: 4000
        });
      }
      if (score >= 75) handleAchievementUnlocked('zenMaster', INITIAL_ACHIEVEMENTS.zenMaster.name);
    } else {
      if (score > highScore) {
        setHighScore(score);
        showNotification({
          type: 'milestone',
          title: 'New High Score!',
          message: `${score} points - You're on fire!`,
          duration: 4000
        });
      }
      
      // Daily challenge completion
      if (dailyChallenge && !dailyChallenge.completedToday) {
        let challengeCompleted = false;
        const todayStr = new Date().toISOString().split('T')[0];
        
        switch (dailyChallenge.type) {
          case 'score':
            challengeCompleted = score >= dailyChallenge.target;
            break;
          case 'coins':
            challengeCompleted = coinsCollectedThisRun >= dailyChallenge.target;
            break;
          case 'powerups':
            challengeCompleted = (gameStats?.totalPowerupsUsed || 0) >= dailyChallenge.target;
            break;
          case 'enemies':
            challengeCompleted = (gameStats?.totalEnemiesDefeated || 0) >= dailyChallenge.target;
            break;
        }
        
        if (challengeCompleted) {
          const reward = dailyChallenge.reward + (dailyChallenge.bonusReward || 0);
          setTotalCoins(prev => prev + reward);
          setDailyChallenge(prev => prev ? {...prev, completedToday: true} : null);
          setLastDailyChallengeCompleted(todayStr);
          
          showNotification({
            type: 'reward',
            title: 'Daily Challenge Complete!',
            message: `+${reward} coins earned!`,
            duration: 4000
          });
          Sounds.achievement();
        }
      }
    }
    
    // Achievement checks
    if (score >= 25 && !gameWasZenMode) handleAchievementProgress('survivor', 1);
    if (score >= 100 && !gameWasZenMode) handleAchievementProgress('centurion', 1);
    if (perfectRun && score >= 50 && !gameWasZenMode) handleAchievementProgress('perfectionist', 1);
    
    if (milestoneCountThisRunRef.current >= 5 && !gameWasZenMode) {
      handleAchievementUnlocked('milestoneHunter', 'Milestone Hunter');
    }

    coinsCollectedThisRunForGameOverScreenRef.current = coinsCollectedThisRun;
    setEngineHud(prev => ({ ...prev, score, perfectRun, isZenMode: gameWasZenMode }));
    
    triggerAd('interstitial', () => setMode('over'));
  }, [
    highScore, zenHighScore, dailyChallenge, hasRemovedAds, showNotification, 
    handleAchievementUnlocked, handleAchievementProgress, playerStats
  ]);

  const handleMilestoneReached = useCallback((score: number, coins: number) => {
    setTotalCoins(prev => prev + coins);
    showNotification({
      type: 'milestone',
      title: 'Milestone!',
      message: `Score ${score} - Earned ${coins} coins!`,
      duration: 2500
    });
    Sounds.milestone();
    milestoneCountThisRunRef.current += 1;
  }, [showNotification]);

  // Enhanced game start with analytics
  const startGame = (isZen: boolean = false) => { 
    setCurrentPlayedModeIsZen(isZen);
    continueRunCountThisGameSessionRef.current = 0; 
    milestoneCountThisRunRef.current = 0; 
    setIsGamePaused(false);
    setMode('play'); 
    Sounds.uiConfirm();
    
    // Track game start analytics
    setPlayerStats(prev => ({
      ...prev,
      totalTimePlayed: prev.totalTimePlayed + 1 // This would be actual time in a real implementation
    }));
  };

  const updateHudCb = useCallback((data: EngineHudData) => {
    setEngineHud(data);
    setPerformanceMetrics(prev => ({
      ...prev,
      fps: data.fps || prev.fps,
      particleCount: data.enemiesOnScreen || prev.particleCount
    }));
  }, []);

  const toggleGodModeCb = useCallback((isActive: boolean) => setIsGodModeActive(isActive), []);
  const handlePauseStateChange = useCallback((paused: boolean) => setIsGamePaused(paused), []);

  const handleQuitToMenu = () => {
    setIsGamePaused(false);
    manageBackgroundMusic('', 'stop');
    setMode('start');
    Sounds.uiClick();
  };

  const handleResumeGame = () => {
    gameEngineRef.current?.requestResume();
    Sounds.uiClick();
  };
  
  const handleRequestPauseFromHud = () => {
    gameEngineRef.current?.requestPause();
    Sounds.uiClick();
  };

  // Enhanced keyboard navigation with better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
          if (modalOpen || (isGamePaused && mode === 'play')) return;

          if (mode === 'start') {
            const menuItemsCount = 7; // Updated for new menu items
            if (e.key === 'ArrowUp') {
              setMainMenuSelection(prev => (prev - 1 + menuItemsCount) % menuItemsCount);
              Sounds.uiClick();
            } else if (e.key === 'ArrowDown') {
              setMainMenuSelection(prev => (prev + 1) % menuItemsCount);
              Sounds.uiClick();
            } else if (e.key === 'Enter' || e.key === ' ') {
              Sounds.uiConfirm();
              if (mainMenuSelection === 0) startGame(false); 
              else if (mainMenuSelection === 1) startGame(true); 
              else if (mainMenuSelection === 2) { setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); setShopTab('skypeckers'); }
              else if (mainMenuSelection === 3) setMode('howtoplay');
              else if (mainMenuSelection === 4) setMode('achievements');
              else if (mainMenuSelection === 5) setModalOpen('settings');
              else if (mainMenuSelection === 6) {
                // Daily reward
                const today = new Date();
                const canClaimDailyReward = !lastDailyRewardClaimed || !isSameDay(new Date(lastDailyRewardClaimed), today);
                if (canClaimDailyReward) {
                  triggerAd('dailyReward', () => {
                    setTotalCoins(prev => prev + DAILY_REWARD_COINS);
                    setLastDailyRewardClaimed(new Date().toISOString());
                    showNotification({
                      type: 'reward',
                      title: 'Daily Reward',
                      message: `+${DAILY_REWARD_COINS} coins!`
                    });
                    Sounds.coin();
                  });
                }
              }
            }
          } else if (mode === 'shop') {
            const itemsInCurrentTab = shopTab === 'skypeckers' ? ENHANCED_SKYPECKER_TYPES.length : ENHANCED_TRAIL_EFFECTS.length;
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
                const skyPecker = ENHANCED_SKYPECKER_TYPES[shopSelection];
                const cost = shopSelection === 0 ? 0 : shopSelection * 100; // Simplified cost calculation
                const isOwned = ownedSkyPeckerIndices.includes(shopSelection);
                
                if (isOwned) {
                  setSelectedSkyPeckerTypeIndex(shopSelection);
                  Sounds.uiConfirm();
                  setMode('start');
                } else if (skyPecker.unlockCondition === 'premium_iap') {
                  // Handle IAP purchase
                  showNotification({
                    type: 'info',
                    title: 'Premium Bird',
                    message: 'This would open IAP purchase flow'
                  });
                } else if (totalCoins >= cost) {
                  setTotalCoins(prev => prev - cost);
                  setOwnedSkyPeckerIndices(prev => [...prev, shopSelection].sort((a,b)=>a-b));
                  setSelectedSkyPeckerTypeIndex(shopSelection);
                  Sounds.uiConfirm();
                  setMode('start');
                } else {
                  Sounds.uiDeny();
                }
              } else {
                const trail = ENHANCED_TRAIL_EFFECTS[shopSelection];
                const isOwned = ownedTrailEffectIds.includes(trail.id);
                
                if (isOwned) {
                  setSelectedTrailEffectId(trail.id);
                  Sounds.uiConfirm();
                  setMode('start');
                } else if (totalCoins >= trail.cost) {
                  setTotalCoins(prev => prev - trail.cost);
                  setOwnedTrailEffectIds(prev => [...prev, trail.id]);
                  setSelectedTrailEffectId(trail.id);
                  Sounds.uiConfirm();
                  setMode('start');
                } else {
                  Sounds.uiDeny();
                }
              }
            } else if (e.key === 'Escape') {
              setMode('start');
              Sounds.uiClick();
            }
          } else if (mode === 'achievements' || mode === 'howtoplay') {
            if (e.key === 'Escape') {
              setMode('start');
              Sounds.uiClick();
            }
          } else if (mode === 'over') {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              setMode('start');
              Sounds.uiClick();
            }
          } else if (mode === 'play') {
            if (e.key === 'Escape' && !isGamePaused) { 
              handleRequestPauseFromHud();
            } else if (e.key === 'Escape' && isGamePaused) {
              handleResumeGame();
            }
          }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [
        mode, mainMenuSelection, shopSelection, shopTab, selectedSkyPeckerTypeIndex, totalCoins, 
        ownedSkyPeckerIndices, ownedTrailEffectIds, selectedTrailEffectId, startGame, modalOpen, 
        isGamePaused, handleResumeGame, handleRequestPauseFromHud, lastDailyRewardClaimed,
        triggerAd, showNotification
      ]);

      const handleContinueRunRequested = () => {
        setIsGamePaused(false);
        triggerAd('continueRun', () => {
          gameEngineRef.current?.resumeAfterAdContinue();
          setMode('play'); 
          continueRunCountThisGameSessionRef.current++;
        });
      };
      
      const canContinueRun = continueRunCountThisGameSessionRef.current < CONTINUE_RUN_AD_LIMIT && !currentPlayedModeIsZen; 
      const currentSelectedTrailEffect = ENHANCED_TRAIL_EFFECTS.find(t => t.id === selectedTrailEffectId) || ENHANCED_TRAIL_EFFECTS[0];

      const renderStartScreen = (): ReactNode => {
        const selectedSkyPecker = ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex];
        const today = new Date();
        const canClaimDailyReward = !lastDailyRewardClaimed || !isSameDay(new Date(lastDailyRewardClaimed), today);

        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-100 p-4 space-y-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-slate-900/20 pointer-events-none"></div>
            <div className="absolute top-10 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Header */}
            <header className="text-center relative z-10">
              <h1 className="text-6xl font-black tracking-wider mb-2 bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-pulse">
                SKYPECKER
              </h1>
              <h2 className="text-2xl font-bold text-purple-300 tracking-wide">POWERUP EDITION</h2>
              <div className="mt-2 flex justify-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  v2.0 Enhanced
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">🪙</span>
                  {totalCoins.toLocaleString()} coins
                </div>
              </div>
            </header>

            <div className="flex flex-col lg:flex-row items-center lg:items-start lg:space-x-8 w-full max-w-6xl relative z-10">
              {/* Menu Section */}
              <div className="w-full lg:w-2/5 flex flex-col items-center space-y-2 mb-6 lg:mb-0">
                <MenuButton 
                  onClick={() => { setMainMenuSelection(0); startGame(false); }} 
                  selected={mainMenuSelection === 0} 
                  variant="primary" 
                  icon="🎮"
                  size="lg"
                  className="max-w-sm"
                >
                  PLAY GAME
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setMainMenuSelection(1); startGame(true); }} 
                  selected={mainMenuSelection === 1} 
                  variant="zen" 
                  icon="🧘"
                  className="max-w-sm"
                >
                  ZEN MODE
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setMainMenuSelection(2); setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); setShopTab('skypeckers'); }} 
                  selected={mainMenuSelection === 2} 
                  variant="secondary" 
                  icon="🛍️"
                  className="max-w-sm"
                >
                  BIRD SHOP
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setMainMenuSelection(3); setMode('howtoplay'); }} 
                  selected={mainMenuSelection === 3} 
                  variant="secondary" 
                  icon="📖"
                  className="max-w-sm"
                >
                  HOW TO PLAY
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setMainMenuSelection(4); setMode('achievements'); }} 
                  selected={mainMenuSelection === 4} 
                  variant="secondary" 
                  icon="🏆"
                  badge={Object.values(achievements).filter(a => a.unlocked).length}
                  className="max-w-sm"
                >
                  ACHIEVEMENTS
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setMainMenuSelection(5); setModalOpen('settings'); }} 
                  selected={mainMenuSelection === 5} 
                  variant="secondary" 
                  icon="⚙️"
                  className="max-w-sm"
                >
                  SETTINGS
                </MenuButton>
                
                <MenuButton 
                  onClick={() => {
                    if (canClaimDailyReward) {
                      triggerAd('dailyReward', () => {
                        setTotalCoins(prev => prev + DAILY_REWARD_COINS);
                        setLastDailyRewardClaimed(new Date().toISOString());
                        showNotification({
                          type: 'reward',
                          title: 'Daily Reward',
                          message: `+${DAILY_REWARD_COINS} coins earned!`
                        });
                        Sounds.coin();
                      });
                    }
                  }}
                  variant="daily"
                  disabled={!canClaimDailyReward}
                  selected={false} 
                  icon="🎁"
                  className="max-w-sm"
                >
                  {canClaimDailyReward ? `DAILY REWARD (+${DAILY_REWARD_COINS})` : "REWARD CLAIMED"}
                </MenuButton>
              </div>
              
              {/* Game Info Section */}
              <div className="w-full lg:w-3/5 space-y-4">
                {/* Current Setup Card */}
                <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-3xl shadow-2xl backdrop-blur-md border border-slate-700/50">
                  <h3 className="text-xl font-semibold mb-4 text-teal-300 text-center">Current Setup</h3>
                  
                  <div className="flex flex-col sm:flex-row justify-center items-center mb-4 sm:space-x-4">
                    <div className="relative mb-4 sm:mb-0">
                      <SkyPeckerPreviewCanvas 
                        skyPeckerConfig={selectedSkyPecker} 
                        size={80} 
                        selectedTrail={currentSelectedTrailEffect}
                        showAnimation={true}
                        previewMode="flying"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    </div>
                    
                    <div className="text-center sm:text-left">
                      <h4 className="text-2xl font-bold text-slate-100 mb-1">{selectedSkyPecker.name}</h4>
                      <p className="text-sm text-purple-300 mb-2">Trail: {currentSelectedTrailEffect.name}</p>
                      <div className="flex justify-center sm:justify-start items-center gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${
                            i < (selectedSkyPecker.rarityTier === 'legendary' ? 5 : 
                                 selectedSkyPecker.rarityTier === 'epic' ? 4 : 
                                 selectedSkyPecker.rarityTier === 'rare' ? 3 : 2) ? 
                            'bg-yellow-400' : 'bg-slate-600'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 text-center mb-4 leading-relaxed px-2">{selectedSkyPecker.description}</p>
                  
                  {/* Bird Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">Size</div>
                      <div className="font-bold text-purple-300">{selectedSkyPecker.size}x</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">Speed</div>
                      <div className="font-bold text-purple-300">{selectedSkyPecker.speed}x</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">Type</div>
                      <div className="font-bold text-cyan-300 capitalize">{selectedSkyPecker.birdType}</div>
                    </div>
                    <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                      <div className="text-xs text-slate-400 mb-1">Rarity</div>
                      <div className={`font-bold capitalize ${
                        selectedSkyPecker.rarityTier === 'legendary' ? 'text-orange-400' :
                        selectedSkyPecker.rarityTier === 'epic' ? 'text-purple-400' :
                        selectedSkyPecker.rarityTier === 'rare' ? 'text-blue-400' : 'text-slate-400'
                      }`}>
                        {selectedSkyPecker.rarityTier || 'common'}
                      </div>
                    </div>
                  </div>

                  {/* Starting Power-Up Selection */}
                  <div className="mb-4">
                    <p className="text-sm mb-2 text-center text-slate-200">Starting Power-Up:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {STARTING_POWERUP_OPTIONS.map(opt => (
                        <button 
                          key={opt.name} 
                          onClick={() => {setSelectedStartPower(opt.value); Sounds.uiClick();}}
                          className={`py-2 px-2 rounded-xl text-xs font-medium transition-all duration-200 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2
                                     ${selectedStartPower === opt.value ? 
                                       'bg-gradient-to-r from-teal-500 to-cyan-500 text-white ring-teal-300 shadow-teal-500/25' : 
                                       'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-200 ring-slate-500'}`}
                        >
                          {opt.name}
                        </button>          
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Challenge Card */}
                {dailyChallenge && (
                  <div className="p-4 bg-gradient-to-br from-purple-800/50 to-indigo-800/50 rounded-2xl shadow-xl backdrop-blur-md border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-yellow-300 flex items-center">
                        <span className="mr-2">🎯</span>
                        Daily Challenge
                      </h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        dailyChallenge.difficulty === 'easy' ? 'bg-green-500/30 text-green-300' :
                        dailyChallenge.difficulty === 'hard' ? 'bg-red-500/30 text-red-300' :
                        'bg-yellow-500/30 text-yellow-300'
                      }`}>
                        {dailyChallenge.difficulty}
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 mb-2">{dailyChallenge.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-300">
                        Reward: <span className="font-medium text-yellow-300">{dailyChallenge.reward} coins</span>
                        {dailyChallenge.bonusReward && (
                          <span className="text-xs text-purple-300 ml-2">+{dailyChallenge.bonusReward} bonus</span>
                        )}
                      </div>
                      {dailyChallenge.completedToday && (
                        <div className="flex items-center text-green-400 font-bold text-sm">
                          <span className="mr-1">✅</span>
                          COMPLETED!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Player Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">Best Score</div>
                    <div className="font-bold text-green-300">{highScore}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">Zen Best</div>
                    <div className="font-bold text-sky-300">{zenHighScore}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">Games</div>
                    <div className="font-bold text-purple-300">{playerStats.totalGamesPlayed}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">Skill</div>
                    <div className={`font-bold capitalize ${
                      playerStats.skillLevel === 'expert' ? 'text-red-400' :
                      playerStats.skillLevel === 'advanced' ? 'text-orange-400' :
                      playerStats.skillLevel === 'intermediate' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {playerStats.skillLevel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-xs text-slate-400 relative z-10 mt-auto">
              <p>Use ARROW KEYS to navigate • ENTER/SPACE to select • ESC to go back</p>
            </footer>
          </div>
        );
      };

      const renderShopScreen = (): ReactNode => (
        <div className="flex flex-col items-center h-full text-slate-100 p-4 overflow-y-auto custom-scrollbar">
          {/* Settings button in top corner */}
          <button
            onClick={() => setModalOpen('settings')}
            className="fixed top-4 right-4 z-30 w-12 h-12 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg"
          >
            <span className="text-xl">⚙️</span>
          </button>

          <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text my-6 tracking-wide">
            BIRD SHOP
          </h1>
          
          <div className="mb-4 flex items-center space-x-4">
            <div className="flex items-center text-lg">
              <span className="text-yellow-400 mr-2 text-2xl">🪙</span>
              <span className="font-bold text-yellow-300">{totalCoins.toLocaleString()}</span>
              <span className="text-slate-400 ml-1">coins</span>
            </div>
            
            {/* Quick coin purchase button */}
            <button
              onClick={() => {
                showNotification({
                  type: 'info',
                  title: 'Coin Shop',
                  message: 'This would open the coin purchase menu'
                });
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-full text-white font-medium text-sm transition-all duration-200 transform hover:scale-105"
            >
              + Buy Coins
            </button>
          </div>
          
          <div className="flex space-x-4 mb-6 bg-slate-900/50 p-2 rounded-2xl shadow-md backdrop-blur-sm">
            <button 
              onClick={() => { setShopTab('skypeckers'); setShopSelection(0); Sounds.uiClick(); }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105
                          ${shopTab === 'skypeckers' ? 
                            'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' : 
                            'text-slate-300 hover:bg-slate-700/70 hover:text-white'}`}
            >
              🐦 Birds ({ENHANCED_SKYPECKER_TYPES.length})
            </button>
            <button 
              onClick={() => { setShopTab('trails'); setShopSelection(0); Sounds.uiClick(); }}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ease-in-out transform hover:scale-105
                          ${shopTab === 'trails' ? 
                            'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' : 
                            'text-slate-300 hover:bg-slate-700/70 hover:text-white'}`}
            >
              ✨ Trail Effects ({ENHANCED_TRAIL_EFFECTS.length})
            </button>
          </div>

          {shopTab === 'skypeckers' && (
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {ENHANCED_SKYPECKER_TYPES.map((skyPecker, i) => {
                const cost = i === 0 ? 0 : i * 150; // Increased cost for better monetization
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
                    showStats={true}
                    onSelectOrPurchase={() => {
                      if (isOwned) {
                        setSelectedSkyPeckerTypeIndex(i);
                        Sounds.uiConfirm();
                        showNotification({
                          type: 'info',
                          title: 'Bird Equipped',
                          message: `${skyPecker.name} is now active!`
                        });
                      } else if (skyPecker.unlockCondition === 'premium_iap') {
                        showNotification({
                          type: 'info',
                          title: 'Premium Bird',
                          message: `${skyPecker.name} requires premium purchase`
                        });
                      } else if (totalCoins >= cost) {
                        setTotalCoins(prev => prev - cost);
                        setOwnedSkyPeckerIndices(prev => [...prev, i].sort((a,b)=>a-b));
                        setSelectedSkyPeckerTypeIndex(i);
                        Sounds.uiConfirm();
                        showNotification({
                          type: 'reward',
                          title: 'Bird Unlocked!',
                          message: `${skyPecker.name} is now yours!`
                        });
                      } else {
                        Sounds.uiDeny();
                        showNotification({
                          type: 'warning',
                          title: 'Not Enough Coins',
                          message: `Need ${cost - totalCoins} more coins`
                        });
                      }
                      setShopSelection(i);
                    }}
                  />
                );
              })}
            </div>
          )}

          {shopTab === 'trails' && (
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {ENHANCED_TRAIL_EFFECTS.map((trail, i) => {
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
                        setSelectedTrailEffectId(trail.id);
                        Sounds.uiConfirm();
                        showNotification({
                          type: 'info',
                          title: 'Trail Effect Equipped',
                          message: `${trail.name} is now active!`
                        });
                      } else if (totalCoins >= trail.cost) {
                        setTotalCoins(prev => prev - trail.cost);
                        setOwnedTrailEffectIds(prev => [...prev, trail.id]);
                        setSelectedTrailEffectId(trail.id);
                        Sounds.uiConfirm();
                        showNotification({
                          type: 'reward',
                          title: 'Trail Effect Unlocked!',
                          message: `${trail.name} is now yours!`
                        });
                      } else {
                        Sounds.uiDeny();
                        showNotification({
                          type: 'warning',
                          title: 'Not Enough Coins',
                          message: `Need ${trail.cost - totalCoins} more coins`
                        });
                      }
                      setShopSelection(i);
                    }}
                  />
                );
              })}
            </div>
          )}

          <MenuButton 
            onClick={() => { setMode('start'); Sounds.uiClick(); }} 
            variant="secondary" 
            className="mt-8 w-auto max-w-xs px-10"
            icon="🏠"
          >
            BACK TO MENU
          </MenuButton>
          
          <p className="text-xs text-slate-400 mt-4 text-center">
            ARROW KEYS to navigate • TAB to switch categories • ENTER/SPACE to select
          </p>
        </div>
      );

      const renderHowToPlayScreen = (): ReactNode => { 
        const sectionTitleClass = "text-2xl font-bold text-teal-300 mb-3 mt-6 pb-2 border-b-2 border-teal-500/30 tracking-wide flex items-center";
        const textClass = "text-slate-200 leading-relaxed text-sm";
        const itemClass = "p-4 bg-slate-800/60 rounded-xl mb-4 shadow-lg backdrop-blur-sm border border-slate-700/50";
        const keyClass = "px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-300 border border-slate-400 rounded shadow-sm mx-1";
        
        const powerupColors: Record<string, string> = { 
          shield: 'bg-sky-500', slow: 'bg-blue-500', shrink: 'bg-pink-500', 
          magnet: 'bg-yellow-500', speed: 'bg-red-500'
        };

        return (
          <div className="flex flex-col items-center h-full text-slate-100 p-4 overflow-y-auto custom-scrollbar">
            {/* Settings button in top corner */}
            <button
              onClick={() => setModalOpen('settings')}
              className="fixed top-4 right-4 z-30 w-12 h-12 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              <span className="text-xl">⚙️</span>
            </button>

            <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text my-6 tracking-wide">
              HOW TO PLAY
            </h1>
            
            <div className="w-full max-w-4xl space-y-6 text-left">
              <section>
                <h2 className={sectionTitleClass}>
                  <span className="mr-3 text-3xl">🎮</span>
                  Controls
                </h2>
                <div className={itemClass}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className={`${textClass} mb-2`}>
                        <strong className="text-green-300">Flap:</strong> Press <kbd className={keyClass}>SPACE</kbd> or 
                        <kbd className={keyClass}>↑</kbd> or <strong className="text-green-300">CLICK/TAP</strong> the game screen.
                      </p>
                      <p className={textClass}>
                        <strong className="text-green-300">Pause:</strong> Press <kbd className={keyClass}>P</kbd> or 
                        <kbd className={keyClass}>ESC</kbd> or tap the <strong className="text-teal-300">⏸️</strong> button.
                      </p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-2">💡 Pro Tip:</p>
                      <p className="text-xs text-slate-300">
                        Hold tap/click longer for stronger flaps! Master the timing for perfect control.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>
                  <span className="mr-3 text-3xl">🎯</span>
                  Game Modes
                </h2>
                <div className={itemClass}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <strong className="text-purple-300 text-lg flex items-center mb-2">
                        <span className="mr-2">🎮</span>Normal Mode
                      </strong>
                      <p className={`${textClass} mb-3`}>
                        Navigate through pipes while collecting coins and avoiding enemies. 
                        Fill your power gauge for amazing abilities!
                      </p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Dynamic difficulty scaling</li>
                        <li>• 8 unique enemy types with special abilities</li>
                        <li>• Power-ups and debuff system</li>
                        <li>• Daily challenges and achievements</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-sky-300 text-lg flex items-center mb-2">
                        <span className="mr-2">🧘</span>Zen Mode
                      </strong>
                      <p className={`${textClass} mb-3`}>
                        A peaceful, meditative experience with wider gaps and no enemies. 
                        Perfect for relaxation and flow state.
                      </p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        <li>• Wider pipe gaps for easier navigation</li>
                        <li>• No enemies or debuffs</li>
                        <li>• Calming visual effects</li>
                        <li>• Separate high score tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>
                  <span className="mr-3 text-3xl">⚡</span>
                  Power-Up System
                </h2>
                <div className={itemClass}>
                  <p className={`${textClass} mb-4`}>
                    Collect coins to fill your <strong className="text-yellow-300">PWR</strong> gauge. 
                    When full, a random power-up activates automatically!
                  </p>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {POWERUP_OPTIONS.filter(p => p).map(powerup => (
                      <div key={powerup} className="flex items-center space-x-3 bg-slate-700/30 rounded-lg p-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${powerupColors[powerup!] || 'bg-slate-400'}`}>
                          <span className="text-white font-bold text-sm">
                            {powerup === 'shield' ? '🛡️' : 
                             powerup === 'slow' ? '⏱️' : 
                             powerup === 'shrink' ? '🔽' : 
                             powerup === 'magnet' ? '🧲' : 
                             powerup === 'speed' ? '⚡' : '❓'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <strong className="text-purple-300 capitalize text-sm block">{powerup}</strong>
                          <span className="text-xs text-slate-400">
                            {powerup === 'shield' && "Temporary invincibility"}
                            {powerup === 'slow' && "Slows down time"}
                            {powerup === 'shrink' && "Become smaller"}
                            {powerup === 'magnet' && "Attract nearby coins"}
                            {powerup === 'speed' && "Boost speed (risky!)"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>
                  <span className="mr-3 text-3xl">👾</span>
                  Enemies & Debuffs
                </h2>
                <div className={itemClass}>
                  <p className={`${textClass} mb-4`}>
                    8 intelligent enemy types await you, each with unique behaviors and debuff effects:
                  </p>
                  
                  <div className="grid gap-3">
                    {ENHANCED_ENEMY_TYPES.slice(0, 4).map((enemyConf, index) => {
                      const debuffConf = ENHANCED_DEBUFF_CONFIG[enemyConf.debuffType];
                      return (
                        <div key={enemyConf.visualType} className="flex items-start space-x-3 bg-slate-700/30 rounded-lg p-3">
                          <div className={`w-8 h-8 rounded-full mt-1 flex items-center justify-center shadow-md`} style={{
                            backgroundColor: enemyConf.color || '#666'
                          }}>
                            <span className="text-white text-sm font-bold">
                              {enemyConf.visualType === 'SPIKEBALL' ? '🔮' :
                               enemyConf.visualType === 'GHOST' ? '👻' :
                               enemyConf.visualType === 'SPRITE' ? '🧚' :
                               enemyConf.visualType === 'VORTEX' ? '🌪️' : '❓'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <strong className="text-purple-300 text-sm">{enemyConf.visualType.toLowerCase().replace('_', ' ')}</strong>
                              <div className="flex items-center text-xs">
                                <span className="text-slate-400 mr-1">Tier</span>
                                <div className="flex">
                                  {Array.from({length: 5}).map((_, i) => (
                                    <div key={i} className={`w-1 h-1 rounded-full mr-0.5 ${
                                      i < (enemyConf.aggressionLevel || 1) ? 'bg-red-500' : 'bg-slate-600'
                                    }`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-1">
                              <strong className="text-red-300">{debuffConf.description}</strong>
                            </p>
                            <p className="text-xs text-slate-500">
                              AI: {enemyConf.aiPattern?.replace('_', ' ')} • Speed: {enemyConf.baseSpeedMultiplier}x
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-center py-2">
                      <p className="text-xs text-slate-400">
                        ...and 4 more elite enemies await at higher difficulties! 
                        <span className="text-purple-300"> Each with unique abilities.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>
                  <span className="mr-3 text-3xl">🐦</span>
                  Bird Types & Abilities
                </h2>
                <div className={itemClass}>
                  <p className={`${textClass} mb-4`}>
                    Each bird has unique stats and special abilities. Unlock them through gameplay or premium purchases:
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ENHANCED_SKYPECKER_TYPES.slice(0, 4).map((bird) => (
                      <div key={bird.name} className="bg-slate-700/30 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <SkyPeckerPreviewCanvas 
                            skyPeckerConfig={bird} 
                            size={40} 
                            previewMode="static"
                          />
                          <div className="ml-3">
                            <h4 className="font-bold text-slate-100">{bird.name}</h4>
                            <div className="flex items-center gap-1">
                              {Array.from({length: 5}).map((_, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full ${
                                  i < (bird.rarityTier === 'legendary' ? 5 : 
                                       bird.rarityTier === 'epic' ? 4 : 
                                       bird.rarityTier === 'rare' ? 3 : 2) ? 
                                  'bg-yellow-400' : 'bg-slate-600'
                                }`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{bird.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Size: {bird.size}x</span>
                          <span className="text-slate-500">Speed: {bird.speed}x</span>
                          <span className={`capitalize ${
                            bird.rarityTier === 'legendary' ? 'text-orange-400' :
                            bird.rarityTier === 'epic' ? 'text-purple-400' :
                            bird.rarityTier === 'rare' ? 'text-blue-400' : 'text-slate-400'
                          }`}>
                            {bird.rarityTier || 'common'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>
                  <span className="mr-3 text-3xl">🎯</span>
                  Tips & Strategy
                </h2>
                <div className={itemClass}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-green-300 mb-2">🎮 Gameplay Tips</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Use varying tap strength for precise control</li>
                        <li>• Collect coins to charge your power gauge faster</li>
                        <li>• Different birds excel in different situations</li>
                        <li>• Learn enemy patterns to avoid debuffs</li>
                        <li>• Use the magnet power-up strategically</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-300 mb-2">💰 Progression Tips</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Complete daily challenges for bonus coins</li>
                        <li>• Unlock birds to access new abilities</li>
                        <li>• Perfect runs give achievement bonuses</li>
                        <li>• Watch ads for continue opportunities</li>
                        <li>• Trail effects are purely cosmetic but fun!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <MenuButton 
              onClick={() => { setMode('start'); Sounds.uiClick(); }} 
              variant="secondary" 
              className="mt-8 w-auto max-w-xs px-10"
              icon="🏠"
            >
              BACK TO MENU
            </MenuButton>
          </div>
        );
      };

      const renderAchievementsScreen = (): ReactNode => ( 
        <div className="flex flex-col items-center h-full text-slate-100 p-4 overflow-y-auto custom-scrollbar">
          {/* Settings button in top corner */}
          <button
            onClick={() => setModalOpen('settings')}
            className="fixed top-4 right-4 z-30 w-12 h-12 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg"
          >
            <span className="text-xl">⚙️</span>
          </button>

          <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text my-6 tracking-wide">
            ACHIEVEMENTS
          </h1>
          
          <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-4 bg-slate-800/50 rounded-2xl px-6 py-3 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Object.values(achievements).filter(a => a.unlocked).length}
                </div>
                <div className="text-xs text-slate-400">Unlocked</div>
              </div>
              <div className="w-px h-8 bg-slate-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Object.values(achievements).length}
                </div>
                <div className="text-xs text-slate-400">Total</div>
              </div>
              <div className="w-px h-8 bg-slate-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round((Object.values(achievements).filter(a => a.unlocked).length / Object.values(achievements).length) * 100)}%
                </div>
                <div className="text-xs text-slate-400">Complete</div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-4xl">
            {/* Achievement Categories */}
            <div className="grid gap-6">
              {Object.entries(achievements).map(([key, ach]) => (
                <div key={key} 
                     className={`group p-6 rounded-2xl shadow-xl transition-all duration-300 border-2 backdrop-blur-sm transform hover:scale-[1.02]
                                ${ach.unlocked ? 
                                  'bg-gradient-to-br from-green-700/60 to-emerald-800/60 border-green-500/70 shadow-green-500/20' : 
                                  'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/70 opacity-80 hover:opacity-100'}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-all duration-300 group-hover:scale-110
                                    ${ach.unlocked ? 
                                      'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/30' : 
                                      'bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/20'}`}>
                      <span className={ach.unlocked ? 'animate-pulse' : ''}>
                        {ach.unlocked ? '🌟' : '🏆'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-xl font-bold ${ach.unlocked ? 'text-slate-100' : 'text-slate-300'}`}>
                          {ach.name}
                        </h3>
                        {ach.unlocked && ach.dateUnlocked && (
                          <div className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full">
                            {new Date(ach.dateUnlocked).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <p className={`text-sm mb-3 ${ach.unlocked ? 'text-green-200' : 'text-slate-400'}`}>
                        {ach.desc}
                      </p>
                      
                      {ach.rewardCoins && (
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-400 mr-1">🪙</span>
                          <span className="text-sm text-yellow-300">
                            +{ach.rewardCoins} coins reward
                          </span>
                        </div>
                      )}
                      
                      {ach.target && !ach.unlocked && ach.progress !== undefined && ach.progress < ach.target && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Progress</span>
                            <span className="text-sm text-teal-300 font-medium">
                              {ach.progress} / {ach.target}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-3 shadow-inner overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                              style={{ width: `${Math.min(100, (ach.progress || 0) / ach.target * 100)}%` }}
                            >
                              <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MenuButton 
            onClick={() => { setMode('start'); Sounds.uiClick(); }} 
            variant="secondary" 
            className="mt-8 w-auto max-w-xs px-10"
            icon="🏠"
          >
            BACK TO MENU
          </MenuButton>
        </div>
      );

      const renderGameOverScreen = (): ReactNode => {
        const currentModeHighScore = currentPlayedModeIsZen ? zenHighScore : highScore;
        const modeName = currentPlayedModeIsZen ? "Zen Mode" : "Normal Mode";
        const coinsEarned = coinsCollectedThisRunForGameOverScreenRef.current;
        
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-100 p-4 text-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-purple-900/20 to-slate-900/20 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

            <div className="relative z-10 max-w-2xl">
              <h1 className="text-6xl font-black text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text mb-4 animate-pulse">
                GAME OVER
              </h1>
              
              <div className="mb-6 p-6 bg-slate-800/60 rounded-3xl backdrop-blur-md border border-slate-700/50 shadow-2xl">
                <p className="text-xl text-sky-300 mb-4">({modeName})</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-700/50 rounded-2xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Final Score</div>
                    <div className="text-3xl font-bold text-yellow-300">{engineHud.score.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-2xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Best Score</div>
                    <div className="text-2xl font-bold text-green-300">{currentModeHighScore.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-2xl p-4">
                    <div className="text-sm text-slate-400 mb-1">Coins Earned</div>
                    <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center">
                      <span className="mr-2">🪙</span>
                      {coinsEarned}
                    </div>
                  </div>
                </div>

                {/* Special accomplishments */}
                <div className="space-y-2">
                  {engineHud.score === currentModeHighScore && engineHud.score > 0 && (
                    <div className="flex items-center justify-center text-yellow-200 font-bold text-xl animate-bounce">
                      <span className="mr-2">🎉</span>
                      NEW HIGH SCORE!
                      <span className="ml-2">🎉</span>
                    </div>
                  )}
                  
                  {engineHud.perfectRun && engineHud.score > 0 && !currentPlayedModeIsZen && (
                    <div className="flex items-center justify-center text-teal-300 font-bold text-lg">
                      <span className="mr-2">✨</span>
                      PERFECT RUN!
                      <span className="ml-2">✨</span>
                    </div>
                  )}

                  {milestoneCountThisRunRef.current > 0 && (
                    <div className="flex items-center justify-center text-purple-300 font-medium">
                      <span className="mr-2">🎯</span>
                      {milestoneCountThisRunRef.current} Milestones Reached
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 mb-6">
                {canContinueRun && ( 
                  <MenuButton 
                    onClick={() => triggerAd('continueRun', () => {
                      gameEngineRef.current?.resumeAfterAdContinue();
                      setMode('play');
                    })} 
                    variant="special" 
                    icon="▶️"
                    className="max-w-md"
                  >
                    CONTINUE RUN (Watch Ad)
                  </MenuButton>
                )}
                
                {coinsEarned > 0 && (
                  <MenuButton 
                    onClick={() => triggerAd('doubleCoins', () => {
                      setTotalCoins(prev => prev + coinsEarned);
                      showNotification({
                        type: 'reward',
                        title: 'Coins Doubled!',
                        message: `+${coinsEarned} bonus coins earned!`
                      });
                      Sounds.coin();
                      coinsCollectedThisRunForGameOverScreenRef.current = 0; 
                    })} 
                    variant="special" 
                    icon="💰"
                    className="max-w-md"
                  >
                    DOUBLE COINS ({coinsEarned}) - Watch Ad
                  </MenuButton>
                )}
                
                <MenuButton 
                  onClick={() => { setMode('start'); Sounds.uiClick(); }} 
                  variant="primary" 
                  icon="🔄"
                  size="lg"
                  className="max-w-md"
                >
                  PLAY AGAIN
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setMode('shop'); setShopTab('skypeckers'); Sounds.uiClick(); }} 
                  variant="secondary" 
                  icon="🛍️"
                  className="max-w-md"
                >
                  VISIT SHOP
                </MenuButton>
              </div>

              {/* Social sharing */}
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    // Screenshot sharing would be implemented here
                    showNotification({
                      type: 'info',
                      title: 'Share Score',
                      message: 'Screenshot sharing would open here!'
                    });
                    handleAchievementProgress('socialButterfly', 1);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  📱 Share Score
                </button>
                
                <button 
                  onClick={() => setModalOpen('leaderboard')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  🏆 Leaderboard
                </button>
              </div>
            </div>
          </div>
        );
      };

      const renderSettingsModal = (): ReactNode => (
        <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 
                        transition-opacity duration-300 ease-in-out ${modalOpen === 'settings' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-6 rounded-3xl shadow-2xl w-full max-w-md text-slate-100 relative border border-slate-700/50 backdrop-blur-md
                           transform transition-all duration-300 ease-in-out ${modalOpen === 'settings' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <button 
              onClick={() => { setModalOpen(null); Sounds.uiClick(); }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl transition-colors hover:rotate-90 duration-200"
            >
              ×
            </button>
            
            <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text mb-8 text-center tracking-wide">
              Settings
            </h2>
            
            <div className="space-y-6">
              {/* Audio Settings */}
              <div className="bg-slate-700/30 rounded-2xl p-4 space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                  <span className="mr-2">🔊</span>Audio Settings
                </h3>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="bgmVolumeSet" className="text-sm text-slate-300">Music Volume</label>
                    <span className="text-sm font-medium text-teal-300">{Math.round(bgmVolume*100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    id="bgmVolumeSet" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={bgmVolume} 
                    onChange={(e) => setBgmVolumeState(parseFloat(e.target.value))} 
                    className="w-full h-3 bg-slate-600 rounded-full appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="sfxVolumeSet" className="text-sm text-slate-300">Sound Effects</label>
                    <span className="text-sm font-medium text-cyan-300">{Math.round(sfxVolume*100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    id="sfxVolumeSet" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={sfxVolume} 
                    onChange={(e) => setSfxVolumeState(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-600 rounded-full appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              </div>

              {/* Performance Settings */}
              <div className="bg-slate-700/30 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                  <span className="mr-2">⚡</span>Performance
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    Current FPS: <span className={`font-bold ${
                      performanceMetrics.fps >= 50 ? 'text-green-400' : 
                      performanceMetrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {performanceMetrics.fps.toFixed(0)}
                    </span>
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    performanceMetrics.fps >= 50 ? 'bg-green-900/50 text-green-300' : 
                    performanceMetrics.fps >= 30 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {performanceMetrics.fps >= 50 ? 'SMOOTH' : 
                     performanceMetrics.fps >= 30 ? 'MEDIUM' : 'LOW'}
                  </span>
                </div>
              </div>

              {/* Monetization Actions */}
              <div className="space-y-3">
                <MenuButton 
                  onClick={() => triggerAd('freeCoins', () => {
                    setTotalCoins(prev => prev + REWARDED_AD_FREE_COINS_AMOUNT);
                    showNotification({
                      type: 'reward',
                      title: 'Free Coins',
                      message: `+${REWARDED_AD_FREE_COINS_AMOUNT} coins earned!`
                    });
                    Sounds.coin();
                  })} 
                  variant="special" 
                  icon="🪙"
                  className="w-full"
                >
                  GET {REWARDED_AD_FREE_COINS_AMOUNT} FREE COINS (Watch Ad)
                </MenuButton>
                
                <MenuButton 
                  onClick={() => {
                    setHasRemovedAds(true); 
                    showNotification({
                      type: 'info',
                      title: 'Ads Removed',
                      message: 'Enjoy ad-free gaming!'
                    }); 
                    Sounds.uiConfirm();
                  }} 
                  disabled={hasRemovedAds}
                  variant={hasRemovedAds ? "secondary" : "special"}
                  icon={hasRemovedAds ? "✅" : "🚫"}
                  className="w-full"
                >
                  {hasRemovedAds ? "ADS REMOVED" : `REMOVE ADS - $${SHOP_PRICING.REMOVE_ADS}`}
                </MenuButton>
                
                <MenuButton 
                  onClick={() => { setModalOpen('leaderboard'); Sounds.uiClick(); }} 
                  variant="secondary" 
                  icon="🏆"
                  className="w-full"
                >
                  VIEW LEADERBOARD
                </MenuButton>
              </div>

              {/* Player Statistics */}
              <div className="bg-slate-700/30 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center">
                  <span className="mr-2">📊</span>Your Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{playerStats.totalGamesPlayed}</div>
                    <div className="text-slate-400">Games Played</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{playerStats.averageScore}</div>
                    <div className="text-slate-400">Avg. Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{playerStats.totalCoinsCollected.toLocaleString()}</div>
                    <div className="text-slate-400">Total Coins</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold capitalize ${
                      playerStats.skillLevel === 'expert' ? 'text-red-400' :
                      playerStats.skillLevel === 'advanced' ? 'text-orange-400' :
                      playerStats.skillLevel === 'intermediate' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {playerStats.skillLevel}
                    </div>
                    <div className="text-slate-400">Skill Level</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      const renderLeaderboardScreen = (): ReactNode => {
        // Mock leaderboard data with enhanced entries
        const mockLeaderboard = [
          { name: "SkyMaster", score: 287, country: "🇺🇸", birdUsed: "Phoenix Rising" },
          { name: "CloudWalker", score: 234, country: "🇯🇵", birdUsed: "Swift Sparrow" },
          { name: "AeroAce", score: 198, country: "🇬🇧", birdUsed: "Eagle Guardian" },
          { name: "FeatherKing", score: 167, country: "🇩🇪", birdUsed: "Mystic Owl" },
          { name: "WingCommander", score: 145, country: "🇫🇷", birdUsed: "Ice Falcon" },
          { name: "SkyDancer", score: 123, country: "🇨🇦", birdUsed: "Robin Classic" },
          { name: "CloudSurfer", score: 98, country: "🇦🇺", birdUsed: "Swift Sparrow" },
          { name: "BirdBrain", score: 76, country: "🇧🇷", birdUsed: "Eagle Guardian" },
          { name: "FlightPath", score: 54, country: "🇮🇳", birdUsed: "Robin Classic" },
          { name: "AirBorne", score: 32, country: "🇰🇷", birdUsed: "Swift Sparrow" }
        ];

        // Add player scores if they qualify
        const displayedLeaderboard = [...mockLeaderboard];
        let playerNormalRank = -1, playerZenRank = -1;

        if (highScore > 0) {
          const potentialRank = displayedLeaderboard.findIndex(entry => highScore > entry.score);
          if (potentialRank !== -1) {
            displayedLeaderboard.splice(potentialRank, 0, { 
              name: "YOU", 
              score: highScore, 
              country: "🌟", 
              birdUsed: ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex].name,
              isPlayer: true 
            });
          } else if (displayedLeaderboard.length < 10) {
            displayedLeaderboard.push({ 
              name: "YOU", 
              score: highScore, 
              country: "🌟", 
              birdUsed: ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex].name,
              isPlayer: true 
            });
          }
          displayedLeaderboard.sort((a, b) => b.score - a.score);
          if (displayedLeaderboard.length > 10) displayedLeaderboard.length = 10;
          playerNormalRank = displayedLeaderboard.findIndex(e => e.isPlayer) + 1;
        }

        return (
          <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-4
                          transition-opacity duration-300 ease-in-out ${modalOpen === 'leaderboard' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-6 rounded-3xl shadow-2xl w-full max-w-lg text-slate-100 relative border border-slate-700/50 backdrop-blur-md max-h-[90vh] overflow-y-auto
                             transform transition-all duration-300 ease-in-out ${modalOpen === 'leaderboard' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <button 
                onClick={() => { setModalOpen(modalOpen === 'leaderboard' ? 'settings' : null); Sounds.uiClick(); }} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl transition-colors hover:rotate-90 duration-200"
              >
                ×
              </button>
              
              <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text mb-2 text-center tracking-wide">
                Leaderboard
              </h2>
              <p className="text-center text-slate-400 text-sm mb-6">(Global Rankings)</p>
              
              {/* Mode Selector */}
              <div className="flex space-x-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
                <button className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm">
                  🎮 Normal Mode
                </button>
                <button className="flex-1 py-2 px-4 rounded-lg text-slate-400 hover:text-white font-medium text-sm transition-colors">
                  🧘 Zen Mode
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {displayedLeaderboard.map((entry, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02]
                                              ${entry.isPlayer ? 
                                                'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 ring-2 ring-purple-400/50 shadow-purple-500/20' : 
                                                'bg-slate-700/70 hover:bg-slate-600/70'}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                      ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-slate-800' :
                                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                                        'bg-slate-600 text-slate-300'}`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${entry.isPlayer ? 'text-yellow-200' : 'text-slate-200'}`}>
                            {entry.name}
                          </span>
                          <span className="text-lg">{entry.country}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Bird: {entry.birdUsed}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold ${entry.isPlayer ? 'text-yellow-100' : 'text-teal-300'}`}>
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">points</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Player rank info */}
              {playerNormalRank > 0 && (
                <div className="bg-purple-800/30 rounded-xl p-4 mb-4 border border-purple-500/30">
                  <div className="text-center">
                    <div className="text-sm text-purple-300 mb-1">Your Global Rank</div>
                    <div className="text-2xl font-bold text-purple-200">#{playerNormalRank}</div>
                    <div className="text-xs text-slate-400">Normal Mode • {highScore} points</div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <MenuButton 
                  onClick={() => { setModalOpen('settings'); Sounds.uiClick(); }} 
                  variant="secondary" 
                  className="flex-1"
                  icon="⚙️"
                >
                  SETTINGS
                </MenuButton>
                <MenuButton 
                  onClick={() => {
                    showNotification({
                      type: 'info',
                      title: 'Challenge Friends',
                      message: 'Friend challenges coming soon!'
                    });
                  }} 
                  variant="special" 
                  className="flex-1"
                  icon="👥"
                >
                  CHALLENGE
                </MenuButton>
              </div>
            </div>
          </div>
        );
      };

      const renderAdOverlay = (): ReactNode => {
        const [timer, setTimer] = useState(Math.floor(AD_SIMULATION_DURATION / 1000));
        const isInterstitial = adActionType === 'interstitial';
        const adTitle = isInterstitial ? "Advertisement" : "Rewarded Ad";
        let adMessage = "";
        
        if (adActionType === 'continueRun') adMessage = "Watch to continue your epic run!";
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
          <div className={`fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] p-4 text-slate-100 text-center
                          transition-opacity duration-300 ease-in-out ${modalOpen === 'adOverlay' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`transform transition-all duration-300 ease-in-out ${modalOpen === 'adOverlay' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <h2 className="text-3xl font-bold text-teal-300 mb-4 tracking-wide">{adTitle}</h2>
              <p className="mb-4 text-lg text-slate-200">{adMessage}</p>
              
              <div className="w-80 h-60 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm mb-6 shadow-2xl border border-slate-600">
                <div className="text-6xl mb-4 animate-pulse">📺</div>
                <p>(Advertisement Placeholder)</p>
                <p className="text-xs mt-2">Simulated for demo purposes</p>
              </div>
              
              {!isInterstitial && timer > 0 && (
                <div className="mb-6">
                  <p className="mb-2 text-slate-300">Claim reward in:</p>
                  <div className="text-4xl font-bold text-yellow-300 animate-pulse">{timer}s</div>
                </div>
              )}
              
              {!isInterstitial && timer === 0 && (
                <MenuButton 
                  onClick={handleClaim} 
                  variant="special" 
                  icon="🎁"
                  size="lg"
                  className="px-12 py-4"
                >
                  CLAIM REWARD
                </MenuButton>
              )}
              
              {isInterstitial && (
                <p className="text-sm text-slate-400">Ad will close automatically in {timer}s...</p>
              )}
            </div>
          </div>
        );
      };

      const getDebuffDisplayName = (type: DebuffType | null): string => {
        if (!type) return "";
        return ENHANCED_DEBUFF_CONFIG[type]?.description || type.toLowerCase().replace(/_/g, ' ');
      };

      const renderHud = (): ReactNode => {
        const currentModeHighScore = engineHud.isZenMode ? zenHighScore : highScore;
        const modeName = engineHud.isZenMode ? "Zen" : "Normal";
        
        return ( 
          <div className="absolute top-0 left-0 right-0 p-3 text-slate-100 pointer-events-none z-10">
            <div className="flex justify-between items-start">
              {/* Left HUD Elements */}
              <div className="flex flex-col items-start space-y-2">
                <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-700/50 min-w-[140px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-yellow-300">{engineHud.score.toLocaleString()}</span>
                    {engineHud.isZenMode && <span className="text-xs text-sky-300 font-medium">ZEN</span>}
                  </div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <div>Best ({modeName}): <span className="text-green-300 font-medium">{currentModeHighScore.toLocaleString()}</span></div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">🪙</span>
                      <span className="text-yellow-300 font-medium">{totalCoins.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {engineHud.combo >= 2 && !engineHud.isZenMode && (
                  <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-md p-2 px-3 rounded-xl shadow-lg border border-orange-400/50">
                    <div className="text-sm font-bold text-white animate-pulse">
                      🔥 {engineHud.combo}x COMBO
                    </div>
                  </div>
                )}
                
                {isGodModeActive && (
                  <div className="bg-gradient-to-r from-red-600/90 to-pink-600/90 backdrop-blur-md p-1 px-2 rounded-lg shadow-lg border border-red-400/50">
                    <div className="text-xs text-white font-bold animate-pulse">⚡ GOD MODE</div>
                  </div>
                )}
              </div>

              {/* Right HUD Elements & Pause Button */}
              <div className="flex flex-col items-end space-y-2">
                {mode === 'play' && !isGamePaused && (
                  <button
                    onClick={handleRequestPauseFromHud}
                    aria-label="Pause Game"
                    className="pointer-events-auto bg-slate-800/80 hover:bg-slate-700/90 backdrop-blur-md p-3 rounded-full shadow-xl transition-all duration-200 border border-slate-600/50 transform hover:scale-110"
                  >
                    <span className="text-xl">⏸️</span>
                  </button>
                )}
                
                {engineHud.currentPowerup && !engineHud.isZenMode && (
                  <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-700/50 text-right min-w-[100px]">
                    <div className="text-sm font-bold capitalize text-teal-300 flex items-center justify-end">
                      <span className="mr-1">
                        {engineHud.currentPowerup === 'shield' ? '🛡️' : 
                         engineHud.currentPowerup === 'slow' ? '⏱️' : 
                         engineHud.currentPowerup === 'shrink' ? '🔽' : 
                         engineHud.currentPowerup === 'magnet' ? '🧲' : 
                         engineHud.currentPowerup === 'speed' ? '⚡' : '❓'}
                      </span>
                      {engineHud.currentPowerup}
                    </div>
                    <div className={`text-xs ${engineHud.powerupTime < 120 && engineHud.powerupTime > 0 && engineHud.powerupTime % 30 < 15 ? 'text-red-400 animate-pulse font-bold' : 'text-slate-300'}`}>
                      {Math.ceil(engineHud.powerupTime / 60)}s remaining
                    </div>
                  </div>
                )}
                
                {engineHud.activeDebuff && !engineHud.isZenMode && (
                  <div className="bg-red-800/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-red-500/50 text-right min-w-[120px]">
                    <div className="text-sm font-bold text-red-200 animate-pulse">
                      ⚠️ {getDebuffDisplayName(engineHud.activeDebuff.type).split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className="text-xs text-slate-300">
                      {Math.ceil(engineHud.activeDebuff.duration / 60)}s left
                    </div>
                  </div>
                )}
                
                {!engineHud.isZenMode && (
                  <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-700/50 flex items-center w-28 h-6 relative overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-200 ease-out shadow-inner"
                      style={{ width: `${engineHud.powerGauge}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                      PWR {Math.floor(engineHud.powerGauge)}%
                    </div>
                  </div>
                )}
                
                <div className="bg-slate-900/80 backdrop-blur-md p-2 px-3 rounded-xl shadow-xl border border-slate-700/50">
                  <div className="text-xs text-slate-300 text-right space-y-0.5">
                    <div>Speed: <span className="text-purple-300 font-medium">{(engineHud.currentSpeed || 2.5).toFixed(1)}x</span></div>
                    <div>Difficulty: <span className="text-orange-300 font-medium">{engineHud.difficulty.toFixed(1)}</span></div>
                    {engineHud.perfectRun && engineHud.score > 0 && !engineHud.isZenMode && (
                      <div className="text-teal-300 font-bold">✨ Perfect!</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      };

      const mainContentOpacity = modalOpen || (mode === 'play' && isGamePaused) ? 0.3 : 1;
      const mainContentFilter = modalOpen || (mode === 'play' && isGamePaused) ? 'blur(4px)' : 'none';

      return (
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center overflow-hidden font-['Inter',_sans-serif]">
          <div 
            ref={gameAreaRef}
            className="relative transition-all duration-300 ease-in-out origin-center"
            style={{ 
              width: CANVAS_WIDTH, 
              height: CANVAS_HEIGHT, 
              opacity: mainContentOpacity,
              filter: mainContentFilter,
            }}
          >
            {/* Main game content */}
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
                playerSkillLevel={playerStats.skillLevel}
              />
            )}
            
            {mode === 'play' && renderHud()}
            
            {/* Banner ad space (only when not in play mode and ads not removed) */}
            {!hasRemovedAds && mode !== 'play' && !modalOpen && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-12 w-80 bg-slate-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-300 text-sm z-20 shadow-lg border border-slate-600/50">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Advertisement</div>
                  <div className="text-xs">(Banner Ad Placeholder)</div>
                </div>
              </div>
            )}
          </div>
          
          {/* HTML Pause Menu Overlay */}
          {mode === 'play' && isGamePaused && !modalOpen && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-8 rounded-3xl shadow-2xl border border-slate-700/50 backdrop-blur-md text-center">
                <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text mb-8 tracking-wide">
                  PAUSED
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="text-slate-300 text-sm space-y-1">
                    <div>Score: <span className="text-yellow-300 font-bold">{engineHud.score}</span></div>
                    <div>Speed: <span className="text-purple-300 font-bold">{(engineHud.currentSpeed || 2.5).toFixed(1)}x</span></div>
                    {engineHud.combo > 0 && !engineHud.isZenMode && (
                      <div>Combo: <span className="text-orange-300 font-bold">{engineHud.combo}x</span></div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <MenuButton 
                    onClick={handleResumeGame} 
                    variant="special" 
                    icon="▶️"
                    size="lg"
                    className="w-full max-w-xs"
                  >
                    RESUME GAME
                  </MenuButton>
                  
                  <MenuButton 
                    onClick={() => setModalOpen('settings')} 
                    variant="secondary" 
                    icon="⚙️"
                    className="w-full max-w-xs"
                  >
                    SETTINGS
                  </MenuButton>
                  
                  <MenuButton 
                    onClick={handleQuitToMenu} 
                    variant="danger" 
                    icon="🏠"
                    className="w-full max-w-xs"
                  >
                    QUIT TO MENU
                  </MenuButton>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced notification system */}
          <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
            {activeNotifications.map((notification, index) => (
              <NotificationToast
                key={notification.id}
                notification={notification}
                visible={true}
                onDismiss={() => dismissNotification(notification.id)}
              />
            ))}
          </div>

          {/* Performance indicator (only in development or when FPS is low) */}
          {(performanceMetrics.fps < 45 || isGodModeActive) && (
            <PerformanceIndicator metrics={performanceMetrics} />
          )}

          {/* Modal overlays */}
          {renderSettingsModal()}
          {renderLeaderboardScreen()}
          {renderAdOverlay()}
          
          {/* Enhanced styles */}
          <style>{`
            body { 
              font-family: 'Inter', sans-serif; 
              overscroll-behavior: none;
            }
            
            .text-shadow { text-shadow: 1px 1px 2px rgba(0,0,0,0.2); }
            .text-shadow-md { text-shadow: 1px 1px 3px rgba(0,0,0,0.25); } 
            .text-shadow-lg { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } 
            .text-shadow-xl { text-shadow: 2px 2px 5px rgba(0,0,0,0.35); } 
            .text-shadow-pop-light { 
              text-shadow: 0 0 6px rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.3), 0 0 18px rgba(56,189,248,0.3); 
            } 
            .text-shadow-lg-dark { text-shadow: 1px 1px 3px rgba(0,0,0,0.6); } 
            .text-shadow-xl-dark { text-shadow: 2px 2px 5px rgba(0,0,0,0.7); } 
            .text-shadow-sm-dark { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } 
            
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
              height: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(30, 41, 59, 0.3); 
              border-radius: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #6366F1, #8B5CF6); 
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.1);
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #4F46E5, #7C3AED); 
            }

            /* Enhanced range input styling */
            input[type="range"] {
              -webkit-appearance: none;
              appearance: none;
              background: transparent;
              cursor: pointer;
            }
            
            input[type="range"]::-webkit-slider-track {
              height: 8px; 
              background: linear-gradient(90deg, #334155, #475569); 
              border-radius: 4px;
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
            }
            
            input[type="range"]::-moz-range-track {
              height: 8px;
              background: linear-gradient(90deg, #334155, #475569); 
              border-radius: 4px;
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
              border: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              height: 20px; 
              width: 20px;
              background: linear-gradient(135deg, #6366F1, #8B5CF6); 
              border-radius: 50%;
              border: 2px solid #F1F5F9; 
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }
            
            input[type="range"]::-moz-range-thumb {
              height: 20px;
              width: 20px;
              background: linear-gradient(135deg, #6366F1, #8B5CF6); 
              border-radius: 50%;
              border: 2px solid #F1F5F9; 
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }
            
            input[type="range"]:hover::-webkit-slider-thumb {
              transform: scale(1.1);
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            }
            
            input[type="range"]:hover::-moz-range-thumb {
              transform: scale(1.1);
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            }
            
            input[type="range"]:focus::-webkit-slider-thumb {
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3); 
            }
            
            input[type="range"]:focus::-moz-range-thumb {
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
            }
            
            /* Teal variant for SFX volume */
            input[type="range"].accent-teal-500::-webkit-slider-thumb { 
              background: linear-gradient(135deg, #14B8A6, #06B6D4); 
              box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
            } 
            input[type="range"].accent-teal-500::-moz-range-thumb { 
              background: linear-gradient(135deg, #14B8A6, #06B6D4); 
              box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
            }
            input[type="range"].accent-teal-500:hover::-webkit-slider-thumb { 
              box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
            }
            input[type="range"].accent-teal-500:hover::-moz-range-thumb { 
              box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
            }
            input[type="range"].accent-teal-500:focus::-webkit-slider-thumb { 
              box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3); 
            }
            input[type="range"].accent-teal-500:focus::-moz-range-thumb { 
              box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.3); 
            }

            /* Smooth animations */
            * {
              scroll-behavior: smooth;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
              50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
            }
            
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
            
            .animate-glow {
              animation: glow 2s ease-in-out infinite;
            }

            /* Mobile-specific improvements */
            @media (max-width: 768px) {
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              
              input[type="range"]::-webkit-slider-thumb {
                height: 24px;
                width: 24px;
              }
              
              input[type="range"]::-moz-range-thumb {
                height: 24px;
                width: 24px;
              }
            }

            /* Accessibility improvements */
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }

            /* Focus improvements for keyboard navigation */
            button:focus-visible, input:focus-visible {
              outline: 2px solid #6366F1;
              outline-offset: 2px;
            }

            /* Enhanced gradient backgrounds */
            .bg-premium-gradient {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .bg-legendary-gradient {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .bg-epic-gradient {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
          `}</style>
        </div>
      );
    };

    export default App;