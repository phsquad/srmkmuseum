# Редизайн и переработка архитектуры цифрового мемориального комплекса ГБПОУ СРМК «Быть воином — жить вечно»

* **Author:** Alexander Talents Agency
* **Status:** Approved
* **Date:** 2026-11-25

--------------------------------------------------------------------------------

## Overview

Данный документ описывает архитектуру и план переработки пользовательского интерфейса, структуры страниц, модуля чтения и клиентско-серверных контрактов цифрового мемориального комплекса Государственного бюджетного профессионального образовательного учреждения «Ставропольский региональный многопрофильный колледж» (ГБПОУ СРМК, `c:\Users\Alexander Talents\Downloads\srmkmuseumWEB`).

Проект развёрнут как статический сайт на GitHub Pages с бесплатным бэкендом Supabase (PostgreSQL + Realtime) и офлайн-режимом через Service Worker (`sw.js`). Редизайн объединяет `index.html` и `mobile.html` в единый адаптивный комплекс, перестраивает структуру страниц на базе 4 семантических архетипов тем с индивидуальными акцентами и микродеталями для каждого из 4 залов и 8 модулей (при сохранении единой навигационной оболочки и контрастности WCAG AA), а также устраняет ошибки вёрстки, кэширования и базы данных без изменения текстов биографий 20 героев, содержания их портретов и 21 MP3-аудиогида (20 персональных записей и 1 общий экскурсионный тур `general-tour.mp3`).

## The Problem

Аудит живого сайта (`https://phsquad.github.io/srmkmuseum/`) и исходного кода выявил пять системных проблем:

1. **Раздвоение и поломка адаптивности:** `index.html` принудительно перенаправляет мобильных пользователей на отдельный файл `mobile.html`. При этом `mobile.html` не имеет ограничения ширины на ПК (кнопки растягиваются на ~1400 px с закреплённым нижним таб-баром), а `index.html` обрезает правую часть шапки на ширине `~856 px` и обрезает счётчики, перекрывает логотип и прячет элементы под таб-баром на ширине `390 px`.
2. **Конфликты стилей между страницами и низкая контрастность:** `quiz.html` отображает кремовый фон (`#fffbf0`) из `css/site-common.css` вокруг тёмной карточки; в `index.html` и `mobile.html` первая строка `<h1>` («ОНИ УЧИЛИСЬ ЗДЕСЬ.») и заголовки нижних карточек имеют тёмно-синий цвет на тёмном фоне; в блоке «Традиционная Вахта Памяти» отображается иконка `$`, а в подвале `memory-book.html` допущена опечатка в ссылке (`rmk.stavedu.ru` вместо `srmk.stavedu.ru`).
3. **Дублирование кода и рассинхронизация данных:** шапка и навигация скопированы в 10+ HTML-файлов; в `index.html` продублированы кнопка «Минута молчания» и блок «Герой дня» и присутствует пустой `img[src=""]`; тексты Книги Памяти дублируются между `MEMORY_BOOK_ARCHIVE` (`js/memory-book.js`) и `GRAND_MEMORY_BOOK_ARCHIVE` (`js/grand-memory-book-part-1/2/3.js`); в `quiz.html` указано «16 испытаний» при фактических 27 наградах в `js/achievements-engine.js`.
4. **Ограничения модуля чтения и первый экран `memory-book.html`:** `reader.html` ограничивает высоту книги через `clamp(520px, calc(100vh - 180px), 760px)`, обрезая или сжимая текст, и содержит «Telegram-хронику» со спойлерами и эмодзи-реакциями. В `memory-book.html` крупный постер выталкивает `<h1>` ниже линии сгиба `900 px` и содержит технический ярлык `(Markdown)` в кнопке.
5. **Производительность медиа и ошибка Supabase:** часть портретов героев в `assets/images/heroes/` весит 7–8.7 МБ (а 21 MP3-аудиогид суммарно занимает ~38 МБ), для `chupin-i-v`, `lutsenko-i-s`, `shartov-v-i` в `js/data.js` подключены SVG-заглушки вместо имеющихся фотографий. Запрос `POST /rest/v1/rpc/sync_user_achievement_progress` в Supabase возвращает `HTTP 400` из-за отсутствующей колонки `last_active_at` в таблице `user_achievements`.

## Goals

