// Web Audio API — Genre-based percussion per color
// Red    → Hard Techno  (distorted kick)
// Orange → House        (punchy 4/4 kick)
// Yellow → Acid         (303-style blip)
// Green  → Jungle/DnB  (amen break hit)
// Blue   → Minimal/Deep (sub bass thud)
// Purple → Industrial   (metallic noise hit)

class GenreSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  // ── HARD TECHNO kick ── distorted, punchy, heavy sub
  private playHardTechnoKick() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.12);

    const dist = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = ((Math.PI + 400) * x) / (Math.PI + 400 * Math.abs(x));
    }
    dist.curve = curve;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // ── HOUSE kick ── clean, warm, bouncy
  private playHouseKick() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.Q.setValueAtTime(1.5, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // ── ACID 303 blip ── resonant filter sweep, square wave
  private playAcid303() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(220, now + 0.04);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(18, now);
    filter.frequency.setValueAtTime(80, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // ── JUNGLE amen snare hit ── pitched noise burst, fast
  private playJungleHit() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // Noise burst (snare body)
    const bufSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2200, now);
    bandpass.Q.setValueAtTime(0.8, now);

    // Pitched tone (snare crack)
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.18);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // ── MINIMAL / DEEP TECHNO sub bass thud ──
  private playSubBass() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.6, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-6, now);
    compressor.ratio.setValueAtTime(4, now);

    osc.connect(gain);
    gain.connect(compressor);
    compressor.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // ── INDUSTRIAL metallic crash ── harsh noise + metallic ring
  private playIndustrialHit() {
    const ctx = this.ctx!;
    const now = ctx.currentTime;

    // White noise burst
    const bufSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // High-pass for metallic character
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(3000, now);
    hp.Q.setValueAtTime(2, now);

    // Metallic ring mod
    const ringOsc = ctx.createOscillator();
    ringOsc.type = 'square';
    ringOsc.frequency.setValueAtTime(1200, now);
    ringOsc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0.3, now);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Distortion
    const dist = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.tanh(x * 8);
    }
    dist.curve = curve;

    noise.connect(hp);
    hp.connect(noiseGain);
    noiseGain.connect(dist);
    dist.connect(ctx.destination);

    ringOsc.connect(ringGain);
    ringGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.3);
    ringOsc.start(now);
    ringOsc.stop(now + 0.3);
  }

  public playColorNote(index: number) {
    this.initCtx();
    if (!this.ctx) return;

    switch (index) {
      case 0: this.playHardTechnoKick(); break;  // Red    → Hard Techno
      case 1: this.playHouseKick();       break;  // Orange → House
      case 2: this.playAcid303();         break;  // Yellow → Acid
      case 3: this.playJungleHit();       break;  // Green  → Jungle
      case 4: this.playSubBass();         break;  // Blue   → Minimal/Deep
      case 5: this.playIndustrialHit();   break;  // Purple → Industrial
    }
  }
}

export const synth = new GenreSynth();
