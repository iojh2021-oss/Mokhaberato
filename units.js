/* units.js — bilingual content for every clickable unit in the city.
 * Specs are standards-level figures (ITU-T / 3GPP / IEEE / DVB). Equipment lists are industry examples.
 * To add a unit: add an entry here, a builder in city.js, and an animation in anim.js. */
(function () {
  'use strict';
  const b = (fa, en) => ({ fa: fa, en: en });
  const sp = (kfa, ken, vfa, ven) => ({ k: b(kfa, ken), v: b(vfa, ven === undefined ? vfa : ven) });

  window.UNITS = [
    {
      id: 'user', preset: 'wifi',
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
      id: 'cabinet', preset: null,
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
      anim: b('یک فیبر ورودی، چند خانه؛ پایین‌سو آبی، بالاسو نارنجی', 'One feeder fiber, many homes; downstream teal, upstream orange')
    },
    {
      id: 'exchange', preset: null,
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
      anim: b('خطوط مشترکین ← OLT ← آپ‌لینک؛ برق اضطراری در پایین', 'Subscriber lines → OLT → uplink; backup power below')
    },
    {
      id: 'fiber', preset: null,
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
      anim: b('بازتاب کلی داخلی و ترکیب طول‌موج‌ها (WDM)', 'Total internal reflection and wavelength multiplexing (WDM)')
    },
    {
      id: 'datacenter', preset: null,
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
      id: 'ixp', preset: null,
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
      id: 'satellite', preset: 'sat',
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
      id: 'broadcast', preset: 'fm',
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
      id: 'cell', preset: 'g5',
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
      id: 'microwave', preset: 'mw',
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
})();
