/**
 * ============================================================================
 * НАГРАДНАЯ ПАЛАТА И СИСТЕМА ДОСТИЖЕНИЙ: js/achievements-engine.js (v8.0 Master)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * 
 * Включает:
 * 1. 9-ступенчатую военно-патриотическую иерархию чинов и званий (0 – 5000+ XP)
 * 2. 27 наградных орденов и медалей по 4 категориям (Квест, Мемориал, Архив, EdTech)
 * 3. Полную двустороннюю синхронизацию с облачной базой данных Supabase (Realtime Omni-Sync)
 * 4. Зал почёта и живой рейтинг курсантов (Leaderboard) из базы данных
 * 5. Интерактивный профиль курсанта (ФИО, учебная группа, персональный жетон)
 * 6. Акустический отклик триумфа через SoundEngine и Web Audio API
 * ============================================================================
 */

'use strict';

const AchievementsEngine = {
  // 9 ВОИНСКИХ РАНГОВ КОМПЛЕКСА
  RANKS: [
    { id: 'private',     title: 'Рядовой',                 minXP: 0,    maxXP: 149,  icon: '🎖️',   insignia: 'Курсант-новобранец' },
    { id: 'gefreiter',   title: 'Ефрейтор',                minXP: 150,  maxXP: 349,  icon: '🎖️🎖️', insignia: '2 полосы' },
    { id: 'jr_sergeant', title: 'Младший сержант',         minXP: 350,  maxXP: 699,  icon: '⭐️',    insignia: '1 лычка' },
    { id: 'sergeant',    title: 'Сержант',                 minXP: 700,  maxXP: 1199, icon: '⭐️⭐️',  insignia: '2 лычки' },
    { id: 'starshina',   title: 'Старшина',                minXP: 1200, maxXP: 1799, icon: '⭐️⭐️⭐️', insignia: 'Шеврон' },
    { id: 'jr_lieut',    title: 'Младший лейтенант',       minXP: 1800, maxXP: 2499, icon: '🌟',    insignia: 'Офицерская звезда' },
    { id: 'captain',     title: 'Гвардии капитан',         minXP: 2500, maxXP: 3499, icon: '🌟🌟',  insignia: 'Гвардейский знак' },
    { id: 'major',       title: 'Майор летописи',          minXP: 3500, maxXP: 4999, icon: '🌟🌟🌟', insignia: 'Орденская звезда' },
    { id: 'custodian',   title: 'Хранитель Мемориала',     minXP: 5000, maxXP: 999999, icon: '👑',   insignia: 'Золотая звезда Памяти' }
  ],

  // 27 БОЕВЫХ, МЕМОРИАЛЬНЫХ И ИССЛЕДОВАТЕЛЬСКИХ НАГРАД
  BADGES: [
    // ------------------------------------------------------------------------
    // КАТЕГОРИЯ I: КВЕСТ И ЭРУДИЦИЯ (quiz) - 8 наград
    // ------------------------------------------------------------------------
    {
      id: 'badge_first_blood',
      category: 'quiz',
      icon: '🎯',
      title: 'Боевое крещение',
      desc: 'Дайте первый верный ответ в историческом квесте музея.',
      xp: 50
    },
    {
      id: 'badge_sharpshooter',
      category: 'quiz',
      icon: '⚡',
      title: 'Снайпер фактов',
      desc: 'Ответьте правильно на 5 вопросов квеста подряд без ошибок.',
      xp: 100
    },
    {
      id: 'badge_speedrun',
      category: 'quiz',
      icon: '⏱',
      title: 'Молниеносный ответ',
      desc: 'Дайте верный ответ на вопрос квеста быстрее чем за 5 секунд.',
      xp: 75
    },
    {
      id: 'badge_no_hints',
      category: 'quiz',
      icon: '🧠',
      title: 'Своим умом',
      desc: 'Пройдите раунд квеста целиком, не использовав подсказки.',
      xp: 120
    },
    {
      id: 'badge_winner',
      category: 'quiz',
      icon: '🏆',
      title: 'Кавалер доблести',
      desc: 'Сдайте норматив квеста (8 и более баллов из 10).',
      xp: 150
    },
    {
      id: 'badge_perfect',
      category: 'quiz',
      icon: '👑',
      title: 'Абсолютный триумф',
      desc: 'Наберите максимальные 100% баллов в квесте без единой ошибки.',
      xp: 250
    },
    {
      id: 'badge_marathon',
      category: 'quiz',
      icon: '🎖',
      title: 'Железная стойкость',
      desc: 'Пройдите «Большой марафон: 20 героев» от начала до конца.',
      xp: 300
    },
    {
      id: 'badge_daily_quest',
      category: 'quiz',
      icon: '⭐️',
      title: 'Ежедневный дозор',
      desc: 'Ответьте на вопрос дня и почтите память Героя сегодняшнего дня.',
      xp: 70
    },

    // ------------------------------------------------------------------------
    // КАТЕГОРИЯ II: МЕМОРИАЛ И ПАМЯТЬ (memorial) - 7 наград
    // ------------------------------------------------------------------------
    {
      id: 'badge_candle_light',
      category: 'memorial',
      icon: '🕯',
      title: 'Свеча Памяти',
      desc: 'Зажгите виртуальную лампаду у Мемориала Славы колледжа.',
      xp: 50
    },
    {
      id: 'badge_vigil',
      category: 'memorial',
      icon: '🔥',
      title: 'Огни памяти',
      desc: 'Зажгите свечи памяти как минимум 5 разным выпускникам-героям.',
      xp: 150
    },
    {
      id: 'badge_all_candles',
      category: 'memorial',
      icon: '🌟',
      title: 'Стена бессмертия',
      desc: 'Зажгите поминальные лампады всем 20 выпускникам колледжа!',
      xp: 300
    },
    {
      id: 'badge_flowers',
      category: 'memorial',
      icon: '💐',
      title: 'Алые гвоздики',
      desc: 'Возложите цветы к Мемориалу Славы павших воинов.',
      xp: 60
    },
    {
      id: 'badge_silence',
      category: 'memorial',
      icon: '🕊',
      title: 'Хранитель тишины',
      desc: 'Почтите память павших: 60 секунд Всероссийской Минуты молчания.',
      xp: 100
    },
    {
      id: 'badge_tribute_writer',
      category: 'memorial',
      icon: '✍️',
      title: 'Слово благодарности',
      desc: 'Оставьте памятное послание в книге скорби на Стене Памяти музея.',
      xp: 80
    },
    {
      id: 'badge_heart_tribute',
      category: 'memorial',
      icon: '❤️',
      title: 'Сердечный отклик',
      desc: 'Зажгите лампаду признательности под отзывом другого посетителя.',
      xp: 50
    },

    // ------------------------------------------------------------------------
    // КАТЕГОРИЯ III: АРХИВ И ИССЛЕДОВАНИЕ (archive) - 6 наград
    // ------------------------------------------------------------------------
    {
      id: 'badge_first_dossier',
      category: 'archive',
      icon: '🔎',
      title: 'Первое знакомство',
      desc: 'Изучите подробное архивное досье и боевой путь выпускника колледжа.',
      xp: 50
    },
    {
      id: 'badge_archivist',
      category: 'archive',
      icon: '🗂',
      title: 'Главный архивариус',
      desc: 'Изучите архивные досье 10 выпускников-героев колледжа.',
      xp: 150
    },
    {
      id: 'badge_grand_historian',
      category: 'archive',
      icon: '📚',
      title: 'Летописец 20 судеб',
      desc: 'Изучите биографии и подвиги всех 20 героев Ставропольского края!',
      xp: 350
    },
    {
      id: 'badge_reader',
      category: 'archive',
      icon: '📖',
      title: 'Хранитель летописи',
      desc: 'Изучите очерки в Электронной Книге Памяти (21 исторический том).',
      xp: 80
    },
    {
      id: 'badge_3d_reader',
      category: 'archive',
      icon: '📜',
      title: 'Шелест вечности',
      desc: 'Откройте и изучите интерактивный 3D-фолиант в читалке музея.',
      xp: 90
    },
    {
      id: 'badge_audio_listener',
      category: 'archive',
      icon: '🎧',
      title: 'Голос подвига',
      desc: 'Прослушайте дикторскую аудиоэкскурсию или личный аудиогид героя.',
      xp: 70
    },

    // ------------------------------------------------------------------------
    // КАТЕГОРИЯ IV: ОБРАЗОВАНИЕ И ПЛАТФОРМА (edtech) - 6 наград
    // ------------------------------------------------------------------------
    {
      id: 'badge_desk_builder',
      category: 'edtech',
      icon: '🪑',
      title: 'За партой Героя',
      desc: 'Сформируйте настенную или настольную памятную табличку А4 с QR-кодом.',
      xp: 100
    },
    {
      id: 'badge_card_creator',
      category: 'edtech',
      icon: '🖼',
      title: 'Хранитель славы',
      desc: 'Создайте мемориальную открытку памяти героя для социальных сетей (9:16).',
      xp: 80
    },
    {
      id: 'badge_lesson_director',
      category: 'edtech',
      icon: '🎬',
      title: 'Наставник мужества',
      desc: 'Запустите полноэкранный презентационный режим «Урок Мужества» (16:9).',
      xp: 120
    },
    {
      id: 'badge_certified',
      category: 'edtech',
      icon: '📜',
      title: 'Наградной лист',
      desc: 'Оформите официальный именной Сертификат с уникальным номером реестра.',
      xp: 150
    },
    {
      id: 'badge_verifier',
      category: 'edtech',
      icon: '🛡',
      title: 'Знак подлинности',
      desc: 'Проверьте подлинность документа в едином реестре верификации.',
      xp: 60
    },
    {
      id: 'badge_spotlight_scout',
      category: 'edtech',
      icon: '🧭',
      title: 'Штурман экспозиции',
      desc: 'Воспользуйтесь быстрым Spotlight-поиском по героям и залам (Ctrl+K).',
      xp: 40
    }
  ],

  activeTab: 'all',

  init() {
    this.ensureState();
    this.injectUI();
    this.updateHeaderRankDisplay();

    // Загрузка и синхронизация с облачной базой данных Supabase
    this.initCloudBinding();

    window.addEventListener('srmk-achievements-updated', () => this.updateHeaderRankDisplay());
    window.addEventListener('srmk-counters-reset', () => {
      this.ensureState();
      this.updateHeaderRankDisplay();
    });

    console.log(`[AchievementsEngine v8.0] Ядро активно. Чин: ${this.getCurrentRank().title} (${this.getXP()} XP). Привязано к Supabase.`);
  },

  getUserId() {
    let aid = localStorage.getItem('srmk_user_aid');
    if (!aid) {
      aid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      try {
        localStorage.setItem('srmk_user_aid', aid);
      } catch (e) {}
    }
    return aid;
  },

  getUserProfile() {
    return {
      name: localStorage.getItem('srmk_student_name') || localStorage.getItem('srmk_quiz_user_name') || 'Курсант СРМК',
      group: localStorage.getItem('srmk_student_group') || localStorage.getItem('srmk_quiz_user_group') || 'Отделение СПО',
      userId: this.getUserId()
    };
  },

  setUserProfile(name, group) {
    if (name) {
      localStorage.setItem('srmk_student_name', name.trim());
      localStorage.setItem('srmk_quiz_user_name', name.trim());
    }
    if (group) {
      localStorage.setItem('srmk_student_group', group.trim());
      localStorage.setItem('srmk_quiz_user_group', group.trim());
    }
    this.syncToCloud(0, null);
    this.renderModalContent();
    if (window.MemorialToast) {
      MemorialToast.show('✅ Профиль курсанта обновлен и синхронизирован с базой Supabase!', 'success');
    }
  },

  getStats() {
    try {
      const s = JSON.parse(localStorage.getItem('srmk_achievements_stats') || '{}');
      return {
        candlesLitHeroes: Array.isArray(s.candlesLitHeroes) ? s.candlesLitHeroes : [],
        viewedHeroes: Array.isArray(s.viewedHeroes) ? s.viewedHeroes : [],
        flowersLaid: Number(s.flowersLaid) || 0,
        audioHeard: Number(s.audioHeard) || 0,
        chaptersRead: Number(s.chaptersRead) || 0,
        pagesTurned: Number(s.pagesTurned) || 0,
        quizzesPassed: Number(s.quizzesPassed) || 0,
        desksGenerated: Number(s.desksGenerated) || 0,
        tributesWritten: Number(s.tributesWritten) || 0,
        cardsCreated: Number(s.cardsCreated) || 0,
        silenceCount: Number(s.silenceCount) || 0,
        cinemaStarted: Number(s.cinemaStarted) || 0,
        verifiedCount: Number(s.verifiedCount) || 0,
        spotlightCount: Number(s.spotlightCount) || 0
      };
    } catch (e) {
      return { candlesLitHeroes: [], viewedHeroes: [] };
    }
  },

  saveStats(stats) {
    try {
      localStorage.setItem('srmk_achievements_stats', JSON.stringify(stats));
    } catch (e) {}
  },

  // --------------------------------------------------------------------------
  // СИНХРОНИЗАЦИЯ С ОБЛАЧНОЙ БАЗОЙ ДАННЫХ SUPABASE
  // --------------------------------------------------------------------------
  initCloudBinding() {
    if (window.CloudSync && CloudSync.isLive) {
      this.loadFromCloud();
    } else {
      setTimeout(() => this.loadFromCloud(), 1200);
      setTimeout(() => this.loadFromCloud(), 3500);
    }

    window.addEventListener('online', () => this.loadFromCloud());

    // Слушатель получения наград в реальном времени из базы данных
    window.addEventListener('srmk-achievement-unlocked-cloud', (e) => {
      this.prependAchievementFeedItem(e.detail);
    });
  },

  async loadFromCloud() {
    if (!window.CloudSync || !CloudSync.isLive) return;
    try {
      const userId = this.getUserId();
      const cloudData = await CloudSync.fetchUserAchievements(userId);
      if (cloudData) {
        let localXP = this.getXP();
        let localBadges = this.getUnlockedBadges();
        let cloudXP = typeof cloudData.xp === 'number' ? cloudData.xp : 0;
        let cloudBadges = Array.isArray(cloudData.unlocked_badges) ? cloudData.unlocked_badges : [];

        // Объединяем полученные бейджи и максимальный XP
        const mergedBadges = Array.from(new Set([...localBadges, ...cloudBadges]));
        const targetXP = Math.max(localXP, cloudXP);

        localStorage.setItem('srmk_user_xp', String(targetXP));
        localStorage.setItem('srmk_unlocked_badges', JSON.stringify(mergedBadges));

        if (cloudData.student_name && !localStorage.getItem('srmk_student_name')) {
          localStorage.setItem('srmk_student_name', cloudData.student_name);
        }
        if (cloudData.group_name && !localStorage.getItem('srmk_student_group')) {
          localStorage.setItem('srmk_student_group', cloudData.group_name);
        }

        if (cloudData.stats && typeof cloudData.stats === 'object') {
          const localStats = this.getStats();
          const mergedStats = {
            candlesLitHeroes: Array.from(new Set([...(localStats.candlesLitHeroes || []), ...(cloudData.stats.candlesLitHeroes || [])])),
            viewedHeroes: Array.from(new Set([...(localStats.viewedHeroes || []), ...(cloudData.stats.viewedHeroes || [])])),
            flowersLaid: Math.max(localStats.flowersLaid || 0, cloudData.stats.flowersLaid || 0),
            audioHeard: Math.max(localStats.audioHeard || 0, cloudData.stats.audioHeard || 0),
            chaptersRead: Math.max(localStats.chaptersRead || 0, cloudData.stats.chaptersRead || 0),
            pagesTurned: Math.max(localStats.pagesTurned || 0, cloudData.stats.pagesTurned || 0),
            quizzesPassed: Math.max(localStats.quizzesPassed || 0, cloudData.stats.quizzesPassed || 0),
            desksGenerated: Math.max(localStats.desksGenerated || 0, cloudData.stats.desksGenerated || 0),
            tributesWritten: Math.max(localStats.tributesWritten || 0, cloudData.stats.tributesWritten || 0),
            cardsCreated: Math.max(localStats.cardsCreated || 0, cloudData.stats.cardsCreated || 0),
            silenceCount: Math.max(localStats.silenceCount || 0, cloudData.stats.silenceCount || 0),
            cinemaStarted: Math.max(localStats.cinemaStarted || 0, cloudData.stats.cinemaStarted || 0),
            verifiedCount: Math.max(localStats.verifiedCount || 0, cloudData.stats.verifiedCount || 0),
            spotlightCount: Math.max(localStats.spotlightCount || 0, cloudData.stats.spotlightCount || 0)
          };
          this.saveStats(mergedStats);
        }

        this.updateHeaderRankDisplay();
        console.log(`[AchievementsEngine] ☁️ Прогресс загружен из Supabase (${targetXP} XP, ${mergedBadges.length} наград)`);
      } else {
        this.syncToCloud(0, null);
      }
    } catch (err) {
      console.warn('[AchievementsEngine] Ошибка загрузки из облака:', err);
    }
  },

  async syncToCloud(deltaXP = 0, newBadge = null) {
    if (!window.CloudSync || !CloudSync.isLive) return;
    try {
      const profile = this.getUserProfile();
      const rank = this.getCurrentRank();

      await CloudSync.syncUserProgress({
        userId: profile.userId,
        studentName: profile.name,
        groupName: profile.group,
        xpDelta: deltaXP,
        rankId: rank.id,
        rankTitle: rank.title,
        newBadgeId: newBadge?.id || null,
        newBadgeTitle: newBadge?.title || null,
        badgeIcon: newBadge?.icon || '🎖️',
        badgeCategory: newBadge?.category || 'museum',
        badgeXp: newBadge?.xp || 0,
        statsJson: this.getStats()
      });
    } catch (e) {
      console.warn('[AchievementsEngine] Ошибка отправки прогресса в БД:', e);
    }
  },

  handleCloudUpdate(row) {
    if (!row || row.user_id !== this.getUserId()) return;
    if (typeof row.xp === 'number') {
      localStorage.setItem('srmk_user_xp', String(row.xp));
    }
    if (Array.isArray(row.unlocked_badges)) {
      localStorage.setItem('srmk_unlocked_badges', JSON.stringify(row.unlocked_badges));
    }
    if (row.stats && typeof row.stats === 'object') {
      this.saveStats(row.stats);
    }
    this.updateHeaderRankDisplay();
  },

  // --------------------------------------------------------------------------
  // ИНТЕРФЕЙС И ВСТРАИВАНИЕ В ШАПКУ И МОБИЛЬНЫЙ DRAWER
  // --------------------------------------------------------------------------
  injectUI() {
    const existingBtn = document.getElementById('btnHeaderRankBadge');
    if (existingBtn) {
      existingBtn.onclick = () => this.openModal();
    } else {
      const headerActions = document.querySelector('.site-header .header-actions');
      if (headerActions) {
        const rankBtn = document.createElement('button');
        rankBtn.id = 'btnHeaderRankBadge';
        rankBtn.className = 'btn-header-rank-badge';
        rankBtn.type = 'button';
        rankBtn.title = 'Ваш воинский чин и наградные ордена (Нажмите для открытия)';
        rankBtn.onclick = () => this.openModal();
        const certBtn = headerActions.querySelector('.btn-header-cert');
        if (certBtn) {
          headerActions.insertBefore(rankBtn, certBtn);
        } else {
          headerActions.appendChild(rankBtn);
        }
      }
    }

    const existingDrawerLink = document.getElementById('drawerAchievementsLink');
    if (existingDrawerLink) {
      existingDrawerLink.onclick = () => {
        const drawer = document.getElementById('mobileDrawer');
        if (drawer) drawer.classList.remove('open');
        this.openModal();
      };
    } else {
      const drawerContent = document.querySelector('.mobile-drawer .drawer-content');
      if (drawerContent) {
        const drawerLink = document.createElement('button');
        drawerLink.id = 'drawerAchievementsLink';
        drawerLink.className = 'drawer-link drawer-rank-link';
        drawerLink.type = 'button';
        drawerLink.style.cssText = 'text-align:left; background:transparent; border:none; cursor:pointer; width:100%;';
        drawerLink.onclick = () => {
          const drawer = document.getElementById('mobileDrawer');
          if (drawer) drawer.classList.remove('open');
          this.openModal();
        };
        const verLink = drawerContent.querySelector('a[href*="verify.html"]');
        if (verLink) {
          drawerContent.insertBefore(drawerLink, verLink);
        } else {
          drawerContent.appendChild(drawerLink);
        }
      }
    }
  },

  updateHeaderRankDisplay() {
    const rank = this.getCurrentRank();
    const xp = this.getXP();
    const unlocked = this.getUnlockedBadges().length;
    const total = this.BADGES.length;

    const hdrBtn = document.getElementById('btnHeaderRankBadge');
    if (hdrBtn) {
      hdrBtn.innerHTML = `
        <span class="rank-btn-icon">${rank.icon}</span>
        <span class="rank-btn-title">${rank.title}</span>
        <span class="rank-btn-xp">${xp} XP</span>
      `;
    }

    const hdrXp = document.getElementById('hdrRankXp');
    if (hdrXp) {
      hdrXp.textContent = `${xp} XP`;
    }

    const drawerLink = document.getElementById('drawerAchievementsLink');
    if (drawerLink) {
      drawerLink.innerHTML = `🎖 Звание: <strong>${rank.title}</strong> (${xp} XP) • ${unlocked}/${total} наград`;
    }

    if (document.getElementById('achievementsModal')?.classList.contains('active')) {
      this.renderModalContent();
    }
  },

  openModal() {
    let modal = document.getElementById('achievementsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'achievementsModal';
      modal.className = 'achievements-modal-overlay';
      modal.innerHTML = `
        <div class="achievements-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modalRankHeaderTitle">
          <div class="achieve-modal-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.8rem;">🏛</span>
              <div>
                <h2 id="modalRankHeaderTitle" style="font-family:'Cinzel',serif; font-size:1.3rem; color:var(--primary-gold,#dfba6d); margin:0;">
                  Наградная палата и воинские чины
                </h2>
                <span style="font-size:0.8rem; color:#9da6b3;">Мемориально-образовательный комплекс ГБПОУ СРМК</span>
              </div>
            </div>
            <button class="achieve-modal-close" onclick="AchievementsEngine.closeModal()" type="button" aria-label="Закрыть">✕</button>
          </div>
          <div class="achieve-modal-body" id="achieveModalBody">
            <!-- Динамический рендер содержимого -->
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) this.closeModal();
      });
    }

    this.renderModalContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    const modal = document.getElementById('achievementsModal');
    if (modal) {
      modal.classList.remove('active');
    }
    document.body.style.overflow = '';
  },

  renderModalContent() {
    const body = document.getElementById('achieveModalBody');
    if (!body) return;

    const rank = this.getCurrentRank();
    const nextRank = this.getNextRank();
    const xp = this.getXP();
    const progress = this.getRankProgressPercent();
    const unlocked = this.getUnlockedBadges();
    const totalBadges = this.BADGES.length;
    const filter = this.activeTab || 'all';
    const profile = this.getUserProfile();
    const isLive = window.CloudSync?.isLive;

    let filteredBadges = this.BADGES;
    if (filter === 'quiz') filteredBadges = this.BADGES.filter(b => b.category === 'quiz');
    else if (filter === 'memorial') filteredBadges = this.BADGES.filter(b => b.category === 'memorial');
    else if (filter === 'archive') filteredBadges = this.BADGES.filter(b => b.category === 'archive');
    else if (filter === 'edtech') filteredBadges = this.BADGES.filter(b => b.category === 'edtech');
    else if (filter === 'unlocked') filteredBadges = this.BADGES.filter(b => unlocked.includes(b.id));

    body.innerHTML = `
      <!-- ПРОФИЛЬ КУРСАНТА И ОБЛАЧНЫЙ СТАТУС SUPABASE -->
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(197,160,89,0.3); border-radius:10px; padding:16px 20px; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:#dfba6d; font-weight:700;">
              Учетная карточка исследователя
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
              <strong style="font-size:1.15rem; color:#fff;" id="profileDisplayName">${profile.name}</strong>
              <span style="font-size:0.85rem; color:#94a3b8;">(${profile.group})</span>
              <button type="button" onclick="AchievementsEngine.promptEditProfile()" style="background:none; border:none; color:#dfba6d; cursor:pointer; font-size:0.85rem;" title="Редактировать ФИО и группу">✏️</button>
            </div>
            <div style="font-size:0.72rem; color:#64748b; margin-top:2px;">
              Жетон: <code>${profile.userId}</code>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px; font-size:0.78rem; background:rgba(0,0,0,0.3); padding:6px 12px; border-radius:20px; border:1px solid rgba(255,255,255,0.1);">
            <span style="width:8px; height:8px; border-radius:50%; background:${isLive ? '#22c55e' : '#f59e0b'}; box-shadow:0 0 8px ${isLive ? '#22c55e' : '#f59e0b'};"></span>
            <span style="color:#cbd5e1;">${isLive ? 'Supabase Cloud: Синхронизировано' : 'Офлайн (Локальное хранилище)'}</span>
          </div>
        </div>
      </div>

      <!-- КАРТОЧКА ТЕКУЩЕГО ВОИНСКОГО ЧИНА -->
      <div class="modal-rank-card">
        <div class="rank-badge-large">
          <span class="rank-large-icon">${rank.icon}</span>
        </div>
        <div class="rank-card-info">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
            <div>
              <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1.5px; color:#c5a059; font-weight:700;">Ваше текущее звание:</span>
              <h3 style="font-family:'Cinzel',serif; font-size:1.4rem; color:#ffffff; margin:2px 0 6px;">${rank.title}</h3>
              <span class="rank-insignia-pill">${rank.insignia}</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:1.4rem; font-weight:900; color:#c5a059;">${xp} XP</span>
              <div style="font-size:0.75rem; color:#9da6b3;">
                ${nextRank ? `До звания «${nextRank.title}»: ${nextRank.minXP - xp} XP` : 'Максимальный чин'}
              </div>
            </div>
          </div>

          <div class="modal-rank-progress-track" style="margin-top:14px;">
            <div class="modal-rank-progress-fill" style="width:${progress}%;"></div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#9da6b3; margin-top:6px;">
            <span>${rank.minXP} XP</span>
            <span>Прогресс: ${progress}%</span>
            <span>${nextRank ? nextRank.minXP + ' XP' : '∞'}</span>
          </div>
        </div>
      </div>

      <!-- ЛЕСТНИЦА ЗВАНИЙ -->
      <div class="ranks-ladder-container">
        <div class="ranks-ladder-title">Иерархия чинов комплекса:</div>
        <div class="ranks-ladder-scroll">
          ${this.RANKS.map(r => {
            const isCurrent = r.id === rank.id;
            const isAchieved = xp >= r.minXP;
            return `
              <div class="ladder-rank-step ${isCurrent ? 'current' : ''} ${isAchieved ? 'achieved' : 'locked'}">
                <span class="step-icon">${r.icon}</span>
                <span class="step-title">${r.title}</span>
                <span class="step-xp">${r.minXP} XP</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ВКЛАДКИ НАВИГАЦИИ -->
      <div class="achieve-tabs-bar">
        <button type="button" class="achieve-tab-btn ${filter === 'all' ? 'active' : ''}" onclick="AchievementsEngine.setTab('all')">
          Все награды (${totalBadges})
        </button>
        <button type="button" class="achieve-tab-btn ${filter === 'quiz' ? 'active' : ''}" onclick="AchievementsEngine.setTab('quiz')">
          ⚔️ Квест (8)
        </button>
        <button type="button" class="achieve-tab-btn ${filter === 'memorial' ? 'active' : ''}" onclick="AchievementsEngine.setTab('memorial')">
          🕯 Мемориал (7)
        </button>
        <button type="button" class="achieve-tab-btn ${filter === 'archive' ? 'active' : ''}" onclick="AchievementsEngine.setTab('archive')">
          📖 Архив (6)
        </button>
        <button type="button" class="achieve-tab-btn ${filter === 'edtech' ? 'active' : ''}" onclick="AchievementsEngine.setTab('edtech')">
          🎓 EdTech (6)
        </button>
        <button type="button" class="achieve-tab-btn ${filter === 'leaderboard' ? 'active' : ''}" onclick="AchievementsEngine.setTab('leaderboard')">
          🏆 Зал почёта (Рейтинг)
        </button>
        <button type="button" class="achieve-tab-btn ${filter === 'unlocked' ? 'active' : ''}" onclick="AchievementsEngine.setTab('unlocked')">
          ✅ Полученные (${unlocked.length})
        </button>
      </div>

      ${filter === 'leaderboard' 
        ? `<div id="achieveLeaderboardSlot" style="margin-top:16px;">
             <div style="text-align:center; padding:30px; color:#94a3b8;">
               ⏳ Загрузка Зала почёта из базы данных Supabase...
             </div>
           </div>`
        : `
          <!-- СЕТКА НАГРАДНЫХ БЕЙДЖЕЙ -->
          <div class="achieve-badges-grid">
            ${filteredBadges.map(b => {
              const isUnlocked = unlocked.includes(b.id);
              return `
                <div class="achieve-badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                  <div class="badge-card-top">
                    <span class="badge-card-icon">${b.icon}</span>
                    <span class="badge-status-tag ${isUnlocked ? 'tag-unlocked' : 'tag-locked'}">
                      ${isUnlocked ? '✓ Открыто' : '🔒 Закрыто'}
                    </span>
                  </div>
                  <h4 class="badge-card-title">${b.title}</h4>
                  <p class="badge-card-desc">${b.desc}</p>
                  <div class="badge-card-footer">
                    <span class="badge-xp-reward">+${b.xp} XP</span>
                    <span class="badge-cat-label">${this.getCategoryLabel(b.category)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `
      }

      <!-- БЫСТРЫЕ ДЕЙСТВИЯ -->
      <div class="achieve-quick-actions" style="margin-top:20px;">
        <span style="font-size:0.85rem; color:#9da6b3;">Как получить новые ордена и повысить чин:</span>
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">
          <a href="quiz.html" class="achieve-action-chip">⚔️ Исторический квест (+50–250 XP)</a>
          <a href="index.html#memorial" class="achieve-action-chip">🕯 Свеча Памяти (+15–300 XP)</a>
          <a href="javascript:void(0)" onclick="MemorialCeremony.start()" class="achieve-action-chip">⏱ Минута молчания (+100 XP)</a>
          <a href="javascript:void(0)" onclick="MemorialCardGenerator.openModal()" class="achieve-action-chip">🖼 Открытка 9:16 (+80 XP)</a>
          <a href="javascript:void(0)" onclick="LessonCinema.start()" class="achieve-action-chip">🎬 Кино-Урок Мужества (+120 XP)</a>
          <a href="reader.html" class="achieve-action-chip">📚 3D Фолиант Памяти (+90 XP)</a>
          <a href="guestbook.html" class="achieve-action-chip">🕊 Послание на Стене (+80 XP)</a>
        </div>
      </div>

      <!-- ФУТЕР МОДАЛЬНОГО ОКНА -->
      <div class="achieve-modal-footer-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:8px; font-size:0.78rem; color:#9da6b3;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
          <span>База данных: <strong>Supabase Realtime Cloud</strong> (Синхронизация профиля и наград)</span>
        </div>
        <button type="button" class="btn-achieve-reset-all" onclick="AchievementsEngine.promptReset()" style="background:rgba(239,68,68,0.12); color:#fca5a5; border:1px solid rgba(239,68,68,0.3); padding:7px 14px; border-radius:6px; font-size:0.78rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.2s;">
          <span>↺</span>
          <span>Сбросить прогресс</span>
        </button>
      </div>
    `;

    if (filter === 'leaderboard') {
      this.loadAndRenderLeaderboard();
    }
  },

  async loadAndRenderLeaderboard() {
    const slot = document.getElementById('achieveLeaderboardSlot');
    if (!slot) return;

    let leaders = [];
    if (window.CloudSync && typeof CloudSync.fetchLeaderboard === 'function') {
      leaders = await CloudSync.fetchLeaderboard(12);
    }

    const myId = this.getUserId();
    const myProfile = this.getUserProfile();
    const myXP = this.getXP();
    const myRank = this.getCurrentRank();
    const myBadgesCount = this.getUnlockedBadges().length;

    // Если список пустой, создаем локальный эталон
    if (!leaders || leaders.length === 0) {
      leaders = [
        { user_id: myId, student_name: myProfile.name, group_name: myProfile.group, xp: myXP, rank_title: myRank.title, unlocked_badges: this.getUnlockedBadges() },
        { user_id: 'sample_1', student_name: 'Курсант гр. ИСП-21', group_name: 'ИСП-21', xp: 2150, rank_title: 'Младший лейтенант', unlocked_badges: new Array(12) },
        { user_id: 'sample_2', student_name: 'Совет Музея СРМК', group_name: 'Актив', xp: 1850, rank_title: 'Младший лейтенант', unlocked_badges: new Array(10) },
        { user_id: 'sample_3', student_name: 'Юнармейский отряд', group_name: 'Юнармия', xp: 1400, rank_title: 'Старшина', unlocked_badges: new Array(8) }
      ];
    } else {
      // Проверяем, есть ли текущий пользователь среди лидеров
      const inList = leaders.some(l => l.user_id === myId);
      if (!inList) {
        leaders.push({
          user_id: myId,
          student_name: `${myProfile.name} (Вы)`,
          group_name: myProfile.group,
          xp: myXP,
          rank_title: myRank.title,
          unlocked_badges: this.getUnlockedBadges()
        });
        leaders.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      }
    }

    slot.innerHTML = `
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(197,160,89,0.3); border-radius:10px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse; font-size:0.86rem; text-align:left;">
          <thead>
            <tr style="background:rgba(197,160,89,0.15); color:#dfba6d; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">
              <th style="padding:10px 14px;">№</th>
              <th style="padding:10px 14px;">Исследователь / Курсант</th>
              <th style="padding:10px 14px;">Группа</th>
              <th style="padding:10px 14px;">Воинский чин</th>
              <th style="padding:10px 14px; text-align:center;">Ордена</th>
              <th style="padding:10px 14px; text-align:right;">Очки XP</th>
            </tr>
          </thead>
          <tbody>
            ${leaders.map((lead, idx) => {
              const isMe = lead.user_id === myId;
              const medals = Array.isArray(lead.unlocked_badges) ? lead.unlocked_badges.length : (lead.unlocked_badges ? 5 : 0);
              const medalIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
              return `
                <tr style="border-top:1px solid rgba(255,255,255,0.06); background:${isMe ? 'rgba(197,160,89,0.18)' : 'transparent'};">
                  <td style="padding:10px 14px; font-weight:700; color:#dfba6d;">${medalIcon}</td>
                  <td style="padding:10px 14px; color:#fff; font-weight:${isMe ? '700' : '500'};">
                    ${this.escapeHtml(lead.student_name || 'Курсант СРМК')} ${isMe ? '⭐ (Вы)' : ''}
                  </td>
                  <td style="padding:10px 14px; color:#94a3b8;">${this.escapeHtml(lead.group_name || 'СРМК')}</td>
                  <td style="padding:10px 14px; color:#cbd5e1;">${this.escapeHtml(lead.rank_title || 'Рядовой')}</td>
                  <td style="padding:10px 14px; text-align:center; color:#dfba6d;">🎖️ ${medals}</td>
                  <td style="padding:10px 14px; text-align:right; font-weight:700; color:#dfba6d;">${lead.xp || 0} XP</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  promptEditProfile() {
    const cur = this.getUserProfile();
    const name = window.prompt('Введите ваше ФИО или позывной для Книги Почёта:', cur.name);
    if (name === null) return;
    const group = window.prompt('Введите вашу учебную группу или организацию (напр., ИСП-21):', cur.group);
    if (group === null) return;
    this.setUserProfile(name, group);
  },

  getCategoryLabel(cat) {
    switch(cat) {
      case 'quiz': return 'Квест';
      case 'memorial': return 'Мемориал';
      case 'archive': return 'Архив';
      case 'edtech': return 'EdTech';
      default: return 'Музей';
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    this.renderModalContent();
  },

  ensureState() {
    try {
      if (!localStorage.getItem('srmk_user_xp')) {
        localStorage.setItem('srmk_user_xp', '0');
      }
      if (!localStorage.getItem('srmk_unlocked_badges')) {
        localStorage.setItem('srmk_unlocked_badges', JSON.stringify([]));
      }
      if (!localStorage.getItem('srmk_achievements_stats')) {
        this.saveStats({
          candlesLitHeroes: [],
          viewedHeroes: [],
          flowersLaid: 0,
          audioHeard: 0,
          chaptersRead: 0,
          pagesTurned: 0,
          quizzesPassed: 0,
          desksGenerated: 0,
          tributesWritten: 0,
          cardsCreated: 0,
          silenceCount: 0,
          cinemaStarted: 0,
          verifiedCount: 0,
          spotlightCount: 0
        });
      }
    } catch (e) {}
  },

  promptReset() {
    this.resetAll(true);
  },

  async resetAll(isUserTriggered = false) {
    if (isUserTriggered) {
      const confirmed = window.confirm(
        'ВНИМАНИЕ: СБРОС ДОСТИЖЕНИЙ И РАНГА!\n\n' +
        '• Воинский чин будет сброшен до «Рядовой» (0 XP)\n' +
        '• Все наградные ордена будут заблокированы\n' +
        '• Статистика очистится для нового занятия\n\n' +
        'Подтвердить сброс?'
      );
      if (!confirmed) return;
    }

    try {
      localStorage.setItem('srmk_user_xp', '0');
      localStorage.setItem('srmk_unlocked_badges', JSON.stringify([]));
      this.saveStats({
        candlesLitHeroes: [],
        viewedHeroes: [],
        flowersLaid: 0,
        audioHeard: 0,
        chaptersRead: 0,
        pagesTurned: 0,
        quizzesPassed: 0,
        desksGenerated: 0,
        tributesWritten: 0,
        cardsCreated: 0,
        silenceCount: 0,
        cinemaStarted: 0,
        verifiedCount: 0,
        spotlightCount: 0
      });
    } catch (e) {}

    if (window.CloudSync && typeof CloudSync.resetAllCountersAndLevels === 'function') {
      try {
        await CloudSync.resetAllCountersAndLevels();
      } catch (e) {}
    }

    this.updateHeaderRankDisplay();

    if (window.MemorialToast) {
      MemorialToast.show('↺ Счетчики, уровни и достижения сброшены.', 'tribute', 3500);
    }

    window.dispatchEvent(new CustomEvent('srmk-achievements-updated'));
    window.dispatchEvent(new CustomEvent('srmk-counters-reset'));
  },

  getXP() {
    try {
      return parseInt(localStorage.getItem('srmk_user_xp') || '0', 10);
    } catch (e) {
      return 0;
    }
  },

  addXP(amount, reason = '') {
    if (!amount || amount <= 0) return;
    const oldXP = this.getXP();
    const newXP = oldXP + amount;

    try {
      localStorage.setItem('srmk_user_xp', String(newXP));
    } catch (e) {}

    const oldRank = this.getRankByXP(oldXP);
    const newRank = this.getRankByXP(newXP);

    if (newRank.id !== oldRank.id && newXP > oldXP) {
      this.celebrateRankUp(newRank);
    }

    this.updateHeaderRankDisplay();
    this.syncToCloud(amount, null);
    this.dispatchUpdateEvent();
  },

  getUnlockedBadges() {
    try {
      return JSON.parse(localStorage.getItem('srmk_unlocked_badges') || '[]');
    } catch (e) {
      return [];
    }
  },

  isBadgeUnlocked(badgeId) {
    return this.getUnlockedBadges().includes(badgeId);
  },

  unlockBadge(badgeId) {
    const badge = this.BADGES.find(b => b.id === badgeId);
    if (!badge) return false;

    const unlocked = this.getUnlockedBadges();
    if (unlocked.includes(badgeId)) return false;

    unlocked.push(badgeId);
    try {
      localStorage.setItem('srmk_unlocked_badges', JSON.stringify(unlocked));
    } catch (e) {}

    this.addXP(badge.xp, `Награда: ${badge.title}`);
    this.syncToCloud(badge.xp, badge);

    if (window.MemorialToast) {
      MemorialToast.show(`🎖 Получена награда: <strong>${badge.title}</strong> (+${badge.xp} XP)`, 'success', 5000);
    }

    this.playCelebrationSound();
    this.dispatchUpdateEvent();
    return true;
  },

  celebrateRankUp(newRank) {
    setTimeout(() => {
      if (window.MemorialToast) {
        MemorialToast.show(`⭐️ ПОВЫШЕНИЕ В ЗВАНИИ! Вам присвоен чин: <strong>${newRank.title}</strong> ${newRank.icon}`, 'success', 5500);
      }
      this.playFanfareSound();
    }, 400);
  },

  playFanfareSound() {
    if (window.SoundEngine) {
      if (!window.SoundEngine.isEnabled()) return;
      window.SoundEngine.playAchievementChime();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.6);
      });
    } catch (e) {}
  },

  playCelebrationSound() {
    if (window.SoundEngine) {
      if (!window.SoundEngine.isEnabled()) return;
      window.SoundEngine.playAchievementChime();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [784, 988, 1174].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (e) {}
  },

  getRankByXP(xp) {
    for (let i = this.RANKS.length - 1; i >= 0; i--) {
      if (xp >= this.RANKS[i].minXP) {
        return this.RANKS[i];
      }
    }
    return this.RANKS[0];
  },

  getCurrentRank() {
    return this.getRankByXP(this.getXP());
  },

  getNextRank() {
    const current = this.getCurrentRank();
    const idx = this.RANKS.findIndex(r => r.id === current.id);
    if (idx < this.RANKS.length - 1) {
      return this.RANKS[idx + 1];
    }
    return null;
  },

  getRankProgressPercent() {
    const xp = this.getXP();
    const current = this.getCurrentRank();
    const next = this.getNextRank();
    if (!next) return 100;
    const range = next.minXP - current.minXP;
    const earned = xp - current.minXP;
    return Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
  },

  dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent('srmk-achievements-updated', {
      detail: {
        xp: this.getXP(),
        rank: this.getCurrentRank(),
        unlockedCount: this.getUnlockedBadges().length,
        totalBadges: this.BADGES.length
      }
    }));
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  // --------------------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ТРЕКЕРЫ ДЕЙСТВИЙ ПО ВСЕМУ КОМПЛЕКСУ
  // --------------------------------------------------------------------------
  trackHeroViewed(heroId) {
    const stats = this.getStats();
    stats.viewedHeroes = stats.viewedHeroes || [];
    if (heroId && !stats.viewedHeroes.includes(heroId)) {
      stats.viewedHeroes.push(heroId);
      this.saveStats(stats);

      this.addXP(10, `Изучение досье героя ${heroId}`);

      if (stats.viewedHeroes.length >= 1) {
        this.unlockBadge('badge_first_dossier');
      }
      if (stats.viewedHeroes.length >= 10) {
        this.unlockBadge('badge_archivist');
      }
      if (stats.viewedHeroes.length >= 20) {
        this.unlockBadge('badge_grand_historian');
      }
    }
  },

  trackCandleLit(heroId) {
    const stats = this.getStats();
    stats.candlesLitHeroes = stats.candlesLitHeroes || [];
    if (heroId && !stats.candlesLitHeroes.includes(heroId)) {
      stats.candlesLitHeroes.push(heroId);
    }
    this.saveStats(stats);

    this.unlockBadge('badge_candle_light');
    this.addXP(15, "Свеча Памяти герою");

    if (stats.candlesLitHeroes.length >= 5) {
      this.unlockBadge('badge_vigil');
    }
    if (stats.candlesLitHeroes.length >= 20) {
      this.unlockBadge('badge_all_candles');
    }
  },

  trackFlowersLaid() {
    const stats = this.getStats();
    stats.flowersLaid = (stats.flowersLaid || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_flowers');
    this.addXP(20, "Возложение гвоздик");
  },

  trackSilenceCompleted() {
    const stats = this.getStats();
    stats.silenceCount = (stats.silenceCount || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_silence');
    this.addXP(100, "Минута молчания");
  },

  trackAudioListened() {
    const stats = this.getStats();
    stats.audioHeard = (stats.audioHeard || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_audio_listener');
    this.addXP(30, "Прослушивание аудиоэкскурсии");
  },

  trackReaderOpened(tomeId) {
    return this.trackChapterRead(tomeId);
  },

  trackHeroShared() {
    this.addXP(25, "Распространение памяти о герое");
  },

  trackChapterRead(tomeId) {
    const stats = this.getStats();
    stats.chaptersRead = (stats.chaptersRead || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_reader');
    this.addXP(25, "Изучение Книги Памяти");
  },

  track3dPageTurn() {
    const stats = this.getStats();
    stats.pagesTurned = (stats.pagesTurned || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_3d_reader');
    this.addXP(10, "Перелистывание страниц 3D-фолианта");
  },

  trackDeskGenerated() {
    const stats = this.getStats();
    stats.desksGenerated = (stats.desksGenerated || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_desk_builder');
    this.addXP(50, "Оформление Парты Героя");
  },

  trackTributeWritten() {
    const stats = this.getStats();
    stats.tributesWritten = (stats.tributesWritten || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_tribute_writer');
    this.addXP(40, "Послание на Стене Памяти");
  },

  trackHeartTribute() {
    this.unlockBadge('badge_heart_tribute');
    this.addXP(15, "Лампада сопричастности");
  },

  trackCardCreated() {
    const stats = this.getStats();
    stats.cardsCreated = (stats.cardsCreated || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_card_creator');
    this.addXP(80, "Создание открытки памяти 9:16");
  },

  trackLessonCinemaStarted() {
    const stats = this.getStats();
    stats.cinemaStarted = (stats.cinemaStarted || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_lesson_director');
    this.addXP(120, "Запуск Урока Мужества Cinema");
  },

  trackCertificateIssued() {
    this.unlockBadge('badge_certified');
    this.addXP(100, "Официальный именной Сертификат");
  },

  trackVerificationPerformed() {
    const stats = this.getStats();
    stats.verifiedCount = (stats.verifiedCount || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_verifier');
    this.addXP(30, "Верификация в реестре");
  },

  trackSpotlightUsed() {
    const stats = this.getStats();
    stats.spotlightCount = (stats.spotlightCount || 0) + 1;
    this.saveStats(stats);
    this.unlockBadge('badge_spotlight_scout');
    this.addXP(10, "Поиск по комплексу");
  }
};

window.AchievementsEngine = AchievementsEngine;
document.addEventListener('DOMContentLoaded', () => AchievementsEngine.init());
