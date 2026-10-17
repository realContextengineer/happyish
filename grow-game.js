(() => {
 const game = document.querySelector('.grow-game');
 if (!game) return;
 const tap = game.querySelector('.grow-tap'), plant = game.querySelector('.grow-plant'), flower = game.querySelector('.grow-flower'), bar = game.querySelector('progress'), status = game.querySelector('.grow-status'), label = game.querySelector('.grow-label'), reset = game.querySelector('.grow-reset');
 const timer = game.querySelector('.grow-timer');
 let growth = 0, started = false, won = false, ended = false, deadline = 0, last = performance.now(), lastTap = 0;
 function draw() { bar.value = growth; plant.style.transform = `scale(${growth / 100})`; flower.style.opacity = won ? '1' : '0'; }
 tap.addEventListener('click', () => {
  if (ended) return;
  if (!started) deadline = performance.now() + 10000;
  started = true; lastTap = performance.now(); growth = Math.min(100, growth + 5);
  label.textContent = 'Tap as quick as you can! ↟';
  if (growth >= 100) { won = true; ended = true; status.textContent = 'You made it bloom!'; label.textContent = 'In full bloom ✳'; reset.hidden = false; }
  else if (growth === 5) status.textContent = 'Tap fast to beat the shrinking!';
  draw();
 });
 reset.addEventListener('click', () => { growth = 0; started = false; won = false; ended = false; timer.textContent = '10.0s'; reset.textContent = 'Try again ↻'; reset.hidden = true; status.textContent = 'Can you make it bloom?'; label.textContent = 'Tap as quick as you can! ↟'; draw(); tap.focus(); });
 function tick(now) { const delta = Math.min((now-last)/1000, .1); last = now;
  if (started && !ended) {
   const remaining = Math.max(0, (deadline-now)/1000); timer.textContent = remaining.toFixed(1) + 's';
   if (remaining === 0) { ended = true; status.textContent = 'Time’s up! Have another go?'; label.textContent = 'Round finished'; reset.textContent = 'Try again ↻'; reset.hidden = false; }
  }
  if (started && !ended && !document.hidden && now-lastTap > 120) { growth = Math.max(0, growth - delta * 24); draw(); }
  requestAnimationFrame(tick);
 }
 draw(); requestAnimationFrame(tick);
})();
