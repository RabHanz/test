
import { SceneConfig, SilhouettePoint } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT } from './constants';

// Audio
let audioContext: AudioContext | null = null;
let masterSfxVolume = 0.5; // Default SFX volume
let masterBgmVolume = 0.3; // Default BGM volume
let bgmOscillators: OscillatorNode[] = [];
let bgmGainNode: GainNode | null = null;
let bgmIntervalId: number | null = null;


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
    bgmGainNode.gain.setValueAtTime(masterBgmVolume * 0.3, audioContext.currentTime); // BGM typically softer
  }
}

export function playTone(
    frequency: number, 
    duration: number, 
    volumeMultiplier: number = 1, // Multiplier for the master SFX volume
    type: OscillatorType = 'square'
  ): void {
  const ctx = getAudioContext();
  if (!ctx || masterSfxVolume === 0) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type; 

  const finalVolume = masterSfxVolume * volumeMultiplier;
  gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export const Sounds = {
  flap: () => playTone(220, 0.07, 0.7, 'sine'),
  coin: () => playTone(900, 0.08, 0.6, 'triangle'),
  powerup: () => playTone(523.25, 0.15, 0.8, 'sine'), // C5
  pipeHit: () => playTone(130.81, 0.2, 0.9, 'sawtooth'), // C3
  gameOverCrash: () => playTone(87.31, 0.35, 1.0, 'sawtooth'), // F2
  achievement: () => {
    playTone(659.25, 0.1, 0.7, 'sine'); // E5
    setTimeout(() => playTone(783.99, 0.1, 0.7, 'sine'), 120); // G5
    setTimeout(() => playTone(1046.50, 0.15, 0.7, 'sine'), 240); // C6
  },
  debuffHeavyWings: () => playTone(110, 0.25, 0.9, 'square'), // A2
  debuffFlapFatigue: () => playTone(330, 0.12, 0.7, 'sine'), // E4 (slightly off)
  debuffScreenLurch: () => playTone(65, 0.18, 1.0, 'sawtooth'), // C2
  uiClick: () => playTone(600, 0.04, 0.5, 'triangle'),
  uiConfirm: () => playTone(800, 0.06, 0.6, 'sine'),
  uiDeny: () => playTone(280, 0.08, 0.6, 'square'),
  debuffNegated: () => playTone(880, 0.12, 0.8, 'sine'), // A5
  pipePhase: () => playTone(1200, 0.08, 0.5, 'triangle'),
  revive: () => playTone(1046.50, 0.25, 0.9, 'sine'), // C6 long
};


// BGM Management
const sceneMusicConfig: Record<string, { notes: number[], tempo: number, baseVolume?: number }> = {
  mountains: { notes: [261.63, 329.63, 392.00], tempo: 1200 }, // C4, E4, G4 - Calm
  city: { notes: [293.66, 349.23, 440.00], tempo: 1000 },    // D4, F4, A4 - Neutral
  forest: { notes: [220.00, 277.18, 329.63], tempo: 1300 },  // A3, C#4, E4 - Mysterious
  cityNight: { notes: [196.00, 246.94, 311.13], tempo: 1500 }, // G3, B3, D#4 - Mellow
  desert: { notes: [277.18, 369.99, 415.30], tempo: 1100 },   // C#4, F#4, G#4 - Sparse
  default: { notes: [261.63, 392.00], tempo: 1400 }, // Default fallback
};

let currentNoteIndex = 0;

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
  };

  if (action === 'stop') {
    stopCurrentMusic();
    if (bgmGainNode) bgmGainNode.gain.setValueAtTime(0, ctx.currentTime);
    return;
  }

  if (action === 'start' || action === 'changeScene') {
    stopCurrentMusic();
    if (masterBgmVolume === 0) return; // Don't start if BGM is muted

    if (!bgmGainNode) {
      bgmGainNode = ctx.createGain();
      bgmGainNode.connect(ctx.destination);
    }
    const sceneConfKey = Object.keys(sceneMusicConfig).includes(sceneTypeKey) ? sceneTypeKey : 'default';
    const config = sceneMusicConfig[sceneConfKey];
    const baseBgmVol = config.baseVolume || 0.15; // Specific BGM track volume
    bgmGainNode.gain.setValueAtTime(masterBgmVolume * baseBgmVol, ctx.currentTime);
    
    const playNextNote = () => {
      if (masterBgmVolume === 0 || !bgmGainNode || bgmOscillators.length > 3) return; // Limit oscillators

      const osc = ctx.createOscillator();
      osc.connect(bgmGainNode);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(config.notes[currentNoteIndex % config.notes.length], ctx.currentTime);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + (config.tempo / 1000) * 0.8); // Note duration slightly less than tempo
      
      bgmOscillators.push(osc);
      osc.onended = () => {
        bgmOscillators = bgmOscillators.filter(o => o !== osc);
      };
      currentNoteIndex++;
    };

    playNextNote(); // Play first note immediately
    bgmIntervalId = window.setInterval(playNextNote, config.tempo);
  }
}


