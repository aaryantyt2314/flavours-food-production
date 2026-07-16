const fs = require('fs');
const path = require('path');

const soundsDir = path.join(__dirname, '..', 'public', 'sounds');
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

const sampleRate = 22050;
const duration = 0.5; // seconds
const numSamples = sampleRate * duration;
const bitsPerSample = 8;
const numChannels = 1;
const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const subChunk2Size = numSamples * numChannels * (bitsPerSample / 8);
const chunkSize = 36 + subChunk2Size;

const buffer = Buffer.alloc(44 + subChunk2Size);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(chunkSize, 4);
buffer.write('WAVE', 8);

// fmt chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);

// data chunk
buffer.write('data', 36);
buffer.writeUInt32LE(subChunk2Size, 40);

// Generate sine wave (880Hz, fade out)
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const frequency = 880; // A5
  const sample = Math.round(128 + 127 * Math.sin(2 * Math.PI * frequency * t));
  const envelope = 1 - (i / numSamples);
  const adjustedSample = Math.round(128 + (sample - 128) * envelope);
  buffer.writeUInt8(adjustedSample, 44 + i);
}

fs.writeFileSync(path.join(soundsDir, 'notification.wav'), buffer);
console.log('Successfully generated notification.wav');
