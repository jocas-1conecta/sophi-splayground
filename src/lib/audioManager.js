/**
 * Audio Manager — Sophi's Playground
 *
 * Lightweight sound effect system with:
 * - Lazy loading (sounds load on first play)
 * - Global mute toggle (persists in localStorage)
 * - Volume control per sound type
 * - Multiple simultaneous sounds via audio pool
 */

const STORAGE_KEY = 'sophis_sound_muted';

// Sound definitions: id → { src, volume }
const SOUNDS = {
  click:     { src: '/sounds/click.mp3',     volume: 0.4 },
  move:      { src: '/sounds/move.mp3',      volume: 0.5 },
  win:       { src: '/sounds/win.mp3',       volume: 0.6 },
  lose:      { src: '/sounds/lose.mp3',      volume: 0.5 },
  draw:      { src: '/sounds/draw.mp3',      volume: 0.5 },
  correct:   { src: '/sounds/correct.mp3',   volume: 0.5 },
  wrong:     { src: '/sounds/wrong.mp3',     volume: 0.4 },
  countdown: { src: '/sounds/countdown.mp3', volume: 0.3 },
  basta:     { src: '/sounds/basta.mp3',     volume: 0.6 },
  unlock:    { src: '/sounds/unlock.mp3',    volume: 0.6 },
  spin:      { src: '/sounds/spin.mp3',      volume: 0.4 },
  reveal:    { src: '/sounds/reveal.mp3',    volume: 0.4 },
};

// Audio cache
const audioCache = {};

// State
let muted = false;

// Init from localStorage
try {
  muted = localStorage.getItem(STORAGE_KEY) === 'true';
} catch {
  // ignore
}

/**
 * Play a sound effect by ID
 * @param {string} soundId - One of the SOUNDS keys
 */
export function playSound(soundId) {
  if (muted) return;

  const def = SOUNDS[soundId];
  if (!def) return;

  try {
    // Create or clone audio element
    if (!audioCache[soundId]) {
      audioCache[soundId] = new Audio(def.src);
      audioCache[soundId].volume = def.volume;
    }

    const audio = audioCache[soundId];

    // If already playing, clone it for overlapping sounds
    if (!audio.paused) {
      const clone = audio.cloneNode();
      clone.volume = def.volume;
      clone.play().catch(() => {});
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser blocked autoplay — ignore silently
    });
  } catch {
    // Audio not available — ignore
  }
}

/**
 * Toggle mute state
 * @returns {boolean} New mute state
 */
export function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    // ignore
  }
  return muted;
}

/**
 * Check if muted
 */
export function isMuted() {
  return muted;
}

/**
 * Set mute state explicitly
 */
export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem(STORAGE_KEY, String(muted));
  } catch {
    // ignore
  }
}
