/* Houminusite — Main app logic (index.html) */

const WA_NUMBER = '6282253507804';
const WA_BASE_TEXT = 'Halo, Saya ingin membeli jasa pembuatan website';

function waLink(extra){
  const text = extra ? `${WA_BASE_TEXT} — Paket ${extra}` : WA_BASE_TEXT;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* ------------------------------------------------------------- Session guard */

function requireSession(){
  const raw = localStorage.getItem('houmini_session');
  if(!raw){
    window.location.href = 'login.html';
    return null;
  }
  try{
    return JSON.parse(raw);
  }catch(e){
    window.location.href = 'login.html';
    return null;
  }
}

function initials(name){
  return name.trim().split(/\s+/).slice(0,2).map(p => p[0].toUpperCase()).join('');
}

/* Catatan: fungsi tema (applyTheme/initThemeToggle) kini ada di theme.js
   dan dimuat sebelum app.js pada index.html. */

/* ---------------------------------------------------------------- Sidebar nav */

function initSidebarNav(){
  const navItems = document.querySelectorAll('.nav-item[data-target]');
  const sections = document.querySelectorAll('.page-section');
  const pageTitle = document.getElementById('page-title');

  function activate(target){
    sections.forEach(s => s.classList.toggle('is-active', s.id === target));
    navItems.forEach(n => n.classList.toggle('is-active', n.dataset.target === target));
    const active = document.querySelector(`.nav-item[data-target="${target}"]`);
    if(pageTitle && active) pageTitle.textContent = active.dataset.label || active.textContent.trim();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    history.replaceState(null, '', `#${target}`);
    closeSidebarMobile();
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => activate(item.dataset.target));
  });

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => activate(el.dataset.goto));
  });

  const initial = window.location.hash.replace('#', '') || 'beranda';
  const validTargets = Array.from(sections).map(s => s.id);
  activate(validTargets.includes(initial) ? initial : 'beranda');
}

function closeSidebarMobile(){
  const sidebar = document.querySelector('.sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  if(sidebar) sidebar.classList.remove('is-open');
  if(scrim) scrim.classList.remove('is-open');
}

function initMobileSidebar(){
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  if(!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.add('is-open');
    if(scrim) scrim.classList.add('is-open');
  });
  if(scrim) scrim.addEventListener('click', closeSidebarMobile);
}

/* ------------------------------------------------------------------- Toast */

function showToast(message){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

/* ------------------------------------------------------------------ Purchase */

function initPurchaseButtons(){
  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(`Membuka WhatsApp untuk Paket ${btn.dataset.buy}…`);
      window.open(waLink(btn.dataset.buy), '_blank', 'noopener');
    });
  });

  const generalBtn = document.getElementById('wa-general');
  if(generalBtn){
    generalBtn.addEventListener('click', () => {
      const selectedChip = document.querySelector('.chip.is-selected');
      const pkg = selectedChip ? selectedChip.dataset.chip : null;
      window.open(waLink(pkg), '_blank', 'noopener');
    });
  }
}

function initChips(){
  const chips = document.querySelectorAll('.chip');
  const formLink = document.getElementById('link-to-order-form');

  function syncFormLink(pkg){
    if(!formLink) return;
    const normalized = pkg.toLowerCase().startsWith('custom') ? 'Custom' : pkg;
    formLink.href = `pesanan/pesanan.html?paket=${encodeURIComponent(normalized)}`;
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      syncFormLink(chip.dataset.chip);
    });
  });

  const preSelected = document.querySelector('.chip.is-selected');
  if(preSelected) syncFormLink(preSelected.dataset.chip);
}

/* ------------------------------------------------------------------- Logout */

function initLogout(){
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.removeItem('houmini_session');
      window.location.href = 'login.html';
    });
  });
}

/* --------------------------------------------------------------------- Init */

document.addEventListener('DOMContentLoaded', () => {
  const session = requireSession();
  if(!session) return;

  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
  document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = initials(session.name));

  initSidebarNav();
  initMobileSidebar();
  initPurchaseButtons();
  initChips();
  initLogout();
});
