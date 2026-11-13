/**
 * ============================================================================
 * ЛОГИКА ГЕНЕРАТОРА «ПАРТА ГЕРОЯ»: js/desk-qr.js (v1.0 Master)
 * Выбор из 20 героев, привязка к аудиториям, QR-генерация и пакетная печать
 * ============================================================================
 */

'use strict';

const DeskQREngine = {
  selectedHeroId: "nazyrov-sh-r",
  mode: "single",            // 'single' | 'all'
  orientation: "landscape",   // 'landscape' | 'portrait'
  theme: "theme-parchment",   // 'theme-parchment' | 'theme-clean'

  init() {
    this.populateHeroDropdown();
    this.bindControls();
    this.renderPreview();
    console.log("[DeskQR] Конструктор Парт Героев готов.");
  },

  /**
   * 1. Заполнение выпадающего списка 20 героями
   */
  populateHeroDropdown() {
    const select = document.getElementById('selectHero');
    if (!select) return;

    select.innerHTML = '';
    const list = (typeof heroesDatabase !== 'undefined') ? heroesDatabase : [];

    const hashId = window.location.hash.replace(/^#hero-|^#/, '');
    if (hashId && list.some(h => h.id === hashId)) {
      this.selectedHeroId = hashId;
    }

    list.forEach(hero => {
      const opt = document.createElement('option');
      opt.value = hero.id;
      opt.textContent = `${hero.name} (${hero.education?.specialty || 'СРМК'})`;
      if (hero.id === this.selectedHeroId) opt.selected = true;
      select.appendChild(opt);
    });
  },

  /**
   * 2. Привязка элементов управления
   */
  bindControls() {
    document.getElementById('selectHero').addEventListener('change', (e) => {
      this.selectedHeroId = e.target.value;
      this.renderPreview();
    });

    // Режим печати (Один / Все 20)
    document.getElementById('modeSingleBtn').addEventListener('click', (e) => this.setMode('single', e.target));
    document.getElementById('modeAllBtn').addEventListener('click', (e) => this.setMode('all', e.target));

    // Ориентация
    document.getElementById('orientLandscapeBtn').addEventListener('click', (e) => this.setOrientation('landscape', e.target));
    document.getElementById('orientPortraitBtn').addEventListener('click', (e) => this.setOrientation('portrait', e.target));

    // Тема
    document.getElementById('themeParchmentBtn').addEventListener('click', (e) => this.setTheme('theme-parchment', e.target));
    document.getElementById('themeCleanBtn').addEventListener('click', (e) => this.setTheme('theme-clean', e.target));

    // Живой ввод кабинета и наставника
    document.getElementById('inputClassroom').addEventListener('input', () => this.renderPreview());
    document.getElementById('inputTeacher').addEventListener('input', () => this.renderPreview());

    // Печать
    document.getElementById('btnPrintPlaque').addEventListener('click', () => {
      if (window.AchievementsEngine) {
        window.AchievementsEngine.trackDeskGenerated();
      }
      window.print();
    });

    // Экспорт в Retina HD PNG
    document.getElementById('btnExportPlaquePng')?.addEventListener('click', () => {
      this.exportPlaquePng();
    });

    // Автоподбор кабинета
    document.getElementById('btnQuickFillAll').addEventListener('click', () => {
      const hero = heroesDatabase.find(h => h.id === this.selectedHeroId);
      if (hero) {
        const spec = hero.education?.specialty || '';
        if (spec.includes('электр')) {
          document.getElementById('inputClassroom').value = 'Мастерская электромонтажа № 104';
        } else if (spec.includes('свар')) {
          document.getElementById('inputClassroom').value = 'Сварочно-производственный комплекс № 2';
        } else if (spec.includes('пожарн') || spec.includes('мчс')) {
          document.getElementById('inputClassroom').value = 'Кабинет защиты в ЧС № 302';
        } else if (spec.includes('сетей') || spec.includes('компьютер')) {
          document.getElementById('inputClassroom').value = 'Лаборатория сетевого администрирования IT-201';
        } else if (spec.includes('авто')) {
          document.getElementById('inputClassroom').value = 'Лаборатория диагностики двигателей № 12';
        } else {
          document.getElementById('inputClassroom').value = 'Учебная аудитория спецдисциплин № 205';
        }
        this.renderPreview();
        this.showToast('Аудитория подобрана по специальности!');
      }
    });
  },

  setMode(mode, btn) {
    this.mode = mode;
    document.querySelectorAll('#modeSingleBtn, #modeAllBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('selectHero').disabled = (mode === 'all');
    this.renderPreview();
  },

  setOrientation(orient, btn) {
    this.orientation = orient;
    document.querySelectorAll('#orientLandscapeBtn, #orientPortraitBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderPreview();
  },

  setTheme(theme, btn) {
    this.theme = theme;
    document.querySelectorAll('#themeParchmentBtn, #themeCleanBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.renderPreview();
  },

  /**
   * 3. Генерация DOM таблички А4
   */
  renderPreview() {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    container.innerHTML = '';

    const classroom = document.getElementById('inputClassroom').value;
    const teacher = document.getElementById('inputTeacher').value;

    if (this.mode === 'single') {
      const hero = heroesDatabase.find(h => h.id === this.selectedHeroId) || heroesDatabase[0];
      container.appendChild(this.createPlaqueDOM(hero, classroom, teacher));
    } else {
      // Пакетный режим: формируем все 20 парт подряд
      heroesDatabase.forEach(hero => {
        container.appendChild(this.createPlaqueDOM(hero, classroom, teacher));
      });
    }
  },

  createPlaqueDOM(hero, classroom, teacher) {
    const sheet = document.createElement('article');
    const isPortrait = this.orientation === 'portrait';
    sheet.className = `plaque-sheet ${this.theme} ${isPortrait ? 'orient-portrait' : ''}`;

    const photoSrc = hero.media?.photo || 'assets/images/memorial-bg.jpg';
    const qrTargetUrl = new URL(`index.html#hero-${encodeURIComponent(hero.id)}`, window.location.href).href;
    const qrApiUrl = (typeof CertificateVerifier !== 'undefined' && CertificateVerifier.getQrCodeSrc)
      ? CertificateVerifier.getQrCodeSrc(qrTargetUrl, 160)
      : `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrTargetUrl)}`;

    sheet.innerHTML = `
      <div class="plaque-frame-outer"></div>
      <div class="plaque-frame-inner"></div>
      <div class="plaque-corner corner-tl"></div>
      <div class="plaque-corner corner-tr"></div>
      <div class="plaque-corner corner-bl"></div>
      <div class="plaque-corner corner-br"></div>

      <!-- Шапка -->
      <header class="plaque-header">
        <div class="plaque-project-title">ПАРТА ГЕРОЯ • МЕМОРИАЛ СЛАВЫ</div>
        <div class="plaque-college-sub">ГБПОУ «Ставропольский региональный многопрофильный колледж»</div>
      </header>

      <!-- Центральный блок -->
      <div class="plaque-grid-content">
        
        <!-- Левая колонка: Фото + QR -->
        <div class="plaque-left-col">
          <div class="plaque-photo-frame">
            <img src="${photoSrc}" alt="${hero.name}" loading="lazy" decoding="async" onerror="this.src='assets/images/memorial-bg.jpg'">
          </div>
          <div class="plaque-qr-box">
            <img src="${qrApiUrl}" alt="QR" class="plaque-qr-img" loading="lazy" decoding="async">
            <div class="plaque-qr-text">
              Наведите камеру<br>для перехода<br>в цифровой музей
            </div>
          </div>
        </div>

        <!-- Правая колонка: Биография и Подвиг -->
        <div class="plaque-right-col">
          <div class="plaque-hero-name">${hero.name}</div>
          <div class="plaque-years-badge">${hero.dates?.years || 'Навечно в строю'}</div>

          <div class="plaque-info-block">
            <strong>Специальность и учеба в колледже:</strong>
            ${hero.education?.specialty || 'Выпускник СРМК'} (${hero.education?.period || 'Годы учебы'})
            ${hero.education?.honors ? ` • <em>${hero.education.honors}</em>` : ''}
          </div>

          <div class="plaque-info-block">
            <strong>Ратный подвиг и воинский долг:</strong>
            ${hero.military?.rank || 'Воин ВС РФ'} ${hero.military?.unit ? `• ${hero.military.unit}` : ''}<br>
            ${hero.deed || 'Сведения о боевом пути и подвиге верифицированы архивами колледжа.'}
          </div>

          ${hero.quote ? `
            <div class="plaque-quote-box">
              «${hero.quote}»
            </div>
          ` : ''}

          <div class="plaque-info-block">
            <strong>Государственные награды:</strong>
            ${(hero.awards || ['Орден Мужества (посмертно)']).join(', ')}
          </div>
        </div>

      </div>

      <!-- Подвал -->
      <footer class="plaque-footer">
        <div><span class="plaque-room-badge">${classroom}</span></div>
        <div>${teacher}</div>
        <div>Мемориальный реестр ГБПОУ СРМК • Всероссийский проект «Карта доблести»</div>
      </footer>
    `;

    return sheet;
  },

  exportPlaquePng() {
    const btn = document.getElementById('btnExportPlaquePng');
    if (btn) btn.innerHTML = '⏳ Формирование Retina HD...';

    const hero = (typeof heroesDatabase !== 'undefined' ? heroesDatabase : []).find(h => h.id === this.selectedHeroId) || (window.heroesDatabase ? window.heroesDatabase[0] : null);
    if (!hero) return;

    const classroom = document.getElementById('inputClassroom').value;
    const teacher = document.getElementById('inputTeacher').value;

    const isPortrait = this.orientation === 'portrait';
    const baseW = isPortrait ? 1240 : 1754;
    const baseH = isPortrait ? 1754 : 1240;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(baseW * (dpr >= 2 ? 1.5 : 1));
    canvas.height = Math.round(baseH * (dpr >= 2 ? 1.5 : 1));
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / baseW;
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Гранитный/пергаментный фон
    ctx.fillStyle = this.theme === 'theme-clean' ? '#ffffff' : '#fcfaf5';
    ctx.fillRect(0, 0, baseW, baseH);

    // 2. Рамка
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 6;
    ctx.strokeRect(32, 32, baseW - 64, baseH - 64);
    ctx.strokeStyle = '#8a1c22';
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, baseW - 88, baseH - 88);

    // 3. Шапка
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8a1c22';
    ctx.font = 'bold 22px "Cinzel", Georgia, serif';
    ctx.fillText('ГБПОУ «СТАВРОПОЛЬСКИЙ РЕГИОНАЛЬНЫЙ МНОГОПРОФИЛЬНЫЙ КОЛЛЕДЖ»', baseW / 2, 90);
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 28px "Montserrat", sans-serif';
    ctx.fillText('ВСЕРОССИЙСКИЙ ОБРАЗОВАТЕЛЬНЫЙ ПРОЕКТ «ПАРТА ГЕРОЯ»', baseW / 2, 130);

    // 4. Фото героя и детали
    const photoImg = new Image();
    photoImg.crossOrigin = 'anonymous';
    const photoUrl = hero.media?.photo || hero.photo || `assets/images/heroes/${hero.id}.jpg`;
    photoImg.src = photoUrl;

    photoImg.onload = () => {
      // Рисуем фото слева
      const imgX = 80;
      const imgY = 180;
      const imgW = 340;
      const imgH = 440;

      ctx.save();
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 4;
      ctx.strokeRect(imgX, imgY, imgW, imgH);
      ctx.drawImage(photoImg, imgX, imgY, imgW, imgH);
      ctx.restore();

      // Данные героя справа
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px "Cinzel", Georgia, serif';
      ctx.fillText(hero.name, imgX + imgW + 40, imgY + 50);

      ctx.fillStyle = '#8a1c22';
      ctx.font = 'bold 24px "Montserrat", sans-serif';
      ctx.fillText(hero.military?.rank || 'Воин Вооруженных Сил России', imgX + imgW + 40, imgY + 100);

      ctx.fillStyle = '#475569';
      ctx.font = '22px "Montserrat", sans-serif';
      ctx.fillText(`Специальность: ${hero.education?.specialty || 'Выпускник СРМК'}`, imgX + imgW + 40, imgY + 150);
      ctx.fillText(`Годы жизни: ${hero.dates?.years || '1996 — 2022'}`, imgX + imgW + 40, imgY + 195);
      ctx.fillText(`Награды: ${Array.isArray(hero.awards) ? hero.awards.join(', ') : hero.awards}`, imgX + imgW + 40, imgY + 240);

      // Рубеж подвига
      if (hero.mapCoords?.locationName) {
        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 20px "Montserrat", sans-serif';
        ctx.fillText(`Рубеж подвига: ${hero.mapCoords.locationName}`, imgX + imgW + 40, imgY + 285);
      }

      // 5. QR-код аудиоэкскурсии в правом углу
      const qrSize = 220;
      const qrX = baseW - qrSize - 90;
      const qrY = baseH - qrSize - 160;

      if (window.QRCode && typeof window.QRCode.generateMatrix === 'function') {
        const heroUrl = `https://phsquad.github.io/srmkmuseum/index.html#hero-${hero.id}`;
        const matrix = window.QRCode.generateMatrix(heroUrl);
        const count = matrix.length;
        const cellSize = qrSize / count;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 3;
        ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

        ctx.fillStyle = '#0a0c0f';
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (matrix[r][c]) {
              ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize + 0.3, cellSize + 0.3);
            }
          }
        }
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px "Montserrat", sans-serif';
      ctx.fillText('Наведите камеру смартфона', qrX + qrSize / 2, qrY + qrSize + 25);
      ctx.fillText('для прослушивания аудиогида', qrX + qrSize / 2, qrY + qrSize + 45);

      // 6. Подвал таблички
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8a1c22';
      ctx.font = 'bold 20px "Montserrat", sans-serif';
      ctx.fillText(classroom, 80, baseH - 100);
      ctx.fillStyle = '#475569';
      ctx.font = '18px "Montserrat", sans-serif';
      ctx.fillText(teacher, 80, baseH - 70);

      // Скачивание
      const link = document.createElement('a');
      link.download = `Парта_Героя_${hero.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      if (btn) btn.innerHTML = '<span>📥</span> Скачать табличку (PNG / Retina HD)';
      this.showToast('📥 Табличка «Парта Героя» сохранена в Retina HD!');
    };

    photoImg.onerror = () => {
      if (btn) btn.innerHTML = '<span>📥</span> Скачать табличку (PNG / Retina HD)';
      this.showToast('Ошибка загрузки портрета.');
    };
  },

  showToast(msg) {
    const toast = document.getElementById('deskToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2500);
  }
};

window.DeskQREngine = DeskQREngine;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DeskQREngine.init());
} else {
  DeskQREngine.init();
}