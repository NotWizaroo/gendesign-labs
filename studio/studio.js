// Студия: навигация по скетчам (manifest.json), просмотр в iframe, галерея, панель параметров.

import { Pane } from './vendor/tweakpane.min.js';

(async function () {
  const $ = (s, el = document) => el.querySelector(s);
  const frame = $('#frame');
  const galleryEl = $('#gallery');
  const toast = $('#toast');
  const notice = $('#notice');
  const app = $('#app');

  // ---------- манифест ----------
  const manifest = await (await fetch('manifest.json', { cache: 'no-store' })).json();
  // Все листинги из PDF выносим в отдельный раздел: он один на сайдбар и каталог.
  const pdf = { lab1: [], lab2: [] };
  manifest.labs.forEach((lab) => {
    lab.tasks.forEach((task) => {
      task.items = task.items.filter((it) => {
        if (it.source !== 'методичка') return true;
        (pdf[lab.id] || (pdf[lab.id] = [])).push(it);
        return false;
      });
    });
    lab.tasks = lab.tasks.filter((t) => t.items.length);
  });
  manifest.labs.unshift({ id: 'pdf', title: 'Из методичек (PDF)', tasks: [
    { id: 'lab1', title: 'Лаба 1 · листинги 1–14', items: pdf.lab1 },
    { id: 'lab2', title: 'Лаба 2 · листинги и фрагменты', items: pdf.lab2 },
  ].filter((t) => t.items.length) });

  const items = [];
  const byId = {};
  manifest.labs.forEach((lab) => lab.tasks.forEach((task) => task.items.forEach((it) => {
    Object.assign(it, { lab, task });
    items.push(it);
    byId[it.id] = it;
  })));

  // ---------- мелочи ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* без хранилища тоже живём */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* то же */ } },
  };
  const runnerUrl = (it, opts = {}) => {
    const u = new URLSearchParams({ src: it.src, kind: it.kind || 'sketch' });
    if (it.maxScale) u.set('max', it.maxScale);
    if (opts.thumb) u.set('thumb', '1');
    if (opts.p) u.set('p', opts.p);
    return 'runner.html?' + u;
  };
  const showError = (msg) => { toast.textContent = msg; toast.hidden = false; };

  // ---------- подсветка кода ----------
  function highlight(code) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(function|let|const|var|if|else|for|while|return|new|class|true|false|null|undefined|of|in|break|continue|switch|case|default|this)\b|\b(\d+\.?\d*)\b|\b([A-Za-z_$][\w$]*)(?=\()/g;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const cls = m[1] ? 'cm' : m[2] ? 'str' : m[3] ? 'kw' : m[4] ? 'num' : 'fn';
      out += `<span class="${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  // ---------- дерево слева ----------
  const tree = $('#tree');
  const search = $('#search');

  // Свёрнутые лабы запоминаем между запусками.
  let collapsedLabs = new Set(['pdf']);   // раздел из PDF по умолчанию свёрнут
  try {
    const raw = store.get('gd:ui:labs2');
    if (raw !== null) collapsedLabs = new Set(JSON.parse(raw));
  } catch (e) { /* остаёмся с умолчанием */ }
  const saveLabs = () => store.set('gd:ui:labs2', JSON.stringify([...collapsedLabs]));

  function renderTree() {
    const q = search.value.trim().toLowerCase();
    const match = (it) => !q || [it.title, it.desc, it.task.title, it.lab.title, ...(it.tags || [])]
      .join(' ').toLowerCase().includes(q);

    let html = '';
    manifest.labs.forEach((lab) => {
      let labHtml = '';
      lab.tasks.forEach((task) => {
        const shown = task.items.filter(match);
        if (!shown.length) return;
        labHtml += `<div class="task"><h3><span>${esc(task.title)}</span>` +
          `<a href="#/gallery/${lab.id}/${task.id}" title="Плиткой">галерея</a></h3>` +
          shown.map((it) => `<button class="item${state.id === it.id ? ' on' : ''}" data-id="${it.id}">` +
            `<span class="t">${esc(it.title)}</span>` +
            (it.original ? '<span class="ds-badge">сдано</span>' : '') +
            (it.sliders ? '<span class="ds-badge ds-badge-warm" title="Есть ползунки">⚙</span>' : '') +
            '</button>').join('') + '</div>';
      });
      if (labHtml) {
        const closed = !q && collapsedLabs.has(lab.id);   // при поиске показываем всё
        html += `<section class="lab${closed ? ' closed' : ''}">` +
          `<h2 data-lab="${lab.id}" role="button" tabindex="0" aria-expanded="${!closed}"><span class="chev"></span>${esc(lab.title)}</h2>` +
          `${labHtml}</section>`;
      }
    });
    tree.innerHTML = html || '<p class="nores">Ничего не найдено</p>';
  }

  function toggleLab(h) {
    const id = h.dataset.lab;
    if (collapsedLabs.has(id)) collapsedLabs.delete(id); else collapsedLabs.add(id);
    saveLabs();
    renderTree();
  }
  tree.addEventListener('click', (e) => {
    const h = e.target.closest('h2[data-lab]');
    if (h) return toggleLab(h);
    const b = e.target.closest('.item');
    if (b) location.hash = '#/' + b.dataset.id;
  });
  tree.addEventListener('keydown', (e) => {
    const h = e.target.closest('h2[data-lab]');
    if (h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleLab(h); }
  });
  search.addEventListener('input', renderTree);

  // ---------- состояние и роутер ----------
  const state = { id: null, mode: 'gallery', scope: {} };
  let lastGallery = '#/gallery';   // куда возвращает «← Каталог»

  function parseHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length || parts[0] === 'gallery') {
      return { mode: 'gallery', scope: { lab: parts[1], task: parts[2] } };
    }
    if (byId[parts[0]]) return { mode: 'view', id: parts[0] };
    return { mode: 'gallery', scope: {} };
  }

  function route() {
    const r = parseHash();
    state.mode = r.mode;
    state.id = r.id || null;
    state.scope = r.scope || {};
    app.classList.remove('menu-open');
    app.classList.toggle('is-gallery', r.mode === 'gallery');
    app.classList.toggle('is-view', r.mode === 'view');
    if (r.mode === 'gallery') lastGallery = location.hash || '#/gallery';
    if (r.mode === 'view' && collapsedLabs.delete(byId[r.id].lab.id)) saveLabs();   // открыли работу из свёрнутой лабы — раскрываем
    toast.hidden = true;
    if (r.mode === 'view') showView(byId[r.id]); else showGallery(state.scope);
    renderTree();
    updateActions();
  }
  window.addEventListener('hashchange', route);

  function updateActions() {
    const view = state.mode === 'view';
    $('#actions').hidden = !view;      // в каталоге кнопки действий ничего не делают — не показываем
    $('#btn-back').hidden = !view;
    const idx = view ? items.indexOf(byId[state.id]) : -1;
    $('#btn-prev').disabled = !view || idx <= 0;
    $('#btn-next').disabled = !view || idx >= items.length - 1;
  }

  function step(dir) {
    const idx = items.indexOf(byId[state.id]);
    const next = items[idx + dir];
    if (next) location.hash = '#/' + next.id;
  }
  $('#btn-prev').onclick = () => step(-1);
  $('#btn-next').onclick = () => step(1);

  // ---------- просмотр одного скетча ----------
  let pane = null;
  let currentSpec = null;
  let currentValues = {};

  function savedKey(id) { return 'gd:p:' + id; }

  // Если скетчу нужны файлы данных (шрифт, видео…), а их нет, показываем подсказку вместо пустого холста.
  async function missingFiles(it) {
    if (!it.needs) return [];
    const dir = it.src.replace(/[^/]*$/, '');
    const res = await Promise.all(it.needs.map((n) =>
      fetch('../' + dir + n, { method: 'HEAD', cache: 'no-store' }).then((r) => (r.ok ? null : n), () => n)));
    return res.filter(Boolean);
  }

  function launch(it) {
    const saved = store.get(savedKey(it.id));
    notice.hidden = true;
    frame.hidden = false;
    frame.src = runnerUrl(it, { p: saved || '' });
    frame.addEventListener('load', () => frame.contentWindow.focus(), { once: true });
  }

  function showView(it) {
    stopGallery();
    galleryEl.hidden = true;
    destroyPane();
    $('#params-empty').hidden = false;
    $('#params-actions').hidden = true;

    if (it.needs) {
      frame.src = 'about:blank';
      missingFiles(it).then((missing) => {
        if (state.id !== it.id) return;
        if (!missing.length) return launch(it);
        const dir = it.src.replace(/[^/]*$/, '');
        frame.hidden = true;
        notice.hidden = false;
        notice.innerHTML = '<h2>Не хватает файлов</h2>' +
          `<p>Скетч дословно из методички, но данные в PDF не приложены. Положи в <code>${esc(dir)}data/</code>:</p>` +
          `<ul>${missing.map((n) => `<li>${esc(n.replace(/^data\//, ''))}</li>`).join('')}</ul>` +
          '<p>Потом нажми «Перезапуск». Код листинга — во вкладке «Код».</p>';
      });
    } else {
      launch(it);
    }

    $('#crumbs').innerHTML = `<a href="#/gallery/${it.lab.id}">${esc(it.lab.title)}</a><i>/</i>` +
      `<a href="#/gallery/${it.lab.id}/${it.task.id}">${esc(it.task.title)}</a><i>/</i><b>${esc(it.title)}</b>`;
    document.title = it.title + ' — Генеративный дизайн';
    activateTab('info');               // если ползунки появятся — переключимся на них в buildPane
    renderInfo(it);
    loadCode(it);
  }

  function renderInfo(it) {
    $('#tab-info').innerHTML =
      `<h2>${esc(it.title)}</h2>` +
      (it.tags && it.tags.length ? `<div class="tags">${it.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : '') +
      (it.desc ? `<p>${esc(it.desc)}</p>` : '') +
      (it.hint ? `<p class="hint">${esc(it.hint)}</p>` : '') +
      `<p class="file">${esc(it.src)}</p>` +
      (it.ref && it.ref.length
        ? '<h3 class="refh">Как выглядит в методичке</h3>' +
          it.ref.map((r) => `<a href="${esc(r)}" target="_blank" rel="noopener"><img class="ref" src="${esc(r)}" alt="Рисунок из методички"></a>`).join('')
        : '');
  }

  let codeToken = 0;
  async function loadCode(it) {
    const token = ++codeToken;
    $('#code-file').textContent = it.src;
    $('#code').textContent = 'Загрузка…';
    try {
      const text = await (await fetch('../' + it.src, { cache: 'no-store' })).text();
      if (token !== codeToken) return;
      $('#code').dataset.raw = text;
      $('#code').innerHTML = highlight(text);
    } catch (e) {
      $('#code').textContent = 'Не удалось загрузить файл.';
    }
  }

  // ---------- параметры (Tweakpane) ----------
  function destroyPane() {
    if (pane) { pane.dispose(); pane = null; }
    $('#params').innerHTML = '';
    currentSpec = null;
    currentValues = {};
  }

  function post(msg) {
    if (frame.contentWindow) frame.contentWindow.postMessage({ studio: true, ...msg }, '*');
  }

  function buildPane(spec) {
    destroyPane();
    currentSpec = spec;
    pane = new Pane({ container: $('#params') });
    activateTab('params');
    const hasValues = Object.values(spec).some((o) => typeof o.button !== 'string');
    $('#params-empty').hidden = true;
    $('#params-actions').hidden = !hasValues;

    for (const [key, o] of Object.entries(spec)) {
      if (typeof o.button === 'string') {
        pane.addButton({ title: o.button }).on('click', () => post({ type: 'button', key }));
        continue;
      }
      currentValues[key] = o.value;
      const opts = { label: o.label || key };
      if (o.options) {
        opts.options = o.options;
      } else if (typeof o.value === 'number') {
        if (o.min !== undefined) opts.min = o.min;
        if (o.max !== undefined) opts.max = o.max;
        if (o.step !== undefined) opts.step = o.step;
      } else if (typeof o.value === 'string' && /^#[0-9a-f]{3,8}$/i.test(o.value)) {
        opts.view = 'color';
      }
      pane.addBinding(currentValues, key, opts).on('change', (ev) => {
        post({ type: 'set', key, value: ev.value });
        store.set(savedKey(state.id), JSON.stringify(currentValues));
      });
    }
  }

  $('#btn-reset').onclick = () => { store.del(savedKey(state.id)); showView(byId[state.id]); };
  $('#btn-copy-params').onclick = () => navigator.clipboard.writeText(JSON.stringify(currentValues, null, 2));
  $('#btn-copy-code').onclick = () => navigator.clipboard.writeText($('#code').dataset.raw || '');

  // ---------- сообщения от раннера ----------
  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || !m.studio) return;
    if (e.source === frame.contentWindow && state.mode === 'view') {
      if (m.type === 'params') buildPane(m.spec);
      else if (m.type === 'error') showError(m.message);
      else if (m.type === 'nav') step(m.dir);
      else if (m.type === 'escape') leavePresent();
      return;
    }
    const card = thumbs.get(e.source);
    if (card && m.type === 'ready') card.onReady();
  });

  // ---------- галерея ----------
  const thumbs = new Map();   // contentWindow -> карточка
  let observer = null;

  // Превью запускаются по одному с паузой: десяток p5 разом на старте вешал страницу.
  const mountQueue = [];
  let draining = false;
  function drain() {
    const card = mountQueue.shift();
    if (!card) { draining = false; return; }
    draining = true;
    if (card.isConnected) mountThumb(card);
    setTimeout(drain, 220);
  }
  function queueMount(card) {
    if (!mountQueue.includes(card)) mountQueue.push(card);
    if (!draining) drain();
  }
  function dequeue(card) {
    const i = mountQueue.indexOf(card);
    if (i >= 0) mountQueue.splice(i, 1);
  }

  function stopGallery() {
    mountQueue.length = 0;
    if (observer) { observer.disconnect(); observer = null; }
    thumbs.clear();
    galleryEl.innerHTML = '';
  }

  function showGallery(scope) {
    stopGallery();
    destroyPane();
    frame.src = 'about:blank';
    frame.hidden = true;
    galleryEl.hidden = false;
    galleryEl.scrollTop = 0;

    const lab = manifest.labs.find((l) => l.id === scope.lab);
    const task = lab && lab.tasks.find((t) => t.id === scope.task);
    const labs = lab ? [lab] : manifest.labs;

    const heading = task ? task.title : lab ? lab.title : 'Каталог';
    const total = labs.reduce((n, l) => n + l.tasks.reduce((k, t) => k + (task && t !== task ? 0 : t.items.length), 0), 0);
    document.title = heading + ' — Генеративный дизайн';
    $('#crumbs').innerHTML = (lab ? '<a href="#/gallery">Каталог</a><i>/</i>' : '') +
      (task ? `<a href="#/gallery/${lab.id}">${esc(lab.title)}</a><i>/</i>` : '') +
      `<b>${esc(heading)}</b><i>·</i>${total} скетчей`;
    $('#tab-info').innerHTML = '<p class="dim">Выбери скетч — здесь появится описание.</p>';
    $('#code').textContent = '';
    $('#code-file').textContent = '';

    let html = `<h1>${esc(heading)}</h1><p class="lead">Живые превью. Наведи мышь — скетч оживёт, клик — открыть с ползунками и кодом.</p>`;
    labs.forEach((l) => l.tasks.forEach((t) => {
      if (task && t !== task) return;
      html += `<h2>${esc(l.title)} · ${esc(t.title)}` +
        (task ? '' : `<a href="#/gallery/${l.id}/${t.id}">только это</a>`) + '</h2><div class="grid">';
      html += t.items.map((it) =>
        `<article class="card" data-id="${it.id}">` +
        `<div class="thumb"><button class="hit" aria-label="Открыть: ${esc(it.title)}"></button></div>` +
        `<div class="meta"><h3>${esc(it.title)}</h3><p>${it.original ? 'сдано · ' : ''}${esc((it.tags || []).slice(0, 3).join(' · '))}</p></div>` +
        '</article>').join('') + '</div>';
    }));
    galleryEl.innerHTML = html;

    // iframe создаём, только пока карточка видна: иначе 20 p5 разом положат вкладку.
    observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const card = en.target;
        if (en.isIntersecting) queueMount(card); else { dequeue(card); unmountThumb(card); }
      });
    }, { root: galleryEl, rootMargin: '120px' });
    galleryEl.querySelectorAll('.card').forEach((c) => observer.observe(c));
  }

  galleryEl.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card && e.target.closest('.hit')) location.hash = '#/' + card.dataset.id;
  });

  function mountThumb(card) {
    if (card.querySelector('iframe') || card.querySelector('.thumb-note')) return;
    const it = byId[card.dataset.id];
    if (it.needs) {
      card.querySelector('.thumb').insertAdjacentHTML('afterbegin', '<div class="thumb-note">нужны файлы данных</div>');
      return;
    }
    const f = document.createElement('iframe');
    f.title = it.title;
    f.src = runnerUrl(it, { thumb: true });
    card.querySelector('.thumb').prepend(f);

    let hover = false;
    let timer = null;
    const entry = {
      onReady() {
        // Даём скетчу поработать пару секунд, потом ставим на паузу до наведения мыши.
        clearTimeout(timer);
        timer = setTimeout(() => { if (!hover) pauseThumb(f); }, 700);
      },
    };
    card._hover = (on) => { hover = on; if (on) playThumb(f); else entry.onReady(); };
    card._entry = entry;
    f.addEventListener('load', () => thumbs.set(f.contentWindow, entry));
  }

  function unmountThumb(card) {
    const f = card.querySelector('iframe');
    if (!f) return;
    if (f.contentWindow) thumbs.delete(f.contentWindow);
    f.remove();
  }

  const pauseThumb = (f) => f.contentWindow && f.contentWindow.postMessage({ studio: true, type: 'pause' }, '*');
  const playThumb = (f) => f.contentWindow && f.contentWindow.postMessage({ studio: true, type: 'play' }, '*');

  galleryEl.addEventListener('pointerover', (e) => {
    const card = e.target.closest('.card');
    if (card && card._hover && !card.contains(e.relatedTarget)) card._hover(true);
  });
  galleryEl.addEventListener('pointerout', (e) => {
    const card = e.target.closest('.card');
    if (card && card._hover && !card.contains(e.relatedTarget)) card._hover(false);
  });

  // ---------- кнопки шапки ----------
  const mobile = () => window.matchMedia('(max-width: 860px)').matches;
  const ui = (k) => store.get('gd:ui:' + k) !== '0';        // true — панель показана

  function applyUi() {
    app.classList.toggle('side-collapsed', !ui('side'));
    app.classList.toggle('panel-collapsed', !ui('panel'));
    $('#btn-side').setAttribute('aria-pressed', String(ui('side')));
    $('#btn-panel').setAttribute('aria-pressed', String(ui('panel')));
  }
  $('#btn-side').onclick = () => {
    if (mobile()) return app.classList.toggle('menu-open');
    store.set('gd:ui:side', ui('side') ? '0' : '1');
    applyUi();
  };
  $('#btn-panel').onclick = () => { store.set('gd:ui:panel', ui('panel') ? '0' : '1'); applyUi(); };
  $('#btn-back').onclick = () => { location.hash = lastGallery; };

  $('#btn-restart').onclick = () => showView(byId[state.id]);
  $('#btn-png').onclick = () => post({ type: 'save', name: state.id });
  $('#btn-full').onclick = () => $('#stage').requestFullscreen && $('#stage').requestFullscreen();

  // Меню «⋯»: редкие действия.
  const menu = $('#menu');
  $('#btn-more').onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  document.addEventListener('click', () => { menu.hidden = true; });
  window.addEventListener('blur', () => { menu.hidden = true; });   // клик внутри iframe
  $('#menu-open').onclick = () => window.open(runnerUrl(byId[state.id], { p: store.get(savedKey(state.id)) || '' }), '_blank');
  $('#menu-gallery').onclick = () => {
    const it = byId[state.id];
    if (it) location.hash = `#/gallery/${it.lab.id}/${it.task.id}`;
  };

  // ---------- режим показа ----------
  function leavePresent() { app.classList.remove('present'); $('#btn-present').textContent = 'Режим показа'; }
  $('#btn-present').onclick = () => {
    const on = app.classList.toggle('present');
    $('#btn-present').textContent = on ? 'Вернуть панели' : 'Режим показа';
  };
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') leavePresent();
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state.mode === 'view') step(e.key === 'ArrowLeft' ? -1 : 1);
  });

  // ---------- вкладки правой панели ----------
  function activateTab(name) {
    document.querySelectorAll('.ds-tab').forEach((x) => x.classList.toggle('on', x.dataset.tab === name));
    document.querySelectorAll('.tab-body').forEach((b) => b.classList.toggle('on', b.id === 'tab-' + name));
  }
  document.querySelectorAll('.ds-tab').forEach((t) => t.addEventListener('click', () => activateTab(t.dataset.tab)));

  applyUi();
  route();
})();
