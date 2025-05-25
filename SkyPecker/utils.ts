import { SceneConfig, SilhouettePoint } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT } from './constants';

// Enhanced Audio System
let audioContext: AudioContext | null = null;
let masterSfxVolume = 0.5;
let masterBgmVolume = 0.3;
let bgmOscillators: OscillatorNode[] = [];
let bgmGainNode: GainNode | null = null;
let bgmIntervalId: number | null = null;
let currentMusicLayer = 0;
let adaptiveVolumeEnabled = true;

// Sound pools for variety
const soundPools: Record<string, HTMLAudioElement[]> = {
  flap: [],
  coin: [],
  hit: [],
  powerup: []
};

function getAudioContext(): AudioContext | null {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn("Web Audio API is not supported in this browser.");
        return null;
      }
    }
  }
  return audioContext;
}

export function setMasterSfxVolume(volume: number): void {
  masterSfxVolume = Math.max(0, Math.min(1, volume));
}

export function setMasterBgmVolume(volume: number): void {
  masterBgmVolume = Math.max(0, Math.min(1, volume));
  if (bgmGainNode && audioContext) {
    bgmGainNode.gain.setValueAtTime(masterBgmVolume * 0.25, audioContext.currentTime);
  }
}

// Enhanced tone generation with better sound quality
export function playTone(
  frequency: number, 
  duration: number, 
  volumeMultiplier: number = 1,
  type: OscillatorType = 'sine',
  detune: number = 0,
  fadeOut: boolean = true
): void {
  const ctx = getAudioContext();
  if (!ctx || masterSfxVolume === 0) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filterNode = ctx.createBiquadFilter();

  // Enhanced audio chain: oscillator -> filter -> gain -> destination
  oscillator.connect(filterNode);
  filterNode.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;
  oscillator.detune.value = detune;

  // Add subtle filtering for better sound quality
  filterNode.type = 'lowpass';
  filterNode.frequency.value = frequency * 2;
  filterNode.Q.value = 1;

  const finalVolume = masterSfxVolume * volumeMultiplier;
  gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
  
  if (fadeOut) {
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
  } else {
    gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime + duration - 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
  }

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Enhanced sound effects with variations
export const Sounds = {
  flap: () => {
    const variations = [
      { freq: 220, detune: 0 },
      { freq: 235, detune: 5 },
      { freq: 210, detune: -5 }
    ];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    playTone(variation.freq, 0.08, 0.7, 'sine', variation.detune);
  },
  
  coin: () => {
    const variations = [
      { freq: 900, detune: 0 },
      { freq: 950, detune: 10 },
      { freq: 850, detune: -10 },
      { freq: 1000, detune: 15 }
    ];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    playTone(variation.freq, 0.1, 0.6, 'triangle', variation.detune);
  },
  
  point: () => {
    playTone(880, 0.15, 0.5, 'sine', 0);
    setTimeout(() => playTone(1100, 0.1, 0.4, 'sine', 0), 80);
  },

  powerup: () => {
    // Ascending chord progression
    playTone(523.25, 0.08, 0.8, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.08, 0.8, 'sine'), 50); // E5
    setTimeout(() => playTone(783.99, 0.1, 0.8, 'sine'), 100); // G5
  },
  
  pipeHit: () => {
    const variations = [
      { freq: 130.81, detune: 0 }, // C3
      { freq: 123.47, detune: -5 }, // B2
      { freq: 138.59, detune: 5 }  // C#3
    ];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    playTone(variation.freq, 0.25, 0.9, 'sawtooth', variation.detune);
  },
  
  gameOverCrash: () => {
    // Dramatic crash with multiple layers
    playTone(87.31, 0.4, 1.0, 'sawtooth'); // F2
    setTimeout(() => playTone(65.41, 0.3, 0.8, 'square'), 50); // C2
    setTimeout(() => playTone(49.00, 0.35, 0.6, 'sawtooth'), 100); // G1
  },
  
  achievement: () => {
    // Triumphant fanfare
    playTone(659.25, 0.12, 0.7, 'sine'); // E5
    setTimeout(() => playTone(783.99, 0.12, 0.7, 'sine'), 120); // G5
    setTimeout(() => playTone(1046.50, 0.18, 0.7, 'sine'), 240); // C6
    setTimeout(() => playTone(1318.51, 0.15, 0.6, 'sine'), 360); // E6
  },
  
  milestone: () => {
    playTone(700, 0.08, 0.6, 'triangle', 15);
    setTimeout(() => playTone(850, 0.06, 0.5, 'sine', 10), 60);
  },

  // Enhanced debuff sounds
  debuffHeavyWings: () => playTone(110, 0.3, 0.9, 'square', -20),
  debuffFlapFatigue: () => playTone(330, 0.15, 0.7, 'sine', 10),
  debuffScreenLurch: () => playTone(65, 0.2, 1.0, 'sawtooth', -30),
  debuffVisionBlur: () => playTone(200, 0.25, 0.8, 'triangle', 50),
  debuffControlsInvert: () => playTone(400, 0.2, 0.8, 'sine', -40),
  debuffSpeedLock: () => playTone(150, 0.35, 0.9, 'square', -60),
  debuffGravityChaos: () => {
    // Chaotic overlapping tones
    playTone(180, 0.3, 0.6, 'sawtooth', 0);
    setTimeout(() => playTone(240, 0.2, 0.5, 'square', 20), 100);
    setTimeout(() => playTone(320, 0.15, 0.4, 'sine', -15), 150);
  },
  debuffPowerDrain: () => playTone(280, 0.4, 0.8, 'triangle', -25),
  
  // UI sounds
  uiClick: () => playTone(600, 0.05, 0.5, 'triangle'),
  uiConfirm: () => {
    playTone(800, 0.08, 0.6, 'sine');
    setTimeout(() => playTone(1200, 0.06, 0.5, 'sine'), 80);
  },
  uiDeny: () => playTone(280, 0.12, 0.6, 'square', -10),
  
  // Special effect sounds
  debuffNegated: () => {
    playTone(880, 0.15, 0.8, 'sine');
    setTimeout(() => playTone(1100, 0.1, 0.7, 'triangle'), 80);
  },
  pipePhase: () => {
    // Ethereal phase sound
    playTone(1200, 0.1, 0.5, 'triangle', 30);
    setTimeout(() => playTone(1400, 0.08, 0.4, 'sine', 50), 50);
  },
  revive: () => {
    // Phoenix revival sound
    playTone(1046.50, 0.3, 0.9, 'sine');
    setTimeout(() => playTone(1318.51, 0.25, 0.8, 'triangle'), 150);
    setTimeout(() => playTone(1567.98, 0.2, 0.7, 'sine'), 300);
  },
  
  // Enhanced combo and special sounds
  comboHit: (comboLevel: number) => {
    const baseFreq = 600 + (comboLevel * 50);
    playTone(baseFreq, 0.06, Math.min(0.8, 0.4 + comboLevel * 0.1), 'triangle');
  },
  
  enemyDefeat: (enemyType: string) => {
    switch (enemyType) {
      case 'GHOST':
        playTone(400, 0.15, 0.6, 'sine', 20);
        break;
      case 'SPRITE':
        playTone(800, 0.1, 0.5, 'triangle', -10);
        break;
      case 'SPIKEBALL':
        playTone(300, 0.2, 0.7, 'square', 5);
        break;
      case 'VORTEX':
        playTone(500, 0.18, 0.6, 'sawtooth', 30);
        break;
      default:
        playTone(450, 0.12, 0.5, 'sine');
    }
  }
};

