/**
 * ============================================================================
 * МЕМОРИАЛЬНЫЙ АКУСТИЧЕСКИЙ ДВИЖОК: js/sound-engine.js (v1.0 Synthesizer)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Синтез метронома минуты молчания (Web Audio API)
 * 2. Синтез мемориального колокольного звона / набата
 * 3. Акустический отклик зажжения свечей и лампад памяти
 * 4. Звуковой эффект шелеста страниц для 3D-фолианта
 * 5. Торжественный аккорд разблокировки наградных орденов
 * ============================================================================
 */

(function() {
  'use strict';

  const SoundEngine = {
    ctx: null,
    enabled: true,

    init() {
      const saved = localStorage.getItem('srmk_sound_enabled');
      this.enabled = saved !== null ? saved === 'true' : true;
    },

    getAudioContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },

    isEnabled() {
      return this.enabled;
    },

    toggle() {
      this.enabled = !this.enabled;
      try {
        localStorage.setItem('srmk_sound_enabled', String(this.enabled));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('srmk-sound-toggle', { detail: { enabled: this.enabled } }));
      if (this.enabled) {
        this.playCandleIgnite();
      }
      return this.enabled;
    },

    /**
     * 1. Метроном Минуты Молчания (Четкий траурный клик 60 BPM)
     */
    playMetronomeTick() {
      if (!this.enabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.045);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    },

    /**
     * 2. Мемориальный благовест / Набат (Глубокий колокол с гармониками)
     */
    playBell(freq = 196, duration = 3.2) {
      if (!this.enabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28, t);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      masterGain.connect(ctx.destination);

      // Гармоники колокола: основной тон + октава + малая терция + квинта
      const harmonics = [1, 2.01, 2.41, 2.98, 4.15];
      const gains = [0.45, 0.25, 0.18, 0.12, 0.08];

      harmonics.forEach((h, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * h, t);

        g.gain.setValueAtTime(gains[i], t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration * (1 - i * 0.12));

        osc.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + duration);
      });
    },

    /**
     * 3. Зажжение фитиля свечи или лампады (Теплый шорох пламени)
     */
    playCandleIgnite() {
      if (!this.enabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.linearRampToValueAtTime(400, t + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
    },

    /**
     * 4. Шелест страницы фолианта
     */
    playPageFlip() {
      if (!this.enabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.16;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.Q.setValueAtTime(1.8, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
    },

    /**
     * 5. Торжественный аккорд разблокировки награды / сертификата
     */
    playAchievementChime() {
      if (!this.enabled) return;
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const t = ctx.currentTime;
      // Трезвучие: D5 (587.33) -> F#5 (739.99) -> A5 (880.00)
      const notes = [587.33, 739.99, 880.0];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + i * 0.09;
        const dur = 1.2;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    }
  };

  SoundEngine.init();
  window.SoundEngine = SoundEngine;
})();
