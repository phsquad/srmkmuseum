/**
 * ============================================================================
 * УНИВЕРСАЛЬНЫЙ SPOTLIGHT-ПОИСК: js/spotlight.js (v2.0 Master Deluxe)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Интеллектуальный поиск по 20 героям (имена, звания, специальности, ордена, рубежи)
 * 2. Портреты героев высокой четкости, таксономия СПО и воинские знаки отличия
 * 3. Быстрый переход по 8 залам и интерактивным модулям мемориала
 * 4. Ритуалы и церемонии (Минута молчания, Наградная палата, Урок Мужества, Аудиотур)
 * 5. Боевые рубежи и сражения (Бахмут, Гостомель, Донецк, Кременная, Запорожье, Херсон)
 * 6. Полнофункциональная клавиатурная навигация (Ctrl+K, стрелки, Enter, Esc)
 * ============================================================================
 */

(function() {
  'use strict';

  const SpotlightSearch = {
    modalEl: null,
    inputEl: null,
    resultsEl: null,
    countEl: null,
    selectedIndex: 0,
    items: [],
    activeFilter: 'all', // 'all', 'heroes', 'modules', 'actions', 'battles'

    init() {
      this.bindShortcuts();
      this.bindGlobalTriggers();
    },

    bindShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl+K / Cmd+K или Ctrl+F
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л')) {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape' && this.isOpen()) {
          e.preventDefault();
          this.close();
        }
      });
    },

    bindGlobalTriggers() {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('#btnOpenSpotlight, .btn-spotlight-trigger, [data-open-spotlight]');
        if (trigger) {
          e.preventDefault();
          this.open();
        }
      });
    },

    isOpen() {
      return this.modalEl && this.modalEl.classList.contains('active');
    },

    toggle() {
      if (this.isOpen()) this.close();
      else this.open();
    },

    open() {
      this.getOrCreateModal();
      this.modalEl.classList.add('active');
      this.modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (window.SoundEngine && typeof window.SoundEngine.playCandleIgnite === 'function') {
        try { window.SoundEngine.playCandleIgnite(); } catch (e) {}
      }

      setTimeout(() => {
        if (this.inputEl) {
          this.inputEl.value = '';
          this.inputEl.focus();
          this.activeFilter = 'all';
          this.updateActiveChip();
          this.search('');
        }
      }, 50);
    },

    close() {
      if (this.modalEl) {
        this.modalEl.classList.remove('active');
        this.modalEl.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    },

    getOrCreateModal() {
      if (this.modalEl) return this.modalEl;

      const modal = document.createElement('div');
      modal.id = 'spotlightSearchModal';
      modal.className = 'spotlight-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Поиск по мемориальному комплексу');

      modal.innerHTML = `
        <div class="spotlight-dialog">
          <div class="spotlight-top-glow"></div>
          
          <div class="spotlight-header">
            <div class="spotlight-search-icon-box" title="Поиск по архиву">
              <svg class="spotlight-search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input type="text" id="spotlightInput" class="spotlight-input" placeholder="Поиск героя, звания, награды, специальности, зала... (Esc для выхода)" autocomplete="off" spellcheck="false">
            <div class="spotlight-header-actions">
              <span class="spotlight-kbd-badge"><kbd>ESC</kbd></span>
              <button type="button" class="spotlight-close-btn" id="spotlightCloseBtn" title="Закрыть поиск (Esc)" aria-label="Закрыть окно">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="spotlight-chips-container">
            <div class="spotlight-chips-row" id="spotlightChipsRow">
              <button type="button" class="spotlight-chip active" data-filter="all">⚡ Все</button>
              <button type="button" class="spotlight-chip" data-filter="heroes">🎖 Герои (20)</button>
              <button type="button" class="spotlight-chip" data-filter="modules">🏛 Залы и модули</button>
              <button type="button" class="spotlight-chip" data-filter="actions">⏱ Ритуалы памяти</button>
              <button type="button" class="spotlight-chip" data-filter="battles">📍 Рубежи боёв</button>
              <button type="button" class="spotlight-chip" data-query="Орден Мужества">🎖 Орден Мужества</button>
              <button type="button" class="spotlight-chip" data-query="Бахмут">📍 Бахмут</button>
              <button type="button" class="spotlight-chip" data-query="Гостомель">📍 Гостомель</button>
              <button type="button" class="spotlight-chip" data-query="Донецк">📍 Донецк</button>
              <button type="button" class="spotlight-chip" data-query="Сварщик">⚡ Сварщик</button>
              <button type="button" class="spotlight-chip" data-query="ЧС">🚒 Защита в ЧС</button>
              <button type="button" class="spotlight-chip" data-query="Автомеханик">🔧 Автодело</button>
            </div>
          </div>

          <div class="spotlight-results" id="spotlightResults" role="listbox"></div>

          <div class="spotlight-footer">
            <div class="spotlight-keys-help">
              <span class="spotlight-key-item"><kbd class="spotlight-kbd">↑</kbd><kbd class="spotlight-kbd">↓</kbd> Навигация</span>
              <span class="spotlight-key-item"><kbd class="spotlight-kbd">↵ Enter</kbd> Выбрать</span>
              <span class="spotlight-key-item"><kbd class="spotlight-kbd">Esc</kbd> Закрыть</span>
            </div>
            <div class="spotlight-footer-meta">
              <span class="spotlight-count-badge" id="spotlightCountBadge">20 героев</span>
              <span class="spotlight-brand-text">Мемориал ГБПОУ СРМК</span>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modalEl = modal;
      this.inputEl = modal.querySelector('#spotlightInput');
      this.resultsEl = modal.querySelector('#spotlightResults');
      this.countEl = modal.querySelector('#spotlightCountBadge');

      // Закрытие по фону и крестику
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
      modal.querySelector('#spotlightCloseBtn')?.addEventListener('click', () => this.close());

      // Живой ввод
      this.inputEl.addEventListener('input', () => {
        this.search(this.inputEl.value.trim());
      });

      // Клавиатурная навигация
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        }
      });

      // Чипсы
      modal.querySelectorAll('.spotlight-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const filter = chip.getAttribute('data-filter');
          const query = chip.getAttribute('data-query');

          if (filter) {
            this.activeFilter = filter;
            this.updateActiveChip();
            this.search(this.inputEl.value.trim());
          } else if (query) {
            this.inputEl.value = query;
            this.activeFilter = 'all';
            this.updateActiveChip(chip);
            this.search(query);
          }
        });
      });

      return modal;
    },

    updateActiveChip(specificChip = null) {
      if (!this.modalEl) return;
      const chips = this.modalEl.querySelectorAll('.spotlight-chip');
      chips.forEach(c => c.classList.remove('active'));

      if (specificChip) {
        specificChip.classList.add('active');
        return;
      }

      const activeFilterChip = this.modalEl.querySelector(`.spotlight-chip[data-filter="${this.activeFilter}"]`);
      if (activeFilterChip) {
        activeFilterChip.classList.add('active');
      }
    },

    search(query) {
      const q = (query || '').toLowerCase().trim();
      const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
      const results = [];

      const matchesAllTokens = (text) => {
        if (!tokens.length) return true;
        const normalized = (text || '').toLowerCase();
        return tokens.every(token => normalized.includes(token));
      };

      // ======================================================================
      // 1. ПОИСК ПО 20 ГЕРОЯМ
      // ======================================================================
      if (this.activeFilter === 'all' || this.activeFilter === 'heroes') {
        const heroes = window.heroesDatabase || [];
        const specialtiesTaxonomy = window.SPECIALTIES_TAXONOMY || {};

        heroes.forEach(h => {
          const specKey = (h.specTag || '').toUpperCase();
          const specData = specialtiesTaxonomy[specKey] || specialtiesTaxonomy[h.specTag] || null;
          const specIcon = specData?.icon || '🎓';
          const specName = h.education?.specialty || specData?.name || h.specialty || 'Выпускник СРМК';
          const rankName = h.military?.rank || h.rank || 'Воин ВС РФ';
          const awardsList = Array.isArray(h.awards) 
            ? h.awards 
            : (typeof h.awards === 'string' ? h.awards.split(',').map(s => s.trim()).filter(Boolean) : []);
          const awardsText = awardsList.join(' • ') || 'Орден Мужества (посмертно)';
          const locationName = h.mapCoords?.locationName || h.battle || '';
          const plaqueText = h.plaque === 'left' ? 'Левая плита' : (h.plaque === 'right' ? 'Правая плита' : 'Мемориал');

          // Полный поисковый индекс по герою
          const searchable = [
            h.name || '',
            rankName,
            specName,
            specData?.name || '',
            awardsText,
            locationName,
            h.military?.unit || '',
            h.military?.role || '',
            h.education?.honors || '',
            h.dates?.years || '',
            plaqueText
          ].join(' ');

          if (matchesAllTokens(searchable)) {
            // Фото героя
            let photoUrl = h.media?.photo || h.photo || '';
            if (photoUrl && photoUrl.endsWith('.svg')) {
              // Если есть jpg-эквивалент в каталоге
              photoUrl = photoUrl.replace(/\.svg$/, '.jpg');
            }
            if (!photoUrl) {
              const shortId = (h.id || '').split('-')[0];
              photoUrl = `assets/images/heroes/${shortId}.jpg`;
            }

            results.push({
              type: 'hero',
              category: 'Герои Мемориала СРМК',
              id: h.id,
              name: h.name,
              photo: photoUrl,
              specIcon: specIcon,
              specName: specName,
              rankName: rankName,
              plaqueText: plaqueText,
              awardsText: awardsText,
              locationName: locationName,
              action: () => {
                this.close();
                if (typeof window.App !== 'undefined' && typeof window.App.openModal === 'function') {
                  window.App.openModal(h.id);
                } else {
                  const isHome = window.location.pathname.endsWith('index.html') || 
                                 window.location.pathname.endsWith('/') || 
                                 !window.location.pathname.includes('.html');
                  if (isHome) {
                    window.location.hash = `hero-${h.id}`;
                  } else {
                    window.location.href = `index.html#hero-${h.id}`;
                  }
                }
              }
            });
          }
        });
      }

      // ======================================================================
      // 2. БЫСТРЫЕ РИТУАЛЫ И ИНТЕРАКТИВНЫЕ ДЕЙСТВИЯ
      // ======================================================================
      if (this.activeFilter === 'all' || this.activeFilter === 'actions') {
        const actions = [
          {
            title: 'Минута молчания',
            subtitle: 'Торжественная 60-секундная поминальная церемония с метрономом и набатом',
            icon: '⏱',
            iconType: 'crimson',
            badge: 'Церемония',
            action: () => {
              this.close();
              if (window.MemorialCeremony && typeof window.MemorialCeremony.start === 'function') {
                window.MemorialCeremony.start();
              } else if (typeof window.App !== 'undefined' && typeof window.App.startMinuteOfSilence === 'function') {
                window.App.startMinuteOfSilence();
              } else if (window.MemorialToast) {
                MemorialToast.show('Запуск церемонии Минуты молчания...', 'info');
              }
            }
          },
          {
            title: 'Наградная палата и воинский ранг',
            subtitle: 'Просмотр боевых орденов, медалей, курсантского звания и личного прогресса XP',
            icon: '🏆',
            iconType: 'gold',
            badge: 'Прогресс и звания',
            action: () => {
              this.close();
              if (window.AchievementsEngine && typeof window.AchievementsEngine.openModal === 'function') {
                window.AchievementsEngine.openModal();
              }
            }
          },
          {
            title: 'Общая аудиоэкскурсия по Мемориалу',
            subtitle: 'Голосовой тур профессионального диктора по 4 главным залам комплекса СРМК',
            icon: '🎧',
            iconType: 'blue',
            badge: 'Аудиогид MP3',
            action: () => {
              this.close();
              const btnTour = document.getElementById('btnGeneralTourPlay') || document.getElementById('btnOpenGeneralTour');
              if (btnTour) {
                btnTour.click();
              } else {
                window.location.href = 'index.html#memorial';
              }
            }
          },
          {
            title: 'Полноэкранный Урок Мужества (Cinema 16:9)',
            subtitle: 'Интерактивная презентация для интерактивной доски, проектора или смарт-ТВ (Клавиша F)',
            icon: '🎬',
            iconType: 'gold',
            badge: 'Режим 16:9',
            action: () => {
              this.close();
              if (window.LessonCinema && typeof window.LessonCinema.start === 'function') {
                window.LessonCinema.start();
              }
            }
          },
          {
            title: 'Создать открытку памяти для соцсетей (9:16 / 1:1)',
            subtitle: 'Брендированная карточка героя с официальным портретом, орденами и QR-кодом',
            icon: '🖼',
            iconType: 'gold',
            badge: 'Медиа-постер',
            action: () => {
              this.close();
              if (window.MemorialCardGenerator && typeof window.MemorialCardGenerator.openModal === 'function') {
                window.MemorialCardGenerator.openModal();
              }
            }
          },
          {
            title: 'Свеча Памяти героя сегодняшнего дня',
            subtitle: 'Ежедневная эстафета памяти: экспресс-вопрос и соборное зажжение лампады (+50 XP)',
            icon: '⭐️',
            iconType: 'crimson',
            badge: 'Эстафета дня',
            action: () => {
              this.close();
              const slot = document.getElementById('dailyQuestSlot') || document.getElementById('heroes-grid');
              if (slot) {
                slot.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.location.href = 'index.html#heroes-grid';
              }
            }
          }
        ];

        actions.forEach(act => {
          const searchable = `${act.title} ${act.subtitle} ${act.badge}`;
          if (matchesAllTokens(searchable)) {
            results.push({
              type: 'module',
              category: 'Ритуалы и церемонии памяти',
              title: act.title,
              subtitle: act.subtitle,
              icon: act.icon,
              iconType: act.iconType,
              badge: act.badge,
              action: act.action
            });
          }
        });
      }

      // ======================================================================
      // 3. ЗАЛЫ И МОДУЛИ МУЗЕЙНОГО КОМПЛЕКСА
      // ======================================================================
      if (this.activeFilter === 'all' || this.activeFilter === 'modules') {
        const modules = [
          { 
            title: 'Электронная Книга Памяти', 
            subtitle: '21 исторический том и архивные биографические очерки 20 павших выпускников', 
            icon: '📖', 
            iconType: 'gold',
            badge: '21 том очерков',
            url: 'memory-book.html' 
          },
          { 
            title: '3D Фолиант Памяти', 
            subtitle: 'Интерактивная книга с тактильным перелистыванием страниц, диктором и звуком шелеста', 
            icon: '📚', 
            iconType: 'gold',
            badge: '3D Читалка',
            url: 'reader.html' 
          },
          { 
            title: 'Исторический квест «Дорогами мужества»', 
            subtitle: '32 верифицированных вопроса по подвигам героев, воинским званиям и Зал Славы', 
            icon: '⚔️', 
            iconType: 'blue',
            badge: '32 вопроса',
            url: 'quiz.html' 
          },
          { 
            title: 'Стена Памяти и живые лампады', 
            subtitle: 'Общее зажжение поминальных огней, возложение живых гвоздик и книга отзывов в реальном времени', 
            icon: '🕯', 
            iconType: 'crimson',
            badge: 'Supabase Realtime',
            url: 'guestbook.html' 
          },
          { 
            title: 'Генератор официальных сертификатов', 
            subtitle: 'Выдача именного наградного документа с золотой печатью и защитным QR-кодом', 
            icon: '📜', 
            iconType: 'gold',
            badge: 'QR-верификация',
            url: 'certificate.html' 
          },
          { 
            title: 'Конструктор «Парта Героя» А4', 
            subtitle: 'Настольные мемориальные таблички формата А4 с персональными QR-кодами для учебных кабинетов', 
            icon: '🪑', 
            iconType: 'blue',
            badge: 'Печать А4',
            url: 'desk-qr.html' 
          },
          { 
            title: 'Методический кабинет педагога', 
            subtitle: 'Технологические карты и сценарии Уроков Мужества в соответствии с ФГОС СПО', 
            icon: '📑', 
            iconType: 'gold',
            badge: 'ФГОС СПО',
            url: 'methodology.html' 
          },
          { 
            title: 'Паспорт музейного комплекса', 
            subtitle: 'Официальный регистрационный паспорт Мемориала СРМК и учетная карточка экспозиции', 
            icon: '📋', 
            iconType: 'blue',
            badge: 'Регистрация',
            action: () => {
              this.close();
              if (window.NavigationEngine && typeof window.NavigationEngine.openPassportModal === 'function') {
                window.NavigationEngine.openPassportModal();
              } else {
                window.location.href = 'index.html#passport';
              }
            }
          }
        ];

        modules.forEach(mod => {
          const searchable = `${mod.title} ${mod.subtitle} ${mod.badge}`;
          if (matchesAllTokens(searchable)) {
            results.push({
              type: 'module',
              category: 'Залы и сервисы мемориала',
              title: mod.title,
              subtitle: mod.subtitle,
              icon: mod.icon,
              iconType: mod.iconType,
              badge: mod.badge,
              url: mod.url,
              action: mod.action || (() => {
                this.close();
                window.location.href = mod.url;
              })
            });
          }
        });
      }

      // ======================================================================
      // 4. БОЕВЫЕ РУБЕЖИ И СРАЖЕНИЯ (ГЕОГРАФИЯ ПОДВИГА)
      // ======================================================================
      if (this.activeFilter === 'all' || this.activeFilter === 'battles') {
        const battlefronts = [
          {
            title: 'Бахмутский рубеж (ДНР)',
            subtitle: 'Ожесточенные бои за город и укрепрайоны. Подвиг Ярышева М.В., Белова С.А., Самохина А.А.',
            query: 'Бахмут',
            heroesCount: '3 героя'
          },
          {
            title: 'Гостомельский десант (Киевская обл.)',
            subtitle: 'Воздушно-десантная операция у аэродрома Антонов. Подвиг Сополева Н.С., Нартова Д.В.',
            query: 'Гостомель',
            heroesCount: '2 героя'
          },
          {
            title: 'Донецкое направление (ДНР)',
            subtitle: 'Штурмовые операции и контрбатарейная борьба. Подвиг Петухова В.В., Шартова П.Н., Лукьяненко И.В.',
            query: 'Донецк',
            heroesCount: '3 героя'
          },
          {
            title: 'Запорожский плацдарм (Орехов / Работино)',
            subtitle: 'Отражение контрнаступления бронетанковых сил. Подвиг Назырова Д.Р., Горлова В.А.',
            query: 'Запорож',
            heroesCount: '2 героя'
          },
          {
            title: 'Кременная и Серебрянское лесничество (ЛНР)',
            subtitle: 'Лесные позиционные бои и оборона рубежей. Подвиг Мартынова Е.И., Вечёрка С.И.',
            query: 'Кременная',
            heroesCount: '2 героя'
          },
          {
            title: 'Харьковское направление',
            subtitle: 'Боевое охранение колонн и удержание позиций. Подвиг Елагина И.С., Бутова С.Н.',
            query: 'Харьков',
            heroesCount: '2 героя'
          },
          {
            title: 'Херсонский плацдарм и Днепр',
            subtitle: 'Оборона левого берега и островной зоны Днепра. Подвиг Луценко К.А., Пономарчукова А.С.',
            query: 'Херсон',
            heroesCount: '2 героя'
          },
          {
            title: 'Курское приграничье',
            subtitle: 'Защита государственной границы Российской Федерации. Подвиг Григорьева А.В., Брынзы В.В.',
            query: 'Курск',
            heroesCount: '2 героя'
          }
        ];

        battlefronts.forEach(bf => {
          const searchable = `${bf.title} ${bf.subtitle} ${bf.query}`;
          if (matchesAllTokens(searchable)) {
            results.push({
              type: 'battle',
              category: 'Рубежи воинской славы',
              title: bf.title,
              subtitle: bf.subtitle,
              badge: bf.heroesCount,
              icon: '📍',
              iconType: 'crimson',
              action: () => {
                this.inputEl.value = bf.query;
                this.activeFilter = 'all';
                this.updateActiveChip();
                this.search(bf.query);
              }
            });
          }
        });
      }

      this.items = results.slice(0, 30);
      this.selectedIndex = 0;
      this.renderResults();
      this.updateCounter(results.length);
    },

    updateCounter(totalCount) {
      if (!this.countEl) return;
      const count = totalCount || this.items.length;
      if (this.activeFilter === 'heroes') {
        this.countEl.textContent = `${count} ${this.declension(count, ['герой', 'героя', 'героев'])}`;
      } else {
        this.countEl.textContent = `Найдено: ${count}`;
      }
    },

    declension(number, titles) {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    },

    renderResults() {
      if (!this.resultsEl) return;

      if (this.items.length === 0) {
        this.resultsEl.innerHTML = `
          <div class="spotlight-empty">
            <span class="spotlight-empty-icon">🕊</span>
            <div class="spotlight-empty-title">Ничего не найдено по вашему запросу</div>
            <p class="spotlight-empty-desc">
              Попробуйте ввести фамилию героя, воинское звание, название награды (<em>«Орден Мужества»</em>), 
              специальность (<em>«Сварщик»</em>) или боевой рубеж (<em>«Бахмут»</em>, <em>«Гостомель»</em>).
            </p>
          </div>
        `;
        return;
      }

      let html = '';
      let currentCategory = '';

      this.items.forEach((item, index) => {
        if (item.category !== currentCategory) {
          currentCategory = item.category;
          const groupCount = this.items.filter(i => i.category === currentCategory).length;
          html += `
            <div class="spotlight-group-title">
              <span>${currentCategory}</span>
              <span class="spotlight-group-badge">${groupCount}</span>
            </div>
          `;
        }

        const isSelected = index === this.selectedIndex;

        if (item.type === 'hero') {
          html += `
            <div class="spotlight-item spotlight-hero-item ${isSelected ? 'selected' : ''}" data-index="${index}" role="option" aria-selected="${isSelected}">
              <div class="spotlight-hero-avatar-box">
                <img src="${item.photo}" alt="${item.name}" class="spotlight-hero-avatar-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/cover-master.jpg';">
                <span class="spotlight-hero-spec-badge" title="${item.specName}">${item.specIcon}</span>
              </div>
              <div class="spotlight-item-content">
                <div class="spotlight-item-header-row">
                  <span class="spotlight-hero-name">${item.name}</span>
                  <span class="spotlight-pill-rank">${item.rankName}</span>
                  <span class="spotlight-pill-plaque">${item.plaqueText}</span>
                </div>
                <div class="spotlight-hero-tags-row">
                  <span class="spotlight-tag-badge spec" title="${item.specName}">
                    <span class="spotlight-tag-icon">${item.specIcon}</span>
                    <span class="spotlight-tag-text">${item.specName}</span>
                  </span>
                  <span class="spotlight-tag-badge award" title="${item.awardsText}">
                    <span class="spotlight-tag-icon">🎖</span>
                    <span class="spotlight-tag-text">${item.awardsText}</span>
                  </span>
                  ${item.locationName ? `
                    <span class="spotlight-tag-badge loc" title="${item.locationName}">
                      <span class="spotlight-tag-icon">📍</span>
                      <span class="spotlight-tag-text">${item.locationName}</span>
                    </span>
                  ` : ''}
                </div>
              </div>
              <div class="spotlight-item-action-indicator">
                <span class="spotlight-action-badge"><kbd>↵</kbd> Досье</span>
              </div>
            </div>
          `;
        } else if (item.type === 'battle') {
          html += `
            <div class="spotlight-item spotlight-battle-item ${isSelected ? 'selected' : ''}" data-index="${index}" role="option" aria-selected="${isSelected}">
              <div class="spotlight-module-icon-box crimson">
                <span class="spotlight-module-icon">${item.icon}</span>
              </div>
              <div class="spotlight-item-content">
                <div class="spotlight-item-header-row">
                  <span class="spotlight-module-title">${item.title}</span>
                  <span class="spotlight-pill-rank">${item.badge}</span>
                </div>
                <div class="spotlight-module-desc">${item.subtitle}</div>
              </div>
              <div class="spotlight-item-action-indicator">
                <span class="spotlight-action-badge"><kbd>↵</kbd> Список</span>
              </div>
            </div>
          `;
        } else {
          // Модули и ритуалы
          html += `
            <div class="spotlight-item spotlight-module-item ${isSelected ? 'selected' : ''}" data-index="${index}" role="option" aria-selected="${isSelected}">
              <div class="spotlight-module-icon-box ${item.iconType || 'gold'}">
                <span class="spotlight-module-icon">${item.icon}</span>
              </div>
              <div class="spotlight-item-content">
                <div class="spotlight-item-header-row">
                  <span class="spotlight-module-title">${item.title}</span>
                  ${item.badge ? `<span class="spotlight-pill-feature">${item.badge}</span>` : ''}
                </div>
                <div class="spotlight-module-desc">${item.subtitle}</div>
              </div>
              <div class="spotlight-item-action-indicator">
                <span class="spotlight-action-badge"><kbd>↵</kbd> Перейти</span>
              </div>
            </div>
          `;
        }
      });

      this.resultsEl.innerHTML = html;

      // Клик по результату
      this.resultsEl.querySelectorAll('.spotlight-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-index'), 10);
          this.selectedIndex = idx;
          this.executeSelected();
        });
      });
    },

    moveSelection(delta) {
      if (this.items.length === 0) return;
      this.selectedIndex = (this.selectedIndex + delta + this.items.length) % this.items.length;
      
      const items = this.resultsEl.querySelectorAll('.spotlight-item');
      items.forEach((el, i) => {
        if (i === this.selectedIndex) {
          el.classList.add('selected');
          el.setAttribute('aria-selected', 'true');
          el.scrollIntoView({ block: 'nearest' });
        } else {
          el.classList.remove('selected');
          el.setAttribute('aria-selected', 'false');
        }
      });
    },

    executeSelected() {
      const selected = this.items[this.selectedIndex];
      if (selected && typeof selected.action === 'function') {
        if (window.AchievementsEngine && typeof window.AchievementsEngine.trackSpotlightUsed === 'function') {
          window.AchievementsEngine.trackSpotlightUsed();
        }
        selected.action();
      }
    }
  };

  SpotlightSearch.init();
  window.SpotlightSearch = SpotlightSearch;
})();
