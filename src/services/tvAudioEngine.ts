/**
 * TV Broadcast Audio Engine using Web Audio API
 * Generates realistic broadcast sound effects and music for Indian TV channels:
 * - Telugu Action Cinema (Pushpa / Allu Arjun): Mass cinematic drums, bass, and brass
 * - Live Sports (Star Sports Cricket): Stadium crowd cheer, bat sounds, commentary tone
 * - TV9 Telugu News: Broadcast theme jingle, news ticker pings
 * - Gemini Movies (Baahubali): Epic orchestral brass & war drums
 */

class TVAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private currentChannelId = '105';
  private timerId: any = null;

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  public async resumeAudioContext(): Promise<boolean> {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
        return true;
      } catch (e) {
        return false;
      }
    }
    return Boolean(this.ctx);
  }

  public setVolume(volumePercent: number, isMuted: boolean) {
    if (!this.masterGain || !this.ctx) return;
    const gainValue = isMuted ? 0 : Math.max(0, Math.min(1, volumePercent / 100)) * 0.35;
    this.masterGain.gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.05);
  }

  public startChannelAudio(channelId: string, volumePercent: number, isMuted: boolean) {
    this.initContext();
    this.currentChannelId = channelId;
    this.setVolume(volumePercent, isMuted);

    if (this.isRunning) {
      this.stopChannelAudio();
    }

    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.isRunning = true;

    // Start channel specific sound loop
    if (channelId === '105') {
      this.playTeluguActionScore(); // Allu Arjun Pushpa mass action sound
    } else if (channelId === '301') {
      this.playCricketStadiumAudio(); // Star Sports cricket crowd & match sounds
    } else if (channelId === '401') {
      this.playNewsThemeAudio(); // TV9 news theme & anchor audio tones
    } else {
      this.playCinemaScore(); // General blockbuster music
    }
  }

  public stopChannelAudio() {
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Channel 105: Pushpa - Mass Action Tribal & Dholak Rhythmic Beats
   */
  private playTeluguActionScore() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    let step = 0;
    const bpm = 115;
    const intervalMs = (60 / bpm / 2) * 1000;

    const playBeat = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // Heavy South Indian Cinema Bass Kick / Dholak on steps 0, 3, 6, 8
      if (step % 4 === 0 || step % 8 === 6) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(38, t + 0.22);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.26);
      }

      // Snare / Slap accent
      if (step % 8 === 4) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      // Atmospheric Synth Brass Chord progression
      if (step % 16 === 0) {
        const notes = [65.41, 77.78, 98.0, 116.54]; // C2, Eb2, G2, Bb2 (Dramatic Minor)
        notes.forEach((freq) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 1.9);
        });
      }

      step++;
    };

    this.timerId = setInterval(playBeat, intervalMs);
    playBeat();
  }

  /**
   * Channel 301: Star Sports Cricket - Stadium Crowd Cheers & Commentary
   */
  private playCricketStadiumAudio() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    // Crowd ambient noise generator (pink noise filtered)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const crowdGain = this.ctx.createGain();
    crowdGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(crowdGain);
    crowdGain.connect(this.masterGain);
    whiteNoise.start();

    // Occasional cricket stadium horns and cheer swell
    let cycle = 0;
    this.timerId = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      cycle++;

      if (cycle % 3 === 0) {
        // Cheer swell
        crowdGain.gain.setTargetAtTime(0.45, t, 0.4);
        crowdGain.gain.setTargetAtTime(0.2, t + 1.2, 0.6);

        // Bat strike click sound
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.06);
      }
    }, 2500);
  }

  /**
   * Channel 401: TV9 Telugu News - Prime Time Newsroom Jingle
   */
  private playNewsThemeAudio() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    let tick = 0;
    this.timerId = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // News broadcast ticker blips
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(tick % 2 === 0 ? 880 : 1100, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.1);

      // Low dramatic news pulse every 4 beats
      if (tick % 4 === 0) {
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'triangle';
        sub.frequency.setValueAtTime(65, t);
        subGain.gain.setValueAtTime(0.3, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(t);
        sub.stop(t + 0.45);
      }
      tick++;
    }, 1000);
  }

  /**
   * Other Cinema Channels (Gemini Movies, Star Gold)
   */
  private playCinemaScore() {
    if (!this.ctx || !this.masterGain || !this.isRunning) return;

    let beat = 0;
    this.timerId = setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;

      // Ambient orchestral pads
      const freqs = [130.81, 164.81, 196.0]; // C-E-G
      freqs.forEach((f) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.06, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 1.3);
      });
      beat++;
    }, 1400);
  }
}

export const tvAudioEngine = new TVAudioEngine();