// Enhanced BGM Management with adaptive layers
const sceneMusicConfig: Record<string, { 
  notes: number[], 
  tempo: number, 
  baseVolume?: number, 
  oscillatorType?: OscillatorType,
  harmonics?: number[],
  adaptiveLayers?: boolean
}> = {
  mountains: { 
    notes: [261.63, 329.63, 392.00, 523.25], 
    tempo: 1400, 
    oscillatorType: 'sine',
    harmonics: [130.81, 164.81], // Sub-harmonics
    adaptiveLayers: true
  },
  city: { 
    notes: [293.66, 349.23, 440.00, 587.33], 
    tempo: 1100, 
    oscillatorType: 'square',
    baseVolume: 0.12
  },
  forest: { 
    notes: [220.00, 277.18, 329.63, 440.00], 
    tempo: 1500, 
    oscillatorType: 'triangle',
    harmonics: [110.00, 138.59]
  },
  cityNight: { 
    notes: [196.00, 246.94, 311.13, 392.00], 
    tempo: 1700, 
    oscillatorType: 'sine',
    baseVolume: 0.1
  },
  desert: { 
    notes: [277.18, 369.99, 415.30, 554.37], 
    tempo: 1300, 
    oscillatorType: 'sawtooth', 
    baseVolume: 0.08
  },
  zen: { 
    notes: [130.81, 164.81, 196.00, 220.00, 261.63], 
    tempo: 2200, 
    baseVolume: 0.1, 
    oscillatorType: 'sine',
    harmonics: [65.41, 82.41, 98.00],
    adaptiveLayers: true
  },
  volcanic_zen: { 
    notes: [110.00, 146.83, 174.61, 220.00], 
    tempo: 2000, 
    baseVolume: 0.08, 
    oscillatorType: 'sawtooth',
    harmonics: [55.00, 73.42]
  },
  blooming_zen: { 
    notes: [329.63, 392.00, 493.88, 587.33], 
    tempo: 1800, 
    baseVolume: 0.12, 
    oscillatorType: 'triangle',
    harmonics: [164.81, 196.00, 246.94]
  },
  default: { 
    notes: [261.63, 392.00, 523.25], 
    tempo: 1600, 
    oscillatorType: 'sine' 
  }
};

