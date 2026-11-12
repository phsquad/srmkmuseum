/**
 * ============================================================================
 * ПОЛНОЭКРАННЫЙ РЕЖИМ «УРОК МУЖЕСТВА»: js/lesson-cinema.js (v1.0 Cinema Master)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Интерактивная полноэкранная презентация 16:9 для проекторов и интерактивных досок
 * 2. 5 структурированных этапов занятия (ФГОС СПО • 45 минут)
 * 3. Навигация с пульта и клавиатуры (Стрелки, Пробел, Esc)
 * 4. Встроенная Минута молчания и QR-код для смартфонов студентов
 * ============================================================================
 */

(function() {
  'use strict';

  const LessonCinema = {
    overlayEl: null,
    currentSlide: 0,
    totalSlides: 5,
    timerInterval: null,
    secondsElapsed: 0,
    isActive: false,

    init() {
      // Горячая клавиша F или F11
      document.addEventListener('keydown', (e) => {
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
        if (isInput) return;

        if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
          // Если не в Spotlight и не в модалке
          const modalActive = document.querySelector('.modal.active, .spotlight-modal-overlay.active, .memorial-card-modal.active');
          if (!modalActive) {
            e.preventDefault();
            this.toggle();
          }
        } else if (e.key === 'Escape' && this.isActive) {
          this.stop();
        } else if (this.isActive) {
          if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.nextSlide();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prevSlide();
          }
        }
      });

      // Глобальный слушатель кнопок запуска
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-start-cinema], .btn-start-cinema');
        if (trigger) {
          e.preventDefault();
          this.start();
        }
      });
    },

    toggle() {
      if (this.isActive) this.stop();
      else this.start();
    },

    start() {
      if (this.isActive) return;
      this.isActive = true;
      this.currentSlide = 0;
      this.getOrCreateOverlay();

      this.overlayEl.classList.add('active');
      this.overlayEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Запрос полного экрана (браузерный Fullscreen API)
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch (e) {}

      this.startLessonTimer();
      this.showSlide(0);

      if (window.AchievementsEngine && typeof window.AchievementsEngine.trackLessonCinemaStarted === 'function') {
        window.AchievementsEngine.trackLessonCinemaStarted();
      }

      if (window.MemorialToast) {
        MemorialToast.show('🎬 Полноэкранный режим «Урок Мужества» активен. Навигация: Стрелки / Пробел, Esc для выхода.', 'info');
      }
    },

    stop() {
      if (!this.isActive) return;
      this.isActive = false;

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      if (this.overlayEl) {
        this.overlayEl.classList.remove('active');
        this.overlayEl.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';

      if (document.fullscreenElement) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch (e) {}
      }
    },

    startLessonTimer() {
      this.secondsElapsed = 0;
      this.updateTimerDisplay();

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.secondsElapsed++;
        this.updateTimerDisplay();
      }, 1000);
    },

    updateTimerDisplay() {
      const el = this.overlayEl?.querySelector('#cinemaLessonTimer');
      if (!el) return;
      const mins = Math.floor(this.secondsElapsed / 60);
      const secs = this.secondsElapsed % 60;
      const mStr = mins < 10 ? `0${mins}` : `${mins}`;
      const sStr = secs < 10 ? `0${secs}` : `${secs}`;
      el.textContent = `${mStr}:${sStr} / 45:00`;
    },

    nextSlide() {
      if (this.currentSlide < this.totalSlides - 1) {
        this.showSlide(this.currentSlide + 1);
      }
    },

    prevSlide() {
      if (this.currentSlide > 0) {
        this.showSlide(this.currentSlide - 1);
      }
    },

    showSlide(idx) {
      this.currentSlide = idx;
      const slides = this.overlayEl.querySelectorAll('.cinema-slide');
      slides.forEach((sl, i) => {
        if (i === idx) sl.classList.add('active');
        else sl.classList.remove('active');
      });

      const counter = this.overlayEl.querySelector('#cinemaSlideCounter');
      if (counter) counter.textContent = `Этап ${idx + 1} из ${this.totalSlides}`;

      const btnPrev = this.overlayEl.querySelector('#btnCinemaPrev');
      const btnNext = this.overlayEl.querySelector('#btnCinemaNext');
      if (btnPrev) btnPrev.disabled = idx === 0;
      if (btnNext) btnNext.textContent = idx === this.totalSlides - 1 ? 'Завершить ✕' : 'Далее ▶';
    },

    getOrCreateOverlay() {
      if (this.overlayEl) return this.overlayEl;

      const overlay = document.createElement('div');
      overlay.id = 'lessonCinemaOverlay';
      overlay.className = 'lesson-cinema-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Полноэкранный презентационный режим Урока Мужества');

      overlay.innerHTML = `
        <!-- ВЕРХНЯЯ СТРОКА УПРАВЛЕНИЯ -->
        <div class="cinema-topbar">
          <div class="cinema-brand">
            <span style="font-size:1.4rem;">🏛</span>
            <div>
              <div class="cinema-brand-title">ГБПОУ СРМК • ВСЕРОССИЙСКИЙ «УРОК МУЖЕСТВА»</div>
              <small style="color:#94a3b8; font-size:0.75rem;">ФГОС СПО • Воспитательная работа и историческая память</small>
            </div>
          </div>

          <div class="cinema-top-actions">
            <div class="cinema-timer-badge">
              <span>⏱</span>
              <span id="cinemaLessonTimer">00:00 / 45:00</span>
            </div>
            <button type="button" class="cinema-btn" id="btnCinemaSound" title="Звук">
              <span id="cinemaSoundIcon">🔊</span>
            </button>
            <button type="button" class="cinema-btn gold" id="btnCinemaSilenceTrigger">
              <span>⏱</span>
              <span>Минута молчания</span>
            </button>
            <button type="button" class="cinema-btn" id="btnCinemaClose" title="Выйти из полноэкранного режима (Esc)">
              <span>✕ Выход</span>
            </button>
          </div>
        </div>

        <!-- ОСНОВНОЕ ТЕЛО СЛАЙДОВ -->
        <div class="cinema-body">
          
          <!-- СЛАЙД 1: ВВОДНОЕ СЛОВО -->
          <div class="cinema-slide active" data-slide="0">
            <div class="cinema-slide-kicker">ЭТАП I • ВВОДНАЯ ЧАСТЬ (00:00 – 05:00)</div>
            <h1 class="cinema-slide-title">«БЫТЬ ВОИНОМ — ЖИТЬ ВЕЧНО»</h1>
            <p class="cinema-slide-desc">
              Памяти 20 выпускников Ставропольского регионального многопрофильного колледжа, шагнувших в бессмертие при защите рубежей Родины.
            </p>
            <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
              <button type="button" class="cinema-btn gold" onclick="App.startGeneralTour()" style="font-size:1.1rem; padding:14px 28px;">
                🎧 Включить слово диктора (2 мин)
              </button>
              <button type="button" class="cinema-btn" onclick="LessonCinema.nextSlide()" style="font-size:1.1rem; padding:14px 24px;">
                Перейти к стенду героев ▶
              </button>
            </div>
          </div>

          <!-- СЛАЙД 2: ПРОФЕССИЯ И ПОДВИГ -->
          <div class="cinema-slide" data-slide="1">
            <div class="cinema-slide-kicker">ЭТАП II • СВЯЗЬ ПРОФЕССИИ И МУЖЕСТВА (05:00 – 12:00)</div>
            <h2 class="cinema-slide-title">ОТ СТУДЕНЧЕСКОЙ СКАМЬИ ДО БОЕВОГО РУБЕЖА</h2>
            <p class="cinema-slide-desc">
              В мастерских СРМК ребята осваивали мирные рабочие профессии: сварку металла, диагностику моторов, монтаж электросетей, информационные системы и спасательное дело. В час испытания эти навыки помогли им спасать жизни боевых товарищей и держать оборону.
            </p>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; max-width:960px; width:100%;">
              <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(197,160,89,0.3); padding:16px; border-radius:8px; text-align:left;">
                <div style="font-size:1.6rem; margin-bottom:6px;">👨‍🏭</div>
                <strong style="color:#dfba6d; font-size:1.05rem;">Сварочное дело</strong>
                <p style="font-size:0.86rem; color:#cbd5e1; margin-top:4px;">Ремонт бронетехники и укрепление фортификаций под обстрелом.</p>
              </div>
              <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(197,160,89,0.3); padding:16px; border-radius:8px; text-align:left;">
                <div style="font-size:1.6rem; margin-bottom:6px;">🔧</div>
                <strong style="color:#dfba6d; font-size:1.05rem;">Автомеханика</strong>
                <p style="font-size:0.86rem; color:#cbd5e1; margin-top:4px;">Эвакуация раненых и бесперебойная доставка боекомплекта.</p>
              </div>
              <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(197,160,89,0.3); padding:16px; border-radius:8px; text-align:left;">
                <div style="font-size:1.6rem; margin-bottom:6px;">💻</div>
                <strong style="color:#dfba6d; font-size:1.05rem;">IT и Связь</strong>
                <p style="font-size:0.86rem; color:#cbd5e1; margin-top:4px;">Бесперебойное управление подразделениями и радиоэлектронная борьба.</p>
              </div>
              <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(197,160,89,0.3); padding:16px; border-radius:8px; text-align:left;">
                <div style="font-size:1.6rem; margin-bottom:6px;">⚡</div>
                <strong style="color:#dfba6d; font-size:1.05rem;">Электроэнергетика</strong>
                <p style="font-size:0.86rem; color:#cbd5e1; margin-top:4px;">Восстановление полевых узлов питания и узлов жизнеобеспечения.</p>
              </div>
            </div>
          </div>

          <!-- СЛАЙД 3: ГЕРОИ СРМК -->
          <div class="cinema-slide" data-slide="2">
            <div class="cinema-slide-kicker">ЭТАП III • АРХИВ ДОБЛЕСТИ (12:00 – 20:00)</div>
            <h2 class="cinema-slide-title">20 ВЫПУСКНИКОВ — КАВАЛЕРЫ ОРДЕНА МУЖЕСТВА</h2>
            <p class="cinema-slide-desc" style="margin-bottom:12px;">
              Каждое имя — золотая страница летописи колледжа. Их подвиг навечно вписан в историю Ставропольского края и России.
            </p>
            <div class="cinema-heroes-showcase">
              <div class="cinema-hero-mini-card">
                <img src="assets/images/heroes/martynov-s-k.jpg" alt="Мартынов С. К." onerror="this.src='assets/images/heroes/martynov-s-k.jpg'">
                <div class="cinema-hero-mini-name">Мартынов С. К.</div>
                <div class="cinema-hero-mini-spec">Гв. капитан • Угледар</div>
              </div>
              <div class="cinema-hero-mini-card">
                <img src="assets/images/heroes/shartov-v-i.jpg" alt="Шартов В. И." onerror="this.src='assets/images/heroes/shartov-v-i.jpg'">
                <div class="cinema-hero-mini-name">Шартов В. И.</div>
                <div class="cinema-hero-mini-spec">Гостомельский десант</div>
              </div>
              <div class="cinema-hero-mini-card">
                <img src="assets/images/heroes/lutsenko-i-s.jpg" alt="Луценко И. С." onerror="this.src='assets/images/heroes/lutsenko-i-s.jpg'">
                <div class="cinema-hero-mini-name">Луценко И. С.</div>
                <div class="cinema-hero-mini-spec">Гв. лейтенант • Десант</div>
              </div>
              <div class="cinema-hero-mini-card">
                <img src="assets/images/heroes/chupin-i-v.jpg" alt="Чупин И. В." onerror="this.src='assets/images/heroes/chupin-i-v.jpg'">
                <div class="cinema-hero-mini-name">Чупин И. В.</div>
                <div class="cinema-hero-mini-spec">Сварщик • Донбасс</div>
              </div>
            </div>
            <button type="button" class="cinema-btn" onclick="SpotlightSearch.open()" style="margin-top:12px;">
              🔍 Найти героя в Spotlight (Ctrl+K)
            </button>
          </div>

          <!-- СЛАЙД 4: ВСЕРОССИЙСКАЯ МИНУТА МОЛЧАНИЯ -->
          <div class="cinema-slide" data-slide="3">
            <div class="cinema-slide-kicker">ЭТАП IV • САКРАЛЬНЫЙ МОМЕНТ (20:00 – 21:00)</div>
            <h2 class="cinema-slide-title">ВСЕРОССИЙСКАЯ МИНУТА МОЛЧАНИЯ</h2>
            <p class="cinema-slide-desc">
              «Помните! Через века, через года, — помните! О тех, кто уже не придет никогда, — помните!»
            </p>
            <div style="font-size:5rem; margin:18px 0; filter:drop-shadow(0 0 25px rgba(223,186,109,0.8));">
              🕯️
            </div>
            <button type="button" class="cinema-btn gold" onclick="MemorialCeremony.start()" style="font-size:1.2rem; padding:16px 36px;">
              ⏱ Начать 60 секунд тишины (Метроном)
            </button>
          </div>

          <!-- СЛАЙД 5: ЗАКРЕПЛЕНИЕ И РЕФЛЕКСИЯ -->
          <div class="cinema-slide" data-slide="4">
            <div class="cinema-slide-kicker">ЭТАП V • ЗАКРЕПЛЕНИЕ И ИТОГИ (21:00 – 45:00)</div>
            <h2 class="cinema-slide-title">ИНТЕРАКТИВНОЕ ЗАКРЕПЛЕНИЕ И СЕРТИФИКАТЫ</h2>
            <p class="cinema-slide-desc">
              Отсканируйте QR-код со смартфонов для участия в историческом квесте «Дорогами мужества». Каждый участник оформляет официальный Сертификат с персональным номером реестра.
            </p>
            <div style="display:flex; gap:36px; align-items:center; justify-content:center; flex-wrap:wrap; margin-top:12px;">
              <div style="background:#fff; padding:14px; border-radius:10px; border:2px solid #dfba6d; text-align:center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://phsquad.github.io/srmkmuseum/quiz.html" 
                     alt="QR квеста" width="160" height="160"
                     onerror="this.src='assets/images/icons/icon-192.png'">
                <div style="color:#0a0c0f; font-weight:700; font-size:0.75rem; margin-top:6px;">КВЕСТ СРМК ОНЛАЙН</div>
              </div>
              <div style="text-align:left; max-width:380px;">
                <div style="margin-bottom:12px;">
                  <strong style="color:#dfba6d;">1. Викторина:</strong> 32 вопроса о выпускниках
                </div>
                <div style="margin-bottom:12px;">
                  <strong style="color:#dfba6d;">2. Наградной лист:</strong> именной диплом ФГОС
                </div>
                <div style="margin-bottom:16px;">
                  <strong style="color:#dfba6d;">3. Акт урока:</strong> формирование отчета педагога
                </div>
                <button type="button" class="cinema-btn gold" onclick="App.openLessonReportModal()">
                  📋 Сформировать Акт занятия
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- НИЖНЯЯ ПАНЕЛЬ СЛАЙДЕРА -->
        <div class="cinema-bottombar">
          <div class="cinema-slide-counter" id="cinemaSlideCounter">
            Этап 1 из 5
          </div>
          <div class="cinema-nav-controls">
            <button type="button" class="cinema-btn" id="btnCinemaPrev" onclick="LessonCinema.prevSlide()" disabled>
              ◀ Назад
            </button>
            <button type="button" class="cinema-btn gold" id="btnCinemaNext" onclick="LessonCinema.nextSlide()">
              Далее ▶
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlayEl = overlay;

      overlay.querySelector('#btnCinemaClose')?.addEventListener('click', () => this.stop());
      overlay.querySelector('#btnCinemaSilenceTrigger')?.addEventListener('click', () => {
        if (window.MemorialCeremony) window.MemorialCeremony.start();
      });

      overlay.querySelector('#btnCinemaSound')?.addEventListener('click', () => {
        if (window.SoundEngine) {
          const state = window.SoundEngine.toggle();
          const icon = overlay.querySelector('#cinemaSoundIcon');
          if (icon) icon.textContent = state ? '🔊' : '🔇';
        }
      });

      return overlay;
    }
  };

  LessonCinema.init();
  window.LessonCinema = LessonCinema;
})();
