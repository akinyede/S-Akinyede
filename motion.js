/* Progressive enhancements for the Samuel Akinyede portfolio. No dependencies. */
'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const root = document.documentElement;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Optional preference only. */ } };
  let manualReduce = read('sa-motion-reduced') === 'true';
  let reduced = media.matches || manualReduce;
  const stopActions = new Set();
  const tools = document.createElement('div'); tools.className = 'header-tools';
  const motionButton = document.createElement('button'); motionButton.className = 'motion-toggle';
  motionButton.id = 'motion-toggle'; motionButton.type = 'button';
  tools.append(motionButton, $('.menu-toggle')); $('.header-inner').append(tools);
  function applyMotion() {
    reduced = media.matches || manualReduce;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    motionButton.setAttribute('aria-pressed', String(reduced));
    motionButton.textContent = media.matches ? 'Motion reduced' : 'Reduce motion';
    motionButton.disabled = media.matches;
    motionButton.title = media.matches ? 'Following your device’s reduced-motion preference.' : 'Turn off decorative motion. All interactions remain available.';
    if (reduced) { stopActions.forEach(stop => stop()); document.getAnimations().forEach(animation => animation.cancel()); }
    document.dispatchEvent(new CustomEvent('sa-motionchange', { detail: { reduced } }));
  }
  motionButton.addEventListener('click', () => { manualReduce = !manualReduce; write('sa-motion-reduced', String(manualReduce)); applyMotion(); });
  media.addEventListener('change', applyMotion); applyMotion();
  function smallEntrance(node) {
    if (reduced || !node || typeof node.animate !== 'function') return;
    node.animate([{ opacity: .4, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
  }

  // Conceptual signal lab: the numbers below are drawing parameters, not model measurements.
  const lab = $('.lab');
  const controls = document.createElement('div'); controls.className = 'lab-controls';
  controls.innerHTML = `<div class="control-heading"><label for="signal-noise">Signal noise</label><output for="signal-noise" id="noise-value">20 / 100</output></div>
    <input class="noise-control" id="signal-noise" type="range" min="0" max="100" step="1" value="20" aria-describedby="signal-hint">
    <div class="lab-control-row"><label for="signal-context">Context<select class="lab-select" id="signal-context"><option value="familiar">Familiar</option><option value="shifted">Unfamiliar</option></select></label><label for="signal-view">Signal view<select class="lab-select" id="signal-view"><option value="raw">Raw input</option><option value="stabilized">Smoothed input</option></select></label></div>
    <div class="lab-transport"><button class="mini-button" id="signal-play" type="button">▶ Play signal</button><span class="lab-legend" id="signal-legend">Solid: raw input</span></div><p class="signal-hint" id="signal-hint">Move the slider. Notice what changes before a prediction is made.</p>`;
  $('.condition-control').replaceWith(controls);
  $('.lab-caption span:last-child').textContent = 'Change the conditions ↓';
  $('.lab-disclaimer').textContent = 'Synthetic illustration, not CrossSense inference, measured performance, or a safety decision. Noise uses arbitrary drawing units.';
  const signal = $('#signal-line'), secondary = $('.signal-secondary'), dot = $('#signal-dot');
  const noise = $('#signal-noise'), context = $('#signal-context'), view = $('#signal-view');
  const play = $('#signal-play');
  let signalFrame = 0, signalPlaying = false, phase = 0, playStart = 0, previous = 0;
  function rawValues() {
    return Array.from({ length: 121 }, (_, i) => {
      const x = i / 120;
      const baseline = 135 + 21 * Math.sin(x * 21 + phase);
      const jitter = (Number(noise.value) / 100) * (25 * Math.sin(x * 137 + phase * 2) + 15 * Math.sin(x * 223 - phase));
      const shift = context.value === 'shifted' ? 86 / (1 + Math.exp(-(x - .56) * 18)) : 0;
      return Math.max(35, Math.min(217, baseline + jitter - shift));
    });
  }
  function drawSignal() {
    const raw = rawValues();
    const smooth = raw.map((_, i) => { const block = raw.slice(Math.max(0, i - 4), Math.min(raw.length, i + 5)); return block.reduce((a, b) => a + b, 0) / block.length; });
    const selected = view.value === 'raw' ? raw : smooth;
    const path = values => values.map((y, i) => `${i ? 'L' : 'M'}${(30 + i * 380 / 120).toFixed(2)} ${y.toFixed(2)}`).join(' ');
    signal.setAttribute('d', path(selected)); secondary.setAttribute('d', path(raw));
    secondary.style.opacity = view.value === 'raw' ? '0' : '.48';
    dot.setAttribute('cy', selected[selected.length - 1].toFixed(2));
  }
  function updateSignal() {
    signal.classList.remove('intro-trace'); signal.style.strokeDasharray = '';
    $('#noise-value').textContent = noise.value + ' / 100';
    const unfamiliar = context.value === 'shifted', noisy = Number(noise.value) >= 50;
    $('#quality-label').textContent = unfamiliar ? 'Unfamiliar context' : noisy ? 'Noisy input' : 'Familiar conditions';
    $('#lab-caption').textContent = unfamiliar ? 'Context changes the question' : noisy ? 'Signal quality needs attention' : 'Read the input in context';
    $('#result-value').textContent = unfamiliar ? 'Reassess before relying' : noisy ? 'Check the signal first' : 'Proceed with context';
    $('#result-icon').textContent = unfamiliar ? '↻' : noisy ? '≈' : '↗';
    $('#signal-legend').textContent = view.value === 'raw' ? 'Solid: raw input' : 'Solid: smoothed · dashed: raw';
    $('#signal-hint').textContent = unfamiliar ? 'Smoothing can reduce fluctuations. It does not resolve an unfamiliar context.' : view.value === 'stabilized' ? 'A simple moving average smooths this drawing. Smoother does not automatically mean more trustworthy.' : noisy ? 'The input is less stable. Signal quality needs a closer look.' : 'Move the slider. Notice what changes before a prediction is made.';
    $('#signal-desc').textContent = `Synthetic ${view.value === 'raw' ? 'raw' : 'smoothed'} signal with noise ${noise.value} out of 100 drawing units, in ${unfamiliar ? 'unfamiliar' : 'familiar'} context. Not measured data.`;
    drawSignal();
  }
  function stopSignal() { signalPlaying = false; cancelAnimationFrame(signalFrame); play.textContent = '▶ Play signal'; play.setAttribute('aria-pressed', 'false'); }
  function runSignal(time) {
    if (!signalPlaying) return;
    if (reduced || document.hidden || time - playStart > 8000) { stopSignal(); return; }
    const dt = previous ? Math.min(time - previous, 50) : 0; previous = time; phase += dt * .001;
    drawSignal(); signalFrame = requestAnimationFrame(runSignal);
  }
  play.addEventListener('click', () => {
    if (signalPlaying) { stopSignal(); return; }
    if (reduced) { phase += .7; drawSignal(); $('#signal-hint').textContent = 'Signal advanced one frame. Continuous playback is off while motion is reduced.'; return; }
    signal.classList.remove('intro-trace'); signal.style.strokeDasharray = '';
    signalPlaying = true; previous = 0; playStart = performance.now(); play.textContent = 'Ⅱ Pause signal'; play.setAttribute('aria-pressed', 'true'); signalFrame = requestAnimationFrame(runSignal);
  });
  noise.addEventListener('input', updateSignal); context.addEventListener('change', updateSignal); view.addEventListener('change', updateSignal);
  stopActions.add(stopSignal); updateSignal();
  if (!reduced) { const length = signal.getTotalLength(); signal.style.setProperty('--path-length', String(length)); signal.style.strokeDasharray = String(length); signal.classList.add('intro-trace'); signal.addEventListener('animationend', () => { signal.style.strokeDasharray = ''; signal.classList.remove('intro-trace'); }, { once: true }); }

  // A plain-English walkthrough, not an executable risk policy.
  const stages = [
    ['Quality estimation', 'How usable is the input?', 'Look at signal variability before treating a radio reading as useful evidence.', 'Look at image conditions before relying on a detector.'],
    ['Context inference', 'What setting produced it?', 'Consider the recording conditions around a proximity reading.', 'Consider whether the image resembles the conditions used for evaluation.'],
    ['Signal stabilization', 'What can be made more stable?', 'Reduce fluctuations through the domain-specific filtering pipeline.', 'Evaluate preprocessing carefully rather than assuming enhancement will help.'],
    ['Task inference', 'What does the model predict?', 'Use the processed input for the proximity task.', 'Use a detector to locate and classify fruit.'],
    ['Uncertainty calibration', 'How should confidence be interpreted?', 'Check how confidence relates to observed performance on calibration data.', 'Check confidence against evaluated detection behavior.'],
    ['Risk-limiting policy', 'When should the system ask for another look?', 'Use an explicit, evaluated policy for proceeding or escalating.', 'Use an explicit, evaluated policy instead of treating every prediction alike.']
  ];
  const framework = $('.framework');
  $('.framework-label', framework).insertAdjacentHTML('afterend', `<div class="domain-picker" role="group" aria-label="Choose a framework example"><button type="button" data-domain="radio" aria-pressed="true">Proximity sensing</button><button type="button" data-domain="vision" aria-pressed="false">Edge vision</button></div>`);
  const cells = $$('.pipeline-cell', framework).map((old, i) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'pipeline-cell'; button.innerHTML = old.innerHTML; button.dataset.step = String(i); button.setAttribute('aria-controls', 'framework-detail'); old.replaceWith(button); return button; });
  $('.pipeline', framework).setAttribute('role', 'group'); $('.pipeline', framework).setAttribute('aria-label', 'Explore the six framework elements');
  $('.pipeline', framework).insertAdjacentHTML('afterend', `<div class="framework-detail" id="framework-detail" aria-live="polite" aria-atomic="true"><span class="mono" id="step-question"></span><p id="step-explanation"></p></div><div class="framework-transport"><button class="mini-button" type="button" id="framework-play">▶ Walk through</button><button class="mini-button" type="button" id="framework-next">Next step →</button></div>`);
  $('.framework-note').innerHTML = 'Conceptual walkthrough. Shared evaluation logic; domain-specific models, thresholds, and calibration.';
  let stage = 0, domain = 'radio', tourTimer = 0, touring = false;
  const tourButton = $('#framework-play');
  function stopTour() { clearTimeout(tourTimer); touring = false; tourButton.textContent = '▶ Walk through'; tourButton.setAttribute('aria-pressed', 'false'); cells.forEach(cell => cell.classList.remove('running')); }
  function showStage(index) {
    stage = index;
    cells.forEach((cell, i) => { cell.setAttribute('aria-pressed', String(i === stage)); cell.classList.toggle('running', touring && i === stage && !reduced); });
    $('#step-question').textContent = `${String(stage + 1).padStart(2, '0')} / ${stages[stage][1]}`;
    $('#step-explanation').textContent = stages[stage][domain === 'radio' ? 2 : 3];
    smallEntrance($('#framework-detail'));
  }
  function advanceTour() { if (stage >= 5 || document.hidden || reduced) { stopTour(); return; } showStage(stage + 1); tourTimer = setTimeout(advanceTour, 4500); }
  tourButton.addEventListener('click', () => {
    if (touring) { stopTour(); return; }
    if (reduced) { showStage((stage + 1) % 6); return; }
    touring = true; tourButton.textContent = 'Ⅱ Pause walkthrough'; tourButton.setAttribute('aria-pressed', 'true'); showStage(0); tourTimer = setTimeout(advanceTour, 4500);
  });
  $('#framework-next').addEventListener('click', () => { stopTour(); showStage((stage + 1) % 6); });
  cells.forEach((cell, i) => cell.addEventListener('click', () => { stopTour(); showStage(i); }));
  $$('[data-domain]').forEach(button => button.addEventListener('click', () => { stopTour(); domain = button.dataset.domain; $$('[data-domain]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); showStage(stage); }));
  stopActions.add(stopTour); showStage(0);

  // Project-specific illustrations. Each playback is finite and can be stopped.
  const projects = $$('.project');
  const radioArt = $('.project-art', projects[0]);
  const radioSvg = $('svg', radioArt);
  $$('g:first-of-type > circle', radioSvg).slice(0, 3).forEach(circle => circle.classList.add('ble-pulse'));
  $$(':scope > rect, :scope > path', radioSvg).forEach(el => { if (el.getAttribute('x') === '264' || (el.getAttribute('d') || '').startsWith('M268')) el.classList.add('ble-blocker'); });
  $$('g:first-of-type > path', radioSvg).slice(1).forEach(path => path.classList.add('ble-wave'));
  radioArt.classList.add('ble-obstructed');
  radioArt.insertAdjacentHTML('afterend', `<div class="project-controls"><div class="controls-line"><button class="mini-button" id="radio-play" type="button">▶ Play illustration</button><button class="project-mode" id="radio-obstruction" type="button" aria-pressed="true">Obstruction on</button></div><p id="radio-note" aria-live="polite">Conceptual illustration: an obstruction changes the conditions around a reading.</p></div>`);
  let radioTimer = 0, radioPlaying = false;
  function stopRadio() { radioPlaying = false; clearTimeout(radioTimer); radioArt.classList.remove('ble-running'); $('#radio-play').textContent = '▶ Play illustration'; }
  $('#radio-play').addEventListener('click', () => {
    if (radioPlaying) { stopRadio(); return; }
    if (reduced) { radioArt.classList.toggle('ble-static'); $('#radio-note').textContent = 'Static signal rings shown. This is an illustration, not a radio-propagation simulation.'; return; }
    radioPlaying = true; radioArt.classList.add('ble-running'); $('#radio-play').textContent = 'Ⅱ Stop illustration'; radioTimer = setTimeout(stopRadio, 4500);
  });
  $('#radio-obstruction').addEventListener('click', event => { const button = event.currentTarget; const on = button.getAttribute('aria-pressed') !== 'true'; button.setAttribute('aria-pressed', String(on)); button.textContent = on ? 'Obstruction on' : 'Obstruction off'; radioArt.classList.toggle('ble-clear', !on); radioArt.classList.toggle('ble-obstructed', on); $('#radio-note').textContent = on ? 'Conceptual illustration: an obstruction changes the conditions around a reading.' : 'Removing the obstruction changes the drawing. It does not guarantee an accurate distance estimate.'; });
  stopActions.add(stopRadio);
  const visionArt = $('.project-art', projects[1]);
  const visionSvg = $('svg', visionArt);
  $$('g[fill="none"] rect', visionSvg).forEach(box => { box.classList.add('vision-box'); const n = box.getTotalLength(); box.style.setProperty('--path-length', String(n)); });
  $('g[fill="#c1cfb3"]', visionSvg)?.classList.add('fruit-group');
  $('rect[x="391"]', visionSvg)?.classList.add('edge-chip');
  visionArt.insertAdjacentHTML('afterend', `<div class="project-controls"><div class="controls-line" role="group" aria-label="Explore the edge vision illustration"><button class="project-mode" type="button" data-vision="quality" aria-pressed="false">Image conditions</button><button class="project-mode" type="button" data-vision="transfer" aria-pressed="false">Transfer</button><button class="project-mode" type="button" data-vision="edge" aria-pressed="false">Device limits</button></div><p id="vision-note" aria-live="polite">Select a question to explore the illustration. These are not detection results.</p></div>`);
  let visionTimer = 0;
  function stopVision() { clearTimeout(visionTimer); visionArt.classList.remove('vision-scan'); }
  $$('[data-vision]').forEach(button => button.addEventListener('click', () => {
    stopVision(); visionArt.classList.remove('vision-quality', 'vision-transfer', 'vision-edge'); visionArt.classList.add('vision-' + button.dataset.vision);
    $$('[data-vision]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('#vision-note').textContent = ({ quality: 'Which image conditions change detector behavior? Faded shapes illustrate the question, not measured degradation.', transfer: 'Would the same detector work in a new domain? Dashed boxes mark an open question, not successful transfer.', edge: 'What changes on the target device? The model must also be evaluated for execution time and resource use.' })[button.dataset.vision];
    if (!reduced) { void visionArt.offsetWidth; visionArt.classList.add('vision-scan'); visionTimer = setTimeout(stopVision, 1400); }
  }));
  stopActions.add(stopVision);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopActions.forEach(stop => stop()); });
  if ('IntersectionObserver' in window) {
    const pauseObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) { if (entry.target === lab) stopSignal(); if (entry.target === framework) stopTour(); if (entry.target === radioArt) stopRadio(); if (entry.target === visionArt) stopVision(); } }));
    [lab, framework, radioArt, visionArt].forEach(node => pauseObserver.observe(node));
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { if (!reduced) entry.target.classList.add('motion-arrive'); reveals.unobserve(entry.target); } }), { threshold: .08 });
    $$('.section-heading, .project, .approach-card, .about-quote, .contact').forEach(node => reveals.observe(node));
  }

  // Keep the reader in place; show progress without an announcement on every scroll.
  const reader = $('#reader'), readerTop = $('.reader-top');
  const progress = document.createElement('div'); progress.className = 'reader-progress'; progress.setAttribute('aria-hidden', 'true'); readerTop.append(progress);
  function readerProgress() { const max = reader.scrollHeight - reader.clientHeight; const fraction = max > 0 ? Math.max(0, Math.min(1, reader.scrollTop / max)) : 1; progress.style.transform = `scaleX(${fraction})`; }
  reader.addEventListener('scroll', readerProgress, { passive: true });
  new MutationObserver(() => { if (reader.open) { readerProgress(); stopActions.forEach(stop => stop()); } }).observe(reader, { attributes: true, attributeFilter: ['open'] });
  window.addEventListener('resize', readerProgress, { passive: true });
  // All game code is independent; a failure there does not block the research portfolio.
  const gameScript = document.createElement('script'); gameScript.src = new URL('signal-sense.js?v=20260927-1', document.currentScript.src).href; document.head.append(gameScript);
})();
