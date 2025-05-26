// utils.ts

import { SceneConfig, SilhouettePoint } from './types'; // Keep your existing imports
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT } from './constants'; // Keep your existing imports

// --- Enhanced Audio System ---
let audioContext: AudioContext | null = null;
let masterSfxVolume = 0.5;
let masterBgmVolume = 0.3; // This will be the App's state, initial default can be 0 to disable music

// Background Music
let backgroundMusicElement: HTMLAudioElement | null = null;
let currentBgmTrackUrl: string | null = null;

// SFX: Store AudioBuffers for precise playback
const sfxBuffers: Record<string, AudioBuffer[]> = {
  flap: [],
  coin: [],
  hit: [], // General hit or specific (pipeHit)
  powerup: [],
  point: [],
  gameOverCrash: [],
  achievement: [],
  milestone: [],
  debuffHeavyWings: [],
  debuffFlapFatigue: [],
  debuffScreenLurch: [],
  debuffVisionBlur: [],
  debuffControlsInvert: [],
  debuffSpeedLock: [],
  debuffGravityChaos: [],
  debuffPowerDrain: [],
  uiClick: [],
  uiConfirm: [],
  uiDeny: [],
  debuffNegated: [],
  pipePhase: [],
  revive: [],
  comboHit: [], // Maybe one buffer, pitch shifted in code
  enemyDefeatGhost: [],
  enemyDefeatSprite: [],
  enemyDefeatSpikeball: [],
  enemyDefeatVortex: [],
  enemyDefeatDefault: [],
};

// List of SFX files to preload (adjust paths and filenames as needed)
// Create variations by having multiple files, e.g., flap1.mp3, flap2.mp3
const sfxFiles: Record<keyof typeof sfxBuffers, string | string[]> = {
  flap: ["/audio/sfx/flap1.wav", "/audio/sfx/flap2.wav"], // Example: provide multiple files for variation
  coin: "/audio/sfx/coin.wav",
  hit: "/audio/sfx/pipe_hit.wav", // Renamed from pipeHit for consistency
  powerup: "/audio/sfx/powerup.wav",
  point: "/audio/sfx/point.wav",
  gameOverCrash: "/audio/sfx/game_over_crash.wav",
  achievement: "/audio/sfx/achievement.wav",
  milestone: "/audio/sfx/milestone.wav",
  debuffHeavyWings: "/audio/sfx/debuff_heavy.wav",
  debuffFlapFatigue: "/audio/sfx/debuff_fatigue.wav",
  debuffScreenLurch: "/audio/sfx/debuff_lurch.wav",
  debuffVisionBlur: "/audio/sfx/debuff_blur.wav",
  debuffControlsInvert: "/audio/sfx/debuff_invert.wav",
  debuffSpeedLock: "/audio/sfx/debuff_speedlock.wav",
  debuffGravityChaos: "/audio/sfx/debuff_chaos.wav",
  debuffPowerDrain: "/audio/sfx/debuff_drain.wav",
  uiClick: "/audio/sfx/ui_click.wav",
  uiConfirm: "/audio/sfx/ui_confirm.wav",
  uiDeny: "/audio/sfx/ui_deny.wav",
  debuffNegated: "/audio/sfx/debuff_negated.wav",
  pipePhase: "/audio/sfx/pipe_phase.wav",
  revive: "/audio/sfx/revive.wav",
  comboHit: "/audio/sfx/combo_hit.wav", // Or generate dynamically if pitch shifting
  enemyDefeatGhost: "/audio/sfx/enemy_ghost.wav",
  enemyDefeatSprite: "/audio/sfx/enemy_sprite.wav",
  enemyDefeatSpikeball: "/audio/sfx/enemy_spikeball.wav",
  enemyDefeatVortex: "/audio/sfx/enemy_vortex.wav",
  enemyDefeatDefault: "/audio/sfx/enemy_default.wav",
};

// BGM Tracks (adjust paths and filenames)
const bgmTracks: Record<string, string> = {
  mountains: "/audio/bgm/mountains_theme.mp3",
  city: "/audio/bgm/city_theme.mp3",
  forest: "/audio/bgm/forest_theme.mp3",
  cityNight: "/audio/bgm/city_night_theme.mp3",
  desert: "/audio/bgm/desert_theme.mp3",
  zen: "/audio/bgm/zen_theme.mp3",
  volcanic_zen: "/audio/bgm/volcanic_zen_theme.mp3",
  blooming_zen: "/audio/bgm/blooming_zen_theme.mp3",
  default: "/audio/bgm/main_theme.mp3" // Fallback BGM
};

export function getAudioContext(): AudioContext | null {
  if (typeof window !== 'undefined') {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn("Web Audio API is not supported in this browser.");
        return null;
      }
    }
    // Resume context if suspended (often due to autoplay policies)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => console.warn("Failed to resume audio context:", err));
    }
  }
  return audioContext;
}

// --- SFX Management ---
export function setMasterSfxVolume(volume: number): void {
  masterSfxVolume = Math.max(0, Math.min(1, volume));
}