* **Полная перестройка структуры и единая адаптивная точка входа:** упразднить `mobile.html` как отдельное приложение (оставив редирект на `index.html` с сохранением query-параметров и хэша) и обеспечить работу на брейкпоинтах `>= 1200 px` (ПК), `768–1199 px` (планшеты/доски) и `< 768 px` (мобильный PWA с нижним таб-баром).
* **Тематическая дифференциация на единой основе:** сгруппировать 4 зала и 8 модулей в 4 семантических архетипа тем (`memorial`, `folio`, `tactical`, `official`) с индивидуальными акцентами и декоративными деталями на уровне `[data-section="<id>"]`, сохраняя единую шапку и контрастность WCAG AA (`>= 4.5:1` для текста, `>= 3:1` для крупных заголовков).
* **Входной экран с акцентом на композицию и свет:** реализовать низкоключевую сцену с радиальным свечением свечи на чистом CSS вокруг монумента и Ордена Мужества, высококонтрастным `<h1>`, двумя явными входами (экспозиция и аудиоэкскурсия по клику) и каскадной колодой карточек героев без WebGL.
* **Единая навигационная оболочка на базе `js/navigation.js`:** рефакторить `js/navigation.js` для инъекции общей шапки, мобильного drawer, нижнего таб-бара и подвала в статический скелет `<header>` с резервированием высоты `--header-h` и отступа `--tabbar-h` (нулевой CLS).
* **Обновлённый модуль чтения (`reader.html`) и единый архив:** перевести `js/memory-book.js` на `window.GRAND_MEMORY_BOOK_ARCHIVE` без создания лишних фасадов, удалить «Telegram-хронику», реакции и спойлеры, и реализовать адаптивный поток чтения + CSS-разворот (`column-count: 2` на `>= 1200 px`) без жёсткой обрезки по высоте.
* **Исправление багов и сквозные сценарии:** устранить ошибку Supabase `HTTP 400` (`last_active_at`), сжать портреты до `<= 250 КБ` (WebP + JPEG-фолбэк, миниатюры `<= 40 КБ`), подключить реальные фото для всех 20 героев (с миграцией старых `localStorage`-правок `js/admin.js`), добавить `js/audio-dock.js` с обработкой `NotAllowedError`, `sw.js` с поддержкой `206 Partial Content`, deep-link `?hero=<id>` и единый режим проектора (`?mode=projector` / клавиша `F`).

## Non-Goals

* Переход на серверный рендеринг (SSR), Node.js в продакшене или платные тарифы Supabase.
* Внедрение сборщиков или SPA-фреймворков (React, Vue, Vite).
* Изменение текстов биографий 20 героев, замена содержания фотографий или перезапись 21 MP3-аудиогида.
* Сохранение «Telegram-хроники», эмодзи-реакций и мерцающих спойлеров в `reader.html`.
* Нарушение контрактов `window.heroesDatabase`, `window.MuseumAPI` и DOM-селекторов, используемых встроенной CMS (`js/admin.js`).

## Critical User Journeys (CUJs)

### CUJ 1: Посетитель на ПК изучает экспозицию и слушает аудиоэкскурсию

* **Given**: Пользователь открывает `index.html` на экране `1440×900` с включённым или отключённым Supabase.
* **When**: Он видит входной экран с монументом, нажимает «Войти в экспозицию» или «Включить аудиоэкскурсию», переходит между 4 залами, открывает досье героя в Зале I/II и зажигает свечу.
* **Then**: Заголовки имеют контрастность `>= 4.5:1`, шапка не обрезается; при переходе в `memory-book.html` или `guestbook.html` плеер `js/audio-dock.js` восстанавливает позицию из `sessionStorage` (при блокировке автоплея `NotAllowedError` показывает кнопку «Продолжить с MM:SS»), а счётчик свечей обновляется локально и в Supabase Realtime.

### CUJ 2: Посетитель со смартфона сканирует QR-код на «Парте Героя»

* **Given**: Студент или гость сканирует QR-код, ведущий на `index.html?hero=<id>` (или старую ссылку `mobile.html?hero=<id>`), на экране `390×844` в школьной сети Wi-Fi.
* **When**: Страница загружается (при необходимости выполнив редирект с `mobile.html` с сохранением `?hero=<id>`), открывает досье нужного выпускника и предлагает запустить его MP3-аудиогид.
* **Then**: Первая отрисовка не грузит 7–8 МБ оригиналы и лишние портреты (предкэш содержит только каркас и миниатюры `<= 40 КБ`, полный портрет `<= 250 КБ` грузится по требованию), шапка и счётчики не выходят за края `390 px`, а нижний 5-кнопочный таб-бар работает с отступом `env(safe-area-inset-bottom)`.

### CUJ 3: Чтение Книги Памяти в `memory-book.html` и `reader.html`

* **Given**: Пользователь открывает `memory-book.html` на ПК (`1440×900`) или телефоне (`390×844`).
* **When**: Он видит заголовок `<h1>` и фильтры выше линии сгиба, выбирает том и переходит в `reader.html`.
* **Then**: Текст главы загружается из `window.GRAND_MEMORY_BOOK_ARCHIVE` без обрезки по высоте, переключается между адаптивным потоком и CSS-разворотом (`column-count: 2` на `>= 1200 px`), позволяет слушать связанный MP3 героя (или `general-tour.mp3` для Пролога) и озвучку текста через `TTSNarrator` (`js/tts-narrator.js`).

