/**
 * Sound Generator for Sophi's Playground
 *
 * Run with: node scripts/generate-sounds.js
 *
 * Creates simple WAV files for game sound effects.
 * These are placeholder sounds — replace with proper MP3s for production.
 */

const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds');

// Ensure directory
if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

/**
 * Generate a simple WAV file with a tone
 */
function generateWav(filename, { frequency = 440, duration = 0.3, type = 'sine', volume = 0.5, fadeOut = true } = {}) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(1, 22);  // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);  // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Generate samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (type === 'sine') {
      sample = Math.sin(2 * Math.PI * frequency * t);
    } else if (type === 'square') {
      sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
    } else if (type === 'triangle') {
      sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
    }

    // Fade out
    const envelope = fadeOut ? 1 - (i / numSamples) : 1;
    sample *= volume * envelope;

    // Clamp
    sample = Math.max(-1, Math.min(1, sample));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  const filePath = path.join(SOUNDS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// Generate chord (multiple frequencies)
function generateChord(filename, frequencies, { duration = 0.5, volume = 0.4, fadeOut = true } = {}) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV header (same as above)
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (const freq of frequencies) {
      sample += Math.sin(2 * Math.PI * freq * t);
    }
    sample /= frequencies.length;
    const envelope = fadeOut ? 1 - (i / numSamples) : 1;
    sample *= volume * envelope;
    sample = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(SOUNDS_DIR, filename), buffer);
  console.log(`✅ ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

console.log('🔊 Generating sounds...\n');

// Click — short high pop
generateWav('click.mp3', { frequency: 800, duration: 0.08, volume: 0.3 });

// Move — medium plop
generateWav('move.mp3', { frequency: 500, duration: 0.12, volume: 0.4 });

// Win — happy ascending chord
generateChord('win.mp3', [523, 659, 784], { duration: 0.8, volume: 0.5 });

// Lose — sad descending
generateChord('lose.mp3', [392, 330, 262], { duration: 0.6, volume: 0.3 });

// Draw — neutral chime
generateChord('draw.mp3', [440, 554], { duration: 0.4, volume: 0.3 });

// Correct — bright ding
generateWav('correct.mp3', { frequency: 880, duration: 0.2, volume: 0.4 });

// Wrong — low buzz
generateWav('wrong.mp3', { frequency: 200, duration: 0.25, type: 'square', volume: 0.2 });

// Countdown — tick
generateWav('countdown.mp3', { frequency: 600, duration: 0.05, volume: 0.25 });

// Basta — horn
generateChord('basta.mp3', [350, 440, 523], { duration: 0.5, volume: 0.5, fadeOut: false });

// Unlock — sparkle cascade
generateChord('unlock.mp3', [660, 880, 1100, 1320], { duration: 0.7, volume: 0.4 });

// Spin — mechanical whir
generateWav('spin.mp3', { frequency: 300, duration: 1.0, type: 'triangle', volume: 0.2 });

// Reveal — swoosh
generateWav('reveal.mp3', { frequency: 600, duration: 0.15, type: 'triangle', volume: 0.3 });

console.log('\n✨ All 12 sounds generated!');
