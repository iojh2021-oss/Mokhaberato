/* app.js — glue between the 3D city, the unit panel, the packet tracer and the radio lab. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const byId = {}; window.UNITS.forEach((u) => { byId[u.id] = u; });
  const pick = (o) => I18N.iso(I18N.pick(o));
  let current = null, tracing = false, traceIdx = -1;

  const names = (id) => I18N.iso(I18N.pick(byId[id].name).replace(/\s*\(.*\)\s*$/, ''));

  function buildChips() {
    const nav = $('chips'); nav.textContent = '';
    window.UNITS.forEach((u) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.unit = u.id;
      b.textContent = names(u.id); b.addEventListener('click', () => openUnit(u.id));
      b.setAttribute('aria-pressed', u.id === current); nav.appendChild(b);
    });
  }

  function renderPanel() {
    if (!current) return;
    const u = byId[current], p = $('panel');
    $('pCat').textContent = pick(u.cat); $('pName').textContent = pick(u.name); $('pDesc').textContent = pick(u.desc);
    $('pAnimCap').textContent = pick(u.anim);
    const dl = $('pSpecs'); dl.textContent = '';
    u.specs.forEach((s) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = pick(s.k); dd.textContent = pick(s.v); dl.append(dt, dd); });
    const ul = $('pModels'); ul.textContent = '';
    u.models.forEach((m) => { const li = document.createElement('li'); li.textContent = pick(m); ul.appendChild(li); });
    $('btnOpenRadio').hidden = !u.preset;
    p.scrollTop = 0;
  }

  function openUnit(id, fromTrace) {
    if (!id) { closePanel(); return; }
    if (tracing && !fromTrace) stopTrace();
    current = id; $('panel').hidden = false; renderPanel();
    window.City.select(id, !fromTrace);
    window.UnitAnim.start($('pCanvas'), id);
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.unit === id));
    const act = document.querySelector('.chip[aria-pressed="true"]'); if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function closePanel() {
    current = null; $('panel').hidden = true; window.UnitAnim.stop(); window.City.select(null);
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
  }

  function stopTrace() { tracing = false; traceIdx = -1; window.City.stopTrace(); $('traceBar').hidden = true; setTraceBtn(); }
  function setTraceBtn() { $('btnTrace').textContent = I18N.t(tracing ? 'traceStop' : 'trace'); $('btnTrace').setAttribute('aria-pressed', tracing); }
  function renderTrace() {
    if (traceIdx < 0) return;
    const s = window.TRACE[traceIdx];
    $('traceStep').textContent = (traceIdx + 1) + ' / ' + window.TRACE.length; $('traceUnit').textContent = names(s.unit); $('traceText').textContent = pick(s.text);
  }

  function relabelAll() {
    buildChips(); window.City.relabel(names); renderPanel(); setTraceBtn(); renderTrace();
    $('btnLang').textContent = I18N.t('lang'); if (window.Lab) window.Lab.relabel();
    if (current) window.UnitAnim.start($('pCanvas'), current);
  }

  function start() {
    let saved = null; try { saved = localStorage.getItem('mokhaberat.lang'); } catch (e) { /* ignore */ }
    I18N.set(saved === 'en' || saved === 'fa' ? saved : ((navigator.language || '').toLowerCase().startsWith('fa') ? 'fa' : 'fa'));
    if (!window.THREE) { $('loading').textContent = I18N.t('noGL'); $('loading').classList.add('err'); return; }
    try {
      window.City.init({
        canvas: $('stage'), labels: $('labels'), names: names,
        onPick: (id) => openUnit(id),
        onTraceStep: (i, unit) => { traceIdx = i; $('traceBar').hidden = false; renderTrace(); openUnit(unit, true); },
        onTraceEnd: () => { stopTrace(); }
      });
    } catch (e) { console.error(e); $('loading').textContent = I18N.t('noGL'); $('loading').classList.add('err'); return; }
    buildChips(); setTraceBtn(); $('btnLang').textContent = I18N.t('lang');
    $('loading').hidden = true;

    $('btnLang').addEventListener('click', () => I18N.set(I18N.lang === 'fa' ? 'en' : 'fa'));
    $('btnTrace').addEventListener('click', () => { if (tracing) { stopTrace(); } else { tracing = true; setTraceBtn(); window.City.trace(); } });
    $('btnRadio').addEventListener('click', () => window.Lab.open());
    $('btnOpenRadio').addEventListener('click', () => { const u = byId[current]; window.Lab.open(u && u.preset); });
    $('pClose').addEventListener('click', () => { if (tracing) stopTrace(); closePanel(); });
    $('traceStop').addEventListener('click', stopTrace);
    $('btnHome').addEventListener('click', () => { if (tracing) stopTrace(); closePanel(); window.City.resetView(); });
    window.addEventListener('langchange', relabelAll);
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (window.Lab && window.Lab.isOpen()) window.Lab.close(); else if (tracing) stopTrace(); else if (current) closePanel();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) window.UnitAnim.stop(); else if (current) window.UnitAnim.start($('pCanvas'), current); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
