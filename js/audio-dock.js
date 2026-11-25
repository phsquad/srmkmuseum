/**
 * ============================================================================
 * СКВОЗНОЙ АУДИОПЛЕЕР МУЗЕЯ: js/audio-dock.js
 * Мемориальный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 *
 * Особенности:
 * - Сохраняет состояние { heroId, title, src, currentTime, isPlaying } в sessionStorage
 * - Корректно обрабатывает NotAllowedError браузера (кнопка «Продолжить с MM:SS»)
 * - Взаимно ставит на паузу TTSNarrator при запуске MP3
 * ============================================================================
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'srmk_audio_dock_state';

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const AudioDock = {
    audio: null,
    dockEl: null,
    state: {
      heroId: null,
      title: '',
      src: '',
      currentTime: 0,
      isPlaying: false
    },
    _lastSavedSec: -1,
    _blockedByAutoplay: false,

    init() {
      if (this.audio) return;
      this.audio = new Audio();
      this.audio.preload = 'metadata';

      this._createMarkup();
      this._bindAudioEvents();
      this._restoreState();

      window.addEventListener('pagehide', () => this._persistState());
    },

    _createMarkup() {
      if (document.getElementById('srmkAudioDock')) {
        this.dockEl = document.getElementById('srmkAudioDock');
        return;
      }
      const el = document.createElement('aside');
      el.id = 'srmkAudioDock';
      el.className = 'srmk-audio-dock';
      el.setAttribute('aria-label', 'Аудиогид мемориала');
      el.innerHTML = `
        <div class="srmk-dock-top">
          <div class="srmk-dock-meta">
            <div class="srmk-dock-label">Аудиоэкскурсия СРМК</div>
            <div class="srmk-dock-title" id="dockTrackTitle">Запись не выбрана</div>
          </div>
          <div class="srmk-dock-controls">
            <button type="button" class="srmk-icon-btn" id="dockPlayBtn" aria-label="Воспроизвести или пауза">▶</button>
            <button type="button" class="srmk-icon-btn" id="dockCloseBtn" aria-label="Закрыть плеер">&times;</button>
          </div>
        </div>
        <input type="range" class="srmk-dock-progress" id="dockProgress" min="0" max="100" value="0" aria-label="Позиция воспроизведения">
        <div class="srmk-dock-time">
          <span id="dockTimeCur">0:00</span>
          <span id="dockStatusHint"></span>
          <span id="dockTimeDur">0:00</span>
        </div>
      `;
      document.body.appendChild(el);
      this.dockEl = el;

      el.querySelector('#dockPlayBtn').addEventListener('click', () => {
        if (!this.state.src) return;
        if (this.audio.paused) {
          this.resume();
        } else {
          this.pause();
        }
      });

      el.querySelector('#dockCloseBtn').addEventListener('click', () => this.stop());

      el.querySelector('#dockProgress').addEventListener('input', (e) => {
        if (!Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
        const pct = Number(e.target.value) || 0;
        this.seek((pct / 100) * this.audio.duration);
      });
    },

    _bindAudioEvents() {
      this.audio.addEventListener('loadedmetadata', () => {
        if (this.state.currentTime > 0 && this.state.currentTime < this.audio.duration) {
          try { this.audio.currentTime = this.state.currentTime; } catch (_) {}
        }
        this._renderUI();
      });

      this.audio.addEventListener('timeupdate', () => {
        this.state.currentTime = this.audio.currentTime || 0;
        const curSec = Math.floor(this.state.currentTime);
        if (curSec !== this._lastSavedSec) {
          this._lastSavedSec = curSec;
          this._persistState();
        }
        this._renderUI();
      });

      this.audio.addEventListener('play', () => {
        this.state.isPlaying = true;
        this._blockedByAutoplay = false;
        if (global.TTSNarrator && typeof global.TTSNarrator.stop === 'function') {
          global.TTSNarrator.stop();
        }
        this._persistState();
        this._renderUI();
        window.dispatchEvent(new CustomEvent('srmk-audio-state', { detail: { ...this.state } }));
      });

      this.audio.addEventListener('pause', () => {
        this.state.isPlaying = false;
        this._persistState();
        this._renderUI();
        window.dispatchEvent(new CustomEvent('srmk-audio-state', { detail: { ...this.state } }));
      });

      this.audio.addEventListener('ended', () => {
        this.state.isPlaying = false;
        this.state.currentTime = 0;
        this._persistState();
        this._renderUI();
        window.dispatchEvent(new CustomEvent('srmk-audio-state', { detail: { ...this.state } }));
      });
    },

    _persistState() {
      try {
        if (!this.state.src) {
          sessionStorage.removeItem(STORAGE_KEY);
          return;
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (_) {}
    },

    _restoreState() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || !saved.src) return;
        this.state = {
          heroId: saved.heroId || null,
          title: saved.title || 'Аудиогид',
          src: saved.src,
          currentTime: Number(saved.currentTime) || 0,
          isPlaying: Boolean(saved.isPlaying)
        };
        this.audio.src = this.state.src;
        this.dockEl.classList.add('visible');
        this._renderUI();

        if (this.state.isPlaying) {
          const playPromise = this.audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              // Browser autoplay policy blocked reload resume -> show explicit tap-to-resume state
              this.state.isPlaying = false;
              this._blockedByAutoplay = true;
              this._renderUI();
            });
          }
        }
      } catch (_) {}
    },

    play(heroId, src, title) {
      if (!this.audio) this.init();
      if (!src) return;

      if (this.state.src === src && !this.audio.paused) {
        this.pause();
        return;
      }

      if (this.state.src !== src) {
        this.state = {
          heroId: heroId || null,
          title: title || 'Аудиоэкскурсия',
          src,
          currentTime: 0,
          isPlaying: true
        };
        this.audio.src = src;
      }

      this.dockEl.classList.add('visible');
      this._blockedByAutoplay = false;
      const p = this.audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this.state.isPlaying = false;
          this._blockedByAutoplay = true;
          this._renderUI();
        });
      }
      this._persistState();
      this._renderUI();
    },

    pause() {
      if (!this.audio) return;
      this.audio.pause();
      this.state.isPlaying = false;
      this._persistState();
      this._renderUI();
    },

    resume() {
      if (!this.audio || !this.state.src) return;
      this._blockedByAutoplay = false;
      const p = this.audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          this._blockedByAutoplay = true;
          this._renderUI();
        });
      }
    },

    seek(sec) {
      if (!this.audio || !Number.isFinite(sec)) return;
      this.audio.currentTime = Math.max(0, sec);
      this.state.currentTime = this.audio.currentTime;
      this._persistState();
      this._renderUI();
    },

    stop() {
      if (!this.audio) return;
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.state = { heroId: null, title: '', src: '', currentTime: 0, isPlaying: false };
      this._blockedByAutoplay = false;
      this.dockEl.classList.remove('visible');
      this._persistState();
      window.dispatchEvent(new CustomEvent('srmk-audio-state', { detail: { ...this.state } }));
    },

    _renderUI() {
      if (!this.dockEl) return;
      const titleEl = this.dockEl.querySelector('#dockTrackTitle');
      const playBtn = this.dockEl.querySelector('#dockPlayBtn');
      const progress = this.dockEl.querySelector('#dockProgress');
      const curEl = this.dockEl.querySelector('#dockTimeCur');
      const durEl = this.dockEl.querySelector('#dockTimeDur');
      const hintEl = this.dockEl.querySelector('#dockStatusHint');

      if (titleEl) titleEl.textContent = this.state.title || 'Аудиоэкскурсия';
      const dur = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
      const cur = this.state.currentTime || 0;

      if (curEl) curEl.textContent = formatTime(cur);
      if (durEl) durEl.textContent = formatTime(dur);
      if (progress) progress.value = dur > 0 ? String((cur / dur) * 100) : '0';

      if (playBtn) {
        if (this._blockedByAutoplay) {
          playBtn.textContent = '▶';
          playBtn.title = `Продолжить с ${formatTime(cur)}`;
        } else {
          playBtn.textContent = this.state.isPlaying ? '⏸' : '▶';
        }
      }
      if (hintEl) {
        hintEl.textContent = this._blockedByAutoplay ? `Продолжить с ${formatTime(cur)}` : '';
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AudioDock.init());
  } else {
    AudioDock.init();
  }

  global.AudioDock = AudioDock;
})(typeof window !== 'undefined' ? window : globalThis);
