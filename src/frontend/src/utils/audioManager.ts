// Web Audio API-based audio manager for game sounds
class AudioManager {
  private ctx: AudioContext | null = null;
  private engineOscillator: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private skidGain: GainNode | null = null;
  private skidBuffer: AudioBuffer | null = null;
  private skidSource: AudioBufferSourceNode | null = null;
  private bgMusicNodes: OscillatorNode[] = [];
  private bgGain: GainNode | null = null;
  private isRunning = false;
  private _muted = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  startEngine(): void {
    if (this.isRunning) return;
    const ctx = this.getCtx();

    // Create oscillator for engine hum
    this.engineOscillator = ctx.createOscillator();
    this.engineOscillator.type = "sawtooth";
    this.engineOscillator.frequency.value = 80;

    // Distortion for engine character
    const distortion = ctx.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(50);

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = this._muted ? 0 : 0.08;

    this.engineOscillator.connect(distortion);
    distortion.connect(this.engineGain);
    this.engineGain.connect(ctx.destination);
    this.engineOscillator.start();
    this.isRunning = true;
  }

  updateEngine(speedKmh: number, isNitro: boolean): void {
    if (!this.engineOscillator || !this.engineGain || this._muted) return;
    const ctx = this.getCtx();
    // Map speed to frequency: idle ~80Hz, max speed ~400Hz
    const baseFreq = 80 + (speedKmh / 440) * 320;
    const freq = isNitro ? baseFreq * 1.15 : baseFreq;
    this.engineOscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);

    // Volume scales with speed
    const vol = this._muted
      ? 0
      : Math.min(0.12, 0.04 + (speedKmh / 440) * 0.08);
    this.engineGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
  }

  stopEngine(): void {
    if (!this.isRunning) return;
    this.engineOscillator?.stop();
    this.engineOscillator?.disconnect();
    this.engineOscillator = null;
    this.engineGain?.disconnect();
    this.engineGain = null;
    this.isRunning = false;
  }

  playSkid(intensity: number): void {
    if (this._muted) return;
    const ctx = this.getCtx();

    // Stop existing skid
    if (this.skidSource) {
      try {
        this.skidSource.stop();
      } catch {
        /* ignore */
      }
      this.skidSource = null;
    }

    // Create white noise buffer for tire skid
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    this.skidSource = ctx.createBufferSource();
    this.skidSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.5;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(intensity * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    this.skidSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    this.skidSource.start();
  }

  playCrash(): void {
    if (this._muted) return;
    const ctx = this.getCtx();

    // Thump + noise burst for crash
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.4;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }

  startBackgroundMusic(): void {
    if (this._muted) return;
    const ctx = this.getCtx();
    this.bgGain = ctx.createGain();
    this.bgGain.gain.value = 0.03;
    this.bgGain.connect(ctx.destination);

    // Simple pulsing arpeggio pattern for atmosphere
    const notes = [110, 138.6, 164.8, 220];
    const beatTime = 0.5;
    let startTime = ctx.currentTime + 0.1;

    const scheduleArp = () => {
      if (!this.bgGain || !this.ctx) return;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, startTime + i * beatTime);
        gain.gain.linearRampToValueAtTime(1, startTime + i * beatTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + i * beatTime + beatTime * 0.8,
        );
        osc.connect(gain);
        gain.connect(this.bgGain!);
        osc.start(startTime + i * beatTime);
        osc.stop(startTime + i * beatTime + beatTime);
        this.bgMusicNodes.push(osc);
      });
      startTime += notes.length * beatTime;
    };

    // Schedule 8 bars
    for (let i = 0; i < 8; i++) scheduleArp();

    // Repeat
    setTimeout(
      () => this.startBackgroundMusic(),
      notes.length * beatTime * 8 * 1000 + 100,
    );
  }

  stopBackgroundMusic(): void {
    for (const n of this.bgMusicNodes) {
      try {
        n.stop();
      } catch {
        /* ignore */
      }
    }
    this.bgMusicNodes = [];
    this.bgGain?.disconnect();
    this.bgGain = null;
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (muted) {
      this.engineGain?.gain.setTargetAtTime(
        0,
        this.ctx?.currentTime ?? 0,
        0.05,
      );
      this.bgGain?.gain.setTargetAtTime(0, this.ctx?.currentTime ?? 0, 0.05);
    }
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const samples = 256;
    const buffer = new ArrayBuffer(samples * 4);
    const curve = new Float32Array(buffer);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  resume(): void {
    this.ctx?.resume();
  }
}

export const audioManager = new AudioManager();
