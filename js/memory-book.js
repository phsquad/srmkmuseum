/**
 * ============================================================================
 * КАТАЛОГ КНИГИ ПАМЯТИ: js/memory-book.js (v12.0 Single Source)
 * Использует единый канонический источник window.GRAND_MEMORY_BOOK_ARCHIVE
 * ============================================================================
 */
(function (global) {
  'use strict';

  const MemoryBookCatalog = {
    activeFilter: 'all',
    searchQuery: '',

    init() {
      this.render();
      this.bindEvents();
    },

    getArchive() {
      if (Array.isArray(global.GRAND_MEMORY_BOOK_ARCHIVE) && global.GRAND_MEMORY_BOOK_ARCHIVE.length > 0) {
        return global.GRAND_MEMORY_BOOK_ARCHIVE;
      }
      if (global.MEMORY_BOOK_PROLOGUE) {
        return [global.MEMORY_BOOK_PROLOGUE];
      }
      return [];
    },

    normalizeAwards(awards) {
      if (Array.isArray(awards)) return awards;
      if (typeof awards === 'string' && awards.trim()) {
        return awards.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    },

    resolveThumb(vol) {
      const hero = (global.heroesDatabase || []).find(h => h.id === vol.id);
      if (hero && hero.media?.photoThumb) return hero.media.photoThumb;
      if (vol.photo && vol.photo.includes('/heroes/')) return vol.photo.replace('.jpg', '.webp');
      return vol.photo || 'assets/images/cover-master.jpg';
    },

    render() {
      const grid = document.getElementById('volumesGrid');
      if (!grid) return;

      const q = this.searchQuery.trim().toLowerCase();
      const list = this.getArchive().filter(vol => {
        const filterOk = this.activeFilter === 'all' || vol.plaque === this.activeFilter;
        if (!filterOk) return false;
        if (!q) return true;
        const awards = this.normalizeAwards(vol.awards).join(' ');
        const hay = `${vol.name || ''} ${vol.specialty || ''} ${vol.military || ''} ${awards} ${vol.location || ''}`.toLowerCase();
        return hay.includes(q);
      });

      if (list.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted); grid-column:1/-1;">Тома по вашему запросу не найдены.</p>`;
        return;
      }

      grid.innerHTML = list.map((vol, idx) => {
        const thumb = this.resolveThumb(vol);
        const audio = vol.audioFile || (vol.plaque === 'general' ? 'assets/audio/guides/general-tour.mp3' : '');
        const label = vol.volNum || vol.chapterNum || `Том ${idx}`;
        return `
          <article class="volume-card">
            <div class="volume-card-top">
              <img src="${thumb}" alt="${vol.name}" class="volume-thumb" loading="lazy" decoding="async" onerror="this.src='assets/images/cover-master.jpg'">
              <div class="volume-meta">
                <div class="volume-num">${label}</div>
                <h2 class="volume-title">${vol.name}</h2>
                <div class="volume-sub">${vol.years || ''}</div>
                <div class="volume-sub">${vol.specialty || ''}</div>
              </div>
            </div>
            <p class="volume-snippet">${vol.shortSnippet || ''}</p>
            <div class="volume-actions">
              <a href="reader.html#${vol.id}" class="btn btn-primary" style="flex:1; min-height:38px; padding:6px 12px; font-size:0.82rem;">Открыть том</a>
              ${audio ? `<button type="button" class="btn btn-secondary" data-vol-audio="${audio}" data-vol-id="${vol.id}" data-vol-title="${vol.name}" style="min-height:38px; padding:6px 12px;" title="Слушать аудиогид">🎧</button>` : ''}
            </div>
          </article>
        `;
      }).join('');
    },

    bindEvents() {
      document.getElementById('bookSearchInput')?.addEventListener('input', (e) => {
        this.searchQuery = e.target.value || '';
        this.render();
      });

      document.getElementById('btnPlayPrologueAudio')?.addEventListener('click', () => {
        if (global.AudioDock) {
          global.AudioDock.play('prologue-memorial-opening', 'assets/audio/guides/general-tour.mp3', 'Пролог: Открытие Мемориала СРМК');
        }
      });

      document.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('[data-book-filter]');
        if (filterBtn) {
          this.activeFilter = filterBtn.getAttribute('data-book-filter') || 'all';
          document.querySelectorAll('[data-book-filter]').forEach(b => b.classList.toggle('active', b === filterBtn));
          this.render();
          return;
        }

        const audioBtn = e.target.closest('[data-vol-audio]');
        if (audioBtn && global.AudioDock) {
          global.AudioDock.play(
            audioBtn.getAttribute('data-vol-id'),
            audioBtn.getAttribute('data-vol-audio'),
            audioBtn.getAttribute('data-vol-title')
          );
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MemoryBookCatalog.init());
  } else {
    MemoryBookCatalog.init();
  }

  global.MemoryBookCatalog = MemoryBookCatalog;
})(typeof window !== 'undefined' ? window : globalThis);