let currentNoteIndex = 0;
let musicIntensity = 0.5; // Adaptive music intensity based on gameplay

export function setMusicIntensity(intensity: number): void {
  musicIntensity = Math.max(0, Math.min(1, intensity));
}

export function manageBackgroundMusic(sceneTypeKey: string, action: 'start' | 'stop' | 'changeScene'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const stopCurrentMusic = () => {
    if (bgmIntervalId !== null) {
      clearInterval(bgmIntervalId);
      bgmIntervalId = null;
    }
    bgmOscillators.forEach(osc => {
      try { osc.stop(); } catch (e) { /* already stopped */ }
    });
    bgmOscillators = [];
    currentNoteIndex = 0;
    currentMusicLayer = 0;
  };

  if (action === 'stop') {
    stopCurrentMusic();
    if (bgmGainNode) bgmGainNode.gain.setValueAtTime(0, ctx.currentTime);
    return;
  }

  if (action === 'start' || action === 'changeScene') {
    stopCurrentMusic();
    if (masterBgmVolume === 0) return;

    if (!bgmGainNode) {
      bgmGainNode = ctx.createGain();
      bgmGainNode.connect(ctx.destination);
    }
    
    const sceneConfKey = Object.keys(sceneMusicConfig).includes(sceneTypeKey) ? sceneTypeKey : 'default';
    const config = sceneMusicConfig[sceneConfKey];
    const baseBgmVol = (config.baseVolume || 0.12) * (0.8 + musicIntensity * 0.4);
    bgmGainNode.gain.setValueAtTime(masterBgmVolume * baseBgmVol, ctx.currentTime);
    
    const playNextNote = () => {
      if (!ctx || masterBgmVolume === 0 || !bgmGainNode || bgmOscillators.length > 5) return;

      const mainOsc = ctx.createOscillator();
      const noteGainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      // Enhanced audio chain
      mainOsc.connect(filterNode);
      filterNode.connect(noteGainNode);
      noteGainNode.connect(bgmGainNode);

      mainOsc.type = config.oscillatorType || 'sine';
      mainOsc.frequency.setValueAtTime(config.notes[currentNoteIndex % config.notes.length], ctx.currentTime);
      
      // Add subtle filtering
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 2000 + musicIntensity * 1000;
      filterNode.Q.value = 0.5;
      
      noteGainNode.gain.setValueAtTime(1.0, ctx.currentTime);

      const noteDuration = (config.tempo / 1000) * 0.9;
      mainOsc.start(ctx.currentTime);
      
      const fadeStartTime = ctx.currentTime + noteDuration * 0.8;
      noteGainNode.gain.setValueAtTime(1.0, fadeStartTime); 
      noteGainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + noteDuration);
      
      mainOsc.stop(ctx.currentTime + noteDuration);
      
      bgmOscillators.push(mainOsc);
      mainOsc.onended = () => {
        bgmOscillators = bgmOscillators.filter(o => o !== mainOsc);
        noteGainNode.disconnect();
        filterNode.disconnect();
      };

      // Add harmonic layers for enhanced scenes
      if (config.harmonics && config.adaptiveLayers && musicIntensity > 0.6) {
        const harmonicOsc = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        
        harmonicOsc.connect(harmonicGain);
        harmonicGain.connect(bgmGainNode);
        
        harmonicOsc.type = 'sine';
        harmonicOsc.frequency.setValueAtTime(
          config.harmonics[currentNoteIndex % config.harmonics.length], 
          ctx.currentTime
        );
        
        harmonicGain.gain.setValueAtTime(0.3 * musicIntensity, ctx.currentTime);
        harmonicGain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + noteDuration);
        
        harmonicOsc.start(ctx.currentTime);
        harmonicOsc.stop(ctx.currentTime + noteDuration);
        
        bgmOscillators.push(harmonicOsc);
        harmonicOsc.onended = () => {
          bgmOscillators = bgmOscillators.filter(o => o !== harmonicOsc);
          harmonicGain.disconnect();
        };
      }
      
      currentNoteIndex++;
    };

    playNextNote(); 
    bgmIntervalId = window.setInterval(playNextNote, config.tempo);
  }
}

