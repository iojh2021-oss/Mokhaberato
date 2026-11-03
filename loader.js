/* loader.js — loads Three.js without ever leaving the page stuck on "loading".
 * Order: local copy (js/vendor/three.min.js) → jsDelivr → cdnjs → unpkg, each with a timeout.
 * Then city.js and app.js are loaded. If everything fails, a clear message is shown. */
(function () {
  'use strict';
  const SOURCES = [
    'js/vendor/three.min.js',
    'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://unpkg.com/three@0.128.0/build/three.min.js'
  ];
  const box = () => document.getElementById('loading');
  function say(t, err) { const b = box(); if (b) { b.textContent = t; b.classList.toggle('err', !!err); } }
  function load(src, ms) {
    return new Promise(function (res, rej) {
      const s = document.createElement('script'); let done = false;
      const t = setTimeout(function () { if (!done) { done = true; rej(new Error('timeout')); } }, ms);
      s.onload = function () { if (!done) { done = true; clearTimeout(t); res(); } };
      s.onerror = function () { if (!done) { done = true; clearTimeout(t); rej(new Error('error')); } };
      s.src = src; document.head.appendChild(s);
    });
  }
  async function getThree() {
    for (const src of SOURCES) {
      if (window.THREE) return true;
      say(I18N.t('loading') + '  (' + (src.indexOf('http') === 0 ? new URL(src).hostname : 'local') + ')');
      try { await load(src, src.indexOf('http') === 0 ? 7000 : 3000); } catch (e) { /* try next source */ }
    }
    return !!window.THREE;
  }
  getThree().then(function (ok) {
    if (!ok) { say(I18N.t('noGL'), true); return; }
    say(I18N.t('loading'));
    return load('js/city.js', 10000).then(function () { return load('js/app.js', 10000); });
  }).catch(function (e) { console.error(e); say(I18N.t('noGL'), true); });
})();
