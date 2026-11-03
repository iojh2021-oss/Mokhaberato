/* city.js — the 3D diorama. Plain Three.js r128 (global THREE), no build step.
 * Exposes window.City { init, select, trace, stopTrace, isTracing, refreshLabels }.
 * Coordinates: platform spans x −23…23, z −19…19; north (−z) has the mountain. Y is up. */
(function () {
  'use strict';
  if (!window.THREE) return;            // app.js shows a friendly message when Three.js is missing
  const TAU = Math.PI * 2;
  const T = window.THREE;
  let scene, camera, renderer, canvas, labelsEl, cbs = {};
  const clock = { t: 0 };
  const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speedK = calm ? 0.25 : 1;

  const COL = {
    cream: 0xEDE3CC, beige: 0xD9CDB4, beige2: 0xC8BA9A, glass: 0x5A7DB0, glassD: 0x2F4670, wood: 0xD7995B,
    green: 0x6AA45E, green2: 0x3F7A4A, road: 0xAEB7C6, orange: 0xE8602C, white: 0xF6F3EC, steel: 0x8E9BAE,
    steelD: 0x5A667A, teal: 0x14909F, snow: 0xF2F0FA, rock: 0x5C6AA0, rock2: 0x7C86B5, dark: 0x26324A, yellow: 0xF2B84B
  };
  const matCache = {};
  function M(color, kind) {
    const key = color + (kind || 'l');
    if (!matCache[key]) {
      matCache[key] = kind === 's' ? new T.MeshStandardMaterial({ color: color, flatShading: true, roughness: 0.95, metalness: 0 })
        : kind === 'b' ? new T.MeshBasicMaterial({ color: color })
        : new T.MeshLambertMaterial({ color: color });
    }
    return matCache[key];
  }
  function box(w, h, d, color, x, y, z, parent) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), M(color));
    m.position.set(x || 0, (y || 0) + h / 2, z || 0); if (parent) parent.add(m); return m;
  }
  function cyl(rt, rb, h, color, x, y, z, parent, seg) {
    const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 20), M(color));
    m.position.set(x || 0, (y || 0) + h / 2, z || 0); if (parent) parent.add(m); return m;
  }
  function led(x, y, z, color, parent) {
    const m = new T.Mesh(new T.BoxGeometry(0.16, 0.16, 0.16), new T.MeshBasicMaterial({ color: color }));
    m.position.set(x, y, z); parent.add(m); return m;
  }
  function V(x, y, z) { return new T.Vector3(x, y, z); }
  function rng(seed) { let s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  // ---------- polyline helper ----------
  function Path(points) {
    this.pts = points; this.cum = [0];
    for (let i = 1; i < points.length; i++) this.cum.push(this.cum[i - 1] + points[i].distanceTo(points[i - 1]));
    this.len = this.cum[this.cum.length - 1];
  }
  Path.prototype.at = function (u, out) {
    const d = Math.min(Math.max(u, 0), 1) * this.len;
    let i = 1; while (i < this.cum.length - 1 && this.cum[i] < d) i++;
    const a = this.pts[i - 1], b = this.pts[i], seg = this.cum[i] - this.cum[i - 1] || 1;
    return out.copy(a).lerp(b, (d - this.cum[i - 1]) / seg);
  };
  function arcPoints(a, b, lift, n) {
    const pts = [], mid = a.clone().add(b).multiplyScalar(0.5); mid.y += lift;
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = new T.Vector3();
      p.x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mid.x + t * t * b.x;
      p.y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * mid.y + t * t * b.y;
      p.z = (1 - t) * (1 - t) * a.z + 2 * (1 - t) * t * mid.z + t * t * b.z;
      pts.push(p);
    }
    return pts;
  }

  // ---------- registry ----------
  const units = {};          // id → { group, anchor, ringR, ring, pin }
  const pickRoots = [];
  const flows = [];          // { path, dots[], speed, dir }
  const rings = [];          // expanding wave rings
  const blinkers = [];
  const spinners = [];
  let skySat, selected = null, hovered = null;

  function registerUnit(id, group, anchorY, ringR) {
    group.userData.unit = id; scene.add(group); pickRoots.push(group);
    const ring = new T.Mesh(new T.RingGeometry(ringR, ringR + 0.35, 48), new T.MeshBasicMaterial({ color: COL.orange, transparent: true, opacity: 0.9, side: T.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(group.position.x, 0.09, group.position.z); ring.visible = false; scene.add(ring);
    units[id] = { group: group, anchor: V(group.position.x, anchorY, group.position.z), ringR: ringR, ring: ring, pin: null };
  }

  function addWaveRings(parent, y, color, maxScale, count, period) {
    for (let i = 0; i < count; i++) {
      const m = new T.Mesh(new T.RingGeometry(0.92, 1, 56), new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.6, side: T.DoubleSide, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.y = y; parent.add(m);
      rings.push({ m: m, max: maxScale, period: period, off: i / count });
    }
  }

  function dish(radius, color, parent, pos, dir) {
    const g = new T.Group();
    const bowl = new T.Mesh(new T.SphereGeometry(radius, 24, 8, 0, TAU, 0, 0.8), new T.MeshLambertMaterial({ color: color, side: T.DoubleSide }));
    bowl.scale.y = 0.5; g.add(bowl);
    const stalk = new T.Mesh(new T.CylinderGeometry(radius * 0.04, radius * 0.04, radius * 0.7, 6), M(COL.steelD)); stalk.position.y = radius * 0.3; g.add(stalk);
    const feed = new T.Mesh(new T.BoxGeometry(radius * 0.18, radius * 0.1, radius * 0.18), M(COL.dark)); feed.position.y = radius * 0.62; g.add(feed);
    g.position.copy(pos); g.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize()); parent.add(g); return g;
  }

  // ---------- unit builders ----------
  function buildDatacenter() {
    const g = new T.Group(); g.position.set(-13, 0, -11);
    box(9, 3.4, 5, COL.beige, 0, 0, 0, g);
    box(9.1, 0.9, 5.1, COL.glassD, 0, 1.2, 0, g);
    box(9.4, 0.25, 5.4, COL.steel, 0, 3.4, 0, g);
    for (let i = 0; i < 4; i++) {                                    // rooftop chillers
      const c = cyl(0.8, 0.8, 0.7, COL.steel, -3.2 + i * 2.1, 3.65, 0, g, 18);
      cyl(0.62, 0.62, 0.06, COL.dark, c.position.x, 4.3, 0, g, 18);
      spinners.push(cyl(0.55, 0.55, 0.04, COL.white, c.position.x, 4.37, 0, g, 4));
    }
    for (let i = 0; i < 3; i++) box(1.4, 1.2, 1.1, COL.orange, -3 + i * 3, 0, 3.4, g);   // generators
    box(2, 1.6, 1.4, COL.steelD, 5.8, 0, 0, g);                      // substation
    for (let i = 0; i < 14; i++) blinkers.push({ m: led(-4 + i * 0.6, 1.65, 2.58, COL.teal, g), ph: i * 1.3 });
    return g;
  }
  function buildIxp() {
    const g = new T.Group(); g.position.set(-3, 0, -12);
    box(5, 4.4, 4, COL.glass, 0, 0, 0, g);
    box(5.2, 0.3, 4.2, COL.white, 0, 4.4, 0, g);
    for (let i = 0; i < 4; i++) box(0.5, 4.4, 0.08, COL.glassD, -1.8 + i * 1.2, 0, 2.02, g);
    for (let i = 0; i < 3; i++) cyl(0.35, 0.35, 2.2, COL.steel, -1.4 + i * 1.4, 0, -2.6, g, 14).rotation.z = 0;   // cable risers
    box(4.2, 0.3, 1.2, COL.steelD, 0, 0, -2.6, g);
    dish(0.9, COL.white, g, V(1.4, 4.7, 0), V(0.3, 1, -0.7));
    dish(0.7, COL.white, g, V(-1.4, 4.7, 0.3), V(-0.4, 1, -0.6));
    for (let i = 0; i < 6; i++) blinkers.push({ m: led(-2 + i * 0.8, 3.7, 2.1, COL.yellow, g), ph: i * 0.9 });
    return g;
  }
  function buildSatellite() {
    const g = new T.Group(); g.position.set(-19, 0, -15);
    cyl(0.9, 1.4, 0.6, COL.steelD, 0, 0, 0, g, 12);
    cyl(0.35, 0.5, 2.6, COL.steel, 0, 0.6, 0, g, 10);
    const d = dish(3, COL.white, g, V(0, 3.4, 0), V(0.1, 1, -0.3)); d.userData.main = true;
    box(2.4, 1.6, 2, COL.beige, 3.6, 0, 1.6, g);
    dish(0.9, COL.white, g, V(3.6, 1.9, 1.6), V(0.2, 1, -0.4));
    box(0.9, 0.9, 0.9, COL.orange, -2.8, 0, 2, g);
    return g;
  }
  function buildBroadcast() {
    const g = new T.Group(); g.position.set(5, 0, -14);
    cyl(3.6, 3.9, 0.6, COL.beige2, 0, 0, 0, g, 24);
    cyl(0.55, 1.1, 15, COL.beige, 0, 0.6, 0, g, 20);
    cyl(2.7, 1.1, 2.4, COL.glass, 0, 15.6, 0, g, 24);
    cyl(2.7, 2.7, 0.35, COL.white, 0, 18, 0, g, 24);
    cyl(1.5, 2.7, 1.1, COL.beige, 0, 18.35, 0, g, 24);
    const stripes = [COL.orange, COL.white, COL.orange, COL.white];
    for (let i = 0; i < 4; i++) cyl(0.12 + 0.05 * (3 - i) * 0.4, 0.2 + 0.05 * (3 - i) * 0.4, 2.2, stripes[i], 0, 19.4 + i * 2.2, 0, g, 8);
    blinkers.push({ m: led(0, 28.5, 0, COL.orange, g), ph: 0, solo: true });
    addWaveRings(g, 17, COL.orange, 11, 3, 3.6);
    return g;
  }
  function buildMicrowave() {
    const g = new T.Group(); g.position.set(16, 0, -11);
    const lattice = new T.Mesh(new T.CylinderGeometry(0.35, 1.5, 12, 4, 6, true), new T.MeshBasicMaterial({ color: COL.orange, wireframe: true }));
    lattice.position.y = 6; lattice.rotation.y = Math.PI / 4; g.add(lattice);
    box(2.4, 1.4, 1.8, COL.beige, 2.8, 0, 1.4, g);
    dish(1.1, COL.white, g, V(-0.3, 10.2, 0.9), V(-1, 0.25, 0.9));     // toward exchange (south-west)
    dish(1.1, COL.white, g, V(0.5, 8.4, 1.2), V(0, 0.2, 1));           // toward cell tower (south)
    box(0.6, 0.6, 0.6, COL.white, 0, 12, 0, g);
    return g;
  }
  function buildExchange() {
    const g = new T.Group(); g.position.set(0, 0, 0);
    box(9, 4.6, 6, COL.beige, 0, 0, 0, g);
    box(9.4, 0.4, 6.4, COL.white, 0, 4.6, 0, g);
    for (let i = 0; i < 6; i++) box(0.35, 4.6, 0.35, COL.cream, -3.8 + i * 1.52, 0, 3.15, g);
    box(2.2, 2.4, 0.15, COL.glassD, 0, 0, 3.02, g);
    [-3.4, -2.2, 2.2, 3.4].forEach((wx) => box(0.8, 1.2, 0.1, COL.glass, wx, 2.4, 3.05, g));
    box(2, 1.6, 2, COL.steelD, 6, 0, -1.4, g);                       // battery room
    box(1.6, 1.2, 1.2, COL.orange, 6, 0, 1.6, g);                    // generator
    cyl(0.14, 0.2, 4.6, COL.steel, 0, 5, 0, g, 8);                   // mast
    dish(0.8, COL.white, g, V(0.2, 8.2, 0), V(1, 0.1, -1.1));
    dish(0.6, COL.white, g, V(-0.2, 7, 0), V(0.5, 0.3, -1));
    for (let i = 0; i < 8; i++) blinkers.push({ m: led(-3.6 + i * 1, 4.1, 3.24, COL.teal, g), ph: i * 0.7 });
    return g;
  }
  function buildCell() {
    const g = new T.Group(); g.position.set(15, 0, 0);
    cyl(0.28, 0.45, 10, COL.steel, 0, 0, 0, g, 12);
    for (let i = 0; i < 3; i++) {                                    // 3 sector panels
      const a = i * TAU / 3 + 0.5, px = Math.cos(a) * 0.7, pz = Math.sin(a) * 0.7;
      const p = box(0.9, 2.6, 0.18, COL.white, px, 8, pz, g); p.rotation.y = -a + Math.PI / 2;
      const r = box(0.5, 0.8, 0.3, COL.steelD, px * 1.4, 6.6, pz * 1.4, g); r.rotation.y = -a + Math.PI / 2;
    }
    box(0.5, 0.5, 0.5, COL.orange, 0, 10, 0, g);
    box(2.6, 1.8, 2, COL.beige, 2.8, 0, 1.6, g);
    box(3.6, 0.1, 3.0, COL.steel, 2.8, 0, 1.6, g).position.y = 0.05;
    addWaveRings(g, 8, COL.teal, 7, 3, 3);
    return g;
  }
  function buildFiberNode() {
    const g = new T.Group(); g.position.set(-8, 0, -6);
    cyl(1.9, 1.9, 0.35, COL.steelD, 0, 0, 0, g, 28);
    cyl(1.3, 1.3, 0.1, COL.dark, 0, 0.35, 0, g, 28);
    const torus = new T.Mesh(new T.TorusGeometry(2.4, 0.09, 8, 64), new T.MeshBasicMaterial({ color: COL.teal }));
    torus.rotation.x = Math.PI / 2; torus.position.y = 1.4; g.add(torus);
    const cols = [0xE8602C, 0x14909F, 0xF2B84B, 0x7A5CE0];
    for (let i = 0; i < 4; i++) {
      const s = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), new T.MeshBasicMaterial({ color: cols[i] }));
      s.userData.ph = i / 4; g.add(s); spinners.push({ sphere: s, torus: true, y: 1.4, r: 2.4 });
    }
    box(0.9, 1.2, 0.7, COL.steel, 2.6, 0, 0, g);                    // ODF cabinet
    return g;
  }
  function buildCabinet() {
    const g = new T.Group(); g.position.set(-14, 0, 9);
    box(1.6, 1.9, 1, COL.steel, 0, 0, 0, g);
    box(0.7, 1.6, 0.06, COL.steelD, -0.38, 0.15, 0.53, g); box(0.7, 1.6, 0.06, COL.steelD, 0.38, 0.15, 0.53, g);
    box(1.8, 0.14, 1.2, COL.beige2, 0, 1.9, 0, g);
    const r = rng(11);
    for (let i = 0; i < 6; i++) {                                    // homes served by the splitter
      const a = i * TAU / 6 + 0.4, d = 4.6 + r() * 0.6, x = Math.cos(a) * d, z = Math.sin(a) * d;
      const h = new T.Group(); h.position.set(x, 0, z); h.rotation.y = r() * 3;
      box(2, 1.5, 2, i % 2 ? COL.cream : COL.beige, 0, 0, 0, h);
      const roof = new T.Mesh(new T.ConeGeometry(1.8, 1, 4), M(i % 2 ? COL.wood : COL.orange)); roof.position.y = 2; roof.rotation.y = Math.PI / 4; h.add(roof);
      g.add(h);
    }
    for (let i = 0; i < 4; i++) blinkers.push({ m: led(-0.5 + i * 0.33, 1.7, 0.54, COL.teal, g), ph: i * 1.1 });
    return g;
  }
  function buildUser() {
    const g = new T.Group(); g.position.set(0, 0, 12);
    box(3.6, 2.4, 3.2, COL.cream, 0, 0, -1.4, g);
    const roof = new T.Mesh(new T.ConeGeometry(3.1, 1.6, 4), M(COL.orange)); roof.position.set(0, 3.2, -1.4); roof.rotation.y = Math.PI / 4; g.add(roof);
    box(0.8, 0.8, 0.1, COL.glass, -0.9, 0.9, 0.22, g); box(0.9, 1.5, 0.1, COL.wood, 0.9, 0, 0.22, g);
    box(0.45, 0.35, 0.2, COL.teal, 1.9, 0.9, 0.2, g);                // ONT on the wall
    const plinth = cyl(3, 3.1, 0.3, COL.beige2, 0, 0, 3.4, g, 28);
    const lap = new T.Group(); lap.position.set(-1, 0.3, 3.4); lap.rotation.y = 0.3;
    box(2.2, 0.12, 1.5, COL.steelD, 0, 0, 0, lap);
    const scr = box(2.2, 1.4, 0.1, COL.dark, 0, 0, -0.75, lap); scr.rotation.x = -0.25; scr.position.y = 0.85; scr.position.z = -0.8;
    const glow = box(1.95, 1.15, 0.05, COL.glass, 0, 0, -0.7, lap); glow.rotation.x = -0.25; glow.position.set(0, 0.87, -0.74);
    g.add(lap);
    const ph = box(0.55, 1.0, 0.1, COL.dark, 1.7, 0.3, 3.7, g); ph.rotation.set(-0.5, -0.3, 0);
    const scr2 = box(0.44, 0.84, 0.04, COL.glass, 1.7, 0.4, 3.75, g); scr2.rotation.set(-0.5, -0.3, 0); scr2.position.set(1.7, 0.78, 3.7);
    addWaveRings(g, 1.4, COL.teal, 4, 2, 2.4);
    return g;
  }

  // ---------- environment ----------
  function buildGround() {
    const side = M(COL.wood), top = M(COL.cream);
    const plat = new T.Mesh(new T.BoxGeometry(46, 1.4, 38), [side, side, top, side, side, side]);
    plat.position.y = -0.7; scene.add(plat);
    [-6, 6].forEach((z) => box(46, 0.05, 1.8, COL.road, 0, 0, z, scene));
    [-8, 8].forEach((x) => box(1.8, 0.05, 38, COL.road, x, 0, 0, scene));
    const dash = M(COL.white);
    for (let x = -22; x < 22; x += 2.4) [-6, 6].forEach((z) => { const m = new T.Mesh(new T.BoxGeometry(1, 0.02, 0.08), dash); m.position.set(x, 0.06, z); scene.add(m); });
    for (let z = -18; z < 18; z += 2.4) [-8, 8].forEach((x) => { const m = new T.Mesh(new T.BoxGeometry(0.08, 0.02, 1), dash); m.position.set(x, 0.06, z); scene.add(m); });
  }
  function buildMountains() {
    function peak(x, z, R, H, snowFrac) {
      const g = new T.Group(); g.position.set(x, -0.7, z);
      const body = new T.Mesh(new T.ConeGeometry(R, H, 7, 1), M(COL.rock, 's')); body.position.y = H / 2; body.rotation.y = 0.4; g.add(body);
      if (snowFrac) {
        const h = H * snowFrac, r = R * snowFrac;
        const cap = new T.Mesh(new T.ConeGeometry(r * 1.02, h, 7, 1), M(COL.snow, 's')); cap.position.y = H - h / 2 + 0.02; cap.rotation.y = 0.4; g.add(cap);
      }
      scene.add(g);
    }
    peak(0, -38, 20, 19, 0.36);        // Damavand-like cone
    peak(-24, -32, 11, 9, 0.18);
    peak(25, -32, 13, 10, 0.2);
    peak(-34, -22, 9, 6, 0);
    peak(35, -22, 9, 6.5, 0);
  }
  function buildFillers() {
    const avoid = [[-13, -11, 6.2], [-19, -15, 5.2], [-3, -12, 4.8], [5, -14, 4.4], [16, -11, 4.8], [0, 0, 7.4], [15, 0, 5], [-14, 9, 7.6], [0, 12, 5.6], [-8, -6, 2.6]];
    const r = rng(2024), step = 4.4;
    for (let x = -20.5; x < 22; x += step) for (let z = -16.5; z < 19; z += step) {
      if (Math.abs(x + 8) < 2.3 || Math.abs(x - 8) < 2.3 || Math.abs(z + 6) < 2.3 || Math.abs(z - 6) < 2.3) continue;
      if (avoid.some((a) => Math.hypot(x - a[0], z - a[1]) < a[2])) continue;
      const px = x + (r() - 0.5) * 0.8, pz = z + (r() - 0.5) * 0.8, roll = r();
      if (roll < 0.3) {                                              // small park
        box(3.6, 0.06, 3.6, COL.green, px, 0, pz, scene);
        for (let i = 0; i < 4; i++) {
          const tx = px + (r() - 0.5) * 2.6, tz = pz + (r() - 0.5) * 2.6;
          cyl(0.08, 0.12, 0.6, COL.wood, tx, 0, tz, scene, 5);
          const cone = new T.Mesh(new T.ConeGeometry(0.55, 1.5, 7), M(COL.green2)); cone.position.set(tx, 1.3, tz); scene.add(cone);
        }
      } else {
        const downtown = x < 0 && z > -4 && z < 12;
        const w = 2.2 + r() * 1.4, d = 2.2 + r() * 1.4, h = downtown ? 2.5 + r() * 7 : 1.4 + r() * 3.2;
        const glass = r() < 0.4;
        box(w, h, d, glass ? COL.glass : (r() < 0.5 ? COL.beige : COL.cream), px, 0, pz, scene);
        box(w + 0.1, 0.18, d + 0.1, COL.white, px, h, pz, scene);
      }
    }
  }
  function buildSkySat() {
    const g = new T.Group(); g.position.set(-17, 26, -22);
    box(1.2, 1.2, 1.6, COL.yellow, 0, -0.6, 0, g);
    box(3.2, 0.06, 1.2, COL.glass, -2.4, 0, 0, g); box(3.2, 0.06, 1.2, COL.glass, 2.4, 0, 0, g);
    dish(0.5, COL.white, g, V(0, 0.65, 0.6), V(0.2, 0.5, 1));
    scene.add(g); skySat = g;
  }

  // ---------- links ----------
  const P = {};
  function defineLinks() {
    const y = 0.32;
    P.userCab = [V(0, y, 8.6), V(0, y, 6.7), V(-13.4, y, 6.7), V(-13.4, y, 8.3)];
    P.cabEx = [V(-14.4, y, 8.3), V(-14.4, y, 6), V(0, y, 6), V(0, y, 3.2)];
    P.exDc = [V(0, y, -3.2), V(0, y, -5.3), V(-13, y, -5.3), V(-13, y, -8.7)];
    P.dcIx = [V(-13.8, y, -8.7), V(-13.8, y, -6.2), V(-3, y, -6.2), V(-3, y, -9.8)];
    P.ixSat = [V(-2.2, y, -9.8), V(-2.2, y, -6.9), V(-8.5, y, -6.9), V(-8.5, y, -14), V(-16.2, y, -14)];

    const colors = { fiber: COL.teal };
    const net = new T.Group(); net.userData.unit = 'fiber'; scene.add(net); pickRoots.push(net);
    Object.keys(P).forEach((k) => {
      const pts = P[k];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], len = a.distanceTo(b);
        const s = new T.Mesh(new T.BoxGeometry(len + 0.22, 0.13, 0.3), M(colors.fiber)); s.position.copy(a).add(b).multiplyScalar(0.5);
        s.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); net.add(s);
        const hit = new T.Mesh(new T.BoxGeometry(len + 0.4, 1, 1.4), new T.MeshBasicMaterial({ visible: false })); hit.position.copy(s.position); hit.rotation.copy(s.rotation); net.add(hit);
      }
      addFlow(new Path(pts), COL.teal, 1, 6);
      addFlow(new Path(pts.slice().reverse()), COL.orange, 1, 4.5);
    });
    // wireless backhaul/radio links (dashed arcs + moving pulses)
    wireless(V(15, 10.2, 0), V(0.8, 3.2, 12.2), 4);
    wireless(V(16, 11.6, -11), V(15, 10.4, 0), 3);
    wireless(V(15.8, 11, -11), V(0.5, 9.6, 0), 5);
    wireless(V(-18.2, 3.9, -15.6), V(-17, 25.5, -22), 0);
  }
  function wireless(a, b, lift) {
    const pts = arcPoints(a, b, lift, 28), geo = new T.BufferGeometry().setFromPoints(pts);
    const line = new T.Line(geo, new T.LineDashedMaterial({ color: COL.orange, dashSize: 0.5, gapSize: 0.4 })); line.computeLineDistances(); scene.add(line);
    addFlow(new Path(pts), COL.orange, 1, 7, 0.3);
    addFlow(new Path(pts.slice().reverse()), COL.teal, 1, 7, 0.3);
  }
  function addFlow(path, color, _d, speed, size) {
    const n = Math.max(2, Math.round(path.len / 7)), dots = [];
    for (let i = 0; i < n; i++) {
      const m = new T.Mesh(new T.SphereGeometry(size || 0.26, 8, 6), new T.MeshBasicMaterial({ color: color })); scene.add(m); dots.push(m);
    }
    flows.push({ path: path, dots: dots, speed: speed, off: Math.random() });
  }

  // ---------- camera ----------
  const cam = { theta: 0.72, phi: 1.0, r: 72, target: V(0, 1, 0), gTarget: V(0, 1, 0), gR: 72 };
  function updateCamera(dt) {
    const k = 1 - Math.exp(-dt * 5);
    cam.target.lerp(cam.gTarget, k); cam.r += (cam.gR - cam.r) * k;
    const s = Math.sin(cam.phi);
    camera.position.set(cam.target.x + cam.r * s * Math.sin(cam.theta), cam.target.y + cam.r * Math.cos(cam.phi), cam.target.z + cam.r * s * Math.cos(cam.theta));
    camera.lookAt(cam.target);
  }
  function bindInput() {
    const ptrs = new Map(); let moved = 0, downAt = null, pinch0 = 0, pinchR0 = 0;
    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button });
      moved = 0; downAt = { x: e.clientX, y: e.clientY };
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); pinchR0 = cam.gR; }
    });
    canvas.addEventListener('pointermove', (e) => {
      const p = ptrs.get(e.pointerId);
      if (!p) { hoverPick(e.clientX, e.clientY); return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy);
      if (ptrs.size === 2) {
        p.x = e.clientX; p.y = e.clientY; const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0 > 0) cam.gR = clamp(pinchR0 * pinch0 / d, 14, 140);
        return;
      }
      p.x = e.clientX; p.y = e.clientY;
      if (p.b === 2 || e.shiftKey) pan(dx, dy);
      else { cam.theta -= dx * 0.006; cam.phi = clamp(cam.phi - dy * 0.005, 0.25, 1.45); }
    });
    const up = (e) => {
      const had = ptrs.delete(e.pointerId);
      if (had && ptrs.size === 0 && moved < 6 && downAt) pick(e.clientX, e.clientY, true);
      pinch0 = 0;
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', (e) => { ptrs.delete(e.pointerId); });
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.gR = clamp(cam.gR * Math.exp(e.deltaY * 0.0012), 14, 140); }, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('pointerleave', () => setHover(null));
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pan(dx, dy) {
    const k = cam.r * 0.0016, fx = -Math.sin(cam.theta), fz = -Math.cos(cam.theta), rx = Math.cos(cam.theta), rz = -Math.sin(cam.theta);
    const mx = (-dx * rx + dy * fx) * k, mz = (-dx * rz + dy * fz) * k;
    cam.gTarget.x = clamp(cam.gTarget.x + mx, -26, 26); cam.gTarget.z = clamp(cam.gTarget.z + mz, -22, 22);
    cam.target.copy(cam.gTarget);
  }

  // ---------- picking ----------
  const ray = { rc: null, v: null };
  function pickAt(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ray.v.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.rc.setFromCamera(ray.v, camera);
    const hits = ray.rc.intersectObjects(pickRoots, true);
    for (const h of hits) { let o = h.object; while (o && !o.userData.unit) o = o.parent; if (o) return o.userData.unit; }
    return null;
  }
  function hoverPick(x, y) { setHover(pickAt(x, y)); }
  function pick(x, y) { const id = pickAt(x, y); if (cbs.onPick) cbs.onPick(id); }
  function setHover(id) {
    if (id === hovered) return; hovered = id; canvas.style.cursor = id ? 'pointer' : 'grab';
    Object.keys(units).forEach((k) => { units[k].pin && units[k].pin.classList.toggle('hot', k === id); });
  }

  // ---------- labels ----------
  function buildPins(names) {
    labelsEl.textContent = '';
    Object.keys(units).forEach((id) => {
      const b = document.createElement('button'); b.className = 'pin'; b.type = 'button'; b.dataset.unit = id;
      b.textContent = names(id); b.addEventListener('click', () => cbs.onPick && cbs.onPick(id));
      b.addEventListener('pointerenter', () => setHover(id)); b.addEventListener('pointerleave', () => setHover(null));
      labelsEl.appendChild(b); units[id].pin = b;
    });
    if (selected && units[selected]) units[selected].pin.classList.add('sel');
  }
  function updatePins() {
    const w = canvas.clientWidth, h = canvas.clientHeight, v = new T.Vector3();
    Object.keys(units).forEach((id) => {
      const u = units[id]; if (!u.pin) return;
      v.copy(u.anchor).project(camera);
      const vis = v.z < 1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.15;
      u.pin.style.display = vis ? '' : 'none';
      if (vis) u.pin.style.transform = 'translate(' + ((v.x * 0.5 + 0.5) * w).toFixed(1) + 'px,' + ((-v.y * 0.5 + 0.5) * h).toFixed(1) + 'px) translate(-50%,-100%)';
    });
  }

  // ---------- packet trace ----------
  const tr = { on: false, path: null, steps: [], t: 0, next: 0, mesh: null, glow: null };
  function startTrace() {
    if (tr.on) return;
    const y = 0.32, pts = [], marks = [];
    function leg(list) { list.forEach((p, i) => { if (pts.length && i === 0 && pts[pts.length - 1].distanceTo(p) < 0.01) return; pts.push(p.clone()); }); }
    const bridge = (a) => { pts.push(a); };
    pts.push(V(0.8, 1.2, 12.5));                                        // laptop
    marks.push({ unit: 'user', at: 0 });
    bridge(V(0, y, 8.6)); leg(P.userCab); bridge(V(-13.4, y, 8.6)); marks.push({ unit: 'cabinet', at: pts.length - 1 });
    bridge(V(-14.4, y, 8.6)); leg(P.cabEx); marks.push({ unit: 'exchange', at: pts.length - 1 });
    bridge(V(0, y, -3.2)); bridge(V(0, y, -5.3)); bridge(V(-8, y, -5.3)); marks.push({ unit: 'fiber', at: pts.length - 1 });
    bridge(V(-13, y, -5.3)); bridge(V(-13, y, -8.7)); marks.push({ unit: 'datacenter', at: pts.length - 1 });
    bridge(V(-13.8, y, -8.7)); leg(P.dcIx); marks.push({ unit: 'ixp', at: pts.length - 1 });
    bridge(V(-2.2, y, -9.8)); leg(P.ixSat); marks.push({ unit: 'satellite', at: pts.length - 1 });
    bridge(V(-18.2, 3.9, -15.6)); bridge(skySat.position.clone().add(V(0, 0.4, 0)));
    tr.path = new Path(pts);
    tr.steps = marks.map((m) => ({ unit: m.unit, u: tr.path.cum[m.at] / tr.path.len }));
    if (!tr.mesh) {
      tr.mesh = new T.Mesh(new T.SphereGeometry(0.55, 14, 10), new T.MeshBasicMaterial({ color: 0xffffff }));
      tr.glow = new T.Mesh(new T.SphereGeometry(0.95, 14, 10), new T.MeshBasicMaterial({ color: COL.orange, transparent: true, opacity: 0.45, depthWrite: false }));
      scene.add(tr.mesh); scene.add(tr.glow);
    }
    tr.mesh.visible = tr.glow.visible = true; tr.on = true; tr.t = 0; tr.next = 0; fireStep(0);
  }
  function fireStep(i) { tr.next = i + 1; if (cbs.onTraceStep) cbs.onTraceStep(i, tr.steps[i].unit, tr.steps.length); }
  function stopTrace(silent) {
    if (!tr.on) return; tr.on = false; if (tr.mesh) tr.mesh.visible = tr.glow.visible = false;
    if (!silent && cbs.onTraceEnd) cbs.onTraceEnd();
  }
  function updateTrace(dt) {
    if (!tr.on) return;
    tr.t += dt * (calm ? 3 : 6) / tr.path.len;   // 6 world-units per second
    const p = tr.path.at(Math.min(tr.t, 1), tr.mesh.position); tr.glow.position.copy(p);
    tr.glow.scale.setScalar(1 + 0.15 * Math.sin(clock.t * 8));
    cam.gTarget.set(p.x, 1, p.z);
    if (tr.next < tr.steps.length && tr.t >= tr.steps[tr.next].u) fireStep(tr.next);
    if (tr.t >= 1) stopTrace();
  }

  // ---------- frame loop ----------
  function frame(ms) {
    const dt = Math.min(0.05, (ms - (frame.last || ms)) / 1000); frame.last = ms; clock.t += dt;
    const t = clock.t;
    flows.forEach((f) => {
      f.dots.forEach((m, i) => { f.path.at(((t * f.speed * speedK / f.path.len) + f.off + i / f.dots.length) % 1, m.position); });
    });
    rings.forEach((r) => {
      const u = ((t * speedK / r.period) + r.off) % 1; r.m.scale.setScalar(1 + u * r.max); r.m.material.opacity = 0.65 * (1 - u);
    });
    blinkers.forEach((b) => { b.m.visible = b.solo ? (Math.sin(t * 3) > -0.2) : Math.sin(t * 5 + b.ph * 7) > -0.25; });
    spinners.forEach((s) => {
      if (s.torus) { const a = t * 1.1 * speedK + s.sphere.userData.ph * TAU; s.sphere.position.set(Math.cos(a) * s.r, s.y, Math.sin(a) * s.r); }
      else if (s.rotation) s.rotation.y = t * 4 * speedK;
    });
    if (skySat) skySat.position.y = 26 + Math.sin(t * 0.6) * 0.4;
    Object.keys(units).forEach((id) => {
      const u = units[id], on = id === selected || id === hovered; u.ring.visible = on;
      if (on) { const s = id === selected ? 1 + 0.06 * Math.sin(t * 4) : 1; u.ring.scale.setScalar(s); u.ring.material.opacity = id === selected ? 0.95 : 0.55; }
    });
    updateTrace(dt); updateCamera(dt); updatePins();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (w < 700) cam.gR = Math.max(cam.gR, 120);
  }

  // ---------- public ----------
  const City = {
    init: function (opts) {
      canvas = opts.canvas; labelsEl = opts.labels; cbs = opts;
      renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); renderer.setClearColor(0x000000, 0);
      scene = new T.Scene(); camera = new T.PerspectiveCamera(32, 1, 0.5, 400);
      scene.add(new T.HemisphereLight(0xffffff, 0xb9a98a, 0.85));
      const sun = new T.DirectionalLight(0xfff0d8, 0.85); sun.position.set(-22, 34, 18); scene.add(sun);
      ray.rc = new T.Raycaster(); ray.v = new T.Vector2();
      buildGround(); buildMountains();
      registerUnit('datacenter', buildDatacenter(), 7, 6);
      registerUnit('ixp', buildIxp(), 6.6, 3.8);
      registerUnit('satellite', buildSatellite(), 7, 4.6);
      registerUnit('broadcast', buildBroadcast(), 30.5, 4.4);
      registerUnit('microwave', buildMicrowave(), 13.6, 3.6);
      registerUnit('exchange', buildExchange(), 9.4, 6.3);
      registerUnit('cell', buildCell(), 11.6, 3.8);
      registerUnit('fiber', buildFiberNode(), 3.4, 3.2);
      registerUnit('cabinet', buildCabinet(), 4, 2.4);
      registerUnit('user', buildUser(), 5.2, 4.6);
      buildFillers(); buildSkySat(); defineLinks();
      buildPins(opts.names); bindInput(); resize();
      window.addEventListener('resize', resize);
      canvas.style.cursor = 'grab';
      requestAnimationFrame(frame);
    },
    select: function (id, focus) {
      if (selected && units[selected] && units[selected].pin) units[selected].pin.classList.remove('sel');
      selected = id;
      if (id && units[id]) {
        if (units[id].pin) units[id].pin.classList.add('sel');
        if (focus) { const a = units[id].group.position; cam.gTarget.set(a.x, 2, a.z); cam.gR = Math.min(cam.gR, 38); }
      }
    },
    relabel: function (names) { buildPins(names); },
    trace: startTrace,
    stopTrace: function () { stopTrace(); },
    isTracing: function () { return tr.on; },
    resetView: function () { cam.gTarget.set(0, 1, 0); cam.gR = canvas.clientWidth < 700 ? 120 : 72; }
  };
  window.City = City;
})();
