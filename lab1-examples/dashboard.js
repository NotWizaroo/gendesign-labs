// Собирает карточки дашборда из window.EXAMPLES (каждый файл examples/*.js
// добавляет туда один объект) и запускает по одному p5-инстансу на карточку.

function highlightCode(code) {
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  escaped = escaped.replace(/\/\/.*$/gm, (m) => `<span class="cm">${m}</span>`);
  escaped = escaped.replace(
    /\b(function|let|const|var|if|else|for|while|return|new|class)\b/g,
    '<span class="kw">$1</span>'
  );
  escaped = escaped.replace(
    /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    '<span class="fn">$1</span>('
  );
  escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="num">$1</span>');
  return escaped;
}

window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('grid');

  window.EXAMPLES.forEach((ex) => {
    const card = document.createElement('div');
    card.className = 'card';

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'card-canvas';
    card.appendChild(canvasWrap);

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = `
      <h2>${ex.title}</h2>
      ${ex.hint ? `<p class="hint">${ex.hint}</p>` : ''}
      <p class="desc">${ex.desc}</p>
      <p class="filename">examples/${ex.file}</p>
      <pre class="code"><code>${highlightCode(ex.keyCode.trim())}</code></pre>
    `;
    card.appendChild(body);

    grid.appendChild(card);

    // eslint-disable-next-line no-new
    new p5(ex.sketch, canvasWrap);
  });
});
