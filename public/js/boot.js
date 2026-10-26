// Runs before first paint: enables motion styles and the first-visit preloader.
document.documentElement.classList.add('js');
try {
  if (!sessionStorage.getItem('shape-seen')) {
    document.documentElement.classList.add('first-visit');
    sessionStorage.setItem('shape-seen', '1');
  }
} catch (e) {}
