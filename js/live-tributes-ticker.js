/**
 * ============================================================================
 * БЕГУЩАЯ ЛЕНТА ПАМЯТИ: js/live-tributes-ticker.js (v2.0 Supabase-Only)
 * Показывает только реальные записи из таблицы guestbook_tributes в Supabase.
 * Если записей в БД нет — лента скрыта.
 * ============================================================================
 */
(function () {
  'use strict';

  const LiveTributesTicker = {
    containerEl: null,
    items: [],

    init() {
      const targetAnchor = document.getElementById('memorialTributesStreamSlot') ||
                           document.getElementById('siteHeader');
      if (!targetAnchor) return;

      this.createTickerMarkup();
      this.loadTributes();

      window.addEventListener('srmk-supabase-status', (e) => {
        if (e.detail && e.detail.status === 'online') {
          this.loadTributes();
        }
      });

      window.addEventListener('srmk-tribute-added', (e) => {
        if (e.detail) this.prependTribute(e.detail);
      });
    },

    createTickerMarkup() {
      if (document.getElementById('memorialTributesTicker')) return;
      const ticker = document.createElement('div');
      ticker.id = 'memorialTributesTicker';
      ticker.className = 'memorial-tributes-ticker';
      ticker.style.display = 'none';
      ticker.setAttribute('role', 'region');
      ticker.setAttribute('aria-label', 'Лента слов благодарности и памяти');
      ticker.innerHTML = `
        <div class="container" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px;font-size:0.82rem;border-bottom:1px solid var(--border-subtle);background:rgba(18,22,29,0.9);">
          <div id="tickerTrack" style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;"></div>
          <a href="guestbook.html" style="flex:0 0 auto;color:var(--accent-primary);font-weight:600;">Стена Памяти →</a>
        </div>
      `;
      const header = document.getElementById('siteHeader');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(ticker, header.nextSibling);
      }
      this.containerEl = ticker;
    },

    async loadTributes() {
      let tributes = [];
      if (window.CloudSync && window.CloudSync.isLive && typeof window.CloudSync.fetchTributes === 'function') {
        try {
          const cloudData = await window.CloudSync.fetchTributes();
          if (Array.isArray(cloudData) && cloudData.length > 0) {
            tributes = cloudData.slice(0, 15).map(t => ({
              author: t.author || t.author_name || 'Посетитель',
              text: t.message || t.tribute_text || '',
              hero: t.dedication_name || t.target_hero_name || ''
            })).filter(t => t.text);
          }
        } catch (e) {
          console.warn('[LiveTributesTicker] Ошибка чтения из CloudSync:', e);
        }
      }
      this.items = tributes;
      this.render();
    },

    render() {
      const track = document.getElementById('tickerTrack');
      if (!track || !this.containerEl) return;
      if (this.items.length === 0) {
        this.containerEl.style.display = 'none';
        track.innerHTML = '';
        return;
      }
      this.containerEl.style.display = 'block';
      track.innerHTML = this.items.map(item =>
        `<span><strong style="color:var(--accent-primary);">${this.escape(item.author)}:</strong> «${this.escape(item.text)}»${item.hero ? ` <small style="color:var(--text-muted);">(${this.escape(item.hero)})</small>` : ''}</span>`
      ).join(' &nbsp;•&nbsp; ');
    },

    prependTribute(item) {
      if (!item) return;
      const text = item.message || item.tribute_text || item.text || '';
      if (!text) return;
      this.items.unshift({
        author: item.author || item.author_name || 'Посетитель',
        text,
        hero: item.dedication_name || item.target_hero_name || ''
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
