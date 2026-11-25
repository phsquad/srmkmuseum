# Единая навигационная оболочка (`js/navigation.js`)

Навигация, мобильное выдвижное меню, нижний 5-кнопочный PWA таб-бар, подвал (`srmk.stavedu.ru`), переключатели ГОСТ Р 52872-2019 и регистрация Service Worker (`sw.js`) управляются из одного файла [js/navigation.js](js/navigation.js).

На каждой HTML-странице достаточно:
1. Подключить `css/tokens.css`, `css/base.css`, `css/shell.css`, `css/themes.css` и `css/pages/<module>.css`.
2. Указать `<body data-section="<id>">`.
3. Оставить пустые скелеты `<header class="srmk-header" id="siteHeader"></header>` и `<footer class="srmk-footer" id="siteFooter"></footer>`.
4. Подключить `js/audio-dock.js`, `js/lesson-cinema.js` и `js/navigation.js`.
