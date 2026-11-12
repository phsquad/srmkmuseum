/**
 * ============================================================================
 * ГЕРОЙ И ВОПРОС ДНЯ: js/daily-quest.js (v1.0 Daily Memorial Quest)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Календарный алгоритм выбора Героя дня (все 20 героев получают персональный фокус)
 * 2. Экспресс-вопрос на знание подвига / специальности с мгновенной проверкой
 * 3. Начисление XP (+50 XP), зажжение свечи в CloudSync и бейдж «Ежедневный дозор»
 * 4. Сохранение прогресса дня в LocalStorage
 * ============================================================================
 */

(function() {
  'use strict';

  const DailyQuest = {
    hero: null,
    questionData: null,
    isCompleted: false,

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    },

    start() {
      // Инициализируем только на главной странице или в мобильной версии
      const isHome = window.location.pathname.endsWith('index.html') ||
                     window.location.pathname.endsWith('mobile.html') ||
                     window.location.pathname.endsWith('/') ||
                     !window.location.pathname.includes('.html');
      if (!isHome) return;

      const waitForDb = setInterval(() => {
        if (window.heroesDatabase && Array.isArray(window.heroesDatabase) && window.heroesDatabase.length > 0) {
          clearInterval(waitForDb);
          this.setupDailyHero();
          this.renderWidget();
        }
      }, 100);
      setTimeout(() => clearInterval(waitForDb), 5000);
    },

    getTodayKey() {
      const d = new Date();
      return `srmk_daily_quest_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
    },

    setupDailyHero() {
      const heroes = window.heroesDatabase;
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24));
      
      const heroIndex = Math.abs(dayOfYear) % heroes.length;
      this.hero = heroes[heroIndex];

      const saved = localStorage.getItem(this.getTodayKey());
      this.isCompleted = saved === 'completed';

      this.generateQuestion();
    },

    getHeroSpecialty(h) {
      return h.education?.specialty || h.specialty || 'Сварочное производство';
    },

    getHeroRank(h) {
      return h.military?.rank || h.rank || 'Воин ВС РФ';
    },

    getHeroYears(h) {
      return h.dates?.years || h.years || '';
    },

    getHeroAwards(h) {
      if (Array.isArray(h.awards) && h.awards.length > 0) return h.awards.join(', ');
      if (typeof h.awards === 'string') return h.awards;
      return 'Орден Мужества';
    },

    getHeroFirstAward(h) {
      if (Array.isArray(h.awards) && h.awards.length > 0) return h.awards[0];
      if (typeof h.awards === 'string') return h.awards;
      return 'Орден Мужества (посмертно)';
    },

    getHeroLocation(h) {
      return h.mapCoords?.locationName || h.battle || 'Донбасский рубеж';
    },

    getHeroPhoto(h) {
      return h.media?.photo || h.photo || `assets/images/heroes/${h.id}.jpg`;
    },

    generateQuestion() {
      const h = this.hero;
      const specialty = this.getHeroSpecialty(h);
      const award = this.getHeroFirstAward(h);
      const location = this.getHeroLocation(h);

      // Чередуем типы вопросов по дням
      const dayNum = new Date().getDate();
      const qType = dayNum % 3; // 0 - специальность, 1 - награда, 2 - локация

      let questionText = '';
      let correctAnswer = '';
      let distractorsPool = [];

      if (qType === 0) {
        questionText = `Какую специальность окончил в ГБПОУ СРМК герой сегодняшнего дня — ${h.name}?`;
        correctAnswer = specialty;
        distractorsPool = [
          'Техническое обслуживание и ремонт автотранспорта',
          'Сварочное производство',
          'Электромонтажные работы и энергетика',
          'Информационные системы и программирование',
          'Пожарная безопасность и защита в ЧС',
          'Право и организация социального обеспечения'
        ].filter(s => s.toLowerCase() !== String(correctAnswer).toLowerCase());
      } else if (qType === 1) {
        questionText = `Какой высокой государственной наградой был удостоен ${h.name} за мужество при исполнении воинского долга?`;
        correctAnswer = award;
        distractorsPool = [
          'Орден Мужества (посмертно)',
          'Медаль «За отвагу»',
          'Медаль Суворова',
          'Медаль Жукова',
          'Орден Святого Георгия — Георгиевский Крест'
        ].filter(a => a.toLowerCase() !== String(correctAnswer).toLowerCase());
      } else {
        questionText = `На каком боевом рубеже специальной военной операции проявил ратную доблесть ${h.name}?`;
        correctAnswer = location;
        distractorsPool = [
          'Гостомельский десант',
          'Харьковское направление',
          'Донецкое направление (ДНР)',
          'Курский приграничный рубеж',
          'Херсонско-Запорожский плацдарм',
          'Угледарский укрепрайон'
        ].filter(b => b.toLowerCase() !== String(correctAnswer).toLowerCase());
      }

      // Перемешиваем и выбираем 3 дистрактора
      const shuffledDistractors = distractorsPool.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [...shuffledDistractors, String(correctAnswer)].sort(() => 0.5 - Math.random());

      this.questionData = {
        question: questionText,
        correct: String(correctAnswer),
        options: options,
        hero: h
      };
    },

    renderWidget() {
      // Ищем место для вставки виджета: перед Залом II (#heroes-grid) или после Мемориала Славы
      const targetSlot = document.getElementById('dailyQuestSlot');
      let container = targetSlot;

      if (!container) {
        const heroesSection = document.getElementById('heroes-grid');
        if (heroesSection) {
          container = document.createElement('div');
          container.id = 'dailyQuestSlot';
          container.className = 'container daily-quest-section';
          heroesSection.parentNode.insertBefore(container, heroesSection);
        } else {
          return;
        }
      }

      const h = this.hero;
      const todayStr = new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const photoSrc = this.getHeroPhoto(h);
      const fallbackPhoto = `assets/images/heroes/${h.id}.jpg`;
      const rankText = this.getHeroRank(h);
      const specText = this.getHeroSpecialty(h);
      const yearsText = this.getHeroYears(h);

      container.innerHTML = `
        <div class="daily-quest-card" id="dailyQuestCard">
          <div class="daily-quest-header">
            <div class="daily-quest-badge">
              <span>⭐️</span>
              <span>Герой и вопрос сегодняшнего дня</span>
            </div>
            <div class="daily-quest-date">
              📅 ${todayStr} • Ежедневная эстафета памяти СРМК
            </div>
          </div>

          <div class="daily-quest-body">
            <div class="daily-hero-avatar-box">
              <img src="${photoSrc}" alt="${h.name}" class="daily-hero-img" loading="lazy" onerror="this.onerror=null; this.src='${fallbackPhoto}';">
              <span class="daily-hero-candle-badge">🕯️ Герой дня</span>
            </div>

            <div class="daily-quest-info">
              <h3>${h.name}</h3>
              <div class="daily-hero-meta">
                ${rankText} • Выпускник: ${specText} ${yearsText ? `• ${yearsText}` : ''}
              </div>

              <div class="daily-question-box">
                <div class="daily-question-text">
                  ${this.questionData.question}
                </div>

                <div class="daily-options-grid" id="dailyOptionsGrid">
                  ${this.questionData.options.map((opt, idx) => `
                    <button type="button" class="daily-option-btn ${this.isCompleted && opt === this.questionData.correct ? 'correct' : ''}" 
                            data-option="${opt.replace(/"/g, '&quot;')}" 
                            ${this.isCompleted ? 'disabled' : ''}>
                      <span style="color:#dfba6d; font-weight:700; margin-right:6px;">${['А', 'Б', 'В', 'Г'][idx]}.</span>
                      ${opt}
                    </button>
                  `).join('')}
                </div>

                <div class="daily-quest-feedback ${this.isCompleted ? 'already-done' : ''}" id="dailyQuestFeedback">
                  ${this.isCompleted 
                    ? `✅ <strong>Память героя почтена сегодня!</strong> Вы дали верный ответ: <em>«${this.questionData.correct}»</em>. Свеча памяти зажжена в облачной летописи колледжа. Приходите завтра за новым вопросом!`
                    : ''}
                </div>
              </div>

              <div class="daily-quest-actions">
                <button type="button" class="btn btn-secondary" onclick="App.openModal('${h.id}')" style="padding:8px 16px; font-size:0.85rem; border-color:#c5a059; color:#dfba6d;">
                  📖 Архивное досье героя →
                </button>
                <button type="button" class="btn btn-secondary" onclick="MemorialCardGenerator.openModal('${h.id}')" style="padding:8px 16px; font-size:0.85rem;">
                  🖼 Открытка для соцсетей (9:16)
                </button>
                <a href="quiz.html" class="btn btn-secondary" style="padding:8px 16px; font-size:0.85rem;">
                  ⚔️ Полный квест (32 вопроса) →
                </a>
              </div>
            </div>
          </div>
        </div>
      `;

      this.bindOptions();
    },

    bindOptions() {
      const grid = document.getElementById('dailyOptionsGrid');
      if (!grid) return;

      const buttons = grid.querySelectorAll('.daily-option-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (this.isCompleted) return;
          const chosen = btn.getAttribute('data-option');
          this.handleAnswer(chosen, btn, buttons);
        });
      });
    },

    handleAnswer(chosen, clickedBtn, allButtons) {
      const isCorrect = chosen === this.questionData.correct;
      const feedback = document.getElementById('dailyQuestFeedback');

      if (isCorrect) {
        this.isCompleted = true;
        try {
          localStorage.setItem(this.getTodayKey(), 'completed');
        } catch (e) {}

        clickedBtn.classList.add('correct');
        allButtons.forEach(b => b.disabled = true);

        // Звуковой отклик победы
        if (window.SoundEngine) {
          window.SoundEngine.playAchievementChime();
        }

        // Зажжение свечи в CloudSync
        if (window.CloudSync && typeof window.CloudSync.pushCandle === 'function') {
          window.CloudSync.pushCandle(this.hero.id);
        }

        // Начисление XP и бейджа в AchievementsEngine
        if (window.AchievementsEngine) {
          window.AchievementsEngine.addXP(50, `Верный ответ на вопрос дня о герое ${this.hero.name}`);
          window.AchievementsEngine.unlockBadge('badge_daily_quest');
        }

        if (feedback) {
          feedback.className = 'daily-quest-feedback success';
          feedback.innerHTML = `
            🎉 <strong>Абсолютно верно!</strong> Вы отлично знаете историю подвига выпускника СРМК <strong>${this.hero.name}</strong>.<br>
            Вам начислено <strong>+50 XP</strong>, разблокирован наградной знак <em>«Ежедневный дозор»</em> и зажжена свеча памяти!
          `;
        }

        if (window.MemorialToast) {
          MemorialToast.show(`⭐️ Вопрос дня решен верно! +50 XP и Свеча Памяти зажжена.`, 'success', 5000);
        }
      } else {
        clickedBtn.classList.add('wrong');
        setTimeout(() => clickedBtn.classList.remove('wrong'), 1500);

        if (feedback) {
          feedback.className = 'daily-quest-feedback';
          feedback.style.display = 'block';
          feedback.style.background = 'rgba(239, 68, 68, 0.15)';
          feedback.style.border = '1px solid rgba(239, 68, 68, 0.3)';
          feedback.style.color = '#fca5a5';
          feedback.innerHTML = `Не совсем точно. Попробуйте еще раз или изучите архивное досье героя!`;
        }
      }
    }
  };

  DailyQuest.init();
  window.DailyQuest = DailyQuest;
})();
