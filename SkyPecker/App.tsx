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
import { preloadSounds, Sounds, setMasterBgmVolume, setMasterSfxVolume, manageBackgroundMusic, getAudioContext } from './utils';

// Enhanced interfaces for progressive disclosure and mobile optimization
interface ProgressiveMenuOption {
  id: string;
  component: ReactNode;
  priority: number;
  unlockCondition: () => boolean;
  mobileOptimized?: boolean;
}

interface UserEngagementState {
  isFirstTimeUser: boolean;
  hasCompletedOnboarding: boolean;
  sessionCount: number;
  totalPlayTime: number;
  lastActiveDate: string;
  engagementLevel: 'new' | 'casual' | 'engaged' | 'veteran';
}

interface MonetizationContext {
  adViewCount: number;
  lastAdWatched: number;
  iapPromptCount: number;
  adTolerance: 'high' | 'medium' | 'low';
  preferredAdTypes: string[];
}

// Enhanced props for components with fixed mobile scaling
interface SkyPeckerPreviewCanvasProps { 
  skyPeckerConfig: SkyPeckerTypeConfig; 
  size: number; 
  selectedTrail?: SkyPeckerTrailEffect | null;
  showAnimation?: boolean;
  previewMode?: 'static' | 'animated' | 'flying';
  mobileOptimized?: boolean;
}

interface ViewportDimensions {
  width: number;
  height: number;
  scale: number;
  isMobile: boolean;
  isLandscape: boolean;
}

      
const MOBILE_BANNER_BASE_HEIGHT = 50; // px
const DESKTOP_BANNER_BASE_HEIGHT = 64; // px
const DESKTOP_BANNER_BOTTOM_MARGIN = 24; // px, equivalent to tailwind bottom-6 (1.5rem)

    

