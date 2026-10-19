// ============================================
// particles.js — Animated particle background
// Dipanggil hanya di index.html (hero section)
// ============================================

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  // --- Config (boleh diubah) ---
  const CONFIG = {
    count:        120,    // Jumlah partikel
    speedMax:     0.35,   // Kecepatan maksimal
    radiusMax:    2.2,    // Ukuran titik maksimal
    lineDistance: 130,    // Jarak maksimal untuk garis antar partikel
    dotColor:     '99, 160, 255',   // RGB warna titik
    lineColor:    '59, 130, 246',   // RGB warna garis
  };

  // Baca warna background dari CSS variable --bg secara dinamis
  // Otomatis ikut dark/light mode
  function getBgColor() {
    return getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#0d1117';
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x:  randBetween(0, W),
      y:  randBetween(0, H),
      vx: randBetween(-CONFIG.speedMax, CONFIG.speedMax),
      vy: randBetween(-CONFIG.speedMax, CONFIG.speedMax),
      r:  randBetween(0.8, CONFIG.radiusMax),
      o:  randBetween(0.4, 0.9),
    };
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) particles.push(createParticle());
  }

  function draw() {
    ctx.fillStyle = getBgColor();
    ctx.fillRect(0, 0, W, H);

    // Gambar garis antar partikel yang berdekatan
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.lineDistance) {
          const alpha = (1 - dist / CONFIG.lineDistance) * 0.35;
          ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Gambar titik partikel
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.dotColor}, ${p.o})`;
      ctx.fill();

      // Gerakkan partikel
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around (muncul dari sisi lain kalau keluar layar)
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    animId = requestAnimationFrame(draw);
  }

  // Mouse interaction — partikel terdekat mendekat ke kursor
  let mouse = { x: -999, y: -999 };
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  // Start
  resize();
  init();
  draw();

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    init();
    draw();
  });
})();