// Math and Color Utilities
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function blendColors(color1: [number, number, number], color2: [number, number, number], t: number): string {
  const r = Math.round(lerp(color1[0], color2[0], t));
  const g = Math.round(lerp(color1[1], color2[1], t));
  const b = Math.round(lerp(color1[2], color2[2], t));
  return `rgb(${r},${g},${b})`;
}

// Enhanced color utilities
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb.map(c => {
    const adjusted = c + (255 - c) * (percent / 100);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  });
  
  return rgbToHex(r, g, b);
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#FFFFFF';
  
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

// Silhouette Generation with Enhanced Variety
export function generateSilhouettePoints(
  sceneConfig: Pick<SceneConfig, 'type' | 'name' | 'weather'>, 
  canvasWidth: number, 
  canvasHeight: number, 
  groundHeight: number
): SilhouettePoint[] {
  const arr: SilhouettePoint[] = [];
  const baseSilhouetteY = canvasHeight - groundHeight;

  switch (sceneConfig.type) {
    case 'zen':
    case 'blooming_zen':
      // Gentle rolling hills for zen modes
      for (let x = 0; x <= canvasWidth; x += 80 + Math.random() * 40) {
        const hillHeight = 30 + Math.random() * 25;
        arr.push({ 
          x, 
          y: baseSilhouetteY - hillHeight, 
          type: 'peak',
          variant: sceneConfig.type 
        });
      }
      break;
      
    case 'volcanic_zen':
      // Jagged volcanic peaks
      for (let x = 0; x <= canvasWidth; x += 50 + Math.random() * 30) {
        const peakHeight = 80 + Math.random() * 100;
        arr.push({ 
          x, 
          y: baseSilhouetteY - peakHeight, 
          type: 'peak',
          variant: 'volcanic' 
        });
      }
      break;
      
    case 'city':
    case 'cityNight':
      // Enhanced city skyline with variety
      for (let x = 0; x < canvasWidth; x += 40 + Math.random() * 40) {
        const buildingHeight = 80 + Math.random() * 120;
        const buildingWidth = 40 + Math.random() * 30;
        const building: SilhouettePoint = { 
          x, 
          h: buildingHeight, 
          type: 'building',
          variant: Math.random() > 0.7 ? 'skyscraper' : 'normal',
          windows: [] 
        };
        
        if (sceneConfig.name === 'Night' || sceneConfig.name === 'Storm' || sceneConfig.type === 'cityNight') {
          // Enhanced window generation
          const windowRows = Math.floor(buildingHeight / 25);
          const windowCols = Math.floor(buildingWidth / 15);
          
          for (let row = 1; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
              if (Math.random() < 0.6) { // 60% chance for lit window
                building.windows?.push({ 
                  xoff: 8 + col * 15, 
                  y: baseSilhouetteY - buildingHeight + row * 25,
                  lit: true 
                });
              }
            }
          }
        }
        arr.push(building);
      }
      break;
      
    case 'mountains':
      // Enhanced mountain ranges with peaks and valleys
      const peakCount = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i <= peakCount; i++) {
        const x = (canvasWidth / peakCount) * i + (Math.random() - 0.5) * 40;
        const baseHeight = 100 + Math.random() * 60;
        const peakHeight = sceneConfig.weather === 'snow' ? baseHeight + 20 : baseHeight;
        
        arr.push({ 
          x: Math.max(0, Math.min(canvasWidth, x)), 
          y: baseSilhouetteY - peakHeight,
          type: 'peak',
          variant: sceneConfig.weather === 'snow' ? 'snowy' : 'normal'
        });
      }
      break;
      
    case 'forest':
      // Enhanced forest with varied tree heights
      for (let x = 0; x < canvasWidth; x += 25 + Math.random() * 25) {
        const treeHeight = 40 + Math.random() * 50;
        const treeType = Math.random() > 0.7 ? 'tall' : 'normal';
        
        arr.push({ 
          x, 
          y: baseSilhouetteY - treeHeight,
          type: 'tree',
          variant: treeType
        });
      }
      break;
      
    case 'desert':
      // Enhanced desert with varied dune sizes
      for (let x = 0; x < canvasWidth; x += 60 + Math.random() * 40) {
        const duneHeight = 20 + Math.random() * 40;
        arr.push({ 
          x, 
          y: baseSilhouetteY - duneHeight, 
          type: 'dune',
          variant: Math.random() > 0.8 ? 'large' : 'normal'
        });
      }
      break;
      
    default:
      // Default mountain silhouette
      for (let x = 0; x <= canvasWidth; x += 100) {
        arr.push({ 
          x, 
          y: baseSilhouetteY - 80 - Math.random() * 40,
          type: 'peak'
        });
      }
  }
  
  return arr;
}
// Enhanced silhouette drawing with better visual variety
export function drawSilhouette(ctx: CanvasRenderingContext2D, scene: SceneConfig): void {
  if (!scene.silhouette || !scene.colorRGB) return;
  
  const baseSilhouetteY = CANVAS_HEIGHT - GROUND_HEIGHT;
  ctx.fillStyle = "#1A1A1A"; // Base silhouette color

  if (scene.type === 'zen' || scene.type === 'mountains' || scene.type === 'volcanic_zen' || scene.type === 'blooming_zen') {
    // Enhanced mountain/hill drawing
    ctx.beginPath();
    ctx.moveTo(0, baseSilhouetteY);
    
    scene.silhouette.forEach((p, index) => {
      if (p.y !== undefined) {
        if (index === 0) {
          ctx.lineTo(p.x, p.y);
        } else {
          // Smooth curves between peaks
          const prevPoint = scene.silhouette[index - 1];
          if (prevPoint.y !== undefined) {
            const cpX = (prevPoint.x + p.x) / 2;
            const cpY = Math.min(prevPoint.y, p.y) - 10;
            ctx.quadraticCurveTo(cpX, cpY, p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      }
    });
    
    ctx.lineTo(CANVAS_WIDTH, baseSilhouetteY);
    ctx.closePath();
    ctx.fill();

    // Enhanced snow/special effects
    if (scene.weather === 'snow' || scene.type === 'zen' || scene.type === 'volcanic_zen') {
      scene.silhouette.forEach(p => {
        if (p.y !== undefined) {
          const peakHeight = baseSilhouetteY - p.y;
          
          if (scene.type === 'zen' && peakHeight > 15) {
            // Zen garden snow effects
            ctx.fillStyle = 'rgba(245, 248, 255, 0.8)';
            const snowPatchWidth = 15 + peakHeight * 0.15;
            const snowPatchHeight = 3 + peakHeight * 0.08;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + snowPatchHeight * 0.4, snowPatchWidth / 2, snowPatchHeight, 0, Math.PI, Math.PI * 2, false);
            ctx.fill();
          } else if (scene.type === 'volcanic_zen' && peakHeight > 20) {
            // Volcanic glow effects
            const glowIntensity = Math.min(1, peakHeight / 100);
            ctx.save();
            ctx.globalAlpha = 0.3 * glowIntensity;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 30);
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (scene.weather === 'snow' && peakHeight > 25) {
            // Regular mountain snow caps
            ctx.fillStyle = 'rgba(245, 248, 255, 0.9)';
            const snowPatchWidth = 20 + peakHeight * 0.2;
            const snowPatchHeight = 5 + peakHeight * 0.1;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + snowPatchHeight * 0.3, snowPatchWidth / 2, snowPatchHeight, 0, Math.PI, Math.PI * 2, false);
            ctx.fill();
          }
        }
      });
    }

    // Blooming zen special effects
    if (scene.type === 'blooming_zen') {
      scene.silhouette.forEach(p => {
        if (p.y !== undefined && Math.random() < 0.4) {
          const flowerSize = 2 + Math.random() * 4;
          const flowerColors = ['rgba(255, 182, 193, 0.8)', 'rgba(255, 228, 225, 0.8)', 'rgba(255, 192, 203, 0.8)'];
          ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
          ctx.beginPath();
          ctx.arc(p.x + (Math.random() - 0.5) * 40, p.y + (Math.random() - 0.5) * 15, flowerSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

  } else if (scene.type.includes('city') || scene.type === 'cityNight') {
    // Enhanced city rendering
    scene.silhouette.forEach(b => {
      if (b.h === undefined) return;
      
      const buildingWidth = 50;
      const gradient = ctx.createLinearGradient(b.x, baseSilhouetteY - b.h, b.x, baseSilhouetteY);
      
      if (b.variant === 'skyscraper') {
        gradient.addColorStop(0, '#0F0F0F');
        gradient.addColorStop(1, '#1A1A1A');
      } else {
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2A2A2A');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(b.x, baseSilhouetteY - b.h, buildingWidth, b.h);
      
      // Enhanced windows with better lighting
      if ((scene.name === 'Night' || scene.name === 'Storm' || scene.type === 'cityNight') && b.windows) {
        b.windows.forEach(w => {
          if (w.lit) {
            // Window glow effect
            ctx.save();
            ctx.globalAlpha = 0.8;
            const windowGlow = ctx.createRadialGradient(b.x + w.xoff + 3, w.y + 3, 0, b.x + w.xoff + 3, w.y + 3, 8);
            windowGlow.addColorStop(0, '#FFD700');
            windowGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = windowGlow;
            ctx.fillRect(b.x + w.xoff - 2, w.y - 2, 10, 10);
            ctx.restore();
            
            // Window itself
            ctx.fillStyle = w.lit ? '#FFD700' : '#333333';
            ctx.fillRect(b.x + w.xoff, w.y, 6, 6);
          }
        });
      }
      
      // Building outline
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, baseSilhouetteY - b.h, buildingWidth, b.h);
      
      // Rooftop details for skyscrapers
      if (b.variant === 'skyscraper') {
        ctx.fillStyle = '#444444';
        ctx.fillRect(b.x + 10, baseSilhouetteY - b.h - 8, 30, 8);
        ctx.fillRect(b.x + 20, baseSilhouetteY - b.h - 12, 10, 4);
      }
    });
    
  } else if (scene.type === 'forest') {
    // Enhanced forest rendering
    scene.silhouette.forEach(t => {
      if (t.y === undefined) return;
      
      const treeHeight = baseSilhouetteY - t.y;
      const baseWidth = t.variant === 'tall' ? 60 : 45;
      
      // Tree trunk
      ctx.fillStyle = '#2D1B14';
      const trunkWidth = 8;
      ctx.fillRect(t.x - trunkWidth/2, baseSilhouetteY - 20, trunkWidth, 20);
      
      // Tree canopy with layered effect
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.moveTo(t.x, baseSilhouetteY - 20);
      
      if (t.variant === 'tall') {
        // Tall tree with multiple layers
        ctx.lineTo(t.x - baseWidth/3, t.y + treeHeight * 0.3);
        ctx.lineTo(t.x, t.y);
        ctx.lineTo(t.x + baseWidth/3, t.y + treeHeight * 0.3);
        ctx.lineTo(t.x + baseWidth/2, baseSilhouetteY - 20);
      } else {
        // Standard tree shape
        ctx.lineTo(t.x - baseWidth/2, t.y + treeHeight * 0.2);
        ctx.lineTo(t.x, t.y);
        ctx.lineTo(t.x + baseWidth/2, t.y + treeHeight * 0.2);
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add texture lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const lineY = t.y + (treeHeight * 0.2) + i * (treeHeight * 0.2);
        ctx.beginPath();
        ctx.moveTo(t.x - baseWidth/4, lineY);
        ctx.lineTo(t.x + baseWidth/4, lineY);
        ctx.stroke();
      }
    });
    
  } else if (scene.type === 'desert') {
    // Enhanced desert dunes
    scene.silhouette.forEach((d, index) => {
      if (d.y === undefined) return;
      
      const duneHeight = baseSilhouetteY - d.y;
      const duneWidth = d.variant === 'large' ? 120 : 80;
      
      // Create smooth dune with gradient
      const gradient = ctx.createLinearGradient(d.x - duneWidth/2, d.y, d.x + duneWidth/2, baseSilhouetteY);
      gradient.addColorStop(0, '#1A1A1A');
      gradient.addColorStop(0.7, '#2A2A2A');
      gradient.addColorStop(1, '#1A1A1A');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(d.x - duneWidth/2, baseSilhouetteY);
      
      // Smooth dune curve
      const peak1X = d.x - duneWidth/6;
      const peak1Y = d.y + duneHeight * 0.1;
      const peak2X = d.x + duneWidth/6;
      const peak2Y = d.y + duneHeight * 0.15;
      
      ctx.quadraticCurveTo(peak1X, peak1Y, d.x, d.y);
      ctx.quadraticCurveTo(peak2X, peak2Y, d.x + duneWidth/2, baseSilhouetteY);
      
      ctx.closePath();
      ctx.fill();
      
      // Add sand texture
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 5; i++) {
        const sandX = d.x - duneWidth/4 + Math.random() * duneWidth/2;
        const sandY = d.y + duneHeight * 0.3 + Math.random() * duneHeight * 0.4;
        ctx.fillRect(sandX, sandY, 2, 1);
      }
    });
  }
}

// Utility functions for game mechanics
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeIn(t: number): number {
  return t * t;
}

export function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// Performance optimization utilities
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

// Random utility functions
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

export function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Local storage utilities with error handling
export function saveToLocalStorage(key: string, data: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function daysSince(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Animation utilities
export function createSpring(stiffness: number = 100, damping: number = 10) {
  let currentValue = 0;
  let targetValue = 0;
  let velocity = 0;
  
  return {
    setTarget: (target: number) => {
      targetValue = target;
    },
    
    update: (deltaTime: number) => {
      const springForce = -stiffness * (currentValue - targetValue);
      const dampingForce = -damping * velocity;
      const acceleration = springForce + dampingForce;
      
      velocity += acceleration * deltaTime;
      currentValue += velocity * deltaTime;
      
      return currentValue;
    },
    
    getValue: () => currentValue,
    isSettled: () => Math.abs(currentValue - targetValue) < 0.01 && Math.abs(velocity) < 0.01
  };
}

// Enhanced particle effects utilities
export function createParticleEffect(
  x: number, 
  y: number, 
  count: number, 
  color: string,
  spreadAngle: number = Math.PI * 2,
  speed: number = 3
) {
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * spreadAngle;
    const particleSpeed = speed * (0.5 + Math.random() * 0.5);
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * particleSpeed,
      vy: Math.sin(angle) * particleSpeed,
      life: 60 + Math.random() * 60,
      maxLife: 60 + Math.random() * 60,
      color,
      size: 2 + Math.random() * 3,
      gravity: 0.1 + Math.random() * 0.1,
      bounce: 0.3 + Math.random() * 0.4
    });
  }
  
  return particles;
}

// Screen capture utility (for sharing screenshots)
export function captureCanvas(canvas: HTMLCanvasElement): string | null {
  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('Failed to capture canvas:', error);
    return null;
  }
}

// Device detection utilities
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

// Performance monitoring utilities
export function createFPSCounter() {
  let lastTime = 0;
  let frameCount = 0;
  let fps = 60;
  
  return {
    update: (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      return fps;
    },
    
    getFPS: () => fps
  };
}

// Haptic feedback utility (for mobile devices)
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
}

// Accessibility utilities
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
}

// Export all utilities
export {
  audioContext,
  masterSfxVolume,
  masterBgmVolume,
  musicIntensity
};