async function loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
  const ctx = getAudioContext();
  if (!ctx) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.warn(`Failed to load audio buffer for ${url}:`, error);
    return null;
  }
}

export async function preloadSounds(): Promise<void> {
  console.log("Preloading sounds...");
  const loadPromises: Promise<void>[] = [];

  for (const key in sfxFiles) {
    const sfxKey = key as keyof typeof sfxBuffers;
    const fileOrFiles = sfxFiles[sfxKey];
    const filesToLoad = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

    sfxBuffers[sfxKey] = []; // Initialize the array for this key

    filesToLoad.forEach(filePath => {
      loadPromises.push(
        loadAudioBuffer(filePath).then(buffer => {
          if (buffer) {
            sfxBuffers[sfxKey].push(buffer);
          }
        })
      );
    });
  }

  try {
    await Promise.all(loadPromises);
    console.log("All SFX preloaded (or attempted).");
  } catch (error) {
    console.error("Error during SFX preloading:", error);
  }
}


function playSoundBuffer(buffer: AudioBuffer | null, volumeMultiplier: number = 1, pitchShift: number = 0): void {
  const ctx = getAudioContext();
  if (!ctx || !buffer || masterSfxVolume === 0) return;

  if (ctx.state === 'suspended') { // Double check and try to resume
      ctx.resume().catch(err => {
          console.warn("Could not resume audio context for SFX:", err);
          return; // Don't proceed if context can't be resumed
      });
  }
  // Wait a tick for resume to potentially take effect, not ideal but can help
  // A better solution is ensuring first user interaction definitely resumes context.
  // setTimeout(() => {
    // if (ctx.state !== 'running') return; // Still not running, bail.

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(masterSfxVolume * volumeMultiplier, ctx.currentTime);

    source.connect(gainNode).connect(ctx.destination);

    if (pitchShift !== 0 && source.detune) { // Detune for pitch shifting
        source.detune.setValueAtTime(pitchShift * 100, ctx.currentTime); // detune is in cents
    }

    source.start(0);
  // }, 0);
}

function playRandomSoundFromPool(key: keyof typeof sfxBuffers, volumeMultiplier: number = 1, pitchShift: number = 0): void {
  const bufferPool = sfxBuffers[key];
  if (bufferPool && bufferPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * bufferPool.length);
    const bufferToPlay = bufferPool[randomIndex];
    if (bufferToPlay) {
      playSoundBuffer(bufferToPlay, volumeMultiplier, pitchShift);
    } else {
      console.warn(`Buffer at index ${randomIndex} for key ${key} is null.`);
    }
  } else {
    // console.warn(`No sound buffers loaded for key: ${key}`);
    // Fallback to tone generation if desired, or just do nothing
    // playTone(440, 0.1, 0.5); // Example fallback
  }
}

export const Sounds = {
  flap: () => playRandomSoundFromPool('flap', 0.7),
  coin: () => playRandomSoundFromPool('coin', 0.6),
  point: () => playRandomSoundFromPool('point', 0.5),
  powerup: () => playRandomSoundFromPool('powerup', 0.8),
  pipeHit: () => playRandomSoundFromPool('hit', 0.9), // Use 'hit' key
  gameOverCrash: () => playRandomSoundFromPool('gameOverCrash', 1.0),
  achievement: () => playRandomSoundFromPool('achievement', 0.7),
  milestone: () => playRandomSoundFromPool('milestone', 0.6),
  debuffHeavyWings: () => playRandomSoundFromPool('debuffHeavyWings', 0.9),
  debuffFlapFatigue: () => playRandomSoundFromPool('debuffFlapFatigue', 0.7),
  debuffScreenLurch: () => playRandomSoundFromPool('debuffScreenLurch', 1.0),
  debuffVisionBlur: () => playRandomSoundFromPool('debuffVisionBlur', 0.8),
  debuffControlsInvert: () => playRandomSoundFromPool('debuffControlsInvert', 0.8),
  debuffSpeedLock: () => playRandomSoundFromPool('debuffSpeedLock', 0.9),
  debuffGravityChaos: () => playRandomSoundFromPool('debuffGravityChaos', 0.7),
  debuffPowerDrain: () => playRandomSoundFromPool('debuffPowerDrain', 0.8),
  uiClick: () => playRandomSoundFromPool('uiClick', 0.5),
  uiConfirm: () => playRandomSoundFromPool('uiConfirm', 0.6),
  uiDeny: () => playRandomSoundFromPool('uiDeny', 0.6),
  debuffNegated: () => playRandomSoundFromPool('debuffNegated', 0.8),
  pipePhase: () => playRandomSoundFromPool('pipePhase', 0.5),
  revive: () => playRandomSoundFromPool('revive', 0.9),
  comboHit: (comboLevel: number) => {
    // For combo, you might still use playTone or have specific files.
    // If using one file and pitch shifting:
    // playRandomSoundFromPool('comboHit', Math.min(0.8, 0.4 + comboLevel * 0.1), comboLevel * 2); // Shift pitch by comboLevel * 200 cents
    // Or use playTone if you prefer generated sound for this
    const baseFreq = 600 + (comboLevel * 50);
    playTone(baseFreq, 0.06, Math.min(0.8, 0.4 + comboLevel * 0.1), 'triangle');
  },
  enemyDefeat: (enemyType: string) => {
    switch (enemyType) {
      case 'GHOST': playRandomSoundFromPool('enemyDefeatGhost', 0.6); break;
      case 'SPRITE': playRandomSoundFromPool('enemyDefeatSprite', 0.5); break;
      case 'SPIKEBALL': playRandomSoundFromPool('enemyDefeatSpikeball', 0.7); break;
      case 'VORTEX': playRandomSoundFromPool('enemyDefeatVortex', 0.6); break;
      default: playRandomSoundFromPool('enemyDefeatDefault', 0.5);
    }
  }
};

