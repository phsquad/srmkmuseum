/**
 * ============================================================================
 * ЕДИНАЯ НАВИГАЦИОННАЯ ОБОЛОЧКА: js/navigation.js (v8.0 Unified Shell)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 *
 * Монтирует в статический скелет #siteHeader и #siteFooter:
 * - 3-слотовую шапку (Бренд, Залы/Модули, Действия: Поиск Ctrl+K, Ранг, ГОСТ/Проектор)
 * - Выдвижное мобильное меню (Drawer)
 * - Нижний 5-кнопочный PWA таб-бар (< 768px)
 * - Единый подвал (srmk.stavedu.ru)
 * - Модальное окно «Паспорт проекта» и регистрацию Service Worker (sw.js)
 * ============================================================================
 */
(function (global) {
  'use strict';

  const HALLS = [
    { href: 'index.html#memorial', icon: '🏛', title: 'Мемориал Славы', sub: 'Зал I • Стелы и 20 кавалеров' },
    { href: 'index.html#heroes-grid', icon: '🎓', title: 'За партой Героя', sub: 'Зал II • 20 интерактивных парт' },
    { href: 'index.html#battle-path', icon: '🗺', title: 'Хроника и Карта', sub: 'Зал III • Боевой путь' },
    { href: 'index.html#memory-hall', icon: '🕯', title: 'Эстафета поколений', sub: 'Зал IV • Клятва и хроника' }
  ];

  const MODULES = [
    { href: 'memory-book.html', icon: '📖', title: 'Книга Памяти', sub: '21 том летописи' },
    { href: 'reader.html', icon: '📚', title: 'Читалка Фолианта', sub: 'Статья и книжный разворот' },
    { href: 'quiz.html', icon: '⚔️', title: 'Квест-викторина', sub: 'Дорогами мужества' },
    { href: 'guestbook.html', icon: '🕯', title: 'Стена Памяти', sub: 'Отзывы и поминальные лампады' },
    { href: 'desk-qr.html', icon: '🪑', title: 'Парта Героя', sub: 'Таблички А4 и QR-коды' },
    { href: 'certificate.html', icon: '📜', title: 'Сертификаты', sub: 'Наградные бланки А4' },
    { href: 'verify.html', icon: '🔎', title: 'Верификация', sub: 'Проверка подлинности' },
    { href: 'methodology.html', icon: '📋', title: 'Методкабинет', sub: 'Уроки Мужества ФГОС' }
  ];

  function currentPageName() {
    const p = window.location.pathname.split('/').pop();
    return p && p.includes('.html') ? p : 'index.html';
  }

  const NavigationEngine = {
    init() {
      this.renderHeader();
      this.renderDrawer();
      this.renderTabbar();
      this.renderFooter();
      this.restoreAccessibility();
      this.bindEvents();
      this.syncRankBadge();
      this.registerServiceWorker();
    },

    renderHeader() {
      const header = document.getElementById('siteHeader');
      if (!header) return;
      const page = currentPageName();

      header.className = 'srmk-header';
      header.innerHTML = `
        <div class="container srmk-header-inner">
          <a href="index.html" class="srmk-brand" aria-label="На главную страницу музея">
            <span class="srmk-brand-badge">СРМК</span>
            <span class="srmk-brand-text">
              <span class="srmk-brand-org">ГБПОУ СРМК • Ставрополь</span>
              <span class="srmk-brand-title">«Быть воином — жить вечно»</span>
            </span>
          </a>

          <nav class="srmk-nav" aria-label="Основная навигация">
            <div class="srmk-nav-item" data-dropdown>
              <button type="button" class="srmk-nav-btn" aria-expanded="false">🏛 Залы ▾</button>
              <div class="srmk-dropdown" role="menu">
                ${HALLS.map(h => `
                  <a href="${h.href}" class="srmk-dropdown-link" role="menuitem">
                    <span>${h.icon}</span>
                    <span><strong>${h.title}</strong><small>${h.sub}</small></span>
                  </a>
                `).join('')}
              </div>
            </div>

            <div class="srmk-nav-item" data-dropdown>
              <button type="button" class="srmk-nav-btn" aria-expanded="false">📖 Модули ▾</button>
              <div class="srmk-dropdown" role="menu">
                ${MODULES.map(m => `
                  <a href="${m.href}" class="srmk-dropdown-link ${page === m.href ? 'active' : ''}" role="menuitem">
                    <span>${m.icon}</span>
                    <span><strong>${m.title}</strong><small>${m.sub}</small></span>
                  </a>
                `).join('')}
              </div>
            </div>

            <a href="memory-book.html" class="srmk-nav-link ${page === 'memory-book.html' ? 'active' : ''}">Книга</a>
            <a href="quiz.html" class="srmk-nav-link ${page === 'quiz.html' ? 'active' : ''}">Квест</a>
            <a href="guestbook.html" class="srmk-nav-link ${page === 'guestbook.html' ? 'active' : ''}">Стена Памяти</a>
            <button type="button" class="srmk-nav-btn" id="btnPassportOpen">Паспорт</button>
          </nav>

          <div class="srmk-actions">
            <button type="button" class="srmk-icon-btn" id="btnOpenSpotlight" title="Поиск (Ctrl+K)" aria-label="Поиск по музею">🔍</button>
            <button type="button" class="srmk-rank-pill" id="btnHeaderRankBadge" data-gamification title="Воинский ранг и награды">
              <span id="hdrRankIcon">🎖️</span>
              <span id="hdrRankTitle">Рядовой</span>
            </button>
            <button type="button" class="srmk-icon-btn" id="btnToggleProjector" title="Режим проектора (F)" aria-label="Режим проектора">📽</button>
            <button type="button" class="srmk-icon-btn" id="btnToggleContrast" title="Контрастный режим ГОСТ" aria-label="Контрастный режим">👁</button>
            <button type="button" class="srmk-icon-btn srmk-menu-toggle" id="btnOpenDrawer" aria-label="Открыть меню" aria-expanded="false">☰</button>
          </div>
        </div>
      `;
    },

    renderDrawer() {
      if (document.getElementById('srmkDrawer')) return;
      const page = currentPageName();

      const backdrop = document.createElement('div');
      backdrop.id = 'srmkDrawerBackdrop';
      backdrop.className = 'srmk-drawer-backdrop';

      const drawer = document.createElement('aside');
      drawer.id = 'srmkDrawer';
      drawer.className = 'srmk-drawer';
      drawer.setAttribute('aria-label', 'Мобильное меню');
      drawer.innerHTML = `
        <div class="srmk-drawer-head">
          <strong>Навигация по музею</strong>
          <button type="button" class="srmk-icon-btn" id="btnCloseDrawer" aria-label="Закрыть меню">&times;</button>
        </div>

        <div>
          <div class="srmk-drawer-group-title">4 зала экспозиции</div>
          <div class="srmk-drawer-list">
            ${HALLS.map(h => `<a href="${h.href}" class="srmk-drawer-link"><span>${h.icon}</span><span>${h.title}</span></a>`).join('')}
          </div>
        </div>

        <div>
          <div class="srmk-drawer-group-title">Модули комплекса</div>
          <div class="srmk-drawer-list">
            ${MODULES.map(m => `<a href="${m.href}" class="srmk-drawer-link ${page === m.href ? 'active' : ''}"><span>${m.icon}</span><span>${m.title}</span></a>`).join('')}
          </div>
        </div>

        <div>
          <div class="srmk-drawer-group-title">Доступность (ГОСТ Р 52872-2019) и режимы</div>
          <div class="srmk-drawer-tools">
            <button type="button" class="btn btn-secondary" id="drawerContrastBtn">Контраст</button>
            <button type="button" class="btn btn-secondary" id="drawerFontBtn">Крупный шрифт</button>
            <button type="button" class="btn btn-secondary" id="drawerProjectorBtn">Проектор (F)</button>
            <button type="button" class="btn btn-secondary" id="drawerPassportBtn">Паспорт</button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      document.body.appendChild(drawer);
    },

    renderTabbar() {
      if (document.getElementById('srmkTabbar')) return;
      const page = currentPageName();
      const tabs = [
        { href: 'index.html#memorial', icon: '🏛', label: 'Залы', match: page === 'index.html' },
        { href: 'index.html#heroes-grid', icon: '🎓', label: 'Герои', match: false },
        { href: 'memory-book.html', icon: '📖', label: 'Книга', match: page === 'memory-book.html' || page === 'reader.html' },
        { href: 'quiz.html', icon: '⚔️', label: 'Квест', match: page === 'quiz.html' },
        { href: 'guestbook.html', icon: '🕯', label: 'Память', match: page === 'guestbook.html' }
      ];

      const nav = document.createElement('nav');
      nav.id = 'srmkTabbar';
      nav.className = 'srmk-tabbar';
      nav.setAttribute('aria-label', 'Быстрая мобильная навигация');
      nav.innerHTML = tabs.map(t => `
        <a href="${t.href}" class="srmk-tabbar-item ${t.match ? 'active' : ''}">
          <span class="tab-icon" aria-hidden="true">${t.icon}</span>
          <span>${t.label}</span>
        </a>
      `).join('');
      document.body.appendChild(nav);
    },

    renderFooter() {
      let footer = document.getElementById('siteFooter');
      if (!footer) {
        footer = document.createElement('footer');
        footer.id = 'siteFooter';
        document.body.appendChild(footer);
      }
      footer.className = 'srmk-footer';
      footer.innerHTML = `
        <div class="container">
          <div class="srmk-footer-grid">
            <div>
              <h4>ГБПОУ «Ставропольский региональный многопрофильный колледж»</h4>
              <p>Цифровой мемориальный комплекс «Быть воином — жить вечно» памяти 20 выпускников колледжа.</p>
              <p style="margin-top:8px;">
                <a href="https://srmk.stavedu.ru" target="_blank" rel="noopener noreferrer">srmk.stavedu.ru</a> • г. Ставрополь, пр. Юности, д. 3
              </p>
            </div>
            <div>
              <h4>Залы и летопись</h4>
              <ul class="srmk-footer-links">
                <li><a href="index.html#memorial">Зал I • Мемориал Славы</a></li>
                <li><a href="index.html#heroes-grid">Зал II • За партой Героя</a></li>
                <li><a href="memory-book.html">Книга Памяти (21 том)</a></li>
                <li><a href="reader.html">Читалка Фолианта</a></li>
              </ul>
            </div>
            <div>
              <h4>Интерактивные сервисы</h4>
              <ul class="srmk-footer-links">
                <li><a href="quiz.html">Исторический квест</a></li>
                <li><a href="certificate.html">Генератор сертификатов</a></li>
                <li><a href="verify.html">Реестр верификации</a></li>
                <li><a href="methodology.html">Методкабинет педагога</a></li>
              </ul>
            </div>
          </div>
          <div class="srmk-footer-bottom">
            <span>© ГБПОУ СРМК • Проект акции «Карта доблести: хранители подвигов»</span>
            <span>Архив 20 героев • Автономный режим PWA</span>
          </div>
        </div>
      `;
    },

    bindEvents() {
      // Desktop dropdowns
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-dropdown] > button');
        const allItems = document.querySelectorAll('[data-dropdown]');
        if (trigger) {
          const item = trigger.parentElement;
          const wasOpen = item.classList.contains('open');
          allItems.forEach(i => {
            i.classList.remove('open');
            i.querySelector('button')?.setAttribute('aria-expanded', 'false');
          });
          if (!wasOpen) {
            item.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
          return;
        }
        if (!e.target.closest('[data-dropdown]')) {
          allItems.forEach(i => {
            i.classList.remove('open');
            i.querySelector('button')?.setAttribute('aria-expanded', 'false');
          });
        }
      });

      // Drawer
      const openDrawer = () => {
        document.getElementById('srmkDrawer')?.classList.add('open');
        document.getElementById('srmkDrawerBackdrop')?.classList.add('open');
        document.getElementById('btnOpenDrawer')?.setAttribute('aria-expanded', 'true');
      };
      const closeDrawer = () => {
        document.getElementById('srmkDrawer')?.classList.remove('open');
        document.getElementById('srmkDrawerBackdrop')?.classList.remove('open');
        document.getElementById('btnOpenDrawer')?.setAttribute('aria-expanded', 'false');
      };

      document.getElementById('btnOpenDrawer')?.addEventListener('click', openDrawer);
      document.getElementById('btnCloseDrawer')?.addEventListener('click', closeDrawer);
      document.getElementById('srmkDrawerBackdrop')?.addEventListener('click', closeDrawer);
      document.querySelectorAll('.srmk-drawer-link').forEach(a => a.addEventListener('click', closeDrawer));

      // GOST Accessibility
      const toggleContrast = () => {
        const active = document.documentElement.classList.toggle('high-contrast');
        localStorage.setItem('srmk_gost_contrast', active ? '1' : '0');
      };
      const toggleFont = () => {
        const active = document.documentElement.classList.toggle('large-text');
        localStorage.setItem('srmk_gost_font', active ? '1' : '0');
      };

      document.getElementById('btnToggleContrast')?.addEventListener('click', toggleContrast);
      document.getElementById('drawerContrastBtn')?.addEventListener('click', toggleContrast);
      document.getElementById('drawerFontBtn')?.addEventListener('click', toggleFont);

      // Projector delegate
      const triggerProjector = () => {
        if (global.LessonCinema && typeof global.LessonCinema.toggleProjector === 'function') {
          global.LessonCinema.toggleProjector();
        } else {
          const next = document.documentElement.dataset.mode === 'projector' ? '' : 'projector';
          document.documentElement.dataset.mode = next;
        }
      };
      document.getElementById('btnToggleProjector')?.addEventListener('click', triggerProjector);
      document.getElementById('drawerProjectorBtn')?.addEventListener('click', () => {
        closeDrawer();
        triggerProjector();
      });

      // Passport modal
      document.getElementById('btnPassportOpen')?.addEventListener('click', () => this.openPassportModal());
      document.getElementById('drawerPassportBtn')?.addEventListener('click', () => {
        closeDrawer();
        this.openPassportModal();
      });

      // Rank badge -> Achievements modal or quiz.html
      document.getElementById('btnHeaderRankBadge')?.addEventListener('click', () => {
        if (global.AchievementsEngine && typeof global.AchievementsEngine.openModal === 'function') {
          global.AchievementsEngine.openModal();
        } else {
          window.location.href = 'quiz.html#hall-of-fame';
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDrawer();
          document.getElementById('srmkPassportModal')?.classList.remove('active');
        }
      });
    },

    restoreAccessibility() {
      try {
        if (localStorage.getItem('srmk_gost_contrast') === '1') {
          document.documentElement.classList.add('high-contrast');
        }
        if (localStorage.getItem('srmk_gost_font') === '1') {
          document.documentElement.classList.add('large-text');
        }
      } catch (_) {}
    },

    syncRankBadge() {
      const update = () => {
        if (!global.AchievementsEngine || typeof global.AchievementsEngine.getCurrentRank !== 'function') return;
        const rank = global.AchievementsEngine.getCurrentRank();
        const iconEl = document.getElementById('hdrRankIcon');
        const titleEl = document.getElementById('hdrRankTitle');
        if (iconEl && rank.icon) iconEl.textContent = rank.icon;
        if (titleEl && rank.title) titleEl.textContent = rank.title;
      };
      update();
      window.addEventListener('srmk-achievements-updated', update);
    },

    openPassportModal() {
      let modal = document.getElementById('srmkPassportModal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'srmkPassportModal';
        modal.className = 'dossier-modal';
        modal.innerHTML = `
          <div class="dossier-dialog" style="max-width:640px;">
            <button type="button" class="dossier-close" id="closePassportBtn" aria-label="Закрыть">&times;</button>
            <h2 style="font-family:var(--font-display); color:var(--accent-primary); margin-bottom:12px;">Паспорт проекта</h2>
            <p style="color:var(--text-secondary); margin-bottom:12px;">
              <strong>Название:</strong> Цифровой мемориальный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
            </p>
            <p style="color:var(--text-secondary); margin-bottom:12px;">
              <strong>Учреждение:</strong> ГБПОУ «Ставропольский региональный многопрофильный колледж», г. Ставрополь, пр. Юности, 3.
            </p>
            <p style="color:var(--text-secondary); margin-bottom:12px;">
              <strong>Номинация:</strong> Всероссийская акция «Карта доблести: хранители подвигов» («За партой героя»).
            </p>
            <p style="color:var(--text-secondary);">
              <strong>Состав экспозиции:</strong> 20 архивных досье выпускников, 21 том электронной Книги Памяти, 21 MP3-аудиогид, исторический квест, генератор сертификатов с SHA-256 верификацией и методкабинет ФГОС СПО.
            </p>
          </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#closePassportBtn').addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('active');
        });
      }
      modal.classList.add('active');
    },

    registerServiceWorker() {
      if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavigationEngine.init());
  } else {
    NavigationEngine.init();
  }

  global.NavigationEngine = NavigationEngine;
})(typeof window !== 'undefined' ? window : globalThis);