### CUJ 4: Прохождение квеста, получение сертификата и проверка подлинности

* **Given**: Студент открывает `quiz.html` (тёмный фон без кремовых полос) и видит актуальное число наград (`27`) и сетку режимов `2×2`.
* **When**: Он завершает квест, просматривает разбор ошибок, переходит в `certificate.html` для формирования именного сертификата формата А4 (серийный номер `СРМК-УМ-ГГГГ-XXXX`, где `УМ` — «Урок Мужества») и сканирует его QR-код.
* **Then**: Прогресс достижений (опыт XP и 9 воинских рангов курсанта из `AchievementsEngine.RANKS`) сохраняется в Supabase без ошибки `HTTP 400`, а ссылка с QR-кода в `verify.html` подтверждает серийный номер и хэш SHA-256 (либо в офлайне выводит сообщение о необходимости сети для сверки с реестром).

### CUJ 5: Педагог проводит «Урок Мужества» на интерактивной доске

* **Given**: Преподаватель открывает `index.html?mode=projector` (или нажимает клавишу `F`) на экране `1280×800` / `1920×1080`, предварительно подготовив план урока в `methodology.html` и нажав кнопку «Подготовить к уроку офлайн» для прогрева кэша всех 20 портретов и MP3.
* **When**: Он листает 20 героев с клавиатуры и включает минуту молчания.
* **Then**: Элементы геймификации (`[data-gamification]`, бейдж ранга в шапке) скрываются, шрифты увеличиваются, анимации уважают `prefers-reduced-motion`, а MP3-файлы и портреты воспроизводятся из кэша Service Worker (включая перемотку по `206 Partial Content`) даже при обрыве интернета.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### 1. Схема архитектуры и потоков данных

```text
+-------------------------------------------------------------------+
|  Browser (Desktop >=1200 | Tablet 768-1199 | Mobile PWA <768)     |
|                                                                   |
|  [Static Skeleton <header>] <--hydrates-- [js/navigation.js]      |
|     (Header, Drawer, Mobile Tab Bar, Footer, GOST Accessibility)  |
|                                                                   |
|  [Projector Controller: lesson-cinema.js + app.js]                |
|     (Single owner for ?mode=projector and F hotkey)               |
|                                                                   |
|  [js/audio-dock.js] <---> sessionStorage (timeupdate + pagehide)  |
|     (NotAllowedError -> "Продолжить с MM:SS" tap-to-resume UI)    |
|                                                                   |
|  [Data Layer: data.js + grand-memory-book-part-1..3.js]           |
|     |--> MuseumAPI / heroesDatabase (with admin.js path migration)|
|     |--> window.GRAND_MEMORY_BOOK_ARCHIVE (shared book & reader)  |
|                                                                   |
|  [js/cloud-sync.js] <---> Supabase (REST + Realtime + RPC)        |
|     |--> Fallback: retry without p_last_active_at / LocalStorage  |
+-------------------------------------------------------------------+
          |
          v
[Service Worker: sw.js]
  - Precache: HTML, CSS, JS, <=40KB hero thumbnails
  - On-Demand Cache: <=250KB WebP portraits + 21 MP3 (synthetic 206)
```

### 2. Карта 4 залов и 8 модулей (`data-section="<id>"` и архетипы тем)

