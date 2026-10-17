const breathing = document.querySelector('.breathing');
if (breathing) {
  const tap = breathing.querySelector('.breathing-tap');
  const reset = breathing.querySelector('.breathing-reset');
  const phase = breathing.querySelector('.breathing-phase');
  const count = breathing.querySelector('.breathing-count');
  const action = breathing.querySelector('.breathing-action');
  let running = false;
  let elapsed = 0;
  let startedAt = 0;
  let frame = 0;

  function showFrame(total) {
    const cycle = (total % 10000) / 1000;
    const inhale = cycle < 4;
    const fraction = inhale ? cycle / 4 : (cycle - 4) / 6;
    const ease = (1 - Math.cos(Math.PI * fraction)) / 2;
    const expansion = inhale ? ease : 1 - ease;
    breathing.style.setProperty('--breath-scale', String(.7 + expansion * .3));
    breathing.style.setProperty('--breath-glow', String(.15 + expansion * .2));
    const label = inhale ? 'Breathe in' : 'Breathe out';
    // Announce each phase once; the visual countdown is kept out of live regions.
    if (phase.textContent !== label) phase.textContent = label;
    count.textContent = String(Math.max(1, Math.ceil(inhale ? 4 - cycle : 10 - cycle)));
  }

  function tick(now) {
    if (!running) return;
    showFrame(elapsed + now - startedAt);
    frame = requestAnimationFrame(tick);
  }

  function pause() {
    if (!running) return;
    elapsed += performance.now() - startedAt;
    running = false;
    cancelAnimationFrame(frame);
    breathing.dataset.state = 'paused';
    phase.textContent = 'Paused';
    action.textContent = 'Tap to continue';
    tap.setAttribute('aria-label', 'Continue breathing animation');
  }

  tap.addEventListener('click', () => {
    if (running) return pause();
    running = true;
    startedAt = performance.now();
    breathing.dataset.state = 'running';
    action.textContent = 'Tap to pause';
    tap.setAttribute('aria-label', 'Pause breathing animation');
    reset.disabled = false;
    showFrame(elapsed);
    frame = requestAnimationFrame(tick);
  });

  reset.addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(frame);
    elapsed = 0;
    breathing.dataset.state = 'ready';
    breathing.style.removeProperty('--breath-scale');
    breathing.style.removeProperty('--breath-glow');
    phase.textContent = 'Your moment';
    count.textContent = '4 in · 6 out';
    action.textContent = 'Tap to begin';
    tap.setAttribute('aria-label', 'Start breathing animation');
    reset.disabled = true;
    tap.focus();
  });

  // Returning to the page never starts an exercise without another tap.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
}
