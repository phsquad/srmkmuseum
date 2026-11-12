/**
 * ============================================================================
 * ЦЕРЕМОНИЯ «МИНУТА МОЛЧАНИЯ»: js/memorial-ceremony.js (v1.0 Ceremony Master)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Интерактивное затемнение пространства и фокус на Вечном Огне
 * 2. 60-секундный прецизионный метроном через Web Audio API
 * 3. Торжественный поминальный благовест / набат по завершении
 * 4. Начисление опыта (XP) и бейджа «Хранитель тишины»
 * ============================================================================
 */

(function() {
  'use strict';

  const MemorialCeremony = {
    overlayEl: null,
    timerId: null,
    secondsLeft: 60,
    isActive: false,

    init() {
      // Глобальный слушатель кнопок запуска минуты молчания
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btnStartSilence, .btn-start-silence, [data-start-silence]');
        if (btn) {
          e.preventDefault();
          this.start();
        }
      });
    },

    start() {
      if (this.isActive) return;
      this.isActive = true;
      this.secondsLeft = 60;
      this.getOrCreateModal();

      this.overlayEl.classList.add('active');
      this.overlayEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      this.updateDisplay();

      // Первый удар метронома
      if (window.SoundEngine) {
        window.SoundEngine.playMetronomeTick();
      }

      this.timerId = setInterval(() => {
        this.secondsLeft--;
        this.updateDisplay();

        if (window.SoundEngine && this.secondsLeft > 0) {
          window.SoundEngine.playMetronomeTick();
        }

        if (this.secondsLeft <= 0) {
          this.finish();
        }
      }, 1000);
    },

    updateDisplay() {
      const timerNum = this.overlayEl?.querySelector('#silenceTimerNumber');
      const progressRing = this.overlayEl?.querySelector('#silenceProgressCircle');
      if (timerNum) {
        const secs = this.secondsLeft < 10 ? `0${this.secondsLeft}` : `${this.secondsLeft}`;
        timerNum.textContent = `00:${secs}`;
      }
      if (progressRing) {
        // Окружность = 2 * PI * r = 2 * 3.14159 * 70 ~= 440
        const circumference = 440;
        const offset = circumference - (this.secondsLeft / 60) * circumference;
        progressRing.style.strokeDashoffset = offset;
      }
    },

    finish() {
      clearInterval(this.timerId);
      this.timerId = null;

      // Торжественный поминальный набат
      if (window.SoundEngine) {
        window.SoundEngine.playBell(174, 4.0);
        setTimeout(() => window.SoundEngine.playBell(196, 4.5), 1400);
        setTimeout(() => window.SoundEngine.playBell(146, 5.0), 2800);
      }

      const timerNum = this.overlayEl?.querySelector('#silenceTimerNumber');
      const title = this.overlayEl?.querySelector('#silenceModalTitle');
      const desc = this.overlayEl?.querySelector('#silenceModalDesc');
      const actionBtn = this.overlayEl?.querySelector('#silenceCompleteBtn');
      const flame = this.overlayEl?.querySelector('.silence-flame-wrapper');

      if (timerNum) timerNum.textContent = 'ВЕЧНАЯ ПАМЯТЬ';
      if (title) title.innerHTML = '<span style="color:#dfba6d;">БЕССМЕРТЕН ТВОЙ ПОДВИГ</span>';
      if (desc) desc.textContent = 'Минута молчания завершена. Благодарим вас за сохранение священной памяти о 20 героях Ставропольского края.';
      if (flame) flame.classList.add('flame-glorious');
      if (actionBtn) {
        actionBtn.style.display = 'inline-block';
        actionBtn.textContent = 'Сохранить в сердце (Завершить)';
      }

      // Зажжение поминальной свечи в CloudSync
      if (window.CloudSync && typeof window.CloudSync.incrementCounter === 'function') {
        window.CloudSync.incrementCounter('candles_count');
      }

      // Разблокировка достижения в AchievementsEngine
      if (window.AchievementsEngine) {
        if (typeof window.AchievementsEngine.trackSilenceCompleted === 'function') {
          window.AchievementsEngine.trackSilenceCompleted();
        } else if (typeof window.AchievementsEngine.unlockBadge === 'function') {
          window.AchievementsEngine.unlockBadge('badge_silence');
        }
      }
      if (window.MemorialToast) {
        setTimeout(() => {
          MemorialToast.show('🎖 Награда получена: «Хранитель тишины» (+100 XP)', 'success');
        }, 1200);
      }
    },

    cancel() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.isActive = false;
      if (this.overlayEl) {
        this.overlayEl.classList.remove('active');
        this.overlayEl.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    },

    getOrCreateModal() {
      if (this.overlayEl) return this.overlayEl;

      const modal = document.createElement('div');
      modal.id = 'memorialSilenceModal';
      modal.className = 'memorial-silence-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Всероссийская Минута молчания');

      modal.innerHTML = `
        <div class="silence-backdrop-aura"></div>
        <div class="silence-container">
          <button type="button" class="silence-close-btn" id="silenceCancelBtn" title="Прервать церемонию">&times;</button>
          
          <div class="silence-flame-wrapper">
            <div class="silence-flame-glow"></div>
            <div class="silence-flame-core">🕯️</div>
          </div>

          <div class="silence-timer-wrap">
            <svg class="silence-svg-ring" width="160" height="160" viewBox="0 0 160 160">
              <circle class="ring-bg" cx="80" cy="80" r="70" />
              <circle class="ring-fg" id="silenceProgressCircle" cx="80" cy="80" r="70" />
            </svg>
            <div class="silence-timer-text" id="silenceTimerNumber">01:00</div>
          </div>

          <h2 class="silence-title" id="silenceModalTitle">МИНУТА ПАМЯТИ И СКОРБИ</h2>
          <p class="silence-desc" id="silenceModalDesc">
            Склоним головы перед бессмертным подвигом 20 выпускников колледжа, шагнувших в вечность во имя мира и Отечества.
          </p>

          <button type="button" class="silence-complete-btn" id="silenceCompleteBtn" style="display:none;">
            Завершить
          </button>
        </div>
      `;

      document.body.appendChild(modal);
      this.overlayEl = modal;

      modal.querySelector('#silenceCancelBtn')?.addEventListener('click', () => this.cancel());
      modal.querySelector('#silenceCompleteBtn')?.addEventListener('click', () => this.cancel());

      return modal;
    }
  };

  MemorialCeremony.init();
  window.MemorialCeremony = MemorialCeremony;
})();
