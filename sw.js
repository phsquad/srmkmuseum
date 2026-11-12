/**
 * ============================================================================
 * SERVICE WORKER: sw.js (v1.0 PWA Offline-First)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * ============================================================================
 */

const CACHE_NAME = 'srmk-museum-v1.0.0';

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
  './css/header-common.css',
  './js/config.js',
  './js/qr-code.js',
  './js/cloud-sync.js',
  './js/data.js',
  './js/sources.js',
  './js/navigation.js',
  './js/achievements-engine.js',
  './js/memorial-toast.js',
  './js/heraldry-resolver.js',
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
      console.log('[SW] Кэширование базовых ресурсов музея...');
      // addAll с устойчивостью к единичным сбоям
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn(`[SW] Не удалось кэшировать ${url}:`, err))
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
            console.log(`[SW] Очистка устаревшего кэша: ${name}`);
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

  // Игнорируем запросы к Supabase API / Realtime (они обрабатываются в CloudSync)
  if (url.hostname.includes('supabase.co')) return;

  // 1. Для HTML-документов (страниц): стратегия Network-first с падением в Cache
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
          return fallback || new Response('Офлайн-режим. Пожалуйста, подключитесь к сети.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Для статических ассетов (изображения, стили, скрипты, шрифты): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cachedRes);

      return cachedRes || fetchPromise;
    })
  );
});
