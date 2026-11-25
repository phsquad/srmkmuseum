/**
 * ============================================================================
 * ГЛАВНЫЙ КОНТРОЛЛЕР ЭКСПОЗИЦИИ: js/app.js (v17.0 Unified Responsive)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * ============================================================================
 */
(function (global) {
  'use strict';

  const CANDLES_KEY = 'srmk_candles_local_v1';
  const FLOWERS_KEY = 'srmk_flowers_local_v1';

  const App = {
    activeSpecialty: 'all',
    searchQuery: '',
    deckIndex: 0,
    mapInitialized: false,
    candlesMap: {},
    flowersTotal: 0,

    init() {
      this.loadLocalCounters();
      this.renderDeck();
      this.renderMemorialPlaques();
      this.renderSpecialtyFilters();
      this.renderCardsGrid();
      this.renderBattleMilestones();
      this.renderDailyHero();
      this.bindEvents();
      this.setupLazyMap();
      this.syncCloudCounters();
      this.handleDeepLink();

      if (global.AdminCMS && typeof global.AdminCMS.init === 'function') {
        global.AdminCMS.init();
      }
      if (global.SpotlightSearch && typeof global.SpotlightSearch.init === 'function') {
        global.SpotlightSearch.init();
      }
      if (global.MemorialCeremony && typeof global.MemorialCeremony.init === 'function') {
        global.MemorialCeremony.init();
      }
    },

    getHeroes() {
      return Array.isArray(global.heroesDatabase) ? global.heroesDatabase : [];
    },

    heroPictureHtml(hero, useThumb = false, cls = '') {
      const webp = useThumb && hero.media?.photoThumb ? hero.media.photoThumb : (hero.media?.photo || 'assets/images/cover-master.jpg');
      const fallback = hero.media?.photoFallback || webp;
      return `
        <picture>
          <source srcset="${webp}" type="image/webp">
          <img src="${fallback}" alt="${hero.name}" class="${cls}" loading="lazy" decoding="async">
        </picture>
      `;
    },

    loadLocalCounters() {
      try {
        this.candlesMap = JSON.parse(localStorage.getItem(CANDLES_KEY) || '{}') || {};
        this.flowersTotal = Number(localStorage.getItem(FLOWERS_KEY) || 0) || 0;
      } catch (_) {}
      this.updateStatsStrip();
    },

    updateStatsStrip() {
      const heroes = this.getHeroes();
      const totalCandles = Object.values(this.candlesMap).reduce((s, n) => s + (Number(n) || 0), 0);
      const hEl = document.getElementById('statHeroesCount');
      const cEl = document.getElementById('statCandlesTotal');
      const fEl = document.getElementById('statFlowersTotal');
      if (hEl) hEl.textContent = String(heroes.length || 20);
      if (cEl) cEl.textContent = String(totalCandles);
      if (fEl) fEl.textContent = String(this.flowersTotal);
    },

    async syncCloudCounters() {
      if (!global.CloudSync || !global.CloudSync.client) return;
      try {
        const { data } = await global.CloudSync.client.from('memorial_counters').select('hero_id, candles, flowers');
        if (Array.isArray(data) && data.length > 0) {
          let flowersSum = 0;
          data.forEach(row => {
            if (row.hero_id) this.candlesMap[row.hero_id] = Math.max(this.candlesMap[row.hero_id] || 0, row.candles || 0);
            flowersSum += Number(row.flowers) || 0;
          });
          this.flowersTotal = Math.max(this.flowersTotal, flowersSum);
          this.updateStatsStrip();
        }
      } catch (_) {}
    },

    /* 1. CASCADING HERO DECK */
    renderDeck() {
      const deckEl = document.getElementById('heroDeck');
      const heroes = this.getHeroes();
      if (!deckEl || heroes.length === 0) return;

      const total = heroes.length;
      const prevIdx = (this.deckIndex - 1 + total) % total;
      const nextIdx = (this.deckIndex + 1) % total;
      const indices = [
        { idx: prevIdx, pos: -1 },
        { idx: nextIdx, pos: 1 },
        { idx: this.deckIndex, pos: 0 }
      ];

      deckEl.innerHTML = indices.map(({ idx, pos }) => {
        const h = heroes[idx];
        return `
          <div class="deck-card" data-pos="${pos}" data-hero-id="${h.id}" role="button" tabindex="${pos === 0 ? '0' : '-1'}" aria-label="${h.name}">
            ${this.heroPictureHtml(h, false)}
            <div class="deck-card-scrim">
              <div class="deck-card-badge">${h.military?.rank || 'Выпускник СРМК'}</div>
              <div class="deck-card-name">${h.name}</div>
              <div class="deck-card-meta">${h.dates?.years || ''} • ${(h.awards && h.awards[0]) || ''}</div>
            </div>
          </div>
        `;
      }).join('');

      const counterEl = document.getElementById('deckCounter');
      if (counterEl) counterEl.textContent = `${this.deckIndex + 1} / ${total}`;
    },

    /* 2. HALL I: MEMORIAL STELES */
    renderMemorialPlaques() {
      const heroes = this.getHeroes();
      const leftList = document.getElementById('steleLeftList');
      const rightList = document.getElementById('steleRightList');
      if (!leftList || !rightList) return;

      const renderRow = (h) => `
        <li>
          <button type="button" class="stele-item-btn" data-open-hero="${h.id}">
            <span class="stele-item-name">${h.name}</span>
            <span class="stele-item-meta">${h.dates?.years || ''}</span>
          </button>
        </li>
      `;

      leftList.innerHTML = heroes.filter(h => h.plaque === 'left').map(renderRow).join('');
      rightList.innerHTML = heroes.filter(h => h.plaque !== 'left').map(renderRow).join('');
    },

    /* 3. HALL II: SPECIALTY FILTERS & CARDS GRID */
    renderSpecialtyFilters() {
      const wrap = document.getElementById('specialtyFilters');
      if (!wrap || !global.SPECIALTIES_TAXONOMY) return;

      const specs = Object.values(global.SPECIALTIES_TAXONOMY);
      wrap.innerHTML = `
        <button type="button" class="filter-pill ${this.activeSpecialty === 'all' ? 'active' : ''}" data-spec="all">Все (20)</button>
        ${specs.map(s => `
          <button type="button" class="filter-pill ${this.activeSpecialty === s.id ? 'active' : ''}" data-spec="${s.id}">
            ${s.icon} ${s.name.split(' ')[0]}
          </button>
        `).join('')}
      `;
    },

    renderCardsGrid() {
      const grid = document.getElementById('heroesCardsGrid');
      if (!grid) return;

      const q = this.searchQuery.trim().toLowerCase();
      const list = this.getHeroes().filter(h => {
        const specOk = this.activeSpecialty === 'all' || h.specTag === this.activeSpecialty;
        if (!specOk) return false;
        if (!q) return true;
        const hay = `${h.name} ${h.military?.rank || ''} ${h.education?.specialty || ''} ${(h.awards || []).join(' ')}`.toLowerCase();
        return hay.includes(q);
      });

      if (list.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;">По вашему запросу герои не найдены.</p>`;
        return;
      }

      grid.innerHTML = list.map(h => {
        const spec = Object.values(global.SPECIALTIES_TAXONOMY || {}).find(s => s.id === h.specTag);
        const candles = this.candlesMap[h.id] || 0;
        return `
          <article class="hero-card">
            <div class="hero-card-media">
              ${this.heroPictureHtml(h, true)}
              ${spec ? `<span class="hero-card-spec">${spec.icon} ${spec.name.split(' ')[0]}</span>` : ''}
            </div>
            <div class="hero-card-body">
              <div class="hero-card-years">${h.dates?.years || ''} • ${h.military?.rank || ''}</div>
              <h3 class="hero-card-name">${h.name}</h3>
              <p class="hero-card-snippet">${h.education?.specialty || ''}</p>
              <div class="hero-card-actions">
                <button type="button" class="btn btn-primary" data-open-hero="${h.id}">Досье</button>
                <button type="button" class="btn btn-secondary" data-play-hero="${h.id}" title="Слушать аудиогид">🎧</button>
                <button type="button" class="btn btn-ghost" data-candle-hero="${h.id}" title="Зажечь свечу">🕯 ${candles}</button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    },

    /* 4. HALL III: MAP & MILESTONES */
    renderBattleMilestones() {
      const listEl = document.getElementById('battleMilestonesList');
      if (!listEl) return;
      listEl.innerHTML = this.getHeroes().map(h => `
        <div class="milestone-item" data-open-hero="${h.id}">
          <strong style="color:var(--text-primary); font-size:0.9rem;">${h.mapCoords?.locationName || 'Рубеж подвига'}</strong>
          <div style="font-size:0.8rem; color:var(--text-secondary);">${h.name} (${h.dates?.death || h.dates?.years || ''})</div>
        </div>
      `).join('');
    },

    setupLazyMap() {
      const box = document.getElementById('yandexMapBox');
      if (!box || !('IntersectionObserver' in window)) return;
      const obs = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          obs.disconnect();
          this.initInteractiveMap();
        }
      }, { rootMargin: '200px' });
      obs.observe(box);
    },

    initInteractiveMap() {
      if (this.mapInitialized) return;
      const box = document.getElementById('yandexMapBox');
      if (!box) return;
      if (typeof ymaps === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;
        script.onload = () => this._mountYandexMap(box);
        script.onerror = () => {
          const note = document.getElementById('mapFallbackNote');
          if (note) note.textContent = 'Онлайн-карта недоступна в автономном режиме. Используйте список рубежей справа для перехода к досье.';
        };
        document.head.appendChild(script);
      } else {
        this._mountYandexMap(box);
      }
    },

    _mountYandexMap(box) {
      if (typeof ymaps === 'undefined') return;
      ymaps.ready(() => {
        this.mapInitialized = true;
        box.innerHTML = '';
        const map = new ymaps.Map(box, { center: [47.2, 37.5], zoom: 6, controls: ['zoomControl'] });
        this.getHeroes().forEach(h => {
          if (!h.mapCoords) return;
          const pm = new ymaps.Placemark(
            [h.mapCoords.lat, h.mapCoords.lng],
            { balloonContentHeader: h.name, balloonContentBody: `${h.mapCoords.locationName}<br><a href="?hero=${h.id}">Открыть досье</a>` },
            { preset: 'islands#redDotIcon' }
          );
          map.geoObjects.add(pm);
        });
      });
    },

    /* 5. HALL IV: DAILY HERO */
    renderDailyHero() {
      const box = document.getElementById('dailyHeroContent');
      const heroes = this.getHeroes();
      if (!box || heroes.length === 0) return;

      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 1)) / 86400000);
      const hero = heroes[Math.abs(dayOfYear) % heroes.length];

      box.innerHTML = `
        <div style="display:flex; gap:14px; align-items:center;">
          <img src="${hero.media?.photoThumb || hero.media?.photo}" alt="${hero.name}" style="width:72px;height:96px;object-fit:cover;border-radius:6px;border:1px solid var(--border-accent);">
          <div>
            <div style="font-family:var(--font-display);color:var(--text-primary);font-weight:700;">${hero.name}</div>
            <div style="font-size:0.8rem;color:var(--accent-primary);margin:2px 0 8px;">${hero.military?.rank || ''} • ${hero.dates?.years || ''}</div>
            <button type="button" class="btn btn-secondary" data-open-hero="${hero.id}">Открыть досье</button>
          </div>
        </div>
      `;
    },

    /* 6. DOSSIER MODAL & TRIBUTES */
    openModal(heroId) {
      const hero = this.getHeroes().find(h => h.id === heroId);
      const modal = document.getElementById('heroDossierModal');
      const body = document.getElementById('dossierBody');
      if (!hero || !modal || !body) return;

      const awardsHtml = (hero.awards || []).map(a => `<span class="filter-pill active">${a}</span>`).join(' ');
      const deedHtml = (hero.deed || '').replace(/###\s*(.+)/g, '<h3>$1</h3>').replace(/\n\n/g, '<br><br>');

      body.innerHTML = `
        <div class="dossier-grid">
          <div>
            <div class="dossier-photo">${this.heroPictureHtml(hero, false)}</div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
              <button type="button" class="btn btn-primary" data-play-hero="${hero.id}">🎧 Слушать аудиогид</button>
              <button type="button" class="btn btn-secondary" data-candle-hero="${hero.id}">🕯 Зажечь свечу (${this.candlesMap[hero.id] || 0})</button>
              <a href="reader.html#${hero.id}" class="btn btn-ghost">📖 Глава в Книге Памяти</a>
              <a href="desk-qr.html?hero=${hero.id}" class="btn btn-ghost">🪑 Табличка Парты Героя</a>
            </div>
          </div>
          <div>
            <div style="color:var(--accent-primary);font-size:0.8rem;font-weight:700;text-transform:uppercase;">${hero.memorialStatus || 'Мемориал Славы СРМК'}</div>
            <h2 id="dossierName" style="font-family:var(--font-display);font-size:1.6rem;margin:6px 0 4px;">${hero.name}</h2>
            <p style="color:var(--text-secondary);margin-bottom:10px;">${hero.dates?.years || ''} • ${hero.military?.rank || ''}, ${hero.military?.unit || ''}</p>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">Отделение СРМК: ${hero.education?.specialty || ''} (${hero.education?.period || ''})</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">${awardsHtml}</div>
            ${hero.quote ? `<blockquote class="oath-quote" style="margin:12px 0;">«${hero.quote}»</blockquote>` : ''}
            <div class="dossier-bio">${deedHtml}</div>
          </div>
        </div>
      `;

      modal.classList.add('active');
    },

    lightCandle(heroId) {
      this.candlesMap[heroId] = (this.candlesMap[heroId] || 0) + 1;
      try { localStorage.setItem(CANDLES_KEY, JSON.stringify(this.candlesMap)); } catch (_) {}
      this.updateStatsStrip();
      this.renderCardsGrid();
      if (global.SoundEngine && typeof global.SoundEngine.playCandleIgnite === 'function') {
        global.SoundEngine.playCandleIgnite();
      }
      if (global.MemorialToast) {
        global.MemorialToast.show('🕯 Свеча памяти зажжена.', 'success');
      }
      if (global.CloudSync && typeof global.CloudSync.incrementCandle === 'function') {
        global.CloudSync.incrementCandle(heroId).catch(() => {});
      }
    },

    handleDeepLink() {
      try {
        const params = new URLSearchParams(window.location.search);
        const heroId = params.get('hero');
        if (heroId) this.openModal(heroId);
      } catch (_) {}
    },

    bindEvents() {
      document.getElementById('btnStartGeneralTour')?.addEventListener('click', () => {
        if (global.AudioDock) {
          global.AudioDock.play('general-tour', 'assets/audio/guides/general-tour.mp3', 'Общая экскурсия по Мемориалу СРМК');
        }
      });

      document.getElementById('btnDeckPrev')?.addEventListener('click', () => {
        const total = this.getHeroes().length || 1;
        this.deckIndex = (this.deckIndex - 1 + total) % total;
        this.renderDeck();
      });

      document.getElementById('btnDeckNext')?.addEventListener('click', () => {
        const total = this.getHeroes().length || 1;
        this.deckIndex = (this.deckIndex + 1) % total;
        this.renderDeck();
      });

      document.getElementById('heroSearchInput')?.addEventListener('input', (e) => {
        this.searchQuery = e.target.value || '';
        this.renderCardsGrid();
      });

      document.getElementById('btnLayMemorialFlower')?.addEventListener('click', () => {
        this.flowersTotal += 1;
        try { localStorage.setItem(FLOWERS_KEY, String(this.flowersTotal)); } catch (_) {}
        this.updateStatsStrip();
        if (global.MemorialToast) global.MemorialToast.show('🌹 Гвоздика возложена к Мемориалу Славы.', 'success');
      });

      document.getElementById('btnCloseDossier')?.addEventListener('click', () => {
        document.getElementById('heroDossierModal')?.classList.remove('active');
      });

      document.getElementById('heroDossierModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'heroDossierModal') e.currentTarget.classList.remove('active');
      });

      document.addEventListener('click', (e) => {
        const specBtn = e.target.closest('[data-spec]');
        if (specBtn) {
          this.activeSpecialty = specBtn.getAttribute('data-spec') || 'all';
          this.renderSpecialtyFilters();
          this.renderCardsGrid();
          return;
        }

        const plaqueBtn = e.target.closest('[data-plaque-tab]');
        if (plaqueBtn) {
          const side = plaqueBtn.getAttribute('data-plaque-tab');
          document.querySelectorAll('[data-plaque-tab]').forEach(b => b.classList.toggle('active', b === plaqueBtn));
          document.getElementById('steleLeftPanel')?.classList.toggle('hidden-mobile', side !== 'left');
          document.getElementById('steleRightPanel')?.classList.toggle('hidden-mobile', side !== 'right');
          return;
        }

        const deckCard = e.target.closest('.deck-card');
        if (deckCard) {
          const pos = Number(deckCard.getAttribute('data-pos'));
          if (pos === 0) {
            this.openModal(deckCard.getAttribute('data-hero-id'));
          } else {
            const total = this.getHeroes().length || 1;
            this.deckIndex = (this.deckIndex + pos + total) % total;
            this.renderDeck();
          }
          return;
        }

        const openHero = e.target.closest('[data-open-hero]');
        if (openHero) {
          this.openModal(openHero.getAttribute('data-open-hero'));
          return;
        }

        const playHero = e.target.closest('[data-play-hero]');
        if (playHero) {
          const id = playHero.getAttribute('data-play-hero');
          const hero = this.getHeroes().find(h => h.id === id);
          if (hero && hero.media?.audioGuide && global.AudioDock) {
            global.AudioDock.play(hero.id, hero.media.audioGuide, hero.name);
          }
          return;
        }

        const candleHero = e.target.closest('[data-candle-hero]');
        if (candleHero) {
          this.lightCandle(candleHero.getAttribute('data-candle-hero'));
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.getElementById('heroDossierModal')?.classList.remove('active');
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  global.App = App;
})(typeof window !== 'undefined' ? window : globalThis);
