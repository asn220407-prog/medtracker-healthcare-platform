/**
 * Pure Web Audio API Synthesizer Chime
 * C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) harmonic triad.
 * Zero external audio files or dependencies.
 */
export const playAdherenceChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playTone = (freq, delay, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      // Clean exponential decay envelope (no clicks)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    playTone(523.25, 0.0, 0.28);  // C5
    playTone(659.25, 0.14, 0.28); // E5
    playTone(783.99, 0.28, 0.42); // G5

    return true;
  } catch (err) {
    console.log('Audio chime auto-play restricted by browser gesture policy:', err);
    return false;
  }
};
