/**
 * ============================================================================
 * УНИВЕРСАЛЬНЫЙ НАВИГАЦИОННЫЙ ДВИЖОК: js/navigation.js (v7.0 Universal Master)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Единый синглтон-модуль модального окна «Паспорт проекта»
 * 2. Диспетчер выпадающего меню цифровых модулей (Десктоп)
 * 3. Мобильное выдвижное меню (Drawer) для всех страниц экспозиции
 * 4. Управление шторкой и Bottom Tab Bar для PWA-версии (mobile.html)
 * 5. Автоматическую подсветку активных страниц и разделов
 * ============================================================================
 */

(function() {
  'use strict';

  const NavigationEngine = {
    passportModalEl: null,

    init() {
      // 1. Инициализация стандартной шапки сайта
      this.initStandardHeaderDropdown();
      this.initStandardMobileDrawer();

      // 2. Инициализация мобильного приложения (mobile.html)
      this.initMobileAppPanel();
      this.initBottomTabBar();
      this.initPlaqueToggles();

      // 3. Единый модуль паспорта проекта
      this.initPassportTriggers();

      // 4. Центр управления базой данных Supabase (GitHub Pages)
      this.initSupabaseControlCenter();

      // 5. Виджет живого присутствия в залах (Live Presence)
      this.initLivePresence();

      // 6. Наградная палата и воинские ранги в шапке
      this.initHeaderAchievements();

      // 7. PWA Модуль и Service Worker
      this.initPwaModule();

      // 8. Spotlight Поиск (Ctrl+K)
      this.initSpotlightBinding();

      // 9. Тумблер звука и церемония Минуты молчания
      this.initSoundAndCeremony();

      // 10. Загрузка интерактивных модулей Спринта 2
      this.loadInteractiveSprintModules();

      // 11. Подсветка активной страницы
      this.highlightActivePage();

      console.log("[NavigationEngine v7.0 Master] Навигация и единый паспорт музея активны.");
    },

    /**
     * ========================================================================
     * 1. ЕДИНЫЙ ПАСПОРТ ПРОЕКТА (СИНГЛТОН-МОДУЛЬ)
     * ========================================================================
     */
    initPassportTriggers() {
      // Слушаем все возможные кнопки вызова паспорта на любой странице
      document.addEventListener('click', (e) => {
        const target = e.target.closest('#btnOpenPassport, #drawerPassportBtn, [data-open-passport]');
        if (target) {
          e.preventDefault();
          this.openPassportModal();
        }
      });
    },

    /**
     * Создание или получение экземпляра модального окна паспорта
     */
    getOrCreatePassportModal() {
      let modal = document.getElementById('passportModal');
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = 'passportModal';
      modal.className = 'modal passport-modal-wrapper';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'passportModalTitle');
      modal.setAttribute('aria-hidden', 'true');

      modal.innerHTML = `
        <div class="modal-overlay" id="passportOverlay"></div>
        <div class="modal-dialog passport-dialog" style="max-width: 780px; position:relative; z-index:2; background:#12151c; border:1px solid rgba(197, 160, 89, 0.35); padding:34px 28px; border-radius:4px; box-shadow:0 20px 50px rgba(0,0,0,0.95);">
          <button class="modal-close" id="passportCloseBtn" type="button" aria-label="Закрыть паспорт">&times;</button>
          
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span style="font-size:0.7rem; color:#c5a059; text-transform:uppercase; font-weight:800; letter-spacing:1.5px; border:1px solid rgba(197,160,89,0.3); padding:2px 8px; border-radius:2px;">Официальный документ</span>
            <span style="font-size:0.72rem; color:#9da6b3;">Всероссийская акция «Карта доблести»</span>
          </div>

          <h2 id="passportModalTitle" style="font-family:'Cinzel', Georgia, serif; font-size:1.45rem; color:#ffffff; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
            Паспорт виртуального мемориального комплекса
          </h2>

          <div style="overflow-x:auto;">
            <table class="passport-table" style="width:100%; border-collapse:collapse; font-size:0.86rem; color:#d8deea;">
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059; width:34%;">Наименование проекта:</td>
                <td style="padding:10px 8px; font-weight:600; color:#ffffff;">«Быть воином — жить вечно»</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Образовательная организация:</td>
                <td style="padding:10px 8px;">ГБПОУ «Ставропольский региональный многопрофильный колледж»</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Конкурсная номинация:</td>
                <td style="padding:10px 8px;">«За партой героя» (Всероссийская акция «Имя в истории»)</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Руководитель проекта:</td>
                <td style="padding:10px 8px;"><strong>Е. В. Бледных</strong>, директор ГБПОУ СРМК, кандидат исторических наук</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Научный куратор:</td>
                <td style="padding:10px 8px;"><strong>А. В. Генте</strong>, преподаватель истории высшей квалификационной категории</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Инженер-разработчик:</td>
                <td style="padding:10px 8px;"><strong>А. И. Андреев</strong>, студент отделения информационных технологий «ИСиП»</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Мемориальный фонд:</td>
                <td style="padding:10px 8px;">20 выпускников колледжа — кавалеров Орденов Мужества и государственных наград</td>
              </tr>
              <tr>
                <td style="padding:10px 8px; font-weight:700; color:#c5a059;">Цифровые сервисы:</td>
                <td style="padding:10px 8px; font-size:0.8rem; color:#9da6b3;">
                  2.5D Мемориал Славы • 3D Фолиант-читалка • Электронная Книга Памяти • Квест-викторина • Конструктор «Парта Героя» А4 • Генератор и Реестр верификации сертификатов (SHA-256) • Стена Памяти (Realtime)
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-top:22px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <a href="https://карта-доблести.рф" target="_blank" rel="noopener noreferrer" style="color:#c5a059; font-size:0.8rem; font-weight:700; text-decoration:underline;">
              Портал акции «Карта Доблести РФ» →
            </a>
            <button onclick="NavigationEngine.closePassportModal()" type="button" class="btn-verify btn-verify-secondary" style="padding:8px 20px; font-size:0.82rem;">
              Закрыть окно
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Привязка обработчиков закрытия к новому окну
      modal.querySelector('#passportOverlay')?.addEventListener('click', () => this.closePassportModal());
      modal.querySelector('#passportCloseBtn')?.addEventListener('click', () => this.closePassportModal());

      return modal;
    },

    openPassportModal() {
      const modal = this.getOrCreatePassportModal();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Слушатель закрытия по Escape
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          this.closePassportModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    },

    closePassportModal() {
      const modal = document.getElementById('passportModal');
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = 'auto';
    },

    /**
     * ========================================================================
     * 2. ВЫПАДАЮЩИЕ СПИСКИ ЦИФРОВЫХ МОДУЛЕЙ И СТРАНИЦ (ДЕСКТОП)
     * ========================================================================
     */
    initStandardHeaderDropdown() {
      const dropdowns = document.querySelectorAll('.site-header .header-dropdown, .site-header .modules-dropdown');
      if (dropdowns.length === 0) return;

      const closeAllDropdowns = () => {
        dropdowns.forEach(d => {
          d.classList.remove('active');
          const btn = d.querySelector('.header-dropdown-btn, .btn-dropdown-toggle');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      };

      dropdowns.forEach(dropdown => {
        const toggleBtn = dropdown.querySelector('.header-dropdown-btn, .btn-dropdown-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const wasActive = dropdown.classList.contains('active');

          // Закрываем все остальные открытые меню
          closeAllDropdowns();

          // Переключаем текущее меню
          if (!wasActive) {
            dropdown.classList.add('active');
            toggleBtn.setAttribute('aria-expanded', 'true');
          }
        });

        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
          item.addEventListener('click', () => {
            dropdown.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
          });
        });
      });

      // Клик вне шапки или меню закрывает все дропдауны
      document.addEventListener('click', (e) => {
        let insideAny = false;
        dropdowns.forEach(d => {
          if (d.contains(e.target)) insideAny = true;
        });
        if (!insideAny) {
          closeAllDropdowns();
        }
      });

      // Нажатие Escape закрывает все меню
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllDropdowns();
        }
      });

      // Плавная прокрутка для якорных ссылок при клике из меню на той же странице
      document.addEventListener('click', (e) => {
        const link = e.target.closest('.dropdown-item[href*="#"], .drawer-link[href*="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const isIndex = currentPath === 'index.html' || currentPath === '' || currentPath === '/';

        if (isIndex && (href.startsWith('index.html#') || href.startsWith('#'))) {
          const hashIndex = href.indexOf('#');
          if (hashIndex !== -1) {
            const hash = href.substring(hashIndex);
            const targetEl = document.querySelector(hash);
            if (targetEl) {
              e.preventDefault();
              closeAllDropdowns();
              if (this.setDrawerState) this.setDrawerState(false);
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              history.replaceState(null, '', hash);
            }
          }
        }
      });
    },

    setDropdownState(open) {
      const dropdown = document.getElementById('modulesDropdown');
      const toggleBtn = document.getElementById('btnDropdownToggle');
      if (!dropdown || !toggleBtn) return;

      dropdown.classList.toggle('active', open);
      toggleBtn.setAttribute('aria-expanded', String(open));
    },

    /**
     * ========================================================================
     * 3. ВЫДВИЖНОЕ МОБИЛЬНОЕ МЕНЮ (DRAWER)
     * ========================================================================
     */
    initStandardMobileDrawer() {
      const burgerBtn = document.getElementById('mobileBurgerBtn');
      const drawer = document.getElementById('mobileDrawer');
      if (!burgerBtn || !drawer) return;

      burgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = drawer.classList.contains('active') || drawer.getAttribute('aria-hidden') === 'false';
        this.setDrawerState(!isOpen);
      });

      drawer.querySelectorAll('.drawer-link').forEach(link => {
        link.addEventListener('click', () => this.setDrawerState(false));
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.setDrawerState(false);
      });
    },

    setDrawerState(open) {
      const burgerBtn = document.getElementById('mobileBurgerBtn');
      const drawer = document.getElementById('mobileDrawer');
      if (!burgerBtn || !drawer) return;

      drawer.classList.toggle('active', open);
      drawer.setAttribute('aria-hidden', String(!open));
      burgerBtn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : 'auto';
    },

    /**
     * ========================================================================
     * 4. ВЕРХНЯЯ ШТОРКА МОДУЛЕЙ НА MOBILE.HTML
     * ========================================================================
     */
    initMobileAppPanel() {
      const toggle = document.getElementById('mobileModulesToggle');
      const panel = document.getElementById('mobileModulesPanel');
      if (!toggle || !panel) return;

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = panel.classList.contains('active');
        this.setMobilePanelState(!isOpen);
      });

      panel.querySelectorAll('.mobile-module-link').forEach(link => {
        link.addEventListener('click', () => this.setMobilePanelState(false));
      });

      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !toggle.contains(e.target)) {
          this.setMobilePanelState(false);
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.setMobilePanelState(false);
      });
    },

    setMobilePanelState(open) {
      const toggle = document.getElementById('mobileModulesToggle');
      const panel = document.getElementById('mobileModulesPanel');
      if (!toggle || !panel) return;

      panel.classList.toggle('active', open);
      panel.setAttribute('aria-hidden', String(!open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню модулей' : 'Открыть меню модулей');
      document.body.style.overflow = open ? 'hidden' : 'auto';
    },

    /**
     * ========================================================================
     * 5. ЕДИНАЯ НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ (UNIVERSAL BOTTOM APP TAB BAR)
     * ========================================================================
     */
    initBottomTabBar() {
      let bar = document.querySelector('.bottom-app-bar');
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const isMobileMain = currentPath === 'mobile.html' || currentPath === 'index.html' || currentPath === '';
      const isBook = currentPath === 'memory-book.html' || currentPath === 'reader.html';
      const isQuiz = currentPath === 'quiz.html';
      const isCert = currentPath === 'certificate.html' || currentPath === 'verify.html';

      // Если панель еще не создана в статическом HTML (на десктопных страницах), создаем динамически
      if (!bar) {
        bar = document.createElement('nav');
        bar.className = 'bottom-app-bar';
        bar.setAttribute('aria-label', 'Нижнее меню приложения');
        bar.innerHTML = `
          <a href="mobile.html#memorial" class="app-tab ${isMobileMain ? 'active' : ''}" data-tab="memorial">
            <span class="app-tab-icon">🏛</span>
            <span>Мемориал</span>
          </a>
          <a href="memory-book.html" class="app-tab ${isBook ? 'active' : ''}" data-tab="book">
            <span class="app-tab-icon">📖</span>
            <span>Книга</span>
          </a>
          <a href="quiz.html" class="app-tab ${isQuiz ? 'active' : ''}" data-tab="quiz">
            <span class="app-tab-icon">⚔️</span>
            <span>Квест</span>
          </a>
          <a href="certificate.html" class="app-tab ${isCert ? 'active' : ''}" data-tab="cert">
            <span class="app-tab-icon">📜</span>
            <span>Грамота</span>
          </a>
          <button type="button" class="app-tab" data-tab="rank" id="tabUniversalOpenAchievements" title="Наградная палата">
            <span class="app-tab-icon">🎖️</span>
            <span>Награды</span>
          </button>
        `;
        document.body.appendChild(bar);
      }

      // Слушатель для кнопки наград в таб-баре
      const rankTabBtn = bar.querySelector('#tabUniversalOpenAchievements, [data-tab="rank"]');
      if (rankTabBtn) {
        rankTabBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (navigator.vibrate) try { navigator.vibrate(15); } catch(err){}
          if (window.AchievementsEngine) {
            window.AchievementsEngine.openModal();
          }
        });
      }

      const tabs = bar.querySelectorAll('.app-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          if (navigator.vibrate) try { navigator.vibrate(12); } catch(err){}
          const href = tab.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetElement = document.querySelector(href);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              history.replaceState(null, '', href);
            }
          }
        });
      });

      if ('IntersectionObserver' in window && isMobileMain) {
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const currentId = `#${entry.target.id}`;
              tabs.forEach(tab => {
                if (tab.getAttribute('href') === currentId) {
                  tabs.forEach(t => t.classList.remove('active'));
                  tab.classList.add('active');
                }
              });
            }
          });
        }, { threshold: 0.35 });

        sections.forEach(s => observer.observe(s));
      }
    },

    /**
     * ========================================================================
     * 6. ПЕРЕКЛЮЧЕНИЕ ПЛИТ МЕМОРИАЛА
     * ========================================================================
     */
    initPlaqueToggles() {
      document.querySelectorAll('.plaque-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.plaque-toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const view = btn.dataset.plaqueView;
          const leftZone = document.getElementById('leftPlaqueZone');
          const rightZone = document.getElementById('rightPlaqueZone');

          if (!leftZone || !rightZone) return;

          if (view === 'left') {
            leftZone.style.display = 'block';
            rightZone.style.display = 'none';
          } else if (view === 'right') {
            leftZone.style.display = 'none';
            rightZone.style.display = 'block';
          } else {
            leftZone.style.display = 'block';
            rightZone.style.display = 'block';
          }
        });
      });
    },

    /**
     * ========================================================================
     * 7. ПОДСВЕТКА ТЕКУЩЕЙ СТРАНИЦЫ В МЕНЮ
     * ========================================================================
     */
    highlightActivePage() {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';

      document.querySelectorAll('.site-header .dropdown-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPath) && (currentPath !== 'index.html' || !href.includes('#'))) {
          item.classList.add('active');
          const parentDropdown = item.closest('.header-dropdown, .modules-dropdown');
          if (parentDropdown) {
            const btn = parentDropdown.querySelector('.header-dropdown-btn, .btn-dropdown-toggle');
            if (btn) btn.classList.add('child-active');
          }
        }
      });

      document.querySelectorAll('.drawer-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPath)) {
          link.classList.add('highlight');
        }
      });
    },

    /**
     * ========================================================================
     * 8. ЦЕНТР УПРАВЛЕНИЯ И СТАТУС SUPABASE (GITHUB PAGES OMNI-SYNC)
     * ========================================================================
     */
    /**
     * ========================================================================
     * 4. ЗАКРЫТЫЙ ЦЕНТР УПРАВЛЕНИЯ SUPABASE (ДЛЯ АДМИНИСТРАТОРОВ СРМК)
     * Доступ: только через CMS (Ctrl+Shift+A) или закрытое сочетание Ctrl+Shift+S с паролем (2026).
     * Полностью исключен из публичного интерфейса для обычных посетителей музея.
     * ========================================================================
     */
    initSupabaseControlCenter() {
      // Публичные кнопки статуса и меню удалены.
      // Слушатель кликов по элементам с data-open-supabase (например, в закрытой админке)
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-open-supabase]');
        if (target) {
          e.preventDefault();
          this.openSupabaseModal();
        }
      });

      // Скрытые горячие клавиши администратора: Ctrl+Shift+S / Ctrl+Shift+Ы (с проверкой пароля)
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's' || e.key === 'Ы' || e.key === 'ы')) {
          e.preventDefault();
          this.openSupabaseModal();
        }
      });

      // Слушатель изменения статуса от CloudSync
      window.addEventListener('srmk-supabase-status', (e) => {
        const detail = e.detail || {};
        this.updateSupabaseBadge(detail.status, detail.message, detail.isLive);
      });

      // Если CloudSync уже инициализировался
      if (window.CloudSync) {
        this.updateSupabaseBadge(window.CloudSync.status || 'offline', window.CloudSync.statusMessage || '', window.CloudSync.isLive);
      }
    },

    updateSupabaseBadge(status, message, isLive) {
      const modalStatusBox = document.getElementById('spbModalStatusText');
      if (modalStatusBox) {
        modalStatusBox.textContent = message || (isLive ? 'Подключено к Supabase' : 'Офлайн-режим');
      }
      const badge = document.getElementById('spbModalStatusBadge');
      if (badge) {
        badge.textContent = isLive ? '🟢 Онлайн' : '🟡 Офлайн';
        badge.style.background = isLive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)';
        badge.style.color = isLive ? '#34d399' : '#fbbf24';
      }
    },

    getOrCreateSupabaseModal() {
      let modal = document.getElementById('supabaseConfigModal');
      if (modal) return modal;

      modal = document.createElement('div');
      modal.id = 'supabaseConfigModal';
      modal.className = 'modal supabase-modal-wrapper';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');

      const curUrl = (window.SRMK_CONFIG?.SUPABASE_URL || 'https://qtafcczydgyrganrpkof.supabase.co');
      const curKey = (window.SRMK_CONFIG?.SUPABASE_ANON_KEY || '');

      modal.innerHTML = `
        <div class="modal-overlay" id="supabaseModalOverlay"></div>
        <div class="modal-dialog supabase-dialog">
          <button class="modal-close" id="supabaseModalCloseBtn" type="button" aria-label="Закрыть настройки">&times;</button>
          
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <span style="font-size:0.7rem; color:#c5a059; text-transform:uppercase; font-weight:800; letter-spacing:1.5px; border:1px solid rgba(197,160,89,0.3); padding:2px 8px; border-radius:2px;">Supabase Omni-Sync</span>
            <span style="font-size:0.72rem; color:#9da6b3;">Статический сайт GitHub Pages</span>
          </div>

          <h2 style="font-family:'Cinzel', Georgia, serif; font-size:1.35rem; color:#ffffff; margin:0 0 16px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
            Центр управления базой данных Supabase
          </h2>

          <div class="supabase-status-box" id="spbModalStatusBox">
            <div>
              <strong style="color:#ffffff;">Текущий статус:</strong>
              <span id="spbModalStatusText" style="color:#d8deea; margin-left:6px;">Проверка связи...</span>
            </div>
            <span id="spbModalStatusBadge" style="font-size:0.74rem; padding:3px 8px; border-radius:3px; background:rgba(255,255,255,0.1); color:#fff;">
              ${window.CloudSync?.isLive ? '🟢 Онлайн' : '🟡 Офлайн'}
            </span>
          </div>

          <div class="supabase-field-group">
            <label for="cfgInputUrl">URL проекта Supabase (Project URL):</label>
            <input type="url" id="cfgInputUrl" value="${curUrl}" placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co" autocomplete="off" spellcheck="false">
            <small style="font-size:0.74rem; color:#9da6b3; display:block; margin-top:4px;">
              Скопируйте из панели Supabase Dashboard ➔ Project Settings ➔ API ➔ Project URL
            </small>
          </div>

          <div class="supabase-field-group">
            <label for="cfgInputKey">Публичный анонимный ключ (Anon / Public API Key):</label>
            <input type="text" id="cfgInputKey" value="${curKey}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." autocomplete="off" spellcheck="false">
            <small style="font-size:0.74rem; color:#9da6b3; display:block; margin-top:4px;">
              Публичный безопасный ключ из Project Settings ➔ API ➔ Project API keys (anon public)
            </small>
          </div>

          <div id="spbTestResultBox" style="display:none; padding:10px 14px; border-radius:4px; font-size:0.82rem; margin-bottom:14px;"></div>

          <div class="supabase-actions-row">
            <button type="button" class="btn-supabase-action btn-supabase-secondary" id="btnTestSupabaseConn">
              🔍 Проверить связь
            </button>
            <button type="button" class="btn-supabase-action btn-supabase-primary" id="btnSaveSupabaseConn">
              💾 Сохранить и подключить
            </button>
            <button type="button" class="btn-supabase-action btn-supabase-seed" id="btnSeedSupabaseData" title="Заполнить пустые таблицы 20 героями колледжа">
              🌱 Заполнить базу (20 героев)
            </button>
            <button type="button" class="btn-supabase-action" id="btnResetSupabaseConn" style="background:transparent; color:#9da6b3; border-color:rgba(255,255,255,0.15);" title="Сбросить к исходным настройкам">
              ↺ Сбросить
            </button>
          </div>

          <div style="margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.75rem; color:#64748b;">
              💡 Изменения сохраняются в браузере. Сайт продолжит работать на GitHub Pages даже в офлайн-режиме.
            </span>
            <a href="javascript:void(0)" id="linkShowSqlHelp" style="font-size:0.78rem; color:#c5a059; text-decoration:underline;">
              Инструкция по миграции SQL ↗
            </a>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const closeBtn = modal.querySelector('#supabaseModalCloseBtn');
      const overlay = modal.querySelector('#supabaseModalOverlay');
      closeBtn?.addEventListener('click', () => this.closeSupabaseModal());
      overlay?.addEventListener('click', () => this.closeSupabaseModal());

      // 1. Проверить связь
      modal.querySelector('#btnTestSupabaseConn')?.addEventListener('click', async () => {
        const url = modal.querySelector('#cfgInputUrl').value.trim();
        const key = modal.querySelector('#cfgInputKey').value.trim();
        const resultBox = modal.querySelector('#spbTestResultBox');
        
        resultBox.style.display = 'block';
        resultBox.style.background = 'rgba(59, 130, 246, 0.15)';
        resultBox.style.color = '#93c5fd';
        resultBox.textContent = '⏳ Выполняется тестовый запрос к Supabase...';

        if (window.CloudSync && typeof window.CloudSync.testConnection === 'function') {
          const res = await window.CloudSync.testConnection(url, key);
          if (res.success) {
            resultBox.style.background = 'rgba(16, 185, 129, 0.18)';
            resultBox.style.color = '#34d399';
            resultBox.innerHTML = `✓ <strong>Успешно!</strong> ${res.message}`;
          } else {
            resultBox.style.background = 'rgba(239, 68, 68, 0.18)';
            resultBox.style.color = '#fca5a5';
            resultBox.innerHTML = `✗ <strong>Ошибка связи:</strong> ${res.message}`;
          }
        }
      });

      // 2. Сохранить и подключить
      modal.querySelector('#btnSaveSupabaseConn')?.addEventListener('click', () => {
        const url = modal.querySelector('#cfgInputUrl').value.trim();
        const key = modal.querySelector('#cfgInputKey').value.trim();
        if (window.SRMK_CONFIG && typeof window.SRMK_CONFIG.saveCustomConfig === 'function') {
          window.SRMK_CONFIG.saveCustomConfig(url, key);
        }
        if (window.MemorialToast) {
          MemorialToast.show('Настройки Supabase сохранены. Подключение...', 'info');
        }
        setTimeout(() => this.closeSupabaseModal(), 700);
      });

      // 3. Заполнить базу (20 героев)
      modal.querySelector('#btnSeedSupabaseData')?.addEventListener('click', async () => {
        const resultBox = modal.querySelector('#spbTestResultBox');
        resultBox.style.display = 'block';
        resultBox.style.background = 'rgba(59, 130, 246, 0.15)';
        resultBox.style.color = '#93c5fd';
        resultBox.textContent = '🌱 Синхронизация 20 героев с базой данных Supabase...';

        if (window.CloudSync && typeof window.CloudSync.seedDatabase === 'function') {
          const res = await window.CloudSync.seedDatabase();
          if (res.success) {
            resultBox.style.background = 'rgba(16, 185, 129, 0.18)';
            resultBox.style.color = '#34d399';
            resultBox.innerHTML = `✓ <strong>Синхронизировано!</strong> ${res.message}`;
          } else {
            resultBox.style.background = 'rgba(239, 68, 68, 0.18)';
            resultBox.style.color = '#fca5a5';
            resultBox.innerHTML = `✗ ${res.message}`;
          }
        }
      });

      // 4. Сбросить
      modal.querySelector('#btnResetSupabaseConn')?.addEventListener('click', () => {
        if (confirm('Сбросить настройки подключения к исходным значениям?')) {
          if (window.SRMK_CONFIG && typeof window.SRMK_CONFIG.resetToDefault === 'function') {
            window.SRMK_CONFIG.resetToDefault();
          }
          modal.querySelector('#cfgInputUrl').value = window.DEFAULT_CONFIG?.SUPABASE_URL || '';
          modal.querySelector('#cfgInputKey').value = window.DEFAULT_CONFIG?.SUPABASE_ANON_KEY || '';
          if (window.MemorialToast) {
            MemorialToast.show('Настройки сброшены к значениям по умолчанию.', 'info');
          }
        }
      });

      // 5. Ссылка на SQL помощь
      modal.querySelector('#linkShowSqlHelp')?.addEventListener('click', () => {
        alert(
          'ИНСТРУКЦИЯ ПО НАСТРОЙКЕ SUPABASE:\n\n' +
          '1. Откройте ваш проект на https://supabase.com/dashboard\n' +
          '2. Перейдите в раздел "SQL Editor" -> "New Query"\n' +
          '3. Скопируйте и вставьте всё содержимое файла supabase_migration.sql из корня проекта\n' +
          '4. Нажмите кнопку "Run" для создания всех 13 таблиц, индексов и RLS-политик\n' +
          '5. Вставьте URL и Anon Key в это окно и нажмите "Заполнить базу (20 героев)"!'
        );
      });

      return modal;
    },

    openSupabaseModal(skipAuth = false) {
      // Защита от несанкционированного доступа:
      // Доступ разрешен только если открыта CMS или введен пароль администратора СРМК (2026)
      const isAdminOpen = document.getElementById('adminDashboard')?.classList.contains('active');
      const isAlreadyAuthed = Boolean(window._srmkAdminAuthenticated || isAdminOpen);

      if (!skipAuth && !isAlreadyAuthed) {
        const entered = prompt("Доступ к управлению базой данных защищен.\nВведите пароль администратора СРМК (2026):", "");
        if (entered !== "2026") {
          if (entered !== null) {
            if (window.MemorialToast) {
              MemorialToast.show("Отказ в доступе: Неверный пароль администратора.", "error");
            } else {
              alert("Отказ в доступе: Неверный пароль.");
            }
          }
          return;
        }
        window._srmkAdminAuthenticated = true;
      }

      const modal = this.getOrCreateSupabaseModal();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const isLive = Boolean(window.CloudSync?.isLive);
      const statusMsg = window.CloudSync?.statusMessage || (isLive ? 'Supabase Realtime Онлайн' : 'Офлайн (Локальный режим)');
      const statusBox = modal.querySelector('#spbModalStatusText');
      const badge = modal.querySelector('#spbModalStatusBadge');
      if (statusBox) statusBox.textContent = statusMsg;
      if (badge) {
        badge.textContent = isLive ? '🟢 Онлайн' : '🟡 Офлайн';
        badge.style.background = isLive ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)';
        badge.style.color = isLive ? '#34d399' : '#fbbf24';
      }
    },

    closeSupabaseModal() {
      const modal = document.getElementById('supabaseConfigModal');
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = 'auto';
    },

    /**
     * ========================================================================
     * 5. ЖИВОЙ ОНЛАЙН В ЗАЛАХ (LIVE PRESENCE)
     * ========================================================================
     */
    initLivePresence() {
      const headerActions = document.querySelector('.site-header .header-actions');
      if (headerActions && !document.getElementById('hdrLivePresence')) {
        const pill = document.createElement('div');
        pill.className = 'header-presence-pill';
        pill.id = 'hdrLivePresence';
        pill.title = 'Посетители в залах памяти прямо сейчас';
        pill.innerHTML = `
          <span class="presence-dot"></span>
          <span class="presence-text"><strong id="hdrPresenceCount">1</strong> <span class="presence-label-full">в залах</span></span>
        `;
        const burger = headerActions.querySelector('.mobile-burger-btn');
        if (burger) {
          headerActions.insertBefore(pill, burger);
        } else {
          headerActions.appendChild(pill);
        }

        pill.addEventListener('click', () => {
          const count = document.getElementById('hdrPresenceCount')?.textContent || '1';
          if (window.MemorialToast) {
            MemorialToast.show(`👥 Прямо сейчас в залах виртуального мемориала: ${count} посетителей`, 'info');
          }
        });
      }

      // Функция отображения РЕАЛЬНОГО числа посетителей онлайн через Supabase Realtime Presence
      const updatePresenceDisplay = () => {
        let count = 1;
        if (window.CloudSync && typeof window.CloudSync.getLivePresenceCount === 'function' && window.CloudSync.isLive) {
          count = window.CloudSync.getLivePresenceCount();
        } else if (window.HallAnalytics && typeof window.HallAnalytics.getActiveVisitorsCount === 'function') {
          count = window.HallAnalytics.getActiveVisitorsCount();
        } else {
          count = 1; // Реальный счетчик: 1 (текущий посетитель)
        }
        const countEl = document.getElementById('hdrPresenceCount');
        if (countEl) countEl.textContent = count;
      };

      updatePresenceDisplay();
      setInterval(updatePresenceDisplay, 5000);

      window.addEventListener('srmk-presence-updated', (e) => {
        const c = e.detail?.count || (window.CloudSync?.getLivePresenceCount ? window.CloudSync.getLivePresenceCount() : 1);
        const countEl = document.getElementById('hdrPresenceCount');
        if (countEl) countEl.textContent = c;
      });
    },

    /**
     * ========================================================================
     * 6. НАГРАДНАЯ ПАЛАТА И РАНГИ В ШАПКЕ
     * ========================================================================
     */
    initHeaderAchievements() {
      const headerActions = document.querySelector('.site-header .header-actions');
      if (headerActions && !document.getElementById('btnHeaderRankBadge')) {
        const badge = document.createElement('button');
        badge.type = 'button';
        badge.id = 'btnHeaderRankBadge';
        badge.className = 'btn-header-achievements';
        badge.title = 'Воинский ранг и наградные ордена (нажмите для открытия)';
        badge.innerHTML = `
          <span class="rank-btn-icon">🎖</span>
          <span class="rank-btn-title">Награды</span>
          <span class="rank-xp-badge" id="hdrRankXp">0 XP</span>
        `;
        const presence = document.getElementById('hdrLivePresence');
        if (presence) {
          headerActions.insertBefore(badge, presence);
        } else {
          const burger = headerActions.querySelector('.mobile-burger-btn');
          if (burger) headerActions.insertBefore(badge, burger);
          else headerActions.appendChild(badge);
        }
      }

      // Привязка клика для открытия наградной палаты
      document.addEventListener('click', (e) => {
        const target = e.target.closest('#btnHeaderRankBadge, #drawerAchievementsLink, .btn-open-achievements');
        if (target) {
          e.preventDefault();
          const drawer = document.getElementById('mobileDrawer');
          if (drawer) {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
          }
          if (window.AchievementsEngine && typeof window.AchievementsEngine.openModal === 'function') {
            window.AchievementsEngine.openModal();
          } else if (window.MemorialToast) {
            MemorialToast.show('Наградная палата загружается...', 'info');
          }
        }
      });

      // Обновление отображения ранга и XP
      const updateRankDisplay = () => {
        if (!window.AchievementsEngine) return;
        const rank = AchievementsEngine.getCurrentRank();
        const xp = AchievementsEngine.getXP();
        const unlocked = AchievementsEngine.getUnlockedBadges ? AchievementsEngine.getUnlockedBadges().length : 0;

        const xpEl = document.getElementById('hdrRankXp');
        if (xpEl) xpEl.textContent = `${xp} XP`;

        const titleEl = document.querySelector('#btnHeaderRankBadge .rank-btn-title');
        if (titleEl && rank) titleEl.textContent = rank.title;

        const iconEl = document.querySelector('#btnHeaderRankBadge .rank-btn-icon');
        if (iconEl && rank) iconEl.textContent = rank.icon;

        const drawerLink = document.getElementById('drawerAchievementsLink');
        if (drawerLink && rank) {
          drawerLink.innerHTML = `🎖 Звание: <strong>${rank.title}</strong> (${xp} XP) • ${unlocked}/16 наград`;
        }
      };

      setTimeout(updateRankDisplay, 400);
      window.addEventListener('srmk-achievements-updated', updateRankDisplay);
    },

    /**
     * ========================================================================
     * 7. PWA МОДУЛЬ И SERVICE WORKER
     * ========================================================================
     */
    initPwaModule() {
      // 1. Регистрация Service Worker
      if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then(reg => {
              console.log('[PWA] Service Worker активен. Область:', reg.scope);
            })
            .catch(err => {
              console.warn('[PWA] Service Worker не зарегистрирован:', err);
            });
        });
      }

      // 2. Обработка запроса на установку приложения (beforeinstallprompt)
      let deferredPrompt = null;
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const pwaBtn = document.getElementById('btnInstallPwa');
        if (pwaBtn) pwaBtn.style.display = 'inline-flex';
        const drawerPwaBtn = document.getElementById('drawerInstallPwaBtn');
        if (drawerPwaBtn) drawerPwaBtn.style.display = 'block';
        const mobileLink = document.getElementById('mobileInstallPwaLink');
        if (mobileLink) mobileLink.style.display = 'flex';
      });

      const handleInstallClick = async (e) => {
        e.preventDefault();
        if (!deferredPrompt) {
          if (window.MemorialToast) {
            MemorialToast.show('Приложение уже установлено или поддерживается браузером через меню «Установить»', 'info');
          }
          return;
        }
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          if (window.MemorialToast) {
            MemorialToast.show('Приложение Музея успешно установлено!', 'success');
          }
        }
        deferredPrompt = null;
        const pwaBtn = document.getElementById('btnInstallPwa');
        if (pwaBtn) pwaBtn.style.display = 'none';
        const drawerPwaBtn = document.getElementById('drawerInstallPwaBtn');
        if (drawerPwaBtn) drawerPwaBtn.style.display = 'none';
        const mobileLink = document.getElementById('mobileInstallPwaLink');
        if (mobileLink) mobileLink.style.display = 'none';
      };

      document.getElementById('btnInstallPwa')?.addEventListener('click', handleInstallClick);
      document.getElementById('drawerInstallPwaBtn')?.addEventListener('click', handleInstallClick);
      document.getElementById('mobileInstallPwaLink')?.addEventListener('click', handleInstallClick);
    },

    /**
     * ========================================================================
     * 8. ДИНАМИЧЕСКАЯ ЗАГРУЗКА МОДУЛЕЙ СПРИНТА 2
     * ========================================================================
     */
    loadInteractiveSprintModules() {
      const scripts = [
        'js/sound-engine.js',
        'js/spotlight.js',
        'js/memorial-ceremony.js',
        'js/memorial-card-generator.js',
        'js/lesson-cinema.js'
      ];
      const isHome = window.location.pathname.endsWith('index.html') ||
                     window.location.pathname.endsWith('mobile.html') ||
                     window.location.pathname.endsWith('/') ||
                     !window.location.pathname.includes('.html');
      if (isHome) {
        scripts.push('js/live-tributes-ticker.js');
        scripts.push('js/daily-quest.js');
      }

      scripts.forEach(src => {
        if (!document.querySelector(`script[src*="${src}"]`)) {
          const s = document.createElement('script');
          s.src = src;
          document.body.appendChild(s);
        }
      });
    },

    /**
     * ========================================================================
     * 9. SPOTLIGHT ПОИСК (CTRL+K) В ШАПКЕ
     * ========================================================================
     */
    initSpotlightBinding() {
      const headerActions = document.querySelector('.site-header .header-actions');
      if (headerActions && !document.getElementById('btnOpenSpotlight')) {
        const spotBtn = document.createElement('button');
        spotBtn.type = 'button';
        spotBtn.id = 'btnOpenSpotlight';
        spotBtn.className = 'header-spotlight-btn';
        spotBtn.title = 'Быстрый поиск по героям и разделам (Ctrl+K)';
        spotBtn.innerHTML = `
          <span class="spotlight-btn-icon">🔍</span>
          <span class="spotlight-btn-text">Поиск</span>
          <kbd class="spotlight-btn-kbd">Ctrl+K</kbd>
        `;
        const burger = headerActions.querySelector('.mobile-burger-btn');
        if (burger) headerActions.insertBefore(spotBtn, burger);
        else headerActions.appendChild(spotBtn);
      }

      document.addEventListener('click', (e) => {
        const target = e.target.closest('#btnOpenSpotlight, #drawerSpotlightBtn, [data-open-spotlight]');
        if (target) {
          e.preventDefault();
          const drawer = document.getElementById('mobileDrawer');
          if (drawer) {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
          }
          if (window.SpotlightSearch && typeof window.SpotlightSearch.open === 'function') {
            window.SpotlightSearch.open();
          }
        }
      });
    },

    /**
     * ========================================================================
     * 10. ТУМБЛЕР ЗВУКА И ЦЕРЕМОНИЯ МИНУТЫ МОЛЧАНИЯ
     * ========================================================================
     */
    initSoundAndCeremony() {
      // 1. Кнопка звука в шапке
      const headerActions = document.querySelector('.site-header .header-actions');
      if (headerActions && !document.getElementById('btnToggleSound')) {
        const sndBtn = document.createElement('button');
        sndBtn.type = 'button';
        sndBtn.id = 'btnToggleSound';
        sndBtn.className = 'header-sound-btn';
        sndBtn.title = 'Звуковые эффекты мемориала (Вкл/Выкл)';
        sndBtn.innerHTML = `<span id="soundBtnIcon">🔊</span>`;
        const burger = headerActions.querySelector('.mobile-burger-btn');
        if (burger) headerActions.insertBefore(sndBtn, burger);
        else headerActions.appendChild(sndBtn);
      }

      const updateSoundIcon = () => {
        const icon = document.getElementById('soundBtnIcon');
        const btn = document.getElementById('btnToggleSound');
        const enabled = window.SoundEngine ? window.SoundEngine.isEnabled() : true;
        if (icon) icon.textContent = enabled ? '🔊' : '🔇';
        if (btn) {
          if (!enabled) btn.classList.add('muted');
          else btn.classList.remove('muted');
        }
      };

      document.addEventListener('click', (e) => {
        const sndTarget = e.target.closest('#btnToggleSound');
        if (sndTarget) {
          e.preventDefault();
          if (window.SoundEngine) {
            const newState = window.SoundEngine.toggle();
            updateSoundIcon();
            if (window.MemorialToast) {
              MemorialToast.show(newState ? '🔊 Звуковые эффекты мемориала включены' : '🔇 Звуковые эффекты отключены', 'info');
            }
          }
        }

        const silenceTarget = e.target.closest('#drawerSilenceBtn, #btnStartSilence, [data-start-silence]');
        if (silenceTarget) {
          e.preventDefault();
          const drawer = document.getElementById('mobileDrawer');
          if (drawer) {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
          }
          if (window.MemorialCeremony && typeof window.MemorialCeremony.start === 'function') {
            window.MemorialCeremony.start();
          }
        }
      });

      setTimeout(updateSoundIcon, 200);
      window.addEventListener('srmk-sound-toggle', updateSoundIcon);
    }
  };

  window.NavigationEngine = NavigationEngine;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavigationEngine.init());
  } else {
    NavigationEngine.init();
  }
})();