| Раздел / Страница | Значение `data-section` | Архетип темы | Назначение и ключевые детали |
| :--- | :--- | :--- | :--- |
| Входной экран и Зал I («Мемориал Славы») | `hall-memorial` | `memorial` | Обсидиан `#0a0c0f`, золото `#e6c86e`, рубин `#8a1c22`, свечение свечи, стелы |
| Зал II («За партой Героя») | `hall-desks` | `folio` | Графитовый сланец `#131820`, бронза `#d99b43`, чертёжная сетка, фильтры 20 парт |
| Зал III («Хроника и Карта») | `hall-map` | `tactical` | Сине-серый `#0d151c`, бирюза `#5ea8c4`, изолинии, ленивая Яндекс Карта + SVG-фолбэк |
| Зал IV («Эстафета поколений») | `hall-relay` | `memorial` | Тёплый уголь `#141210`, свечной янтарь `#f0b45b`, текст клятвы и Realtime-счётчик |
| Модуль 1: `memory-book.html` | `memory-book` | `folio` | Эбонит `#11100e`, античное золото `#d4af37`, постер сбоку выше `900 px` |
| Модуль 2: `reader.html` | `reader` | `folio` | Переключатель «Тёмный фолиант» / «Тёплая бумага», буквицы, CSS-разворот |
| Модуль 3: `quiz.html` | `quiz` | `tactical` | Оружейная сталь `#12141a`, медь `#e09f3e`, сетка `2×2`, динамические `27` наград |
| Модуль 4: `certificate.html` | `certificate` | `official` | Гербовый изумруд `#0c1715`, позолота `#d8b668`, масштабируемый предпросмотр А4 |
| Модуль 5: `verify.html` | `verify` | `official` | Палитра `official`, проверка `СРМК-УМ-ГГГГ-XXXX` и SHA-256, офлайн-статус |
| Модуль 6: `desk-qr.html` | `desk-qr` | `official` | Тёплый орех/графит `#151412`, матовая латунь `#cfa85c`, сетка А4, QR `?hero=<id>` |
| Модуль 7: `guestbook.html` | `guestbook` | `memorial` | Ночной базальт `#0e1116`, лампада `#f59e0b`, фильтры и статус кулдауна (цель вкладки «Стена Памяти») |
| Модуль 8: `methodology.html` | `methodology` | `official` | Академический сапфир `#0f1622`, серебро/золото, черновики, кнопка кэширования урока |
| Служебная: `404.html` | `error-404` | `official` | Единая оболочка и возврат на `index.html` |

### 3. Слои CSS и доступность (ГОСТ Р 52872-2019)

1. `css/tokens.css` — структурные токены (`--header-h: 64px`, `--tabbar-h: 68px`), типографическая шкала (`Cinzel`, `Lora`, `Montserrat` с `font-display: swap`), цветовые переменные архетипов, обеспечивающие контрастность WCAG AA.
2. `css/base.css` — сброс стилей, тёмный фон по умолчанию, резервирование нижнего отступа `padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom))` на `< 768 px` до гидратации JS, поддержка `prefers-reduced-motion`, `[data-mode="projector"]` (скрытие `[data-gamification]`) и режимов доступности по ГОСТ Р 52872-2019 (`.high-contrast` и `.large-text`).
3. `css/shell.css` — стили 3-слотовой шапки, мобильного drawer, нижнего 5-кнопочного таб-бара (`Залы` → `index.html#memorial`, `Герои` → `index.html#heroes-grid`, `Книга` → `memory-book.html`, `Квест` → `quiz.html`, `Стена Памяти` → `guestbook.html`), сквозного мини-плеера и подвала.
4. `css/themes.css` + `css/pages/*.css` — 4 архетипа тем и локальные акценты `[data-section]`, пересобранные модули страниц.

### 4. Единая навигация (`js/navigation.js`), сквозной аудио-док (`js/audio-dock.js`) и проектор

* **`js/navigation.js` (`NavigationEngine`):** рефакторится на месте (вместо создания отдельного `js/shell.js`). Монтируется в статический `<header class="srmk-header" id="siteHeader">`, рендерит 3-слотовую шапку (бренд, навигация, поиск `Ctrl+K`, значок ранга `[data-gamification]`, переключатели ГОСТ/звука/проектора), мобильный таб-бар и подвал со ссылкой `srmk.stavedu.ru`.
* **Единый контроллер проектора:** `js/lesson-cinema.js` и `js/app.js` синхронизируются через единый обработчик `F` / `?mode=projector`, выставляющий `document.documentElement.dataset.mode = "projector"`.
* **`js/audio-dock.js`:** сохраняет `{ heroId, title, src, currentTime, isPlaying }` в `sessionStorage` по троттлингу `timeupdate` (раз в 1 сек) и `pagehide`. При переходе на новую страницу загружает трек, выставляет `currentTime` и пытается вызвать `audio.play()`. Если браузер отклоняет автовоспроизведение (`NotAllowedError`), док-плеер остаётся открытым с кнопкой «Продолжить с MM:SS».

### 5. Консолидация `index.html` + `mobile.html` и обновлённый `reader.html`

* **`index.html` / `mobile.html`:** из `index.html` удаляется скрипт мобильного редиректа и дубли «Минуты молчания» / «Героя дня». В `mobile.html` остаётся только редирект `window.location.replace('index.html' + window.location.search + window.location.hash)`.
* **Единый архив книг:** `js/memory-book.js` переводится на `window.GRAND_MEMORY_BOOK_ARCHIVE` с нормализацией поля `awards` (приведение строки к массиву) и `photo`/`audioFile`; дублирующий массив `MEMORY_BOOK_ARCHIVE` удаляется.
* **`reader.html` + `js/reader.js`:** удаляются «Telegram-хроника», эмодзи-реакции, спойлеры и ограничение высоты `clamp(..., 760px)`. Остаются 2 режима представления одного потока данных:
  1. **Адаптивный поток («Статья» / мобильный ридер):** колонка `65–72ch` на ПК, свайпы между главами на `< 768 px`, оглавление, прогресс чтения, кнопка связанного MP3 (для Пролога — `general-tour.mp3`, для глав 1–20 — MP3 героя) и озвучка через `TTSNarrator` (`js/tts-narrator.js`).
  2. **«Книжный разворот» (`>= 1200 px`):** чистый CSS multi-column (`column-count: 2` + `scroll-snap-type: x mandatory`) без расчёта высоты DOM в JS.

