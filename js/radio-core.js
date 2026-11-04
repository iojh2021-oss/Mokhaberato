/* radio-core.js — pure signal-processing & link-budget math (no DOM).
 *
 * Model summary
 *  - Link budget:  Pr = Pt + Gt + Gr − FSPL − extra ;  N = −174 dBm/Hz + 10·log10(B) + NF ;  SNR = Pr − N
 *  - FSPL (dB)  =  32.44 + 20·log10(d_km) + 20·log10(f_MHz)
 *  - Digital: symbol rate Rs = B (ideal Nyquist), so Es/N0 = SNR and Eb/N0 = SNR / bits-per-symbol.
 *  - Symbols are Gray-mapped (BPSK, QPSK, 16-QAM), unit average symbol energy, AWGN (+ optional
 *    flat Rayleigh fading with perfect channel knowledge). BER is both computed (theory) and measured (Monte-Carlo).
 *  - Scope/spectrum use a passband waveform at a scaled carrier (1/16 of the sample rate); the frequency
 *    axis in the UI is rescaled to real MHz from the chosen bandwidth.
 */
(function (root) {
  'use strict';
  const TAU = 2 * Math.PI;
  const log10 = (x) => Math.log(x) / Math.LN10;

  // Complementary error function (Numerical Recipes erfcc, |err| < 1.2e-7 relative)
  function erfc(x) {
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 +
      t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 +
      t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }

  const SYM_LEN = 64;      // samples per symbol (digital)
  const CAR_PER = 16;      // samples per carrier cycle
  const NS = 4096;         // samples in one capture
  const MODS = {
    BPSK:  { digital: true,  bps: 1 },
    QPSK:  { digital: true,  bps: 2 },
    QAM16: { digital: true,  bps: 4 },
    AM:    { digital: false, bFactor: 64 },   // simulated RF bandwidth = fs / bFactor
    FM:    { digital: false, bFactor: 25 }
  };
  const FM_DEV = 0.012;    // peak deviation, cycles/sample
  const AM_INDEX = 0.7;

  const dbToLin = (db) => Math.pow(10, db / 10);
  const linToDb = (x) => 10 * log10(x);

  function fspl(dKm, fMHz) { return 32.44 + 20 * log10(dKm) + 20 * log10(fMHz); }
  function noiseDbm(bMHz, nfDb) { return -174 + 10 * log10(bMHz * 1e6) + nfDb; }
  function linkBudget(p) {
    const loss = fspl(p.dKm, p.fMHz);
    const prx = p.ptDbm + p.gtDbi + p.grDbi - loss - p.extraDb;
    const noise = noiseDbm(p.bMHz, p.nfDb);
    return { fspl: loss, prx: prx, noise: noise, snr: prx - noise };
  }

  // ---------- theory ----------
  function berAwgn(mod, ebn0) {
    if (mod === 'BPSK' || mod === 'QPSK') return 0.5 * erfc(Math.sqrt(ebn0));
    if (mod === 'QAM16') return 0.375 * erfc(Math.sqrt(0.4 * ebn0));
    return NaN;
  }
  // flat Rayleigh: average the AWGN BER over an exponential SNR distribution
  function berRayleigh(mod, ebn0Mean) {
    let sum = 0; const dx = 0.02, xmax = 40;
    for (let x = dx / 2; x < xmax; x += dx) sum += berAwgn(mod, ebn0Mean * x) * Math.exp(-x) * dx;
    return sum;
  }
  function berTheory(mod, ebn0, fading) { return fading ? berRayleigh(mod, ebn0) : berAwgn(mod, ebn0); }

  // ---------- randomness ----------
  function gauss() {
    let u = 0; while (u === 0) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * Math.random());
  }
  function prbs(n, seed) {              // x^15 + x^14 + 1
    const out = new Uint8Array(n); let s = (seed || 0x1ACE) & 0x7FFF; if (!s) s = 1;
    for (let i = 0; i < n; i++) { const b = ((s >> 14) ^ (s >> 13)) & 1; s = ((s << 1) | b) & 0x7FFF; out[i] = b; }
    return out;
  }

  // ---------- text <-> bits ----------
  function textToBits(str, maxBytes) {
    const enc = new TextEncoder(); let s = '';
    for (const ch of str) { if (enc.encode(s + ch).length > maxBytes) break; s += ch; }
    const bytes = enc.encode(s), bits = new Uint8Array(bytes.length * 8);
    for (let i = 0; i < bytes.length; i++) for (let j = 0; j < 8; j++) bits[i * 8 + j] = (bytes[i] >> (7 - j)) & 1;
    return { bits: bits, nBytes: bytes.length, text: s };
  }
  function bitsToText(bits, nBytes) {
    const bytes = new Uint8Array(nBytes);
    for (let i = 0; i < nBytes; i++) { let v = 0; for (let j = 0; j < 8; j++) v = (v << 1) | bits[i * 8 + j]; bytes[i] = v; }
    return new TextDecoder('utf-8').decode(bytes);
  }

  // ---------- constellation mapping ----------
  const G2 = [-3, -1, 3, 1];            // Gray: 00→−3, 01→−1, 11→+1, 10→+3  (index = hi*2+lo)
  const S10 = 1 / Math.sqrt(10);
  function buildBits(mod, msgBits, nSym) {
    const bps = MODS[mod].bps, total = nSym * bps, bits = prbs(total, 0x2B5C);
    for (let i = 0; i < Math.min(msgBits.length, total); i++) bits[i] = msgBits[i];
    return bits;
  }
  function mapSymbols(mod, bits, n) {
    const bps = MODS[mod].bps, I = new Float64Array(n), Q = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const b = k * bps;
      if (mod === 'BPSK') { I[k] = 1 - 2 * bits[b]; }
      else if (mod === 'QPSK') { I[k] = (1 - 2 * bits[b]) * Math.SQRT1_2; Q[k] = (1 - 2 * bits[b + 1]) * Math.SQRT1_2; }
      else { I[k] = G2[bits[b] * 2 + bits[b + 1]] * S10; Q[k] = G2[bits[b + 2] * 2 + bits[b + 3]] * S10; }
    }
    return { I: I, Q: Q };
  }
  function axisBits(v) {                 // 16-QAM hard decision on one axis → index into G2
    const u = v * Math.sqrt(10);
    return u < -2 ? 0 : u < 0 ? 1 : u < 2 ? 3 : 2;
  }
  function demapSymbols(mod, yi, yq, n, out) {
    const bps = MODS[mod].bps;
    for (let k = 0; k < n; k++) {
      const b = k * bps;
      if (mod === 'BPSK') out[b] = yi[k] < 0 ? 1 : 0;
      else if (mod === 'QPSK') { out[b] = yi[k] < 0 ? 1 : 0; out[b + 1] = yq[k] < 0 ? 1 : 0; }
      else { const a = axisBits(yi[k]), c = axisBits(yq[k]); out[b] = a >> 1; out[b + 1] = a & 1; out[b + 2] = c >> 1; out[b + 3] = c & 1; }
    }
    return out;
  }

  // Symbol-domain Monte-Carlo channel. Es = 1 ; per-dimension noise variance = 1/(2·Es/N0).
  function simulateSymbols(mod, I, Q, n, esn0, fading) {
    const sig = Math.sqrt(1 / (2 * esn0)), yi = new Float64Array(n), yq = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const ni = gauss() * sig, nq = gauss() * sig;
      if (fading) {
        const hi = gauss() * Math.SQRT1_2, hq = gauss() * Math.SQRT1_2;
        const ri = hi * I[k] - hq * Q[k] + ni, rq = hi * Q[k] + hq * I[k] + nq;
        const m = Math.max(hi * hi + hq * hq, 1e-9);
        yi[k] = (ri * hi + rq * hq) / m; yq[k] = (rq * hi - ri * hq) / m;
      } else { yi[k] = I[k] + ni; yq[k] = Q[k] + nq; }
    }
    return { yi: yi, yq: yq };
  }
  function countErrors(a, b, n) { let e = 0; for (let i = 0; i < n; i++) if (a[i] !== b[i]) e++; return e; }

  // ---------- FFT ----------
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -TAU / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let j = 0; j < h; j++) {
          const a = i + j, b = a + h;
          const vr = re[b] * cr - im[b] * ci, vi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - vr; im[b] = im[a] - vi; re[a] += vr; im[a] += vi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  function spectrumDb(x) {               // Hann window, returns dB for bins 0..n/2
    const n = x.length, re = new Float64Array(n), im = new Float64Array(n);
    for (let i = 0; i < n; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(TAU * i / (n - 1)));
    fft(re, im);
    const out = new Float32Array(n / 2);
    for (let k = 0; k < n / 2; k++) out[k] = 10 * log10((re[k] * re[k] + im[k] * im[k]) / (n * n) + 1e-14);
    return out;
  }

  // ---------- passband captures ----------
  function prefix(arr) { const p = new Float64Array(arr.length + 1); for (let i = 0; i < arr.length; i++) p[i + 1] = p[i] + arr[i]; return p; }
  function movingAvgCentered(arr, M) {   // window [n−M/2, n+M/2), edges use available samples
    const p = prefix(arr), n = arr.length, out = new Float64Array(n), h = M >> 1;
    for (let i = 0; i < n; i++) { const lo = Math.max(0, i - h), hi = Math.min(n, i + h); out[i] = (p[hi] - p[lo]) / M; }
    return out;
  }

  // Digital capture: nSym symbols, rectangular pulses, carrier at 1/16 fs.
  function digitalCapture(sym, nSym, esn0, fading) {
    const L = SYM_LEN, n = nSym * L;
    const tx = new Float32Array(n), rx = new Float32Array(n);
    const sigma = Math.sqrt(L / (4 * esn0));     // in-band SNR = Es/N0 (see header)
    const cx = new Float64Array(n), sx = new Float64Array(n);
    for (let k = 0; k < nSym; k++) {
      let hi = 1, hq = 0;
      if (fading) { hi = gauss() * Math.SQRT1_2; hq = gauss() * Math.SQRT1_2; }
      const I = sym.I[k], Q = sym.Q[k], ri = hi * I - hq * Q, rq = hi * Q + hq * I;
      for (let m = 0; m < L; m++) {
        const i = k * L + m, ph = TAU * i / CAR_PER, c = Math.cos(ph), s = Math.sin(ph);
        tx[i] = I * c - Q * s;
        rx[i] = ri * c - rq * s + sigma * gauss();
        cx[i] = rx[i] * c; sx[i] = -rx[i] * s;
      }
    }
    const demI = movingAvgCentered(cx, L), demQ = movingAvgCentered(sx, L);
    for (let i = 0; i < n; i++) { demI[i] *= 2; demQ[i] *= 2; }
    return { tx: tx, rx: rx, demI: demI, demQ: demQ, L: L };
  }

  const MSG = (n) => 0.6 * Math.sin(TAU * n / 256) + 0.4 * Math.sin(TAU * n / 128 + 0.5);

  function jakes(n, rand) {              // slow Rayleigh amplitude envelope, E[a²]=1
    const a = new Float32Array(n), K = 8, fd = 1 / 1200, ph = [], al = [];
    for (let k = 0; k < K; k++) { ph.push(Math.random() * TAU); al.push(Math.random() * TAU); }
    for (let i = 0; i < n; i++) {
      let I = 0, Qc = 0;
      for (let k = 0; k < K; k++) { const w = TAU * fd * Math.cos(al[k]) * i + ph[k]; I += Math.cos(w); Qc += Math.sin(w); }
      a[i] = Math.sqrt((I * I + Qc * Qc) / K);
    }
    return a;
  }

  // Analog capture (AM or FM) of the 2-tone test message.
  function analogCapture(mod, snrDb, fading, n) {
    n = n || NS;
    const x = new Float32Array(n), tx = new Float32Array(n), rx = new Float32Array(n);
    let phi = 0, pw = 0;
    for (let i = 0; i < n; i++) {
      x[i] = MSG(i);
      if (mod === 'AM') tx[i] = (1 + AM_INDEX * x[i]) * Math.cos(TAU * i / CAR_PER);
      else { phi += TAU * FM_DEV * x[i]; tx[i] = Math.cos(TAU * i / CAR_PER + phi); }
      pw += tx[i] * tx[i];
    }
    pw /= n;
    const snr = dbToLin(snrDb), bf = MODS[mod].bFactor;
    const sigma = Math.sqrt(pw / snr * (bf / 2));  // noise power over fs/2 such that in-band SNR = snr
    const amp = fading ? jakes(n) : null;
    const ci = new Float64Array(n), cq = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      rx[i] = (amp ? amp[i] : 1) * tx[i] + sigma * gauss();
      const ph = TAU * i / CAR_PER;
      ci[i] = 2 * rx[i] * Math.cos(ph); cq[i] = -2 * rx[i] * Math.sin(ph);
    }
    // two cascaded 16-tap averagers: nulls at 2·fc and keeps leakage low enough to differentiate the phase (FM)
    const bi = movingAvgCentered(movingAvgCentered(ci, 16), 16), bq = movingAvgCentered(movingAvgCentered(cq, 16), 16);
    const est = new Float32Array(n);
    if (mod === 'AM') {
      let mean = 0; for (let i = 0; i < n; i++) { est[i] = Math.hypot(bi[i], bq[i]); mean += est[i]; }
      mean /= n; for (let i = 0; i < n; i++) est[i] = (est[i] - mean) / AM_INDEX;
    } else {
      let prev = Math.atan2(bq[0], bi[0]);
      for (let i = 1; i < n; i++) {
        const p = Math.atan2(bq[i], bi[i]); let d = p - prev;
        while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
        est[i] = d / (TAU * FM_DEV); prev = p;
      }
    }
    return { x: x, tx: tx, rx: rx, est: est, snrOutDb: outputSnr(x, est, 80, n - 80), L: 16 };
  }

  // Least-squares gain/offset fit of est ≈ a·x + b; SNR of the fitted signal vs. residual.
  function outputSnr(x, est, lo, hi) {
    let sx = 0, sy = 0, sxx = 0, sxy = 0, m = hi - lo;
    for (let i = lo; i < hi; i++) { sx += x[i]; sy += est[i]; sxx += x[i] * x[i]; sxy += x[i] * est[i]; }
    const a = (m * sxy - sx * sy) / (m * sxx - sx * sx), b = (sy - a * sx) / m;
    let ps = 0, pn = 0;
    for (let i = lo; i < hi; i++) { const f = a * x[i] + b, r = est[i] - f; ps += (f - b) * (f - b); pn += r * r; }
    return 10 * log10(ps / Math.max(pn, 1e-12));
  }

  root.RadioCore = {
    MODS: MODS, SYM_LEN: SYM_LEN, CAR_PER: CAR_PER, NS: NS, FM_DEV: FM_DEV, AM_INDEX: AM_INDEX,
    erfc: erfc, fspl: fspl, noiseDbm: noiseDbm, linkBudget: linkBudget, dbToLin: dbToLin, linToDb: linToDb,
    berAwgn: berAwgn, berRayleigh: berRayleigh, berTheory: berTheory,
    textToBits: textToBits, bitsToText: bitsToText, buildBits: buildBits,
    mapSymbols: mapSymbols, demapSymbols: demapSymbols, simulateSymbols: simulateSymbols, countErrors: countErrors,
    spectrumDb: spectrumDb, digitalCapture: digitalCapture, analogCapture: analogCapture, MSG: MSG, gauss: gauss
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.RadioCore;
})(typeof window !== 'undefined' ? window : globalThis);
