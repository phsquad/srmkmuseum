/**
 * ============================================================================
 * ЧИТАЛКА КНИГИ ПАМЯТИ: js/reader.js (v16.0 Clean Memorial Edition)
 * - Единый источник window.GRAND_MEMORY_BOOK_ARCHIVE
 * - 2 режима: Адаптивный поток («Статья») + CSS-разворот (column-count: 2)
 * - Переключатель «Тёмный фолиант» / «Тёплая бумага», масштаб шрифта
 * - Синхронизация с AudioDock (MP3) и TTSNarrator (Web Speech API)
 * ============================================================================
 */
(function (global) {
  'use strict';

  const ReaderEngine = {
    volumes: [],
    currentIndex: 0,
    fontSizeRem: 1.06,
    viewMode: 'flow', // 'flow' | 'spread'
    touchStartX: 0,

    init() {
      this.volumes = this.getArchive();
      if (this.volumes.length === 0) return;

      this.restorePrefs();
      this.openFromHash();
      this.renderToc();
      this.renderChapter();
      this.bindEvents();
    },

    getArchive() {
      if (Array.isArray(global.GRAND_MEMORY_BOOK_ARCHIVE) && global.GRAND_MEMORY_BOOK_ARCHIVE.length > 0) {
        return global.GRAND_MEMORY_BOOK_ARCHIVE;
      }
      return global.MEMORY_BOOK_PROLOGUE ? [global.MEMORY_BOOK_PROLOGUE] : [];
    },

    restorePrefs() {
      try {
        const savedView = localStorage.getItem('srmk_reader_view');
        if (savedView === 'spread' || savedView === 'flow') this.viewMode = savedView;
        const savedTheme = localStorage.getItem('srmk_reader_theme');
        if (savedTheme === 'paper') document.body.setAttribute('data-reader-theme', 'paper');
        const savedFont = Number(localStorage.getItem('srmk_reader_font'));
        if (savedFont >= 0.85 && savedFont <= 1.45) this.fontSizeRem = savedFont;
      } catch (_) {}
      this.applyViewAndFont();
    },

    applyViewAndFont() {
      const paper = document.getElementById('readerPaper');
      if (paper) paper.setAttribute('data-view', this.viewMode);
      document.documentElement.style.setProperty('--reader-font-size', `${this.fontSizeRem}rem`);
      document.getElementById('btnViewFlow')?.classList.toggle('btn-primary', this.viewMode === 'flow');
      document.getElementById('btnViewSpread')?.classList.toggle('btn-primary', this.viewMode === 'spread');
    },

    openFromHash() {
      let id = window.location.hash.replace('#', '').trim();
      if (id === 'prologue-master-cover') id = 'prologue-memorial-opening';
      if (!id) {
        this.currentIndex = 0;
        return;
      }
      const idx = this.volumes.findIndex(v => v.id === id);
      this.currentIndex = idx >= 0 ? idx : 0;
    },

    renderToc() {
      const toc = document.getElementById('readerTocList');
      if (!toc) return;
      toc.innerHTML = this.volumes.map((v, i) => `
        <button type="button" class="toc-item ${i === this.currentIndex ? 'active' : ''}" data-toc-idx="${i}">
          <span style="font-size:0.7rem;color:var(--text-muted);">${v.volNum || v.chapterNum || `Глава ${i}`}</span>
          <strong>${v.name}</strong>
        </button>
      `).join('');
    },

    markdownToHtml(md) {
      if (!md) return '';
      return md
        .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
        .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
        .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
        .replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-subtle);margin:1.5em 0;">')
        .split(/\n{2,}/)
        .map(block => {
          const b = block.trim();
          if (!b) return '';
          if (b.startsWith('<h') || b.startsWith('<blockquote') || b.startsWith('<hr')) return b;
          return `<p>${b.replace(/\n/g, '<br>')}</p>`;
        })
        .join('\n');
    },

    resolvePhoto(vol) {
      const hero = (global.heroesDatabase || []).find(h => h.id === vol.id);
      if (hero && hero.media?.photo) return hero.media.photo;
      return vol.photo || 'assets/images/cover-master.jpg';
    },

    resolveAudio(vol) {
      if (vol.audioFile) return vol.audioFile;
      if (vol.plaque === 'general') return 'assets/audio/guides/general-tour.mp3';
      const hero = (global.heroesDatabase || []).find(h => h.id === vol.id);
      return hero?.media?.audioGuide || '';
    },

    renderChapter() {
      const vol = this.volumes[this.currentIndex];
      if (!vol) return;

      const head = document.getElementById('readerChapterHead');
      const body = document.getElementById('readerArticleBody');
      if (head) {
        head.innerHTML = `
          <img src="${this.resolvePhoto(vol)}" alt="${vol.name}" class="reader-chapter-photo" onerror="this.src='assets/images/cover-master.jpg'">
          <div>
            <div style="font-size:0.74rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent-primary);font-weight:700;">
              ${vol.volNum || vol.chapterNum || ''}
            </div>
            <h1 style="font-family:var(--font-display);font-size:clamp(1.35rem,2.4vw,1.9rem);margin:4px 0;">${vol.name}</h1>
            <div style="font-size:0.86rem;color:var(--text-secondary);">${vol.years || ''} • ${vol.military || ''}</div>
            <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">${vol.specialty || ''}</div>
          </div>
        `;
      }
      if (body) {
        body.innerHTML = this.markdownToHtml(vol.markdown || vol.shortSnippet || '');
      }

      document.querySelectorAll('.toc-item').forEach((el, i) => el.classList.toggle('active', i === this.currentIndex));
      const prevBtn = document.getElementById('btnPrevChapter');
      const nextBtn = document.getElementById('btnNextChapter');
      if (prevBtn) prevBtn.disabled = this.currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = this.currentIndex >= this.volumes.length - 1;

      if (window.location.hash !== `#${vol.id}`) {
        history.replaceState(null, '', `#${vol.id}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const tocBtn = e.target.closest('[data-toc-idx]');
        if (tocBtn) {
          this.currentIndex = Number(tocBtn.getAttribute('data-toc-idx')) || 0;
          this.renderChapter();
        }
      });

      document.getElementById('btnPrevChapter')?.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex -= 1;
          this.renderChapter();
        }
      });

      document.getElementById('btnNextChapter')?.addEventListener('click', () => {
        if (this.currentIndex < this.volumes.length - 1) {
          this.currentIndex += 1;
          this.renderChapter();
        }
      });

      document.getElementById('btnViewFlow')?.addEventListener('click', () => {
        this.viewMode = 'flow';
        localStorage.setItem('srmk_reader_view', 'flow');
        this.applyViewAndFont();
      });

      document.getElementById('btnViewSpread')?.addEventListener('click', () => {
        this.viewMode = 'spread';
        localStorage.setItem('srmk_reader_view', 'spread');
        this.applyViewAndFont();
      });

      document.getElementById('btnReaderTheme')?.addEventListener('click', () => {
        const isPaper = document.body.getAttribute('data-reader-theme') === 'paper';
        if (isPaper) {
          document.body.removeAttribute('data-reader-theme');
          localStorage.setItem('srmk_reader_theme', 'dark');
        } else {
          document.body.setAttribute('data-reader-theme', 'paper');
          localStorage.setItem('srmk_reader_theme', 'paper');
        }
      });

      document.getElementById('btnFontMinus')?.addEventListener('click', () => {
        this.fontSizeRem = Math.max(0.85, +(this.fontSizeRem - 0.08).toFixed(2));
        localStorage.setItem('srmk_reader_font', String(this.fontSizeRem));
        this.applyViewAndFont();
      });

      document.getElementById('btnFontPlus')?.addEventListener('click', () => {
        this.fontSizeRem = Math.min(1.45, +(this.fontSizeRem + 0.08).toFixed(2));
        localStorage.setItem('srmk_reader_font', String(this.fontSizeRem));
        this.applyViewAndFont();
      });

      document.getElementById('btnReaderAudio')?.addEventListener('click', () => {
        const vol = this.volumes[this.currentIndex];
        const src = this.resolveAudio(vol);
        if (src && global.AudioDock) {
          global.AudioDock.play(vol.id, src, vol.name);
        }
      });

      document.getElementById('btnReaderTTS')?.addEventListener('click', () => {
        const body = document.getElementById('readerArticleBody');
        if (!body || !global.TTSNarrator) return;
        if (global.TTSNarrator.isSpeaking) {
          global.TTSNarrator.stop();
        } else {
          global.TTSNarrator.init();
          global.TTSNarrator.speakText(body.innerText);
        }
      });

      // Reading progress bar
      window.addEventListener('scroll', () => {
        const bar = document.getElementById('readerProgressBar');
        if (!bar) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
        bar.style.width = `${pct}%`;
      }, { passive: true });

      // Mobile touch swipe between chapters (< 768px)
      const paper = document.getElementById('readerPaper');
      paper?.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0]?.clientX || 0;
      }, { passive: true });
      paper?.addEventListener('touchend', (e) => {
        if (window.innerWidth >= 768) return;
        const dx = (e.changedTouches[0]?.clientX || 0) - this.touchStartX;
        if (dx < -70 && this.currentIndex < this.volumes.length - 1) {
          this.currentIndex += 1;
          this.renderChapter();
        } else if (dx > 70 && this.currentIndex > 0) {
          this.currentIndex -= 1;
          this.renderChapter();
        }
      }, { passive: true });

      window.addEventListener('hashchange', () => {
        this.openFromHash();
        this.renderChapter();
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReaderEngine.init());
  } else {
    ReaderEngine.init();
  }

  global.ReaderEngine = ReaderEngine;
})(typeof window !== 'undefined' ? window : globalThis);
