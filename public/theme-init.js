// Apply saved theme before first paint (no white flash in dark mode).
// Kept as a file, not inline, so the Content-Security-Policy can block all inline scripts.
(function () {
  try {
    var t = localStorage.getItem('theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