// --- BGM Management ---
export function setMasterBgmVolume(volume: number): void {
  masterBgmVolume = Math.max(0, Math.min(1, volume));
  if (backgroundMusicElement) {
    backgroundMusicElement.volume = masterBgmVolume;
  }
}

export function manageBackgroundMusic(sceneTypeKey: string, action: 'start' | 'stop' | 'changeScene'): void {
  const ctx = getAudioContext(); // Ensure context is active for user gesture requirement
  if (action === 'stop') {
    if (backgroundMusicElement) {
      backgroundMusicElement.pause();
      backgroundMusicElement.currentTime = 0; // Reset for next play
      // Optional: fully release the element
      // backgroundMusicElement.src = "";
      // backgroundMusicElement = null;
      // currentBgmTrackUrl = null;
    }
    return;
  }

  if (action === 'start' || action === 'changeScene') {
    if (masterBgmVolume === 0) { // If master BGM volume is 0, don't start/change music
      if (backgroundMusicElement) backgroundMusicElement.pause(); // Ensure it's paused if it was playing
      return;
    }

    const trackUrl = bgmTracks[sceneTypeKey] || bgmTracks['default'];

    if (currentBgmTrackUrl === trackUrl && backgroundMusicElement && !backgroundMusicElement.paused) {
      // Already playing the correct track
      backgroundMusicElement.volume = masterBgmVolume; // Ensure volume is up-to-date
      return;
    }

    if (backgroundMusicElement) {
      backgroundMusicElement.pause();
    }

    // Use a new Audio element or reuse if you prefer
    backgroundMusicElement = new Audio(trackUrl);
    currentBgmTrackUrl = trackUrl;
    backgroundMusicElement.volume = masterBgmVolume;
    backgroundMusicElement.loop = true;

    backgroundMusicElement.play()
      .then(() => {
        // console.log(`BGM playing: ${trackUrl}`);
      })
      .catch(error => {
        console.warn(`Error playing BGM ${trackUrl}:`, error);
        // This often happens if play() is called without prior user interaction.
        // The audioContext.resume() in getAudioContext helps, but direct play()
        // on HTMLAudioElement also needs that interaction 'unlock'.
      });
  }
}


// --- Tone Generation (Fallback or for specific effects like comboHit if preferred) ---
// Your existing playTone function - can be kept for effects where generated sound is desired
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

   if (ctx.state === 'suspended') {
      ctx.resume().catch(err => {
          console.warn("Could not resume audio context for playTone:", err);
          return;
      });
  }
  // setTimeout(() => { // Optional: delay slightly for resume
    // if (ctx.state !== 'running') return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    // Optional: Keep filter if you like the effect
    // const filterNode = ctx.createBiquadFilter();
    // oscillator.connect(filterNode);
    // filterNode.connect(gainNode);
    oscillator.connect(gainNode); // Simpler chain without filter
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    oscillator.detune.value = detune; // detune is in cents

    // filterNode.type = 'lowpass';
    // filterNode.frequency.value = frequency * 2;
    // filterNode.Q.value = 1;

    const finalVolume = masterSfxVolume * volumeMultiplier;
    // Smooth gain changes to prevent clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime); // Start silent
    gainNode.gain.linearRampToValueAtTime(finalVolume, ctx.currentTime + 0.01); // Quick ramp up

    if (fadeOut) {
      gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime + duration - 0.05); // Hold volume
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    } else {
      // For no fadeOut, ensure it ends abruptly but cleanly
      gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime + duration - 0.01);
      gainNode.gain.linearRampToValueAtTime(0.00001, ctx.currentTime + duration); // Quick ramp down
    }

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  // }, 0);
}


// --- Silhouette, Math, Color, and other Utilities ---
// (Keep all your other existing utility functions: hexToRgb, generateSilhouettePoints, drawSilhouette, etc. exactly as they were)
// ... (paste the rest of your utils.ts content here, from hexToRgb downwards) ...
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

// Remove old BGM exports not used anymore if BGM is entirely HTMLAudioElement based
// export {
//   // audioContext, // Keep if playTone or other direct AudioContext uses remain
//   // masterSfxVolume, // Keep as it's used by playSoundBuffer / playTone
//   // masterBgmVolume, // Keep as it's used by HTMLAudioElement for BGM
//   // musicIntensity // If you remove adaptive BGM, remove this.
// };