/* anim.js — small live canvas diagrams that explain how each unit works.
 * UnitAnim.start(canvas, unitId) / UnitAnim.stop(). Labels follow the current UI language. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const C = { bg: '#F3EEE2', grid: '#E3DBC8', ink: '#16223B', ink2: '#5B6A86', teal: '#14909F', orange: '#E8602C', yellow: '#F2B84B',
    blue: '#5A7DB0', navy: '#2F4670', white: '#FBF8F1', steel: '#8E9BAE', green: '#6AA45E', violet: '#7A5CE0' };
  const W = 480, H = 270;
  let raf = 0, cv = null, ctx = null, running = null, t0 = 0;

  const L = (fa, en) => (window.I18N && I18N.lang === 'fa') ? fa : en;
  const lerp = (a, b, u) => a + (b - a) * u;
  const frac = (x) => x - Math.floor(x);

  function bg(c) {
    c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
    c.strokeStyle = C.grid; c.lineWidth = 1; c.beginPath();
    for (let x = 0; x <= W; x += 30) { c.moveTo(x, 0); c.lineTo(x, H); }
    for (let y = 0; y <= H; y += 30) { c.moveTo(0, y); c.lineTo(W, y); }
    c.stroke();
  }
  function text(c, s, x, y, color, size, align, weight) {
    c.fillStyle = color || C.ink; c.font = (weight || 600) + ' ' + (size || 13) + 'px Vazirmatn, system-ui, sans-serif';
    c.textAlign = align || 'center'; c.textBaseline = 'middle';
    const r = window.I18N ? I18N.cv(s) : { s: s, dir: 'ltr' }; c.direction = r.dir; c.fillText(r.s, x, y);
  }
  function line(c, pts, color, w, dash) {
    c.strokeStyle = color; c.lineWidth = w || 2; c.setLineDash(dash || []); c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.setLineDash([]);
  }
  function dot(c, x, y, r, color) { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  function rect(c, x, y, w, h, fill, stroke, r) {
    c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r === undefined ? 4 : r); else c.rect(x, y, w, h);
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.5; c.stroke(); }
  }
  function along(pts, u) {
    let total = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    let d = frac(u) * total;
    for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) return [lerp(pts[i][0], pts[i + 1][0], d / seg[i]), lerp(pts[i][1], pts[i + 1][1], d / seg[i])]; d -= seg[i]; }
    return pts[pts.length - 1];
  }
  function flow(c, pts, t, n, color, r, speed) {
    for (let i = 0; i < n; i++) { const p = along(pts, t * (speed || 0.3) + i / n); dot(c, p[0], p[1], r || 3.5, color); }
  }
  function laptop(c, x, y, s) {
    rect(c, x - 26 * s, y - 36 * s, 52 * s, 34 * s, C.navy, null, 3); rect(c, x - 22 * s, y - 32 * s, 44 * s, 26 * s, C.blue, null, 2);
    rect(c, x - 34 * s, y - 2 * s, 68 * s, 6 * s, C.steel, null, 3);
  }
  function house(c, x, y, s, col) {
    rect(c, x - 14 * s, y - 14 * s, 28 * s, 22 * s, col || C.white, C.steel, 2);
    c.fillStyle = C.orange; c.beginPath(); c.moveTo(x - 18 * s, y - 14 * s); c.lineTo(x, y - 28 * s); c.lineTo(x + 18 * s, y - 14 * s); c.closePath(); c.fill();
  }

  const A = {};

  A.user = function (c, t) {
    laptop(c, 70, 150, 1.1); rect(c, 28, 205, 16, 30, C.ink, null, 3); rect(c, 31, 209, 10, 20, C.blue, null, 1);
    rect(c, 210, 100, 56, 36, C.white, C.steel, 4);
    c.fillStyle = Math.sin(t * 8) > 0 ? C.teal : '#9bd1d6'; c.fillRect(218, 112, 8, 8); c.fillStyle = C.green; c.fillRect(232, 112, 8, 8);
    text(c, 'ONT', 238, 128, C.ink2, 11);
    for (let i = 0; i < 3; i++) { const u = frac(t * 0.8 + i / 3); c.strokeStyle = 'rgba(232,96,44,' + (1 - u).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(210, 118, 14 + u * 70, Math.PI * 0.72, Math.PI * 1.28); c.stroke(); }
    flow(c, [[110, 130], [208, 116]], t, 3, C.orange, 3.5, 0.5);
    line(c, [[266, 118], [470, 118]], C.teal, 5); flow(c, [[266, 118], [470, 118]], t, 4, C.white, 3, 0.5);
    text(c, L('فیبر نوری', 'Optical fiber'), 370, 100, C.teal, 12);
    text(c, 'Wi‑Fi', 150, 108, C.orange, 12);
    text(c, '1490 nm ↓  1310 nm ↑', 370, 142, C.ink2, 11, 'center', 500);
    // phone to tower
    line(c, [[36, 205], [150, 215], [300, 215]], C.orange, 1.5, [5, 5]);
    c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(330, 245); c.lineTo(330, 175); c.stroke();
    for (let i = 0; i < 3; i++) { const u = frac(t * 0.6 + i / 3); c.strokeStyle = 'rgba(20,144,163,' + (1 - u).toFixed(2) + ')'; c.beginPath(); c.arc(330, 178, 8 + u * 36, -Math.PI * 0.9, -Math.PI * 0.1); c.stroke(); }
    text(c, '4G / 5G', 400, 215, C.teal, 12);
  };

  A.cabinet = function (c, t) {
    line(c, [[10, 135], [150, 135]], C.teal, 6); flow(c, [[10, 135], [150, 135]], t, 4, C.white, 3, 0.45);
    rect(c, 150, 105, 70, 60, C.white, C.steel, 6); text(c, L('اسپلیتر', 'Splitter'), 185, 128, C.ink, 12); text(c, '1:8', 185, 148, C.orange, 14, 'center', 800);
    const ys = []; for (let i = 0; i < 8; i++) ys.push(28 + i * 30);
    ys.forEach((y, i) => {
      const pts = [[220, 135], [300, y], [390, y]]; line(c, pts, C.teal, 2);
      const act = Math.floor(frac(t * 0.25) * 8) === i;
      flow(c, pts, t + i * 0.1, 1, act ? C.orange : C.teal, 3, 0.5);
      house(c, 420, y + 6, 0.55, act ? '#FFE3D4' : C.white);
    });
    text(c, L('هر خانه یک بازه‌ی زمانی', 'One time slot per home'), 110, 40, C.orange, 12);
    text(c, L('پایین‌سو', 'down'), 80, 112, C.teal, 11); text(c, '≈ 10 dB', 260, 258, C.ink2, 12);
  };

  A.exchange = function (c, t) {
    for (let i = 0; i < 6; i++) { const y = 30 + i * 36; house(c, 28, y + 8, 0.5); line(c, [[48, y], [150, 135]], i % 2 ? C.teal : C.steel, 1.8); flow(c, [[48, y], [150, 135]], t + i * 0.17, 1, C.orange, 2.8, 0.4); }
    rect(c, 150, 85, 120, 100, C.white, C.steel, 6); text(c, 'OLT', 210, 104, C.ink, 14, 'center', 800);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { rect(c, 162 + k * 17, 118 + r * 14, 12, 8, Math.sin(t * 6 + r * 2 + k * 3) > -0.2 ? C.teal : '#BFD9DC', null, 1); }
    line(c, [[270, 135], [470, 135]], C.teal, 7); flow(c, [[270, 135], [470, 135]], t, 5, C.white, 3, 0.6);
    text(c, '10 / 100 GbE', 380, 114, C.teal, 12);
    rect(c, 150, 210, 50, 36, C.steelD || C.navy, null, 4); text(c, '−48 V', 175, 228, C.white, 12);
    rect(c, 215, 210, 50, 36, C.orange, null, 4); text(c, L('ژنراتور', 'Genset'), 240, 228, C.white, 11);
    line(c, [[200, 228], [215, 228]], C.ink, 2); text(c, L('برق اضطراری', 'Backup power'), 370, 228, C.ink2, 12);
  };

  A.fiber = function (c, t) {
    rect(c, 20, 90, 440, 90, '#DDE6F1', null, 6); rect(c, 20, 122, 440, 26, '#BBD3EC', null, 0);
    text(c, L('غلاف 125 µm', 'Cladding 125 µm'), 90, 104, C.ink2, 11); text(c, L('هسته 9 µm', 'Core 9 µm'), 80, 135, C.navy, 11);
    const pts = []; const x0 = 20, n = 14, dx = 440 / n;
    for (let i = 0; i <= n; i++) pts.push([x0 + i * dx, i % 2 ? 124 : 146]);
    line(c, pts, 'rgba(232,96,44,0.35)', 2);
    const p = along(pts, t * 0.25); dot(c, p[0], p[1], 5, C.orange);
    text(c, L('بازتاب کلی داخلی', 'Total internal reflection'), 240, 160, C.orange, 11);
    const cols = [C.orange, C.teal, C.yellow, C.violet];
    cols.forEach((col, i) => { const y = 30 + i * 14; line(c, [[20, y], [200, y]], col, 3); const x = 20 + frac(t * 0.5 + i * 0.2) * 180; rect(c, x, y - 4, 14, 8, col, null, 2); });
    text(c, 'λ1–λ4  →  MUX', 330, 40, C.ink, 12, 'center', 700);
    rect(c, 215, 14, 8, 62, C.navy, null, 2);
    line(c, [[223, 45], [300, 45]], C.ink2, 2); flow(c, [[223, 45], [300, 45]], t, 3, C.white, 3, 0.5);
    text(c, L('طول‌موج‌های رنگی در یک فیبر', 'Colors share one fiber'), 240, 205, C.ink2, 12);
    rect(c, 345, 222, 90, 28, C.white, C.teal, 6); text(c, 'EDFA 80 km', 390, 237, C.teal, 12);
    text(c, '0.2 dB/km', 120, 237, C.ink2, 12);
  };

  A.datacenter = function (c, t) {
    const spines = [150, 330], leaves = [60, 160, 260, 360, 440].slice(0, 4).map((x) => x + 10);
    spines.forEach((x) => { rect(c, x - 40, 24, 80, 26, C.navy, null, 5); text(c, 'Spine', x, 37, C.white, 11); });
    leaves.forEach((x, i) => {
      rect(c, x - 30, 110, 60, 22, C.blue, null, 5); text(c, 'Leaf', x, 121, C.white, 11);
      spines.forEach((s, j) => { const pts = [[s, 50], [x, 110]]; line(c, pts, '#A9B9D3', 1.5); flow(c, pts, t + i * 0.13 + j * 0.3, 1, C.orange, 3, 0.6); });
      for (let k = 0; k < 4; k++) { const sx = x - 27 + k * 18; rect(c, sx, 190, 14, 40, C.white, C.steel, 2); line(c, [[x, 132], [sx + 7, 190]], '#C7CFDC', 1);
        for (let m = 0; m < 3; m++) rect(c, sx + 3, 196 + m * 10, 8, 4, Math.sin(t * 5 + i * 2 + k * 3 + m * 5) > 0 ? C.teal : '#C8D6D8', null, 1); }
    });
    text(c, L('سرورها در رک', 'Servers in racks'), 240, 250, C.ink2, 12);
  };

  A.ixp = function (c, t) {
    const cx = 200, cy = 135, names = ['AS A', 'AS B', 'AS C', 'AS D', 'AS E'];
    names.forEach((n, i) => {
      const a = i * TAU / 5 - Math.PI / 2, x = cx + Math.cos(a) * 100, y = cy + Math.sin(a) * 95;
      line(c, [[x, y], [cx, cy]], '#B7C4D8', 2); flow(c, [[x, y], [cx, cy]], t + i * 0.2, 1, C.teal, 3.5, 0.5); flow(c, [[cx, cy], [x, y]], t + i * 0.2 + 0.5, 1, C.orange, 3.5, 0.5);
      dot(c, x, y, 20, C.white); c.strokeStyle = C.blue; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 20, 0, TAU); c.stroke(); text(c, n, x, y, C.navy, 11);
    });
    dot(c, cx, cy, 30, C.navy); text(c, 'IXP', cx, cy - 4, C.white, 13, 'center', 800); text(c, 'BGP', cx, cy + 11, C.yellow, 11);
    line(c, [[cx + 30, cy], [440, cy]], C.orange, 5); flow(c, [[cx + 30, cy], [440, cy]], t, 4, C.white, 3, 0.4);
    text(c, L('به خارج', 'To abroad'), 380, cy - 20, C.orange, 12); text(c, L('زمینی · دریایی · ماهواره', 'land · sea · satellite'), 380, cy + 24, C.ink2, 11, 'center', 500);
  };

  A.satellite = function (c, t) {
    c.fillStyle = '#C9D8EA'; c.beginPath(); c.arc(240, 520, 330, Math.PI, TAU); c.fill();
    const sx = 360, sy = 52; rect(c, sx - 14, sy - 10, 28, 20, C.yellow, null, 3); rect(c, sx - 56, sy - 4, 38, 8, C.blue, null, 1); rect(c, sx + 18, sy - 4, 38, 8, C.blue, null, 1);
    text(c, 'GEO  35,786 km', sx, sy - 24, C.ink2, 11);
    const dx = 120, dy = 205; c.fillStyle = C.white; c.strokeStyle = C.steel; c.lineWidth = 2; c.beginPath(); c.ellipse(dx, dy, 26, 12, -0.9, 0, TAU); c.fill(); c.stroke(); line(c, [[dx, dy + 4], [dx + 8, 240]], C.steelD || C.navy, 4);
    line(c, [[dx + 6, dy - 10], [sx - 10, sy + 12]], C.orange, 1.5, [6, 5]); line(c, [[dx + 22, dy - 6], [sx + 10, sy + 14]], C.teal, 1.5, [6, 5]);
    flow(c, [[dx + 6, dy - 10], [sx - 10, sy + 12]], t, 3, C.orange, 3.5, 0.3); flow(c, [[sx + 10, sy + 14], [dx + 22, dy - 6]], t, 3, C.teal, 3.5, 0.3);
    text(c, L('ارسال (14 GHz)', 'Uplink (14 GHz)'), 170, 120, C.orange, 12); text(c, L('دریافت (12 GHz)', 'Downlink (12 GHz)'), 330, 150, C.teal, 12);
    text(c, L('یک پرش ≈ 239 ms', 'One hop ≈ 239 ms'), 330, 232, C.ink, 13, 'center', 700); text(c, L('رفت‌وبرگشت ≈ 480 ms+', 'Round trip ≈ 480 ms+'), 330, 252, C.ink2, 12);
  };

  A.broadcast = function (c, t) {
    const tx = 150, ty = 120;
    for (let i = 0; i < 4; i++) { const u = frac(t * 0.4 + i / 4); c.strokeStyle = 'rgba(232,96,44,' + (0.7 * (1 - u)).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(tx, ty, 14 + u * 150, 0, TAU); c.stroke(); }
    c.fillStyle = C.beige2 || '#C8BA9A'; c.beginPath(); c.moveTo(tx - 6, 220); c.lineTo(tx - 2, ty + 10); c.lineTo(tx + 2, ty + 10); c.lineTo(tx + 6, 220); c.fill();
    rect(c, tx - 12, ty - 4, 24, 14, C.blue, null, 5); line(c, [[tx, ty - 4], [tx, ty - 36]], C.orange, 3);
    [[420, 150], [410, 70], [330, 200]].forEach((p) => { house(c, p[0], p[1], 0.7); line(c, [[p[0], p[1] - 20], [p[0] + 4, p[1] - 32]], C.ink, 1.5); });
    // FM waveform
    const y0 = 240, N = 220; c.strokeStyle = C.teal; c.lineWidth = 2; c.beginPath();
    for (let i = 0; i <= N; i++) { const x = 20 + i * 2, m = Math.sin((i + t * 40) * 0.05), ph = (i * 0.5) + 6 * Math.sin((i + t * 40) * 0.05) * 0.9; const y = y0 + 11 * Math.sin(ph + 0); i ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke(); text(c, L('شکل‌موج FM: فرکانس با صدا تغییر می‌کند', 'FM: frequency follows the sound'), 240, 258, C.ink2, 11, 'center', 500);
    text(c, '87.5–108 MHz', 150, 24, C.ink, 12, 'center', 700);
  };

  A.cell = function (c, t) {
    const cx = 130, cy = 135;
    [0, 1, 2].forEach((i) => { const a0 = -Math.PI / 2 + i * TAU / 3 - Math.PI / 3, a1 = a0 + TAU / 3; c.fillStyle = ['rgba(20,144,163,0.14)', 'rgba(232,96,44,0.12)', 'rgba(122,92,224,0.12)'][i]; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, 120, a0, a1); c.closePath(); c.fill(); c.strokeStyle = 'rgba(22,34,59,0.18)'; c.stroke(); });
    const a = t * 0.5, px = cx + Math.cos(a) * 95, py = cy + Math.sin(a) * 85;
    c.fillStyle = 'rgba(232,96,44,0.35)'; c.beginPath(); c.moveTo(cx, cy); const da = 0.12, ang = Math.atan2(py - cy, px - cx); c.arc(cx, cy, 108, ang - da, ang + da); c.closePath(); c.fill();
    line(c, [[cx, cy], [px, py]], C.orange, 1.5, [4, 4]);
    rect(c, px - 5, py - 9, 10, 18, C.ink, null, 3); rect(c, px - 3, py - 6, 6, 11, C.blue, null, 1);
    dot(c, cx, cy, 9, C.navy); text(c, 'gNB', cx, cy + 22, C.navy, 11);
    text(c, L('سه سکتور 120°', '3 sectors × 120°'), 330, 60, C.ink, 13, 'center', 700);
    text(c, L('باریکه‌ی باریک (beamforming)', 'Narrow beam (beamforming)'), 330, 90, C.orange, 12);
    text(c, 'n78 · 3.3–3.8 GHz', 330, 122, C.teal, 12); text(c, '64T64R Massive MIMO', 330, 146, C.ink2, 12);
    line(c, [[cx + 8, cy + 40], [300, 205], [450, 205]], C.teal, 4); flow(c, [[cx + 8, cy + 40], [300, 205], [450, 205]], t, 4, C.white, 3, 0.4);
    text(c, L('فیبر / مایکروویو به هسته', 'Fiber / microwave to core'), 370, 228, C.ink2, 12);
  };

  A.microwave = function (c, t) {
    const x1 = 70, x2 = 410, ty = 80;
    [x1, x2].forEach((x) => { c.strokeStyle = C.orange; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 12, 230); c.lineTo(x, ty); c.lineTo(x + 12, 230); c.stroke(); for (let k = 0; k < 6; k++) line(c, [[x - 11 + k * 0.4, 230 - k * 25], [x + 11 - k * 0.4, 230 - k * 25 - 12]], C.orange, 1); rect(c, x - 12, ty - 10, 24, 20, C.white, C.steel, 10); });
    c.fillStyle = 'rgba(20,144,163,0.14)'; c.beginPath(); c.ellipse(240, ty, 170, 38, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(20,144,163,0.5)'; c.setLineDash([5, 4]); c.stroke(); c.setLineDash([]);
    line(c, [[x1 + 12, ty], [x2 - 12, ty]], C.orange, 2); flow(c, [[x1 + 12, ty], [x2 - 12, ty]], t, 5, C.orange, 3.5, 0.5); flow(c, [[x2 - 12, ty + 4], [x1 + 12, ty + 4]], t + 0.3, 5, C.teal, 3, 0.5);
    c.fillStyle = '#B9C7A5'; c.beginPath(); c.moveTo(0, 270); c.lineTo(0, 236); c.quadraticCurveTo(240, 150, 480, 236); c.lineTo(480, 270); c.fill();
    text(c, L('دید مستقیم (LOS)', 'Line of sight (LOS)'), 240, 40, C.ink, 13, 'center', 700);
    text(c, L('ناحیه‌ی فرنل اول: 60٪ آزاد', 'First Fresnel zone: keep 60% clear'), 240, 124, C.teal, 12);
    text(c, 'r = 8.66·√(d/f)  m', 240, 190, C.ink, 12, 'center', 700);
    text(c, L('15 GHz، 20 km ≈ 10 m', '15 GHz, 20 km ≈ 10 m'), 240, 210, C.ink2, 11, 'center', 500);
  };

  function loop(ms) {
    if (!running) return;
    const t = (ms - t0) / 1000; bg(ctx); try { A[running](ctx, t); } catch (e) { /* keep animating */ }
    raf = requestAnimationFrame(loop);
  }
  window.UnitAnim = {
    start: function (canvas, id) {
      this.stop(); if (!A[id]) return;
      cv = canvas; const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr; ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      running = id; t0 = performance.now();
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { bg(ctx); A[id](ctx, 1.2); running = null; return; }
      raf = requestAnimationFrame(loop);
    },
    stop: function () { running = null; cancelAnimationFrame(raf); }
  };
})();
