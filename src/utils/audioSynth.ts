// Web Audio API Ambient Synthesizer for ALLWONE
// Musical scale aligned with the 6 spectrum colors:
// Red (C4), Orange (D4), Yellow (E4), Green (G4), Blue (A4), Purple (C5)

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private notes = [
    { name: 'Red', freq: 261.63, color: '#d03736' },     // C4
    { name: 'Orange', freq: 293.66, color: '#e58440' },  // D4
    { name: 'Yellow', freq: 329.63, color: '#f5da58' },  // E4
    { name: 'Green', freq: 392.00, color: '#479558' },   // G4
    { name: 'Blue', freq: 440.00, color: '#1a6fa3' },    // A4
    { name: 'Purple', freq: 523.25, color: '#6f3877' },  // C5
  ];

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playColorNote(index: number, duration: number = 0.6) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const note = this.notes[index % this.notes.length];
    const now = this.ctx.currentTime;

    // Oscillator 1 (Main tone - warm sine)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(note.freq, now);

    // Oscillator 2 (Subtle harmonic overtone - triangle)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(note.freq * 2, now);

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    // Gain envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Connections
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  public playChord(indices: number[] = [0, 2, 4], duration: number = 1.2) {
    if (this.isMuted) return;
    indices.forEach((idx, i) => {
      setTimeout(() => {
        this.playColorNote(idx, duration);
      }, i * 60);
    });
  }
}

export const synth = new AudioSynthesizer();
