/**
 * ============================================================================
 * УНИВЕРСАЛЬНЫЙ SPOTLIGHT-ПОИСК: js/spotlight.js (v1.0 Ctrl+K Master)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Мгновенный поиск по 20 героям (имена, награды, рубежи подвига, специальности)
 * 2. Быстрый переход по 10 залам и модулям мемориала
 * 3. Быстрые действия (Минута молчания, Наградная палата, Аудиоэкскурсия)
 * 4. Управление с клавиатуры (Ctrl+K, стрелки, Enter, Esc)
 * ============================================================================
 */

(function() {
  'use strict';

  const SpotlightSearch = {
    modalEl: null,
    inputEl: null,
    resultsEl: null,
    selectedIndex: 0,
    items: [],

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

      setTimeout(() => {
        if (this.inputEl) {
          this.inputEl.value = '';
          this.inputEl.focus();
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
          <div class="spotlight-header">
            <span class="spotlight-search-icon">🔍</span>
            <input type="text" id="spotlightInput" class="spotlight-input" placeholder="Поиск героя, рубежа, награды, специальности... (Esc для выхода)" autocomplete="off" spellcheck="false">
            <button type="button" class="spotlight-close-btn" id="spotlightCloseBtn" title="Закрыть поиск (Esc)">&times;</button>
          </div>
          <div class="spotlight-chips-row">
            <button type="button" class="spotlight-chip" data-query="Орден Мужества">🎖 Орден Мужества</button>
            <button type="button" class="spotlight-chip" data-query="Бахмут">📍 Бахмут</button>
            <button type="button" class="spotlight-chip" data-query="Гостомель">📍 Гостомель</button>
            <button type="button" class="spotlight-chip" data-query="Сварщик">🎓 Сварщик</button>
            <button type="button" class="spotlight-chip" data-query="Автомеханик">🔧 Автомеханик</button>
          </div>
          <div class="spotlight-results" id="spotlightResults"></div>
          <div class="spotlight-footer">
            <div class="spotlight-keys-help">
              <span><kbd>↑</kbd><kbd>↓</kbd> выбор</span>
              <span><kbd>↵ Enter</kbd> перейти</span>
              <span><kbd>Esc</kbd> закрыть</span>
            </div>
            <span class="spotlight-footer-brand">Мемориал ГБПОУ СРМК</span>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modalEl = modal;
      this.inputEl = modal.querySelector('#spotlightInput');
      this.resultsEl = modal.querySelector('#spotlightResults');

      // Закрытие по фону и крестику
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
      modal.querySelector('#spotlightCloseBtn')?.addEventListener('click', () => this.close());

      // Живой ввод
      this.inputEl.addEventListener('input', () => this.search(this.inputEl.value.trim()));

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
          const q = chip.getAttribute('data-query') || '';
          this.inputEl.value = q;
          this.search(q);
        });
      });

      return modal;
    },

    search(query) {
      const q = (query || '').toLowerCase();
      const results = [];

      // 1. Поиск по героям
      if (window.heroesDatabase && Array.isArray(window.heroesDatabase)) {
        window.heroesDatabase.forEach(h => {
          const textToSearch = [
            h.name || '',
            h.rank || '',
            h.specialty || '',
            h.awards || '',
            h.battle || '',
            h.callsign || '',
            h.years || '',
            h.order || ''
          ].join(' ').toLowerCase();

          if (!q || textToSearch.includes(q)) {
            results.push({
              category: 'Герои Мемориала',
              title: h.name,
              subtitle: `${h.rank || 'Выпускник СРМК'} • ${h.specialty || 'Специальность колледжа'} • ${h.awards || ''}`,
              icon: '🎖',
              url: `index.html#heroes-grid`,
              action: () => {
                this.close();
                if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
                  const card = document.querySelector(`[data-hero-id="${h.id}"]`);
                  if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.click();
                  } else {
                    window.location.hash = '#heroes-grid';
                  }
                } else {
                  window.location.href = `index.html#heroes-grid`;
                }
              }
            });
          }
        });
      }

      // 2. Быстрые действия
      const actions = [
        {
          title: 'Минута молчания',
          subtitle: 'Торжественная 60-секундная поминальная церемония с метрономом и набатом',
          icon: '⏱',
          action: () => {
            this.close();
            if (window.MemorialCeremony && typeof window.MemorialCeremony.start === 'function') {
              window.MemorialCeremony.start();
            } else if (window.MemorialToast) {
              MemorialToast.show('Запуск церемонии Минуты молчания...', 'info');
            }
          }
        },
        {
          title: 'Наградная палата и воинский ранг',
          subtitle: 'Просмотр боевых орденов, званий и курсантского прогресса',
          icon: '🏆',
          action: () => {
            this.close();
            if (window.AchievementsEngine && typeof window.AchievementsEngine.openModal === 'function') {
              window.AchievementsEngine.openModal();
            }
          }
        },
        {
          title: 'Общая аудиоэкскурсия по Мемориалу',
          subtitle: 'Голосовой тур диктора по 4 залам экспозиции СРМК',
          icon: '🎧',
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
          subtitle: 'Интерактивная презентация для интерактивной доски или проектора (F)',
          icon: '🎬',
          action: () => {
            this.close();
            if (window.LessonCinema) {
              window.LessonCinema.start();
            }
          }
        },
        {
          title: 'Создать открытку памяти для соцсетей (9:16 / 1:1)',
          subtitle: 'Брендированная карточка героя с портретом, орденами и QR-кодом',
          icon: '🖼',
          action: () => {
            this.close();
            if (window.MemorialCardGenerator) {
              window.MemorialCardGenerator.openModal();
            }
          }
        },
        {
          title: 'Герой и вопрос сегодняшнего дня',
          subtitle: 'Ежедневная эстафета памяти: экспресс-тест и зажжение свечи (+50 XP)',
          icon: '⭐️',
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
        if (!q || act.title.toLowerCase().includes(q) || act.subtitle.toLowerCase().includes(q)) {
          results.push({
            category: 'Действия и церемонии',
            title: act.title,
            subtitle: act.subtitle,
            icon: act.icon,
            action: act.action
          });
        }
      });

      // 3. Залы и модули музея
      const modules = [
        { title: 'Электронная Книга Памяти', subtitle: '21 исторический том и биографические очерки', icon: '📖', url: 'memory-book.html' },
        { title: '3D Фолиант Памяти', subtitle: 'Интерактивная книга с перелистыванием страниц и аудиоволной', icon: '📚', url: 'reader.html' },
        { title: 'Исторический квест «Дорогами мужества»', subtitle: '32 вопроса по подвигам героев и Зал Славы', icon: '⚔️', url: 'quiz.html' },
        { title: 'Генератор сертификатов', subtitle: 'Оформление официального именного документа с QR-кодом', icon: '📜', url: 'certificate.html' },
        { title: 'Стена Памяти и лампады', subtitle: 'Зажжение поминальных огней и отзывы в реальном времени', icon: '🕯', url: 'guestbook.html' },
        { title: 'Конструктор «Парта Героя»', subtitle: 'Настольные таблички А4 с персональными QR-кодами', icon: '🪑', url: 'desk-qr.html' },
        { title: 'Методический кабинет', subtitle: 'Технологические карты Уроков Мужества для педагогов', icon: '📑', url: 'methodology.html' },
        { title: 'Паспорт музейного комплекса', subtitle: 'Официальный регистрационный паспорт экспозиции', icon: '📋', action: () => {
          this.close();
          if (window.NavigationEngine && typeof window.NavigationEngine.openPassportModal === 'function') {
            window.NavigationEngine.openPassportModal();
          }
        }}
      ];

      modules.forEach(mod => {
        if (!q || mod.title.toLowerCase().includes(q) || mod.subtitle.toLowerCase().includes(q)) {
          results.push({
            category: 'Залы и сервисы музея',
            title: mod.title,
            subtitle: mod.subtitle,
            icon: mod.icon,
            url: mod.url,
            action: mod.action || (() => {
              this.close();
              window.location.href = mod.url;
            })
          });
        }
      });

      this.items = results.slice(0, 25);
      this.selectedIndex = 0;
      this.renderResults();
    },

    renderResults() {
      if (!this.resultsEl) return;
      if (this.items.length === 0) {
        this.resultsEl.innerHTML = `
          <div class="spotlight-empty">
            <span style="font-size:1.8rem; display:block; margin-bottom:8px;">🕊</span>
            Ничего не найдено по вашему запросу.<br>
            <small style="color:var(--text-tertiary, #9da6b3); font-size:0.75rem;">Попробуйте имя героя, звание, медаль или рубеж боев.</small>
          </div>
        `;
        return;
      }

      let html = '';
      let currentCategory = '';

      this.items.forEach((item, index) => {
        if (item.category !== currentCategory) {
          currentCategory = item.category;
          html += `<div class="spotlight-group-title">${currentCategory}</div>`;
        }
        const isSelected = index === this.selectedIndex;
        html += `
          <div class="spotlight-item ${isSelected ? 'selected' : ''}" data-index="${index}">
            <span class="spotlight-item-icon">${item.icon}</span>
            <div class="spotlight-item-body">
              <strong class="spotlight-item-title">${item.title}</strong>
              <small class="spotlight-item-sub">${item.subtitle}</small>
            </div>
            <span class="spotlight-item-arrow">↵</span>
          </div>
        `;
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
          el.scrollIntoView({ block: 'nearest' });
        } else {
          el.classList.remove('selected');
        }
      });
    },

    executeSelected() {
      const selected = this.items[this.selectedIndex];
      if (selected && typeof selected.action === 'function') {
        selected.action();
      }
    }
  };

  SpotlightSearch.init();
  window.SpotlightSearch = SpotlightSearch;
})();
