document.addEventListener('DOMContentLoaded', function () {
  const intro = document.getElementById('intro-overlay');
  if (!intro) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    intro.style.display = 'none';
    return;
  }

  const prevHtmlOverflow = document.documentElement.style.overflow;
  const prevBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  intro.addEventListener('animationend', function () {
    intro.style.display = 'none';
    document.documentElement.style.overflow = prevHtmlOverflow || '';
    document.body.style.overflow = prevBodyOverflow || '';
  }, { once: true });

  setTimeout(function () {
    if (intro && intro.style.display !== 'none') {
      intro.style.display = 'none';
      document.documentElement.style.overflow = prevHtmlOverflow || '';
      document.body.style.overflow = prevBodyOverflow || '';
    }
  }, 500);
});

