/* units.js — bilingual content for every clickable unit in the city.
 * Specs are standards-level figures (ITU-T / 3GPP / IEEE / DVB). Equipment lists are industry examples.
 * To add a unit: add an entry here, a builder in city.js, and an animation in anim.js. */
(function () {
  'use strict';
  const b = (fa, en) => ({ fa: fa, en: en });
  const sp = (kfa, ken, vfa, ven) => ({ k: b(kfa, ken), v: b(vfa, ven === undefined ? vfa : ven) });

  window.UNITS = [
    {
      id: 'user', layer: 'access', preset: 'wifi',
      cat: b('دسترسی', 'Access'),
      name: b('ترمینال‌های کاربر (گوشی و لپ‌تاپ)', 'User terminals (phone & laptop)'),
      desc: b(
        'لپ‌تاپ از طریق Wi‑Fi به مودم/ONT خانه وصل می‌شود. ONT نور فیبر را به اترنت تبدیل می‌کند و بسته‌ها به سمت کافو می‌روند. گوشی هم می‌تواند از همین Wi‑Fi یا مستقیم از دکل 4G/5G استفاده کند.',
        'A laptop joins the home ONT/router over Wi‑Fi. The ONT converts the fiber\'s light into Ethernet and packets head for the street cabinet. A phone can use the same Wi‑Fi or talk straight to a 4G/5G tower.'),
      specs: [
        sp('Wi‑Fi 6 (802.11ax)', 'Wi‑Fi 6 (802.11ax)', '2.4 و 5 GHz؛ کانال 20 تا 160 MHz؛ تا 1024‑QAM', '2.4 & 5 GHz; 20–160 MHz channels; up to 1024‑QAM'),
        sp('5G NR باند n78', '5G NR band n78', '3300–3800 MHz، TDD', '3300–3800 MHz, TDD'),
        sp('LTE باند 3', 'LTE band 3', '1800 MHz، FDD', '1800 MHz, FDD'),
        sp('GPON سمت ONT', 'GPON at the ONT', 'دریافت 1490 nm (2.5 Gbps) · ارسال 1310 nm (1.25 Gbps)', 'receive 1490 nm (2.5 Gbps) · transmit 1310 nm (1.25 Gbps)')
      ],
      models: [b('ONT/ONU نوع GPON با کانکتور SC/APC', 'GPON ONT/ONU with SC/APC connector'), b('روتر Wi‑Fi 6 (802.11ax)', 'Wi‑Fi 6 router (802.11ax)'), b('گوشی 5G با باندهای n78 / n3', '5G smartphone with n78 / n3 bands')],
      anim: b('Wi‑Fi از لپ‌تاپ تا ONT، سپس نور در فیبر', 'Wi‑Fi from laptop to ONT, then light in the fiber')
    },
    {
      id: 'cabinet', layer: 'aggregation', preset: null,
      cat: b('توزیع', 'Distribution'),
      name: b('کافو / نقطه‌ی توزیع نوری (FTTH)', 'Street cabinet / optical distribution point (FTTH)'),
      desc: b(
        'یک تقسیم‌کننده‌ی نوریِ غیرفعال (بدون برق) یک فیبر ورودی از مرکز مخابرات را بین چند خانه پخش می‌کند. هر خانه در بازه‌ی زمانیِ خودش می‌فرستد تا ارسال‌ها با هم برخورد نکنند (TDMA).',
        'A passive (unpowered) optical splitter shares one feeder fiber from the exchange among many homes. Each home transmits in its own time slot (TDMA) so uplink bursts never collide.'),
      specs: [
        sp('نسبت تقسیم', 'Split ratio', '1:8 · 1:16 · 1:32 (تا 1:128)', '1:8 · 1:16 · 1:32 (up to 1:128)'),
        sp('افت تقسیم‌کننده', 'Splitter loss', 'حدود 3.5 dB به ازای هر طبقه‌ی 1:2؛ 1:32 ≈ 17 dB', '≈ 3.5 dB per 1:2 stage; 1:32 ≈ 17 dB'),
        sp('برد', 'Reach', 'تا 20 km (برد منطقی 60 km، ITU‑T G.984)', 'up to 20 km (60 km logical, ITU‑T G.984)'),
        sp('تغذیه‌ی برق', 'Power', 'ندارد (غیرفعال)', 'none (passive)'),
        sp('نوع فیبر', 'Fiber type', 'G.652D تک‌مد', 'G.652D single‑mode')
      ],
      models: [b('اسپلیتر PLC نوع 1:8 / 1:32', 'PLC splitter 1:8 / 1:32'), b('FDH (Fiber Distribution Hub)', 'FDH (Fiber Distribution Hub)'), b('کافوی مسی VDSL2 (FTTC): حدود 100 Mbps روی مس', 'Copper VDSL2 cabinet (FTTC): ~100 Mbps over copper')],
      facts: [ { text: b('همان گزارش: حدود 225 هزار مشترک فعال FTTH؛ ضریب نفوذ FTTH برابر 5.7٪ و xDSL حدود 24٪ اعلام شده است. تعریف مخرج نفوذ مشخص نیست (225 هزار ÷ 6.375 میلیون ≈ 3.5٪ است)، پس این اعداد را مستقیم با هم مقایسه نکنید.', 'Same report: about 225,000 active FTTH subscribers; FTTH penetration stated as 5.7% and xDSL about 24%. The denominator is not defined (225k ÷ 6.375M ≈ 3.5%), so do not compare these numbers directly.'), src: [1] } ],
      anim: b('یک فیبر ورودی، چند خانه؛ پایین‌سو آبی، بالاسو نارنجی', 'One feeder fiber, many homes; downstream teal, upstream orange')
    },
    {
      id: 'exchange', layer: 'aggregation', preset: null,
      cat: b('دسترسی و سوئیچ', 'Access & switching'),
      name: b('مرکز مخابرات (Central Office)', 'Telephone exchange (Central Office)'),
      desc: b(
        'ساختمانی که خطوط مشترکین در آن جمع می‌شوند: قاب توزیع (MDF/ODF)، دستگاه OLT یا DSLAM، سوئیچ صوتی/IMS و برق اضطراری با باتری 48 ولت و ژنراتور تا سرویس هنگام قطع برق ادامه یابد.',
        'The building where subscriber lines converge: distribution frames (MDF/ODF), the OLT or DSLAM, voice switching/IMS, and backup power — 48 V batteries and generators — so service survives a mains outage.'),
      specs: [
        sp('برق', 'Power', '‑48 V DC (رکتیفایر + باتری + دیزل‌ژنراتور)', '−48 V DC (rectifiers + batteries + diesel generator)'),
        sp('پورت GPON', 'GPON port', '2.5 Gbps پایین‌سو / 1.25 Gbps بالاسو، تا 64 ONT', '2.5 Gbps down / 1.25 Gbps up, up to 64 ONTs'),
        sp('آپ‌لینک OLT', 'OLT uplink', '10 / 25 / 100 GbE', '10 / 25 / 100 GbE'),
        sp('صوت', 'Voice', 'G.711، ‏64 kbps برای هر تماس (SIP/IMS)', 'G.711, 64 kbps per call (SIP/IMS)'),
        sp('هدف دردسترس‌بودن', 'Availability target', '99.99٪ (حدود 52 دقیقه توقف در سال)', '99.99% (≈ 52 min downtime per year)')
      ],
      models: [b('شاسی OLT (خانواده‌هایی مثل Huawei MA5800، Nokia ISAM FX، ZTE C600)', 'OLT chassis (families such as Huawei MA5800, Nokia ISAM FX, ZTE C600)'), b('IMS / سافت‌سوئیچ', 'IMS / softswitch'), b('رکتیفایر 48 ولت + بانک باتری', '−48 V rectifier + battery bank')],
      facts: [ { text: b('بر اساس اظهارات مدیر مخابرات منطقه تهران (مرداد 1405): حدود 6 میلیون و 375 هزار مشترک فعال تلفن ثابت در شهر تهران؛ آمار یک مقطع زمانی است.', 'Per the Tehran regional telecom manager (Aug 2026): about 6.375 million active fixed-line subscribers in Tehran city; a point-in-time figure.'), src: [1] } ],
      anim: b('خطوط مشترکین ← OLT ← آپ‌لینک؛ برق اضطراری در پایین', 'Subscriber lines → OLT → uplink; backup power below')
    },
    {
      id: 'fiber', layer: 'transport', preset: null,
      cat: b('انتقال', 'Transport'),
      name: b('ستون فقرات فیبر و کانال‌کشی شهری (DWDM)', 'Fiber backbone & urban ducts (DWDM)'),
      desc: b(
        'نور در هسته‌ی 9 میکرونیِ فیبر تک‌مد با بازتابِ کلیِ داخلی پیش می‌رود. با DWDM ده‌ها طول‌موجِ رنگیِ مختلف همزمان در یک فیبر می‌روند. در شهر، فیبر داخل لوله‌های HDPE زیر خیابان است و در منهول‌ها اتصال (اسپلایس) می‌شود.',
        'Light travels down the 9 µm core of single‑mode fiber by total internal reflection. With DWDM, dozens of different wavelengths (colors) share one fiber. In the city the fiber sits in HDPE ducts under the street and is spliced in manholes.'),
      specs: [
        sp('فیبر', 'Fiber', 'G.652D تک‌مد: هسته 9 µm، غلاف 125 µm', 'G.652D single‑mode: core 9 µm, cladding 125 µm'),
        sp('تضعیف', 'Attenuation', 'حدود 0.2 dB/km در 1550 nm', '≈ 0.2 dB/km at 1550 nm'),
        sp('باند DWDM', 'DWDM band', 'باند C: 1530–1565 nm؛ شبکه‌ی 50/100 GHz ← 40 تا 96 کانال', 'C‑band 1530–1565 nm; 50/100 GHz grid → 40–96 channels'),
        sp('نرخ هر طول‌موج', 'Rate per wavelength', '100 / 200 / 400 Gbps (منسجم DP‑QPSK / 16QAM)', '100 / 200 / 400 Gbps (coherent DP‑QPSK / 16QAM)'),
        sp('تقویت', 'Amplification', 'EDFA تقریباً هر 80 km', 'EDFA roughly every 80 km'),
        sp('تأخیر', 'Latency', 'حدود 5 µs به ازای هر km', '≈ 5 µs per km')
      ],
      models: [b('ترمینال DWDM / ROADM', 'DWDM terminal / ROADM'), b('تقویت‌کننده‌ی EDFA', 'EDFA amplifier'), b('لوله‌ی HDPE ‏40 mm + میکرودکت، منهول در نقاط اتصال', 'HDPE duct 40 mm + microduct, manholes at splice points')],
      facts: [ { text: b('طول شبکه‌ی فیبر نوری استان تهران 16٬400 کیلومتر اعلام شده (خرداد 1405). این رقم مربوط به استان است، نه محدوده‌ی شهرداری تهران.', 'Fiber network length for Tehran province was reported as 16,400 km (Jun 2026). This is the province, not the municipal city area.'), src: [2] } ],
      anim: b('بازتاب کلی داخلی و ترکیب طول‌موج‌ها (WDM)', 'Total internal reflection and wavelength multiplexing (WDM)')
    },
    {
      id: 'datacenter', layer: 'core', preset: null,
      cat: b('هسته', 'Core'),
      name: b('دیتاسنتر', 'Data center'),
      desc: b(
        'هزاران سرور در رک‌ها؛ هر سرور به یک سوئیچ لیف و هر لیف به سوئیچ‌های اسپاین وصل است (Leaf‑Spine) تا بین هر دو سرور مسیری کوتاه و هم‌طول وجود داشته باشد. برق (UPS + دیزل) و سرمایش (چیلر) بخش بزرگی از ساختمان‌اند.',
        'Thousands of servers in racks; each server plugs into a leaf switch and every leaf connects to every spine (Leaf‑Spine), so any two servers are a short, equal‑length path apart. Power (UPS + diesel) and cooling (chillers) take much of the building.'),
      specs: [
        sp('معماری شبکه', 'Fabric', 'Leaf‑Spine با EVPN‑VXLAN', 'Leaf‑Spine with EVPN‑VXLAN'),
        sp('لینک‌ها', 'Links', 'سرور 25 GbE؛ آپ‌لینک 100/400 GbE', 'server 25 GbE; uplinks 100/400 GbE'),
        sp('رک', 'Rack', '42U، معمولاً 5 تا 15 kW', '42U, typically 5–15 kW'),
        sp('PUE', 'PUE', 'حدود 1.3 تا 1.6 (برق کل ÷ برق تجهیزات IT)', '≈ 1.3–1.6 (total power ÷ IT power)'),
        sp('افزونگی', 'Redundancy', 'Tier III: ‏N+1، تعمیر بدون توقف', 'Tier III: N+1, concurrently maintainable')
      ],
      models: [b('سوئیچ ToR/Leaf: رده‌ی 48×25G + 8×100G', 'ToR/leaf switch: 48×25G + 8×100G class'), b('سوئیچ Spine: رده‌ی 32×100/400G', 'Spine switch: 32×100/400G class'), b('UPS + دیزل‌ژنراتور + CRAH/چیلر', 'UPS + diesel genset + CRAH/chiller')],
      anim: b('معماری Leaf‑Spine و بسته‌های در حال عبور', 'Leaf‑Spine fabric with packets in flight')
    },
    {
      id: 'ixp', layer: 'external', preset: null,
      cat: b('هسته', 'Core'),
      name: b('نقطه‌ی تبادل ترافیک و دروازه‌ی بین‌الملل', 'Internet exchange & international gateway'),
      desc: b(
        'شبکه‌ها (AS) اینجا با پروتکل BGP به هم وصل می‌شوند و مسیرهایشان را اعلام می‌کنند. ترافیک داخلی همین‌جا رد و بدل می‌شود و ترافیک خارجی از لینک‌های بین‌المللی (زمینی، دریایی یا ماهواره‌ای) بیرون می‌رود.',
        'Networks (ASes) interconnect here using BGP and advertise their routes. Domestic traffic is exchanged on the spot; foreign traffic leaves over international links — terrestrial, submarine or satellite.'),
      specs: [
        sp('مسیریابی', 'Routing', 'BGP‑4 (RFC 4271) و route server', 'BGP‑4 (RFC 4271) and route servers'),
        sp('شبکه‌ی تبادل', 'Peering LAN', 'اترنت 10/100/400 GbE، ‏MTU برابر 1500 یا 9000', 'Ethernet 10/100/400 GbE, MTU 1500 or 9000'),
        sp('هویت', 'Identity', 'هر شبکه یک شماره‌ی AS دارد', 'every network has an AS number'),
        sp('مسیرهای خروج', 'Transit paths', 'لینک مرزی زمینی · کابل دریایی · ماهواره', 'land‑border links · submarine cable · satellite')
      ],
      models: [b('روتر هسته/لبه: رده‌ی Juniper MX، Cisco ASR 9000، Nokia 7750 SR', 'Core/edge router class: Juniper MX, Cisco ASR 9000, Nokia 7750 SR'), b('Route server: ‏BIRD یا OpenBGPd', 'Route server: BIRD or OpenBGPd'), b('فایروال و تجهیزات مقابله با DDoS', 'Firewalls and DDoS scrubbing appliances')],
      anim: b('شبکه‌ها از طریق یک سوئیچ مرکزی مسیر رد و بدل می‌کنند', 'Networks exchange routes through a central switch')
    },
    {
      id: 'satellite', layer: 'external', preset: 'sat',
      cat: b('رادیویی', 'Radio'),
      name: b('ایستگاه زمینی ماهواره', 'Satellite earth station'),
      desc: b(
        'دیش سیگنال را به ماهواره‌ی زمین‌آهنگ (35٬786 کیلومتر بالاتر) می‌فرستد. چون موج باید حدود 72 هزار کیلومتر برود و برگردد، تأخیر رفت‌وبرگشت حدود نیم‌ثانیه است؛ ماهواره‌های مدار پایین آن را به ده‌ها میلی‌ثانیه می‌رسانند.',
        'The dish beams the signal to a geostationary satellite 35,786 km up. Because the wave travels about 72,000 km up and down, round‑trip delay is roughly half a second; low‑orbit satellites cut that to tens of milliseconds.'),
      specs: [
        sp('باندها', 'Bands', 'C: ‏4/6 GHz · Ku: ‏12/14 GHz · Ka: ‏20/30 GHz', 'C 4/6 GHz · Ku 12/14 GHz · Ka 20/30 GHz'),
        sp('قطر دیش', 'Dish diameter', '1.2 تا 9 متر', '1.2 – 9 m'),
        sp('مدار زمین‌آهنگ', 'GEO orbit', '35,786 km ← یک پرش ≈ 239 ms؛ رفت‌وبرگشت ≈ 480 ms+', '35,786 km → one hop ≈ 239 ms; round trip ≈ 480 ms+'),
        sp('مدار پایین', 'LEO orbit', '≈ 550 km ← رفت‌وبرگشت ≈ 25–50 ms', '≈ 550 km → round trip ≈ 25–50 ms'),
        sp('نویز LNB', 'LNB noise figure', 'حدود 0.5 تا 1 dB', '≈ 0.5–1 dB'),
        sp('مدولاسیون', 'Modulation', 'DVB‑S2/S2X: از QPSK تا 32APSK + کد LDPC', 'DVB‑S2/S2X: QPSK to 32APSK + LDPC coding')
      ],
      models: [b('آنتن پارابولیک با LNB (دریافت) و BUC (ارسال)', 'Parabolic antenna with LNB (receive) and BUC (transmit)'), b('مودم DVB‑S2X', 'DVB‑S2X modem'), b('تقویت‌کننده‌ی توان SSPA رده‌ی 100–400 W', 'SSPA power amplifier, 100–400 W class')],
      anim: b('ارسال به ماهواره‌ی زمین‌آهنگ و بازگشت؛ تأخیر انتشار', 'Uplink to a GEO satellite and back; propagation delay')
    },
    {
      id: 'broadcast', layer: null, preset: 'fm',
      cat: b('رادیویی', 'Radio'),
      name: b('برج پخش رادیو و تلویزیون', 'Broadcast tower'),
      desc: b(
        'ارتفاع بیشتر یعنی افق رادیویی دورتر: برد دید مستقیم ≈ 4.12·(√h₁+√h₂) کیلومتر (h به متر). در FM فرکانس حامل با صدا تغییر می‌کند و در AM دامنه. مدل سه‌بعدی الهام‌گرفته از برج میلاد (435 متر) است.',
        'More height means a farther radio horizon: line‑of‑sight range ≈ 4.12·(√h₁+√h₂) km (h in meters). FM varies the carrier\'s frequency with the sound; AM varies its amplitude. The 3D model is inspired by Milad Tower (435 m).'),
      specs: [
        sp('FM', 'FM', '87.5–108 MHz؛ انحراف ±75 kHz؛ کانال 200 kHz', '87.5–108 MHz; ±75 kHz deviation; 200 kHz channel'),
        sp('AM (موج متوسط)', 'AM (medium wave)', '531–1602 kHz؛ فاصله‌ی کانال 9 kHz', '531–1602 kHz; 9 kHz channel spacing'),
        sp('تلویزیون دیجیتال', 'Digital TV', 'DVB‑T2 در UHF (حدود 470–790 MHz)', 'DVB‑T2 in UHF (≈ 470–790 MHz)'),
        sp('افق رادیویی', 'Radio horizon', 'h = 400 m ← حدود 85 تا 95 km', 'h = 400 m → ≈ 85–95 km'),
        sp('توان تابشی (ERP)', 'Radiated power (ERP)', 'از چند kW تا ده‌ها kW', 'several kW to tens of kW')
      ],
      models: [b('فرستنده‌ی FM ‏1 تا 50 kW + کامبینر', 'FM transmitter 1–50 kW + combiner'), b('فرستنده‌ی DVB‑T2 + آنتن پنلی UHF', 'DVB‑T2 transmitter + UHF panel antenna'), b('فیدر کواکس/موجبر و حفاظت صاعقه', 'Coax/waveguide feeder and lightning protection')],
      anim: b('امواج در همه‌ی جهات؛ شکل‌موج FM در پایین', 'Waves in every direction; FM waveform below')
    },
    {
      id: 'cell', layer: 'access', preset: 'g5',
      cat: b('رادیویی', 'Radio'),
      name: b('دکل موبایل (eNodeB / gNodeB)', 'Cell tower (eNodeB / gNodeB)'),
      desc: b(
        'هر دکل معمولاً سه سکتور 120 درجه دارد. در 5G آنتن‌های Massive MIMO باریکه‌ی تابش را به سمت گوشی می‌چرخانند (beamforming). واحد باند پایه (BBU) با فیبر به واحد رادیویی بالای دکل وصل است و به هسته از طریق فیبر یا مایکروویو می‌رود.',
        'A tower usually has three 120° sectors. In 5G, Massive‑MIMO antennas steer a narrow beam at each phone (beamforming). The baseband unit (BBU) feeds the radio at the top over fiber and reaches the core by fiber or microwave.'),
      specs: [
        sp('5G NR باند n78', '5G NR band n78', '3300–3800 MHz، TDD، تا 100 MHz در هر حامل', '3300–3800 MHz, TDD, up to 100 MHz per carrier'),
        sp('LTE باند 3', 'LTE band 3', '1800 MHz، FDD، ‏20 MHz', '1800 MHz, FDD, 20 MHz'),
        sp('Massive MIMO', 'Massive MIMO', '32T32R یا 64T64R', '32T32R or 64T64R'),
        sp('سکتورها', 'Sectors', '3 × 120°', '3 × 120°'),
        sp('فرانت‌هال', 'Fronthaul', 'eCPRI/CPRI روی فیبر', 'eCPRI/CPRI over fiber'),
        sp('بک‌هال', 'Backhaul', 'فیبر یا مایکروویو، 1 تا 10 Gbps', 'fiber or microwave, 1–10 Gbps')
      ],
      models: [b('AAU ‏(آنتن فعال) ‏64T64R', 'AAU (Active Antenna Unit) 64T64R'), b('RRU + آنتن پنلی غیرفعال', 'RRU + passive panel antenna'), b('BBU ‏(واحد باند پایه)', 'BBU (baseband unit)')],
      anim: b('سه سکتور و باریکه‌ای که گوشی متحرک را دنبال می‌کند', 'Three sectors and a beam that follows a moving phone')
    },
    {
      id: 'microwave', layer: 'transport', preset: 'mw',
      cat: b('رادیویی', 'Radio'),
      name: b('لینک مایکروویو نقطه‌به‌نقطه', 'Point‑to‑point microwave link'),
      desc: b(
        'جایی که کشیدن فیبر سخت یا گران است، دو دیش با دید مستقیم (LOS) ارتباطی پرظرفیت می‌سازند. ناحیه‌ی فرنل اول باید دست‌کم 60٪ از موانع پاک باشد: r = 8.66·√(d/f) متر (d به km، f به GHz).',
        'Where fiber is hard or costly, two dishes with line of sight (LOS) form a high‑capacity link. At least 60% of the first Fresnel zone must be clear of obstacles: r = 8.66·√(d/f) meters (d in km, f in GHz).'),
      specs: [
        sp('باندها', 'Bands', '6 تا 42 GHz؛ باند E: ‏71–86 GHz', '6–42 GHz; E‑band 71–86 GHz'),
        sp('ظرفیت', 'Capacity', '1 تا 10 Gbps (مدولاسیون تطبیقی QPSK … 4096QAM)', '1–10 Gbps (adaptive modulation QPSK … 4096QAM)'),
        sp('طول پرش', 'Hop length', 'حدود 1–2 km (باند E) تا 50 km (باندهای پایین)', '≈ 1–2 km (E‑band) up to 50 km (low bands)'),
        sp('شعاع فرنل', 'Fresnel radius', '15 GHz و 20 km ← حدود 10 m', '15 GHz, 20 km → ≈ 10 m'),
        sp('محوشدگی', 'Fading', 'باران و چندمسیری ← مدولاسیون تطبیقی', 'rain & multipath → adaptive modulation'),
        sp('دیش', 'Dish', '0.3 تا 1.8 m', '0.3 – 1.8 m')
      ],
      models: [b('Split‑mount: ‏IDU + ODU با XPIC', 'Split‑mount IDU + ODU with XPIC'), b('ODU باند E ‏(71–76 / 81–86 GHz)', 'E‑band ODU (71–76 / 81–86 GHz)'), b('دکل خرپایی و مهار صاعقه', 'Lattice tower and lightning protection')],
      anim: b('دید مستقیم و ناحیه‌ی فرنل؛ انتقال دوطرفه', 'Line of sight and Fresnel zone; two‑way transfer')
    },
    {
      id: 'plant', layer: 'power', preset: null,
      cat: b('تولید برق', 'Generation'),
      name: b('نیروگاه سیکل ترکیبی', 'Combined-cycle power plant'),
      desc: b(
        'گاز طبیعی در کمپرسور و محفظه‌ی احتراق به گاز داغ تبدیل می‌شود و توربین گازی و ژنراتور را می‌چرخاند. گرمای اگزوز در بویلر بازیاب بخار تولید می‌کند و توربین بخار ژنراتور دوم را می‌چرخاند؛ برای همین بازده از توربین گازی ساده بالاتر است. برق ژنراتور با ترانسفورماتور افزاینده به ولتاژ انتقال می‌رسد.',
        'Natural gas is burned in the combustor; the hot gas spins a gas turbine and generator. Exhaust heat makes steam in a heat-recovery boiler that spins a steam turbine and a second generator — hence higher efficiency than a simple gas turbine. A step-up transformer raises generator voltage to transmission level.'),
      specs: [
        sp('فرکانس', 'Frequency', '50 Hz ← ژنراتور دوقطب با 3000 دور بر دقیقه', '50 Hz → a 2-pole generator turns at 3000 rpm'),
        sp('ولتاژ ترمینال ژنراتور', 'Generator terminal voltage', 'حدود 11 تا 23 kV، سپس افزایش به 230/400 kV', 'about 11–23 kV, then stepped up to 230/400 kV'),
        sp('بازده', 'Efficiency', 'سیکل ترکیبی ≈ 55–60٪؛ توربین گازی ساده ≈ 35–40٪', 'combined cycle ≈ 55–60%; simple-cycle gas turbine ≈ 35–40%'),
        sp('سوخت', 'Fuel', 'گاز طبیعی (سوخت جایگزین در برخی واحدها)', 'natural gas (backup fuel at some units)'),
        sp('ظرفیت نصب‌شده‌ی ایران (2017)', 'Iran installed capacity (2017)', 'گازی 26,200 · بخار 15,829 · سیکل ترکیبی 23,166 · آبی 11,943 · هسته‌ای 1,020 · سایر تجدیدپذیر 333 مگاوات', 'gas 26,200 · steam 15,829 · combined cycle 23,166 · hydro 11,943 · nuclear 1,020 · other renewables 333 MW')
      ],
      models: [b('توربین گازی کلاس F/H ‏(چند صد مگاوات)', 'F/H-class gas turbine (hundreds of MW)'), b('بویلر بازیاب گرما (HRSG) و توربین بخار', 'Heat-recovery steam generator (HRSG) and steam turbine'), b('ترانسفورماتور افزاینده + سوئیچ‌یارد', 'Step-up transformer + switchyard')],
      facts: [{ text: b('داده‌ی ظرفیت مربوط به سال 2017 است (ارائه‌ی کمیته‌ی ملی ایران در CIGRE)؛ اعداد امروز متفاوت‌اند.', 'Capacity data is for 2017 (Iran national committee presentation at CIGRE); today\'s numbers differ.'), src: [6] }],
      anim: b('گاز ← توربین ← ژنراتور؛ گرمای اگزوز ← بخار ← ژنراتور دوم', 'Gas → turbine → generator; exhaust heat → steam → second generator')
    },
    {
      id: 'hvsub', layer: 'power', preset: null,
      cat: b('انتقال برق', 'Transmission'),
      name: b('پست فشار قوی و خطوط انتقال', 'High-voltage substation & transmission lines'),
      desc: b(
        'توان ثابت P = √3·V·I·cosφ است؛ با بالا بردن ولتاژ، جریان کم می‌شود و تلفات حرارتی I²R در خط به‌شدت کاهش می‌یابد. پست فشار قوی با ترانسفورماتور، کلید قدرت و حفاظت (رله‌ها) ولتاژ را تبدیل و خطاها را در کسری از ثانیه جدا می‌کند. ماشین‌حساب پایین را با اعداد خودتان امتحان کنید.',
        'Power is P = √3·V·I·cosφ. Raising voltage lowers current, and the heat loss I²R in the line falls sharply. The substation uses transformers, circuit breakers and protection relays to change voltage and isolate faults in a fraction of a second. Try the calculator below with your own numbers.'),
      specs: [
        sp('ولتاژ انتقال در ایران', 'Transmission voltages in Iran', '400 و 230 kV', '400 and 230 kV'),
        sp('فوق‌توزیع', 'Sub-transmission', '132 · 66 · 63 kV', '132 · 66 · 63 kV'),
        sp('فرکانس', 'Frequency', '50 Hz', '50 Hz'),
        sp('تجهیزات اصلی', 'Main equipment', 'ترانسفورماتور قدرت، کلید قدرت (SF₆)، سکسیونر، شینه، رله‌های حفاظتی', 'power transformers, SF₆ circuit breakers, disconnectors, busbars, protection relays'),
        sp('معیار پایداری', 'Reliability rule', 'N‑1: با از دست رفتن یک المان، شبکه باید سالم بماند', 'N‑1: the grid must survive the loss of any single element')
      ],
      models: [b('ترانسفورماتور 400/230 kV و 230/63 kV', '400/230 kV and 230/63 kV transformers'), b('کلید قدرت SF₆ و رله‌های دیستانس/دیفرانسیل', 'SF₆ breakers and distance/differential relays'), b('SCADA و مرکز دیسپچینگ', 'SCADA and dispatch centre')],
      facts: [{ text: b('سطوح ولتاژ از ارائه‌ی کمیته‌ی ملی ایران در CIGRE (2018): انتقال 400 و 230 kV، فوق‌توزیع 132/66/63 kV، توزیع 33/20/11 kV، مصرف‌کننده‌ی سه‌فاز 380 V.', 'Voltage levels from the Iran national committee presentation at CIGRE (2018): transmission 400 and 230 kV, sub-transmission 132/66/63 kV, distribution 33/20/11 kV, three-phase consumer 380 V.'), src: [6] }],
      calc: {
        title: b('ماشین‌حساب تلفات خط', 'Line-loss calculator'),
        inputs: [
          { id: 'P', label: b('توان انتقالی', 'Power transferred'), min: 10, max: 1000, step: 10, val: 300, unit: 'MW' },
          { id: 'V', label: b('ولتاژ خط', 'Line voltage'), min: 20, max: 400, step: 1, val: 400, unit: 'kV' },
          { id: 'L', label: b('طول خط', 'Line length'), min: 5, max: 500, step: 5, val: 100, unit: 'km' },
          { id: 'R', label: b('مقاومت هادی', 'Conductor resistance'), min: 0.02, max: 0.2, step: 0.01, val: 0.05, unit: 'Ω/km' }
        ],
        outs: [
          { label: b('جریان هر فاز', 'Current per phase'), fn: (v) => (v.P * 1e6 / (Math.sqrt(3) * v.V * 1e3 * 0.95)).toFixed(0) + ' A' },
          { label: b('تلفات توان', 'Power loss'), fn: (v) => { const I = v.P * 1e6 / (Math.sqrt(3) * v.V * 1e3 * 0.95); return (3 * I * I * v.R * v.L / 1e6).toFixed(2) + ' MW'; } },
          { label: b('درصد تلفات', 'Loss share'), fn: (v) => { const I = v.P * 1e6 / (Math.sqrt(3) * v.V * 1e3 * 0.95); return (100 * 3 * I * I * v.R * v.L / 1e6 / v.P).toFixed(1) + ' %'; } }
        ],
        note: b('فرض: cosφ = 0.95، سه‌فاز، فقط تلفات مقاومتی (بدون کرونا و راکتانس).', 'Assumes cosφ = 0.95, three-phase, resistive loss only (no corona or reactance).')
      },
      anim: b('همان توان: ولتاژ پایین = جریان زیاد = گرم‌شدن؛ ولتاژ بالا = جریان کم', 'Same power: low voltage = big current = heat; high voltage = small current')
    },
    {
      id: 'distsub', layer: 'power', preset: null,
      cat: b('توزیع برق', 'Distribution'),
      name: b('پست توزیع و کابل‌های شهری', 'Distribution substation & city cables'),
      desc: b(
        'ولتاژ فوق‌توزیع (مثلاً 63 kV) در پست توزیع به ولتاژ میانی (مثلاً 20 kV) می‌رسد و فیدرها آن را در شهر پخش می‌کنند. ترانسفورماتورهای توزیع نزدیک مصرف‌کننده ولتاژ را به 380/220 ولت می‌رسانند. مراکز مخابراتی، دیتاسنترها و سایت‌های دکل معمولاً از همین فیدرها تغذیه می‌شوند و برق پشتیبان دارند.',
        'Sub-transmission voltage (e.g. 63 kV) is stepped down to medium voltage (e.g. 20 kV) and feeders spread it across the city. Distribution transformers near customers produce 380/220 V. Exchanges, data centers and tower sites are fed from such feeders and keep backup power.'),
      specs: [
        sp('ولتاژ توزیع در ایران', 'Distribution voltages in Iran', '33 · 20 · 11 kV', '33 · 20 · 11 kV'),
        sp('ولتاژ مصرف‌کننده', 'Customer voltage', '380 V سه‌فاز، 220 V تک‌فاز', '380 V three-phase, 220 V single-phase'),
        sp('آرایش فیدر', 'Feeder layout', 'شعاعی یا حلقوی با نقاط باز (برای انتقال بار هنگام خطا)', 'radial or ring with normally-open points (to re-route during faults)'),
        sp('حفاظت', 'Protection', 'ریکلوزر، فیوز، رله‌ی اضافه‌جریان', 'reclosers, fuses, over-current relays')
      ],
      models: [b('ترانسفورماتور 63/20 kV', '63/20 kV transformer'), b('تابلوی میان‌ولتاژ (RMU/GIS)', 'Medium-voltage switchgear (RMU/GIS)'), b('ترانسفورماتور هوایی/زمینی 20/0.4 kV', 'Pole/pad-mounted 20/0.4 kV transformer')],
      facts: [],
      anim: b('پست ← فیدر 20 kV ← ترانسفورماتور محلی ← مصرف‌کننده', 'Substation → 20 kV feeder → local transformer → customers')
    },
    {
      id: 'solar', layer: 'power', preset: null,
      cat: b('تولید برق', 'Generation'),
      name: b('نیروگاه خورشیدی و بادی', 'Solar & wind generation'),
      desc: b(
        'پنل‌های فتوولتائیک نور را به جریان مستقیم تبدیل می‌کنند و اینورتر آن را به برق متناوب 50 هرتز شبکه برمی‌گرداند. توربین بادی انرژی جنبشی باد را به برق تبدیل می‌کند. تولید این منابع با خورشید و باد تغییر می‌کند؛ شبکه برای جبران آن به نیروگاه‌های قابل کنترل، ذخیره‌ساز یا مدیریت مصرف نیاز دارد.',
        'Photovoltaic panels turn light into direct current and an inverter converts it to the grid\'s 50 Hz AC. A wind turbine converts the wind\'s kinetic energy. Their output varies with sun and wind, so the grid needs controllable plants, storage or demand management to balance it.'),
      specs: [
        sp('تابش مرجع', 'Reference irradiance', '1000 W/m² (شرایط استاندارد STC)', '1000 W/m² (STC)'),
        sp('بازده پنل', 'Panel efficiency', 'حدود 18 تا 23٪', 'about 18–23%'),
        sp('ضریب ظرفیت', 'Capacity factor', 'خورشیدی ≈ 20–30٪؛ بادی ≈ 25–40٪ (بسته به محل)', 'solar ≈ 20–30%; wind ≈ 25–40% (site dependent)'),
        sp('اینورتر', 'Inverter', 'DC ← AC، هم‌گام با شبکه 50 Hz', 'DC → AC, synchronised to the 50 Hz grid'),
        sp('توان بادی', 'Wind power', 'P = ½·ρ·A·v³·Cp (Cp حداکثر 0.593)', 'P = ½·ρ·A·v³·Cp (Cp at most 0.593)')
      ],
      models: [b('ماژول مونوکریستال/پرک', 'Mono PERC / TOPCon modules'), b('اینورتر رشته‌ای یا مرکزی', 'String or central inverter'), b('توربین بادی افقی‌محور سه‌پره', 'Three-blade horizontal-axis wind turbine')],
      facts: [],
      anim: b('منحنی روزانه‌ی تولید خورشیدی و چرخش توربین', 'Daily solar curve and a spinning wind turbine')
    },
    {
      id: 'sitepower', layer: 'power', preset: null,
      cat: b('برق مخابرات', 'Telecom power'),
      name: b('برق پشتیبان سایت مخابراتی', 'Telecom site backup power'),
      desc: b(
        'تجهیزات مخابراتی با برق مستقیم 48 ولت کار می‌کنند. رکتیفایر برق شهر را به 48 ولت تبدیل می‌کند و باتری‌ها را شارژ نگه می‌دارد. هنگام قطع برق، باتری بدون هیچ وقفه بار را می‌گیرد و اگر قطعی طولانی شود دیزل‌ژنراتور روشن می‌شود. اگر باتری و سوخت تمام شوند، سایت خاموش می‌شود. ماشین‌حساب زمان دوام باتری را نشان می‌دهد.',
        'Telecom equipment runs on 48 V DC. A rectifier converts mains to 48 V and keeps batteries charged. In an outage the batteries take over with no break, and a diesel generator starts if it lasts. If batteries and fuel run out, the site goes dark. The calculator shows battery autonomy.'),
      specs: [
        sp('ولتاژ DC', 'DC bus', '‑48 V (ایمن‌تر و بدون مبدل اضافه برای تجهیزات)', '−48 V (safe and converter-free for telecom gear)'),
        sp('باتری', 'Batteries', 'سرب‑اسید VRLA یا لیتیوم‌یون؛ دوام معمول چند ساعت', 'VRLA lead-acid or lithium-ion; typical autonomy a few hours'),
        sp('ژنراتور', 'Generator', 'دیزلی با کلید انتقال خودکار (ATS)', 'diesel with automatic transfer switch (ATS)'),
        sp('افزونگی', 'Redundancy', 'ماژول‌های رکتیفایر N+1', 'N+1 rectifier modules'),
        sp('هم‌افزایی', 'Hybrid', 'پنل خورشیدی می‌تواند مصرف سوخت را کم کند', 'solar panels can reduce fuel use')
      ],
      models: [b('رکتیفایر ماژولار 48 V، 3 تا 6 kW', 'Modular 48 V rectifier, 3–6 kW'), b('بانک باتری VRLA/Li‑ion', 'VRLA/Li‑ion battery bank'), b('دیزل‌ژنراتور + ATS', 'Diesel generator + ATS')],
      facts: [{ text: b('مدیر مخابرات منطقه‌ی تهران هزینه‌ی ماهانه‌ی برق شبکه را نزدیک به 60 میلیارد تومان اعلام کرده (مرداد 1405). این نقل‌قول رسانه‌ای است و لزوماً هزینه‌ی کل صنعت یا همه‌ی اپراتورها نیست.', 'The Tehran regional telecom manager stated monthly network electricity cost near 60 billion toman (Aug 2026). A media quote; not necessarily the whole industry or all operators.'), src: [1] }],
      calc: {
        title: b('ماشین‌حساب دوام باتری', 'Battery autonomy calculator'),
        inputs: [
          { id: 'W', label: b('بار سایت', 'Site load'), min: 0.5, max: 20, step: 0.5, val: 4, unit: 'kW' },
          { id: 'E', label: b('ظرفیت باتری', 'Battery capacity'), min: 2, max: 200, step: 1, val: 40, unit: 'kWh' },
          { id: 'D', label: b('عمق تخلیه‌ی مجاز', 'Allowed depth of discharge'), min: 50, max: 90, step: 5, val: 80, unit: '%' }
        ],
        outs: [
          { label: b('دوام بدون برق', 'Autonomy without mains'), fn: (v) => (v.E * v.D / 100 / v.W).toFixed(1) + ' h' },
          { label: b('انرژی روزانه', 'Daily energy'), fn: (v) => (v.W * 24).toFixed(0) + ' kWh' }
        ],
        note: b('محاسبه‌ی ساده: ظرفیت قابل‌استفاده ÷ بار؛ پیری باتری و دما دوام واقعی را کمتر می‌کنند.', 'Simple estimate: usable capacity ÷ load; ageing and temperature shorten real autonomy.')
      },
      anim: b('قطع برق: باتری، سپس دیزل‌ژنراتور، سپس بازگشت برق شهر', 'Mains outage: battery, then generator, then mains return')
    }
  ];

  window.TRACE = [
    { unit: 'user',       text: b('لپ‌تاپ بسته را با Wi‑Fi به ONT می‌دهد و ONT آن را به نور تبدیل می‌کند', 'The laptop hands the packet to the ONT over Wi‑Fi; the ONT turns it into light') },
    { unit: 'cabinet',    text: b('بسته در بازه‌ی زمانی خودش (TDMA) از تقسیم‌کننده‌ی کافو می‌گذرد', 'The packet passes the cabinet splitter in its own TDMA time slot') },
    { unit: 'exchange',   text: b('OLT در مرکز مخابرات بسته‌ها را جمع و به شبکه‌ی انتقال می‌دهد', 'The OLT in the exchange aggregates packets and hands them to the transport network') },
    { unit: 'fiber',      text: b('حلقه‌ی DWDM آن را روی یک طول‌موج رنگی به سمت دیتاسنتر می‌برد', 'The DWDM ring carries it on one wavelength toward the data center') },
    { unit: 'datacenter', text: b('سوئیچ‌های Leaf‑Spine بسته را به سرور یا مسیر خروجی می‌رسانند', 'Leaf‑Spine switches deliver it to a server or the exit path') },
    { unit: 'ixp',        text: b('روتر BGP مسیر مقصد را برمی‌گزیند؛ مقصد خارجی از دروازه می‌رود', 'The BGP router picks the route; foreign destinations leave via the gateway') },
    { unit: 'satellite',  text: b('دیش بسته را به ماهواره‌ی زمین‌آهنگ می‌فرستد (حدود 120 ms یک‌طرفه)', 'The dish beams it to a GEO satellite (≈ 120 ms one way)') }
  ];

  window.TRACE_POWER = [
    { unit: 'plant',      text: b('گاز در نیروگاه می‌سوزد، ژنراتور 50 هرتز تولید می‌کند و ترانسفورماتور ولتاژ را بالا می‌برد', 'Gas burns in the plant, the generator makes 50 Hz power and a transformer raises the voltage') },
    { unit: 'hvsub',      text: b('خط انتقال 400/230 kV توان را با جریان کم و تلفات کم به پست فشار قوی می‌رساند', 'The 400/230 kV line carries the power at low current and low loss to the HV substation') },
    { unit: 'distsub',    text: b('پست توزیع ولتاژ را پایین می‌آورد و فیدرهای شهری آن را پخش می‌کنند', 'The distribution substation steps the voltage down and city feeders spread it') },
    { unit: 'exchange',   text: b('برق به مرکز مخابرات می‌رسد؛ رکتیفایر آن را 48 ولت می‌کند و باتری آماده است', 'Power reaches the exchange; rectifiers make 48 V and batteries stand by') },
    { unit: 'datacenter', text: b('دیتاسنتر برق را از UPS و ژنراتور هم دارد تا سرورها هیچ‌گاه قطع نشوند', 'The data center also has UPS and generators so servers never drop') }
  ];

  // Content derived from the uploaded report «گزارش سیستم مخابراتی تهران» (4 Nov 2026) + sources marked "added".
  window.REPORT = {
    title: b('گزارش و منابع', 'Report & sources'),
    intro: b(
      'این بخش از «گزارش پژوهشی: ساختار عمومی سیستم مخابراتی شهر تهران» (4 نوامبر 2026) ساخته شده است. گزارش عمداً نقشه‌ی عملیاتی، مسیر دقیق کابل یا محل تجهیزات حساس را ارائه نمی‌دهد؛ این شهر هم نمادین است و نقشه‌ی واقعی نیست.',
      'This section is built from the research report “General structure of Tehran\'s telecom system” (4 Nov 2026). The report deliberately gives no operational maps, exact cable routes or sensitive equipment locations; this city is symbolic, not a real map.'),
    layers: [
      { id: 'access', name: b('لایه‌ی دسترسی', 'Access layer'), text: b('اتصال خانه، اداره یا گوشی به شبکه با زوج‌سیم مسی، فیبر یا امواج رادیویی.', 'Connects a home, office or phone to the network over copper pair, fiber or radio.'), units: ['user', 'cell'] },
      { id: 'aggregation', name: b('لایه‌ی تجمیع', 'Aggregation layer'), text: b('جمع‌کردن ترافیک مشترکان در نقاط تجمیع شهری و آماده‌سازی برای انتقال.', 'Collects subscribers\' traffic at city aggregation points and prepares it for transport.'), units: ['cabinet', 'exchange'] },
      { id: 'transport', name: b('لایه‌ی انتقال', 'Transport layer'), text: b('جابه‌جایی حجم بالای صدا و داده میان بخش‌های شهر و مراکز شبکه؛ فیبر یکی از رسانه‌های اصلی است.', 'Moves large volumes of voice and data between city areas and network centers; fiber is a main medium.'), units: ['fiber', 'microwave'] },
      { id: 'core', name: b('هسته و کنترل', 'Core & control'), text: b('مسیریابی داده، مدیریت نشست، کنترل تماس، احراز هویت و اتصال شبکه‌ها به هم.', 'Routing, session management, call control, authentication and interconnection.'), units: ['datacenter'] },
      { id: 'external', name: b('خدمات و اتصال بیرونی', 'Services & external connectivity'), text: b('اینترنت، مراکز داده، خدمات سازمانی، تماس بین‌شهری/بین‌المللی و ارتباط با سایر اپراتورها.', 'Internet, data centers, enterprise services, long-distance/international calls and links to other operators.'), units: ['ixp', 'satellite'] },
      { id: 'power', name: b('برق و تاب‌آوری (بخش 6 گزارش)', 'Power & resilience (report §6)'), text: b('مراکز مخابراتی به برق پایدار، برق اضطراری، سرمایش و پایش نیاز دارند؛ قطع برق می‌تواند ظرفیت یا پایداری سرویس را کم کند.', 'Telecom sites need stable power, backup power, cooling and monitoring; an outage can reduce capacity or stability.'), units: ['plant', 'hvsub', 'distsub', 'solar', 'sitepower'] }
    ],
    facts: [
      { text: b('حدود 6 میلیون و 375 هزار مشترک فعال تلفن ثابت در شهر تهران.', 'About 6.375 million active fixed-line subscribers in Tehran city.'), src: [1], note: b('اظهار مدیر مخابرات منطقه‌ی تهران، مرداد 1405', 'Statement by Tehran regional telecom manager, Aug 2026') },
      { text: b('حدود 225 هزار مشترک فعال FTTH؛ نفوذ FTTH ≈ 5.7٪ و xDSL ≈ 24٪.', 'About 225,000 active FTTH subscribers; FTTH penetration ≈ 5.7% and xDSL ≈ 24%.'), src: [1], note: b('تعریف مخرج نفوذ مشخص نیست؛ 225 هزار ÷ 6.375 میلیون ≈ 3.5٪ است.', 'Denominator undefined; 225k ÷ 6.375M ≈ 3.5%.') },
      { text: b('طول فیبر نوری استان تهران: 16٬400 کیلومتر.', 'Fiber length, Tehran province: 16,400 km.'), src: [2], note: b('استان است نه شهر؛ خرداد 1405', 'Province, not city; Jun 2026') },
      { text: b('هزینه‌ی ماهانه‌ی برق شبکه نزدیک به 60 میلیارد تومان.', 'Monthly network electricity cost near 60 billion toman.'), src: [1], note: b('نقل‌قول رسانه‌ای؛ لزوماً کل صنعت نیست', 'Media quote; not necessarily the whole industry') }
    ],
    actors: [
      { name: b('شرکت مخابرات ایران / مخابرات منطقه‌ی تهران', 'Telecommunication Company of Iran / Tehran region'), text: b('تلفن ثابت، بخشی از دسترسی ثابت، DSL و توسعه‌ی فیبر.', 'Fixed telephony, part of fixed access, DSL and fiber rollout.') },
      { name: b('اپراتورهای سیار (همراه اول، ایرانسل، رایتل)', 'Mobile operators (MCI, Irancell, RighTel)'), text: b('خدمات موبایل و مدیریت شبکه‌ی رادیویی و هسته‌ی اختصاصی.', 'Mobile services; own radio access and core networks.') },
      { name: b('شرکت ارتباطات زیرساخت', 'Infrastructure Communications Company'), text: b('شبکه‌ی مادر مخابراتی و بخشی از انتقال و ارتباطات بین‌الملل.', 'National backbone and part of transport and international links.') },
      { name: b('سازمان تنظیم مقررات و ارتباطات رادیویی', 'Communications Regulatory Authority'), text: b('پروانه، تنظیم‌گری، نظارت بر بازار و چارچوب‌های فنی/رقابتی.', 'Licensing, regulation, market oversight and technical/competition frameworks.') },
      { name: b('شهرداری و دستگاه‌های خدمات شهری', 'Municipality & city services'), text: b('هماهنگی حفاری، مجوزها، کانال‌ها و تداخل پروژه‌های عمرانی با زیرساخت.', 'Coordinating excavation, permits, ducts and conflicts with construction works.') }
    ],
    kpis: [
      b('پوشش جغرافیایی و درصد ساختمان‌های قابل سرویس‌گیری فیبر', 'Geographic coverage and share of buildings that can get fiber'),
      b('سرعت واقعی دانلود/آپلود، تأخیر، نوسان تأخیر و ازدست‌رفتن بسته', 'Real download/upload speed, latency, jitter and packet loss'),
      b('دردسترس‌بودن سرویس و میانگین زمان رفع خرابی', 'Service availability and mean time to repair'),
      b('تراکم و ازدحام در ساعات اوج', 'Congestion at peak hours'),
      b('تعداد مسیرهای جایگزین و زمان بازیابی پس از حادثه', 'Number of alternate paths and recovery time after an incident'),
      b('کیفیت پوشش داخل ساختمان و تفاوت محله‌ها', 'Indoor coverage quality and differences between neighbourhoods')
    ],
    sources: [
      { n: 1, t: b('تسنیم، «مخابرات: شهرداری تهران در پروژه فیبر نوری به‌دنبال بیزینس است»، 25 مرداد 1405', 'Tasnim, “Telecom: Tehran municipality seeks business in the fiber project”, 16 Aug 2026'), url: 'https://www.tasnimnews.ir/fa/news/1405/05/25/3672184/', rep: true },
      { n: 2, t: b('تسنیم، «2 همت خسارت به شبکه ارتباطی تهران وارد شد»، 2 خرداد 1405', 'Tasnim, “2 hemmat damage to Tehran\'s communication network”, 23 May 2026'), url: 'https://www.tasnimnews.ir/fa/news/1405/03/02/3598403/', rep: true },
      { n: 3, t: b('کمیسیون تنظیم مقررات ارتباطات، مصوبه‌ی 1 جلسه‌ی 336', 'Communications Regulation Commission, resolution 1 of session 336'), url: 'https://naderjafari.com/resolutions/cra/1401/336-1', rep: true },
      { n: 4, t: b('JICA، گزارش مدیریت ریسک زلزله‌ی تهران (زمینه‌ی تاریخی)', 'JICA, Tehran earthquake risk management report (historical context)'), url: 'https://openjicareport.jica.go.jp/pdf/12252748_01.pdf', rep: true },
      { n: 5, t: b('Article 19، گزارش ساختار فنی اتصال اینترنت در ایران', 'Article 19, report on the technical structure of Iran\'s internet connectivity'), url: 'https://www.article19.org/wp-content/uploads/2020/10/Iran-Internet-Report-Farsi-3.pdf', rep: true },
      { n: 6, t: b('(افزوده‌شده) CIGRE، ارائه‌ی کمیته‌ی ملی ایران درباره‌ی سیستم قدرت، 2018', '(added) CIGRE, Iran national committee presentation on the power system, 2018'), url: 'https://www.cigre.org/userfiles/files/Community/NC/2018_National-power-system_Iran.pdf', rep: false }
    ],
    limits: b(
      'محدودیت‌ها: گزارش بر منابع عمومی و اظهارات منتشرشده تکیه دارد؛ آمارها ممکن است به شهر یا استان اشاره کنند و تاریخ انتشار مهم است. برای طراحی مهندسی یا ارزیابی میدانی باید داده‌ی رسمی و به‌روز از اپراتورها و نهادهای مسئول گرفته شود.',
      'Limitations: the report relies on public sources and published statements; figures may refer to the city or the province, and publication date matters. For engineering design or field assessment, obtain official, current data from operators and responsible bodies.')
  };
})();