### 6. Оптимизация ассетов, Service Worker (`sw.js`) и Supabase

* **Портреты героев и `js/admin.js`:** все 20 фотографий сжимаются в прогрессивный `.webp` (`<= 250 КБ` карточка, `<= 40 КБ` миниатюра) с оптимизированным `.jpg`-фолбэком. В `js/data.js` для `chupin-i-v`, `lutsenko-i-s`, `shartov-v-i` прописываются реальные фото. В `js/admin.js` (`applyLocalStorageOverrides()`) добавляется нормализация устаревших `.svg`-путей на `.webp` при чтении из `localStorage`.
* **Service Worker (`sw.js`):** поднимается `CACHE_NAME` (например, `srmk-museum-v3.0`). При `install` предкэшируются HTML, CSS, JS и миниатюры `<= 40 КБ`. Полные `.webp`-портреты (`<= 250 КБ`) и 21 MP3 кэшируются по требованию. Для MP3 реализуется обработчик `Range`-запросов (кэширование полного `200`-ответа и нарезка `ArrayBuffer` в синтетический `206 Partial Content` с заголовками `Content-Range`, `Accept-Ranges: bytes`, `Content-Length`) и LRU-ограничение аудиокэша (до 100 МБ). В `methodology.html` и режиме проектора добавляется кнопка «Подготовить к уроку офлайн» для принудительного прогрева кэша всех 20 портретов и MP3.
* **База данных Supabase:** в `supabase_migration.sql` и `supabase_full_schema.sql` добавляется `last_active_at TIMESTAMPTZ DEFAULT now()` в `user_achievements` (с обязательным ручным запуском скрипта в Supabase SQL Editor при выкладке). В `js/cloud-sync.js` при `HTTP 400` на `sync_user_achievement_progress` выполняется однократный повтор без параметра `p_last_active_at` с последующим фолбэком в `localStorage`.

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternative A: Сохранение раздельных `index.html` и `mobile.html`

* **Pros**: Не нужно переделывать старую логику перенаправления и перестраивать сетки существующих файлов.
* **Cons**: Двойная поддержка двух версий главной страницы, расхождение функционала, поломка `mobile.html` на экранах ПК (`1400 px`) и обрезка `index.html` на смартфонах (`390 px`).
* **Reason for Rejection**: Rejected by author: приводит к двойной поддержке, разным багам и не даёт единого адаптивного опыта между ПК и мобильным PWA.

### Alternative B: Сохранение «Telegram-хроники», эмодзи-реакций и спойлеров в `reader.html`

* **Pros**: Готовый код уже написан в `js/reader.js`.
* **Cons**: Мессенджерные реакции и мерцающие спойлеры не соответствуют сдержанной мемориальной подаче, а жёсткая высота `clamp(..., 760px)` обрезает текст на ноутбуках и мобильных устройствах.
* **Reason for Rejection**: Rejected by author: удалено в пользу модуля чтения без мессенджерных элементов с адаптивным потоком и CSS-разворотом.

### Alternative C: Переход на SPA-фреймворк со сборщиком (React / Vue / Vite)

* **Pros**: Готовая компонентная модель и встроенный роутинг без перезагрузки страницы.
* **Cons**: Требует этапа сборки в CI/CD, усложняет локальное редактирование и ломает прямое обновление статики и `data.js` через встроенную CMS (`js/admin.js`).
* **Reason for Rejection**: Rejected by author: проект должен оставаться чистым статическим сайтом на Vanilla HTML/CSS/JS для GitHub Pages.

### Alternative D: Полностью независимые CSS-стили для каждой страницы без общего базового слоя

* **Pros**: Максимальная изоляция визуальных экспериментов на каждом экране.
* **Cons**: Повторяет текущую проблему сайта — утечку фонов (`#fffbf0` в `quiz.html`), потерю контрастности заголовков и дублирование шапки в 10+ файлах.
* **Reason for Rejection**: Rejected by author: заменено на слоёную систему (`tokens.css` → `base.css` → `shell.css` → `themes.css` с 4 архетипами и `[data-section]`), дающую индивидуальные акценты каждому разделу при сохранении единой навигации и контрастности WCAG AA.

