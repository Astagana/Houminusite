/* Houminusite — Theme toggle (dipakai di semua halaman) */

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('houmini_theme', theme);
}

function initThemeToggle(){
  const saved = localStorage.getItem('houmini_theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);

  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.setAttribute('aria-pressed', saved === 'dark');
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      btn.setAttribute('aria-pressed', next === 'dark');
    });
  });
}

document.addEventListener('DOMContentLoaded', initThemeToggle);
