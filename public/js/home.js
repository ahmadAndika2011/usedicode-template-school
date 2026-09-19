/* ============================================================
   SMA NUSANTARA — main.js
   Loads header/footer partials, then wires up all interactions.
   NOTE: fetch() of local files only works when the site is served
   over http(s) (e.g. `python3 -m http.server`), not opened directly
   as a file:// URL, due to browser CORS restrictions.
   ============================================================ */

async function loadPartial(url, targetId) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    document.getElementById(targetId).innerHTML = await res.text();
  } catch (err) {
    console.error(`Gagal memuat ${url}. Jalankan situs lewat local server (contoh: python3 -m http.server) agar fetch() berfungsi.`, err);
  }
}

async function init() {
  await Promise.all([
    loadPartial('partials/header.html', 'header-placeholder'),
    loadPartial('partials/footer.html', 'footer-placeholder'),
  ]);

  initHeaderScroll();
  initNavToggle();
  initParallax();
  initScrollReveal();
  initCounters();
  initFab();
  initAiModal();
  initYear();
}

/* ---------- Header shrink on scroll ---------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ---------- Hero parallax ---------- */
/* ---------- Hero parallax (lebih terasa) ---------- */
function initParallax() {
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const layers = [
    { el: document.querySelector('.hero-layer-sky'),  speed: 0.25 },
    { el: document.querySelector('.hero-layer-far'),  speed: 0.5  },
    { el: document.querySelector('.hero-layer-mid'),  speed: 0.8  },
    { el: document.querySelector('.hero-layer-near'), speed: 1.15 },
  ].filter(l => l.el);

  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  function update() {
    const heroHeight = hero.offsetHeight;
    const y = Math.min(window.scrollY, heroHeight); // clamp supaya tidak lanjut bergerak setelah hero terlewati

    // lapisan latar bergerak naik dengan kecepatan berbeda-beda (efek kedalaman)
    layers.forEach(l => {
      l.el.style.transform = `translate3d(0, ${-y * l.speed * 0.4}px, 0)`;
    });

    // judul & tombol bergerak lebih cepat ke atas sambil memudar
    if (heroContent) {
      const progress = Math.min(y / (heroHeight * 0.8), 1);
      heroContent.style.transform = `translate3d(0, ${-y * 0.55}px, 0)`;
      heroContent.style.opacity = String(1 - progress);
    }

    ticking = false;
  }

  update();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // Bonus: parallax mengikuti gerakan mouse selama hero masih terlihat
  hero.addEventListener('mousemove', (e) => {
    if (window.scrollY > hero.offsetHeight) return;
    const relX = (e.clientX / window.innerWidth - 0.5) * 2;  // -1..1
    const relY = (e.clientY / window.innerHeight - 0.5) * 2; // -1..1
    layers.forEach((l, i) => {
      const strength = (i + 1) * 6; // lapisan lebih dekat bergerak lebih jauh
      l.el.style.marginLeft = `${relX * strength}px`;
      l.el.style.marginTop = `${relY * strength * 0.5}px`;
    });
  });
}

/* ---------- Scroll reveal for sections ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const statsCard = document.querySelector('.stats-card');
  const numbers = document.querySelectorAll('.stat-number');
  if (!statsCard || !numbers.length) return;

  function animate() {
    numbers.forEach(num => {
      const target = parseInt(num.dataset.count, 10) || 0;
      const suffix = num.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        num.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  if (!('IntersectionObserver' in window)) { animate(); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(statsCard);
}

/* ---------- Floating action button ---------- */
function initFab() {
  const wrap = document.getElementById('fab-wrap');
  const button = document.getElementById('fab-button');
  if (!wrap || !button) return;

  function close() {
    wrap.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }

  button.addEventListener('click', () => {
    const isOpen = wrap.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  window.closeFab = close;
}

/* ---------- AI chat modal (front-end placeholder) ---------- */
function initAiModal() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#fab-ai');
    if (trigger) {
      e.preventDefault();
      document.getElementById('ai-modal').hidden = false;
      if (window.closeFab) window.closeFab();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'ai-modal-close' || e.target.id === 'ai-modal') {
      document.getElementById('ai-modal').hidden = true;
    }
  });

  const chatHistory = []

  const addMsg = (body, who,text) => {
    const el = document.createElement("div")
    el.className = `ai-msg ai-msg-${who}`;
    el.textContent = text;           // textContent = aman dari XSS
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'ai-modal-form') return;
    e.preventDefault();

    const input = document.getElementById('ai-modal-input');
    const body = document.getElementById('ai-modal-body');
    const text = input.value.trim();
    if (!text) return;

    addMsg(body, 'user', text);
    chatHistory.push({ role: 'user', content: text });
    input.value = '';
    input.disabled = true;

    const botEl = addMsg(body, 'bot', 'Mengetik…');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });
      if (!res.ok) throw new Error(res.status);
      const { reply } = await res.json();
      botEl.textContent = reply;
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      console.error(err);
      botEl.textContent = 'Maaf, sedang ada kendala. Silakan hubungi kami via WhatsApp.';
      chatHistory.pop(); // buang pesan user yang gagal agar riwayat tetap konsisten
    } finally {
      input.disabled = false;
      input.focus();
      body.scrollTop = body.scrollHeight;
    }
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);