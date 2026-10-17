const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
for (const tile of document.querySelectorAll('.help-stripes > section')) {
  const wobble = () => {
    if (reducedMotion.matches) return;
    tile.classList.remove('help-wobble');
    void tile.offsetWidth;
    tile.classList.add('help-wobble');
  };
  tile.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') wobble();
  });
  tile.addEventListener('focusin', event => {
    if (!tile.contains(event.relatedTarget)) wobble();
  });
  tile.querySelector('.help-pullout')?.addEventListener('toggle', event => {
    if (event.target.open) wobble();
  });
  tile.addEventListener('animationend', event => {
    if (event.target === tile && event.animationName === 'help-tile-wobble') {
      tile.classList.remove('help-wobble');
    }
  });
}