--------------------------------------------------------------------------------

## Non-Functional Requirements

* **Доступность (`Accessibility`):** контрастность текста `>= 4.5:1` и крупных заголовков `>= 3:1` (WCAG AA), поддержка `prefers-reduced-motion`, режимы по ГОСТ Р 52872-2019 (`.high-contrast`, `.large-text`), минимальный размер кликабельных зон на мобильных `44×44 px`.
* **Производительность (`Core Web Vitals` и трафик):** целевые показатели `LCP <= 2.5 s`, `CLS <= 0.05`, `INP <= 200 ms`; первая загрузка без 7–8 МБ оригиналов и 38 МБ MP3; миниатюры `<= 40 КБ`, полные портреты `<= 250 КБ`; отложенная инициализация Яндекс Карт (только при появлении Зала III в области видимости).
* **Безопасность и приватность (ФЗ-152):** анонимная телеметрия в `js/hall-analytics.js` без сбора IP и персональных данных; сохранение проверок `js/anti-cheat-tribute.js` (PoW и кулдауны) и RLS-политик Supabase.
* **Откат и обратная совместимость:** старые ссылки и QR-коды на `mobile.html` переводятся на `index.html` с сохранением query-параметров и хэша; сохраняется совместимость с контрактами `window.heroesDatabase`, `window.MuseumAPI` и хуками `js/admin.js` (`Ctrl+Shift+A`).

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files to Create/Modify

#### 1. `supabase_migration.sql` и `supabase_full_schema.sql` (Modify)
* **Type / Scope**: SQL-схема Supabase (PostgreSQL + RPC).
* **Proposed Changes**: Добавить `ALTER TABLE public.user_achievements ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();` в `supabase_migration.sql` и проверить наличие колонки в `supabase_full_schema.sql` (функция `sync_user_achievement_progress` уже использует `last_active_at`). Зафиксировать обязательный ручной запуск `supabase_migration.sql` в Supabase SQL Editor при выкладке.

#### 2. `assets/images/heroes/*.jpg`, `assets/images/heroes/*.webp` и `assets/images/heroes/thumbs/*.webp` (Modify / Create)
* **Type / Scope**: Оптимизация медиаресурсов.
* **Proposed Changes**: Сжать все 20 портретов героев в прогрессивный WebP (`assets/images/heroes/<slug>.webp`, `<= 250 КБ`) с оптимизированным JPEG-фолбэком (`assets/images/heroes/<slug>.jpg`, `<= 250 КБ`) и создать миниатюры для предкэша (`assets/images/heroes/thumbs/<slug>.webp`, `<= 40 КБ`), сохраняя исходное кадрирование и пропорции фотографий.

#### 3. `js/data.js` и `js/admin.js` (Modify)
* **Type / Scope**: Реестр данных, API и CMS.
* **Proposed Changes**: В `js/data.js` заменить пути `.svg`-заглушек у `chupin-i-v`, `lutsenko-i-s`, `shartov-v-i` на `.webp`/`.jpg`-портреты и добавить поле `media.photoThumb` (`"assets/images/heroes/thumbs/<slug>.webp"`), сохранив `media.photo` (`"assets/images/heroes/<slug>.webp"`). Карточки рендерятся через `<picture>` (WebP + JPEG-фолбэк). В `js/admin.js` (`applyLocalStorageOverrides()`) добавить нормализацию устаревших `.svg`-путей на `.webp` и вычисление `photoThumb`, сохранив `window.heroesDatabase`, `window.MuseumAPI` и хуки `App.renderCardsGrid()`, `App.renderMemorialPlaques()`, `App.initInteractiveMap()`, `App.openModal(id)`.

#### 4. `css/tokens.css`, `css/base.css`, `css/shell.css`, `css/themes.css` (Create)
* **Type / Scope**: Ядро дизайн-системы и 4 архетипа тем.
* **Proposed Changes**:
  * `css/tokens.css`: `--header-h: 64px`, `--tabbar-h: 68px`, шрифты (`font-display: swap`), переменные 4 архетипов тем.
  * `css/base.css`: сброс, тёмный фон по умолчанию, нижний отступ для `< 768 px` до гидратации JS, `prefers-reduced-motion`, `[data-mode="projector"]` (скрытие `[data-gamification]`), классы ГОСТ Р 52872-2019 (`.high-contrast`, `.large-text`).
  * `css/shell.css`: стили 3-слотовой шапки (`#siteHeader`), drawer, нижнего 5-кнопочного таб-бара, `AudioDock` и подвала (`#siteFooter`).
  * `css/themes.css`: 4 архетипа (`memorial`, `folio`, `tactical`, `official`) + локальные акценты/текстуры через `[data-section="<id>"]`.