const SkyPeckerPreviewCanvas: React.FC<SkyPeckerPreviewCanvasProps> = ({ 
  skyPeckerConfig, 
  size, 
  selectedTrail, 
  showAnimation = false,
  previewMode = 'static',
  mobileOptimized = false
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

      // Enhanced background gradient with mobile optimization
      const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      grad.addColorStop(0.7, "rgba(200, 220, 255, 0.05)");
      grad.addColorStop(1, "rgba(150, 170, 220, 0.1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Trail effect preview (optimized for mobile performance)
      if (selectedTrail && previewMode !== 'static') {
        const trailConfig = selectedTrail.particleConfig;
        let trailColor = trailConfig.color;
        if (trailColor === 'bird_primary') trailColor = skyPeckerConfig.color;
        else if (trailColor === 'bird_stroke') trailColor = skyPeckerConfig.stroke;
        
        ctx.fillStyle = trailColor || skyPeckerConfig.color;
        ctx.globalAlpha = 0.6;
        
        const particleCount = mobileOptimized ? 2 : 4; // Reduce particles on mobile
        for(let i = 0; i < particleCount; i++) {
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
  }, [skyPeckerConfig, size, selectedTrail, showAnimation, previewMode, mobileOptimized]);

  return <canvas ref={canvasRef} className="rounded-full shadow-lg"></canvas>;
};

// Enhanced Trail Display Card with mobile optimization
const TrailDisplayCard: React.FC<{ 
  trailEffect: SkyPeckerTrailEffect, 
  isSelected: boolean,
  isOwned: boolean,
  canAfford: boolean,
  onSelectOrPurchase: () => void,
  mobileOptimized?: boolean;
}> = ({ trailEffect, isSelected, isOwned, canAfford, onSelectOrPurchase, mobileOptimized = false }) => {
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
  const cardHeight = mobileOptimized ? 'h-auto min-h-[200px]' : 'h-full';
  const textSize = mobileOptimized ? 'text-sm' : 'text-base';

  return (
    <div 
      className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between ${cardHeight} backdrop-blur-md border-2 transform hover:scale-[1.02] hover:-translate-y-1
                  ${isSelected && isOwned ? `ring-4 ring-teal-400 bg-gradient-to-br from-purple-700/80 to-indigo-800/80 ${rarityColors[rarity]}` : 
                  `bg-gradient-to-br from-slate-800/70 to-slate-900/70 hover:from-slate-700/80 hover:to-slate-800/80 ${rarityColors[rarity]}`}`}
      onClick={!isSelected && isOwned ? onSelectOrPurchase : undefined} 
      style={{
        cursor: (!isSelected && isOwned) ? 'pointer' : 'default',
        minHeight: mobileOptimized ? '180px' : 'auto'
      }}
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
            <div className={`w-12 h-12 rounded-full mr-3 flex items-center justify-center text-2xl shadow-inner bg-gradient-to-br from-slate-600 to-slate-700 ${mobileOptimized ? 'w-10 h-10 text-xl' : ''}`}
                 style={{background: trailEffect.previewColor || 'linear-gradient(135deg, #64748B, #475569)'}}>
              {getTrailIcon(trailEffect.particleConfig.type)}
            </div>
            {isOwned && (
              <div className={`absolute -bottom-1 -right-1 bg-green-500 rounded-full flex items-center justify-center ${mobileOptimized ? 'w-5 h-5' : 'w-6 h-6'}`}>
                <span className={`text-white font-bold ${mobileOptimized ? 'text-xs' : 'text-xs'}`}>✓</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-slate-100 group-hover:text-white transition-colors ${mobileOptimized ? 'text-base' : 'text-lg'}`}>{trailEffect.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < (rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2) ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              ))}
            </div>
          </div>
        </div>
        
        <p className={`text-slate-300 mb-3 overflow-y-auto custom-scrollbar leading-relaxed ${mobileOptimized ? 'text-xs h-12' : 'text-sm h-16'}`}>{trailEffect.description}</p>
        
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
        className={`w-full py-3 px-4 rounded-xl mt-4 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:transform-none ${buttonClass} ${mobileOptimized ? 'text-sm py-2' : 'text-sm'}`}
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

// Enhanced Menu Button with mobile optimization and accessibility
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
  mobileOptimized?: boolean;
  priority?: number; // For progressive disclosure
}> = ({ 
  onClick, 
  selected, 
  children, 
  className, 
  disabled, 
  variant = 'primary', 
  icon, 
  badge, 
  size = 'md',
  mobileOptimized = false,
  priority = 1
}) => {
  const sizeClasses = {
    sm: mobileOptimized ? 'py-3 px-4 text-sm min-h-[44px]' : 'py-2 px-3 text-sm min-h-[36px]',
    md: mobileOptimized ? 'py-4 px-6 text-base min-h-[48px]' : 'py-3 px-4 text-base min-h-[40px]',
    lg: mobileOptimized ? 'py-5 px-8 text-lg min-h-[52px]' : 'py-4 px-6 text-lg min-h-[44px]'
  };

  let baseClasses = `relative w-full ${sizeClasses[size]} my-1.5 rounded-xl shadow-lg transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center space-x-2 overflow-hidden backdrop-blur-sm`;
  
  // Enhanced mobile touch targets
  if (mobileOptimized) {
    baseClasses += ' touch-manipulation';
  }
  
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
      aria-label={typeof children === 'string' ? children : 'Menu button'}
      data-priority={priority}
    >
      {icon && <span className={`${mobileOptimized ? 'text-lg' : 'text-xl'}`}>{icon}</span>}
      <span className="flex-1">{children}</span>
      {badge && (
        <span className={`absolute bg-red-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
          mobileOptimized ? '-top-2 -right-2 w-7 h-7 text-sm' : '-top-2 -right-2 w-6 h-6 text-xs'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

// Enhanced SkyPecker Display Card with mobile optimization
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
  mobileOptimized?: boolean;
}> = ({ 
  skyPecker, 
  isSelectedForGame, 
  isSelectedInShop, 
  isOwned, 
  cost, 
  canAfford, 
  onSelectOrPurchase, 
  selectedTrail,
  showStats = true,
  mobileOptimized = false
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
  const cardHeight = mobileOptimized ? 'h-auto min-h-[220px]' : 'h-full';
  const previewSize = mobileOptimized ? 50 : 60;

  return (
    <div 
      className={`group relative p-4 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between ${cardHeight} backdrop-blur-md border-2 transform hover:scale-[1.02] hover:-translate-y-1
                  ${isSelectedInShop ? `ring-4 ring-teal-400 bg-gradient-to-br from-purple-700/80 to-indigo-800/80 ${rarityColors[rarity]}` : 
                  `bg-gradient-to-br from-slate-800/70 to-slate-900/70 hover:from-slate-700/80 hover:to-slate-800/80 ${rarityColors[rarity]}`}`}
      onClick={!isSelectedForGame && isOwned ? onSelectOrPurchase : undefined}
      style={{
        cursor: (!isSelectedForGame && isOwned) ? 'pointer' : 'default',
        minHeight: mobileOptimized ? '200px' : 'auto'
      }}
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
              size={previewSize} 
              selectedTrail={selectedTrail}
              showAnimation={true}
              previewMode="animated"
              mobileOptimized={mobileOptimized}
            />
            {isOwned && (
              <div className={`absolute -bottom-1 -right-1 bg-green-500 rounded-full flex items-center justify-center shadow-lg ${mobileOptimized ? 'w-5 h-5' : 'w-6 h-6'}`}>
                <span className={`text-white font-bold ${mobileOptimized ? 'text-xs' : 'text-xs'}`}>✓</span>
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h3 className={`font-bold text-slate-100 group-hover:text-white transition-colors ${mobileOptimized ? 'text-lg' : 'text-xl'}`}>{skyPecker.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({length: 5}).map((_, i) => (
                <div key={i} className={`rounded-full ${mobileOptimized ? 'w-1 h-1' : 'w-1.5 h-1.5'} ${i < (rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2) ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              ))}
            </div>
          </div>
        </div>
        
        <p className={`text-slate-300 mb-3 overflow-y-auto custom-scrollbar leading-relaxed break-words ${mobileOptimized ? 'text-xs h-12' : 'text-sm h-16'}`}>{skyPecker.description}</p>
        
        {showStats && (
          <div className={`grid grid-cols-2 gap-2 mb-3 ${mobileOptimized ? 'text-xs' : 'text-xs'}`}>
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
        <div className={`space-y-1 ${mobileOptimized ? 'text-xs' : 'text-xs'}`}>
          {skyPecker.canNegateDebuffOnce && <div className="flex items-center text-sky-300"><span className="mr-2">🛡️</span>Ignores first debuff</div>}
          {skyPecker.pipePhaseChance && <div className="flex items-center text-indigo-300"><span className="mr-2">👻</span>{(skyPecker.pipePhaseChance*100).toFixed(0)}% phase chance</div>}
          {skyPecker.reviveOnce && <div className="flex items-center text-orange-300"><span className="mr-2">🔥</span>Phoenix revival</div>}
          {skyPecker.freezeEnemiesOnHit && <div className="flex items-center text-cyan-300"><span className="mr-2">❄️</span>Freezes enemies</div>}
        </div>
      </div>
      
      <button 
        onClick={onSelectOrPurchase}
        disabled={buttonDisabled}
        className={`w-full px-4 rounded-xl mt-4 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:transform-none ${buttonClass} ${mobileOptimized ? 'text-sm py-2' : 'text-sm py-3'}`}
      >
        {buttonText}
      </button>
    </div>
  );
};

// Enhanced Notification Toast with mobile optimization
const NotificationToast: React.FC<{
  notification: NotificationData;
  visible: boolean;
  onDismiss: () => void;
  mobileOptimized?: boolean;
}> = ({ notification, visible, onDismiss, mobileOptimized = false }) => {
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

  const containerClass = mobileOptimized 
    ? 'fixed top-4 left-4 right-4 z-50 max-w-none'
    : 'fixed top-6 right-6 max-w-sm z-50';

  const textSize = mobileOptimized ? 'text-sm' : 'text-base';
  const titleSize = mobileOptimized ? 'text-base' : 'text-base';

  return (
    <div className={`${containerClass} transform transition-all duration-300 ease-out ${
      visible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
    }`}>
      <div className={`bg-gradient-to-r ${typeStyles[notification.type]} p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20`}>
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 ${mobileOptimized ? 'text-xl' : 'text-2xl'}`}>
            {notification.icon || icons[notification.type]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold mb-1 ${titleSize}`}>{notification.title}</h4>
            <p className={`opacity-90 leading-relaxed ${textSize}`}>{notification.message}</p>
            {notification.actionButton && (
              <button 
                onClick={notification.onAction}
                className={`mt-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors ${mobileOptimized ? 'text-xs' : 'text-xs'}`}
              >
                {notification.actionButton}
              </button>
            )}
          </div>
          <button 
            onClick={onDismiss}
            className={`hover:bg-white/20 rounded-full flex items-center justify-center transition-colors ${mobileOptimized ? 'text-lg w-6 h-6' : 'text-lg w-6 h-6'}`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Performance Indicator with mobile optimization
const PerformanceIndicator: React.FC<{ 
  metrics: PerformanceMetrics;
  mobileOptimized?: boolean;
}> = ({ metrics, mobileOptimized = false }) => {
  if (mobileOptimized && metrics.fps > 45) return null; // Hide on mobile unless performance is poor

  return (
    <div className={`fixed bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm z-40 ${
      mobileOptimized ? 'bottom-2 left-2 text-xs' : 'bottom-4 left-4 text-xs'
    }`}>
      <div>FPS: {metrics.fps.toFixed(0)}</div>
      <div>Particles: {metrics.particleCount}</div>
      <div className={`font-bold ${metrics.fps < 30 ? 'text-red-400' : metrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
        {metrics.fps < 30 ? 'PERF MODE' : metrics.fps < 50 ? 'MEDIUM' : 'SMOOTH'}
      </div>
    </div>
  );
};

// Enhanced viewport detection utilities
const getViewportDimensions = (): ViewportDimensions => {
  const width = window.innerWidth;
  const height = window.innerHeight; // Actual viewport height
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || width < 768;
  const isLandscape = width > height;

  let scale = 1;

  if (isMobile) {
    // Mobile: Calculate scale to fit the game canvas (CANVAS_WIDTH x CANVAS_HEIGHT)
    // perfectly within the viewport (width x height), maintaining aspect ratio.
    const scaleX = width / CANVAS_WIDTH;
    const scaleY = height / CANVAS_HEIGHT;
    scale = Math.min(scaleX, scaleY); // "Fit" strategy

    // Adjusted clamping: min 0.4 for very small devices/CANVAS_SIZE, max 3.0 allows for upscaling.
    // This depends on your CANVAS_WIDTH/HEIGHT. If they are e.g. 800x600, a scale of 3 might be too large.
    // Fine-tune these clamps based on testing. Initial 0.5 to 2.8 was also reasonable.
    scale = Math.max(0.4, Math.min(scale, 3.0));

  } else {
    // Desktop: Constrain game area within a portion of the screen
    const maxHeight = Math.min(height * 0.88, 950); // Target max height for game area
    const maxWidth = Math.min(width * 0.92, 1300);  // Target max width for game area
    const scaleX = maxWidth / CANVAS_WIDTH;
    const scaleY = maxHeight / CANVAS_HEIGHT;
    scale = Math.min(scaleX, scaleY);
    // Clamp scale for desktop to keep it reasonable
    scale = Math.max(0.35, Math.min(scale, 1.6));
  }

  return { width, height, scale, isMobile, isLandscape };
};

// Utility function to check if user is on mobile
const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth < 768;
};

// Utility function to determine if same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const App: React.FC = () => {
  // Enhanced viewport state for responsive design
  const [viewport, setViewport] = useState<ViewportDimensions>(() => getViewportDimensions());
  
  // Core game state
  const [mode, setMode] = useState<GameMode>('start');
  const [highScore, setHighScore] = useState<number>(0);
  const [zenHighScore, setZenHighScore] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievements>(() => JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)));
  const [selectedSkyPeckerTypeIndex, setSelectedSkyPeckerTypeIndex] = useState<number>(0);
  const [ownedSkyPeckerIndices, setOwnedSkyPeckerIndices] = useState<number[]>([0]);
  const [selectedStartPower, setSelectedStartPower] = useState<PowerUpType | null>(null);

  // Enhanced user engagement tracking
  const [userEngagement, setUserEngagement] = useState<UserEngagementState>({
    isFirstTimeUser: false,
    hasCompletedOnboarding: false,
    sessionCount: 0,
    totalPlayTime: 0,
    lastActiveDate: new Date().toISOString(),
    engagementLevel: 'new'
  });

  // Enhanced monetization context
  const [monetizationContext, setMonetizationContext] = useState<MonetizationContext>({
    adViewCount: 0,
    lastAdWatched: 0,
    iapPromptCount: 0,
    adTolerance: 'high',
    preferredAdTypes: ['rewarded']
  });

  // UI state with mobile optimization
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
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    const initAppAudio = async () => {
      await preloadSounds(); // Preload all SFX
      // You might want to play a short, silent sound here if audio context issues persist
      // or ensure the first actual sound played by user interaction triggers context resume.
      console.log("App audio preloading complete.");
    };
    initAppAudio();

    // Handle AudioContext resume on first user interaction
    // This is a common pattern to deal with browser autoplay restrictions.
    const handleFirstInteraction = () => {
      const ctx = getAudioContext(); // This function now attempts to resume
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          console.log("AudioContext resumed on user interaction.");
          // Optionally play a sound that was queued or a test sound
        }).catch(e => console.error("Error resuming AudioContext:", e));
      }
      // Once interacted, remove listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      setAudioInitialized(true); // Mark audio as ready
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true }); // Also for keyboard interaction

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

  }, []); // Run once on component mount


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

  // Settings state for toggleable elements
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    showPerformanceCounter: false,
    showSpeedDifficulty: true,
    showFPSInGame: false,
    audioTestEnabled: true,
    showDebugInfo: false,
    reducedAnimations: viewport.isMobile,
    highContrastMode: false
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

  // Enhanced responsive design with viewport-based scaling
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [isGamePaused, setIsGamePaused] = useState<boolean>(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    particleCount: 0,
    drawCalls: 0
  });

  // Game continuation state
  const [isContinuingRun, setIsContinuingRun] = useState<boolean>(false);
  const [continuationData, setContinuationData] = useState<{
    score: number;
    coinsThisRun: number;
    difficulty: number;
    gameSpeed: number;
    perfectRun: boolean;
    powerGauge: number;
    enemiesDefeatedThisRun: number;
    powerupsUsedThisRun: number;
    lastMilestoneScoreAwarded: number;
    hasRevived: boolean;
  } | null>(null);
  const [gameSessionId, setGameSessionId] = useState<number>(Date.now());

  // Session tracking for analytics
  const sessionStartTime = useRef<number>(Date.now());
  const lastInteractionTime = useRef<number>(Date.now());

  // Leaderboard mode selection
  const [leaderboardMode, setLeaderboardMode] = useState<'normal' | 'zen'>('normal');

  // Load and save settings
  useEffect(() => {
    const savedSettings = localStorage.getItem(GAME_STORAGE_KEY + '_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setGameSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GAME_STORAGE_KEY + '_settings', JSON.stringify(gameSettings));
  }, [gameSettings]);

  // Enhanced viewport detection and responsive scaling
  useEffect(() => {
    const updateViewport = () => {
      const newViewport = getViewportDimensions();
      setViewport(newViewport);
    };
    
    updateViewport();
    
    const handleResize = () => {
      updateViewport();
    };
    
    const handleOrientationChange = () => {
      // Small delay to ensure proper viewport dimensions after orientation change
      setTimeout(updateViewport, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Enhanced scaling with better mobile support
  useLayoutEffect(() => {
    if (!gameAreaRef.current) return;

    const gameArea = gameAreaRef.current;
    // 'viewport.scale' is calculated by getViewportDimensions to fit CANVAS_WIDTH/HEIGHT
    // into viewport.width/height (for mobile) or constrained desktop dimensions.
    // 'viewport.width' is window.innerWidth, 'viewport.height' is window.innerHeight.
    const { scale, isMobile, width: viewportWidth, height: viewportHeight } = viewport;

    // Set the base unscaled dimensions of the game area
    gameArea.style.width = `${CANVAS_WIDTH}px`;
    gameArea.style.height = `${CANVAS_HEIGHT}px`;
    gameArea.style.position = 'absolute'; // Crucial for left/top positioning

    if (isMobile) {
      // Mobile: Scale to fit viewport, then center.
      // Using `transformOrigin: 'top left'` simplifies centering calculations
      // for a scaled element that should fill/fit the screen.
      gameArea.style.transformOrigin = 'top left';
      gameArea.style.transform = `scale(${scale})`;

      // Calculate offsets to center the scaled gameArea within the full viewport
      const scaledWidth = CANVAS_WIDTH * scale;
      const scaledHeight = CANVAS_HEIGHT * scale;

      const leftOffset = (viewportWidth - scaledWidth) / 2;
      const topOffset = (viewportHeight - scaledHeight) / 2;

      gameArea.style.left = `${leftOffset}px`;
      gameArea.style.top = `${topOffset}px`;
      
      // No need for maxWidth/maxHeight on gameArea here, as it's explicitly sized and scaled.
      // Overflow on the body is prevented by CSS on html, body, #root.

    } else {
      // Desktop: Center the scaled gameArea within the window.
      // The 'scale' for desktop from getViewportDimensions is already constrained.
      gameArea.style.transformOrigin = 'center center';
      gameArea.style.transform = `translate(-50%, -50%) scale(${scale})`;
      gameArea.style.left = '50%';
      gameArea.style.top = '50%';
      
      // No maxWidth/maxHeight needed here either for the same reasons.
    }
  }, [viewport]);

  // Prevent freeze on mobile
  useEffect(() => {
    if (!viewport.isMobile) return;
    
    // Prevent mobile browser freeze issues
    const preventFreeze = () => {
      // Force GPU acceleration on mobile
      const gameArea = gameAreaRef.current;
      if (gameArea) {
        gameArea.style.willChange = 'transform';
        gameArea.style.transform += ' translateZ(0)';
      }
      
      // Prevent viewport changes that cause freezes
      if (document.body.style.height !== '100vh') {
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
      }
    };
    
    preventFreeze();
    
    // Handle orientation changes without freezing
    const handleOrientationChange = () => {
      setTimeout(() => {
        preventFreeze();
        const newViewport = getViewportDimensions();
        setViewport(newViewport);
      }, 150);
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', preventFreeze);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', preventFreeze);
    };
  }, [viewport.isMobile]);

  // handle game freeze
  useEffect(() => {
    const handleGameFreeze = () => {
      // Force viewport recalculation to unfreeze the game
      if (mode === 'play' || mode === 'over') {
        setTimeout(() => {
          const newViewport = getViewportDimensions();
          setViewport(prev => ({ ...prev, ...newViewport }));
        }, 50);
      }
    };

    // Listen for multiple collision events that might cause freeze
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleGameFreeze();
      }
    };

    const handleResize = () => {
      handleGameFreeze();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleGameFreeze);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleGameFreeze);
    };
  }, [mode]);

  // Progressive disclosure logic - determines which menu options to show
  const getAvailableMenuOptions = useCallback((): ProgressiveMenuOption[] => {
    const options: ProgressiveMenuOption[] = [];
    
    // Primary action - always available
    options.push({
      id: 'play',
      priority: 1,
      unlockCondition: () => true,
      mobileOptimized: viewport.isMobile,
      component: (
        <MenuButton 
          onClick={() => { setMainMenuSelection(0); startGame(false); }} 
          selected={mainMenuSelection === 0} 
          variant="primary" 
          icon="🎮"
          size={viewport.isMobile ? "lg" : "lg"}
          mobileOptimized={viewport.isMobile}
          priority={1}
        >
          PLAY GAME
        </MenuButton>
      )
    });
    
    // Zen mode - unlocked after first game
    if (playerStats.totalGamesPlayed >= 1) {
      options.push({
        id: 'zen',
        priority: 2,
        unlockCondition: () => playerStats.totalGamesPlayed >= 1,
        mobileOptimized: viewport.isMobile,
        component: (
          <MenuButton 
            onClick={() => { setMainMenuSelection(1); startGame(true); }} 
            selected={mainMenuSelection === 1} 
            variant="zen" 
            icon="🧘"
            size={viewport.isMobile ? "md" : "md"}
            mobileOptimized={viewport.isMobile}
            priority={2}
          >
            ZEN MODE
          </MenuButton>
        )
      });
    }
    
    // Shop - unlocked after 3 games to avoid overwhelming new users
    if (playerStats.totalGamesPlayed >= 3) {
      options.push({
        id: 'shop',
        priority: 3,
        unlockCondition: () => playerStats.totalGamesPlayed >= 3,
        mobileOptimized: viewport.isMobile,
        component: (
          <MenuButton 
            onClick={() => { setMainMenuSelection(2); setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); setShopTab('skypeckers'); }} 
            selected={mainMenuSelection === 2} 
            variant="secondary" 
            icon="🛍️"
            size={viewport.isMobile ? "md" : "md"}
            mobileOptimized={viewport.isMobile}
            priority={3}
          >
            BIRD SHOP
          </MenuButton>
        )
      });
    }
    
    // Achievements - unlocked after 10 games or first achievement
    const hasAnyAchievement = Object.values(achievements).some(a => a.unlocked);
    if (playerStats.totalGamesPlayed >= 10 || hasAnyAchievement) {
      options.push({
        id: 'achievements',
        priority: 4,
        unlockCondition: () => playerStats.totalGamesPlayed >= 10 || hasAnyAchievement,
        mobileOptimized: viewport.isMobile,
        component: (
          <MenuButton 
            onClick={() => { setMainMenuSelection(4); setMode('achievements'); }} 
            selected={mainMenuSelection === 4} 
            variant="secondary" 
            icon="🏆"
            badge={Object.values(achievements).filter(a => a.unlocked).length > 0 ? Object.values(achievements).filter(a => a.unlocked).length : undefined}
            size={viewport.isMobile ? "sm" : "md"}
            mobileOptimized={viewport.isMobile}
            priority={4}
          >
            ACHIEVEMENTS
          </MenuButton>
        )
      });
    }
    
    return options.sort((a, b) => a.priority - b.priority);
  }, [playerStats.totalGamesPlayed, achievements, mainMenuSelection, selectedSkyPeckerTypeIndex, viewport.isMobile]);

  // First-time user detection and auto-start logic
  useEffect(() => {
    const storedProgressRaw = localStorage.getItem(GAME_STORAGE_KEY);
    const isFirstTime = !storedProgressRaw;
    
    if (isFirstTime) {
      setUserEngagement(prev => ({
        ...prev,
        isFirstTimeUser: true,
        engagementLevel: 'new'
      }));
      
      // Auto-start game after brief brand moment for first-time users
      const autoStartTimer = setTimeout(() => {
        if (mode === 'start') {
          setMode('play');
          setUserEngagement(prev => ({
            ...prev,
            hasCompletedOnboarding: true,
            sessionCount: 1
          }));
          
          // Show helpful notification for first-time users
          showNotification({
            type: 'info',
            title: 'Welcome to SkyPecker!',
            message: 'Tap to flap and avoid obstacles. Have fun!',
            duration: 4000
          });
        }
      }, 1500); // Brief brand moment
      
      return () => clearTimeout(autoStartTimer);
    } else {
      // Returning user
      setUserEngagement(prev => ({
        ...prev,
        isFirstTimeUser: false,
        hasCompletedOnboarding: true,
        sessionCount: prev.sessionCount + 1
      }));
    }
  }, [mode]);

  // Session and engagement tracking
  useEffect(() => {
    const updateEngagementLevel = () => {
      let level: UserEngagementState['engagementLevel'] = 'new';
      
      if (playerStats.totalGamesPlayed >= 50 || playerStats.totalTimePlayed > 3600) { // 1 hour
        level = 'veteran';
      } else if (playerStats.totalGamesPlayed >= 20 || playerStats.totalTimePlayed > 1800) { // 30 minutes
        level = 'engaged';
      } else if (playerStats.totalGamesPlayed >= 5 || playerStats.totalTimePlayed > 600) { // 10 minutes
        level = 'casual';
      }
      
      setUserEngagement(prev => ({ ...prev, engagementLevel: level }));
    };
    
    updateEngagementLevel();
  }, [playerStats.totalGamesPlayed, playerStats.totalTimePlayed]);

  // Enhanced notification system with mobile optimization
  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const fullNotification: NotificationData = { ...notification, id };
    
    // Limit notifications on mobile to avoid overwhelming UI
    const maxNotifications = viewport.isMobile ? 2 : 3;
    setActiveNotifications(prev => [...prev.slice(-maxNotifications + 1), fullNotification]);
    
    const defaultDuration = viewport.isMobile ? 3000 : 3500; // Slightly shorter on mobile
    const duration = notification.duration || (notification.type === 'milestone' ? 2500 : defaultDuration);
    
    const timeoutId = window.setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== id));
      notificationTimeoutRefs.current.delete(id);
    }, duration);
    
    notificationTimeoutRefs.current.set(id, timeoutId);
  }, [viewport.isMobile]);

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
      playerStats: {
        ...playerStats,
        totalTimePlayed: playerStats.totalTimePlayed + (Date.now() - sessionStartTime.current) / 1000
      },
      settings: {
        masterVolume: (bgmVolume + sfxVolume) / 2,
        sfxVolume,
        musicVolume: bgmVolume,
        hapticFeedback: true,
        particleEffects: viewport.isMobile ? 'medium' : 'high', // Optimize for mobile
        performanceMode: performanceMetrics.fps < 45,
        colorblindMode: false,
        reducedMotion: false,
        language: 'en',
        tutorialCompleted: !userEngagement.isFirstTimeUser,
        analyticsEnabled: true
      },
      lastPlayedVersion: 'v2.0.0'
    };
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(progressToStore));
  }, [
    highScore, zenHighScore, totalCoins, achievements, selectedSkyPeckerTypeIndex, 
    ownedSkyPeckerIndices, hasRemovedAds, lastDailyRewardClaimed, dailyChallenge, 
    lastDailyChallengeCompleted, ownedTrailEffectIds, selectedTrailEffectId, 
    playerStats, bgmVolume, sfxVolume, userEngagement.isFirstTimeUser, 
    performanceMetrics.fps, viewport.isMobile
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
        
        // Load audio settings with mobile optimization
        if (storedProgress.settings) {
          setBgmVolumeState(storedProgress.settings.musicVolume || (viewport.isMobile ? 0.2 : 0.3)); // Lower on mobile
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
  }, [bgmVolume, sfxVolume, showNotification, viewport.isMobile]);

  useEffect(() => { 
    saveProgress();
  }, [saveProgress]);

  useEffect(() => { setMasterBgmVolume(bgmVolume); }, [bgmVolume]);
  useEffect(() => { setMasterSfxVolume(sfxVolume); }, [sfxVolume]);

  // Enhanced daily challenge generation with skill-based difficulty
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

      // Adaptive difficulty based on player skill and mobile optimization
      const skillMultiplier = playerStats.skillLevel === 'beginner' ? 0.7 :
                              playerStats.skillLevel === 'intermediate' ? 1.0 :
                              playerStats.skillLevel === 'advanced' ? 1.3 : 1.6;
      
      const mobileMultiplier = viewport.isMobile ? 0.9 : 1.0; // Slightly easier on mobile
      const finalMultiplier = skillMultiplier * mobileMultiplier;

      switch (challengeType) {
        case 'score':
          const scoreTargets = DAILY_CHALLENGE_SCORE_TARGETS.map(t => Math.floor(t * finalMultiplier));
          target = scoreTargets[Math.floor(Math.random() * scoreTargets.length)];
          description = `Score ${target} points in a single Normal Mode run.`;
          difficulty = target < 25 ? 'easy' : target < 75 ? 'medium' : 'hard';
          break;
        case 'coins':
          const coinTargets = DAILY_CHALLENGE_COIN_TARGETS.map(t => Math.floor(t * finalMultiplier));
          target = coinTargets[Math.floor(Math.random() * coinTargets.length)];
          description = `Collect ${target} coins in a single run.`;
          difficulty = target < 15 ? 'easy' : target < 35 ? 'medium' : 'hard';
          break;
        case 'powerups':
          target = Math.max(3, Math.floor(5 * finalMultiplier));
          description = `Use ${target} power-ups in a single run.`;
          difficulty = target < 5 ? 'easy' : target < 8 ? 'medium' : 'hard';
          break;
        case 'enemies':
          target = Math.max(5, Math.floor(10 * finalMultiplier));
          description = `Defeat ${target} enemies in a single run.`;
          difficulty = target < 8 ? 'easy' : target < 15 ? 'medium' : 'hard';
          break;
        default:
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
        completedToday: false,
        description,
        difficulty,
        bonusReward: Math.floor(reward * 0.5),
        challengeDate: todayStr,
      });

      if (lastDailyChallengeCompleted && lastDailyChallengeCompleted !== todayStr) {
        setLastDailyChallengeCompleted(null);
      }
    }
  }, [mode, playerStats.skillLevel, lastDailyChallengeCompleted, dailyChallenge, viewport.isMobile]);

  // Enhanced achievement system with mobile notifications
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
          duration: viewport.isMobile ? 3000 : 3500,
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
  }, [showNotification, ownedSkyPeckerIndices, viewport.isMobile]);

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

  // Enhanced ad management with mobile optimization
  const triggerAd = useCallback((type: 'continueRun' | 'doubleCoins' | 'freeCoins' | 'dailyReward' | 'dailyChallengeReward' | 'interstitial', callback: () => void) => {
    if (hasRemovedAds && type !== 'interstitial') {
      callback();
      return;
    }
    
    // Update monetization context
    setMonetizationContext(prev => ({
      ...prev,
      adViewCount: prev.adViewCount + 1,
      lastAdWatched: Date.now()
    }));
    
    // Ad frequency management with mobile considerations
    if (type === 'interstitial') {
      deathCountThisSession.current++;
      const threshold = viewport.isMobile ? MONETIZATION_CONFIG.AD_FREQUENCY.INTERSTITIAL_DEATH_COUNT + 1 : MONETIZATION_CONFIG.AD_FREQUENCY.INTERSTITIAL_DEATH_COUNT;
      if (deathCountThisSession.current < threshold) {
        callback();
        return;
      }
      deathCountThisSession.current = 0;
    }
    
    setAdActionType(type);
    adRewardCallbackRef.current = callback;
    setModalOpen('adOverlay');
  }, [hasRemovedAds, viewport.isMobile]);

  // Enhanced game start with analytics
  const startGame = useCallback((isZen: boolean = false) => {
    setCurrentPlayedModeIsZen(isZen);
    continueRunCountThisGameSessionRef.current = 0;
    milestoneCountThisRunRef.current = 0;

    // Reset continuation state for a new game
    setIsContinuingRun(false);
    setContinuationData(null);
    setGameSessionId(Date.now());

    setIsGamePaused(false);
    setMode('play');
    Sounds.uiConfirm();

    // Update session tracking
    lastInteractionTime.current = Date.now();
    setPlayerStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + 1
    }));

    // Track engagement for monetization
    setUserEngagement(prev => ({
      ...prev,
      sessionCount: prev.sessionCount + 1,
      lastActiveDate: new Date().toISOString()
    }));
  }, []);

  // Update HUD callback with mobile optimization
  const updateHudCb = useCallback((data: EngineHudData) => {
    setEngineHud(data);
    setPerformanceMetrics(prev => ({
      ...prev,
      fps: data.fps || prev.fps,
      particleCount: data.enemiesOnScreen || prev.particleCount
    }));
    
    // Update interaction time for session tracking
    lastInteractionTime.current = Date.now();
  }, []);

  const toggleGodModeCb = useCallback((isActive: boolean) => setIsGodModeActive(isActive), []);
  const handlePauseStateChange = useCallback((paused: boolean) => setIsGamePaused(paused), []);

  const handleQuitToMenu = useCallback(() => {
    setIsGamePaused(false);
    setPerformanceMetrics({ fps: 60, frameTime: 16.67, particleCount: 0, drawCalls: 0 }); // Reset metrics
    manageBackgroundMusic('', 'stop');
    setMode('start');
    Sounds.uiClick();
  }, []);

  const handleResumeGame = useCallback(() => {
    gameEngineRef.current?.requestResume();
    Sounds.uiClick();
  }, []);
  
  const handleRequestPauseFromHud = useCallback(() => {
    gameEngineRef.current?.requestPause();
    Sounds.uiClick();
  }, []);

// Enhanced game over handler with analytics and mobile optimization
  const handleGameOver = useCallback((
    score: number, 
    coinsCollectedThisRun: number, 
    perfectRun: boolean, 
    gameWasZenMode?: boolean,
    gameStats?: Partial<PlayerStats>
  ) => {
    setIsGamePaused(false);
    
    // Update player statistics with mobile considerations
    setPlayerStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed,
      averageScore: Math.floor((prev.averageScore * (prev.totalGamesPlayed - 1) + score) / prev.totalGamesPlayed),
      bestStreak: Math.max(prev.bestStreak, score),
      totalEnemiesDefeated: prev.totalEnemiesDefeated + (gameStats?.totalEnemiesDefeated || 0),
      lastSkillAssessment: Date.now(),
      totalTimePlayed: prev.totalTimePlayed + (Date.now() - sessionStartTime.current) / 1000
    }));
    
    // Skill assessment for adaptive difficulty
    const skillAssessmentWindow = 10;
    const currentAverage = playerStats.averageScore;
    let newSkillLevel = playerStats.skillLevel;
    
    if (playerStats.totalGamesPlayed >= skillAssessmentWindow) {
      // Adjust thresholds for mobile users
      const beginnerThreshold = viewport.isMobile ? INTELLIGENT_DIFFICULTY_CONFIG.EASY_PLAYER_THRESHOLD * 0.8 : INTELLIGENT_DIFFICULTY_CONFIG.EASY_PLAYER_THRESHOLD;
      const hardThreshold = viewport.isMobile ? INTELLIGENT_DIFFICULTY_CONFIG.HARD_PLAYER_THRESHOLD * 0.8 : INTELLIGENT_DIFFICULTY_CONFIG.HARD_PLAYER_THRESHOLD;
      
      if (currentAverage < beginnerThreshold) {
        newSkillLevel = 'beginner';
      } else if (currentAverage < 50) {
        newSkillLevel = 'intermediate';
      } else if (currentAverage < hardThreshold) {
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
    
    // High score updates with enhanced feedback
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
            break; // <- Added missing break statement
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
    handleAchievementUnlocked, handleAchievementProgress, playerStats, triggerAd, viewport.isMobile
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

  const handleContinueRunRequested = useCallback(() => {
    const currentGameState = gameEngineRef.current?.getGameState();

    if (currentGameState) {
      setContinuationData({
        score: currentGameState.currentScore,
        coinsThisRun: currentGameState.currentCoins,
        difficulty: currentGameState.difficulty,
        gameSpeed: currentGameState.gameSpeed || engineHud.currentSpeed || 2.5,
        perfectRun: currentGameState.perfectRun,
        powerGauge: engineHud.powerGauge,
        enemiesDefeatedThisRun: currentGameState.enemiesDefeated,
        powerupsUsedThisRun: currentGameState.powerupsUsed,
        lastMilestoneScoreAwarded: milestoneCountThisRunRef.current * MILESTONE_COIN_REWARD,
        hasRevived: false,
      });
    } else {
      setContinuationData({
        score: engineHud.score,
        coinsThisRun: coinsCollectedThisRunForGameOverScreenRef.current,
        difficulty: engineHud.difficulty,
        gameSpeed: engineHud.currentSpeed || 2.5,
        perfectRun: engineHud.perfectRun,
        powerGauge: engineHud.powerGauge,
        enemiesDefeatedThisRun: playerStats.totalEnemiesDefeated,
        powerupsUsedThisRun: playerStats.totalPowerupsUsed,
        lastMilestoneScoreAwarded: milestoneCountThisRunRef.current * MILESTONE_COIN_REWARD,
        hasRevived: false,
      });
    }

    setIsGamePaused(false);
    triggerAd('continueRun', () => {
      setIsContinuingRun(true);
      setMode('play');
      continueRunCountThisGameSessionRef.current++;
    });
  }, [engineHud, playerStats, triggerAd]);
      
  const canContinueRun = continueRunCountThisGameSessionRef.current < CONTINUE_RUN_AD_LIMIT && !currentPlayedModeIsZen; 
  const currentSelectedTrailEffect = ENHANCED_TRAIL_EFFECTS.find(t => t.id === selectedTrailEffectId) || ENHANCED_TRAIL_EFFECTS[0];

  // Enhanced Start Screen with Progressive Disclosure and Mobile Optimization
  const renderStartScreen = (): ReactNode => {
      const selectedSkyPecker = ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex];
      const today = new Date();
      const canClaimDailyReward = !lastDailyRewardClaimed || !isSameDay(new Date(lastDailyRewardClaimed), today);
      const availableOptions = getAvailableMenuOptions();

      const contentItems = 1 + (availableOptions.length > 0 ? 1 : 0) +
                          (!userEngagement.isFirstTimeUser && playerStats.totalGamesPlayed > 0 ? 1 : 0) +
                          (!userEngagement.isFirstTimeUser && playerStats.totalGamesPlayed > 2 ? 1 : 0) +
                          (dailyChallenge && playerStats.totalGamesPlayed > 3 ? 1 : 0) +
                          (canClaimDailyReward ? 1 : 0);

      const dynamicSpacing = viewport.isMobile ?
        (contentItems > 4 ? 'space-y-2' : contentItems > 3 ? 'space-y-3' : 'space-y-4') :
        'space-y-4';

      const DESKTOP_BANNER_BASE_HEIGHT = 64;
      const DESKTOP_BANNER_BOTTOM_MARGIN = 24;

      return (
        <div className={`flex flex-col items-center w-full text-slate-100 relative overflow-hidden no-scroll h-full ${
          viewport.isMobile ? 'py-0' : 'py-6' // Mobile has top/bottom padding handled by children for safe areas
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-slate-900/20 pointer-events-none"></div>
          {!viewport.isMobile && (
            <>
              <div className="absolute top-10 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </>
          )}

          <header
            className="text-center relative z-10 flex-shrink-0 px-4 w-full"
            style={ viewport.isMobile ? {
              paddingTop: `calc(0.5rem + env(safe-area-inset-top, 0px))`,
              paddingLeft: `calc(1rem + env(safe-area-inset-left, 0px))`,
              paddingRight: `calc(1rem + env(safe-area-inset-right, 0px))`
            } : {paddingTop: '0.5rem'} }
          >
            <h1 className={`font-black tracking-wider mb-2 bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent animate-pulse ${
              viewport.isMobile ? 'text-3xl' : 'text-5xl'
            }`}>
              SKYPECKER
            </h1>
            <h2 className={`font-bold text-purple-300 tracking-wide ${viewport.isMobile ? 'text-base' : 'text-xl'}`}>POWERUP EDITION</h2>
            <div className={`mt-2 flex justify-center space-x-4 text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
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

          <div
            className={`flex-1 w-full max-w-md relative z-10 overflow-y-auto custom-scrollbar
              ${viewport.isMobile ? 'px-[calc(1rem+var(--safe-area-inset-left))] pr-[calc(1rem+var(--safe-area-inset-right))]' : 'px-4'}
              ${(!hasRemovedAds && mode === 'start' && !modalOpen)
                ? (viewport.isMobile
                    ? 'pb-[calc(50px+var(--safe-area-inset-bottom)+1rem)]'
                    : `pb-[calc(${DESKTOP_BANNER_BASE_HEIGHT}px+${DESKTOP_BANNER_BOTTOM_MARGIN}px+1rem)]`)
                : (viewport.isMobile ? 'pb-[calc(var(--safe-area-inset-bottom)+1rem)]' : 'pb-4')
              }
            `}
          >
            <div className={`flex flex-col items-center ${dynamicSpacing} ${
              viewport.isMobile ? 'pt-4' : 'py-6'
            }`}>

              <div className="w-full space-y-3">
                {availableOptions.map((option) => (
                  <div key={option.id} className="w-full">
                    {option.component}
                  </div>
                ))}
              </div>

              {!userEngagement.isFirstTimeUser && playerStats.totalGamesPlayed > 0 && (
                <div className={`bg-slate-800/50 rounded-2xl p-4 w-full backdrop-blur-md border border-slate-700/50 ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Best Score</div>
                      <div className="font-bold text-green-300">{highScore}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Games</div>
                      <div className="font-bold text-purple-300">{playerStats.totalGamesPlayed}</div>
                    </div>
                    {zenHighScore > 0 && (
                      <div>
                        <div className="text-slate-400 text-xs mb-1">Zen Best</div>
                        <div className="font-bold text-sky-300">{zenHighScore}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Skill</div>
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
              )}

              {!userEngagement.isFirstTimeUser && playerStats.totalGamesPlayed > 2 && (
                <div className={`bg-slate-800/50 rounded-2xl p-4 w-full backdrop-blur-md border border-slate-700/50 ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  <h3 className={`font-semibold mb-3 text-teal-300 text-center ${
                    viewport.isMobile ? 'text-base' : 'text-lg'
                  }`}>Current Setup</h3>

                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <SkyPeckerPreviewCanvas
                        skyPeckerConfig={selectedSkyPecker}
                        size={viewport.isMobile ? 50 : 70}
                        selectedTrail={currentSelectedTrailEffect}
                        showAnimation={true}
                        previewMode="flying"
                        mobileOptimized={viewport.isMobile}
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        ✓
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className={`font-bold text-slate-100 mb-1 ${
                        viewport.isMobile ? 'text-base' : 'text-lg'
                      }`}>{selectedSkyPecker.name}</h4>
                      <p className={`text-purple-300 mb-2 ${
                        viewport.isMobile ? 'text-xs' : 'text-sm'
                      }`}>Trail: {currentSelectedTrailEffect.name}</p>
                      <div className="flex justify-center items-center gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                            i < (selectedSkyPecker.rarityTier === 'legendary' ? 5 :
                                selectedSkyPecker.rarityTier === 'epic' ? 4 :
                                selectedSkyPecker.rarityTier === 'rare' ? 3 : 2) ?
                            'bg-yellow-400' : 'bg-slate-600'
                          }`} />
                        ))}
                      </div>
                    </div>

                    {playerStats.totalGamesPlayed > 5 && (
                      <div className="w-full">
                        <p className={`mb-2 text-center text-slate-200 ${
                          viewport.isMobile ? 'text-xs' : 'text-sm'
                        }`}>Starting Power-Up:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {STARTING_POWERUP_OPTIONS.map(opt => (
                            <button
                              key={opt.name}
                              onClick={() => {setSelectedStartPower(opt.value); Sounds.uiClick();}}
                              className={`py-2 px-2 rounded-xl font-medium transition-all duration-200 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 ${
                                viewport.isMobile ? 'text-xs' : 'text-xs'
                              }
                                            ${selectedStartPower === opt.value ?
                                              'bg-gradient-to-r from-teal-500 to-cyan-500 text-white ring-teal-300 shadow-teal-500/25' :
                                              'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-200 ring-slate-500'}`}
                            >
                              {opt.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {dailyChallenge && playerStats.totalGamesPlayed > 3 && (
                <div className={`bg-gradient-to-br from-purple-800/50 to-indigo-800/50 rounded-2xl shadow-xl backdrop-blur-md border border-purple-500/30 w-full p-4 ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold text-yellow-300 flex items-center ${
                      viewport.isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      <span className="mr-2">🎯</span>
                      Daily Challenge
                    </h4>
                    <div className={`px-2 py-1 rounded-full font-bold uppercase text-xs ${
                      dailyChallenge.difficulty === 'easy' ? 'bg-green-500/30 text-green-300' :
                      dailyChallenge.difficulty === 'hard' ? 'bg-red-500/30 text-red-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {dailyChallenge.difficulty}
                    </div>
                  </div>
                  <p className={`text-slate-200 mb-2 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                    {dailyChallenge.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className={`text-slate-300 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                      Reward: <span className="font-medium text-yellow-300">{dailyChallenge.reward} coins</span>
                      {dailyChallenge.bonusReward && (
                        <span className="text-xs text-purple-300 ml-2">+{dailyChallenge.bonusReward} bonus</span>
                      )}
                    </div>
                    {dailyChallenge.completedToday && (
                      <div className={`flex items-center text-green-400 font-bold ${
                        viewport.isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        <span className="mr-1">✅</span>
                        COMPLETED!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {canClaimDailyReward && (
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
                  mobileOptimized={viewport.isMobile}
                  size={viewport.isMobile ? "md" : "md"}
                  className="w-full"
                >
                  {canClaimDailyReward ? `DAILY REWARD (+${DAILY_REWARD_COINS})` : "REWARD CLAIMED"}
                </MenuButton>
              )}
            </div>
          </div>

          <button
            onClick={() => setModalOpen('settings')}
            className={`absolute z-30 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg ${
              viewport.isMobile ? 'w-12 h-12 text-xl' : 'top-6 right-6 w-14 h-14 text-2xl'
            }`}
            style={ viewport.isMobile ? { top: `calc(1rem + env(safe-area-inset-top, 0px))`, right: `calc(1rem + env(safe-area-inset-right, 0px))` } : {} }
          >
            ⚙️
          </button>

          {!viewport.isMobile && (
            <footer
              className="text-center text-xs text-slate-400 relative z-10 flex-shrink-0 pb-4 px-4"
            >
              <p>Use ARROW KEYS to navigate • ENTER/SPACE to select • ESC to go back</p>
            </footer>
          )}
        </div>
      );
    };

  // Enhanced Game Over Screen with Mobile Optimization and Priority Actions
  const renderGameOverScreen = (): ReactNode => {
    const currentModeHighScore = currentPlayedModeIsZen ? zenHighScore : highScore;
    const modeName = currentPlayedModeIsZen ? "Zen Mode" : "Normal Mode";
    const coinsEarned = coinsCollectedThisRunForGameOverScreenRef.current;
    const isNewRecord = engineHud.score === currentModeHighScore && engineHud.score > 0;
    
    // Priority-based action system for mobile
    const gameOverActions = [];
    
    // Primary action - always first
    gameOverActions.push({
      priority: 1,
      component: (
        <MenuButton 
          onClick={() => { setMode('play'); startGame(currentPlayedModeIsZen); Sounds.uiClick(); }} 
          variant="primary" 
          icon="🔄"
          size={viewport.isMobile ? "lg" : "lg"}
          mobileOptimized={viewport.isMobile}
          className="w-full"
        >
          PLAY AGAIN
        </MenuButton>
      )
    });
    
    // Rewarded actions - high value
    if (canContinueRun) {
      gameOverActions.push({
        priority: 2,
        component: (
          <MenuButton 
            onClick={handleContinueRunRequested} 
            variant="special" 
            icon="▶️"
            size={viewport.isMobile ? "md" : "md"}
            mobileOptimized={viewport.isMobile}
            className="w-full"
          >
            CONTINUE RUN (Watch Ad)
          </MenuButton>
        )
      });
    }
    
    if (coinsEarned > 5) { // Only show if meaningful reward
      gameOverActions.push({
        priority: 2,
        component: (
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
            size={viewport.isMobile ? "md" : "md"}
            mobileOptimized={viewport.isMobile}
            className="w-full"
          >
            DOUBLE COINS ({coinsEarned})
          </MenuButton>
        )
      });
    }

    // ALWAYS ADD Quit to Menu button
    gameOverActions.push({
      priority: 5,
      component: (
        <MenuButton 
          onClick={() => { setMode('start'); Sounds.uiClick(); }} 
          variant="secondary" 
          icon="🏠"
          size={viewport.isMobile ? "md" : "md"}
          mobileOptimized={viewport.isMobile}
          className="w-full"
        >
          QUIT TO MENU
        </MenuButton>
      )
    });
    
    // Shop access - for engaged users
    if (playerStats.totalGamesPlayed > 5) {
      gameOverActions.push({
        priority: 4,
        component: (
          <MenuButton 
            onClick={() => { setMode('shop'); setShopTab('skypeckers'); Sounds.uiClick(); }} 
            variant="secondary" 
            icon="🛍️"
            size={viewport.isMobile ? "sm" : "md"}
            mobileOptimized={viewport.isMobile}
            className="w-full"
          >
            VISIT SHOP
          </MenuButton>
        )
      });
    }

    // Sort actions by priority
    const sortedActions = gameOverActions.sort((a, b) => a.priority - b.priority);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full text-slate-100 p-4 text-center relative overflow-hidden">
        {/* Background effects - Reduced on mobile */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-purple-900/20 to-slate-900/20 pointer-events-none"></div>
        {!viewport.isMobile && (
          <>
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </>
        )}

        <div className="relative z-10 max-w-md w-full">
          <h1 className={`font-black text-transparent bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text mb-4 animate-pulse ${viewport.isMobile ? 'text-4xl' : 'text-6xl'}`}>
            GAME OVER
          </h1>
          
          <div className="mb-6 p-6 bg-slate-800/60 rounded-3xl backdrop-blur-md border border-slate-700/50 shadow-2xl">
            <p className={`text-sky-300 mb-4 ${viewport.isMobile ? 'text-lg' : 'text-xl'}`}>({modeName})</p>
            
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-1">Final Score</div>
              <div className={`font-bold text-yellow-300 ${viewport.isMobile ? 'text-2xl' : 'text-3xl'}`}>{engineHud.score.toLocaleString()}</div>
            </div>

            <div className={`grid gap-4 mb-4 ${viewport.isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="bg-slate-700/50 rounded-2xl p-4">
                <div className="text-sm text-slate-400 mb-1">Best Score</div>
                <div className={`font-bold text-green-300 ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>{currentModeHighScore.toLocaleString()}</div>
              </div>
              {coinsEarned > 0 && (
                <div className="bg-slate-700/50 rounded-2xl p-4">
                  <div className="text-sm text-slate-400 mb-1">Coins Earned</div>
                  <div className={`font-bold text-yellow-400 flex items-center justify-center ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>
                    <span className="mr-2">🪙</span>
                    {coinsEarned}
                  </div>
                </div>
              )}
            </div>

            {/* Special accomplishments */}
            <div className="space-y-2">
              {isNewRecord && (
                <div className={`flex items-center justify-center text-yellow-200 font-bold animate-bounce ${viewport.isMobile ? 'text-lg' : 'text-xl'}`}>
                  <span className="mr-2">🎉</span>
                  NEW HIGH SCORE!
                  <span className="ml-2">🎉</span>
                </div>
              )}
              
              {engineHud.perfectRun && engineHud.score > 0 && !currentPlayedModeIsZen && (
                <div className={`flex items-center justify-center text-teal-300 font-bold ${viewport.isMobile ? 'text-base' : 'text-lg'}`}>
                  <span className="mr-2">✨</span>
                  PERFECT RUN!
                  <span className="ml-2">✨</span>
                </div>
              )}

              {milestoneCountThisRunRef.current > 0 && (
                <div className={`flex items-center justify-center text-purple-300 font-medium ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
                  <span className="mr-2">🎯</span>
                  {milestoneCountThisRunRef.current} Milestones Reached
                </div>
              )}
            </div>
          </div>

          {/* Action buttons with mobile optimization */}
          <div className="space-y-3 mb-6">
            {sortedActions.slice(0, viewport.isMobile ? 4 : 5).map((action, index) => (
              <div key={index}>
                {action.component}
              </div>
            ))}
          </div>

          {/* Secondary actions */}
          {!viewport.isMobile && sortedActions.length > 5 && (
            <div className="flex justify-center space-x-4">
              {sortedActions.slice(5).map((action, index) => (
                <div key={index} className="flex-1">
                  {action.component}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Shop Screen with Mobile Optimization and Scrollable Birds
  const renderShopScreen = (): ReactNode => {
    const DESKTOP_BANNER_BASE_HEIGHT = 64; // px
    const DESKTOP_BANNER_BOTTOM_MARGIN = 24; // px, equivalent to bottom-6 (1.5rem)

    return (
    <div className={`flex flex-col items-center w-full text-slate-100 overflow-hidden h-full ${ // Always h-full
      viewport.isMobile ? 'pt-4' : 'p-4' // Keep top padding for mobile, or all-around for desktop
    } ${
      (!hasRemovedAds && mode === 'shop' && !modalOpen)
        ? (viewport.isMobile
            ? 'pb-[calc(50px+var(--safe-area-inset-bottom)+1rem)]' // banner height + safe area + 1rem buffer
            : `pb-[calc(${DESKTOP_BANNER_BASE_HEIGHT}px+${DESKTOP_BANNER_BOTTOM_MARGIN}px+1rem)]`) // banner height + bottom-6 + 1rem buffer
        : (viewport.isMobile ? 'pb-4' : '') // Default bottom padding if no banner
    }`}>
      {/* Settings button with fixed positioning */}
      <button
        onClick={() => setModalOpen('settings')}
        className={`absolute z-30 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg ${
          viewport.isMobile ? 'w-12 h-12 text-xl' : 'top-6 right-6 w-14 h-14 text-2xl' // desktop uses p-4 from parent, so top-6 works
        }`}
        style={ viewport.isMobile ? { top: `calc(1rem + env(safe-area-inset-top))`, right: `calc(1rem + env(safe-area-inset-right))` } : {top: '1.5rem', right: '1.5rem'} } // 1.5rem is p-6 effectively if parent is p-4
      >
        ⚙️
      </button>

      <h1 className={`font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text my-6 tracking-wide ${viewport.isMobile ? 'text-3xl' : 'text-5xl'}`}>
        BIRD SHOP
      </h1>
      
      <div className="mb-4 flex items-center justify-center space-x-4 flex-wrap">
        <div className={`flex items-center ${viewport.isMobile ? 'text-base' : 'text-lg'}`}>
          <span className={`text-yellow-400 mr-2 ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>🪙</span>
          <span className="font-bold text-yellow-300">{totalCoins.toLocaleString()}</span>
          <span className="text-slate-400 ml-1">coins</span>
        </div>
        
        <button
          onClick={() => {
            showNotification({
              type: 'info',
              title: 'Coin Shop',
              message: 'This would open the coin purchase menu'
            });
          }}
          className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-full text-white font-medium transition-all duration-200 transform hover:scale-105 ${
            viewport.isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm'
          } mt-2 sm:mt-0`}
        >
          + Buy Coins
        </button>
      </div>
      
      <div className="flex space-x-4 mb-6 bg-slate-900/50 p-2 rounded-2xl shadow-md backdrop-blur-sm">
        <button 
          onClick={() => { setShopTab('skypeckers'); setShopSelection(0); Sounds.uiClick(); }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
            viewport.isMobile ? 'text-sm px-4 py-2' : 'text-sm'
          } ${shopTab === 'skypeckers' ? 
            'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' : 
            'text-slate-300 hover:bg-slate-700/70 hover:text-white'}`}
        >
          🐦 Birds ({ENHANCED_SKYPECKER_TYPES.length})
        </button>
        <button 
          onClick={() => { setShopTab('trails'); setShopSelection(0); Sounds.uiClick(); }}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 ${
            viewport.isMobile ? 'text-sm px-4 py-2' : 'text-sm'
          } ${shopTab === 'trails' ? 
            'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' : 
            'text-slate-300 hover:bg-slate-700/70 hover:text-white'}`}
        >
          ✨ Trail Effects ({ENHANCED_TRAIL_EFFECTS.length})
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className={`flex-1 w-full overflow-y-auto custom-scrollbar mobile-scroll ${viewport.isMobile ? 'px-4' : 'px-2'} `}>
        {shopTab === 'skypeckers' && (
          <div className={`gap-4 auto-rows-fr pb-4 grid ${ // Reduced pb from pb-6
            viewport.isMobile 
              ? 'grid-cols-1 sm:grid-cols-2' // Mobile: 1 or 2 cols
              : 'grid-cols-1 md:grid-cols-2' // Desktop: 2 or 3 cols for less cramp
          }`}>
            {ENHANCED_SKYPECKER_TYPES.map((skyPecker, i) => {
              const cost = i === 0 ? 0 : i * 150; // SHOP_PRICING.SKY_PECKER_BASE_COST + (i * SHOP_PRICING.SKY_PECKER_INCREMENTAL_COST)
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
                  showStats={!viewport.isMobile || skyPecker.rarityTier === 'legendary' || skyPecker.rarityTier === 'epic'} // Show stats for higher rarity on mobile, or always on desktop
                  mobileOptimized={viewport.isMobile}
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
                        // TODO: Implement IAP flow
                      });
                    } else if (totalCoins >= cost) {
                      setTotalCoins(prev => prev - cost);
                      setOwnedSkyPeckerIndices(prev => [...prev, i].sort((a,b)=>a-b));
                      setSelectedSkyPeckerTypeIndex(i); // Auto-equip new bird
                      Sounds.uiConfirm();
                      showNotification({
                        type: 'reward',
                        title: 'Bird Unlocked!',
                        message: `${skyPecker.name} is now yours!`
                      });
                      // Achievement check for owning birds
                      handleAchievementProgress('collector', 1);
                      if (ownedSkyPeckerIndices.length + 1 === ENHANCED_SKYPECKER_TYPES.length) {
                        handleAchievementUnlocked('birdCollector', INITIAL_ACHIEVEMENTS.birdCollector.name);
                      }
                    } else {
                      Sounds.uiDeny();
                      showNotification({
                        type: 'warning',
                        title: 'Not Enough Coins',
                        message: `Need ${cost - totalCoins} more coins for ${skyPecker.name}.`
                      });
                    }
                    setShopSelection(i); // Keep selection on the current card
                  }}
                />
              );
            })}
          </div>
        )}

        {shopTab === 'trails' && (
          <div className={`gap-6 auto-rows-fr pb-4 grid ${ // Reduced pb from pb-6
            viewport.isMobile 
              ? 'grid-cols-1 sm:grid-cols-2' // Mobile: 1 or 2 cols
              : 'grid-cols-1 md:grid-cols-2' // Desktop: 2 or 3 cols
           }`}>
            {ENHANCED_TRAIL_EFFECTS.map((trail, i) => {
              const isOwned = ownedTrailEffectIds.includes(trail.id);
              return (
                <TrailDisplayCard
                  key={trail.id}
                  trailEffect={trail}
                  isSelected={selectedTrailEffectId === trail.id}
                  isOwned={isOwned}
                  canAfford={totalCoins >= trail.cost}
                  mobileOptimized={viewport.isMobile}
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
                      setSelectedTrailEffectId(trail.id); // Auto-equip
                      Sounds.uiConfirm();
                      showNotification({
                        type: 'reward',
                        title: 'Trail Effect Unlocked!',
                        message: `${trail.name} is now yours!`
                      });
                      handleAchievementProgress('stylist', 1);
                    } else {
                      Sounds.uiDeny();
                      showNotification({
                        type: 'warning',
                        title: 'Not Enough Coins',
                        message: `Need ${trail.cost - totalCoins} more coins for ${trail.name}.`
                      });
                    }
                    setShopSelection(i);
                  }}
                />
              );
            })}
          </div>
        )}
      </div> {/* End of Scrollable Content Area */}

      <MenuButton 
        onClick={() => { setMode('start'); Sounds.uiClick(); }} 
        variant="secondary" 
        className="mt-auto w-auto max-w-xs px-10 flex-shrink-0" // mt-auto pushes to bottom of flex container
        icon="🏠"
        mobileOptimized={viewport.isMobile}
      >
        BACK TO MENU
      </MenuButton>
      
      <p className={`text-xs text-slate-400 mt-4 text-center flex-shrink-0 ${viewport.isMobile ? 'pb-0' : 'pb-0'}`}> {/* Padding bottom handled by parent for banner */}
        {viewport.isMobile ? 'TAB to switch • TAP to select' : 'ARROW KEYS to navigate • TAB to switch categories • ENTER/SPACE to select'}
      </p>
    </div>
  );
  };

  // Enhanced Achievements Screen with Mobile Optimization
  const renderAchievementsScreen = (): ReactNode => ( 
    <div className={`flex flex-col items-center w-full text-slate-100 overflow-hidden ${
      viewport.isMobile ? 'mobile-container' : 'h-full' // Use h-full for desktop within scaled gameArea
    }`}>
      {/* Fixed header */}
      <div className="flex-shrink-0 w-full text-center p-4">
        {/* Settings button with fixed positioning */}
        <button
          onClick={() => setModalOpen('settings')}
          className={`absolute z-30 bg-slate-800/80 hover:bg-slate-700/80 rounded-full flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm shadow-lg ${
            viewport.isMobile ? 'w-12 h-12 text-xl' : 'top-6 right-6 w-14 h-14 text-2xl'
          }`}
          style={ viewport.isMobile ? { top: `calc(1rem + env(safe-area-inset-top))`, right: `calc(1rem + env(safe-area-inset-right))` } : {} }
        >
          ⚙️
        </button>

        <h1 className={`font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text tracking-wide ${viewport.isMobile ? 'text-3xl mb-4' : 'text-5xl mb-6'}`}>
          ACHIEVEMENTS
        </h1>
        
        <div className="text-center mb-4">
          <div className={`inline-flex items-center space-x-4 bg-slate-800/50 rounded-2xl px-6 py-3 backdrop-blur-sm ${viewport.isMobile ? 'space-x-2 px-4 py-2' : ''}`}>
            <div className="text-center">
              <div className={`font-bold text-green-400 ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>
                {Object.values(achievements).filter(a => a.unlocked).length}
              </div>
              <div className="text-xs text-slate-400">Unlocked</div>
            </div>
            <div className="w-px h-8 bg-slate-600"></div>
            <div className="text-center">
              <div className={`font-bold text-purple-400 ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>
                {Object.values(achievements).length}
              </div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
            <div className="w-px h-8 bg-slate-600"></div>
            <div className="text-center">
              <div className={`font-bold text-yellow-400 ${viewport.isMobile ? 'text-xl' : 'text-2xl'}`}>
                {Object.values(achievements).length > 0 ? Math.round((Object.values(achievements).filter(a => a.unlocked).length / Object.values(achievements).length) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className={`flex-1 w-full overflow-y-auto custom-scrollbar px-4 ${
        (!hasRemovedAds && mode === 'achievements' && !modalOpen)
          ? (viewport.isMobile
              ? 'pb-[calc(50px+var(--safe-area-inset-bottom)+1rem)]'
              : `pb-[calc(${DESKTOP_BANNER_BASE_HEIGHT}px+${DESKTOP_BANNER_BOTTOM_MARGIN}px+1rem)]`)
          : (viewport.isMobile ? 'pb-[calc(var(--safe-area-inset-bottom)+1rem)]' : 'pb-4')
      }`}>
        <div className="w-full max-w-4xl mx-auto">
          {/* Achievement Categories */}
          <div className="grid gap-6">
            {Object.entries(achievements).map(([key, ach]) => (
              <div key={key} 
                  className={`group rounded-2xl shadow-xl transition-all duration-300 border-2 backdrop-blur-sm transform hover:scale-[1.02] ${
                    viewport.isMobile ? 'p-4' : 'p-6'
                  } ${ach.unlocked ? 
                    'bg-gradient-to-br from-green-700/60 to-emerald-800/60 border-green-500/70 shadow-green-500/20' : 
                    'bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/70 opacity-80 hover:opacity-100'}`}>
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${
                    viewport.isMobile ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl'
                  } ${ach.unlocked ? 
                    'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/30' : 
                    'bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/20'}`}>
                    <span className={ach.unlocked ? 'animate-pulse' : ''}>
                      {ach.unlocked ? '🌟' : '🏆'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold ${viewport.isMobile ? 'text-lg' : 'text-xl'} ${ach.unlocked ? 'text-slate-100' : 'text-slate-300'}`}>
                        {ach.name}
                      </h3>
                      {ach.unlocked && ach.dateUnlocked && !viewport.isMobile && (
                        <div className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full">
                          {new Date(ach.dateUnlocked).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <p className={`mb-3 ${viewport.isMobile ? 'text-xs' : 'text-sm'} ${ach.unlocked ? 'text-green-200' : 'text-slate-400'}`}>
                      {ach.desc}
                    </p>
                    
                    {ach.rewardCoins && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400 mr-1">🪙</span>
                        <span className={`text-yellow-300 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                          +{ach.rewardCoins} coins reward
                        </span>
                      </div>
                    )}
                    
                    {ach.target && !ach.unlocked && ach.progress !== undefined && ach.progress < ach.target && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>Progress</span>
                          <span className={`text-teal-300 font-medium ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
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
      </div>

      {/* Fixed bottom button */}
      <div className="flex-shrink-0 w-full p-4">
        <MenuButton 
          onClick={() => { setMode('start'); Sounds.uiClick(); }} 
          variant="secondary" 
          className="w-auto max-w-xs px-10 mx-auto"
          icon="🏠"
          mobileOptimized={viewport.isMobile}
        >
          BACK TO MENU
        </MenuButton>
      </div>
    </div>
  );

  // Enhanced Settings Modal with complete audio panel and display toggles
  const renderSettingsModal = (): ReactNode => (
    <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-4
                    transition-opacity duration-300 ease-in-out ${
                      modalOpen === 'settings' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
      <div className={`bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl text-slate-100 relative border border-slate-700/50 backdrop-blur-md max-h-[85vh] overflow-y-auto custom-scrollbar
                       transform transition-all duration-300 ease-in-out ${
                         modalOpen === 'settings' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                       } ${viewport.isMobile ? 'w-full max-w-sm p-5' : 'w-full max-w-md p-6'}`}>
        <button
          onClick={() => { setModalOpen(null); Sounds.uiClick(); saveProgress(); /* Save settings on close */ }}
          className={`absolute text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-200 ${
            viewport.isMobile ? 'top-4 right-4 text-2xl' : 'top-5 right-5 text-3xl'
          }`}
        >
          ×
        </button>

        <h2 className={`font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text mb-4 md:mb-6 text-center tracking-wide ${
          viewport.isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          Settings
        </h2>

        <div className="space-y-6">
          {/* Enhanced Audio Settings Panel */}
          <div className="bg-slate-700/30 rounded-2xl p-5 space-y-5">
            <h3 className={`font-semibold text-slate-200 mb-3 flex items-center ${
              viewport.isMobile ? 'text-lg' : 'text-xl'
            }`}>
              <span className="mr-3">🔊</span>Audio Settings
            </h3>

            {/* Music Volume */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="bgmVolumeSet" className={`text-slate-300 font-medium flex items-center ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  <span className="mr-2">🎵</span>Music Volume
                </label>
                <span className={`font-bold text-teal-300 bg-slate-800/50 rounded-lg px-3 py-1 ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  {Math.round(bgmVolume*100)}%
                </span>
              </div>
              <input
                type="range"
                id="bgmVolumeSet"
                min="0"
                max="1"
                step="0.01"
                value={bgmVolume} // Strictly bind value to state
                onChange={(e) => {
                  setBgmVolumeState(parseFloat(e.target.value)); // Directly set state
                }}
                className={`w-full rounded-full appearance-none cursor-pointer accent-teal-500 ${
                  viewport.isMobile ? 'h-3' : 'h-3'
                }`}
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="sfxVolumeSet" className={`text-slate-300 font-medium flex items-center ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  <span className="mr-2">🔊</span>Sound Effects
                </label>
                <span className={`font-bold text-cyan-300 bg-slate-800/50 rounded-lg px-3 py-1 ${
                  viewport.isMobile ? 'text-sm' : 'text-base'
                }`}>
                  {Math.round(sfxVolume*100)}%
                </span>
              </div>
              <input
                type="range"
                id="sfxVolumeSet"
                min="0"
                max="1"
                step="0.01"
                value={sfxVolume} // Strictly bind value to state
                onChange={(e) => {
                  setSfxVolumeState(parseFloat(e.target.value)); // Directly set state
                }}
                className={`w-full rounded-full appearance-none cursor-pointer accent-cyan-500 ${
                  viewport.isMobile ? 'h-3' : 'h-3'
                }`}
              />
            </div>

            {/* Audio Test Buttons */}
            {gameSettings.audioTestEnabled && (
              <div className="flex justify-between space-x-3 pt-2">
                <button
                  onClick={() => {
                    if (bgmVolume > 0) {
                      // Sounds.uiClick(); // This was a placeholder for music test
                      // To test BGM, you'd need to manage a short BGM snippet or toggle current BGM
                      // For simplicity, let's just show a notification for now or have App.tsx manage it.
                      if (audioInitialized && getAudioContext() && getAudioContext()?.state === 'running') {
                        // A simple way to test if music is playing is to briefly stop and start
                        // This isn't ideal for a real test button but proves the volume works
                        const currentSceneKey = "default"; // Or get the actual current scene for BGM
                        manageBackgroundMusic(currentSceneKey, 'stop');
                        setTimeout(() => manageBackgroundMusic(currentSceneKey, 'start'), 100);
                         showNotification({
                            type: 'info',
                            title: 'Audio Test',
                            message: `Music at ${Math.round(bgmVolume*100)}%`,
                            duration: 2000
                          });
                      } else {
                         showNotification({
                            type: 'warning',
                            title: 'Audio Test',
                            message: `Music system not ready or volume is 0.`,
                            duration: 2000
                          });
                      }
                    }
                  }}
                  disabled={bgmVolume === 0 || !audioInitialized}
                  className={`flex-1 bg-slate-600/50 hover:bg-slate-500/50 disabled:bg-slate-700/30 disabled:text-slate-500 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                    viewport.isMobile ? 'py-3 text-sm' : 'py-2 text-sm'
                  }`}
                >
                  <span className="mr-2">🎵</span>Test Music
                </button>
                <button
                  onClick={() => {
                    if (sfxVolume > 0 && audioInitialized) {
                      Sounds.coin(); // Play an actual SFX
                      showNotification({
                        type: 'info',
                        title: 'Audio Test',
                        message: `SFX at ${Math.round(sfxVolume*100)}%`,
                        duration: 2000
                      });
                    } else if (!audioInitialized) {
                       showNotification({
                        type: 'warning',
                        title: 'Audio Test',
                        message: `SFX system not ready. Please interact with the game first.`,
                        duration: 3000
                      });
                    }
                  }}
                  disabled={sfxVolume === 0 || !audioInitialized}
                  className={`flex-1 bg-slate-600/50 hover:bg-slate-500/50 disabled:bg-slate-700/30 disabled:text-slate-500 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                    viewport.isMobile ? 'py-3 text-sm' : 'py-2 text-sm'
                  }`}
                >
                  <span className="mr-2">🔊</span>Test SFX
                </button>
              </div>
            )}
          </div>

          {/* ... rest of renderSettingsModal (Game Display Settings, Performance Status, Action Buttons, Player Statistics) ... */}
          {/* Game Display Settings */}
          <div className="bg-slate-700/30 rounded-2xl p-5 space-y-4">
            <h3 className={`font-semibold text-slate-200 mb-3 flex items-center ${ 
              viewport.isMobile ? 'text-lg' : 'text-xl'
            }`}>
              <span className="mr-3">🎮</span>Display Settings
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 text-lg">⚡</span>
                <div>
                  <div className={`text-slate-200 font-medium ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
                    Performance Counter
                  </div>
                  <div className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                    Show FPS and performance info in-game
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setGameSettings(prev => ({
                    ...prev,
                    showPerformanceCounter: !prev.showPerformanceCounter
                  }));
                  Sounds.uiClick();
                }}
                className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  viewport.isMobile ? 'h-7 w-12' : 'h-6 w-11'
                } ${gameSettings.showPerformanceCounter ? 'bg-teal-600' : 'bg-slate-600'}`}
              >
                <span className={`inline-block transform rounded-full bg-white transition-transform ${
                  viewport.isMobile ? 'h-5 w-5' : 'h-4 w-4'
                } ${gameSettings.showPerformanceCounter ? 
                  (viewport.isMobile ? 'translate-x-6' : 'translate-x-6') : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 text-lg">📊</span>
                <div>
                  <div className={`text-slate-200 font-medium ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
                    Speed & Difficulty
                  </div>
                  <div className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                    Show speed and difficulty in-game
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setGameSettings(prev => ({
                    ...prev,
                    showSpeedDifficulty: !prev.showSpeedDifficulty
                  }));
                  Sounds.uiClick();
                }}
                className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  viewport.isMobile ? 'h-7 w-12' : 'h-6 w-11'
                } ${gameSettings.showSpeedDifficulty ? 'bg-teal-600' : 'bg-slate-600'}`}
              >
                <span className={`inline-block transform rounded-full bg-white transition-transform ${viewport.isMobile ? 'h-5 w-5' : 'h-4 w-4'} ${
                  gameSettings.showSpeedDifficulty ? (viewport.isMobile ? 'translate-x-6' : 'translate-x-6') : 'translate-x-1'
                }`} />
              </button>
            </div>

            {viewport.isMobile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-3 text-lg">🎭</span>
                  <div>
                    <div className={`text-slate-200 font-medium ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
                      Reduced Animations
                    </div>
                    <div className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                      Improve performance on mobile
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setGameSettings(prev => ({
                      ...prev,
                      reducedAnimations: !prev.reducedAnimations
                    }));
                    Sounds.uiClick();
                  }}
                  className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                     'h-7 w-12'
                  } ${gameSettings.reducedAnimations ? 'bg-teal-600' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block transform rounded-full bg-white transition-transform h-5 w-5 ${
                    gameSettings.reducedAnimations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-700/30 rounded-2xl p-5">
            <h3 className={`font-semibold text-slate-200 mb-4 flex items-center ${
              viewport.isMobile ? 'text-lg' : 'text-xl'
            }`}>
              <span className="mr-3">⚡</span>Performance
            </h3>
            <div className="flex items-center justify-between">
              <span className={`text-slate-300 font-medium ${
                viewport.isMobile ? 'text-sm' : 'text-base'
              }`}>
                Current FPS: 
              </span>
              <div className="flex items-center space-x-3">
                <span className={`font-bold ${
                  performanceMetrics.fps >= 50 ? 'text-green-400' : 
                  performanceMetrics.fps >= 30 ? 'text-yellow-400' : 'text-red-400'
                } ${viewport.isMobile ? 'text-lg' : 'text-xl'}`}>
                  {performanceMetrics.fps.toFixed(0)}
                </span>
                <span className={`px-3 py-1 rounded-full font-bold ${
                  viewport.isMobile ? 'text-xs' : 'text-sm'
                } ${
                  performanceMetrics.fps >= 50 ? 'bg-green-900/50 text-green-300' : 
                  performanceMetrics.fps >= 30 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'
                }`}>
                  {performanceMetrics.fps >= 50 ? 'SMOOTH' : 
                   performanceMetrics.fps >= 30 ? 'MEDIUM' : 'NEEDS BOOST'}
                </span>
              </div>
            </div>
          </div>

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
              size={viewport.isMobile ? "lg" : "md"}
              mobileOptimized={viewport.isMobile}
            >
              GET {REWARDED_AD_FREE_COINS_AMOUNT} FREE COINS
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
              size={viewport.isMobile ? "md" : "md"}
              mobileOptimized={viewport.isMobile}
            >
              {hasRemovedAds ? "ADS REMOVED" : `REMOVE ADS - $${SHOP_PRICING.REMOVE_ADS}`}
            </MenuButton>
            
            <MenuButton 
              onClick={() => { setModalOpen('leaderboard'); Sounds.uiClick(); }} 
              variant="secondary" 
              icon="🏆"
              className="w-full"
              size={viewport.isMobile ? "md" : "md"}
              mobileOptimized={viewport.isMobile}
            >
              VIEW LEADERBOARD
            </MenuButton>
          </div>

          <div className="bg-slate-700/30 rounded-2xl p-5">
            <h3 className={`font-semibold text-slate-200 mb-4 flex items-center ${
              viewport.isMobile ? 'text-lg' : 'text-xl'
            }`}>
              <span className="mr-3">📊</span>Your Stats
            </h3>
            <div className={`gap-4 ${
              viewport.isMobile ? 'grid grid-cols-2 text-sm' : 'grid grid-cols-2 text-base'
            }`}>
              <div className="text-center">
                <div className={`font-bold text-green-400 ${
                  viewport.isMobile ? 'text-xl' : 'text-2xl'
                }`}>{playerStats.totalGamesPlayed}</div>
                <div className="text-slate-400 text-xs">Games Played</div>
              </div>
              <div className="text-center">
                <div className={`font-bold text-purple-400 ${
                  viewport.isMobile ? 'text-xl' : 'text-2xl'
                }`}>{playerStats.averageScore}</div>
                <div className="text-slate-400 text-xs">Avg. Score</div>
              </div>
              <div className="text-center">
                <div className={`font-bold text-yellow-400 ${
                  viewport.isMobile ? 'text-xl' : 'text-2xl'
                }`}>{playerStats.totalCoinsCollected.toLocaleString()}</div>
                <div className="text-slate-400 text-xs">Total Coins</div>
              </div>
              <div className="text-center">
                <div className={`font-bold capitalize ${
                  viewport.isMobile ? 'text-xl' : 'text-2xl'
                } ${
                  playerStats.skillLevel === 'expert' ? 'text-red-400' :
                  playerStats.skillLevel === 'advanced' ? 'text-orange-400' :
                  playerStats.skillLevel === 'intermediate' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {playerStats.skillLevel}
                </div>
                <div className="text-slate-400 text-xs">Skill Level</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // Enhanced Leaderboard Screen with Zen/Normal Mode Toggle
  const renderLeaderboardScreen = (): ReactNode => {
    // Mock leaderboard data with enhanced entries for both modes
    const mockNormalLeaderboard = [
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

    const mockZenLeaderboard = [
      { name: "ZenMaster", score: 512, country: "🇯🇵", birdUsed: "Phoenix Rising" },
      { name: "FlowState", score: 445, country: "🇺🇸", birdUsed: "Mystic Owl" },
      { name: "InnerPeace", score: 389, country: "🇮🇳", birdUsed: "Swift Sparrow" },
      { name: "Mindful", score: 334, country: "🇨🇦", birdUsed: "Eagle Guardian" },
      { name: "Serene", score: 298, country: "🇬🇧", birdUsed: "Ice Falcon" },
      { name: "Balance", score: 256, country: "🇦🇺", birdUsed: "Robin Classic" },
      { name: "Harmony", score: 223, country: "🇫🇷", birdUsed: "Swift Sparrow" },
      { name: "Tranquil", score: 189, country: "🇩🇪", birdUsed: "Eagle Guardian" },
      { name: "Peaceful", score: 156, country: "🇧🇷", birdUsed: "Robin Classic" },
      { name: "Calm", score: 124, country: "🇰🇷", birdUsed: "Swift Sparrow" }
    ];

    const currentLeaderboard = leaderboardMode === 'zen' ? mockZenLeaderboard : mockNormalLeaderboard;
    const playerScore = leaderboardMode === 'zen' ? zenHighScore : highScore;

    // Add player scores if they qualify
    const displayedLeaderboard = [...currentLeaderboard];
    let playerRank = -1;

    if (playerScore > 0) {
      const potentialRank = displayedLeaderboard.findIndex(entry => playerScore > entry.score);
      if (potentialRank !== -1) {
        displayedLeaderboard.splice(potentialRank, 0, { 
          name: "YOU", 
          score: playerScore, 
          country: "🌟", 
          birdUsed: ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex].name,
          isPlayer: true 
        });
      } else if (displayedLeaderboard.length < 10) {
        displayedLeaderboard.push({ 
          name: "YOU", 
          score: playerScore, 
          country: "🌟", 
          birdUsed: ENHANCED_SKYPECKER_TYPES[selectedSkyPeckerTypeIndex].name,
          isPlayer: true 
        });
      }
      displayedLeaderboard.sort((a, b) => b.score - a.score);
      if (displayedLeaderboard.length > 10) displayedLeaderboard.length = 10;
      playerRank = displayedLeaderboard.findIndex(e => e.isPlayer) + 1;
    }

    return (
      <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50 p-4
                      transition-opacity duration-300 ease-in-out ${modalOpen === 'leaderboard' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl text-slate-100 relative border border-slate-700/50 backdrop-blur-md max-h-[90vh] overflow-y-auto
                         transform transition-all duration-300 ease-in-out ${modalOpen === 'leaderboard' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${
                         viewport.isMobile ? 'w-full max-w-sm p-6' : 'w-full max-w-lg p-8'
                       }`}>
          <button 
            onClick={() => { setModalOpen(modalOpen === 'leaderboard' ? 'settings' : null); Sounds.uiClick(); }} 
            className={`absolute text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-200 ${
              viewport.isMobile ? 'top-4 right-4 text-3xl' : 'top-6 right-6 text-4xl'
            }`}
          >
            ×
          </button>
          
          <h2 className={`font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text mb-2 text-center tracking-wide ${
            viewport.isMobile ? 'text-3xl' : 'text-4xl'
          }`}>
            Leaderboard
          </h2>
          <p className={`text-center text-slate-400 mb-6 ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>(Global Rankings)</p>
          
          {/* Mode Selector */}
          <div className="flex space-x-2 mb-6 bg-slate-800/50 p-2 rounded-xl">
            <button 
              onClick={() => { setLeaderboardMode('normal'); Sounds.uiClick(); }}
              className={`flex-1 rounded-lg font-medium transition-all duration-200 ${
                viewport.isMobile ? 'py-3 px-3 text-sm' : 'py-3 px-4 text-base'
              } ${leaderboardMode === 'normal' ? 
                'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 
                'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              🎮 Normal Mode
            </button>
            <button 
              onClick={() => { setLeaderboardMode('zen'); Sounds.uiClick(); }}
              className={`flex-1 rounded-lg font-medium transition-all duration-200 ${
                viewport.isMobile ? 'py-3 px-3 text-sm' : 'py-3 px-4 text-base'
              } ${leaderboardMode === 'zen' ? 
                'bg-gradient-to-r from-sky-600 to-cyan-600 text-white' : 
                'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              🧘 Zen Mode
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {displayedLeaderboard.map((entry, index) => (
              <div key={index} className={`flex items-center justify-between rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] ${
                viewport.isMobile ? 'p-4' : 'p-5'
              } ${entry.isPlayer ? 
                'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 ring-2 ring-purple-400/50 shadow-purple-500/20' : 
                'bg-slate-700/70 hover:bg-slate-600/70'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`rounded-full flex items-center justify-center font-bold ${
                    viewport.isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
                  } ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-slate-800' :
                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                    'bg-slate-600 text-slate-300'}`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${viewport.isMobile ? 'text-base' : 'text-lg'} ${entry.isPlayer ? 'text-yellow-200' : 'text-slate-200'}`}>
                        {entry.name}
                      </span>
                      <span className={viewport.isMobile ? 'text-lg' : 'text-xl'}>{entry.country}</span>
                    </div>
                    <div className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                      Bird: {entry.birdUsed}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${viewport.isMobile ? 'text-xl' : 'text-2xl'} ${entry.isPlayer ? 'text-yellow-100' : 'text-teal-300'}`}>
                    {entry.score.toLocaleString()}
                  </div>
                  <div className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>points</div>
                </div>
              </div>
            ))}
          </div>

          {/* Player rank info */}
          {playerRank > 0 && (
            <div className={`rounded-xl p-4 mb-4 border ${
              leaderboardMode === 'zen' ? 
                'bg-sky-800/30 border-sky-500/30' : 
                'bg-purple-800/30 border-purple-500/30'
            }`}>
              <div className="text-center">
                <div className={`mb-1 ${viewport.isMobile ? 'text-sm' : 'text-base'} ${
                  leaderboardMode === 'zen' ? 'text-sky-300' : 'text-purple-300'
                }`}>Your Global Rank</div>
                <div className={`font-bold ${viewport.isMobile ? 'text-2xl' : 'text-3xl'} ${
                  leaderboardMode === 'zen' ? 'text-sky-200' : 'text-purple-200'
                }`}>#{playerRank}</div>
                <div className={`text-slate-400 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                  {leaderboardMode === 'zen' ? 'Zen Mode' : 'Normal Mode'} • {playerScore} points
                </div>
              </div>
            </div>
          )}

          <div className={`flex space-x-3 ${viewport.isMobile ? 'flex-col space-y-3 space-x-0' : ''}`}>
            <MenuButton 
              onClick={() => { setModalOpen('settings'); Sounds.uiClick(); }} 
              variant="secondary" 
              className="flex-1"
              icon="⚙️"
              size={viewport.isMobile ? "md" : "md"}
              mobileOptimized={viewport.isMobile}
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
              size={viewport.isMobile ? "md" : "md"}
              mobileOptimized={viewport.isMobile}
            >
              CHALLENGE
            </MenuButton>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Ad Overlay with Mobile Optimization
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
          <h2 className={`font-bold text-teal-300 mb-4 tracking-wide ${viewport.isMobile ? 'text-2xl' : 'text-3xl'}`}>{adTitle}</h2>
          <p className={`mb-4 text-slate-200 ${viewport.isMobile ? 'text-base' : 'text-lg'}`}>{adMessage}</p>
          
          <div className={`bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm mb-6 shadow-2xl border border-slate-600 ${
            viewport.isMobile ? 'w-80 h-56' : 'w-96 h-72'
          }`}>
            <div className={`mb-4 animate-pulse ${viewport.isMobile ? 'text-5xl' : 'text-7xl'}`}>📺</div>
            <p className={viewport.isMobile ? 'text-base' : 'text-lg'}>Advertisement Placeholder</p>
            <p className={`mt-2 ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>Simulated for demo purposes</p>
          </div>
          
          {!isInterstitial && timer > 0 && (
            <div className="mb-6">
              <p className={`mb-2 text-slate-300 ${viewport.isMobile ? 'text-base' : 'text-lg'}`}>Claim reward in:</p>
              <div className={`font-bold text-yellow-300 animate-pulse ${viewport.isMobile ? 'text-4xl' : 'text-5xl'}`}>{timer}s</div>
            </div>
          )}
          
          {!isInterstitial && timer === 0 && (
            <MenuButton 
              onClick={handleClaim} 
              variant="special" 
              icon="🎁"
              size={viewport.isMobile ? "lg" : "lg"}
              className="px-12 py-4"
              mobileOptimized={viewport.isMobile}
            >
              CLAIM REWARD
            </MenuButton>
          )}
          
          {isInterstitial && (
            <p className={`text-slate-400 ${viewport.isMobile ? 'text-base' : 'text-lg'}`}>Ad will close automatically in {timer}s...</p>
          )}
        </div>
      </div>
    );
  };

  // Helper function for debuff display
  const getDebuffDisplayName = (type: DebuffType | null): string => {
    if (!type) return "";
    return ENHANCED_DEBUFF_CONFIG[type]?.description || type.toLowerCase().replace(/_/g, ' ');
  };

  // Enhanced HUD with Mobile Optimization and Fixed Positioning
  const renderHud = (): ReactNode => {
    const currentModeHighScore = engineHud.isZenMode ? zenHighScore : highScore;
    const modeName = engineHud.isZenMode ? "Zen" : "Normal";
    
    return ( 
      <div className="absolute inset-0 text-slate-100 pointer-events-none z-10" style={{ 
        paddingTop: `calc(${viewport.isMobile ? '8px' : '12px'} + env(safe-area-inset-top, 0px))`,
        paddingLeft: `calc(${viewport.isMobile ? '8px' : '12px'} + env(safe-area-inset-left, 0px))`,
        paddingRight: `calc(${viewport.isMobile ? '8px' : '12px'} + env(safe-area-inset-right, 0px))`,
        paddingBottom: `calc(${viewport.isMobile ? '8px' : '12px'} + env(safe-area-inset-bottom, 0px))`
      }}>
        <div className="flex justify-between items-start h-full">
          {/* Left HUD Elements - Positioned with padding from overall container */}
          <div className="flex flex-col items-start space-y-2 flex-shrink-0">
            {/* Score and Coins Display */}
            <div className={`bg-slate-900/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 ${
              viewport.isMobile ? 'p-2 min-w-[110px]' : 'p-3 min-w-[140px]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-yellow-300 ${viewport.isMobile ? 'text-sm' : 'text-lg'}`}>
                  {engineHud.score.toLocaleString()}
                </span>
                {engineHud.isZenMode && <span className={`text-sky-300 font-medium ${
                  viewport.isMobile ? 'text-xs' : 'text-xs'
                }`}>ZEN</span>}
              </div> {/* Score value */}
              <div className={`text-slate-300 space-y-0.5 ${viewport.isMobile ? 'text-xs' : 'text-xs'}`}>
                <div>Best: <span className="text-green-300 font-medium">{currentModeHighScore.toLocaleString()}</span></div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">🪙</span>
                  <span className="text-yellow-300 font-medium">{totalCoins.toLocaleString()}</span>
                </div>
              </div>
            </div> {/* End Score/Coins */}
            
            {/* Performance Counter - Only show if enabled in settings and in-game */}
            {gameSettings.showPerformanceCounter && (performanceMetrics.fps < 50 || isGodModeActive) && (
              <div className={`bg-black/80 backdrop-blur-md rounded-lg shadow-xl border border-slate-600/50 ${
                viewport.isMobile ? 'p-1.5 px-2' : 'p-2 px-3'
              }`}>
                <div className={`text-white space-y-0.5 ${viewport.isMobile ? 'text-xs' : 'text-xs'}`}>
                  <div>FPS: {performanceMetrics.fps.toFixed(0)}</div>
                  <div className={`font-bold ${
                    performanceMetrics.fps < 30 ? 'text-red-400' : 
                    performanceMetrics.fps < 50 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {performanceMetrics.fps < 30 ? 'LOW' : performanceMetrics.fps < 50 ? 'MED' : 'SMOOTH'}
                  </div>
                </div>
              </div>
            )}
            
            {/* Speed/Difficulty - Only show if enabled */}
            {gameSettings.showSpeedDifficulty && (
              <div className={`bg-slate-900/90 backdrop-blur-md rounded-lg shadow-xl border border-slate-700/50 ${
                viewport.isMobile ? 'p-1.5 px-2' : 'p-2 px-3'
              }`}>
                <div className={`text-slate-300 space-y-0.5 ${viewport.isMobile ? 'text-xs' : 'text-xs'}`}>
                  <div>Speed: <span className="text-purple-300 font-medium">{(engineHud.currentSpeed || 2.5).toFixed(1)}x</span></div>
                  {!viewport.isMobile && <div>Diff: <span className="text-orange-300 font-medium">{engineHud.difficulty.toFixed(1)}</span></div>}
                  {engineHud.perfectRun && engineHud.score > 0 && !engineHud.isZenMode && (
                    <div className="text-teal-300 font-bold">✨ Perfect!</div>
                  )}
                </div>
              </div>
            )}
            
            {engineHud.combo >= 2 && !engineHud.isZenMode && (
              <div className={`bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-md rounded-lg shadow-lg border border-orange-400/50 ${
                viewport.isMobile ? 'p-1.5 px-2' : 'p-2 px-3'
              }`}>
                <div className={`font-bold text-white animate-pulse ${viewport.isMobile ? 'text-xs' : 'text-sm'}`}>
                  🔥 {engineHud.combo}x
                </div>
              </div>
            )}
            
            {isGodModeActive && (
              <div className={`bg-gradient-to-r from-red-600/90 to-pink-600/90 backdrop-blur-md rounded-lg shadow-lg border border-red-400/50 ${
                viewport.isMobile ? 'p-1.5 px-2' : 'p-2 px-3'
              }`}>
                <div className={`text-white font-bold animate-pulse ${viewport.isMobile ? 'text-xs' : 'text-xs'}`}>⚡ GOD</div>
              </div>
            )}
          </div>
          
        {/* Right HUD Elements & Pause Button - Positioned with padding from overall container */}
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            {mode === 'play' && !isGamePaused && (
              <button
                onClick={handleRequestPauseFromHud}
                aria-label="Pause Game"
                className={`pointer-events-auto bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-md rounded-full shadow-xl transition-all duration-200 border border-slate-600/50 active:scale-95 ${
                  viewport.isMobile ? 'p-2 w-10 h-10 text-lg' : 'p-3 w-12 h-12 text-xl'
                }`}
              >
                ⏸️
              </button>
            )}
            
            {/* Enhanced mobile powerup display with better text handling */}
            {engineHud.currentPowerup && !engineHud.isZenMode && (
              <div className={`bg-slate-900/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 text-right ${
                viewport.isMobile ? 'p-2 max-w-[140px]' : 'p-3 max-w-[160px]'
              }`}>
                <div className={`font-bold capitalize text-teal-300 flex items-center justify-end ${
                  viewport.isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span className="mr-1 flex-shrink-0">
                    {engineHud.currentPowerup === 'shield' ? '🛡️' : 
                     engineHud.currentPowerup === 'slow' ? '⏱️' : 
                     engineHud.currentPowerup === 'shrink' ? '🔽' : 
                     engineHud.currentPowerup === 'magnet' ? '🧲' : 
                     engineHud.currentPowerup === 'speed' ? '⚡' : '❓'}
                  </span>
                  <span className="truncate min-w-0">
                    {viewport.isMobile ? 
                      (engineHud.currentPowerup.length > 6 ? engineHud.currentPowerup.slice(0, 6) + '.' : engineHud.currentPowerup) : 
                      engineHud.currentPowerup
                    }
                  </span>
                </div>
                <div className={`${
                  engineHud.powerupTime < 120 && engineHud.powerupTime > 0 && engineHud.powerupTime % 30 < 15 ? 
                  'text-red-400 animate-pulse font-bold' : 'text-slate-300'
                } ${viewport.isMobile ? 'text-xs' : 'text-xs'}`}>
                  {Math.ceil(engineHud.powerupTime / 60)}s
                </div>
              </div>
            )}
            
            {/* Enhanced mobile debuff display */}
            {engineHud.activeDebuff && !engineHud.isZenMode && (
              <div className={`bg-red-800/90 backdrop-blur-md rounded-xl shadow-xl border border-red-500/50 text-right ${
                viewport.isMobile ? 'p-2 max-w-[140px]' : 'p-3 max-w-[160px]'
              }`}>
                <div className={`font-bold text-red-200 animate-pulse flex items-center justify-end ${
                  viewport.isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span className="mr-1 flex-shrink-0">⚠️</span>
                  <span className="truncate min-w-0">
                    {viewport.isMobile ? 
                      (() => {
                        const debuffName = getDebuffDisplayName(engineHud.activeDebuff.type);
                        return debuffName.length > 8 ? debuffName.slice(0, 8) + '.' : debuffName;
                      })() :
                      getDebuffDisplayName(engineHud.activeDebuff.type).split(' ').slice(0, 2).join(' ')
                    }
                  </span>
                </div>
                <div className={`text-slate-300 ${viewport.isMobile ? 'text-xs' : 'text-xs'}`}>
                  {Math.ceil(engineHud.activeDebuff.duration / 60)}s
                </div>
              </div>
            )}
            
            {!engineHud.isZenMode && (
              <div className={`bg-slate-900/90 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 flex items-center relative overflow-hidden ${
                viewport.isMobile ? 'w-18 h-4' : 'w-24 h-5' // w-18 might be too small, maybe w-20 (80px)
              }`}>
                <div
                  className="h-full rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-200 ease-out shadow-inner"
                  style={{ width: `${engineHud.powerGauge}%` }}
                />
                <div className={`absolute inset-0 flex items-center justify-center font-bold text-white mix-blend-difference ${
                  viewport.isMobile ? 'text-xs' : 'text-xs'
                }`}>
                  {viewport.isMobile ? `${Math.floor(engineHud.powerGauge)}%` : `PWR ${Math.floor(engineHud.powerGauge)}%`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (modalOpen === 'adOverlay' || modalOpen === null)) {
        // Force viewport recalculation after ad/modal
        setTimeout(() => {
          const newViewport = getViewportDimensions();
          setViewport(newViewport);
        }, 100);
      }
    };

    const handlePageShow = () => {
      // Handle back/forward navigation and ad returns
      setTimeout(() => {
        const newViewport = getViewportDimensions();
        setViewport(newViewport);
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handlePageShow);
    };
  }, [modalOpen]);

  // Enhanced keyboard navigation with mobile support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip keyboard handling on mobile or when modals are open
      if (viewport.isMobile || modalOpen || (isGamePaused && mode === 'play')) return;

      if (mode === 'start') {
        const availableOptions = getAvailableMenuOptions();
        const menuItemsCount = availableOptions.length;
        
        if (e.key === 'ArrowUp') {
          setMainMenuSelection(prev => (prev - 1 + menuItemsCount) % menuItemsCount);
          Sounds.uiClick();
        } else if (e.key === 'ArrowDown') {
          setMainMenuSelection(prev => (prev + 1) % menuItemsCount);
          Sounds.uiClick();
        } else if (e.key === 'Enter' || e.key === ' ') {
          Sounds.uiConfirm();
          const selectedOption = availableOptions[mainMenuSelection];
          if (selectedOption) {
            // Execute the button's onClick handler
            if (selectedOption.id === 'play') startGame(false);
            else if (selectedOption.id === 'zen') startGame(true);
            else if (selectedOption.id === 'shop') { setMode('shop'); setShopSelection(selectedSkyPeckerTypeIndex); setShopTab('skypeckers'); }
            else if (selectedOption.id === 'achievements') setMode('achievements');
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
        } else if (e.key === 'Escape') {
          setMode('start');
          Sounds.uiClick();
        }
      } else if (mode === 'achievements') {
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
    isGamePaused, handleResumeGame, handleRequestPauseFromHud, getAvailableMenuOptions, viewport.isMobile
  ]);

  // Main content opacity and filter for modal/pause states
  const mainContentOpacity = modalOpen || (mode === 'play' && isGamePaused) ? 0.3 : 1;
  const mainContentFilter = modalOpen || (mode === 'play' && isGamePaused) ? 'blur(4px)' : 'none';

return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 overflow-hidden font-['Inter',_sans-serif] no-scroll pwa-fullscreen" 
        style={{ 
          width: '100vw', 
          height: '100dvh', // Use dvh for dynamic viewport height
          minHeight: '100dvh',
          maxHeight: '100dvh'
        }}>
      <div 
        ref={gameAreaRef}
        className="absolute" // Positioning and scaling handled by useLayoutEffect
        style={{ 
          // width, height, transform set by useLayoutEffect
          opacity: mainContentOpacity,
          filter: mainContentFilter,
          overflow: 'hidden' // Ensure gameAreaRef itself doesn't scroll its content beyond its bounds
        }}
      >
        {/* Main game content */}
        {mode !== 'play' && (
          <div className="absolute inset-0 bg-transparent flex items-center justify-center h-full w-full"> {/* ensure h-full w-full */}
            {mode === 'start' && renderStartScreen()}
            {mode === 'shop' && renderShopScreen()}
            {mode === 'achievements' && renderAchievementsScreen()}
            {mode === 'over' && renderGameOverScreen()}
          </div>
        )}
        
        {mode === 'play' && (
          <GameEngine
            ref={gameEngineRef}
            key={gameSessionId}
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
            isContinuation={isContinuingRun}
            initialScore={isContinuingRun && continuationData ? continuationData.score : 0}
            initialCoinsThisRun={isContinuingRun && continuationData ? continuationData.coinsThisRun : 0}
            initialDifficulty={isContinuingRun && continuationData ? continuationData.difficulty : undefined}
            initialGameSpeed={isContinuingRun && continuationData ? continuationData.gameSpeed : undefined}
            initialPerfectRun={isContinuingRun && continuationData ? continuationData.perfectRun : true}
            initialPowerGauge={isContinuingRun && continuationData ? continuationData.powerGauge : undefined}
            initialEnemiesDefeatedThisRun={isContinuingRun && continuationData ? continuationData.enemiesDefeatedThisRun : undefined}
            initialPowerupsUsedThisRun={isContinuingRun && continuationData ? continuationData.powerupsUsedThisRun : undefined}
            initialLastMilestoneScoreAwarded={isContinuingRun && continuationData ? continuationData.lastMilestoneScoreAwarded : undefined}
            initialHasRevived={isContinuingRun && continuationData ? continuationData.hasRevived : undefined}
          />
        )}
        
        {mode === 'play' && renderHud()}
        
        {/* Desktop Banner ad space - Only show on larger screens when ads not removed */}
        {!hasRemovedAds && mode !== 'play' && !modalOpen && !viewport.isMobile && (
          <div className={`fixed left-1/2 transform -translate-x-1/2 bg-slate-700/80 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-300 text-sm z-20 shadow-lg border border-slate-600/50 bottom-6 h-16 w-96`}>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Advertisement</div>
              <div className="text-xs">(Banner Ad Placeholder)</div>
            </div>
          </div>
        )}
        {/* Mobile specific banner ad, respects safe area */}
        {!hasRemovedAds && mode !== 'play' && !modalOpen && viewport.isMobile && (
          <div className="fixed left-0 bg-slate-700/80 backdrop-blur-sm rounded-t-lg flex items-center justify-center text-slate-300 text-xs z-20 shadow-lg border-t border-x border-slate-600/50 text-center"
            style={{
              bottom: '0',
              height: `calc(50px + env(safe-area-inset-bottom, 0px))`,
              paddingBottom: `env(safe-area-inset-bottom, 0px)`,
              width: '100vw', // Ensures it spans full width
              boxSizing: 'border-box'
            }}>
            (Banner Ad Placeholder)
          </div>
        )}
      </div>
      
      {/* HTML Pause Menu Overlay */}
      {mode === 'play' && isGamePaused && !modalOpen && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl shadow-2xl border border-slate-700/50 backdrop-blur-md text-center ${
            viewport.isMobile ? 'p-6 w-full max-w-sm' : 'p-8 max-w-md'
          }`}>
            <h2 className={`font-black text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text mb-8 tracking-wide ${
              viewport.isMobile ? 'text-3xl' : 'text-4xl'
            }`}>
              PAUSED
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className={`text-slate-300 space-y-1 ${viewport.isMobile ? 'text-sm' : 'text-base'}`}>
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
                size={viewport.isMobile ? "lg" : "lg"}
                className="w-full max-w-xs"
                mobileOptimized={viewport.isMobile}
              >
                RESUME GAME
              </MenuButton>
              
              <MenuButton 
                onClick={() => setModalOpen('settings')} 
                variant="secondary" 
                icon="⚙️"
                className="w-full max-w-xs"
                size={viewport.isMobile ? "md" : "md"}
                mobileOptimized={viewport.isMobile}
              >
                SETTINGS
              </MenuButton>
              
              <MenuButton 
                onClick={handleQuitToMenu} 
                variant="danger" 
                icon="🏠"
                className="w-full max-w-xs"
                size={viewport.isMobile ? "md" : "md"}
                mobileOptimized={viewport.isMobile}
              >
                QUIT TO MENU
              </MenuButton>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced notification system with mobile optimization */}
      <div className={`fixed z-50 space-y-2 pointer-events-none ${
        viewport.isMobile ? 'top-4 left-4 right-4' : 'top-4 right-4' // Use top-4 for consistency
      }`} style={ viewport.isMobile ? { paddingTop: `env(safe-area-inset-top, 0px)`} : {}}>
        {activeNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            visible={true}
            onDismiss={() => dismissNotification(notification.id)}
            mobileOptimized={viewport.isMobile}
          />
        ))}
      </div>

      {/* Modal overlays */}
      {renderSettingsModal()}
      {renderLeaderboardScreen()}
      {renderAdOverlay()}
      
      {/* Enhanced styles with mobile optimizations */}
      <style>{`
        :root {
          --safe-area-inset-top: env(safe-area-inset-top, 0px);
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
          --safe-area-inset-left: env(safe-area-inset-left, 0px);
          --safe-area-inset-right: env(safe-area-inset-right, 0px);
        }

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent; /* Remove tap highlight globally */
        }
        
        html, body, #root {
          width: 100vw;
          height: 100vh; /* Fallback for older browsers */
          height: 100dvh; /* Modern unit for dynamic viewport height */
          margin: 0;
          padding: 0;
          overflow: hidden; /* Prevent scrolling on root elements */
          position: fixed; /* Crucial for PWA-like behavior */
          top: 0;
          left: 0;
        }

        /* Specific iOS -webkit-fill-available for full height when URL bar is tricky */
        @supports (-webkit-touch-callout: none) { /* iOS specific */
          html, body, #root {
            height: -webkit-fill-available;
          }
        }
        
        body { 
          font-family: 'Inter', sans-serif; 
          overscroll-behavior: none; /* Prevent pull-to-refresh/bounce */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-overflow-scrolling: touch; 
        }
        
        /* PWA fullscreen class for the outermost container of your app */
        .pwa-fullscreen {
          width: 100vw;
          height: 100vh; /* Fallback */
          height: 100dvh;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }
        @supports (-webkit-touch-callout: none) { /* iOS specific */
          .pwa-fullscreen {
            height: -webkit-fill-available;
          }
        }
        
        /* Ensure no-scroll class truly prevents scroll and fills height */
        .no-scroll {
          overflow: hidden !important;
          height: 100%; /* Fill its parent which should be correctly sized */
        }
        
        /* Styles for when in standalone PWA mode */
        @media all and (display-mode: standalone) {
          html, body, #root, .pwa-fullscreen {
            height: 100vh; /* dvh should be reliable here */
             @supports (-webkit-touch-callout: none) { /* iOS specific */
                height: -webkit-fill-available;
            }
          }
        }
        
        /* Enhanced text shadows */
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
        
        /* Enhanced scrollbars */
        .custom-scrollbar::-webkit-scrollbar {
          width: ${viewport.isMobile ? '6px' : '10px'};
          height: ${viewport.isMobile ? '6px' : '10px'};
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

        /* Mobile-specific scrollbars (already covered by viewport.isMobile check in general scrollbar) */
        .mobile-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .mobile-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.5);
          border-radius: 3px;
        }

        /* Enhanced range input styling with mobile optimization */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          outline: none;
          width: 100%;
        }
        
        input[type="range"]::-webkit-slider-runnable-track { /* Use runnable-track for WebKit */
          height: ${viewport.isMobile ? '8px' : '8px'}; 
          background: linear-gradient(90deg, #334155, #475569); 
          border-radius: 6px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-track {
          height: ${viewport.isMobile ? '8px' : '8px'};
          background: linear-gradient(90deg, #334155, #475569); 
          border-radius: 6px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
          border: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: ${viewport.isMobile ? '-6px' : '-6px'}; /* (track_height - thumb_height) / 2 roughly */
          height: ${viewport.isMobile ? '20px' : '20px'}; 
          width: ${viewport.isMobile ? '20px' : '20px'};
          /* background is handled by accent-color or specific classes */
          border-radius: 50%;
          border: 2px solid #F1F5F9; 
          cursor: pointer;
          transition: all 0.2s ease;
          /* box-shadow is handled by accent-color or specific classes */
        }
        
        input[type="range"]::-moz-range-thumb {
          height: ${viewport.isMobile ? '20px' : '20px'};
          width: ${viewport.isMobile ? '20px' : '20px'};
          /* background is handled by accent-color or specific classes */
          border-radius: 50%;
          border: 2px solid #F1F5F9; 
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Generic shadow for moz */
        }
        
        input[type="range"]:hover::-webkit-slider-thumb {
          transform: scale(1.1);
        }
        
        input[type="range"]:hover::-moz-range-thumb {
          transform: scale(1.1);
        }
        
        /* Custom thumb colors via accent-color class - Tailwind handles this for modern browsers */
        input[type="range"].accent-teal-500::-webkit-slider-thumb {
            background-color: #14B8A6; /* Teal-500 */
            box-shadow: 0 2px 4px rgba(20, 184, 166, 0.4);
        }
        input[type="range"].accent-teal-500::-moz-range-thumb {
            background-color: #14B8A6; /* Teal-500 */
            box-shadow: 0 2px 4px rgba(20, 184, 166, 0.4);
        }
        input[type="range"].accent-cyan-500::-webkit-slider-thumb { 
          background-color: #06B6D4;  /* Cyan-500 */
          box-shadow: 0 2px 4px rgba(6, 182, 212, 0.4);
        } 
        input[type="range"].accent-cyan-500::-moz-range-thumb { 
          background-color: #06B6D4; /* Cyan-500 */
          box-shadow: 0 2px 4px rgba(6, 182, 212, 0.4);
        }


        /* Enhanced mobile button touch targets */
        @media (max-width: 768px) {
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          button, .touch-target, [role="button"] { /* Ensure all interactive elements are easily tappable */
            min-height: 44px; /* WCAG minimum touch target size */
            /* min-width: 44px; /* Only apply if it doesn't break layout, often height is key */
            touch-action: manipulation; /* Improves responsiveness */
          }
          
          input[type="range"] {
            touch-action: pan-x; /* Allow horizontal swipe for sliders */
          }
          
          /* Prevent zoom on input focus */
          input, select, textarea {
            font-size: 16px !important; /* Prevents iOS zoom on focus */
          }
          
          /* Better text truncation for mobile */
          .mobile-truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }
        }

        /* Smooth animations with reduced motion support */
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
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        /* Accessibility improvements with mobile considerations */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Focus improvements for keyboard navigation and mobile accessibility */
        button:focus-visible, input:focus-visible, [role="button"]:focus-visible, a:focus-visible {
          outline: ${viewport.isMobile ? '3px' : '2px'} solid #6366F1 !important; /* Tailwind indigo-500 */
          outline-offset: 2px !important;
          border-radius: 4px !important; /* Slight rounding for the outline */
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3) !important; /* Softer glow */
        }
        input[type="range"]:focus-visible::-webkit-slider-thumb { /* Specific focus for range thumbs */
           box-shadow: 0 0 0 3px #fff, 0 0 0 6px #6366F1 !important;
        }
        input[type="range"]:focus-visible::-moz-range-thumb {
           box-shadow: 0 0 0 3px #fff, 0 0 0 6px #6366F1 !important;
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

        /* Mobile-specific performance optimizations */
        @media (max-width: 768px) {
          .backdrop-blur-md {
            backdrop-filter: blur(8px); /* Standard blur for mobile */
            -webkit-backdrop-filter: blur(8px);
          }
          
          .backdrop-blur-sm {
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          }
          
          .backdrop-blur-lg {
            backdrop-filter: blur(12px); /* Max blur for critical overlays */
            -webkit-backdrop-filter: blur(12px);
          }
        }

        /* Enhanced mobile button styles */
        .mobile-button-touch { /* Use this class for buttons needing larger touch areas if not already covered */
          min-height: 48px;
          /* min-width: 48px; Let width be flexible */
          touch-action: manipulation;
        }

        /* Enhanced badge visibility */
        .achievement-badge { /* Ensure specificity if needed */
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          color: white !important;
          font-weight: bold !important;
          min-width: 24px !important; /* Tailwind w-6 */
          height: 24px !important;    /* Tailwind h-6 */
          font-size: 12px !important;  /* Tailwind text-xs */
          line-height: 1 !important; /* For vertical centering of text */
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6) !important;
          border: 2px solid white !important;
          border-radius: 9999px !important; /* Tailwind rounded-full */
        }

        /* Improved mobile text readability */
        @media (max-width: 768px) {
          .text-mobile-optimized {
            line-height: 1.6;
            letter-spacing: 0.025em;
          }
        }
        
        .force-repaint { /* Use this class sparingly if visual glitches occur during/after transitions */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
      `}</style>
    </div>
  );
};

export default App;