// Math and Color
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
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

// Silhouette Generation (adapted from original)
export function generateSilhouettePoints(sceneConfig: Pick<SceneConfig, 'type' | 'name'>, canvasWidth: number, canvasHeight: number, groundHeight: number): SilhouettePoint[] {
  const arr: SilhouettePoint[] = [];
  const baseSilhouetteY = canvasHeight - groundHeight;

  if (sceneConfig.type.includes('city') || sceneConfig.type === 'cityNight') {
    for (let x = 0; x < canvasWidth; x += 60) {
      const h = 100 + Math.random() * 80;
      const building: SilhouettePoint = { x, h, windows: [] };
      if (sceneConfig.name === 'Night' || sceneConfig.name === 'Storm' || sceneConfig.type === 'cityNight') {
        for (let y = baseSilhouetteY - h + 15; y < baseSilhouetteY; y += 20) {
          if (Math.random() < 0.5) building.windows?.push({ xoff: 15 + (Math.random() > 0.5 ? 25 : 0) , y });
        }
      }
      arr.push(building);
    }
  } else if (sceneConfig.type === 'mountains') {
    for (let x = 0; x <= canvasWidth; x += 100) {
      arr.push({ x, y: baseSilhouetteY - 120 - Math.random() * 80 });
    }
  } else if (sceneConfig.type === 'forest') {
    for (let x = 0; x < canvasWidth; x += 50) {
      arr.push({ x, y: baseSilhouetteY - 60 - Math.random() * 40 }); // Adjusted y for tree base
    }
  } else if (sceneConfig.type === 'desert') {
    for (let x = 0; x < canvasWidth; x += 80) {
      arr.push({ x, y: baseSilhouetteY - Math.random() * 30, type: 'dune' }); // Adjusted y for dune top
    }
  }
  return arr;
}

// Function to draw silhouette based on points
export function drawSilhouette(ctx: CanvasRenderingContext2D, scene: SceneConfig): void {
  if (!scene.silhouette || !scene.colorRGB) return;
  
  const baseSilhouetteY = CANVAS_HEIGHT - GROUND_HEIGHT;
  ctx.fillStyle = "#1A1A1A"; // Silhouette color

  if (scene.type.includes('city') || scene.type === 'cityNight') {
    scene.silhouette.forEach(b => {
      if (b.h === undefined) return;
      ctx.fillRect(b.x, baseSilhouetteY - b.h, 50, b.h);
      
      if ((scene.name === 'Night' || scene.name === 'Storm' || scene.type === 'cityNight') && b.windows) {
        const originalFill = ctx.fillStyle;
        ctx.fillStyle = "#FFD700"; // Window light color
        b.windows.forEach(w => {
          ctx.fillRect(b.x + w.xoff, w.y, 6, 6);
        });
        ctx.fillStyle = originalFill;
      }
      
      const originalStroke = ctx.strokeStyle;
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, baseSilhouetteY - b.h, 50, b.h);
      ctx.strokeStyle = originalStroke;
    });
  } else if (scene.type === 'mountains') {
    ctx.beginPath();
    ctx.moveTo(0, baseSilhouetteY);
    scene.silhouette.forEach(p => {
      if (p.y !== undefined) ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(CANVAS_WIDTH, baseSilhouetteY);
    ctx.closePath();
    ctx.fill();
  } else if (scene.type === 'forest') {
     scene.silhouette.forEach(t => {
      if (t.y === undefined) return;
      ctx.beginPath();
      ctx.moveTo(t.x, baseSilhouetteY); // Start at ground
      ctx.lineTo(t.x + 25, t.y);     // Peak of tree
      ctx.lineTo(t.x + 50, baseSilhouetteY); // Back to ground
      ctx.closePath();
      ctx.fill();
    });
  } else if (scene.type === 'desert') {
    scene.silhouette.forEach(d => {
      if (d.y === undefined) return;
      const duneHeight = baseSilhouetteY - d.y;
      const duneWidth = 80; 
      ctx.beginPath(); 
      ctx.moveTo(d.x - duneWidth / 2, baseSilhouetteY);
      ctx.quadraticCurveTo(d.x, d.y - duneHeight *0.5 , d.x + duneWidth / 2, baseSilhouetteY); 
      ctx.closePath();
      ctx.fill();
    });
  }
}