#### 5. `css/pages/*.css` (Create) и удаление устаревших CSS-дублей (Delete)
* **Type / Scope**: Дедупликация и объединение стилей по смыслу.
* **Proposed Changes**: Создать чистые модульные стили (`home.css`, `book-reader.css` для `memory-book.html` и `reader.html`, `quiz.css`, `certificates.css` для `certificate.html` и `verify.html`, `desk-qr.css`, `guestbook.css`, `methodology.css`, `error-404.css`). Вынести инлайн-`<style>` из `certificate.html` в `css/pages/certificates.css`. Удалить устаревшие дублирующиеся CSS-файлы (`site-common.css`, `header-common.css`, `desktop.css`, `mobile.css`, все 8 файлов `mobile-*.css`, `interactivity-sprint2.css`, `edtech-sprint3.css`, `pedagogy-and-visual.css`, `hall-analytics.css`, старые `reader.css`, `quiz.css`, `guestbook.css`, `desk-qr.css`, `memory-book.css`, `methodology.css`).

#### 6. `js/navigation.js` (Modify) и `includes/header.html` (Delete)
* **Type / Scope**: Единая навигационная оболочка (модификация `js/navigation.js` без замены файла).
* **Proposed Changes**: Инъекция 3-слотовой шапки в статический `<header class="srmk-header" id="siteHeader">`, мобильного drawer, 5-кнопочного таб-бара («Стена Памяти» → `guestbook.html`) и подвала (`srmk.stavedu.ru`) в `<footer class="srmk-footer" id="siteFooter">`. Управление значком ранга (`[data-gamification]`) и ГОСТ-переключателями. Удалить устаревший `includes/header.html`.

#### 7. `js/audio-dock.js` (Create) и `js/tts-narrator.js` (Modify)
* **Type / Scope**: Сквозной аудиоплеер и синтез речи.
* **Proposed Changes**: Реализовать `window.AudioDock` (`play(heroId, src, title)`, `pause()`, `resume()`, `seek(sec)`, `stop()`) с сохранением в `sessionStorage` (ключ `srmk_audio_dock_state`, троттлинг `timeupdate` + `pagehide`) и обработкой `NotAllowedError` через кнопку «Продолжить с MM:SS». Обеспечить взаимную паузу между `AudioDock` и `TTSNarrator` (`js/tts-narrator.js`).

#### 8. `js/cloud-sync.js` (Modify)
* **Type / Scope**: Клиент Supabase Realtime.
* **Proposed Changes**: При `HTTP 400` на `sync_user_achievement_progress` логировать ошибку один раз без спама в консоль и переключаться на локальное хранение прогресса в `localStorage`.

#### 9. `js/app.js` и `js/lesson-cinema.js` (Modify)
* **Type / Scope**: Контроллеры главной страницы и единого режима проектора.
* **Proposed Changes**: В `js/app.js` удалить мобильный редирект, реализовать входной экран (свечение свечи, каскадная колода героев), 4 зала, `?hero=<id>` deep-link и ленивую загрузку Яндекс Карт (`IntersectionObserver` + статический список/SVG-фолбэк), сохранив методы `renderCardsGrid()`, `renderMemorialPlaques()`, `initInteractiveMap()`, `openModal()` для `js/admin.js`. Назначить `js/lesson-cinema.js` единым владельцем `?mode=projector` и клавиши `F` на всех страницах (выставление `document.documentElement.dataset.mode = "projector"` + оверлей `LessonCinema` на `index.html`).

#### 10. `js/memory-book.js`, `js/reader.js` и `reader.html` (Modify)
* **Type / Scope**: Единый архив и модуль чтения.
* **Proposed Changes**: Перевести `js/memory-book.js` на `window.GRAND_MEMORY_BOOK_ARCHIVE` (удалить дубль `MEMORY_BOOK_ARCHIVE`, нормализовать `awards`). В `reader.html` и `js/reader.js` удалить «Telegram-хронику», реакции, спойлеры, старую `.reader-header` и `clamp(..., 760px)`; реализовать одноколоночный поток на экранах `< 1200 px` (и в режиме «Статья») и CSS-разворот (`column-count: 2` на `>= 1200 px`) с привязкой к `AudioDock` и `TTSNarrator`.

#### 11. `index.html` и `mobile.html` (Modify)
* **Type / Scope**: Главная точка входа.
* **Proposed Changes**: Перестроить `index.html` (входной экран + 4 зала + скелет `<header id="siteHeader">` и `<footer id="siteFooter">`), удалить дубли «Минуты молчания» и «Героя дня», пустой `img[src=""]` и иконку `$`. В `mobile.html` оставить только редирект `window.location.replace('index.html' + window.location.search + window.location.hash)`.

