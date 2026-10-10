// Раннер запускает один скетч внутри iframe студии.
//
// Параметры в адресе:
//   src   — путь к скетчу от корня generative-design/ (например, task2/sketch.js)
//   kind  — sketch (обычный p5 в глобальном режиме) | instance (EXAMPLES из lab1-examples)
//   thumb — превью для галереи: без отступов
//   max   — максимальный масштаб (по умолчанию 1: только уменьшаем, не мылим)
//   p     — JSON с сохранёнными значениями ползунков
//
// Для скетчей раннер даёт две глобальные функции:
//   params({...}) — объявить ползунки, вернуть живой объект со значениями
//   asset('x.jpg') — путь к файлу из generative-design/assets/

(function () {
  const q = new URLSearchParams(location.search);
  const src = q.get('src');
  const kind = q.get('kind') || 'sketch';
  const thumb = q.has('thumb');
  const maxScale = parseFloat(q.get('max')) || 1;

  const root = new URL('../', location.href);
  const srcUrl = new URL(src, root);

  // <base> нужен, чтобы относительные пути оригинальных скетчей (data/sobor.jpg)
  // работали так же, как рядом с их index.html.
  const base = document.createElement('base');
  base.href = new URL('./', srcUrl).href;
  document.head.prepend(base);

  let saved = {};
  try { saved = JSON.parse(q.get('p') || '{}'); } catch (e) { /* пустые значения */ }

  const send = (msg) => { if (parent !== window) parent.postMessage({ studio: true, ...msg }, '*'); };

  // ---------- ползунки ----------
  const values = {};
  const buttons = {};

  window.asset = (name) => new URL('assets/' + name, root).href;

  window.params = function (schema) {
    const spec = {};
    for (const [key, def] of Object.entries(schema)) {
      const o = (def !== null && typeof def === 'object') ? { ...def } : { value: def };
      if (typeof o.button === 'string') {
        buttons[key] = o.fn;
        delete o.fn;
      } else if (key in saved) {
        o.value = saved[key];
      }
      if (!('button' in o)) values[key] = o.value;
      spec[key] = o;
    }
    send({ type: 'params', spec });
    return values;
  };

  // ---------- gd: минимальная замена библиотеки Generative Design ----------
  // Листинги из методички вызывают gd.timestamp(), gd.sortColors(), gd.ase.encode()
  // и writeFile(). Настоящая библиотека в проекте не нужна — хватает этих функций.
  window.gd = {
    HUE: 'hue', SATURATION: 'saturation', BRIGHTNESS: 'brightness', GRAYSCALE: 'grayscale',

    timestamp() {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
    },

    // Сортирует массив цветов на месте; без режима оставляет как есть.
    sortColors(colors, mode) {
      if (!mode) return colors;
      const key = {
        hue: (c) => window.hue(c),
        saturation: (c) => window.saturation(c),
        brightness: (c) => window.brightness(c),
        grayscale: (c) => 0.299 * window.red(c) + 0.587 * window.green(c) + 0.114 * window.blue(c),
      }[mode];
      return colors.sort((a, b) => key(a) - key(b));
    },

    // Палитра Adobe Swatch Exchange (.ase) из массива p5.Color.
    ase: {
      encode(colors) {
        const blocks = colors.map((c, i) => {
          const name = 'color ' + (i + 1);
          const buf = new ArrayBuffer(2 + 4 + 2 + (name.length + 1) * 2 + 4 + 12 + 2);
          const v = new DataView(buf);
          let o = 0;
          v.setUint16(o, 0x0001); o += 2;                       // тип блока: цвет
          v.setUint32(o, buf.byteLength - 6); o += 4;           // длина без заголовка блока
          v.setUint16(o, name.length + 1); o += 2;
          for (const ch of name) { v.setUint16(o, ch.charCodeAt(0)); o += 2; }
          v.setUint16(o, 0); o += 2;
          for (const ch of 'RGB ') { v.setUint8(o++, ch.charCodeAt(0)); }
          for (let k = 0; k < 3; k++) { v.setFloat32(o, c.levels[k] / 255); o += 4; }
          v.setUint16(o, 2);                                    // обычный цвет
          return new Uint8Array(buf);
        });
        const head = new ArrayBuffer(12);
        const hv = new DataView(head);
        for (const [i, ch] of [...'ASEF'].entries()) hv.setUint8(i, ch.charCodeAt(0));
        hv.setUint16(4, 1); hv.setUint16(6, 0); hv.setUint32(8, blocks.length);
        return new Blob([new Uint8Array(head), ...blocks]);
      },
    },
  };

  window.writeFile = function (parts, name, ext) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(parts));
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  // ---------- вывод print()/console.log прямо на экран ----------
  // Часть листингов (лаба 2, листинги 1–3) ничего не рисует, а только печатает.
  const logLines = [];
  let logEl = null;
  ['log', 'info', 'warn'].forEach((m) => {
    const orig = console[m].bind(console);
    console[m] = (...args) => {
      orig(...args);
      if (thumb) return;
      logLines.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
      if (logLines.length > 14) logLines.shift();
      if (!logEl && document.body) {
        logEl = document.createElement('pre');
        logEl.style.cssText = 'position:fixed;left:10px;bottom:10px;max-width:70%;margin:0;padding:8px 10px;' +
          'border-radius:6px;background:rgba(0,0,0,.72);color:#9ece6a;font:12px/1.4 ui-monospace,Menlo,monospace;pointer-events:none';
        document.body.appendChild(logEl);
      }
      if (logEl) logEl.textContent = logLines.join('\n');
    };
  });

  // pointer() — позиция мыши в координатах холста. Пока мышь не двигали
  // (превью в галерее, режим показа), отдаёт плавный «автопилот»,
  // чтобы скетч выглядел живым и без курсора.
  let mouseMoved = false;
  window.addEventListener('mousemove', () => { mouseMoved = true; }, { once: true });
  window.pointer = function () {
    if (mouseMoved) return { x: window.mouseX, y: window.mouseY, auto: false };
    const t = window.millis() / 1000;
    return {
      x: window.width * (0.5 + 0.38 * Math.sin(t * 0.7) * Math.cos(t * 0.23)),
      y: window.height * (0.5 + 0.34 * Math.sin(t * 0.53 + 1.3)),
      auto: true,
    };
  };

  // ---------- p5 ----------
  let inst = null;                 // экземпляр p5 в режиме instance
  const api = () => inst || window; // где искать noLoop / redraw / isLooping

  function repaint() {
    const a = api();
    if (a.isLooping && !a.isLooping() && a.redraw) a.redraw();
  }

  let pausedByStudio = false;

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || !m.studio) return;
    const a = api();
    switch (m.type) {
      case 'set':
        values[m.key] = m.value;
        if (typeof window.onParam === 'function') window.onParam(m.key, m.value);
        repaint();
        break;
      case 'button':
        if (buttons[m.key]) { buttons[m.key](); repaint(); }
        break;
      case 'pause':
        if (a.isLooping && a.isLooping()) { a.noLoop(); pausedByStudio = true; }
        break;
      case 'play':
        if (pausedByStudio) { a.loop(); pausedByStudio = false; }
        break;
      case 'save':
        saveCanvasPng(m.name || 'sketch');
        break;
    }
  });

  function saveCanvasPng(name) {
    const c = document.querySelector('canvas');
    if (!c) return;
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name + '.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  }

  // ---------- вписывание холста в окно ----------
  // Меняем только CSS-размер: p5 считает мышь по scrollWidth/width,
  // так что координаты остаются верными при любом масштабе.
  function fit() {
    const c = document.querySelector('canvas');
    if (!c) return;
    const pd = (api().pixelDensity ? api().pixelDensity() : 1) || 1;
    const lw = c.width / pd;
    const lh = c.height / pd;
    if (!lw || !lh) return;
    const pad = thumb ? 0 : 16;
    const aw = window.innerWidth - pad * 2;
    const ah = window.innerHeight - pad * 2;
    // Холст размером с окно (createCanvas(windowWidth, windowHeight)) не трогаем.
    const fillsWindow = Math.abs(lw - window.innerWidth) <= 2 && Math.abs(lh - window.innerHeight) <= 2;
    const k = fillsWindow ? 1 : Math.min(aw / lw, ah / lh, maxScale);
    c.style.setProperty('width', Math.floor(lw * k) + 'px', 'important');
    c.style.setProperty('height', Math.floor(lh * k) + 'px', 'important');
  }

  let readySent = false;
  setInterval(() => {
    fit();
    if (!readySent && document.querySelector('canvas')) {
      readySent = true;
      if (thumb && typeof api().frameRate === 'function') api().frameRate(20);   // превью не должны грузить процессор
      send({ type: 'ready' });
    }
  }, 250);
  window.addEventListener('resize', fit);

  // ---------- ошибки и горячие клавиши ----------
  window.addEventListener('error', (e) => send({ type: 'error', message: e.message }));
  window.addEventListener('unhandledrejection', (e) => send({ type: 'error', message: String(e.reason) }));
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      send({ type: 'nav', dir: e.key === 'ArrowLeft' ? -1 : 1 });
    }
    if (e.key === 'Escape') send({ type: 'escape' });
  });

  // ---------- загрузка скриптов ----------
  // Вставляем все теги синхронно и с async=false: выполняются по порядку,
  // а событие load (по которому p5 стартует) ждёт их всех.
  function addScript(url) {
    const s = document.createElement('script');
    s.src = url;
    s.async = false;
    s.onerror = () => send({ type: 'error', message: 'Не загрузился ' + url });
    document.head.appendChild(s);
  }

  addScript(new URL('libs/p5.min.js', root).href);
  addScript(srcUrl.href);

  if (kind === 'instance') {
    window.addEventListener('load', () => {
      const ex = (window.EXAMPLES || [])[0];
      if (!ex) return send({ type: 'error', message: 'В файле нет EXAMPLES' });
      inst = new p5(ex.sketch, document.body);
    });
  }
})();
