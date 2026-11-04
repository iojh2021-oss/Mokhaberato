/* i18n.js — FA/EN UI strings. Elements use data-i18n (text) or data-i18n-label (aria-label/title). */
(function () {
  'use strict';
  const S = {
    fa: {
      title: 'شهر مخابراتی تهران',
      subtitle: 'از لپ‌تاپ تا دیتاسنتر؛ شبکه‌ی ارتباطی را روی نقشه ببینید',
      hint: 'بکشید تا بچرخد · اسکرول برای زوم · روی هر ساختمان بزنید',
      trace: 'ردیابی یک بسته',
      tracePower: 'ردیابی برق',
      report: 'گزارش و منابع',
      tehranFacts: 'اعداد عمومی تهران (منبع‌دار)',
      layersT: 'لایه‌های شبکه', actorsT: 'بازیگران و نقش‌ها', kpisT: 'شاخص‌های ارزیابی', factsT: 'اعداد منتشرشده', sourcesT: 'منابع',
      showInCity: 'نمایش در شهر', clearHl: 'پاک‌کردن نمایش', layerShown: 'لایه',
      calc: 'ماشین‌حساب',
      traceStop: 'توقف ردیابی',
      radio: 'آزمایشگاه رادیویی',
      lang: 'English',
      close: 'بستن',
      loading: 'در حال ساخت شهر…',
      noGL: 'کتابخانه‌ی Three.js بارگذاری نشد (یا WebGL پشتیبانی نمی‌شود). راه‌حل: فایل three.min.js (نسخه‌ی r128) را یک بار دانلود کنید و کنار index.html در ریپو آپلود کنید.',
      function: 'کارکرد',
      specs: 'مشخصات فنی',
      models: 'تجهیزات و مدل‌های نمونه',
      modelsNote: 'نمونه‌های رایج در صنعت؛ لزوماً به معنی استقرار در تهران نیست.',
      openRadio: 'باز کردن در آزمایشگاه رادیویی',
      units: 'واحدهای شهر',
      tracing: 'مسیر بسته',
      eduNote: 'مدل آموزشیِ ساده‌شده؛ جای‌گذاری ساختمان‌ها نمادین است.',
      // lab
      labTitle: 'آزمایشگاه رادیویی',
      labSub: 'فرستنده ← کانال ← گیرنده، با ریاضیات واقعی بودجه‌ی لینک',
      scenarios: 'سناریو',
      modulation: 'مدولاسیون',
      channel: 'کانال',
      awgn: 'فقط نویز',
      rayleigh: 'محوشدگی ریلی',
      message: 'پیام',
      freq: 'فرکانس', dist: 'فاصله', ptx: 'توان فرستنده', gtx: 'بهره‌ی آنتن Tx', grx: 'بهره‌ی آنتن Rx',
      extra: 'تلفات اضافی', bw: 'پهنای باند', nf: 'نویز گیرنده',
      fspl: 'تلفات فضای آزاد', prx: 'توان دریافتی', noise: 'کف نویز', snr: 'SNR', ebn0: 'Eb/N0',
      berT: 'BER نظری', berS: 'BER شبیه‌سازی', snrOut: 'SNR خروجی', 
      scope: 'اسیلوسکوپ', spectrum: 'طیف', constellation: 'منظومه‌ی سیگنال', berCurve: 'منحنی BER',
      audio: 'صدا: اصلی و بازیابی‌شده', snrCurve: 'SNR خروجی بر حسب SNR ورودی',
      tx: 'ارسال', rx: 'دریافت', dem: 'خروجی',
      sent: 'ارسال‌شده', decoded: 'دریافت‌شده',
      statusGood: 'ارتباط سالم', statusMarg: 'مرزی', statusBad: 'ارتباط قطع/خراب',
      bits: 'بیت', noErr: 'بدون خطا در',
      noteDigital: 'نرخ نمادها برابر پهنای باند فرض شده؛ بدون کدگذاری تصحیح خطا (FEC).',
      noteAnalog: 'حامل در شبیه‌ساز مقیاس‌دهی شده است؛ محور فرکانس به MHz واقعی برگردانده می‌شود.',
      dbAxis: 'dB', offset: 'اختلاف از حامل'
    },
    en: {
      title: 'Tehran Telecom City',
      subtitle: 'From laptop to data center — see the communication network on a map',
      hint: 'Drag to rotate · Scroll to zoom · Click any building',
      trace: 'Trace a packet',
      tracePower: 'Trace power',
      report: 'Report & sources',
      tehranFacts: 'Public Tehran figures (sourced)',
      layersT: 'Network layers', actorsT: 'Actors & roles', kpisT: 'Evaluation indicators', factsT: 'Published figures', sourcesT: 'Sources',
      showInCity: 'Show in city', clearHl: 'Clear', layerShown: 'Layer',
      calc: 'Calculator',
      traceStop: 'Stop tracing',
      radio: 'Radio lab',
      lang: 'فارسی',
      close: 'Close',
      loading: 'Building the city…',
      noGL: 'Three.js failed to load (or WebGL is unsupported). Fix: download three.min.js (r128) once and upload it next to index.html in the repo.',
      function: 'What it does',
      specs: 'Technical data',
      models: 'Equipment & example models',
      modelsNote: 'Common industry examples; not a claim about what is installed in Tehran.',
      openRadio: 'Open in the radio lab',
      units: 'City units',
      tracing: 'Packet path',
      eduNote: 'Simplified teaching model; building placement is symbolic.',
      labTitle: 'Radio lab',
      labSub: 'Transmitter → channel → receiver, with a real link budget',
      scenarios: 'Scenario',
      modulation: 'Modulation',
      channel: 'Channel',
      awgn: 'Noise only',
      rayleigh: 'Rayleigh fading',
      message: 'Message',
      freq: 'Frequency', dist: 'Distance', ptx: 'Tx power', gtx: 'Tx antenna gain', grx: 'Rx antenna gain',
      extra: 'Extra loss', bw: 'Bandwidth', nf: 'Noise figure',
      fspl: 'Free-space loss', prx: 'Received power', noise: 'Noise floor', snr: 'SNR', ebn0: 'Eb/N0',
      berT: 'BER theory', berS: 'BER simulated', snrOut: 'Output SNR',
      scope: 'Oscilloscope', spectrum: 'Spectrum', constellation: 'Constellation', berCurve: 'BER curve',
      audio: 'Audio: original vs recovered', snrCurve: 'Output SNR vs input SNR',
      tx: 'TX', rx: 'RX', dem: 'DEMOD',
      sent: 'Sent', decoded: 'Received',
      statusGood: 'Link healthy', statusMarg: 'Marginal', statusBad: 'Link failing',
      bits: 'bits', noErr: 'no errors in',
      noteDigital: 'Symbol rate = bandwidth; no forward error correction (FEC).',
      noteAnalog: 'The simulator carrier is scaled down; the frequency axis is mapped back to real MHz.',
      dbAxis: 'dB', offset: 'Offset from carrier'
    }
  };
  const HAS_FA = /[\u0600-\u06FF]/;
  const RUN = /[A-Za-z0-9µ≈<+−\u2011√\u0370-\u03FF][A-Za-z0-9µ.,:\/%+\-−\u2011–≈·×√²³\u2081\u2082\u0370-\u03FF' ]*[A-Za-z0-9µ%°²³\u2081\u2082\u0370-\u03FF]|[A-Za-z0-9µ°\u0370-\u03FF]/g;
  const I18N = {
    lang: 'fa', S: S,
    t(k) { return (S[this.lang] && S[this.lang][k]) || k; },
    pick(o) { return o == null ? '' : (typeof o === 'string' ? o : o[this.lang]); },
    // Bidi helper: wrap Latin/number runs in isolates so they keep their order inside Persian text.
    iso(s) {
      s = String(s == null ? '' : s);
      return (this.lang === 'fa' && HAS_FA.test(s)) ? s.replace(RUN, '\u2066$&\u2069') : s;
    },
    cv(s) {                                  // same for <canvas> text; also says which direction to draw in
      s = String(s);
      if (!HAS_FA.test(s)) return { s: s, dir: 'ltr' };
      return { s: s.replace(RUN, '\u2066$&\u2069'), dir: 'rtl' };
    },
    set(lang) {
      this.lang = lang;
      const d = document.documentElement;
      d.lang = lang; d.dir = lang === 'fa' ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = this.t(el.dataset.i18n); });
      document.querySelectorAll('[data-i18n-label]').forEach((el) => {
        const v = this.t(el.dataset.i18nLabel); el.setAttribute('aria-label', v); el.title = v;
      });
      document.title = this.t('title') + ' · Mokhaberat';
      try { localStorage.setItem('mokhaberat.lang', lang); } catch (e) { /* ignore */ }
      window.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
    }
  };
  window.I18N = I18N;
})();