#### 12. `memory-book.html`, `quiz.html`, `certificate.html`, `verify.html`, `desk-qr.html`, `guestbook.html`, `methodology.html`, `404.html` и их JS (`quiz.js`, `guestbook.js`, `desk-qr.js`, `methodology.js`, `certificate-verifier.js`) (Modify)
* **Type / Scope**: Вторичные модули.
* **Proposed Changes**: Подключить новые CSS-слои, `js/navigation.js`, `js/audio-dock.js`, скелеты `<header id="siteHeader">` / `<footer id="siteFooter">` и `data-section` по таблице из §2.
  * `memory-book.html`: перенести постер в боковую колонку выше `900 px`, убрать `(Markdown)`, исправить ссылку `srmk.stavedu.ru`.
  * `quiz.html` / `quiz.js`: тёмный фон, сетка `2×2`, динамический счётчик из `AchievementsEngine.BADGES.length`, экран разбора ошибок.
  * `certificate.html` / `verify.html` / `certificate-verifier.js`: убрать инлайн-`<style>` в `certificates.css`, масштабируемый предпросмотр А4, понятный офлайн-статус при отсутствии сети.
  * `desk-qr.html` / `desk-qr.js`: генерация QR-ссылок вида `index.html?hero=<id>`.
  * `guestbook.html` / `guestbook.js`: фильтрация записей по герою и дате, явный статус лампады (зажжена/доступна).
  * `methodology.html` / `methodology.js`: автосохранение черновика плана урока в `localStorage` и кнопка «Подготовить к уроку офлайн» для прогрева кэша через `sw.js`.
  * `404.html`: единая оболочка `js/navigation.js` и кнопка возврата на `index.html`.

#### 13. `manifest.json`, `sw.js` и `README_NAVIGATION.md` (Modify)
* **Type / Scope**: PWA, кэширование и документация.
* **Proposed Changes**: В `manifest.json` обновить `start_url` на `./index.html` и актуализировать `shortcuts`. В `sw.js` поднять `CACHE_NAME` (`srmk-museum-v3.0`), удалить старые CSS из `PRECACHE_ASSETS`, предкэшировать app-shell (HTML/CSS/JS, включая `js/tts-narrator.js` и `js/audio-dock.js`) + миниатюры `<= 40 КБ`; вынести полные `.webp` в `srmk-portraits-v3` и 21 MP3 в `srmk-audio-v3` с синтетическим обработчиком `Range` (`206 Partial Content`) и FIFO/LRU-лимитом в 25 записей (~50 МБ). Обновить `README_NAVIGATION.md` под `js/navigation.js`.

### Verification Plan

* **Размер ассетов и локальный сервер (`server.js`):** проверить скриптом/командой размер `assets/images/heroes/thumbs/*.webp` (`<= 40 КБ`) и `assets/images/heroes/*.webp` (`<= 250 КБ`); запустить `node server.js` (`http://localhost:3000`) и убедиться в отсутствии `404`, JS-ошибок и `HTTP 400` (после ручного выполнения `supabase_migration.sql` в Supabase SQL Editor).
* **Визуальная и адаптивная матрица (DevTools / Lighthouse):** проверить все 12 секций на `1440×900`, `1280×800`, `856×900` и `390×844` — `LCP <= 2.5 s`, `CLS <= 0.05`, `INP <= 200 ms`, контраст WCAG AA (`>= 4.5:1`), отсутствие горизонтального скролла и обрезки шапки/таб-бара.
* **Сквозные сценарии (CUJ 1–5):**
  * CUJ 1: `AudioDock` сохраняет позицию при переходе между страницами и показывает кнопку «Продолжить с MM:SS» при `NotAllowedError`.
  * CUJ 2: `index.html?hero=<id>` и `mobile.html?hero=<id>#bio` открывают досье нужного героя с сохранением query и hash.
  * CUJ 3: `reader.html` отображает текст без обрезки в одноколоночном потоке и CSS-развороте, синхронизирован с `AudioDock` и `TTSNarrator`.
  * CUJ 4: `quiz.html` показывает `27` наград, передаёт победителя в `certificate.html`, `verify.html` проверяет хэш онлайн и показывает офлайн-уведомление без сети.
  * CUJ 5: `?mode=projector` и клавиша `F` скрывают `[data-gamification]`; `Ctrl+Shift+A` в `js/admin.js` корректно редактирует и сохраняет досье.
* **Офлайн и PWA (DevTools → Application / Network → Offline):** после нажатия «Подготовить к уроку офлайн» в `methodology.html` переключить сеть в Offline и проверить открытие страниц, портретов и перемотку MP3 (`206 Partial Content`).

--------------------------------------------------------------------------------

*Drafted with EGM*