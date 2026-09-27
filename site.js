'use strict';
(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); menu.textContent = open ? 'Close' : 'Menu'; });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.header-inner')) closeMenu(); });

  // A teaching illustration, not model inference, research measurements, or a risk policy.
  const states = {
    familiar: { value:'Proceed with context', icon:'↗', quality:'Familiar conditions', caption:'Within the illustrated envelope', path:'M30 147 C48 139 49 173 67 154 S96 95 113 121 S141 177 159 144 S194 110 212 131 S244 162 262 135 S295 105 315 135 S348 169 364 137 S393 115 410 128' },
    noisy: { value:'Check the signal first', icon:'≈', quality:'Noisy input', caption:'Signal quality needs attention', path:'M30 155 L44 108 L55 174 L68 122 L81 159 L94 87 L108 145 L120 128 L132 180 L145 95 L158 150 L170 117 L183 156 L195 103 L207 134 L221 191 L232 130 L245 87 L260 148 L271 111 L283 164 L296 125 L310 78 L325 149 L338 119 L350 176 L364 130 L376 95 L389 153 L400 114 L410 137' },
    shifted: { value:'Reassess before relying', icon:'↻', quality:'Unfamiliar context', caption:'Outside the illustrated envelope', path:'M30 148 C47 139 56 159 74 139 S110 111 131 130 S164 154 184 117 S216 61 237 78 S268 109 287 70 S320 44 343 65 S377 104 410 50' }
  };
  document.querySelectorAll('[data-condition]').forEach(button => button.addEventListener('click', () => {
    const state = states[button.dataset.condition];
    if (!state) return;
    document.querySelectorAll('[data-condition]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#signal-line').setAttribute('d', state.path);
    document.querySelector('#result-value').textContent = state.value;
    document.querySelector('#result-icon').textContent = state.icon;
    document.querySelector('#quality-label').textContent = state.quality;
    document.querySelector('#lab-caption').textContent = state.caption;
    document.querySelector('#signal-dot').setAttribute('cy', button.dataset.condition === 'shifted' ? '50' : button.dataset.condition === 'noisy' ? '137' : '128');
  }));

  const reader = document.querySelector('#reader');
  const content = document.querySelector('#reader-content');
  let returnFocus = null;
  let originHash = '#work';
  let activeArticle = null;
  const articleId = () => location.hash.startsWith('#read-') ? location.hash.slice(6) : null;
  const validArticle = id => id && document.getElementById('article-' + id);
  function openArticle(id, trigger) {
    const template = validArticle(id);
    if (!template) return;
    if (trigger) returnFocus = trigger;
    content.replaceChildren(template.content.cloneNode(true));
    const heading = content.querySelector('h2');
    if (heading) { heading.id = 'reader-heading'; reader.setAttribute('aria-labelledby', 'reader-heading'); }
    activeArticle = id;
    if (!reader.open) reader.showModal();
    document.body.classList.add('locked');
    reader.scrollTop = 0;
    content.focus({ preventScroll: true });
  }
  function closeArticle() {
    if (reader.open) reader.close();
    document.body.classList.remove('locked');
    activeArticle = null;
    if (articleId()) history.replaceState(null, '', originHash || location.href.split('#')[0]);
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }
  document.querySelectorAll('a[data-article]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.dataset.article;
    if (!validArticle(id)) return;
    event.preventDefault();
    originHash = articleId() ? '#work' : location.hash;
    history.pushState(null, '', '#read-' + id);
    openArticle(id, link);
  }));
  document.querySelector('#reader-close').addEventListener('click', closeArticle);
  reader.addEventListener('cancel', event => { event.preventDefault(); closeArticle(); });
  reader.addEventListener('click', event => { if (event.target !== reader) return; const r = reader.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeArticle(); });
  window.addEventListener('popstate', () => { const id = articleId(); if (validArticle(id)) openArticle(id); else if (activeArticle) { if (reader.open) reader.close(); document.body.classList.remove('locked'); activeArticle = null; } });
  if (validArticle(articleId())) openArticle(articleId());
})();
