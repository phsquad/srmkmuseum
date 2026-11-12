/**
 * ============================================================================
 * БЕГУЩАЯ ЛЕНТА ПАМЯТИ: js/live-tributes-ticker.js (v1.0 Live Stream)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Живую трансляцию поминальных записей со Стены Памяти на главном экране
 * 2. Синхронизацию с Realtime-каналом Supabase guestbook_tributes
 * 3. Возможность оставить свое слово благодарности в 1 клик
 * ============================================================================
 */

(function() {
  'use strict';

  const DEFAULT_TICKER_ITEMS = [
    { author: 'Студенты гр. Э-22', text: 'Вечная слава и благодарность героям-выпускникам СРМК!', hero: 'Всем защитникам' },
    { author: 'Совет ветеранов колледжа', text: 'Подвиг Владислава Шартова и всех 20 ребят навечно в сердцах преподавателей.', hero: 'Шартов В. И.' },
    { author: 'Семья выпускника', text: 'Иван Луценко, гордимся твоим мужеством и верностью присяге.', hero: 'Луценко И. С.' },
    { author: 'Отделение информационных технологий', text: 'За каждой партой героя — бессмертный пример верности Родине.', hero: 'Чупин А. В.' },
    { author: 'Юнармейцы Ставрополя', text: 'Быть воином — жить вечно. Обещаем быть достойными вашей памяти!', hero: 'Кавалерам Ордена Мужества' }
  ];

  const LiveTributesTicker = {
    containerEl: null,
    items: [],

    init() {
      // Инициализируем только если есть подходящее место (на главной index.html или mobile.html)
      const targetAnchor = document.getElementById('memorialTributesStreamSlot') ||
                           document.querySelector('#memorial .section-header') ||
                           document.querySelector('.site-header');

      if (!targetAnchor) return;
      this.createTickerMarkup();
      this.loadTributes();

      // Слушатель новых отзывов в реальном времени из Supabase
      window.addEventListener('srmk-tribute-added', (e) => {
        if (e.detail) this.prependTribute(e.detail);
      });
    },

    createTickerMarkup() {
      if (document.getElementById('memorialTributesTicker')) return;

      const ticker = document.createElement('div');
      ticker.id = 'memorialTributesTicker';
      ticker.className = 'memorial-tributes-ticker';
      ticker.setAttribute('role', 'region');
      ticker.setAttribute('aria-label', 'Лента слов благодарности и памяти');

      ticker.innerHTML = `
        <div class="ticker-inner">
          <div class="ticker-badge">
            <span class="ticker-flame-icon">🕯️</span>
            <span class="ticker-badge-text">Стена Памяти онлайн</span>
          </div>
          <div class="ticker-content" id="tickerTrack">
            <!-- Элементы ленты загружаются динамически -->
          </div>
          <a href="guestbook.html" class="ticker-action-btn" title="Оставить свое памятное послание">
            Почтить память ➔
          </a>
        </div>
      `;

      // Вставляем сразу под шапкой сайта
      const siteHeader = document.querySelector('.site-header') || document.querySelector('header.header');
      if (siteHeader && siteHeader.nextSibling) {
        siteHeader.parentNode.insertBefore(ticker, siteHeader.nextSibling);
      } else {
        document.body.insertBefore(ticker, document.body.firstChild);
      }

      this.containerEl = ticker;
    },

    async loadTributes() {
      let tributes = [];

      // Пробуем получить живые записи из CloudSync / Supabase
      if (window.CloudSync && typeof window.CloudSync.fetchTributes === 'function') {
        try {
          const cloudData = await window.CloudSync.fetchTributes(15);
          if (Array.isArray(cloudData) && cloudData.length > 0) {
            tributes = cloudData.map(t => ({
              author: t.author_name || 'Благодарный посетитель',
              text: t.tribute_text || 'Вечная слава защитникам Отечества!',
              hero: t.target_hero_name || 'Героям СРМК'
            }));
          }
        } catch (e) {
          console.warn('[LiveTributesTicker] Ошибка чтения из CloudSync:', e);
        }
      }

      // Если в облаке пока пусто — берем из LocalStorage или базового архива
      if (tributes.length === 0) {
        try {
          const local = JSON.parse(localStorage.getItem('srmk_guestbook_entries') || '[]');
          if (Array.isArray(local) && local.length > 0) {
            tributes = local.slice(0, 8).map(t => ({
              author: t.author || 'Посетитель мемориала',
              text: t.text || t.message || 'Вечная память!',
              hero: t.hero || 'Героям СРМК'
            }));
          }
        } catch (e) {}
      }

      if (tributes.length === 0) {
        tributes = DEFAULT_TICKER_ITEMS;
      }

      this.items = tributes;
      this.render();
    },

    render() {
      const track = document.getElementById('tickerTrack');
      if (!track) return;

      const itemsHtml = this.items.map(item => `
        <div class="ticker-item">
          <strong class="ticker-author">${this.escape(item.author)}:</strong>
          <span class="ticker-text">«${this.escape(item.text)}»</span>
          ${item.hero ? `<span class="ticker-hero-tag">• ${this.escape(item.hero)}</span>` : ''}
        </div>
      `).join('<span class="ticker-sep">✦</span>');

      // Дублируем для бесконечной плавной прокрутки
      track.innerHTML = `
        <div class="ticker-marquee">
          ${itemsHtml}
          <span class="ticker-sep">✦</span>
          ${itemsHtml}
        </div>
      `;
    },

    prependTribute(item) {
      if (!item) return;
      this.items.unshift({
        author: item.author_name || item.author || 'Посетитель',
        text: item.tribute_text || item.text || 'Вечная память!',
        hero: item.target_hero_name || item.hero || 'Героям СРМК'
      });
      this.items = this.items.slice(0, 20);
      this.render();
    },

    escape(str) {
      return String(str || '').replace(/[&<>"']/g, s => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[s]));
    }
  };

  document.addEventListener('DOMContentLoaded', () => LiveTributesTicker.init());
  window.LiveTributesTicker = LiveTributesTicker;
})();
