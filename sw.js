/**
 * ============================================================================
 * SERVICE WORKER: sw.js (v3.0 Two-Tier Cache + Synthetic 206 Range Support)
 * Мемориально-образовательный комплекс ГБПОУ СРМК «Быть воином — жить вечно»
 * ============================================================================
 */

const CACHE_NAME = 'srmk-museum-v3.1-shell';
const PORTRAIT_CACHE = 'srmk-portraits-v3';
const AUDIO_CACHE = 'srmk-audio-v3';
const MAX_AUDIO_ENTRIES = 25;

// Tier 1 Precache: App Shell + <= 40 KB thumbnails (no heavy MP3s or full portraits on install)
const PRECACHE_ASSETS = [
  './',
  './index.html',
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

  './css/tokens.css',
  './css/base.css',
  './css/shell.css',
  './css/themes.css',
  './css/pages/home.css',
  './css/pages/book-reader.css',
  './css/pages/quiz.css',
  './css/pages/certificates.css',
  './css/pages/desk-qr.css',
  './css/pages/guestbook.css',
  './css/pages/methodology.css',
  './css/pages/error-404.css',

  './js/config.js',
  './js/qr-code.js',
  './js/cloud-sync.js',
  './js/data.js',
  './js/sources.js',
  './js/navigation.js',
  './js/audio-dock.js',
  './js/tts-narrator.js',
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
  './js/methodology.js',
  './js/grand-memory-book-part-1.js',
  './js/grand-memory-book-part-2.js',
  './js/grand-memory-book-part-3.js',

  // <= 40 KB hero thumbnails
  './assets/images/heroes/thumbs/petukhov.webp',
  './assets/images/heroes/thumbs/yaryshev.webp',
  './assets/images/heroes/thumbs/sopolev.webp',
  './assets/images/heroes/thumbs/belov.webp',
  './assets/images/heroes/thumbs/shartov.webp',
  './assets/images/heroes/thumbs/nazyrov.webp',
  './assets/images/heroes/thumbs/lukyanenko.webp',
  './assets/images/heroes/thumbs/nazarenko.webp',
  './assets/images/heroes/thumbs/lutsenko.webp',
  './assets/images/heroes/thumbs/ponomarchuk.webp',
  './assets/images/heroes/thumbs/martynov.webp',
  './assets/images/heroes/thumbs/gorlov.webp',
  './assets/images/heroes/thumbs/vecherka.webp',
  './assets/images/heroes/thumbs/samokhin.webp',
  './assets/images/heroes/thumbs/butov.webp',
  './assets/images/heroes/thumbs/elagin.webp',
  './assets/images/heroes/thumbs/grigoriev.webp',
  './assets/images/heroes/thumbs/brynza.webp',
  './assets/images/heroes/thumbs/serbienko.webp',
  './assets/images/heroes/thumbs/chupin.webp',

  './assets/images/logo-srmk.png',
  './assets/images/cover-master.jpg',
  './assets/images/memorial-bg.jpg',
  './assets/images/order-courage.jpg',
  './assets/images/icons/icon-192.png',
  './assets/images/icons/icon-512.png',
  './assets/images/icons/apple-touch-icon.png',
  './assets/images/icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_ASSETS.map((url) => cache.add(url).catch(() => {}))
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([CACHE_NAME, PORTRAIT_CACHE, AUDIO_CACHE]);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => (validCaches.has(n) ? null : caches.delete(n))))
    ).then(() => self.clients.claim())
  );
});

// Teacher classroom pre-warm message from methodology.html / projector mode
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'WARM_LESSON_CACHE') return;
  const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
  event.waitUntil(
    (async () => {
      const portraitCache = await caches.open(PORTRAIT_CACHE);
      const audioCache = await caches.open(AUDIO_CACHE);
      let done = 0;
      for (const u of urls) {
        try {
          const targetCache = u.endsWith('.mp3') ? audioCache : portraitCache;
          const existing = await targetCache.match(u);
          if (!existing) {
            const res = await fetch(u);
            if (res && res.status === 200) await targetCache.put(u, res);
          }
          done += 1;
        } catch (_) {}
      }
      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.postMessage({ type: 'WARM_LESSON_DONE', done, total: urls.length }));
    })()
  );
});

async function evictAudioCacheIfNeeded(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_AUDIO_ENTRIES) return;
  const toDelete = keys.length - MAX_AUDIO_ENTRIES;
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(keys[i]);
  }
}

async function handleAudioRangeRequest(req) {
  const cache = await caches.open(AUDIO_CACHE);
  const urlNoRange = req.url;
  let fullRes = await cache.match(urlNoRange);

  if (!fullRes) {
    // Fetch full 200 MP3 without Range header so Cache Storage accepts it
    const netRes = await fetch(urlNoRange);
    if (netRes && netRes.status === 200) {
      await cache.put(urlNoRange, netRes.clone());
      await evictAudioCacheIfNeeded(cache);
      fullRes = netRes;
    } else {
      return netRes;
    }
  }

  const rangeHeader = req.headers.get('range');
  if (!rangeHeader) return fullRes;

  const buf = await fullRes.arrayBuffer();
  const total = buf.byteLength;
  const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
  if (!match) return fullRes;

  const start = Math.min(Number(match[1]), total - 1);
  const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
  const sliced = buf.slice(start, end + 1);

  return new Response(sliced, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': fullRes.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(sliced.byteLength)
    }
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  const url = new URL(req.url);
  if (url.hostname.includes('supabase.co')) return;

  // MP3 Audio Guides with synthetic 206 Range support
  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(
      handleAudioRangeRequest(req).catch(() => new Response('', { status: 503 }))
    );
    return;
  }

  // Full hero portraits (on-demand cache in PORTRAIT_CACHE)
  if (url.pathname.includes('/assets/images/heroes/') && !url.pathname.includes('/thumbs/')) {
    event.respondWith(
      caches.open(PORTRAIT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const netRes = await fetch(req);
          if (netRes && netRes.status === 200) {
            cache.put(req, netRes.clone());
          }
          return netRes;
        } catch (_) {
          return caches.match('./assets/images/cover-master.jpg');
        }
      })
    );
    return;
  }

  // HTML Navigation: Network-First
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('./index.html')))
    );
    return;
  }

  // Other static assets: Cache-First + background refresh
  event.respondWith(
    caches.match(req).then((cached) => {
      const netFetch = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => cached || new Response('', { status: 408 }));
      return cached || netFetch;
    })
  );
});
