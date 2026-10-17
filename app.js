const toggle = document.querySelector('.theme-toggle');
function updateTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  toggle.innerHTML = (dark ? '☀' : '☾') + ' <span>' + (dark ? 'Light mode' : 'Dark mode') + '</span>';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#192329' : '#f7efdf';
}
toggle.addEventListener('click', () => {
  const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = value;
  try { localStorage.setItem('happyish-theme', value); } catch (error) {}
  updateTheme();
});
updateTheme();
const forgetTheme = document.querySelector('#forget-theme');
if (forgetTheme) {
  forgetTheme.addEventListener('click', () => {
    try { localStorage.removeItem('happyish-theme'); } catch (error) {}
    document.documentElement.dataset.theme = 'dark';
    updateTheme();
    const status = document.querySelector('#theme-status');
    if (status) status.textContent = 'Your saved appearance choice has been removed. The site is using its default dark appearance.';
  });
}
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
const fundingIndex = document.querySelector('.funding-index');
if (fundingIndex) {
  const desktopIndex = matchMedia('(min-width: 851px)');
  fundingIndex.open = desktopIndex.matches;
  desktopIndex.addEventListener('change', event => { fundingIndex.open = event.matches; });
}
