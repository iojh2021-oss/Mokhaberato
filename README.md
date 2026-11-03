# Mokhaberat · شهر مخابراتی تهران

**FA** — شبیه‌ساز تعاملی سه‌بعدی شبکه‌ی مخابرات: از لپ‌تاپ و گوشی تا کافو، مرکز مخابرات، حلقه‌ی فیبر، دیتاسنتر، IXP و ماهواره، به‌علاوه‌ی یک «آزمایشگاه رادیویی» با ریاضیات واقعی بودجه‌ی لینک. دوزبانه (فارسی/انگلیسی)، بدون build، آماده‌ی GitHub Pages.

**EN** — An interactive 3D telecom-city simulator: laptop and phone → street cabinet → exchange → DWDM ring → data center → IXP → satellite, plus a radio lab with real link-budget math. Bilingual, no build step, ready for GitHub Pages.

## Run / اجرا

Open `index.html` in a browser (internet needed once for Three.js r128 and the Vazirmatn font from CDNs).

Deploy: push these files to the repo root → **Settings → Pages → Deploy from a branch → `main` / `(root)`**.

## What you can do

- **Click any building** (or a chip at the bottom): a panel shows what it does, technical data, example equipment and a live animation of how it works.
- **Trace a packet**: a packet travels laptop → cabinet → exchange → fiber ring → data center → IXP → satellite, with a caption at each hop.
- **Radio lab** (`Radio lab` button, or from the radio-related units):
  - Scenarios: FM, AM, 5G n78, Wi‑Fi, Ku satellite, 15 GHz microwave.
  - Knobs: frequency, distance, Tx power, antenna gains, extra loss, bandwidth, noise figure.
  - Modulations: AM, FM, BPSK, QPSK, 16‑QAM; AWGN or flat Rayleigh fading.
  - Instruments: 3‑trace oscilloscope (TX / RX / demodulated), spectrum, constellation, BER curve (digital) or output‑SNR curve (analog), live BER, and a text message sent through the noisy channel.

## The physics (js/radio-core.js)

| Item | Formula / method |
|---|---|
| Free-space loss | `FSPL = 32.44 + 20·log10(d_km) + 20·log10(f_MHz)` dB |
| Received power | `Pr = Pt + Gt + Gr − FSPL − extra` |
| Noise floor | `N = −174 dBm/Hz + 10·log10(B) + NF` |
| SNR | `Pr − N`; digital symbol rate = bandwidth, so `Es/N0 = SNR`, `Eb/N0 = SNR / bits-per-symbol` |
| BER theory | BPSK/QPSK `½·erfc(√(Eb/N0))`; 16‑QAM (Gray) `⅜·erfc(√(0.4·Eb/N0))`; Rayleigh = numeric average over the exponential SNR distribution |
| BER simulated | Monte‑Carlo of Gray‑mapped symbols through AWGN (± Rayleigh with perfect channel knowledge) |
| AM / FM | passband waveform, I/Q down‑conversion, envelope (AM) or phase‑derivative (FM) demodulation; FM shows its threshold effect |

Limits you should know: no forward error correction, ideal Nyquist signalling, scope/spectrum run at a scaled carrier (the frequency axis is mapped back to real MHz), fading is flat.

## Layout

```
index.html          page shell
css/style.css       city UI + radio-lab instrument styles (RTL/LTR via logical properties)
js/i18n.js          FA/EN strings, bidi helpers
js/units.js         bilingual content of every unit  ← edit/add here
js/city.js          Three.js scene, picking, fiber/wireless links, packet tracer
js/anim.js          per-unit explanatory canvas animations
js/radio-core.js    pure math (no DOM) — also runs in Node
js/radio.js         radio-lab UI (knobs, screens)
js/app.js           wiring
```

Add a unit: entry in `units.js` + builder/`registerUnit` in `city.js` + `A.<id>` in `anim.js`.

## Honesty notes / نکات صریح

- The city is a **teaching model**. Building placement is symbolic, not a map of Tehran's real sites. Specs are standards‑level figures (ITU‑T, 3GPP, IEEE, DVB); equipment lists are **industry examples**, not a claim about what is installed in Tehran.
- Tehran‑specific network data (operators, exchange locations, data‑center sites) has **not** been researched or sourced yet. Add sourced facts to `js/units.js` before presenting them as real.
- Animations are live canvas drawings, not GIF files (lighter, language-aware, and they respect `prefers-reduced-motion`).
