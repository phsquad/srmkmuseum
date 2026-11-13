/**
 * ============================================================================
 * SERVICE WORKER: sw.js (v2.1 PWA Offline-First & 4G Optimization)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * ============================================================================
 */

const CACHE_NAME = 'srmk-museum-v2.1.0-4g-retina';

// Базовые статические ресурсы для предварительного кэширования
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './mobile.html',
  './memory-book.html',
  './reader.html',
  './quiz.html',
  './certificate.html',
  './verify.html',
  './desk-qr.html',
  './guestbook.html',
  './methodology.html',
  './404.html',
  './manifest.json',

  // Таблицы стилей
  './css/header-common.css',
  './css/site-common.css',
  './css/interactivity-sprint2.css',
  './css/edtech-sprint3.css',
  './css/reader.css',
  './css/mobile-reader.css',
  './css/quiz.css',
  './css/guestbook.css',
  './css/desk-qr.css',
  './css/mobile-desk-qr.css',
  './css/pedagogy-and-visual.css',

  // Ядро скриптов
  './js/config.js',
  './js/qr-code.js',
  './js/cloud-sync.js',
  './js/data.js',
  './js/sources.js',
  './js/navigation.js',
  './js/achievements-engine.js',
  './js/memorial-toast.js',
  './js/heraldry-resolver.js',
  './js/app.js',
  './js/spotlight.js',
  './js/sound-engine.js',
  './js/memorial-ceremony.js',
  './js/memorial-card-generator.js',
  './js/lesson-cinema.js',
  './js/live-tributes-ticker.js',
  './js/daily-quest.js',
  './js/reader.js',
  './js/quiz.js',
  './js/guestbook.js',
  './js/desk-qr.js',
  './js/tech-modules.js',
  './js/certificate-verifier.js',
  './js/hall-analytics.js',
  './js/memory-book.js',
  './js/grand-memory-book-part-1.js',
  './js/grand-memory-book-part-2.js',
  './js/grand-memory-book-part-3.js',

  // 20 архивных портретов героев
  './assets/images/heroes/petukhov.jpg',
  './assets/images/heroes/yaryshev.jpg',
  './assets/images/heroes/sopolev.jpg',
  './assets/images/heroes/belov.jpg',
  './assets/images/heroes/shartov.jpg',
  './assets/images/heroes/nazyrov.jpg',
  './assets/images/heroes/lukyanenko.jpg',
  './assets/images/heroes/nazarenko.jpg',
  './assets/images/heroes/lutsenko.jpg',
  './assets/images/heroes/ponomarchuk.jpg',
  './assets/images/heroes/martynov.jpg',
  './assets/images/heroes/gorlov.jpg',
  './assets/images/heroes/vecherka.jpg',
  './assets/images/heroes/samokhin.jpg',
  './assets/images/heroes/butov.jpg',
  './assets/images/heroes/elagin.jpg',
  './assets/images/heroes/grigoriev.jpg',
  './assets/images/heroes/brynza.jpg',
  './assets/images/heroes/serbienko.jpg',
  './assets/images/heroes/chupin.jpg',

  // Ключевые изображения и фавиконы
  './assets/images/logo-srmk.png',
  './assets/images/cover-master.jpg',
  './assets/images/memorial-bg.jpg',
  './assets/images/order-courage.jpg',
  './assets/images/icons/icon-192.png',
  './assets/images/icons/icon-512.png',
  './assets/images/icons/apple-touch-icon.png',
  './assets/images/icons/favicon-32.png'
];

// Установка: предварительное кэширование ядра приложения
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v2.1] Кэширование 100% ресурсов музея (20 портретов, залы, стили, модули)...');
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn(`[SW] Ошибка предкэширования ${url}:`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Активация: удаление устаревших кэшей предыдущих версий
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[SW v2.1] Очистка устаревшего кэша: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов (Fetch Strategy)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Игнорируем запросы не по протоколу HTTP/HTTPS или не GET
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  // Игнорируем запросы к Supabase API / Realtime (обрабатываются в CloudSync)
  if (url.hostname.includes('supabase.co')) return;

  // 1. Для HTML-страниц: стратегия Network-First с немедленным падением в кэш
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match('./index.html');
          return fallback || new Response('Офлайн-режим Мемориала СРМК. Страница сохранена в локальной памяти.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Для статических ассетов (портреты, награды, стили, шрифты, скрипты): Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      if (cachedRes) {
        // Фоновое обновление в фоне для актуализации данных
        fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(req, networkRes));
            }
          })
          .catch(() => {});
        return cachedRes;
      }

      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => {
          // Если не удалось загрузить картинку героя
          if (req.destination === 'image') {
            return caches.match('./assets/images/cover-master.jpg');
          }
          return new Response('', { status: 408, statusText: 'Offline Resource' });
        });
    })
  );
});
