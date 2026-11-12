/**
 * ============================================================================
 * ГЕНЕРАТОР МЕМОРИАЛЬНЫХ ОТКРЫТОК ПАМЯТИ: js/memorial-card-generator.js (v1.0)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. Генерация брендированных карточек памяти для соцсетей (9:16 Stories и 1:1 Post)
 * 2. Портрет героя, георгиевская кайма, герб СРМК, награды и орденская звезда
 * 3. Встроенный векторный QR-код на архивное досье в виртуальном музее
 * 4. Скачивание PNG, копирование в буфер и шеринг в VK, Telegram, Сферум
 * 5. Разблокировка наградного ордена «Хранитель славы» (+80 XP)
 * ============================================================================
 */

(function() {
  'use strict';

  const MemorialCardGenerator = {
    modalEl: null,
    canvasEl: null,
    currentHero: null,
    currentFormat: 'story', // 'story' (9:16) или 'post' (1:1)

    init() {
      // Глобальный слушатель кнопок открытия генератора
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-card-generator], .btn-open-card-generator');
        if (trigger) {
          e.preventDefault();
          const heroId = trigger.getAttribute('data-hero-id');
          this.openModal(heroId);
        }
      });
    },

    openModal(heroId = null) {
      this.getOrCreateModal();

      // Гарантируем наличие pure-JS генератора QR-кодов
      if (!window.QRCode && !document.querySelector('script[src*="qr-code.js"]')) {
        const s = document.createElement('script');
        s.src = 'js/qr-code.js';
        s.onload = () => this.renderCard();
        document.body.appendChild(s);
      }

      const heroes = window.heroesDatabase || [];
      if (heroes.length === 0) return;

      if (heroId) {
        this.currentHero = heroes.find(h => h.id === heroId) || heroes[0];
      } else if (!this.currentHero) {
        this.currentHero = heroes[0];
      }

      const select = this.modalEl.querySelector('#cardHeroSelect');
      if (select) {
        select.value = this.currentHero.id;
      }

      this.modalEl.classList.add('active');
      this.modalEl.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      this.renderCard();
    },

    closeModal() {
      if (this.modalEl) {
        this.modalEl.classList.remove('active');
        this.modalEl.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    },

    setFormat(format) {
      if (this.currentFormat === format) return;
      this.currentFormat = format;

      this.modalEl.querySelectorAll('.card-format-btn').forEach(btn => {
        if (btn.getAttribute('data-format') === format) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      this.renderCard();
    },

    getOrCreateModal() {
      if (this.modalEl) return this.modalEl;

      const modal = document.createElement('div');
      modal.id = 'memorialCardModal';
      modal.className = 'memorial-card-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Генератор открыток памяти для соцсетей');

      const heroes = window.heroesDatabase || [];

      modal.innerHTML = `
        <div class="card-dialog">
          <div class="card-dialog-header">
            <h3>🖼 Мемориальная открытка памяти для соцсетей</h3>
            <button type="button" class="card-dialog-close" id="cardModalCloseBtn" aria-label="Закрыть">&times;</button>
          </div>

          <div class="card-dialog-body">
            <!-- ПРЕВЬЮ CANVAS -->
            <div class="card-canvas-preview-box">
              <canvas id="memorialCardCanvas"></canvas>
            </div>

            <!-- ПАНЕЛЬ НАСТРОЕК -->
            <div class="card-settings-panel">
              <div class="card-setting-group">
                <label for="cardHeroSelect">Герой Мемориала</label>
                <select id="cardHeroSelect" class="card-select-hero">
                  ${heroes.map(h => `<option value="${h.id}">${h.name} (${h.specialty || 'СРМК'})</option>`).join('')}
                </select>
              </div>

              <div class="card-setting-group">
                <label>Формат публикации</label>
                <div class="card-format-toggle">
                  <button type="button" class="card-format-btn active" data-format="story">
                    📱 Stories / VK Клипы (9:16)
                  </button>
                  <button type="button" class="card-format-btn" data-format="post">
                    🖼 Пост / Лента (1:1)
                  </button>
                </div>
              </div>

              <button type="button" class="card-action-btn-main" id="btnDownloadCardPng">
                <span>⬇️</span>
                <span>Скачать открытку (PNG)</span>
              </button>

              <button type="button" class="card-share-btn" id="btnCopyCardBuffer" style="width:100%; padding:10px;">
                <span>📋</span>
                <span>Скопировать в буфер обмена</span>
              </button>

              <div class="card-setting-group">
                <label>Поделиться памятью</label>
                <div class="card-share-row">
                  <button type="button" class="card-share-btn" id="btnShareVk">
                    <span>🔵</span>
                    <span>ВКонтакте</span>
                  </button>
                  <button type="button" class="card-share-btn" id="btnShareTelegram">
                    <span>✈️</span>
                    <span>Telegram</span>
                  </button>
                </div>
              </div>

              <div style="font-size:0.75rem; color:#94a3b8; line-height:1.4; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px;">
                💡 <em>Открытка содержит официальный QR-код на архивное досье героя в виртуальном музее ГБПОУ СРМК. Подходит для уроков «Разговоры о важном», стенгазет и постов памяти.</em>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modalEl = modal;
      this.canvasEl = modal.querySelector('#memorialCardCanvas');

      // Закрытие
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
      modal.querySelector('#cardModalCloseBtn')?.addEventListener('click', () => this.closeModal());

      // Выбор героя
      modal.querySelector('#cardHeroSelect')?.addEventListener('change', (e) => {
        const id = e.target.value;
        this.currentHero = (window.heroesDatabase || []).find(h => h.id === id);
        this.renderCard();
      });

      // Переключение формата
      modal.querySelectorAll('.card-format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setFormat(btn.getAttribute('data-format'));
        });
      });

      // Скачивание
      modal.querySelector('#btnDownloadCardPng')?.addEventListener('click', () => this.downloadPng());

      // Копирование в буфер
      modal.querySelector('#btnCopyCardBuffer')?.addEventListener('click', () => this.copyToClipboard());

      // Шеринг
      modal.querySelector('#btnShareVk')?.addEventListener('click', () => this.shareSocial('vk'));
      modal.querySelector('#btnShareTelegram')?.addEventListener('click', () => this.shareSocial('tg'));

      return modal;
    },

    renderCard() {
      if (!this.canvasEl || !this.currentHero) return;

      const hero = this.currentHero;
      const canvas = this.canvasEl;
      const ctx = canvas.getContext('2d');

      const isStory = this.currentFormat === 'story';
      const width = isStory ? 1080 : 1080;
      const height = isStory ? 1920 : 1080;

      canvas.width = width;
      canvas.height = height;

      // 1. Благородный темный гранитный фон
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, height * 0.7);
      bgGrad.addColorStop(0, '#1a202c');
      bgGrad.addColorStop(0.65, '#0e1117');
      bgGrad.addColorStop(1, '#05070a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Двойная золотая кайма с орнаментами
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      ctx.strokeStyle = 'rgba(223, 186, 109, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(46, 46, width - 92, height - 92);

      // Угловые акценты
      const cornerSize = 28;
      const drawCorner = (x, y, dx, dy) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * cornerSize, y);
        ctx.strokeStyle = '#dfba6d';
        ctx.lineWidth = 5;
        ctx.stroke();
      };
      drawCorner(36, 36, 1, 1);
      drawCorner(width - 36, 36, -1, 1);
      drawCorner(36, height - 36, 1, -1);
      drawCorner(width - 36, height - 36, -1, -1);

      // 3. Георгиевская лента / триколор в шапке открытки
      const ribbonY = 64;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(52, ribbonY, width - 104, 38);

      // Георгиевские полосы
      const ribbonWidth = width - 104;
      const stripeHeight = 6;
      ['#e65100', '#111', '#e65100', '#111', '#e65100'].forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(52, ribbonY + 4 + idx * stripeHeight, ribbonWidth, stripeHeight);
      });

      // 4. Текстовая шапка
      ctx.fillStyle = '#dfba6d';
      ctx.font = '700 24px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '3px';
      ctx.fillText('ГБПОУ СРМК • МЕМОРИАЛЬНЫЙ КОМПЛЕКС', width / 2, isStory ? 165 : 145);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px Cinzel, Georgia, serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('«БЫТЬ ВОИНОМ — ЖИТЬ ВЕЧНО»', width / 2, isStory ? 215 : 190);

      // 5. Загрузка и отрисовка портрета героя в медальоне
      const photoSrc = hero.media?.photo || hero.photo || `assets/images/heroes/${hero.id}.jpg`;
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const renderHeroDetails = () => {
        const photoY = isStory ? 580 : 430;
        const photoRadius = isStory ? 240 : 180;

        // Золотое кольцо медальона
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, photoY, photoRadius + 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(197, 160, 89, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#dfba6d';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Отрисовка круглой фотографии
        ctx.beginPath();
        ctx.arc(width / 2, photoY, photoRadius, 0, Math.PI * 2);
        ctx.clip();
        try {
          ctx.drawImage(img, width / 2 - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
        } catch (e) {
          ctx.fillStyle = '#2d3748';
          ctx.fillRect(width / 2 - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
          ctx.fillStyle = '#dfba6d';
          ctx.font = '700 80px sans-serif';
          ctx.fillText('🎖', width / 2, photoY + 28);
        }
        ctx.restore();

        // 6. Имя героя крупно
        let curY = isStory ? 940 : 680;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${isStory ? 48 : 42}px Cinzel, Georgia, serif`;
        ctx.fillText(hero.name.toUpperCase(), width / 2, curY);

        // Звание и специальность
        curY += isStory ? 56 : 46;
        ctx.fillStyle = '#dfba6d';
        ctx.font = `700 ${isStory ? 26 : 22}px Montserrat, sans-serif`;
        const specialty = hero.education?.specialty || hero.specialty || 'Выпускник колледжа';
        const rank = hero.military?.rank || hero.rank || 'Воин ВС РФ';
        ctx.fillText(`${rank} • Выпускник: ${specialty}`, width / 2, curY);

        // Годы жизни / награды
        curY += isStory ? 44 : 38;
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `600 ${isStory ? 24 : 20}px Montserrat, sans-serif`;
        const years = hero.dates?.years || hero.years || '';
        const awardsList = Array.isArray(hero.awards) ? hero.awards.join(', ') : (hero.awards || 'Орден Мужества');
        ctx.fillText(`${years ? `(${years}) • ` : ''}🎖 ${awardsList}`, width / 2, curY);

        // Памятная цитата / подвиг
        if (isStory) {
          curY += 75;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.fillRect(100, curY - 35, width - 200, 110);
          ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(100, curY - 35, width - 200, 110);

          ctx.fillStyle = '#f1f5f9';
          ctx.font = 'italic 500 23px Georgia, serif';
          const quote = hero.quote || hero.deed || '«Служение Отечеству и верность воинскому долгу»';
          ctx.fillText(quote.length > 70 ? quote.slice(0, 68) + '…' : quote, width / 2, curY + 24);
        }

        // 7. QR-код на архивное досье
        const qrSize = isStory ? 220 : 150;
        const qrX = width / 2 - qrSize / 2;
        const qrY = isStory ? 1420 : 830;
        const heroUrl = `https://phsquad.github.io/srmkmuseum/index.html#hero-${hero.id}`;

        this.drawQrOnCanvas(ctx, heroUrl, qrX, qrY, qrSize);

        // Подпись к QR-коду
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 18px Montserrat, sans-serif';
        ctx.fillText('Наведите камеру смартфона, чтобы открыть архивное досье', width / 2, qrY + qrSize + 32);

        // 8. Подвал
        ctx.fillStyle = '#dfba6d';
        ctx.font = '700 19px Montserrat, sans-serif';
        ctx.fillText('СТАВРОПОЛЬСКИЙ КРАЙ • ЭСТАФЕТА ПОКОЛЕНИЙ СРМК', width / 2, height - 60);
      };

      img.onload = renderHeroDetails;
      img.onerror = () => {
        img.src = `assets/images/heroes/${hero.id}.jpg`;
        setTimeout(renderHeroDetails, 100);
      };
      img.src = photoSrc;
    },

    drawQrOnCanvas(ctx, text, x, y, size) {
      // Белая плашка под QR-код
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 8, y - 8, size + 16, size + 16);
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 8, y - 8, size + 16, size + 16);

      if (window.QRCode && typeof window.QRCode.generateMatrix === 'function') {
        const matrix = window.QRCode.generateMatrix(text);
        const count = matrix.length;
        const cellSize = size / count;

        ctx.fillStyle = '#0a0c0f';
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (matrix[r][c]) {
              ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize + 0.3, cellSize + 0.3);
            }
          }
        }
      } else {
        ctx.fillStyle = '#111';
        ctx.fillRect(x, y, size, size);
      }
    },

    downloadPng() {
      if (!this.canvasEl || !this.currentHero) return;

      const link = document.createElement('a');
      const filename = `srmk_memory_card_${this.currentHero.id}_${this.currentFormat}.png`;
      link.download = filename;
      link.href = this.canvasEl.toDataURL('image/png');
      link.click();

      this.rewardUser();

      if (window.MemorialToast) {
        MemorialToast.show(`📥 Открытка памяти «${this.currentHero.name}» сохранена в PNG!`, 'success');
      }
    },

    async copyToClipboard() {
      if (!this.canvasEl) return;
      try {
        this.canvasEl.toBlob(async (blob) => {
          if (!blob) return;
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          this.rewardUser();
          if (window.MemorialToast) {
            MemorialToast.show('📋 Открытка памяти скопирована в буфер обмена! Вставьте в пост или сообщение (Ctrl+V).', 'success');
          }
        });
      } catch (e) {
        if (window.MemorialToast) {
          MemorialToast.show('💡 Нажмите «Скачать открытку (PNG)» для отправки файла в соцсети.', 'info');
        }
      }
    },

    shareSocial(platform) {
      if (!this.currentHero) return;
      const url = encodeURIComponent(`https://phsquad.github.io/srmkmuseum/index.html#hero-${this.currentHero.id}`);
      const title = encodeURIComponent(`Мемориал Славы ГБПОУ СРМК: Подвиг выпускника колледжа ${this.currentHero.name}. Быть воином — жить вечно!`);

      let targetUrl = '';
      if (platform === 'vk') {
        targetUrl = `https://vk.com/share.php?url=${url}&title=${title}`;
      } else if (platform === 'tg') {
        targetUrl = `https://t.me/share/url?url=${url}&text=${title}`;
      }

      if (targetUrl) {
        window.open(targetUrl, '_blank', 'width=650,height=550,resizable=yes');
        this.rewardUser();
      }
    },

    rewardUser() {
      if (window.AchievementsEngine) {
        window.AchievementsEngine.addXP(80, `Создание мемориальной открытки памяти ${this.currentHero.name}`);
        window.AchievementsEngine.unlockBadge('badge_card_creator');
      }
    }
  };

  MemorialCardGenerator.init();
  window.MemorialCardGenerator = MemorialCardGenerator;
})();
