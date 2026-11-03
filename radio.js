/* radio.js — the “Radio lab”: a bench instrument driven by RadioCore (real link-budget + modulation math).
 * Window.Lab.open(presetId) / close() / relabel(). */
(function () {
  'use strict';
  const R = window.RadioCore, TAU = Math.PI * 2;
  const b = (fa, en) => ({ fa: fa, en: en });
  const tt = (k) => I18N.t(k);

  const PRESETS = {
    fm:   { name: b('رادیو FM', 'FM radio'),           mod: 'FM',    fMHz: 98,    dKm: 60,    ptDbm: 77, gtDbi: 6,  grDbi: -3, extraDb: 55, bMHz: 0.2,  nfDb: 8 },
    am:   { name: b('رادیو AM', 'AM radio'),           mod: 'AM',    fMHz: 0.9,   dKm: 150,   ptDbm: 77, gtDbi: 0,  grDbi: -10, extraDb: 70, bMHz: 0.01, nfDb: 30 },
    g5:   { name: b('دکل 5G', '5G cell'),              mod: 'QAM16', fMHz: 3500,  dKm: 0.8,   ptDbm: 43, gtDbi: 20, grDbi: 0,  extraDb: 15, bMHz: 100,  nfDb: 7 },
    wifi: { name: b('Wi‑Fi خانگی', 'Home Wi‑Fi'),      mod: 'QAM16', fMHz: 2400,  dKm: 0.03,  ptDbm: 20, gtDbi: 3,  grDbi: 0,  extraDb: 20, bMHz: 20,   nfDb: 7 },
    sat:  { name: b('ماهواره‌ی Ku', 'Ku satellite'),   mod: 'QPSK',  fMHz: 12000, dKm: 36000, ptDbm: 50, gtDbi: 30, grDbi: 38, extraDb: 1,  bMHz: 36,   nfDb: 1.2 },
    mw:   { name: b('مایکروویو 15 GHz', '15 GHz microwave'), mod: 'QAM16', fMHz: 15000, dKm: 20, ptDbm: 27, gtDbi: 38, grDbi: 38, extraDb: 6, bMHz: 28, nfDb: 5 }
  };
  const MODS = [['AM', 'AM'], ['FM', 'FM'], ['BPSK', 'BPSK'], ['QPSK', 'QPSK'], ['QAM16', '16‑QAM']];

  const fmtF = (v) => v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 1 : 2) + ' GHz' : v < 1 ? (v * 1000).toFixed(0) + ' kHz' : v.toFixed(v < 10 ? 2 : 1) + ' MHz';
  const fmtD = (v) => v < 1 ? (v * 1000).toFixed(0) + ' m' : v < 100 ? v.toFixed(1) + ' km' : Math.round(v).toLocaleString('en') + ' km';
  const fmtDb = (u) => (v) => v.toFixed(Math.abs(v) < 10 && v % 1 ? 1 : 0) + ' ' + u;
  const KNOBS = [
    { key: 'fMHz',    i18n: 'freq',  min: 0.5,   max: 40000, log: true, fmt: fmtF },
    { key: 'dKm',     i18n: 'dist',  min: 0.01,  max: 40000, log: true, fmt: fmtD },
    { key: 'ptDbm',   i18n: 'ptx',   min: -20,   max: 90, step: 1,   fmt: fmtDb('dBm') },
    { key: 'gtDbi',   i18n: 'gtx',   min: -10,   max: 60, step: 1,   fmt: fmtDb('dBi') },
    { key: 'grDbi',   i18n: 'grx',   min: -10,   max: 60, step: 1,   fmt: fmtDb('dBi') },
    { key: 'extraDb', i18n: 'extra', min: 0,     max: 100, step: 1,  fmt: fmtDb('dB') },
    { key: 'bMHz',    i18n: 'bw',    min: 0.005, max: 500, log: true, fmt: fmtF },
    { key: 'nfDb',    i18n: 'nf',    min: 0,     max: 40, step: 0.5, fmt: fmtDb('dB') }
  ];

  const S = { preset: 'g5', fading: false, text: 'Hello Tehran' };
  Object.assign(S, PRESETS.g5);

  let root, built = false, open = false, raf = 0, last = 0, opener = null;
  const el = {}, cv = {}, knobCtl = {};
  const sim = { lb: null, sym: null, msg: null, nMsgSym: 0, spTx: null, spAvg: null, errs: 0, bits: 0, pts: null, cap: null,
    decoded: '', decAt: 0, snrOut: NaN, berT: NaN, curves: null, sweep: null, dirty: true };

  const clamp = (v, a, c) => Math.max(a, Math.min(c, v));
  const isDigital = () => R.MODS[S.mod].digital;

  // ---------- DOM ----------
  function build() {
    root = document.getElementById('lab');
    root.innerHTML =
      '<div class="lab-shell" role="dialog" aria-modal="true" aria-labelledby="labTitle">' +
      '<header class="lab-head"><div><h2 id="labTitle" data-i18n="labTitle"></h2><p data-i18n="labSub"></p></div>' +
      '<button type="button" class="lab-close" data-i18n="close"></button></header>' +
      '<div class="lab-body">' +
        '<section class="rack" aria-label="controls">' +
          '<div class="grp"><h3 data-i18n="scenarios"></h3><div class="seg" id="segPre"></div></div>' +
          '<div class="grp"><h3 data-i18n="modulation"></h3><div class="seg" id="segMod"></div></div>' +
          '<div class="grp"><h3 data-i18n="channel"></h3><div class="seg" id="segCh"></div></div>' +
          '<div class="knobs" id="knobs"></div>' +
          '<div class="grp" id="msgGrp"><h3 data-i18n="message"></h3><input id="msgIn" type="text" maxlength="24" dir="auto" autocomplete="off" spellcheck="false"></div>' +
        '</section>' +
        '<section class="screens">' +
          '<figure class="screen wide"><figcaption data-i18n="scope"></figcaption><canvas id="cvScope"></canvas></figure>' +
          '<figure class="screen"><figcaption data-i18n="spectrum"></figcaption><canvas id="cvSpec"></canvas></figure>' +
          '<figure class="screen"><figcaption id="capC"></figcaption><canvas id="cvC"></canvas></figure>' +
          '<figure class="screen"><figcaption id="capB"></figcaption><canvas id="cvB"></canvas></figure>' +
        '</section>' +
      '</div>' +
      '<footer class="lab-foot"><div class="cells" id="cells"></div>' +
      '<div class="rxline"><span class="led" id="led"></span><strong id="status"></strong><span class="msgs" id="msgs"></span></div>' +
      '<p class="note" id="note"></p></footer></div>';

    ['cvScope', 'cvSpec', 'cvC', 'cvB'].forEach((id) => { cv[id] = document.getElementById(id); });
    el.cells = document.getElementById('cells'); el.led = document.getElementById('led'); el.status = document.getElementById('status');
    el.msgs = document.getElementById('msgs'); el.note = document.getElementById('note'); el.msgGrp = document.getElementById('msgGrp');
    el.capC = document.getElementById('capC'); el.capB = document.getElementById('capB'); el.msgIn = document.getElementById('msgIn');
    root.querySelector('.lab-close').addEventListener('click', () => Lab.close());
    root.addEventListener('keydown', trapFocus);

    // segmented controls
    const segPre = document.getElementById('segPre');
    Object.keys(PRESETS).forEach((id) => segPre.appendChild(segBtn(id, '', () => applyPreset(id))));
    const segMod = document.getElementById('segMod');
    MODS.forEach((m) => segMod.appendChild(segBtn(m[0], m[1], () => { S.mod = m[0]; S.preset = 'custom'; changed(true); })));
    const segCh = document.getElementById('segCh');
    segCh.appendChild(segBtn('awgn', '', () => { S.fading = false; S.preset = S.preset; changed(true); }));
    segCh.appendChild(segBtn('ray', '', () => { S.fading = true; changed(true); }));

    // knobs
    const knobs = document.getElementById('knobs');
    KNOBS.forEach((k) => { const c = makeKnob(k); knobs.appendChild(c.el); knobCtl[k.key] = c; });

    el.msgIn.value = S.text;
    el.msgIn.addEventListener('input', () => { S.text = el.msgIn.value; changed(false); });

    // readout cells
    [['fspl', 'dB'], ['prx', 'dBm'], ['noise', 'dBm'], ['snr', 'dB'], ['ebn0', 'dB'], ['berT', ''], ['berS', ''], ['snrOut', 'dB']].forEach((c) => {
      const d = document.createElement('div'); d.className = 'cell'; d.id = 'cell-' + c[0];
      d.innerHTML = '<span class="cl" data-i18n="' + c[0] + '"></span><output class="cv"></output><span class="cu">' + c[1] + '</span>';
      el.cells.appendChild(d);
    });
    window.addEventListener('resize', () => { if (open) fitAll(); });
    built = true;
  }
  function segBtn(id, label, fn) {
    const bt = document.createElement('button'); bt.type = 'button'; bt.dataset.id = id; bt.className = 'sb';
    if (label) bt.textContent = label; bt.addEventListener('click', fn); return bt;
  }
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const f = [...root.querySelectorAll('button, input, [tabindex="0"]')].filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  }

  // ---------- knob ----------
  function toNorm(k, v) { return k.log ? Math.log(v / k.min) / Math.log(k.max / k.min) : (v - k.min) / (k.max - k.min); }
  function fromNorm(k, n) {
    n = clamp(n, 0, 1);
    if (k.log) { const v = k.min * Math.pow(k.max / k.min, n); const p = Math.pow(10, Math.floor(Math.log10(v)) - 2); return Math.round(v / p) * p; }
    const v = k.min + n * (k.max - k.min); return Math.round(v / k.step) * k.step;
  }
  function makeKnob(k) {
    const e = document.createElement('div'); e.className = 'knob'; e.tabIndex = 0; e.setAttribute('role', 'slider');
    e.innerHTML = '<div class="dial"><i></i></div><span class="kl"></span><output class="kv"></output>';
    const kl = e.querySelector('.kl'), kv = e.querySelector('.kv'), dial = e.querySelector('.dial');
    function render() {
      const n = toNorm(k, S[k.key]); dial.style.setProperty('--a', (-135 + 270 * clamp(n, 0, 1)).toFixed(1) + 'deg');
      kv.textContent = k.fmt(S[k.key]); kl.textContent = tt(k.i18n);
      e.setAttribute('aria-label', tt(k.i18n)); e.setAttribute('aria-valuemin', 0); e.setAttribute('aria-valuemax', 100);
      e.setAttribute('aria-valuenow', Math.round(clamp(n, 0, 1) * 100)); e.setAttribute('aria-valuetext', k.fmt(S[k.key]));
    }
    function setNorm(n) { S[k.key] = fromNorm(k, n); S.preset = 'custom'; render(); changed(false); }
    let y0 = 0, n0 = 0, drag = false;
    dial.style.touchAction = 'none';
    dial.addEventListener('pointerdown', (ev) => { drag = true; y0 = ev.clientY; n0 = toNorm(k, S[k.key]); dial.setPointerCapture(ev.pointerId); e.focus(); });
    dial.addEventListener('pointermove', (ev) => { if (drag) setNorm(n0 + (y0 - ev.clientY) / 160); });
    dial.addEventListener('pointerup', () => { drag = false; }); dial.addEventListener('pointercancel', () => { drag = false; });
    e.addEventListener('wheel', (ev) => { ev.preventDefault(); setNorm(toNorm(k, S[k.key]) - Math.sign(ev.deltaY) * 0.02); }, { passive: false });
    e.addEventListener('keydown', (ev) => {
      const st = ev.shiftKey ? 0.05 : 0.01; let n = toNorm(k, S[k.key]);
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight') n += st; else if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft') n -= st;
      else if (ev.key === 'Home') n = 0; else if (ev.key === 'End') n = 1; else return;
      ev.preventDefault(); setNorm(n);
    });
    return { el: e, render: render };
  }

  // ---------- state & simulation ----------
  function applyPreset(id) { Object.assign(S, PRESETS[id]); S.preset = id; changed(true); }

  function changed(modelChanged) {
    KNOBS.forEach((k) => knobCtl[k.key].render());
    syncSeg(); sim.dirty = true; prepare(); updateCells();
  }
  function syncSeg() {
    root.querySelectorAll('#segPre .sb').forEach((x) => { x.textContent = I18N.pick(PRESETS[x.dataset.id].name); x.setAttribute('aria-pressed', x.dataset.id === S.preset); });
    root.querySelectorAll('#segMod .sb').forEach((x) => x.setAttribute('aria-pressed', x.dataset.id === S.mod));
    root.querySelectorAll('#segCh .sb').forEach((x) => { x.textContent = tt(x.dataset.id === 'awgn' ? 'awgn' : 'rayleigh'); x.setAttribute('aria-pressed', (x.dataset.id === 'ray') === S.fading); });
    el.msgGrp.hidden = !isDigital();
    el.capC.textContent = isDigital() ? tt('constellation') : tt('audio');
    el.capB.textContent = isDigital() ? tt('berCurve') : tt('snrCurve');
    el.note.textContent = isDigital() ? tt('noteDigital') : tt('noteAnalog');
  }

  function prepare() {
    sim.lb = R.linkBudget(S); sim.errs = 0; sim.bits = 0; sim.spAvg = null; sim.snrOut = NaN; sim.decoded = ''; sim.decAt = 0;
    const snr = clamp(sim.lb.snr, -30, 90);
    if (isDigital()) {
      const bps = R.MODS[S.mod].bps; sim.msg = R.textToBits(S.text, 24);
      sim.nMsgSym = Math.ceil(sim.msg.bits.length / bps);
      const nTot = Math.max(64, sim.nMsgSym), bits = R.buildBits(S.mod, sim.msg.bits, nTot);
      sim.sym = R.mapSymbols(S.mod, bits, nTot); sim.msgBits = bits;
      sim.spTx = R.spectrumDb(R.digitalCapture(sim.sym, 64, 1e9, false).tx);
      const ebn0 = R.dbToLin(snr) / bps; sim.berT = R.berTheory(S.mod, ebn0, S.fading);
      const awgn = [], ray = [];
      for (let x = 0; x <= 50; x++) { const e = R.dbToLin(x * 0.5); awgn.push(R.berAwgn(S.mod, e)); ray.push(R.berRayleigh(S.mod, e)); }
      sim.curves = { awgn: awgn, ray: ray };
    } else {
      sim.berT = NaN;
      sim.spTx = R.spectrumDb(R.analogCapture(S.mod, 90, false, 4096).tx);
      sim.sweep = []; for (let s = -5; s <= 45; s += 5) sim.sweep.push([s, R.analogCapture(S.mod, s, S.fading, 2048).snrOutDb]);
    }
  }

  function stepSim(ms) {
    const snr = clamp(sim.lb.snr, -30, 90), esn0 = R.dbToLin(snr);
    if (isDigital()) {
      const bps = R.MODS[S.mod].bps;
      sim.cap = R.digitalCapture(sim.sym, 64, esn0, S.fading);
      // Monte-Carlo batch with fresh random bits → BER & constellation
      const n = 2000, bits = new Uint8Array(n * bps); for (let i = 0; i < bits.length; i++) bits[i] = Math.random() < 0.5 ? 1 : 0;
      const s = R.mapSymbols(S.mod, bits, n), y = R.simulateSymbols(S.mod, s.I, s.Q, n, esn0, S.fading), out = new Uint8Array(bits.length);
      R.demapSymbols(S.mod, y.yi, y.yq, n, out); sim.errs += R.countErrors(bits, out, bits.length); sim.bits += bits.length;
      if (sim.bits > 2e7) { sim.errs = Math.round(sim.errs / 2); sim.bits = Math.round(sim.bits / 2); }
      sim.pts = y;
      if (ms - sim.decAt > 600) {                                           // decode the user's text through the noisy channel
        const m = R.simulateSymbols(S.mod, sim.sym.I, sim.sym.Q, sim.nMsgSym, esn0, S.fading), ob = new Uint8Array(sim.nMsgSym * bps);
        R.demapSymbols(S.mod, m.yi, m.yq, sim.nMsgSym, ob); sim.decoded = R.bitsToText(ob, sim.msg.nBytes); sim.decAt = ms;
      }
    } else {
      sim.cap = R.analogCapture(S.mod, snr, S.fading, R.NS);
      sim.snrOut = isFinite(sim.snrOut) ? 0.85 * sim.snrOut + 0.15 * sim.cap.snrOutDb : sim.cap.snrOutDb;
    }
    const sp = R.spectrumDb(sim.cap.rx);
    if (!sim.spAvg) sim.spAvg = Float32Array.from(sp); else for (let i = 0; i < sp.length; i++) sim.spAvg[i] = 0.65 * sim.spAvg[i] + 0.35 * sp[i];
  }

  // ---------- readouts ----------
  function fmtBer(v) { return !isFinite(v) ? '–' : v === 0 ? '0' : v < 1e-9 ? '< 1e-9' : v >= 0.1 ? v.toFixed(2) : v.toExponential(1).replace('e-', 'e−'); }
  function updateCells() {
    const lb = sim.lb, dig = isDigital(), bps = dig ? R.MODS[S.mod].bps : 1;
    const set = (id, v, show) => { const c = document.getElementById('cell-' + id); c.hidden = show === false; if (v !== undefined) c.querySelector('.cv').textContent = v; };
    set('fspl', lb.fspl.toFixed(1)); set('prx', lb.prx.toFixed(1)); set('noise', lb.noise.toFixed(1)); set('snr', lb.snr.toFixed(1));
    set('ebn0', (lb.snr - 10 * Math.log10(bps)).toFixed(1), dig); set('berT', fmtBer(sim.berT), dig); set('berS', '', dig); set('snrOut', '', !dig);
    document.getElementById('cell-snr').querySelector('.cl').textContent = dig ? tt('snr') + ' (Es/N0)' : 'CNR';
  }
  function updateLive() {
    const dig = isDigital(), c = document.getElementById.bind(document);
    let state;
    if (dig) {
      const ber = sim.bits ? sim.errs / sim.bits : sim.berT;
      c('cell-berS').querySelector('.cv').textContent = sim.bits ? (sim.errs === 0 ? '< ' + fmtBer(1 / sim.bits) : fmtBer(ber)) : '–';
      c('cell-berS').title = sim.bits ? sim.bits.toLocaleString('en') + ' ' + tt('bits') : '';
      state = ber < 1e-3 ? 2 : ber < 3e-2 ? 1 : 0;
      el.msgs.textContent = tt('sent') + ': “' + sim.msg.text + '”   ·   ' + tt('decoded') + ': “' + sim.decoded + '”';
    } else {
      c('cell-snrOut').querySelector('.cv').textContent = isFinite(sim.snrOut) ? sim.snrOut.toFixed(1) : '–';
      state = sim.snrOut > 20 ? 2 : sim.snrOut > 10 ? 1 : 0; el.msgs.textContent = '';
    }
    el.led.dataset.s = state; el.status.textContent = tt(['statusBad', 'statusMarg', 'statusGood'][state]);
  }

  // ---------- drawing ----------
  const P = { bg: '#0A1424', grid: '#1B2C46', txt: '#8FA4C4', tx: '#F2B84B', rx: '#5FD3C9', dem: '#FF8A5C', dim: '#5B7096' };
  const sizes = {};
  function fit(id) {
    const c = cv[id], dpr = Math.min(window.devicePixelRatio || 1, 2), w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return null;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); sizes[id] = [w, h]; return g;
  }
  function fitAll() { Object.keys(cv).forEach(fit); }
  function frame(g, w, h) {
    g.fillStyle = P.bg; g.fillRect(0, 0, w, h); g.strokeStyle = P.grid; g.lineWidth = 1; g.beginPath();
    for (let i = 1; i < 8; i++) { const x = Math.round(w * i / 8) + 0.5; g.moveTo(x, 0); g.lineTo(x, h); }
    for (let i = 1; i < 6; i++) { const y = Math.round(h * i / 6) + 0.5; g.moveTo(0, y); g.lineTo(w, y); }
    g.stroke();
  }
  function lbl(g, s, x, y, col, align) {
    g.fillStyle = col || P.txt; g.font = '600 11px Vazirmatn, system-ui, sans-serif'; g.textAlign = align || 'left'; g.textBaseline = 'middle';
    const r = I18N.cv(s); g.direction = r.dir; g.fillText(r.s, x, y);
  }
  function trace(g, arr, i0, i1, x0, w, yc, amp, col, lw) {
    g.strokeStyle = col; g.lineWidth = lw || 1.4; g.beginPath();
    for (let i = i0; i < i1; i++) { const x = x0 + (i - i0) / (i1 - i0 - 1) * w, y = yc - clamp(arr[i], -amp * 1.6, amp * 1.6) / amp * (sizes._lane * 0.42); i === i0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
  }

  function drawScope() {
    const g = fit('cvScope'); if (!g || !sim.cap) return; const [w, h] = sizes.cvScope; frame(g, w, h);
    const lane = h / 3, N = 512, x0 = 52, ww = w - 60; sizes._lane = lane; const cap = sim.cap, dig = isDigital(), i0 = dig ? 0 : 80, i1 = i0 + N;
    const rms = Math.sqrt(cap.rx.slice(i0, i1).reduce((a, v) => a + v * v, 0) / N);
    const ampRx = Math.max(dig ? 1.6 : 1.9, rms * 2.4), ampTx = dig ? 1.4 : 1.9, ampD = 1.5;
    lbl(g, tt('tx'), 6, lane * 0.5, P.tx); lbl(g, tt('rx'), 6, lane * 1.5, P.rx); lbl(g, tt('dem'), 6, lane * 2.5, P.dem);
    trace(g, cap.tx, i0, i1, x0, ww, lane * 0.5, ampTx, P.tx, 1.3);
    trace(g, cap.rx, i0, i1, x0, ww, lane * 1.5, ampRx, P.rx, 1);
    if (dig) {
      g.strokeStyle = P.dim; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(x0, lane * 2.5); g.lineTo(x0 + ww, lane * 2.5); g.stroke(); g.setLineDash([]);
      trace(g, cap.demI, i0, i1, x0, ww, lane * 2.5, ampD, P.dem, 1.6);
      for (let k = 0; k < N / cap.L; k++) {                                   // symbol decision instants
        const i = k * cap.L + cap.L / 2, x = x0 + i / (N - 1) * ww, y = lane * 2.5 - clamp(cap.demI[i], -2.4, 2.4) / ampD * lane * 0.42;
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 3, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(143,164,196,.25)'; g.beginPath(); g.moveTo(x, lane * 2); g.lineTo(x, h); g.stroke();
      }
    } else {
      trace(g, cap.x, i0, i1, x0, ww, lane * 2.5, ampD, P.dim, 1.2);
      trace(g, cap.est, i0, i1, x0, ww, lane * 2.5, ampD, P.dem, 1.6);
    }
  }

  function drawSpectrum() {
    const g = fit('cvSpec'); if (!g || !sim.spAvg) return; const [w, h] = sizes.cvSpec; frame(g, w, h);
    const lo = 0, hi = 512, tx = sim.spTx; let top = -1e9; for (let i = lo; i < hi; i++) top = Math.max(top, tx[i]);
    const range = 85, y = (db) => clamp((top + 6 - db) / range, 0, 1) * (h - 22) + 2, xs = (i) => (i - lo) / (hi - lo) * w;
    function curve(arr, col, fill) {
      g.beginPath(); g.moveTo(0, h - 20);
      for (let i = lo; i < hi; i += 2) g.lineTo(xs(i), y(Math.max(arr[i], arr[i + 1])));
      g.lineTo(w, h - 20); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } g.strokeStyle = col; g.lineWidth = 1.2; g.stroke();
    }
    curve(tx, P.tx, 'rgba(242,184,75,0.10)'); curve(sim.spAvg, P.rx, null);
    const bf = isDigital() ? 64 : R.MODS[S.mod].bFactor, half = 4096 / bf / 2;                 // bandwidth markers
    g.strokeStyle = 'rgba(255,138,92,.55)'; g.setLineDash([4, 4]); [256 - half, 256 + half].forEach((b) => { g.beginPath(); g.moveTo(xs(b), 0); g.lineTo(xs(b), h - 20); g.stroke(); }); g.setLineDash([]);
    const fsReal = S.bMHz * bf, off = 0.0625 * fsReal;
    lbl(g, '−' + fmtF(off).replace(/ (.*)/, ' $1'), 4, h - 8); lbl(g, fmtF(S.fMHz), w / 2, h - 8, P.tx, 'center'); lbl(g, '+' + fmtF(off), w - 4, h - 8, P.txt, 'right');
    lbl(g, 'B = ' + fmtF(S.bMHz), w / 2 + 4, 10, P.dem);
  }

  function drawConst() {
    const g = fit('cvC'); if (!g) return; const [w, h] = sizes.cvC; frame(g, w, h);
    if (isDigital()) {
      if (!sim.pts) return;
      const ext = 1.6, s = Math.min(w, h) / (2 * ext) * 0.96, cx = w / 2, cy = h / 2;
      g.strokeStyle = P.dim; g.beginPath(); g.moveTo(0, cy); g.lineTo(w, cy); g.moveTo(cx, 0); g.lineTo(cx, h); g.stroke();
      const pts = sim.pts; g.fillStyle = 'rgba(95,211,201,.55)';
      for (let i = 0; i < 700; i++) { const x = cx + pts.yi[i] * s, y = cy - pts.yq[i] * s; if (x > 0 && x < w && y > 0 && y < h) g.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); }
      const bits = R.MODS[S.mod].bps, nPts = 1 << bits, ref = R.mapSymbols(S.mod, ((n) => { const a = new Uint8Array(n * bits); for (let k = 0; k < n; k++) for (let j = 0; j < bits; j++) a[k * bits + j] = (k >> (bits - 1 - j)) & 1; return a; })(nPts), nPts);
      g.strokeStyle = P.tx; g.lineWidth = 1.4; for (let k = 0; k < nPts; k++) { g.beginPath(); g.arc(cx + ref.I[k] * s, cy - ref.Q[k] * s, 5, 0, TAU); g.stroke(); }
      lbl(g, 'I', w - 12, cy - 8, P.txt, 'right'); lbl(g, 'Q', cx + 6, 10);
    } else if (sim.cap) {
      const cap = sim.cap, N = 700, base = 80, amp = 1.5, yc = h / 2;
      [[cap.x, P.dim, 1.2], [cap.est, P.dem, 1.6]].forEach((a) => {
        g.strokeStyle = a[1]; g.lineWidth = a[2]; g.beginPath();
        for (let i = 0; i < N; i++) { const x = i / (N - 1) * w, y = yc - clamp(a[0][base + i], -2.2, 2.2) / amp * (h * 0.4); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      });
      lbl(g, I18N.lang === 'fa' ? 'اصلی' : 'original', 6, 12, P.dim); lbl(g, I18N.lang === 'fa' ? 'بازیابی‌شده' : 'recovered', 6, 26, P.dem);
    }
  }

  function drawCurve() {
    const g = fit('cvB'); if (!g) return; const [w, h] = sizes.cvB; frame(g, w, h);
    const px = 34, pb = 20, pw = w - px - 8, ph = h - pb - 8;
    if (isDigital() && sim.curves) {
      const bps = R.MODS[S.mod].bps, X = (db) => px + db / 25 * pw, Y = (ber) => 6 + clamp((Math.log10(ber) - -0.3) / (-6.5 - -0.3), 0, 1) * ph;
      for (let e = 1; e <= 6; e++) { const y = Y(Math.pow(10, -e)); g.strokeStyle = P.grid; g.beginPath(); g.moveTo(px, y); g.lineTo(w - 8, y); g.stroke(); lbl(g, '1e−' + e, 2, y, P.dim); }
      for (let d = 0; d <= 25; d += 5) lbl(g, String(d), X(d), h - 8, P.dim, 'center');
      [['awgn', P.rx, []], ['ray', P.tx, [4, 3]]].forEach((c) => {
        g.strokeStyle = c[1]; g.lineWidth = 1.6; g.setLineDash(c[2]); g.beginPath();
        sim.curves[c[0]].forEach((v, i) => { const x = X(i * 0.5), y = Y(Math.max(v, 1e-7)); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.setLineDash([]);
      });
      const eb = clamp(sim.lb.snr - 10 * Math.log10(bps), 0, 25), yT = Y(Math.max(sim.berT, 1e-7));
      g.strokeStyle = 'rgba(255,138,92,.5)'; g.beginPath(); g.moveTo(X(eb), 6); g.lineTo(X(eb), 6 + ph); g.stroke();
      g.fillStyle = P.dem; g.beginPath(); g.arc(X(eb), yT, 5, 0, TAU); g.fill();
      if (sim.bits && sim.errs) { g.strokeStyle = '#fff'; g.lineWidth = 1.6; g.beginPath(); g.arc(X(eb), Y(sim.errs / sim.bits), 5, 0, TAU); g.stroke(); }
      lbl(g, 'Eb/N0 (dB)', w - 8, 14, P.txt, 'right'); lbl(g, 'AWGN', px + 6, 14, P.rx); lbl(g, 'Rayleigh', px + 58, 14, P.tx);
    } else if (sim.sweep) {
      const X = (db) => px + (db + 5) / 50 * pw, Y = (db) => 6 + (1 - (clamp(db, -20, 45) + 20) / 65) * ph;
      for (let d = -20; d <= 40; d += 20) { g.strokeStyle = P.grid; g.beginPath(); g.moveTo(px, Y(d)); g.lineTo(w - 8, Y(d)); g.stroke(); lbl(g, String(d), 2, Y(d), P.dim); }
      for (let d = 0; d <= 40; d += 10) lbl(g, String(d), X(d), h - 8, P.dim, 'center');
      g.strokeStyle = P.dim; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(X(-5), Y(-5)); g.lineTo(X(45), Y(45)); g.stroke(); g.setLineDash([]);
      g.strokeStyle = P.rx; g.lineWidth = 1.8; g.beginPath(); sim.sweep.forEach((p, i) => { const x = X(p[0]), y = Y(p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      if (isFinite(sim.snrOut)) { g.fillStyle = P.dem; g.beginPath(); g.arc(X(clamp(sim.lb.snr, -5, 45)), Y(sim.snrOut), 5, 0, TAU); g.fill(); }
      lbl(g, 'CNR in (dB)', w - 8, 14, P.txt, 'right'); lbl(g, 'SNR out (dB)', px + 6, 12, P.rx);
    }
  }

  function tick(ms) {
    if (!open) return;
    if (ms - last > 90) { last = ms; try { stepSim(ms); drawScope(); drawSpectrum(); drawConst(); drawCurve(); updateLive(); } catch (e) { console.error(e); } }
    raf = requestAnimationFrame(tick);
  }

  // ---------- public ----------
  const Lab = {
    open: function (presetId) {
      if (!built) build();
      opener = document.activeElement; root.hidden = false; open = true; document.body.classList.add('lab-open');
      if (presetId && PRESETS[presetId]) applyPreset(presetId); else changed(true);
      root.querySelectorAll('[data-i18n]').forEach((x) => { x.textContent = tt(x.dataset.i18n); });
      changed(true); fitAll(); root.querySelector('.lab-close').focus();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    },
    close: function () {
      if (!open) return; open = false; root.hidden = true; document.body.classList.remove('lab-open'); cancelAnimationFrame(raf);
      if (opener && opener.focus) opener.focus();
    },
    isOpen: function () { return open; },
    relabel: function () {
      if (!built) return;
      root.querySelectorAll('[data-i18n]').forEach((x) => { x.textContent = tt(x.dataset.i18n); });
      KNOBS.forEach((k) => knobCtl[k.key].render()); syncSeg(); updateCells();
    }
  };
  window.Lab = Lab;
})();
