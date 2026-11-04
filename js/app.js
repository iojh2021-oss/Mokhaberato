/* app.js — glue between the 3D city, the unit panel, the tracers, the report and the radio lab. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const byId = {}; window.UNITS.forEach((u) => { byId[u.id] = u; });
  const pick = (o) => I18N.iso(I18N.pick(o));
  let current = null, tracing = false, traceKind = 'net', traceIdx = -1, layerId = null;

  const names = (id) => I18N.iso(I18N.pick(byId[id].name).replace(/\s*\(.*\)\s*$/, ''));
  const traceData = () => (traceKind === 'power' ? window.TRACE_POWER : window.TRACE);

  function buildChips() {
    const nav = $('chips'); nav.textContent = '';
    window.UNITS.forEach((u) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.unit = u.id;
      if (u.layer === 'power') b.classList.add('pw');
      b.textContent = names(u.id); b.addEventListener('click', () => openUnit(u.id));
      b.setAttribute('aria-pressed', u.id === current); nav.appendChild(b);
    });
  }

  function updateInset() {
    if (!current) { window.City.setInset(0, 0); return; }
    if (window.innerWidth < 700) window.City.setInset(0, 0.26);
    else window.City.setInset(I18N.lang === 'fa' ? 0.17 : -0.17, 0);
  }

  // ---- calculator ----
  function renderCalc(u) {
    const wrap = $('pCalcWrap'), box = $('pCalc'); box.textContent = '';
    if (!u.calc) { wrap.hidden = true; return; }
    wrap.hidden = false;
    const title = document.createElement('p'); title.className = 'calc-title'; title.textContent = pick(u.calc.title); box.appendChild(title);
    const vals = {}, outs = [];
    function recompute() { outs.forEach((o) => { o.el.textContent = o.def.fn(vals); }); }
    u.calc.inputs.forEach((inp) => {
      vals[inp.id] = inp.val;
      const row = document.createElement('label'); row.className = 'crow';
      const name = document.createElement('span'); name.textContent = pick(inp.label);
      const val = document.createElement('output'); val.textContent = inp.val + ' ' + inp.unit;
      const r = document.createElement('input'); r.type = 'range'; r.min = inp.min; r.max = inp.max; r.step = inp.step; r.value = inp.val;
      r.addEventListener('input', () => { vals[inp.id] = parseFloat(r.value); val.textContent = r.value + ' ' + inp.unit; recompute(); });
      row.append(name, val, r); box.appendChild(row);
    });
    const res = document.createElement('div'); res.className = 'cres';
    u.calc.outs.forEach((o) => {
      const cell = document.createElement('div'); const l = document.createElement('span'); l.textContent = pick(o.label);
      const v = document.createElement('strong'); cell.append(l, v); res.appendChild(cell); outs.push({ def: o, el: v });
    });
    box.appendChild(res);
    if (u.calc.note) { const n = document.createElement('p'); n.className = 'fine'; n.textContent = pick(u.calc.note); box.appendChild(n); }
    recompute();
  }

  function renderPanel() {
    if (!current) return;
    const u = byId[current];
    $('pCat').textContent = pick(u.cat); $('pName').textContent = pick(u.name); $('pDesc').textContent = pick(u.desc);
    $('pAnimCap').textContent = pick(u.anim);
    const dl = $('pSpecs'); dl.textContent = '';
    u.specs.forEach((s) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = pick(s.k); dd.textContent = pick(s.v); dl.append(dt, dd); });
    const ul = $('pModels'); ul.textContent = '';
    u.models.forEach((m) => { const li = document.createElement('li'); li.textContent = pick(m); ul.appendChild(li); });
    const fl = $('pFacts'); fl.textContent = ''; const facts = u.facts || [];
    $('pFactsWrap').hidden = !facts.length;
    facts.forEach((f) => { const li = document.createElement('li'); li.textContent = pick(f.text) + '  [' + f.src.join(', ') + ']'; fl.appendChild(li); });
    renderCalc(u);
    $('btnOpenRadio').hidden = !u.preset;
    $('panel').scrollTop = 0;
  }

  function openUnit(id, fromTrace) {
    if (!id) { closePanel(); return; }
    if (tracing && !fromTrace) stopTrace();
    current = id; $('panel').hidden = false; renderPanel(); updateInset();
    window.City.select(id, !fromTrace);
    window.UnitAnim.start($('pCanvas'), id);
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.unit === id));
    const act = document.querySelector('.chip[aria-pressed="true"]'); if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function closePanel() {
    current = null; $('panel').hidden = true; window.UnitAnim.stop(); window.City.select(null); updateInset();
    document.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
  }

  // ---- tracers ----
  function stopTrace() { tracing = false; traceIdx = -1; window.City.stopTrace(); $('traceBar').hidden = true; setTraceBtn(); }
  function setTraceBtn() {
    $('btnTrace').textContent = I18N.t(tracing && traceKind === 'net' ? 'traceStop' : 'trace'); $('btnTrace').setAttribute('aria-pressed', tracing && traceKind === 'net');
    $('btnTracePower').textContent = I18N.t(tracing && traceKind === 'power' ? 'traceStop' : 'tracePower'); $('btnTracePower').setAttribute('aria-pressed', tracing && traceKind === 'power');
  }
  function renderTrace() {
    if (traceIdx < 0) return;
    const s = traceData()[traceIdx];
    $('traceStep').textContent = (traceIdx + 1) + ' / ' + traceData().length; $('traceUnit').textContent = names(s.unit); $('traceText').textContent = pick(s.text);
  }
  function toggleTrace(kind) {
    if (tracing) { const same = traceKind === kind; stopTrace(); if (same) return; }
    traceKind = kind; tracing = true; setTraceBtn(); clearLayer(); window.City.trace(kind);
  }

  // ---- layer highlight ----
  function showLayer(id) {
    const l = window.REPORT.layers.find((x) => x.id === id); if (!l) return;
    layerId = id; window.City.highlight(l.units); $('layerName').textContent = I18N.t('layerShown') + ': ' + I18N.iso(I18N.pick(l.name)); $('layerBar').hidden = false;
  }
  function clearLayer() { layerId = null; window.City.highlight([]); $('layerBar').hidden = true; }

  // ---- report modal ----
  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function renderReport() {
    const R = window.REPORT, root = $('report'); root.textContent = '';
    const shell = el('div', 'report-shell'); shell.setAttribute('role', 'dialog'); shell.setAttribute('aria-modal', 'true'); shell.setAttribute('aria-labelledby', 'repTitle');
    const head = el('header', 'report-head'); const h = el('h2', null, pick(R.title)); h.id = 'repTitle';
    const close = el('button', 'report-close', I18N.t('close')); close.type = 'button'; close.addEventListener('click', closeReport); head.append(h, close);
    const body = el('div', 'report-body'); body.appendChild(el('p', 'lead', pick(R.intro)));

    body.appendChild(el('h3', null, I18N.t('layersT')));
    R.layers.forEach((l) => {
      const card = el('div', 'rlayer'); card.append(el('strong', null, pick(l.name)), el('p', null, pick(l.text)));
      const row = el('div', 'rrow'); l.units.forEach((u) => row.appendChild(el('span', 'tag', names(u))));
      const go = el('button', null, I18N.t('showInCity')); go.type = 'button'; go.addEventListener('click', () => { closeReport(); if (tracing) stopTrace(); showLayer(l.id); });
      card.append(row, go); body.appendChild(card);
    });
    body.appendChild(el('h3', null, I18N.t('factsT')));
    const fu = el('ul', 'facts'); R.facts.forEach((f) => { const li = el('li', null, pick(f.text) + '  [' + f.src.join(', ') + ']'); li.appendChild(el('small', null, ' — ' + pick(f.note))); fu.appendChild(li); }); body.appendChild(fu);
    body.appendChild(el('h3', null, I18N.t('actorsT')));
    const au = el('ul'); R.actors.forEach((a) => { const li = el('li'); li.append(el('strong', null, pick(a.name)), document.createTextNode(': ' + pick(a.text))); au.appendChild(li); }); body.appendChild(au);
    body.appendChild(el('h3', null, I18N.t('kpisT')));
    const ku = el('ul'); R.kpis.forEach((k) => ku.appendChild(el('li', null, pick(k)))); body.appendChild(ku);
    body.appendChild(el('h3', null, I18N.t('sourcesT')));
    const su = el('ol', 'srcs');
    R.sources.forEach((s) => { const li = el('li'); li.value = s.n; const a = el('a', null, pick(s.t)); a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.appendChild(a); su.appendChild(li); });
    body.appendChild(su); body.appendChild(el('p', 'fine', pick(R.limits)));
    shell.append(head, body); root.appendChild(shell);
  }
  let repOpener = null;
  function openReport() { repOpener = document.activeElement; renderReport(); $('report').hidden = false; document.body.classList.add('lab-open'); $('report').querySelector('.report-close').focus(); }
  function closeReport() { $('report').hidden = true; document.body.classList.remove('lab-open'); if (repOpener && repOpener.focus) repOpener.focus(); }

  function relabelAll() {
    buildChips(); window.City.relabel(names); renderPanel(); setTraceBtn(); renderTrace(); updateInset();
    $('btnLang').textContent = I18N.t('lang'); if (window.Lab) window.Lab.relabel();
    if (!$('report').hidden) renderReport();
    if (layerId) showLayer(layerId);
    if (current) window.UnitAnim.start($('pCanvas'), current);
  }

  function start() {
    let saved = null; try { saved = localStorage.getItem('mokhaberat.lang'); } catch (e) { /* ignore */ }
    I18N.set(saved === 'en' || saved === 'fa' ? saved : 'fa');
    if (!window.THREE) { $('loading').textContent = I18N.t('noGL'); $('loading').classList.add('err'); return; }
    try {
      window.City.init({
        canvas: $('stage'), labels: $('labels'), names: names,
        onPick: (id) => openUnit(id),
        onTraceStep: (i, unit, total, kind) => { traceKind = kind; traceIdx = i; $('traceBar').hidden = false; renderTrace(); openUnit(unit, true); },
        onTraceEnd: () => { stopTrace(); }
      });
    } catch (e) { console.error(e); $('loading').textContent = I18N.t('noGL'); $('loading').classList.add('err'); return; }
    buildChips(); setTraceBtn(); $('btnLang').textContent = I18N.t('lang');
    $('loading').hidden = true;

    $('btnLang').addEventListener('click', () => I18N.set(I18N.lang === 'fa' ? 'en' : 'fa'));
    $('btnTrace').addEventListener('click', () => toggleTrace('net'));
    $('btnTracePower').addEventListener('click', () => toggleTrace('power'));
    $('btnReport').addEventListener('click', openReport);
    $('btnRadio').addEventListener('click', () => window.Lab.open());
    $('btnOpenRadio').addEventListener('click', () => { const u = byId[current]; window.Lab.open(u && u.preset); });
    $('pClose').addEventListener('click', () => { if (tracing) stopTrace(); closePanel(); });
    $('traceStop').addEventListener('click', stopTrace);
    $('layerClear').addEventListener('click', clearLayer);
    $('btnHome').addEventListener('click', () => { if (tracing) stopTrace(); clearLayer(); closePanel(); window.City.resetView(); });
    window.addEventListener('langchange', relabelAll);
    window.addEventListener('resize', updateInset);
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (window.Lab && window.Lab.isOpen()) window.Lab.close(); else if (!$('report').hidden) closeReport(); else if (tracing) stopTrace(); else if (layerId) clearLayer(); else if (current) closePanel();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) window.UnitAnim.stop(); else if (current) window.UnitAnim.start($('pCanvas'), current); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
