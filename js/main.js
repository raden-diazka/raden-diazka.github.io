// ============================================
// main.js — Shared script semua halaman
// ============================================

// --- Hamburger menu ---
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// --- Active nav link ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// ============================================
// DARK / LIGHT MODE TOGGLE
// ============================================
const themeBtn  = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light');
  // Langsung set background hero-wrapper saat load
  document.addEventListener('DOMContentLoaded', () => {
    const heroWrapper = document.querySelector('.hero-wrapper');
    if (heroWrapper) heroWrapper.style.background = '#f4f6fb';
  });
}

function updateThemeIcon() {
  if (!themeBtn) return;
  themeBtn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
}

updateThemeIcon();

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();

    // Sinkronkan background hero-wrapper dengan mode aktif
    // karena canvas particle tidak otomatis ikut CSS variable
    const heroWrapper = document.querySelector('.hero-wrapper');
    if (heroWrapper) {
      heroWrapper.style.background = isLight ? '#f4f6fb' : '#0d1117';
    }
  });
}

// ============================================
// SCROLL REVEAL
// Semua elemen dengan class .reveal akan
// fade-in saat masuk viewport
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // animasi hanya sekali
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================
// CARD MOUSE GLOW
// Radial gradient mengikuti posisi kursor
// di dalam card
// ============================================
document.querySelectorAll('.card, .project-card, .platform-card, .cert-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});

// ============================================
// SKILL PROGRESS BAR ANIMATION (about.html)
// Dijalankan setelah bar masuk viewport
// ============================================
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill  = entry.target.querySelector('.skill-bar-fill');
      const target = fill?.dataset.width;
      if (fill && target) {
        setTimeout(() => { fill.style.width = target; }, 150);
      }
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-bar-wrap').forEach(el => barObserver.observe(el));
